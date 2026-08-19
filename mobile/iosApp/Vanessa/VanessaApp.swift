import Foundation

@main
struct VanessaApp: App {
    @StateObject private var container = IosContainer()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(container)
                .preferredColorScheme(.dark)
        }
    }
}
