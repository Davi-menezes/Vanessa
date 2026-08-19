import Foundation
import SwiftUI
import VanessaShared
import shared

struct AuthScreen: View {
    @ObservedObject private var vm: KmpViewModel<AuthUiState>
    let kmm: AuthViewModel
    let scope = AppRuntime.shared_kmp

    @State private var isSignup = true
    @State private var isReset = false
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""

    init(kmm: AuthViewModel) {
        self.kmm = kmm
        _vm = ObservedObject(initialValue: KmpViewModel(initial: kmm.snapshot(), poll: { kmm.snapshot() }))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer().frame(height: 80)
            Text("Vanessa").font(.largeTitle).foregroundColor(ThemePalette.lavender)
            Text("Assistente financeiro comportamental")
                .foregroundColor(ThemePalette.textSecondary)

            VStack(spacing: 12) {
                if isReset {
                    sectionTitle("Redefinir senha")
                    TextField("Email", text: $email).textFieldStyle(.roundedBorder)
                    SecureField("Nova senha", text: $password).textFieldStyle(.roundedBorder)
                    Button(action: { submitReset() }) {
                        Text("Atualizar").frame(maxWidth: .infinity)
                    }.buttonStyle(.borderedProminent)
                    Button("Voltar") { isReset = false }
                } else {
                    if isSignup {
                        TextField("Nome", text: $name).textFieldStyle(.roundedBorder)
                    }
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                    SecureField("Senha", text: $password).textFieldStyle(.roundedBorder)
                    Button(action: { submitPrimary() }) {
                        Text(isSignup ? "Criar conta" : "Entrar").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(vm.current.loading)
                    HStack {
                        Button(isSignup ? "Já tenho conta" : "Criar conta") { isSignup.toggle() }
                        Spacer()
                        Button("Esqueci") { isReset = true }
                    }
                    .font(.footnote)
                    .foregroundColor(ThemePalette.textSecondary)
                }
            }
            .padding(20)
            .background(ThemePalette.surface.cornerRadius(20))

            if let err = vm.current.error {
                Text(err).foregroundColor(ThemePalette.danger)
            }
            Spacer()
        }
        .padding(24)
    }

    private func sectionTitle(_ s: String) -> some View {
        Text(s).font(.title3).foregroundColor(ThemePalette.textPrimary)
    }

    private func submitPrimary() {
        if isSignup {
            kmm.onIntent(intent: .signup(name: name, email: email, password: password), scope: scope)
        } else {
            kmm.onIntent(intent: .login(email: email, password: password), scope: scope)
        }
    }
    private func submitReset() {
        kmm.onIntent(intent: .resetPassword(email: email, newPassword: password), scope: scope)
        isReset = false
    }
}
