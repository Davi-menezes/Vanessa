import SwiftUI
import shared
import PhotosUI

struct HomeView: View {
    @ObservedObject var store: mdmrStore
    let onSwitchTab: (MainTab) -> Void
    @State private var showMoodPicker = false
    @State private var showPhotoPicker = false
    @State private var photoItem: PhotosPickerItem? = nil

    var userName: String { store.currentUser?.name ?? "Visitante" }
    var balance: Double { store.monthlyIncome - store.monthlyExpense }
    var recentItems: [shared.Transaction] {
        let all = store.transactions.filter { store.sharedApp.store.sameMonthNow(ts: $0.timestampMs) && !$0.sleeping }
        return Array(all.prefix(8))
    }
    var awakeItems: [shared.Transaction] {
        store.transactions.filter { $0.sleeping && ($0.sleepUntilMs?.int64Value ?? 0) <= store.sharedApp.store.nowMs() }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Text("Olá, \(userName)")
                        .font(.system(size: 24, weight: .light))
                        .foregroundColor(Color.white)
                    Spacer()
                    if let mood = store.latestMood?.mood {
                        Button(action: { showMoodPicker = true }) {
                            Text(moodIcon(mood))
                                .font(.system(size: 20))
                                .padding(8)
                                .background(cardElevatedBg())
                                .clipShape(Circle())
                        }
                    } else {
                        Button(action: { showMoodPicker = true }) {
                            Image(systemName: "face.smiling")
                                .font(.system(size: 18, weight: .light))
                                .foregroundColor(textSecondary())
                                .padding(8)
                                .background(cardElevatedBg())
                                .clipShape(Circle())
                        }
                    }
                    Button(action: { store.logout(); onSwitchTab(.home) }) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.system(size: 16, weight: .light))
                            .foregroundColor(dangerColor())
                    }
                }
                .padding(.top, 8)

                // Balance card
                VStack(spacing: 6) {
                    Text("Saldo do mês")
                        .font(.system(size: 13, weight: .light))
                        .foregroundColor(textSecondary())
                    Text(formatBrl(balance))
                        .font(.system(size: 36, weight: .thin))
                        .foregroundColor(balance >= 0 ? Color.white : dangerColor())
                    HStack(spacing: 32) {
                        VStack(spacing: 2) {
                            Text("Receitas")
                                .font(.system(size: 11, weight: .light)).foregroundColor(textSecondary())
                            Text(formatBrl(store.monthlyIncome))
                                .font(.system(size: 15, weight: .light)).foregroundColor(successColor())
                        }
                        VStack(spacing: 2) {
                            Text("Despesas")
                                .font(.system(size: 11, weight: .light)).foregroundColor(textSecondary())
                            Text(formatBrl(store.monthlyExpense))
                                .font(.system(size: 15, weight: .light)).foregroundColor(dangerColor())
                        }
                    }
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .background(cardElevatedBg())
                .cornerRadius(20)

                // Happiness note
                happinessNote()

                // Awake items
                if !awakeItems.isEmpty {
                    sectionHeader("Despertar")
                    ForEach(awakeItems, id: \.id) { tx in
                        txRow(tx)
                    }
                }

                // Diary
                sectionHeader("Diário")
                if recentItems.isEmpty {
                    Text("Sem transações ainda")
                        .font(.system(size: 14, weight: .light))
                        .foregroundColor(textSecondary())
                        .frame(maxWidth: .infinity)
                        .padding(32)
                } else {
                    ForEach(recentItems, id: \.id) { tx in
                        txRow(tx)
                    }
                }

                // Actions
                HStack(spacing: 12) {
                    Button(action: { onSwitchTab(.transactions) }) {
                        Text("+ Adicionar")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(Color.white)
                            .frame(maxWidth: .infinity, minHeight: 48)
                            .background(cardElevatedBg())
                            .cornerRadius(14)
                    }
                    Button(action: { store.sharedApp.requestAudioCapture() }) {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 16, weight: .light))
                            .foregroundColor(Color.white)
                            .frame(width: 56, height: 48)
                            .background(cardElevatedBg())
                            .cornerRadius(14)
                    }
                    Button(action: { showPhotoPicker = true }) {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 16, weight: .light))
                            .foregroundColor(Color.white)
                            .frame(width: 56, height: 48)
                            .background(cardElevatedBg())
                            .cornerRadius(14)
                    }
                }

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 24)
        }
        .background(appBg())
        .sheet(isPresented: $showMoodPicker) {
            MoodPickerView(store: store, onDone: { store.refresh(); showMoodPicker = false })
        }
        .photosPicker(isPresented: $showPhotoPicker, selection: $photoItem, matching: .images)
        .onChange(of: photoItem) { newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self), let image = UIImage(data: data) {
                    await MainActor.run {
                        store.processReceiptImage(image)
                    }
                }
                photoItem = nil
            }
        }
    }

    @ViewBuilder
    private func happinessNote() -> some View {
        let categories: [(shared.Category, String)] = [(.lazer, "Lazer"), (.saude, "Saúde"), (.educacao, "Educação")]
        let nowMs = store.sharedApp.store.nowMs()
        let notes = categories.compactMap { (cat, label) -> String? in
            let lasts = store.transactions
                .filter { $0.category == cat && $0.type == .saida && !$0.sleeping && !$0.excludeFromSavingsAdvice }
                .sorted { $0.timestampMs > $1.timestampMs }
            if let last = lasts.first {
                let daysAgo = (nowMs - last.timestampMs) / (1000 * 86400)
                if daysAgo >= 15 {
                    return "\(label): há \(daysAgo) dias. Que tal se permitir?"
                }
            }
            return nil
        }
        if !notes.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Invista em você")
                    .font(.system(size: 13, weight: .light)).foregroundColor(accentColor2())
                ForEach(notes, id: \.self) { note in
                    Text(note).font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                }
            }
            .padding(20).frame(maxWidth: .infinity, alignment: .leading)
            .background(cardBg()).cornerRadius(16)
        }
    }

    @ViewBuilder
    private func txRow(_ tx: shared.Transaction) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(tx.description.isEmpty || tx.description.hasPrefix("Transaction(") ? tx.category.label : tx.description)
                    .font(.system(size: 15, weight: .light)).foregroundColor(Color.white)
                Text(tx.category.label)
                    .font(.system(size: 12, weight: .light)).foregroundColor(textSecondary())
            }
            Spacer()
            Text(formatBrl(tx.value))
                .font(.system(size: 16, weight: .light))
                .foregroundColor(tx.type == .entrada ? successColor() : dangerColor())
        }
        .padding(16)
        .background(cardBg()).cornerRadius(14)
    }

    private func sectionHeader(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 15, weight: .light))
            .foregroundColor(textSecondary())
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 4)
    }
}

