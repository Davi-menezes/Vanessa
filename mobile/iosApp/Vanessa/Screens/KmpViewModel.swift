import Foundation
import SwiftUI
import VanessaShared
import shared

@MainActor
final class KmpViewModel<S>: ObservableObject {
    private let poll: () -> S
    @Published var current: S
    private var timer: Timer?

    init(initial: @autoclosure @escaping () -> S, poll: @escaping () -> S) {
        self.current = initial()
        self.poll = poll
        timer = Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { [weak self] _ in
            self?.refresh()
        }
    }
    func refresh() {
        DispatchQueue.main.async { self.current = self.poll() }
    }
    deinit { timer?.invalidate() }
}
