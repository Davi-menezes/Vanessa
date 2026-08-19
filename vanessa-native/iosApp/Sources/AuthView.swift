import SwiftUI
import shared

struct AuthView: View {
    @ObservedObject var store: mdmrStore
    let onBack: () -> Void
    let onLogin: () -> Void

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isSignup = true
    @State private var errorMsg: String? = nil

    var body: some View {
        ZStack {
            appBg().ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    HStack {
                        Button(action: onBack) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .light))
                                .foregroundColor(textSecondary())
                        }
                        Spacer()
                    }
                    .padding(.top, 8)

                    Text(isSignup ? "Criar conta" : "Entrar")
                        .font(.system(size: 28, weight: .light))
                        .foregroundColor(Color.white)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    VStack(spacing: 16) {
                        if isSignup {
                            TextField("Nome", text: $name)
                                .foregroundColor(Color.white)
                                .padding(16)
                                .background(cardElevatedBg())
                                .cornerRadius(12)
                                .autocapitalization(.words)
                        }
                        TextField("Email", text: $email)
                            .foregroundColor(Color.white)
                            .padding(16)
                            .background(cardElevatedBg())
                            .cornerRadius(12)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                        SecureField("Senha", text: $password)
                            .foregroundColor(Color.white)
                            .padding(16)
                            .background(cardElevatedBg())
                            .cornerRadius(12)

                        Button(action: doAuth) {
                            Text(isSignup ? "Criar conta" : "Entrar")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color.black)
                                .frame(maxWidth: .infinity, minHeight: 52)
                                .background(Color.white)
                                .cornerRadius(14)
                        }

                        Button(action: { isSignup.toggle(); errorMsg = nil }) {
                            Text(isSignup ? "Já tenho conta" : "Criar conta")
                                .font(.system(size: 14, weight: .light))
                                .foregroundColor(textSecondary())
                        }
                    }

                    if let err = errorMsg {
                        Text(err)
                            .font(.system(size: 13, weight: .light))
                            .foregroundColor(dangerColor())
                            .multilineTextAlignment(.center)
                    }
                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 28)
            }
        }
    }

    private func doAuth() {
        errorMsg = nil
        let emailTrimmed = email.trimmingCharacters(in: .whitespaces).lowercased()
        let passTrimmed = password.trimmingCharacters(in: .whitespaces)
        guard !emailTrimmed.isEmpty, !passTrimmed.isEmpty else {
            errorMsg = "Preencha todos os campos."
            return
        }
        let result: shared.AuthResult?
        if isSignup {
            let nameTrimmed = name.trimmingCharacters(in: .whitespaces)
            guard !nameTrimmed.isEmpty else { errorMsg = "Informe seu nome."; return }
            result = store.signup(name: nameTrimmed, email: emailTrimmed, password: passTrimmed)
        } else {
            result = store.login(email: emailTrimmed, password: passTrimmed)
        }
        if result?.success == true {
            onLogin()
        } else {
            errorMsg = result?.errorMessage ?? "Erro ao autenticar."
        }
    }
}
