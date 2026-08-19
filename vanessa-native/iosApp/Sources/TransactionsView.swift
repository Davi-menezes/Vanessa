import SwiftUI
import shared
import PhotosUI

struct TransactionsView: View {
    @ObservedObject var store: mdmrStore
    let onSwitchTab: (MainTab) -> Void
    @State private var showAdd = false
    @State private var showPhotoPicker = false
    @State private var photoItem: PhotosPickerItem? = nil

    var visibleItems: [shared.Transaction] {
        store.transactions.filter { !$0.sleeping }
    }
    var hiddenSet: Set<String> {
        Set(visibleItems.filter { store.sharedApp.store.isExpenseHidden(id: $0.id) }.map(\.id))
    }

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            VStack(spacing: 0) {
                HStack {
                    Text("Transações")
                        .font(.system(size: 24, weight: .light))
                        .foregroundColor(Color.white)
                    Spacer()
                    Button(action: { store.sharedApp.requestAudioCapture() }) {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 14, weight: .light))
                            .foregroundColor(Color.white)
                            .padding(8)
                            .background(cardElevatedBg())
                            .clipShape(Circle())
                    }
                    Button(action: { showPhotoPicker = true }) {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 14, weight: .light))
                            .foregroundColor(Color.white)
                            .padding(8)
                            .background(cardElevatedBg())
                            .clipShape(Circle())
                    }
                    Button(action: { store.clearTransactions() }) {
                        Image(systemName: "trash")
                            .font(.system(size: 15, weight: .light))
                            .foregroundColor(textSecondary())
                            .padding(8)
                            .background(cardElevatedBg())
                            .clipShape(Circle())
                    }
                    Button(action: { showAdd = true }) {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .light))
                            .foregroundColor(Color.black)
                            .padding(10)
                            .background(Color.white)
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 24).padding(.top, 8).padding(.bottom, 12)
                if visibleItems.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "creditcard")
                            .font(.system(size: 40, weight: .ultraLight))
                            .foregroundColor(textSecondary())
                        Text("Nenhuma transação ainda")
                            .font(.system(size: 15, weight: .light))
                            .foregroundColor(textSecondary())
                    }
                    Spacer()
                } else {
                    ScrollView(showsIndicators: false) {
                        LazyVStack(spacing: 10) {
                            ForEach(visibleItems.filter { !hiddenSet.contains($0.id) }, id: \.id) { tx in
                                TransactionRow(tx: tx, store: store)
                            }
                        }
                        .padding(.horizontal, 24)
                        Spacer().frame(height: 80)
                    }
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            AddTransactionSheet(store: store, onDone: { showAdd = false })
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

struct TransactionRow: View {
    let tx: shared.Transaction
    @ObservedObject var store: mdmrStore

    var body: some View {
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
            Menu {
                Button(action: { store.hideExpensesNotification(tx.id) }) {
                    Label("Esconder", systemImage: "eye.slash")
                }
                Button(action: { store.deleteTransaction(tx.id) }) {
                    Label("Excluir", systemImage: "trash")
                        .foregroundColor(dangerColor())
                }
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 14, weight: .light))
                    .foregroundColor(textSecondary())
                    .padding(.leading, 6)
            }
        }
        .padding(16)
        .background(cardBg()).cornerRadius(14)
    }
}

// MARK: - Add Transaction Sheet

struct AddTransactionSheet: View {
    @ObservedObject var store: mdmrStore
    let onDone: () -> Void

    @State private var valueStr = ""
    @State private var desc = ""
    @State private var selectedCategory: shared.Category? = nil
    @State private var txType: shared.TxType = .saida
    @State private var payment: shared.PaymentMethod = .contaCorrente
    @State private var excludeFromSavings = false

    let categories: [shared.Category] = [.alimentacao, .transporte, .combustivel, .lazer, .saude, .educacao, .moradia, .vestuario, .outros]

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    HStack {
                        Button(action: onDone) {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .light))
                                .foregroundColor(textSecondary())
                        }
                        Spacer()
                        Text("Nova transação")
                            .font(.system(size: 18, weight: .light))
                            .foregroundColor(Color.white)
                        Spacer()
                        Image(systemName: "xmark").opacity(0)
                    }
                    .padding(.top, 8)

                    VStack(spacing: 14) {
                        TextField("Valor", text: $valueStr)
                            .keyboardType(.decimalPad)
                            .foregroundColor(Color.white).padding(16).background(cardElevatedBg()).cornerRadius(12)
                        TextField("Descrição (opcional)", text: $desc)
                            .foregroundColor(Color.white).padding(16).background(cardElevatedBg()).cornerRadius(12)

                        Text("Categoria").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary()).frame(maxWidth: .infinity, alignment: .leading)
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                            ForEach(categories, id: \.self) { cat in
                                Button(action: { selectedCategory = cat }) {
                                    Text(cat.label)
                                        .font(.system(size: 13, weight: .light))
                                        .foregroundColor(selectedCategory == cat ? Color.black : Color.white)
                                        .padding(.horizontal, 10).padding(.vertical, 10)
                                        .frame(maxWidth: .infinity)
                                        .background(selectedCategory == cat ? Color.white : cardElevatedBg())
                                        .cornerRadius(10)
                                }
                                .buttonStyle(.plain)
                            }
                        }

                        Text("Tipo").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary()).frame(maxWidth: .infinity, alignment: .leading)
                        HStack(spacing: 8) {
                            pill("Despesa", selected: txType == .saida) { txType = .saida }
                            pill("Receita", selected: txType == .entrada) { txType = .entrada }
                        }

                        Text("Pagamento").font(.system(size: 13, weight: .light)).foregroundColor(textSecondary()).frame(maxWidth: .infinity, alignment: .leading)
                        HStack(spacing: 8) {
                            pill("Conta", selected: payment == .contaCorrente) { payment = .contaCorrente }
                            pill("Crédito", selected: payment == .credito) { payment = .credito }
                        }

                        Toggle("Não incluir em conselhos", isOn: $excludeFromSavings)
                            .font(.system(size: 14, weight: .light)).foregroundColor(textSecondary()).accentColor(Color.white)
                    }
                    .padding(20).background(cardBg()).cornerRadius(18)

                    Button(action: doAdd) {
                        Text("Salvar")
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

    private func pill(_ text: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 14, weight: .light))
                .foregroundColor(selected ? Color.black : Color.white)
                .padding(.horizontal, 16).padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(selected ? Color.white : cardElevatedBg())
                .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }

    private func doAdd() {
        guard let val = Double(valueStr.replacingOccurrences(of: ",", with: ".")),
              let cat = selectedCategory else { return }
        store.addTransaction(value: val, category: cat, type: txType, paymentMethod: payment, description: desc, excludeFromSavings: excludeFromSavings)
        store.refresh()
        onDone()
    }
}
