package com.vanessa.ui.screens.planning

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.core.ui.formatBRL
import com.vanessa.di.AppContainer

@Composable
fun PlanningScreen(container: AppContainer) {
    val state by container.planningVm.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var addingPiggy by remember { mutableStateOf(false) }
    var addingGoal by remember { mutableStateOf(false) }
    var addingFixed by remember { mutableStateOf(false) }

    LazyColumn(
        Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(16.dp)
    ) {
        item {
            Text("Planejamento",
                color = Color(ThemeTokens.palette.textPrimary),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            Surface(color = Color(ThemeTokens.palette.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Text("Receita do mês",
                        color = Color(ThemeTokens.palette.textSecondary))
                    Text(formatBRL(state.monthlyIncome),
                        color = Color(ThemeTokens.palette.success),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold)
                    if (state.reminders.overdue.isNotEmpty()) {
                        Text("${state.reminders.overdue.size} vencidos",
                            color = Color(ThemeTokens.palette.danger),
                            fontWeight = FontWeight.SemiBold)
                    }
                    if (state.reminders.dueToday.isNotEmpty()) {
                        Text("${state.reminders.dueToday.size} vencendo hoje",
                            color = Color(ThemeTokens.palette.warning))
                    }
                }
            }
        }
        item {
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Cofrinhos", color = Color(ThemeTokens.palette.textSecondary))
                Spacer(Modifier.weight(1f))
                OutlinedButton(onClick = { addingPiggy = true }) { Text("+ Novo") }
            }
        }
        items(state.piggy, key = { it.id }) { pb ->
            Surface(
                color = Color(ThemeTokens.palette.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(pb.name, color = Color(ThemeTokens.palette.textPrimary),
                        fontWeight = FontWeight.SemiBold)
                    Text("${formatBRL(pb.savedAmount)} de ${formatBRL(pb.target)}",
                        color = Color(ThemeTokens.palette.textSecondary))
                    Spacer(Modifier.height(8.dp))
                    val pct = if (pb.targetAmount > 0) (pb.savedAmount / pb.targetAmount).coerceIn(0.0, 1.0) else 0.0
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(ThemeTokens.palette.surfaceElevated))
                    ) {
                        Box(
                            Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(pct.toFloat())
                                .background(Color(ThemeTokens.palette.lavender))
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Row {
                        OutlinedButton(onClick = {
                            container.planningVm.deposit(pb.id, 50.0)
                        }) { Text("+R$50") }
                        Spacer(Modifier.width(8.dp))
                        TextButton(onClick = { container.planningVm.removePiggy(pb.id) }) {
                            Text("Excluir", color = Color(ThemeTokens.palette.danger))
                        }
                    }
                }
            }
        }
        item {
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Metas", color = Color(ThemeTokens.palette.textSecondary))
                Spacer(Modifier.weight(1f))
                OutlinedButton(onClick = { addingGoal = true }) { Text("+ Nova") }
            }
        }
        items(state.goals, key = { it.id }) { gl ->
            Surface(
                color = Color(ThemeTokens.palette.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(gl.title, color = Color(ThemeTokens.palette.textPrimary))
                        Text("${formatBRL(gl.targetAmount)} em ${gl.targetMonths} meses",
                            color = Color(ThemeTokens.palette.textSecondary))
                    }
                    IconButton(onClick = { container.planningVm.removeGoal(gl.id) }) {
                        Text("🗑", color = Color(ThemeTokens.palette.danger))
                    }
                }
            }
        }
        item {
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Gastos fixos", color = Color(ThemeTokens.palette.textSecondary))
                Spacer(Modifier.weight(1f))
                OutlinedButton(onClick = { addingFixed = true }) { Text("+ Novo") }
            }
        }
        items(state.fixed, key = { it.id }) { fc ->
            Surface(
                color = Color(ThemeTokens.palette.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(fc.name, color = Color(ThemeTokens.palette.textPrimary))
                        Text("${formatBRL(fc.amount)} dia ${fc.dueDay}",
                            color = Color(ThemeTokens.palette.textSecondary))
                    }
                    TextButton(onClick = { container.planningVm.markFixedPaid(fc.id) }) {
                        Text("Pagar")
                    }
                    IconButton(onClick = { container.planningVm.removeFixed(fc.id) }) {
                        Text("🗑", color = Color(ThemeTokens.palette.danger))
                    }
                }
            }
        }
        item { Spacer(Modifier.height(80.dp)) }
    }

    if (addingPiggy) TextInputDialog("Novo cofrinho", { name -> }) { addingPiggy = false }
    if (addingGoal) TextInputDialog("Nova meta", { name -> }) { addingGoal = false }
    if (addingFixed) TextInputDialog("Novo gasto fixo", { name -> }) { addingFixed = false }
}

@Composable
private fun TextInputDialog(title: String, onConfirm: (String) -> Unit, onDismiss: () -> Unit) {
    var text by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            OutlinedTextField(value = text, onValueChange = { text = it },
                label = { Text("Nome") },
                singleLine = true, modifier = Modifier.fillMaxWidth())
        },
        confirmButton = { Button(onClick = { onConfirm(text); onDismiss() }) { Text("Salvar") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}
