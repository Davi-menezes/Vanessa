import SwiftUI
import shared
import PhotosUI

enum AppScreen {
    case welcome
    case auth
    case main
}

enum MainTab: CaseIterable, Hashable {
    case home, transactions, insights, planning

    var label: String {
        switch self {
        case .home: "Início"
        case .transactions: "Gastos"
        case .insights: "Insights"
        case .planning: "Planos"
        }
    }
    var icon: String {
        switch self {
        case .home: "house.fill"
        case .transactions: "creditcard.fill"
        case .insights: "chart.bar.fill"
        case .planning: "target"
        }
    }
}

struct ContentView: View {
    @StateObject private var store = mdmrStore()
    @State private var screen: AppScreen = .welcome

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            Group {
                switch screen {
                case .welcome:
                    WelcomeView(store: store, onNavigate: { screen = $0 })
                        .transition(.opacity)
                case .auth:
                    AuthView(store: store, onBack: { screen = .welcome }, onLogin: { screen = .main })
                        .transition(.opacity)
                case .main:
                    MainView(store: store, onLogout: { screen = .welcome })
                        .transition(.opacity)
                }
            }
        }
        .onAppear {
            if store.currentUser != nil {
                screen = .main
            }
        }
        .animation(.easeInOut(duration: 0.25), value: screen)
    }
}

struct MainView: View {
    @ObservedObject var store: mdmrStore
    let onLogout: () -> Void
    @State private var tab: MainTab = .home
    @State private var showPhotoPicker = false
    @State private var photoItem: PhotosPickerItem? = nil

