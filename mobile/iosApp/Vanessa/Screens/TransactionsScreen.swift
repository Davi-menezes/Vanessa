import Foundation
import SwiftUI
import VanessaShared
import shared

struct TransactionsScreen: View {
    @StateObject private var vm: KmpViewModel<TransactionsUiState>
    let kmm: TransactionsViewModel
    let scope = AppRuntime.shared_kmp
    let container: IosContainer

    @State private var showAdd = false

    init(container: IosContainer) {
        self.container = container
        self.kmm = container.transactionsVm
        _vm = StateObject(wrappedValue: KmpViewModel(initial: container.transactionsVm.snapshot(),
                                                     poll: { container.transactionsVm.snapshot() }))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Transações").font(.title3).bold().foregroundColor(ThemePalette.textPrimary)
                Spacer()
                Button("Limpar") { kmm.clearAll(scope: scope) }
                Button("+ Adicionar") { showAdd = true }.buttonStyle(.borderedProminent)
            }
            if vm.current.list.isEmpty {
                Spacer(); Text("Nenhuma transação ainda. Que calma!")
                    .foregroundColor(ThemePalette.textSecondary)
                Spacer()
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(vm.current.list, id: \.id) { tx in txRow(tx) }
                    }
                }
            }
        }
        .padding(16)
        .sheet(isPresented: $showAdd) {
            AddTransactionSheet(onDismiss: { showAdd = false }, onConfirm: { data in
                kmm.add(
                    value: data.value,
                    category: data.category,
                    type: data.type,
                    paymentMethod: data.paymentMethod,
                    description: data.description,
                    excludeFromSavingsAdvice: data.exclude,
                    scope: scope
                )
                showAdd = false
            })
        }
    }

    private func txRow(_ tx: Transaction) -> some View {
        HStack {
            VStack(alignment: .leading) {
                Text(tx.description).foregroundColor(ThemePalette.textPrimary)
                Text("\(tx.category.label) · \(tx.type == .saida ? "Despesa" : "Receita")")
                    .foregroundColor(ThemePalette.textSecondary).font(.caption)
            }
            Spacer()
            Text((tx.type == .saida ? "- " : "+ ") + formatBRL(tx.value))
                .foregroundColor(tx.type == .saida ? ThemePalette.danger : ThemePalette.success)
        }
        .padding(12)
        .background(ThemePalette.surface.cornerRadius(12))
    }
}
