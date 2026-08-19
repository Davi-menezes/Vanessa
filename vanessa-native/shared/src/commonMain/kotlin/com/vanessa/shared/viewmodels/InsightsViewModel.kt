package com.vanessa.shared.viewmodels

import com.vanessa.shared.SharedApp
import com.vanessa.shared.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.floor

data class InsightsUiState(
    val byMood: List<Triple<Mood, Double, Int>> = emptyList(),
    val byCategory: List<Pair<Category, Double>> = emptyList(),
    val goals: List<Triple<Category, String, Int>> = emptyList()
)

class InsightsViewModel(private val app: SharedApp) {
    private val _state = MutableStateFlow(snapshot())
    val state: StateFlow<InsightsUiState> = _state.asStateFlow()

    fun refresh() { _state.value = snapshot() }

    private fun snapshot(): InsightsUiState {
        val store = app.store
        val txs = store.transactions()
        val by = mutableMapOf<Mood, Pair<Double, Int>>()
        txs.filter { it.type == TxType.SAIDA && it.mood != null }.forEach {
            val (acc, n) = by[it.mood!!] ?: (0.0 to 0)
            by[it.mood!!] = (acc + it.value) to (n + 1)
        }

        val byCat = txs
            .filter { it.type == TxType.SAIDA && store.sameMonthNow(it.timestampMs) }
            .groupBy { it.category }
            .map { it.key to it.value.sumOf { tx -> tx.value } }

        val nowMs = store.nowMs()
        val goals = listOf(Category.LAZER, Category.SAUDE, Category.EDUCACAO).map { cat ->
            val catTxs = txs.filter { it.category == cat && it.type == TxType.SAIDA }
            if (catTxs.isEmpty()) {
                Triple(cat, "Voce nao gasta com ${cat.label} ha muito tempo. Que tal investir em voce?", 30)
            } else {
                val last = catTxs.maxBy { it.timestampMs }
                val days = floor((nowMs - last.timestampMs) / 86_400_000.0).toInt()
                if (days >= 15) Triple(cat, "Voce nao gasta com ${cat.label} ha $days dias. Que tal investir em voce?", days)
                else Triple(cat, "", -1)
            }
        }.filter { it.third != -1 }

        return InsightsUiState(
            byMood = by.entries.map { Triple(it.key, it.value.first, it.value.second) },
            byCategory = byCat,
            goals = goals
        )
    }
}
