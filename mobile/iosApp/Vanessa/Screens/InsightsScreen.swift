import Foundation
import SwiftUI
import VanessaShared
import shared

struct InsightsScreen: View {
    @StateObject private var vm: KmpViewModel<InsightsUiState>

    init(container: IosContainer) {
        _vm = StateObject(wrappedValue: KmpViewModel(initial: container.insightsVm.snapshot(),
                                                     poll: { container.insightsVm.snapshot() }))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Insights").font(.title3).bold().foregroundColor(ThemePalette.textPrimary)

                Text("Por humor").foregroundColor(ThemePalette.textSecondary)
                if vm.current.byMood.isEmpty {
                    Text("Sem dados suficientes ainda.").foregroundColor(ThemePalette.textSecondary)
                } else {
                    BarChart(values: vm.current.byMood.map { Float($0.first) })
                    ForEach(vm.current.byMood, id: \.first) { item in
                        HStack {
                            Text(item.first.label).frame(width: 100, alignment: .leading)
                            Text("\(formatBRL(item.second)) · \(item.third) transações")
                                .foregroundColor(ThemePalette.textSecondary)
                        }
                    }
                }

                Text("Por categoria (mês atual)").foregroundColor(ThemePalette.textSecondary)
                let cats = vm.current.byCategory
                if cats.isEmpty {
                    Text("Sem despesas neste mês.").foregroundColor(ThemePalette.textSecondary)
                } else {
                    let max = cats.map(\.second).max() ?? 1
                    ForEach(cats, id: \.first) { item in
                        HStack {
                            Text(item.first.label).frame(width: 100, alignment: .leading)
                            CapacityBar(ratio: max > 0 ? CGFloat(item.second / max) : 0)
                            Text(formatBRL(item.second)).foregroundColor(ThemePalette.textSecondary)
                        }
                    }
                }

                if !vm.current.goals.isEmpty {
                    Text("Invista em você").foregroundColor(ThemePalette.textSecondary)
                    ForEach(vm.current.goals, id: \.first) { g in
                        VStack(alignment: .leading) {
                            Text(g.first.label).foregroundColor(ThemePalette.lavender).bold()
                            Text(g.second).foregroundColor(ThemePalette.textPrimary)
                        }.padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(ThemePalette.surface.cornerRadius(12))
                    }
                }
            }.padding(16)
        }
    }
}

struct CapacityBar: View {
    let ratio: CGFloat
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 6).fill(ThemePalette.surface)
                RoundedRectangle(cornerRadius: 6)
                    .fill(ThemePalette.lavender)
                    .frame(width: geo.size.width * ratio)
            }
        }.frame(height: 12)
    }
}

struct BarChart: View {
    let values: [Float]
    var body: some View {
        let max = values.max() ?? 1
        HStack(alignment: .bottom, spacing: 8) {
            ForEach(values.indices, id: \.self) { i in
                let h = CGFloat(max > 0 ? values[i] / max : 0) * 100
                VStack {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(ThemePalette.lavender)
                        .frame(height: max == 0 ? 2 : h)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(12)
        .background(ThemePalette.surface.cornerRadius(12))
        .frame(height: 120)
    }
}
