import SwiftUI
import shared

struct PlanningView: View {
    @ObservedObject var store: mdmrStore
    let onSwitchTab: (MainTab) -> Void

    private func todayDay() -> Int {
        let cal = Calendar.current
        return cal.component(.day, from: Date())
    }
    var dueNow: [(FixedCost, Int)] {
        let td = todayDay()
        return store.fixedCosts.map { ($0, Int($0.dueDay) - td) }.filter { $0.1 < 0 && !paidThisMonth($0.0.id) }
    }
    var dueToday: [FixedCost] {
        let td = todayDay()
        return store.fixedCosts.filter { Int($0.dueDay) == td && !paidThisMonth($0.id) }
    }
    var dueSoon: [(FixedCost, Int)] {
        let td = todayDay()
        return store.fixedCosts.map { ($0, Int($0.dueDay) - td) }
            .filter { $0.1 >= 1 && $0.1 <= 3 && !paidThisMonth($0.0.id) }
    }
    private func paidThisMonth(_ id: String) -> Bool {
        false
    }

    @State private var showAddPiggy = false
    @State private var showAddGoal = false
    @State private var showAddFixed = false
    @State private var piggyName = ""
    @State private var piggySaved = ""
    @State private var piggyTarget = ""
    @State private var goalTitle = ""
    @State private var goalType = ""
    @State private var goalTarget = ""
    @State private var goalMonths = ""
    @State private var fixedName = ""
    @State private var fixedAmount = ""
    @State private var fixedDay = ""
    @State private var fixedCat = ""

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                Text("Planejamento")
                    .font(.system(size: 24, weight: .light)).foregroundColor(Color.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 8)

                // Revenue card
                VStack(spacing: 6) {
                    Text("Receita do mês")
                        .font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                    Text(formatBrl(store.monthlyIncome))
                        .font(.system(size: 32, weight: .thin)).foregroundColor(Color.white)

                    if !dueNow.isEmpty {
                        Text("\(dueNow.count) vencido(s)")
                            .font(.system(size: 13, weight: .light)).foregroundColor(dangerColor())
                    }
                    if !dueToday.isEmpty {
                        Text("\(dueToday.count) vence hoje")
                            .font(.system(size: 13, weight: .light)).foregroundColor(warningColor())
                    }
                }
                .padding(24).frame(maxWidth: .infinity)
                .background(cardElevatedBg()).cornerRadius(20)

                // Piggy Banks
                sectionHeaderWithAdd("Cofrinhos") { showAddPiggy = true }
                ForEach(store.piggyBanks, id: \.id) { p in
                    VStack(spacing: 10) {
                        HStack {
                            Text(p.name)
                                .font(.system(size: 15, weight: .light)).foregroundColor(Color.white)
                            Spacer()
                            Button(action: { store.removePiggy(id: p.id) }) {
                                Image(systemName: "trash").font(.system(size: 12, weight: .light)).foregroundColor(dangerColor())
                            }
                        }
                        Text("\(formatBrl(p.savedAmount)) de \(formatBrl(p.targetAmount))")
                            .font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                            .frame(maxWidth: .infinity, alignment: .leading)
                        let ratio = p.targetAmount > 0 ? min(p.savedAmount / p.targetAmount, 1) : 0
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Rectangle().fill(cardElevatedBg())
                                Rectangle().fill(Color.white.opacity(0.7)).frame(width: geo.size.width * ratio)
                            }
                            .cornerRadius(3).frame(height: 6)
                        }.frame(height: 6)