    var body: some View {
        ZStack {
            // Content fills screen, respects top safe area (notch), ignores bottom (tab bar)
            Group {
                switch tab {
                case .home:
                    HomeView(store: store, onSwitchTab: { tab = $0 })
                case .transactions:
                    TransactionsView(store: store, onSwitchTab: { tab = $0 })
                case .insights:
                    InsightsView(store: store)
                case .planning:
                    PlanningView(store: store, onSwitchTab: { tab = $0 })
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .ignoresSafeArea(.all, edges: .bottom)

            // Floating minimalist tab bar as overlay
            VStack {
                Spacer()
                HStack(spacing: 0) {
                    ForEach(MainTab.allCases, id: \.self) { t in
                        Button(action: { tab = t }) {
                            VStack(spacing: 3) {
                                Image(systemName: t.icon)
                                    .font(.system(size: 22, weight: .light))
                                Text(t.label)
                                    .font(.system(size: 10, weight: .light))
                            }
                            .foregroundColor(tab == t ? Color.white : textSecondary())
                            .frame(maxWidth: .infinity)
                            .padding(.top, 8)
                            .padding(.bottom, 4)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(
                    Color(red: 0.02, green: 0.02, blue: 0.02)
                        .ignoresSafeArea(edges: .bottom)
                )
                .overlay(
                    Rectangle()
                        .fill(Color.white.opacity(0.05))
                        .frame(height: 0.5),
                    alignment: .top
                )
            }
        }
        .ignoresSafeArea(.keyboard)
        .sheet(isPresented: $store.showVoiceSheet) {
            VoiceRecordingSheet(store: store)
        }
        .sheet(isPresented: $store.showReceiptSheet) {
            ReceiptImportSheet(store: store)
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
}

// MARK: - Voice Recording Sheet

struct VoiceRecordingSheet: View {
    @ObservedObject var store: mdmrStore

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            VStack(spacing: 28) {
                Spacer()
                if store.isRecording {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 48))
                        .foregroundColor(Color.white)
                        .symbolEffect(.bounce, value: store.isRecording)
                    Text("Ouvindo...")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(textSecondary())
                } else if store.voiceResult != nil {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(successColor())
                    Text("Transação detectada")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(Color.white)
                } else {
                    Image(systemName: "mic")
                        .font(.system(size: 48))
                        .foregroundColor(textSecondary())
                    Text("Registro por voz")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(Color.white)
                }

                if !store.voiceTranscript.isEmpty {
                    Text("\"\(store.voiceTranscript)\"")
                        .font(.system(size: 14, weight: .light))
                        .foregroundColor(textSecondary())
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                if let r = store.voiceResult {
                    VStack(spacing: 8) {
                        HStack {
                            Text("Valor").font(.system(size: 13)).foregroundColor(textSecondary())
                            Spacer()
                            Text(formatBrl(r.value)).font(.system(size: 16, weight: .medium)).foregroundColor(Color.white)
                        }
                        HStack {
                            Text("Categoria").font(.system(size: 13)).foregroundColor(textSecondary())
                            Spacer()
                            Text(r.category.label).font(.system(size: 14)).foregroundColor(accentColor2())
                        }
                    }
                    .padding(20)
                    .background(cardBg()).cornerRadius(14)
                    .padding(.horizontal, 24)
                }

                if let err = store.voiceError {
                    Text(err)
                        .font(.system(size: 13))
                        .foregroundColor(dangerColor())
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                VStack(spacing: 12) {
                    if store.isRecording {
                        Button(action: { store.stopVoiceRecording() }) {
                            Text("Parar")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.black)
                                .frame(maxWidth: .infinity, minHeight: 52)
                                .background(Color.white).cornerRadius(14)
                        }
                    } else if store.voiceResult != nil {
                        HStack(spacing: 12) {
                            Button(action: { store.cancelVoiceRecording() }) {
                                Text("Cancelar")
                                    .font(.system(size: 15))
                                    .foregroundColor(textSecondary())
                                    .frame(maxWidth: .infinity, minHeight: 52)
                                    .background(cardElevatedBg()).cornerRadius(14)
                            }
                            Button(action: { store.confirmVoiceTransaction() }) {
                                Text("Confirmar")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(Color.black)
                                    .frame(maxWidth: .infinity, minHeight: 52)
                                    .background(Color.white).cornerRadius(14)
                            }
                        }
                    } else {
                        Button(action: { store.startVoiceRecording() }) {
                            Text("Tentar novamente")
                                .font(.system(size: 15))
                                .foregroundColor(Color.white)
                                .frame(maxWidth: .infinity, minHeight: 52)
                                .background(cardElevatedBg()).cornerRadius(14)
                        }
                    }
                    Button(action: { store.cancelVoiceRecording() }) {
                        Text("Fechar")
                            .font(.system(size: 14))
                            .foregroundColor(textSecondary())
                    }
                }
                .padding(.horizontal, 24)
                Spacer().frame(height: 40)
            }
        }
    }
}

// MARK: - Receipt Import Sheet

struct ReceiptImportSheet: View {
    @ObservedObject var store: mdmrStore
    let categories: [shared.Category] = [.alimentacao, .transporte, .combustivel, .lazer, .saude, .educacao, .moradia, .vestuario, .outros]

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    HStack {
                        Spacer()
                        Text("Importar comprovante")
                            .font(.system(size: 18, weight: .light))
                            .foregroundColor(Color.white)
                        Spacer()
                        Button(action: { store.cancelReceipt() }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .light))
                                .foregroundColor(textSecondary())
                        }
                    }
                    .padding(.top, 8)

                    if let img = store.receiptImage {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 200)
                            .cornerRadius(12)
                    }

                    if store.receiptError == nil && store.receiptValue.isEmpty {
                        VStack(spacing: 12) {
                            ProgressView()
                                .tint(Color.white)
                            Text("Analisando comprovante...")
                                .font(.system(size: 14, weight: .light))
                                .foregroundColor(textSecondary())
                        }
                        .padding(.vertical, 32)
                    }

                    if let err = store.receiptError {
                        Text(err)
                            .font(.system(size: 13))
                            .foregroundColor(dangerColor())
                            .multilineTextAlignment(.center)
                    }

                    VStack(spacing: 14) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Valor").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                            TextField("Ex: 129,90", text: $store.receiptValue)
                                .keyboardType(.decimalPad)
                                .foregroundColor(Color.white)
                                .padding(16)
                                .background(cardElevatedBg())
                                .cornerRadius(12)
                        }
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Descrição").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                            TextField("Ex: Compra no mercado", text: $store.receiptDescription)
                                .foregroundColor(Color.white)
                                .padding(16)
                                .background(cardElevatedBg())
                                .cornerRadius(12)
                        }
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Categoria").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                                ForEach(categories, id: \.self) { cat in
                                    Button(action: { store.receiptCategory = cat }) {
                                        Text(cat.label)
                                            .font(.system(size: 13, weight: .light))
                                            .foregroundColor(store.receiptCategory == cat ? Color.black : Color.white)
                                            .padding(.horizontal, 10).padding(.vertical, 10)
                                            .frame(maxWidth: .infinity)
                                            .background(store.receiptCategory == cat ? Color.white : cardElevatedBg())
                                            .cornerRadius(10)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        Toggle("Não incluir em conselhos", isOn: $store.receiptExcludeFromSavings)
                            .font(.system(size: 14, weight: .light))
                            .foregroundColor(textSecondary())
                            .tint(Color.white)
                    }
                    .padding(20).background(cardBg()).cornerRadius(18)

                    Button(action: { store.confirmReceipt() }) {
                        Text("Salvar gasto")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(Color.black)
                            .frame(maxWidth: .infinity, minHeight: 52)
                            .background(Color.white).cornerRadius(14)
                    }
                    Spacer().frame(height: 40)
                }
                .padding(.horizontal, 24)
            }
        }
    }
}