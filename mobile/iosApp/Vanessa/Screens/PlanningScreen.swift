import Foundation
import SwiftUI
import VanessaShared
import shared

struct PlanningScreen: View {
    @StateObject private var vm: KmpViewModel<PlanningUiState>
    let kmm: PlanningViewModel
    let scope = AppRuntime.shared_kmp
    @State private var addingPiggy = false
    @State private var addingGoal = false
    @State private var addingFixed = false

    init(container: IosContainer) {
        self.kmm = container.planningVm
        _vm = StateObject(wrappedValue: KmpViewModel(initial: container.planningVm.snapshot(),
                                                     poll: { container.planningVm.snapshot() }))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Planejamento").font(.title3).bold().foregroundColor(ThemePalette.textPrimary)
                summary
                piggies
                goals
                fixed
                Spacer(minLength: 40)
            }.padding(16)
        }
        .sheet(isPresented: $addingPiggy) {
            TextInputSheet(title: "Novo cofrinho", onConfirm: { name in
                kmm.addPiggyBank(name: name ?? "Cofrinho", saved: 0.0, target: 100.0)
                addingPiggy = false
            })
        }
        .sheet(isPresented: $addingGoal) {
            TextInputSheet(title: "Nova meta", onConfirm: { name in
                kmm.addGoal(title: name ?? "Meta", type: "viagem", target: 1000.0, targetMonths: 12)
                addingGoal = false
            })
        }
        .sheet(isPresented: $addingFixed) {
            TextInputSheet(title: "Novo gasto fixo", onConfirm: { name in
                kmm.addFixed(name: name ?? "Gasto", amount: 100.0, dueDay: 5, category: "outros")
                addingFixed = false
            })
        }
    }

    private var summary: some View {
        VStack(alignment: .leading) {
            Text("Receita do mês").foregroundColor(ThemePalette.textSecondary)
            Text(formatBRL(vm.current.monthlyIncome))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(ThemePalette.success)
            if !vm.current.reminders.overdue.isEmpty {
                Text("\(vm.current.reminders.overdue.count) vencidos")
                    .foregroundColor(ThemePalette.danger)
            }
            if !vm.current.reminders.dueToday.isEmpty {
                Text("\(vm.current.reminders.dueToday.count) vencendo hoje")
                    .foregroundColor(ThemePalette.warning)
            }
        }.padding(20).frame(maxWidth: .infinity, alignment: .leading).background(ThemePalette.surface.cornerRadius(12))
    }

    private var piggies: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Cofrinhos").foregroundColor(ThemePalette.textSecondary)
                Spacer()
                Button("+ Novo") { addingPiggy = true }
            }
            ForEach(vm.current.piggy, id: \.id) { pb in
                VStack(alignment: .leading) {
                    Text(pb.name).foregroundColor(ThemePalette.textPrimary).bold()
                    Text("\(formatBRL(pb.savedAmount)) de \(formatBRL(pb.targetAmount))")
                        .foregroundColor(ThemePalette.textSecondary)
                    ProgressBar(ratio: pb.targetAmount > 0
                                ? CGFloat(pb.savedAmount / pb.targetAmount) : 0)
                    HStack {
                        Button("+R$50") { kmm.deposit(id: pb.id, amount: 50.0) }
                        Spacer()
                        Button("Excluir") { kmm.removePiggy(id: pb.id) }
                    }.font(.caption)
                }.padding().background(ThemePalette.surface.cornerRadius(12))
            }
        }
    }

    private var goals: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Metas").foregroundColor(ThemePalette.textSecondary)
                Spacer()
                Button("+ Nova") { addingGoal = true }
            }
            ForEach(vm.current.goals, id: \.id) { g in
                HStack {
                    VStack(alignment: .leading) {
                        Text(g.title).foregroundColor(ThemePalette.textPrimary)
                        Text("\(formatBRL(g.targetAmount)) em \(g.targetMonths) meses")
                            .foregroundColor(ThemePalette.textSecondary).font(.caption)
                    }
                    Spacer()
                    Button(action: { kmm.removeGoal(id: g.id) }) { Text("🗑") }
                }.padding().background(ThemePalette.surface.cornerRadius(12))
            }
        }
    }

    private var fixed: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Gastos fixos").foregroundColor(ThemePalette.textSecondary)
                Spacer()
                Button("+ Novo") { addingFixed = true }
            }
            ForEach(vm.current.fixed, id: \.id) { f in
                HStack {
                    VStack(alignment: .leading) {
                        Text(f.name).foregroundColor(ThemePalette.textPrimary)
                        Text("\(formatBRL(f.amount)) dia \(f.dueDay)")
                            .foregroundColor(ThemePalette.textSecondary).font(.caption)
                    }
                    Spacer()
                    Button("Pagar") { kmm.markFixedPaid(id: f.id) }
                    Button(action: { kmm.removeFixed(id: f.id) }) { Text("🗑") }
                }.padding().background(ThemePalette.surface.cornerRadius(12))
            }
        }
    }
}

struct ProgressBar: View {
    let ratio: CGFloat
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4).fill(ThemePalette.surfaceElevated)
                RoundedRectangle(cornerRadius: 4).fill(ThemePalette.lavender)
                    .frame(width: min(geo.size.width * ratio, geo.size.width))
            }
        }.frame(height: 8)
    }
}

struct TextInputSheet: View {
    let title: String
    let onConfirm: (String?) -> Void
    @State private var text = ""
    var body: some View {
        NavigationView {
            Form {
                TextField("Nome", text: $text)
            }
            .navigationTitle(title)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { onConfirm(text.isEmpty ? nil : text) }
                }
            }
        }
    }
}
