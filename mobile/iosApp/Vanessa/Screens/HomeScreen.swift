import Foundation
import SwiftUI
import VanessaShared
import shared

struct HomeScreen: View {
    @ObservedObject private var vm: KmpViewModel<HomeUiState>

    init(container: IosContainer) {
        _vm = ObservedObject(initialValue: KmpViewModel(initial: container.homeVm.snapshot(),
                                                        poll: { container.homeVm.snapshot() }))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Olá, \(vm.current.name)").font(.title3).foregroundColor(ThemePalette.textPrimary)
                Spacer()
                Button(action: { /* open mood */ }) {
                    Text(vm.current.mood?.icon ?? "💭").font(.title3)
                }
            }
            balanceCard
            if let note = vm.current.happinessNote {
                VStack(alignment: .leading) {
                    Text("Invista em você").foregroundColor(ThemePalette.lavender).bold()
                    Text(note).foregroundColor(ThemePalette.textPrimary)
                }.padding().background(ThemePalette.surface.cornerRadius(12))
            }
            Text("Diário").foregroundColor(ThemePalette.textSecondary)
            ScrollView {
                VStack(spacing: 8) {
                    ForEach(Array(vm.current.recent.prefix(5)), id: \.id) { tx in txRow(tx) }
                }
            }
            Spacer()
        }
        .padding(16)
    }

    private var balanceCard: some View {
        let bal = vm.current.monthlyIncome - vm.current.monthlyExpense
        return VStack(alignment: .leading, spacing: 8) {
            Text("Saldo deste mês").foregroundColor(ThemePalette.textSecondary)
            Text(formatBRL(bal))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(bal >= 0 ? ThemePalette.success : ThemePalette.danger)
            HStack {
                VStack(alignment: .leading) {
                    Text("Receitas").foregroundColor(ThemePalette.textSecondary).font(.caption)
                    Text(formatBRL(vm.current.monthlyIncome)).foregroundColor(ThemePalette.success)
                }
                Spacer()
                VStack(alignment: .trailing) {
                    Text("Despesas").foregroundColor(ThemePalette.textSecondary).font(.caption)
                    Text(formatBRL(vm.current.monthlyExpense)).foregroundColor(ThemePalette.danger)
                }
            }
        }.padding(20).background(ThemePalette.surfaceElevated.cornerRadius(16))
    }

    private func txRow(_ tx: Transaction) -> some View {
        HStack {
            VStack(alignment: .leading) {
                Text(tx.description).foregroundColor(ThemePalette.textPrimary)
                Text(tx.category.label).foregroundColor(ThemePalette.textSecondary).font(.caption)
            }
            Spacer()
            Text((tx.type == .saida ? "- " : "+ ") + formatBRL(tx.value))
                .foregroundColor(tx.type == .saida ? ThemePalette.danger : ThemePalette.success)
        }.padding(12).background(ThemePalette.surface.cornerRadius(10))
    }
}