                        HStack(spacing: 8) {
                            depositBtn("+R$50", 50, p.id)
                            depositBtn("+R$100", 100, p.id)
                            depositBtn("+R$200", 200, p.id)
                        }
                    }
                    .padding(16).background(cardBg()).cornerRadius(14)
                }
                if store.piggyBanks.isEmpty {
                    emptyCard("Nenhum cofrinho ainda")
                }

                // Goals
                sectionHeaderWithAdd("Metas") { showAddGoal = true }
                ForEach(store.planningGoals, id: \.id) { g in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(g.title).font(.system(size: 15, weight: .light)).foregroundColor(Color.white)
                            Text("\(formatBrl(g.targetAmount)) em \(g.targetMonths) meses")
                                .font(.system(size: 12, weight: .light)).foregroundColor(textSecondary())
                        }
                        Spacer()
                        Button(action: { store.removeGoal(id: g.id) }) {
                            Image(systemName: "trash").font(.system(size: 12, weight: .light)).foregroundColor(dangerColor())
                        }
                    }
                    .padding(16).background(cardBg()).cornerRadius(14)
                }
                if store.planningGoals.isEmpty {
                    emptyCard("Nenhuma meta")
                }

                // Fixed Costs
                sectionHeaderWithAdd("Gastos fixos") { showAddFixed = true }
                ForEach(store.fixedCosts, id: \.id) { f in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(f.name).font(.system(size: 15, weight: .light)).foregroundColor(Color.white)
                            Text("\(formatBrl(f.amount)) · dia \(f.dueDay)")
                                .font(.system(size: 12, weight: .light)).foregroundColor(textSecondary())
                        }
                        Spacer()
                        Button(action: { _ = store.markFixedPaid(id: f.id) }) {
                            Text("Pagar").font(.system(size: 13, weight: .light))
                                .foregroundColor(Color.white)
                                .padding(.horizontal, 14).padding(.vertical, 6)
                                .background(Color.white.opacity(0.12)).cornerRadius(8)
                        }
                        Button(action: { store.removeFixed(id: f.id) }) {
                            Image(systemName: "trash").font(.system(size: 12, weight: .light)).foregroundColor(dangerColor())
                        }
                    }
                    .padding(16).background(cardBg()).cornerRadius(14)
                }
                if store.fixedCosts.isEmpty {
                    emptyCard("Nenhum gasto fixo")
                }

                Button(action: { store.sharedApp.requestPickFiles() }) {
                    Text("Importar dados")
                        .font(.system(size: 14, weight: .light))
                        .foregroundColor(Color.white)
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .background(cardBg()).cornerRadius(14)
                }

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 24)
        }
        .background(appBg())
        .sheet(isPresented: $showAddPiggy) { addPiggySheet() }
        .sheet(isPresented: $showAddGoal) { addGoalSheet() }
        .sheet(isPresented: $showAddFixed) { addFixedSheet() }
    }

    private func emptyCard(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14, weight: .light))
            .foregroundColor(textSecondary())
            .padding(24).frame(maxWidth: .infinity)
            .background(cardBg()).cornerRadius(14)
    }

    @ViewBuilder
    private func addPiggySheet() -> some View {
        ZStack {
            appBg().ignoresSafeArea()
            CustomInputDialog(
                title: "Novo cofrinho",
                fields: [
                    ("Nome", $piggyName, nil),
                    ("Guardado", $piggySaved, .decimalPad),
                    ("Alvo", $piggyTarget, .decimalPad),
                ],
                onCancel: { showAddPiggy = false },
                onSave: {
                    let s = Double(piggySaved.replacingOccurrences(of: ",", with: ".")) ?? 0
                    let t = Double(piggyTarget.replacingOccurrences(of: ",", with: ".")) ?? 0
                    store.addPiggy(name: piggyName, saved: s, target: t)
                    piggyName = ""; piggySaved = ""; piggyTarget = ""
                    showAddPiggy = false
                }
            )
        }
    }

    @ViewBuilder
    private func addGoalSheet() -> some View {
        ZStack {
            appBg().ignoresSafeArea()
            CustomInputDialog(
                title: "Nova meta",
                fields: [
                    ("Título", $goalTitle, nil),
                    ("Tipo", $goalType, nil),
                    ("Alvo", $goalTarget, .decimalPad),
                    ("Meses", $goalMonths, .numberPad),
                ],
                onCancel: { showAddGoal = false },
                onSave: {
                    let t = Double(goalTarget.replacingOccurrences(of: ",", with: ".")) ?? 0
                    let m = Int(goalMonths) ?? 12
                    store.addGoal(title: goalTitle, type: goalType, target: t, months: m)
                    goalTitle = ""; goalType = ""; goalTarget = ""; goalMonths = ""
                    showAddGoal = false
                }
            )
        }
    }

    @ViewBuilder
    private func addFixedSheet() -> some View {
        ZStack {
            appBg().ignoresSafeArea()
            CustomInputDialog(
                title: "Novo gasto fixo",
                fields: [
                    ("Nome", $fixedName, nil),
                    ("Valor", $fixedAmount, .decimalPad),
                    ("Dia", $fixedDay, .numberPad),
                    ("Categoria", $fixedCat, nil),
                ],
                onCancel: { showAddFixed = false },
                onSave: {
                    let a = Double(fixedAmount.replacingOccurrences(of: ",", with: ".")) ?? 0
                    let d = Int(fixedDay) ?? 15
                    store.addFixed(name: fixedName, amount: a, dueDay: d, category: fixedCat)
                    fixedName = ""; fixedAmount = ""; fixedDay = ""; fixedCat = ""
                    showAddFixed = false
                }
            )
        }
    }

    private func depositBtn(_ label: String, _ delta: Double, _ id: String) -> some View {
        Button(action: { store.depositPiggy(id: id, delta: delta) }) {
            Text(label)
                .font(.system(size: 12, weight: .light))
                .foregroundColor(Color.white)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(Color.white.opacity(0.1)).cornerRadius(8)
        }
    }

    private func sectionHeaderWithAdd(_ title: String, action: @escaping () -> Void) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 15, weight: .light)).foregroundColor(textSecondary())
            Spacer()
            Button(action: action) {
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .light)).foregroundColor(Color.white)
            }
        }
        .padding(.top, 4)
    }
}

// MARK: - Shared input dialog

struct CustomInputDialog: View {
    let title: String
    let fields: [(label: String, binding: Binding<String>, keyboard: UIKeyboardType?)]
    let onCancel: () -> Void
    let onSave: () -> Void

    init(title: String, fields: [(String, Binding<String>, UIKeyboardType?)], onCancel: @escaping () -> Void, onSave: @escaping () -> Void) {
        self.title = title
        self.fields = fields
        self.onCancel = onCancel
        self.onSave = onSave
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                HStack {
                    Button(action: onCancel) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .light)).foregroundColor(textSecondary())
                    }
                    Spacer()
                    Text(title).font(.system(size: 18, weight: .light)).foregroundColor(Color.white)
                    Spacer()
                    Image(systemName: "xmark").opacity(0)
                }.padding(.top, 8)

                VStack(spacing: 14) {
                    ForEach(fields.indices, id: \.self) { i in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(fields[i].label).font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                            TextField(fields[i].label, text: fields[i].binding)
                                .foregroundColor(Color.white).padding(16).background(cardElevatedBg()).cornerRadius(12)
                                .keyboardType(fields[i].keyboard ?? .default)
                        }
                    }
                }
                .padding(20).background(cardBg()).cornerRadius(18)

                Button(action: onSave) {
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
        .background(appBg().ignoresSafeArea())
    }
}
