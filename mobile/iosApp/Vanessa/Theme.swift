import Foundation
import SwiftUI
import VanessaShared

struct ThemePalette {
    static let background = Color(red: 0.067, green: 0.071, blue: 0.122)
    static let surface = Color(red: 0.102, green: 0.106, blue: 0.180)
    static let surfaceElevated = Color(red: 0.133, green: 0.141, blue: 0.227)
    static let textPrimary = Color(red: 0.902, green: 0.882, blue: 1.0)
    static let textSecondary = Color(red: 0.604, green: 0.6, blue: 0.71)
    static let lavender = Color(red: 0.612, green: 0.561, blue: 0.91)
    static let success = Color(red: 0.4, green: 0.788, blue: 0.631)
    static let warning = Color(red: 0.878, green: 0.69, blue: 0.361)
    static let danger = Color(red: 0.878, green: 0.459, blue: 0.416)
    static let calm = Color(red: 0.416, green: 0.659, blue: 0.878)
}

extension View {
    func vanessaScreen() -> some View {
        self.background(ThemePalette.background.ignoresSafeArea())
    }
}

extension MoodType {
    var label: String {
        switch self {
        case .ansiedade: return "Ansiedade"
        case .tedio: return "Tédio"
        case .euforia: return "Euforia"
        case .tristeza: return "Tristeza"
        case .calmaria: return "Calmaria"
        }
    }
    var color: Color {
        switch self {
        case .ansiedade: return ThemePalette.warning
        case .tedio: return ThemePalette.textSecondary
        case .euforia: return ThemePalette.lavender
        case .tristeza: return ThemePalette.calm
        case .calmaria: return ThemePalette.success
        }
    }
    var icon: String {
        switch self {
        case .ansiedade: return "🧠"
        case .tedio: return "😐"
        case .euforia: return "✨"
        case .tristeza: return "🌧"
        case .calmaria: return "🍃"
        }
    }
}

extension TransactionCategory {
    var label: String {
        switch self {
        case .alimentacao: return "Alimentação"
        case .transporte: return "Transporte"
        case .combustivel: return "Combustível"
        case .lazer: return "Lazer"
        case .saude: return "Saúde"
        case .educacao: return "Educação"
        case .moradia: return "Moradia"
        case .vestuario: return "Vestuário"
        case .outros: return "Outros"
        }
    }
    var icon: String {
        switch self {
        case .alimentacao: return "🍽"
        case .transporte: return "🚗"
        case .combustivel: return "⛽"
        case .lazer: return "🎬"
        case .saude: return "💊"
        case .educacao: return "📚"
        case .moradia: return "🏠"
        case .vestuario: return "👕"
        case .outros: return "📦"
        }
    }
}

func formatBRL(_ v: Double) -> String {
    let nf = NumberFormatter()
    nf.locale = Locale(identifier: "pt_BR")
    nf.numberStyle = .currency
    return nf.string(from: NSNumber(value: v)) ?? "R$ 0"
}
