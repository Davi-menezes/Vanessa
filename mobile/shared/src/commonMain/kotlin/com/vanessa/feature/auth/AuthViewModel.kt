package com.vanessa.feature.auth

import com.vanessa.core.data.AppGraph
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

sealed interface AuthIntent {
    data class Signup(val name: String, val email: String, val password: String) : AuthIntent
    data class Login(val email: String, val password: String) : AuthIntent
    data class ResetPassword(val email: String, val newPassword: String) : AuthIntent
}

data class AuthUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val authed: Boolean = false
)

class AuthViewModel(private val graph: AppGraph) : StateHolder<AuthUiState>(AuthUiState()) {
    fun onIntent(intent: AuthIntent, scope: CoroutineScope) {
        when (intent) {
            is AuthIntent.Signup -> scope.launch {
                setState { it.copy(loading = true, error = null) }
                graph.auth.signup(intent.name, intent.email, intent.password)
                    .onSuccess { setState { it.copy(loading = false, authed = true) } }
                    .onFailure { e -> setState { it.copy(loading = false, error = e.message) } }
            }
            is AuthIntent.Login -> scope.launch {
                setState { it.copy(loading = true, error = null) }
                graph.auth.login(intent.email, intent.password)
                    .onSuccess { setState { it.copy(loading = false, authed = true) } }
                    .onFailure { e -> setState { it.copy(loading = false, error = e.message) } }
            }
            is AuthIntent.ResetPassword -> scope.launch {
                setState { it.copy(loading = true, error = null) }
                graph.auth.resetPassword(intent.email, intent.newPassword)
                    .onSuccess { setState { it.copy(loading = false) } }
                    .onFailure { e -> setState { it.copy(loading = false, error = e.message) } }
            }
        }
    }
}
