package com.vanessa.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vanessa.core.domain.MoodType
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.core.ui.colorHex
import com.vanessa.core.ui.formatBRL
import com.vanessa.di.AppContainer
import com.vanessa.feature.audio.AudioCapture
import com.vanessa.feature.home.HomeViewModel

@Composable
fun HomeScreen(
    container: AppContainer,
    onOpenMoodCheckin: () -> Unit,
    onLogout: () -> Unit
) {
    val state by container.homeVm.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var showAudio by remember { mutableStateOf(false) }
    var audioStatus by remember { mutableStateOf<String?>(null) }

    Column(
        Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Olá, ${state.name}", color = Color(ThemeTokens.palette.textPrimary),
                style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.weight(1f))
            IconButton(onClick = { onOpenMoodCheckin() }) {
                Text(state.mood?.let { "🙂" } ?: "💭",
                    color = Color(state.mood?.colorHex() ?: ThemeTokens.palette.lavender),
                    style = MaterialTheme.typography.titleMedium)
            }
            IconButton(onClick = onLogout) { Text("⎋", color = Color(ThemeTokens.palette.danger)) }
        }
        Spacer(Modifier.height(16.dp))

        BalanceCard(state.monthlyIncome, state.monthlyExpense)

        Spacer(Modifier.height(16.dp))

        if (state.happinessNote != null) {
            Surface(
                color = Color(ThemeTokens.palette.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Invista em você", color = Color(ThemeTokens.palette.lavender),
                        fontWeight = FontWeight.SemiBold)
                    Text(state.happinessNote!!, color = Color(ThemeTokens.palette.textPrimary))
                }
            }
            Spacer(Modifier.height(12.dp))
        }

        state.sleepingWakeUp.forEach { tx ->
            Surface(
                color = Color(ThemeTokens.palette.warning),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Acordou uma transação suspensa (dormida):",
                        color = Color.Black, fontWeight = FontWeight.SemiBold)
                    Text("${formatBRL(tx.value)} - ${tx.category.name} - ${tx.description}", color = Color.Black)
                }
            }
            Spacer(Modifier.height(8.dp))
        }

        Text("Diário", color = Color(ThemeTokens.palette.textSecondary))
        state.recent.take(5).forEach { tx ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(ThemeTokens.palette.surface))
                    .padding(12.dp)
            ) {
                Column(Modifier.weight(1f)) {
                    Text(tx.description, color = Color(ThemeTokens.palette.textPrimary))
                    Text(tx.category.label, color = Color(ThemeTokens.palette.textSecondary),
                        style = MaterialTheme.typography.bodySmall)
                }
                Text(
                    (if (tx.type.name == "SAIDA") "- " else "+ ") + formatBRL(tx.value),
                    color = Color(if (tx.type.name == "SAIDA") ThemeTokens.palette.danger else ThemeTokens.palette.success),
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(Modifier.weight(1f))
        Box(
            Modifier
                .fillMaxWidth()
                .padding(16.dp),
            contentAlignment = Alignment.CenterEnd
        ) {
            FloatingActionButton(
                onClick = {
                    if (showAudio) {
                        stopCapture(container, scope) { audioStatus = it }
                        showAudio = !showAudio
                    } else {
                        container.audioCapture.startRecording()
                        showAudio = !showAudio
                    }
                },
                containerColor = Color(ThemeTokens.palette.lavender)
            ) {
                Text(if (showAudio) "■" else "🎙")
            }
        }
        audioStatus?.let {
            Text(it, color = Color(ThemeTokens.palette.textSecondary))
        }
    }
}

private fun stopCapture(container: AppContainer, scope: kotlinx.coroutines.CoroutineScope, status: (String?) -> Unit) {
    val pcm = container.audioCapture.stopRecording()
    val text = container.audioCapture.transcribe16khzPcm(pcm ?: ShortArray(0))
    val stub = "gastei 35 reais em almoco"
    val extracted = container.audioCapture.parseTransactionFromText(stub)
    if (extracted != null) {
        scope.launch {
            container.graph.transactions.addTransaction(
                value = extracted.value,
                category = com.vanessa.core.domain.TransactionCategory.valueOf(extracted.category),
                type = com.vanessa.core.domain.TransactionType.SAIDA,
                paymentMethod = com.vanessa.core.domain.PaymentMethod.CONTA_CORRENTE,
                description = extracted.description,
                moodEntry = container.graph.mood.latest.value
            )
        }
        status("Transação adicionada: ${extracted.description}")
    } else {
        status(null)
    }
}

@Composable
private fun BalanceCard(income: Double, expense: Double) {
    val balance = income - expense
    Box(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(ThemeTokens.palette.surfaceElevated))
            .padding(20.dp)
    ) {
        Column {
            Text("Saldo deste mês",
                color = Color(ThemeTokens.palette.textSecondary))
            Text(formatBRL(balance),
                color = Color(if (balance >= 0) ThemeTokens.palette.success else ThemeTokens.palette.danger),
                style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Row {
                Column(Modifier.weight(1f)) {
                    Text("Receitas", color = Color(ThemeTokens.palette.textSecondary))
                    Text(formatBRL(income), color = Color(ThemeTokens.palette.success),
                        fontWeight = FontWeight.SemiBold)
                }
                Column(Modifier.weight(1f)) {
                    Text("Despesas", color = Color(ThemeTokens.palette.textSecondary))
                    Text(formatBRL(expense), color = Color(ThemeTokens.palette.danger),
                        fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
