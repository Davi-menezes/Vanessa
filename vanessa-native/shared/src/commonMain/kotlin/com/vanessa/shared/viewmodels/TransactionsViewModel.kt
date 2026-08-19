package com.vanessa.shared.viewmodels

import com.vanessa.shared.SharedApp
import com.vanessa.shared.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TransactionsUiState(
    val list: List<Transaction> = emptyList(),
    val hiddenExpenses: Set<String> = emptySet(),
    val latestMood: Mood? = null,
    val byMood: List<Triple<Mood, Double, Int>> = emptyList()
)

class TransactionsViewModel(private val app: SharedApp) {
    private val _state = MutableStateFlow(snapshot())
    val state: StateFlow<TransactionsUiState> = _state.asStateFlow()

    fun refresh() { _state.value = snapshot() }

    private fun snapshot(): TransactionsUiState {
        val store = app.store
        val txs = store.transactions()
        val by = mutableMapOf<Mood, Pair<Double, Int>>()
        txs.filter { it.type == TxType.SAIDA && it.mood != null }.forEach {
            val (acc, n) = by[it.mood!!] ?: (0.0 to 0)
            by[it.mood!!] = (acc + it.value) to (n + 1)
        }
        return TransactionsUiState(
            list = txs,
            hiddenExpenses = txs.filter { store.isExpenseHidden(it.id) }.map { it.id }.toSet(),
            latestMood = store.latestMood()?.mood,
            byMood = by.entries.map { Triple(it.key, it.value.first, it.value.second) }
        )
    }

    fun add(
        value: Double,
        category: Category,
        type: TxType,
        paymentMethod: PaymentMethod,
        description: String,
        exclude: Boolean
    ) {
        val mood = app.store.latestMood()?.mood
        val mid = app.store.latestMood()?.id
        app.store.addTransaction(
            Transaction(
                id = "",
                value = value,
                category = category,
                type = type,
                paymentMethod = paymentMethod,
                description = description,
                moodId = mid,
                mood = mood,
                timestampMs = app.store.nowMs(),
                sleeping = false,
                sleepUntilMs = null,
                excludeFromSavingsAdvice = exclude
            )
        )
        refresh()
    }

    fun add(items: List<Triple<Double, String, String>>) {
        val mood = app.store.latestMood()?.mood
        val mid = app.store.latestMood()?.id
        items.forEach { (v, cat, desc) ->
            val c = runCatching { Category.valueOf(cat.uppercase()) }.getOrDefault(Category.OUTROS)
            app.store.addTransaction(
                Transaction(
                    id = "",
                    value = v,
                    category = c,
                    type = TxType.SAIDA,
                    paymentMethod = PaymentMethod.CONTA_CORRENTE,
                    description = desc,
                    moodId = mid,
                    mood = mood,
                    timestampMs = app.store.nowMs(),
                    sleeping = false,
                    sleepUntilMs = null,
                    excludeFromSavingsAdvice = false
                )
            )
        }
        refresh()
    }

    fun delete(id: String) { app.store.deleteTransaction(id); refresh() }
    fun hideExpense(id: String) { app.store.hideExpensesNotification(id); refresh() }
    fun clearAll() { app.store.clearTransactions(); refresh() }
}
