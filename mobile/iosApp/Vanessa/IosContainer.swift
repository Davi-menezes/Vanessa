import Foundation
import VanessaShared

final class IosContainer: ObservableObject {
    let graph: AppGraph
    let db: VanessaDatabase
    let authVm: AuthViewModel
    let homeVm: HomeViewModel
    let transactionsVm: TransactionsViewModel
    let insightsVm: InsightsViewModel
    let planningVm: PlanningViewModel
    let moodVm: MoodViewModel

    init() {
        let factory = IosDatabaseDriverFactory()
        let driver = factory.create()
        db = VanessaDatabase(driver: driver)
        let settingsImpl = IosSettingsFactory().create()
        let settingsRepo = SettingsRepositoryImpl(settings: settingsImpl)
        graph = VanessaGraph.create(db: db, settings: settingsRepo)
        authVm = AuthViewModel(graph: graph)
        homeVm = HomeViewModel(graph: graph)
        transactionsVm = TransactionsViewModel(graph: graph)
        insightsVm = InsightsViewModel(graph: graph)
        planningVm = PlanningViewModel(graph: graph)
        moodVm = MoodViewModel(graph: graph)
    }
}
