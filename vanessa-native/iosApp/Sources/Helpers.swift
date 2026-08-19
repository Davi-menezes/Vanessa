import SwiftUI
import shared

// MARK: - Formatting
func formatBrl(_ v: Double) -> String {
    let f = NumberFormatter()
    f.numberStyle = .currency
    f.currencySymbol = "R$"
    f.maximumFractionDigits = 2
    f.minimumFractionDigits = 2
    return f.string(from: NSNumber(value: v)) ?? "R$ 0,00"
}

// MARK: - Mood
func moodIcon(_ mood: Mood) -> String {
    switch mood {
    case .ansiedade: return "🧠"
    case .tedio: return "😐"
    case .euforia: return "✨"
    case .tristeza: return "🌧"
    case .calmaria: return "🍃"
    default: return "😐"
    }
}
func moodColor(_ mood: Mood) -> Color {
    switch mood {
    case .ansiedade: return Color(red: 0.85, green: 0.65, blue: 0.40)
    case .tedio: return Color(red: 0.55, green: 0.56, blue: 0.58)
    case .euforia: return Color(red: 0.70, green: 0.65, blue: 0.95)
    case .tristeza: return Color(red: 0.40, green: 0.60, blue: 0.85)
    case .calmaria: return Color(red: 0.40, green: 0.75, blue: 0.60)
    default: return Color(red: 0.55, green: 0.56, blue: 0.58)
    }
}

// MARK: - Dark Minimalist Colors
func appBg() -> Color { Color.black }
func cardBg() -> Color { Color(red: 0.09, green: 0.09, blue: 0.09) }
func cardElevatedBg() -> Color { Color(red: 0.14, green: 0.14, blue: 0.14) }
func lavender() -> Color { Color(red: 0.95, green: 0.95, blue: 0.97) }
func textSecondary() -> Color { Color(red: 0.45, green: 0.45, blue: 0.47) }
func successColor() -> Color { Color(red: 0.30, green: 0.78, blue: 0.55) }
func dangerColor() -> Color { Color(red: 0.85, green: 0.35, blue: 0.35) }
func warningColor() -> Color { Color(red: 0.85, green: 0.65, blue: 0.30) }
func accentColor2() -> Color { Color(red: 0.20, green: 0.60, blue: 0.95) }

// MARK: - View extensions
extension View {
    @ViewBuilder func iflet<V: View>(_ optional: Any?, transform: (Self, Any) -> V) -> some View {
        if let val = optional { transform(self, val) } else { self }
    }
}
