import SwiftUI
import shared
import AVFoundation
import Speech
import Vision

@MainActor
final class mdmrStore: ObservableObject {
    let sharedApp: SharedApp
    private var store: Store { sharedApp.store }

    // Published state — refreshed after every mutation
    @Published var currentUser: shared.User? = nil
    @Published var transactions: [shared.Transaction] = []
    @Published var piggyBanks: [shared.PiggyBank] = []
    @Published var planningGoals: [shared.PlanningGoal] = []
    @Published var fixedCosts: [shared.FixedCost] = []
    @Published var latestMood: shared.MoodEntry? = nil

    // Voice recording state
    @Published var isRecording = false
    @Published var voiceTranscript = ""
    @Published var voiceResult: (value: Double, category: shared.Category, description: String)? = nil
    @Published var voiceError: String? = nil
    @Published var showVoiceSheet = false

    // Receipt import state
    @Published var showReceiptSheet = false
    @Published var receiptImage: UIImage? = nil
    @Published var receiptValue: String = ""
    @Published var receiptDescription: String = ""
    @Published var receiptCategory: shared.Category? = nil
    @Published var receiptExcludeFromSavings = false
    @Published var receiptError: String? = nil

    // Derived: current month income/expense
    var monthlyIncome: Double {
        transactions.filter { store.sameMonthNow(ts: $0.timestampMs) && !$0.sleeping }
            .filter { $0.type == TxType.entrada }
            .reduce(0) { $0 + $1.value }
    }
    var monthlyExpense: Double {
        transactions.filter { store.sameMonthNow(ts: $0.timestampMs) && !$0.sleeping }
            .filter { $0.type == TxType.saida }
            .reduce(0) { $0 + $1.value }
    }

    init() {
        sharedApp = SharedApp()
        sharedApp.onRequestAudioCapture = { [weak self] in self?.startVoiceRecording() }
        sharedApp.onRequestPickFiles = { [weak self] in
            DispatchQueue.main.async { self?.showReceiptSheet = true }
        }
        refresh()
        currentUser = store.currentUser()
    }

    // MARK: - Auth
    func signup(name: String, email: String, password: String) -> shared.AuthResult {
        let r = store.signup(name: name, email: email, password: password)
        if r.success { refresh() }
        return r
    }
    func login(email: String, password: String) -> shared.AuthResult {
        let r = store.login(email: email, password: password)
        if r.success { refresh() }
        return r
    }
    func logout() {
        store.logout()
        refresh()
    }

    // MARK: - Mood
    func addMood(_ mood: shared.Mood) -> shared.MoodEntry {
        let e = store.addMood(mood: mood)
        refresh()
        return e
    }
    func isHomeHidden(_ id: String) -> Bool { store.isHomeHidden(id: id) }
    func hideHomeNotification(_ id: String) { store.hideHomeNotification(id: id) }
    func isExpenseHidden(_ id: String) -> Bool { store.isExpenseHidden(id: id) }
    func hideExpensesNotification(_ id: String) { store.hideExpensesNotification(id: id); refresh() }

    // MARK: - Transactions
    func addTransaction(
        value: Double, category: shared.Category, type: shared.TxType,
        paymentMethod: shared.PaymentMethod, description: String,
        excludeFromSavings: Bool = false
    ) {
        store.addTransaction(
            t: shared.Transaction(
                id: "", value: value, category: category, type: type,
                paymentMethod: paymentMethod, description: description,
                moodId: latestMood?.id ?? nil, mood: latestMood?.mood ?? nil,
                timestampMs: store.nowMs(), sleeping: false, sleepUntilMs: nil,
                excludeFromSavingsAdvice: excludeFromSavings
            )
        )
        refresh()
    }
    func deleteTransaction(_ id: String) { store.deleteTransaction(id: id); refresh() }
    func clearTransactions() { store.clearTransactions(); refresh() }

    // MARK: - Piggy Banks
    func addPiggy(name: String, saved: Double, target: Double) { store.addPiggy(name: name, saved: saved, target: target); refresh() }
    func depositPiggy(id: String, delta: Double) { store.depositPiggy(id: id, delta: delta); refresh() }
    func removePiggy(id: String) { store.removePiggy(id: id); refresh() }

