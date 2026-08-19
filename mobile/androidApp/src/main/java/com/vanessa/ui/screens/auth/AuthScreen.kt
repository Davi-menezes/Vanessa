package com.vanessa.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.feature.auth.AuthIntent
import com.vanessa.feature.auth.AuthViewModel

@Composable
fun AuthScreen(viewModel: AuthViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var isSignup by remember { mutableStateOf(true) }
    var isReset by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "Vanessa",
            color = Color(ThemeTokens.palette.lavender),
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            "Assistente financeiro comportamental",
            color = Color(ThemeTokens.palette.textSecondary),
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(Modifier.height(24.dp))

        CardContainer {
            if (!isReset) {
                Text(
                    if (isSignup) "Criar conta" else "Entrar",
                    color = Color(ThemeTokens.palette.textPrimary),
                    style = MaterialTheme.typography.titleLarge
                )
                Spacer(Modifier.height(12.dp))
                if (isSignup) {
                    OutlinedTextField(
                        value = name, onValueChange = { name = it },
                        label = { Text("Nome") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                }
                OutlinedTextField(
                    value = email, onValueChange = { email = it },
                    label = { Text("Email") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = password, onValueChange = { password = it },
                    label = { Text("Senha") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = {
                        if (isSignup)
                            viewModel.onIntent(AuthIntent.Signup(name, email, password), scope)
                        else
                            viewModel.onIntent(AuthIntent.Login(email, password), scope)
                    },
                    enabled = !state.loading,
                    modifier = Modifier.fillMaxWidth()
                ) { Text(if (isSignup) "Criar conta" else "Entrar") }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { isSignup = !isSignup }) {
                        Text(if (isSignup) "Já tenho conta" else "Criar conta")
                    }
                    TextButton(onClick = { isReset = true }) { Text("Esqueci a senha") }
                }
            } else {
                Text(
                    "Redefinir senha",
                    color = Color(ThemeTokens.palette.textPrimary),
                    style = MaterialTheme.typography.titleLarge
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(value = email, onValueChange = { email = it },
                    label = { Text("Email") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = password, onValueChange = { password = it },
                    label = { Text("Nova senha") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(16.dp))
                Button(onClick = {
                    viewModel.onIntent(AuthIntent.ResetPassword(email, password), scope)
                    isReset = false
                }, modifier = Modifier.fillMaxWidth()) { Text("Atualizar senha") }
                TextButton(onClick = { isReset = false }) { Text("Voltar") }
            }
        }

        state.error?.let {
            Spacer(Modifier.height(16.dp))
            Text(it, color = Color(ThemeTokens.palette.danger))
        }
    }
}

@Composable
private fun CardContainer(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .background(Color(ThemeTokens.palette.surface), RoundedCornerShape(16.dp))
            .padding(20.dp)
    ) { Column { content() } }
}
