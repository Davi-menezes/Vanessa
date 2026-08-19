package com.vanessa.feature.transactions

import com.vanessa.core.data.AppGraph
import com.vanessa.core.domain.MoodEntry
import com.vanessa.core.domain.PaymentMethod
import com.vanessa.core.domain.Transaction
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class TransactionsUiState(
    val list: List<Transaction> = emptyList(),
    val hiddenHome: Set<String> = emptySet(),
    val hiddenExpenses: Set<String> = emptySet(),
    val latestMood: MoodEntry? = null,
    val moodByMood: List<Triple<com.vanessa.core.domain.MoodType, Double, Int>> = emptyList()
)

class TransactionsViewModel(private val graph: AppGraph) : StateHolder<TransactionsUiState>(TransactionsUiState()) {
    init { observe() }

    private fun observe() {
        graph.scope.launch {
            combine(
                graph.transactions.transactions,
                graph.transactions.hiddenHomeFlow,
                graph.transactions.hiddenExpensesFlow,
                graph.mood.latest
            ) { list, hh, he, latest ->
                TransactionsUiState(
                    list = list,
                    hiddenHome = hh,
                    hiddenExpenses = he,
                    latestMood = latest,
                    moodByMood = graph.transactions.spendingByMood()
                )
            }.collect { setState { it } }
        }
    }

    suspend fun latestMoodSnapshot(): MoodEntry? = graph.mood.latest.first()

    fun add(
        value: Double,
        category: TransactionCategory,
        type: TransactionType,
        paymentMethod: PaymentMethod,
        description: String,
        excludeFromSavingsAdvice: Boolean,
        scope: CoroutineScope
    ) {
        scope.launch {
            graph.transactions.addTransaction(
                value = value,
                category = category,
                type = type,
                paymentMethod = paymentMethod,
                description = description,
                moodEntry = graph.mood.latest.first(),
                excludeFromSavingsAdvice = excludeFromSavingsAdvice
            )
        }
    }

    fun delete(id: String, scope: CoroutineScope) {
        scope.launch { graph.transactions.deleteTransaction(id) }
    }

    fun clearAll(scope: CoroutineScope) {
        scope.launch { graph.transactions.clearAll() }
    }

    fun hideHome(id: String, scope: CoroutineScope) {
        scope.launch { graph.transactions.hideHomeNotification(id) }
    }

    fun hideExpenses(id: String, scope: CoroutineScope) {
        scope.launch { graph.transactions.hideExpensesNotification(id) }
    }
}
