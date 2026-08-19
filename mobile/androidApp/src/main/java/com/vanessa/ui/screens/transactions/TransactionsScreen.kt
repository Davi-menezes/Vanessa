package com.vanessa.ui.screens.transactions

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vanessa.core.domain.PaymentMethod
import com.vanessa.core.domain.Transaction
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.core.ui.formatBRL
import com.vanessa.di.AppContainer

@Composable
fun TransactionsScreen(container: AppContainer) {
    val state by container.transactionsVm.state.collectAsStateWithLifecycle()
    var showAdd by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(16.dp)
    ) {
        Column(Modifier.fillMaxSize()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Transações", color = Color(ThemeTokens.palette.textPrimary),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.weight(1f))
                FilledTonalButton(onClick = {
                    scope.launch { container.transactionsVm.clearAll(scope) }
                }) { Text("Limpar") }
                Spacer(Modifier.width(8.dp))
                Button(onClick = { showAdd = true }) { Text("+ Adicionar") }
            }
            Spacer(Modifier.height(16.dp))

            if (state.list.isEmpty()) {
                Box(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Nenhuma transação ainda. Que calma!",
                        color = Color(ThemeTokens.palette.textSecondary))
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.list, key = { it.id }) { tx ->
                        TransactionRow(
                            tx = tx,
                            hidden = state.hiddenExpenses.contains(tx.id),
                            onDelete = { container.transactionsVm.delete(tx.id, scope) },
                            onHide = { container.transactionsVm.hideExpenses(tx.id, scope) }
                        )
                    }
                }
            }
        }

        if (showAdd) {
            AddTransactionDialog(
                onDismiss = { showAdd = false },
                onConfirm = { value, cat, type, method, desc, exclude ->
                    container.transactionsVm.add(value, cat, type, method, desc, exclude, scope)
                    showAdd = false
                }
            )
        }
    }
}

@Composable
private fun TransactionRow(
    tx: Transaction,
    hidden: Boolean,
    onDelete: () -> Unit,
    onHide: () -> Unit
) {
    Surface(
        color = Color(ThemeTokens.palette.surface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.weight(1f)) {
                Text(tx.description, color = Color(ThemeTokens.palette.textPrimary))
                Text(
                    tx.category.label + " · " + (if (tx.type == TransactionType.ENTRADA) "Receita" else "Despesa"),
                    color = Color(ThemeTokens.palette.textSecondary),
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Text(
                (if (tx.type == TransactionType.ENTRADA) "+ " else "- ") + formatBRL(tx.value),
                color = Color(if (tx.type == TransactionType.ENTRADA) ThemeTokens.palette.success else ThemeTokens.palette.danger),
                fontWeight = FontWeight.SemiBold
            )
            Spacer(Modifier.width(8.dp))
            IconButton(onClick = onHide) { Text(if (hidden) "👁" else "📵",
                color = Color(ThemeTokens.palette.textSecondary)) }
            IconButton(onClick = onDelete) { Text("🗑", color = Color(ThemeTokens.palette.danger)) }
        }
    }
}

@Composable
private fun AddTransactionDialog(
    onDismiss: () -> Unit,
    onConfirm: (Double, TransactionCategory, TransactionType, PaymentMethod, String, Boolean) -> Unit
) {
    var value by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf(TransactionCategory.OUTROS) }
    var type by remember { mutableStateOf(TransactionType.SAIDA) }
    var method by remember { mutableStateOf(PaymentMethod.CONTA_CORRENTE) }
    var exclude by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = {
                onConfirm(value.replace(',', '.').toDoubleOrNull() ?: 0.0, category, type, method, description, exclude)
            }) { Text("Salvar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } },
        title = { Text("Nova transação") },
        text = {
            Column {
                OutlinedTextField(value = value, onValueChange = { value = it },
                    label = { Text("Valor") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = description, onValueChange = { description = it },
                    label = { Text("Descrição") },
                    singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                Text("Categoria", color = Color(ThemeTokens.palette.textSecondary))
                var expandedCat by remember { mutableStateOf(false) }
                Box {
                    AssistChip(onClick = { expandedCat = !expandedCat },
                        label = { Text(category.label) })
                    DropdownMenu(expanded = expandedCat, onDismissRequest = { expandedCat = false }) {
                        TransactionCategory.entries.forEach { c ->
                            DropdownMenuItem(text = { Text(c.label) },
                                onClick = { category = c; expandedCat = false })
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Row {
                    FilterChip(selected = type == TransactionType.SAIDA,
                        onClick = { type = TransactionType.SAIDA }, label = { Text("Despesa") })
                    Spacer(Modifier.width(8.dp))
                    FilterChip(selected = type == TransactionType.ENTRADA,
                        onClick = { type = TransactionType.ENTRADA }, label = { Text("Receita") })
                }
                Spacer(Modifier.height(8.dp))
                Row {
                    FilterChip(selected = method == PaymentMethod.CONTA_CORRENTE,
                        onClick = { method = PaymentMethod.CONTA_CORRENTE },
                        label = { Text("Conta") })
                    Spacer(Modifier.width(8.dp))
                    FilterChip(selected = method == PaymentMethod.CREDITO,
                        onClick = { method = PaymentMethod.CREDITO },
                        label = { Text("Crédito") })
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Switch(checked = exclude, onCheckedChange = { exclude = it })
                    Spacer(Modifier.width(8.dp))
                    Text("Não incluir em conselhos", color = Color(ThemeTokens.palette.textSecondary))
                }
            }
        }
    )
}
