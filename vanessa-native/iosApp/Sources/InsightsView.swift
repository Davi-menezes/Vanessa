import SwiftUI
import shared

struct InsightsView: View {
    @ObservedObject var store: mdmrStore

    var moodTotals: [(Mood, Double, Int)] {
        let txns = store.transactions.filter { $0.type == .saida && !$0.sleeping }
        var map: [Mood: (sum: Double, count: Int)] = [:]
        for tx in txns {
            guard let m = tx.mood else { continue }
            var cur = map[m] ?? (0, 0)
            cur.sum += tx.value
            cur.count += 1
            map[m] = cur
        }
        return map.map { ($0.key, $0.value.sum, $0.value.count) }.sorted { a, b in a.1 > b.1 }
    }

    var catTotals: [(shared.Category, Double)] {
        let txns = store.transactions.filter {
            $0.type == .saida && !$0.sleeping && store.sharedApp.store.sameMonthNow(ts: $0.timestampMs)
        }
        var map: [shared.Category: Double] = [:]
        for tx in txns { map[tx.category] = (map[tx.category] ?? 0) + tx.value }
        return map.map { ($0.key, $0.value) }.sorted { $0.1 > $1.1 }
    }

    var maxCat: Double { catTotals.map(\.1).max() ?? 1 }
    var moodMax: Double { max(moodTotals.map(\.1).max() ?? 1, 1) }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                Text("Insights")
                    .font(.system(size: 24, weight: .light))
                    .foregroundColor(Color.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 8)

                // By mood
                sectionHeader("Por humor")
                if moodTotals.isEmpty {
                    emptyCard("Registre transações e humor para ver padrões")
                } else {
                    barChart()
                    ForEach(moodTotals, id: \.0) { (mood, total, count) in
                        HStack {
                            Text(moodIcon(mood)).font(.system(size: 20))
                            Text(mood.label).font(.system(size: 15, weight: .light)).foregroundColor(Color.white)
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(formatBrl(total)).font(.system(size: 16, weight: .light)).foregroundColor(dangerColor())
                                Text("\(count) transações").font(.system(size: 11, weight: .light)).foregroundColor(textSecondary())
                            }
                        }
                        .padding(16).background(cardBg()).cornerRadius(14)
                    }
                }

                // By category
                sectionHeader("Por categoria")
                if catTotals.isEmpty {
                    emptyCard("Gaste neste mês para ver análises")
                } else {
                    ForEach(catTotals, id: \.0) { (cat, total) in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(cat.label).font(.system(size: 13, weight: .light)).foregroundColor(Color.white)
                                Spacer()
                                Text(formatBrl(total)).font(.system(size: 14, weight: .light)).foregroundColor(dangerColor())
                            }
                            GeometryReader { geo in
                                ZStack(alignment: .leading) {
                                    Rectangle().fill(cardElevatedBg())
                                    Rectangle().fill(Color.white.opacity(0.7))
                                        .frame(width: geo.size.width * (total / maxCat))
                                }
                                .cornerRadius(3)
                                .frame(height: 6)
                            }.frame(height: 6)
                        }
                        .padding(16).background(cardBg()).cornerRadius(14)
                    }
                }

                // Invest in you
                sectionHeader("Invista em você")
                let investments = happinessNotes()
                if investments.isEmpty {
                    emptyCard("Faça transações em lazer, saúde e educação")
                } else {
                    ForEach(investments, id: \.category) { (cat, msg) in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(cat).font(.system(size: 14, weight: .light)).foregroundColor(accentColor2())
                            Text(msg).font(.system(size: 13, weight: .light)).foregroundColor(textSecondary())
                        }
                        .padding(18).frame(maxWidth: .infinity, alignment: .leading)
                        .background(cardBg()).cornerRadius(14)
                    }
                }

                Spacer().frame(height: 80)
            }
            .padding(.horizontal, 24)
        }
        .background(appBg())
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.system(size: 15, weight: .light)).foregroundColor(textSecondary())
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 4)
    }

    private func emptyCard(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14, weight: .light))
            .foregroundColor(textSecondary())
            .padding(32).frame(maxWidth: .infinity)
            .background(cardBg()).cornerRadius(14)
    }

    @ViewBuilder
    private func barChart() -> some View {
        let items = moodTotals
        HStack(alignment: .bottom, spacing: 12) {
            ForEach(items, id: \.0) { (mood, total, _) in
                VStack(spacing: 6) {
                    Rectangle()
                        .fill(Color.white.opacity(0.8))
                        .frame(width: 32, height: 120 * (total / moodMax))
                        .cornerRadius(4)
                    Text(moodIcon(mood)).font(.system(size: 14))
                }
            }
        }
        .frame(height: 150)
        .padding(20).background(cardBg()).cornerRadius(16)
    }

    private func happinessNotes() -> [(category: String, message: String)] {
        let themes: [(shared.Category, String)] = [(.lazer, "Lazer"), (.saude, "Saúde"), (.educacao, "Educação")]
        let nowMs = store.sharedApp.store.nowMs()
        var results: [(String, String)] = []
        for (cat, label) in themes {
            let lasts = store.transactions
                .filter { $0.category == cat && $0.type == .saida && !$0.sleeping && !$0.excludeFromSavingsAdvice }
                .sorted(by: { $0.timestampMs > $1.timestampMs })
            if let last = lasts.first {
                let days = (nowMs - last.timestampMs) / (1000 * 86400)
                if days >= 15 {
                    results.append((label, "Última compra há \(days) dias. Que tal se permitir?"))
                }
            }
        }
        return results
    }
}
