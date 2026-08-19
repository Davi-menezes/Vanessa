import SwiftUI
import UIKit
import AVFoundation
import shared

@MainActor
final class AppHost: ObservableObject {
    let sharedApp: SharedApp

    init() {
        self.sharedApp = SharedApp()
        // Quando a UI Compose pedir captura de áudio, o iOS abre a sessão
        // e, em futuras iterações, integra a transcrição. Por enquanto é
        // um no-op — o Compose já informa visualmente se falhou.
        sharedApp.onRequestAudioCapture = { [weak self] in
            self?.requestMicrophone()
        }
        sharedApp.onRequestPickFiles = { [weak self] in
            self?.notify("Importação de arquivos é um recurso Pro — em breve!")
        }
    }

    private func requestMicrophone() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.record, mode: .default, options: [])
            try session.setActive(true)
            // No-op visualmente: a UI Compose mostra o botão "tocando" e o usuário
            // pode registrar a transação pela rota normal.
        } catch {
            // swallow — first version does not transcribe audio.
        }
    }

    private func notify(_ message: String) {
        print("mdmr:", message)
    }
}
