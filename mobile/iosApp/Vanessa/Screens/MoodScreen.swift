import Foundation
import SwiftUI
import VanessaShared
import shared

struct MoodScreen: View {
    let vm: MoodViewModel
    @State private var picked: MoodType? = nil
    let onClose: () -> Void

    init(vm: MoodViewModel, onClose: @escaping () -> Void) {
        self.vm = vm
        self.onClose = onClose
    }

    var body: some View {
        VStack(spacing: 16) {
            Text("Como você está agora?")
                .font(.title2).foregroundColor(ThemePalette.textPrimary).bold()
            Text("Sua emoção influencia suas decisões financeiras.")
                .foregroundColor(ThemePalette.textSecondary)

            ForEach(MoodType.allTypes, id: \.self) { mood in
                Button(action: {
                    picked = mood
                    let res = vm.pickMood(mood: mood)
                    picked = mood
                    _ = res.isImpulsive
                }) {
                    HStack {
                        Text(mood.icon).font(.title)
                        Text(mood.label).foregroundColor(ThemePalette.textPrimary)
                        Spacer()
                    }
                    .padding(16)
                    .background(ThemePalette.surface.cornerRadius(12))
                }
            }

            if let picked = picked, picked.isImpulsive {
                VStack(alignment: .leading) {
                    Text("⚠ Pausa").bold()
                    Text("Alguns gastos impulsivos acontecem quando estamos \(picked.label.lowercased()). Antes de registrar uma despesa nova, considere esperar 30 min.")
                }
                .padding()
                .background(ThemePalette.warning.cornerRadius(12))
            }
            Button("Continuar") { onClose() }
                .buttonStyle(.borderedProminent)
            Spacer()
        }
        .padding(20)
    }
}

extension MoodType {
    static var allTypes: [MoodType] { [.ansiedade, .tedio, .euforia, .tristeza, .calmaria] }
}
