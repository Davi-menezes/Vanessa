import Foundation
import SwiftUI
import VanessaShared
import shared

final class AppRouter: ObservableObject {
    enum Tab: String, CaseIterable { case home, transactions, insights, planning }
    @Published var selected: Tab = .home
    @Published var showMoodCheckin: Bool = false
}

struct RootView: View {
    @EnvironmentObject var container: IosContainer
    @StateObject private var router = AppRouter()

    var body: some View {
        ZStack {
            if container.authVm.snapshot().authed {
                mainTabView
            } else {
                AuthScreen(vm: container.authVm)
            }
        }
        .vanessaScreen()
        .sheet(isPresented: $router.showMoodCheckin) {
            MoodScreen(vm: container.moodVm, onClose: { router.showMoodCheckin = false })
        }
    }

    private var mainTabView: some View {
        VStack(spacing: 0) {
            ZStack {
                switch router.selected {
                case .home: HomeScreen(container: container)
                case .transactions: TransactionsScreen(container: container)
                case .insights: InsightsScreen(container: container)
                case .planning: PlanningScreen(container: container)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            tabBar
        }
    }

    private var tabBar: some View {
        HStack(spacing: 0) {
            ForEach(AppRouter.Tab.allCases, id: \.rawValue) { tab in
                let active = router.selected == tab
                Button(action: { router.selected = tab }) {
                    VStack(spacing: 2) {
                        Text(glyph(tab)).font(.system(size: 22))
                        Text(label(tab)).font(.caption)
                            .foregroundColor(active ? ThemePalette.lavender : ThemePalette.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.vertical, 8)
        .background(ThemePalette.surface)
    }

    private func label(_ t: AppRouter.Tab) -> String {
        switch t {
        case .home: return "Início"
        case .transactions: return "Gastos"
        case .insights: return "Insights"
        case .planning: return "Planejamento"
        }
    }
    private func glyph(_ t: AppRouter.Tab) -> String {
        switch t {
        case .home: return "🏠"
        case .transactions: return "💸"
        case .insights: return "📊"
        case .planning: return "🎯"
        }
    }
}
