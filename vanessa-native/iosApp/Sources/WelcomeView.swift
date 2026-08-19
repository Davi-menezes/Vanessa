import SwiftUI
import shared

struct WelcomeView: View {
    @ObservedObject var store: mdmrStore
    let onNavigate: (AppScreen) -> Void

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            VStack(spacing: 24) {
                Spacer()
                Text("mdmr")
                    .font(.system(size: 42, weight: .ultraLight, design: .default))
                    .foregroundColor(Color.white)
                    .tracking(4)
                Text("seu assistente financeiro")
                    .font(.system(size: 13, weight: .light))
                    .foregroundColor(textSecondary())
                    .tracking(1)
                Spacer()
                VStack(spacing: 14) {
                    Button(action: { onNavigate(.auth) }) {
                        Text("Criar nova conta")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(Color.black)
                            .frame(maxWidth: .infinity, minHeight: 52)
                            .background(Color.white)
                            .cornerRadius(14)
                    }
                    Button(action: { onNavigate(.auth) }) {
                        Text("Já tenho conta")
                            .font(.system(size: 14, weight: .light))
                            .foregroundColor(textSecondary())
                    }
                }
                .padding(.horizontal, 32)
                Spacer().frame(height: 60)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}