    // MARK: - Planning Goals
    func addGoal(title: String, type: String, target: Double, months: Int) { store.addPlanning(title: title, type: type, target: target, months: Int32(months)); refresh() }
    func removeGoal(id: String) { store.removePlanning(id: id); refresh() }

    // MARK: - Fixed Costs
    func addFixed(name: String, amount: Double, dueDay: Int, category: String) { store.addFixed(name: name, amount: amount, dueDay: Int32(dueDay), category: category); refresh() }
    func removeFixed(id: String) { store.removeFixed(id: id); refresh() }
    func markFixedPaid(id: String) -> Bool { let ok = store.markFixedPaid(id: id); refresh(); return ok }

    // MARK: - Refresh
    func refresh() {
        currentUser = store.currentUser()
        transactions = store.transactions() as? [shared.Transaction] ?? []
        piggyBanks = store.piggyList() as? [PiggyBank] ?? []
        planningGoals = store.planningList() as? [PlanningGoal] ?? []
        fixedCosts = store.fixedList() as? [FixedCost] ?? []
        latestMood = store.latestMood()
    }

    // MARK: - Voice Recording (SFSpeechRecognizer)
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var audioEngine: AVAudioEngine?
    private var didFinishRecording = false

    func startVoiceRecording() {
        voiceError = nil
        voiceTranscript = ""
        voiceResult = nil
        didFinishRecording = false
        showVoiceSheet = true

        let sfs = SFSpeechRecognizer(locale: Locale(identifier: "pt-BR"))
        speechRecognizer = sfs

        guard sfs != nil else {
            voiceError = "Reconhecimento de voz não disponível no seu dispositivo."
            return
        }

        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                guard let self = self else { return }
                if status != .authorized {
                    self.voiceError = "Permissão de_microfone negada. Habilite nas configurações."
                    return
                }
                self.beginRecording()
            }
        }
    }

    private func beginRecording() {
        let engine = AVAudioEngine()
        audioEngine = engine

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.record, mode: .default, options: [])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            voiceError = "Não foi possível acessar o microfone."
            return
        }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        recognitionRequest = request

        let task = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self = self else { return }
                if let result = result {
                    self.voiceTranscript = result.bestTranscription.formattedString
                }
                if error != nil || (result?.isFinal ?? false) {
                    self.stopVoiceRecording()
                }
            }
        }
        recognitionTask = task

        let inputNode = engine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            request.append(buffer)
        }

        engine.prepare()
        do {
            try engine.start()
            isRecording = true
        } catch {
            voiceError = "Não foi possível iniciar a gravação."
        }
    }

    func stopVoiceRecording() {
        teardownAudio()
        finishRecording()
    }

    private func teardownAudio() {
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine?.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        audioEngine = nil
        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false
    }

    // Alcancavel tanto pelo botao "Parar" quanto pelo callback do reconhecimento,
    // que podem disparar os dois na mesma gravacao.
    private func finishRecording() {
        guard !didFinishRecording else { return }
        didFinishRecording = true

        let transcript = voiceTranscript
        guard !transcript.isEmpty else { return }

        if let tx = sharedApp.previewVoiceTranscript(text: transcript) {
            voiceResult = (value: tx.value, category: tx.category, description: tx.description)
        } else {
            voiceError = "Não entendi o valor. Fale, por exemplo: \"Gastei 25 reais de uber\"."
        }
    }

    func confirmVoiceTransaction() {
        if let r = voiceResult {
            addTransaction(value: r.value, category: r.category, type: .saida, paymentMethod: .contaCorrente, description: r.description, excludeFromSavings: false)
        }
        cancelVoiceRecording()
    }

    func cancelVoiceRecording() {
        teardownAudio()
        showVoiceSheet = false
        voiceTranscript = ""
        voiceResult = nil
        voiceError = nil
    }

    // MARK: - Receipt / PIX Import
    func processReceiptImage(_ image: UIImage) {
        receiptImage = image
        receiptError = nil
        receiptValue = ""
        receiptDescription = ""
        receiptCategory = nil
        receiptExcludeFromSavings = false
        showReceiptSheet = true

        let request = VNRecognizeTextRequest { [weak self] request, _ in
            let observations = request.results as? [VNRecognizedTextObservation] ?? []
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.parseReceiptText(observations: observations)
            }
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.recognitionLanguages = ["pt-BR", "pt-PT"]

        let handler = VNImageRequestHandler(cgImage: image.cgImage!)
        DispatchQueue.global(qos: .userInitiated).async {
            try? handler.perform([request])
        }
    }

    private func parseReceiptText(observations: [VNRecognizedTextObservation]) {
        let lines = observations.compactMap { $0.topCandidates(1).first?.string.lowercased() }

        // Filter out lines that contain identifiers we must ignore
        let junkKeywords = ["cpf", "cnpj", "chave", "agencia", "conta", "autentica", "nsu", "tid", "id da transação"]
        let cleanedLines = lines.filter { line in
            for kw in junkKeywords {
                if line.contains(kw) { return false }
            }
            return true
        }

        var candidateValues: [(value: Double, score: Int)] = []

        for line in cleanedLines {
            // Look for monetary values: R$ 20,00 / valor: 20,00 / total 20.00 / 20,00 (with decimals)
            // Pattern: digits followed by comma+2digits OR dot+2digits (decimals required to avoid CPF)
            let pattern = "([0-9]{1,3}(?:\\.[0-9]{3})*),([0-9]{2})|([0-9]+)\\.([0-9]{2})"
            guard let regex = try? NSRegularExpression(pattern: pattern) else { continue }
            let nsLine = line as NSString
            let matches = regex.matches(in: line, range: NSRange(location: 0, length: nsLine.length))

            var score = 0
            if line.contains("r$") || line.contains("valor") || line.contains("total") || line.contains("transferido") || line.contains("pix enviado") || line.contains("pago") {
                score += 10
            }
            // "linha digitavel"-style or other long digit strings tend to be 3+ digits without decimal — we'll only accept decimal matches

            for m in matches {
                let s = nsLine.substring(with: m.range)
                // Remove thousand separators, replace decimal comma with dot
                let normalized = s.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: ".")
                if let v = Double(normalized), v > 0 {
                    // Sanity: must look like a real currency amount (< 100000) and > 0
                    if v < 100000 {
                        candidateValues.append((value: v, score: score))
                    }
                }
            }
        }

        // Pick the best candidate: highest score, then largest value
        let best = candidateValues
            .sorted { (a, b) in
                if a.score != b.score { return a.score > b.score }
                return a.value > b.value
            }
            .first

        let descText = cleanedLines.joined(separator: " ")
        let cat = inferCategory(descText)

        if let best = best {
            receiptValue = String(format: "%.2f", best.value)
            receiptCategory = cat
            receiptDescription = cat.label
        } else {
            receiptError = "Não encontrei valores no comprovante. Informe manualmente."
        }
    }

    private func inferCategory(_ text: String) -> shared.Category {
        if text.contains("gasolina") || text.contains("etanol") || text.contains("diesel") || text.contains("combust") || text.contains("posto") { return .combustivel }
        if text.contains("uber") || text.contains("taxi") || text.contains("onibus") || text.contains("metro") { return .transporte }
        if text.contains("mercado") || text.contains("comida") || text.contains("almoco") || text.contains("janta") || text.contains("lanche") || text.contains("restaurante") { return .alimentacao }
        if text.contains("cinema") || text.contains("netflix") || text.contains("lazer") || text.contains("show") { return .lazer }
        if text.contains("farmacia") || text.contains("medico") || text.contains("saude") || text.contains("consulta") { return .saude }
        if text.contains("curso") || text.contains("faculdade") || text.contains("escola") || text.contains("educacao") { return .educacao }
        if text.contains("aluguel") || text.contains("condominio") || text.contains("energia") || text.contains("internet") { return .moradia }
        if text.contains("roupa") || text.contains("camisa") || text.contains("tenis") { return .vestuario }
        return .outros
    }

    func confirmReceipt() {
        let val = Double(receiptValue.replacingOccurrences(of: ",", with: "."))
        guard let v = val, v > 0 else {
            receiptError = "Valor inválido."
            return
        }
        let cat = receiptCategory ?? .outros
        let desc = receiptDescription.isEmpty ? cat.label : receiptDescription
        addTransaction(value: v, category: cat, type: .saida, paymentMethod: .contaCorrente, description: desc, excludeFromSavings: receiptExcludeFromSavings)
        cancelReceipt()
    }

    func cancelReceipt() {
        showReceiptSheet = false
        receiptImage = nil
        receiptValue = ""
        receiptDescription = ""
        receiptCategory = nil
        receiptExcludeFromSavings = false
        receiptError = nil
    }
}
