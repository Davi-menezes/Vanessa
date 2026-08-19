package com.vanessa.feature.insights

import com.vanessa.core.data.AppGraph
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class InsightsUiState(
    val byMood: List<Triple<com.vanessa.core.domain.MoodType, Double, Int>> = emptyList(),
    val byCategory: List<Pair<TransactionCategory, Double>> = emptyList(),
    val goals: List<Triple<TransactionCategory, String, Int>> = emptyList()
)

class InsightsViewModel(private val graph: AppGraph) : StateHolder<InsightsUiState>(InsightsUiState()) {
    init { observe() }

    private fun observe() {
        graph.scope.launch {
            combine(
                graph.transactions.transactions,
                graph.transactions.hiddenExpensesFlow
            ) { _, _ ->
                InsightsUiState(
                    byMood = graph.transactions.spendingByMood(),
                    byCategory = graph.transactions.currentMonthTotals().third,
                    goals = graph.transactions.happinessGoals()
                )
            }.collect { setState { it } }
        }
    }
}