// MARK: - Mood Picker

struct MoodPickerView: View {
    @ObservedObject var store: mdmrStore
    let onDone: () -> Void
    @State private var selectedMood: Mood? = nil
    @State private var showWarning = false

    let moods: [(Mood, String)] = [
        (.ansiedade, "🧠 Ansiedade"),
        (.tedio, "😐 Tédio"),
        (.euforia, "✨ Euforia"),
        (.tristeza, "🌧 Tristeza"),
        (.calmaria, "🍃 Calmaria"),
    ]

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            VStack(spacing: 28) {
                Spacer()
                Text("Como você está?")
                    .font(.system(size: 26, weight: .light))
                    .foregroundColor(Color.white)
                Text("Reconhecer seu estado emocional ajuda a tomar decisões mais conscientes.")
                    .font(.system(size: 13, weight: .light))
                    .foregroundColor(textSecondary())
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                VStack(spacing: 10) {
                    ForEach(moods, id: \.0) { (mood, label) in
                        Button(action: { selectedMood = mood; showWarning = mood.isImpulsive }) {
                            HStack(spacing: 14) {
                                Text(String(label.prefix(2)))
                                    .font(.system(size: 18))
                                    .frame(width: 40, height: 40)
                                    .background(moodColor(mood).opacity(0.18))
                                    .clipShape(Circle())
                                Text(label)
                                    .font(.system(size: 16, weight: .light))
                                    .foregroundColor(Color.white)
                                Spacer()
                                if selectedMood == mood {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 14, weight: .light))
                                        .foregroundColor(Color.white)
                                }
                            }
                            .padding(.horizontal, 18).padding(.vertical, 14)
                            .background(selectedMood == mood ? cardElevatedBg() : cardBg())
                            .cornerRadius(14)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 24)

                if showWarning, let mood = selectedMood, mood.isImpulsive {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Pausa")
                            .font(.system(size: 14, weight: .medium)).foregroundColor(warningColor())
                        Text("Você está num estado \(mood.label.lowercased()). Considere esperar 30 minutos antes de gastos significativos.")
                            .font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                    }
                    .padding(18).frame(maxWidth: .infinity, alignment: .leading)
                    .background(warningColor().opacity(0.08)).cornerRadius(14)
                    .padding(.horizontal, 24)
                }

                Button(action: {
                    if let m = selectedMood { store.addMood(m) }
                    onDone()
                }) {
                    Text("Continuar")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Color.black)
                        .frame(maxWidth: .infinity, minHeight: 52)
                        .background(selectedMood != nil ? Color.white : Color.gray.opacity(0.2))
                        .cornerRadius(14)
                }
                .disabled(selectedMood == nil)
                .padding(.horizontal, 24)

                Spacer()
            }
        }
    }
}
