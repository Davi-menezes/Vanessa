package com.vanessa.shared.viewmodels

import com.vanessa.shared.domain.*
import com.vanessa.shared.SharedApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AuthUiState(
    val loading: Boolean = false,
    val errorMessage: String? = null,
    val authed: Boolean = false
)

class AuthViewModel(private val app: SharedApp) {
    private val _state = MutableStateFlow(AuthUiState(authed = app.store.currentUser() != null))
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun signup(name: String, email: String, password: String) {
        val r = app.store.signup(name, email, password)
        _state.value = if (r.success) AuthUiState(authed = true)
        else AuthUiState(errorMessage = r.errorMessage)
    }

    fun login(email: String, password: String) {
        val r = app.store.login(email, password)
        _state.value = if (r.success) AuthUiState(authed = true)
        else AuthUiState(errorMessage = r.errorMessage)
    }

    fun logout() {
        app.store.logout()
        _state.value = AuthUiState(authed = false)
    }
}
