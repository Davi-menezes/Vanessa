package com.vanessa.feature.home

import com.vanessa.core.data.AppGraph
import com.vanessa.core.domain.MoodType
import com.vanessa.core.domain.Transaction
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class HomeUiState(
    val name: String = "",
    val mood: MoodType? = null,
    val monthlyIncome: Double = 0.0,
    val monthlyExpense: Double = 0.0,
    val recent: List<Transaction> = emptyList(),
    val sleepingWakeUp: List<Transaction> = emptyList(),
    val happinessNote: String? = null
)

class HomeViewModel(private val graph: AppGraph) : StateHolder<HomeUiState>(HomeUiState()) {

    init {
        observe()
    }

    private fun observe() {
        graph.scope.launch {
            combine(
                graph.auth.currentUser,
                graph.mood.latest,
                graph.transactions.transactions
            ) { user, mood, txs ->
                val tz = kotlinx.datetime.TimeZone.currentSystemDefault()
                val now = kotlinx.datetime.Clock.System.now().toLocalDateTime(tz)
                val income = txs.filter {
                    it.type == TransactionType.ENTRADA &&
                            !it.sleeping &&
                            it.timestamp.toLocalDateTime(tz).monthNumber == now.monthNumber &&
                            it.timestamp.toLocalDateTime(tz).year == now.year
                }.sumOf { it.value }
                val expense = txs.filter {
                    it.type == TransactionType.SAIDA &&
                            !it.sleeping &&
                            it.timestamp.toLocalDateTime(tz).monthNumber == now.monthNumber &&
                            it.timestamp.toLocalDateTime(tz).year == now.year
                }.sumOf { it.value }
                val awake = txs.filter {
                    it.sleeping && it.sleepUntil != null &&
                            it.sleepUntil.toEpochMilliseconds() <= kotlinx.datetime.Clock.System.now().toEpochMilliseconds()
                }
                val goals = graph.transactions.happinessGoals()
                HomeUiState(
                    name = user?.name.orEmpty(),
                    mood = mood?.mood,
                    monthlyIncome = income,
                    monthlyExpense = expense,
                    recent = txs.take(5),
                    sleepingWakeUp = awake,
                    happinessNote = goals.firstOrNull()?.second
                )
            }.collect { setState { it } }
        }
    }
}
