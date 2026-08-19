package com.vanessa.shared.viewmodels

import com.vanessa.shared.SharedApp
import com.vanessa.shared.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.floor

data class HomeUiState(
    val userName: String = "",
    val mood: Mood? = null,
    val monthlyIncome: Double = 0.0,
    val monthlyExpense: Double = 0.0,
    val recent: List<Transaction> = emptyList(),
    val sleepingWakeUp: List<Transaction> = emptyList(),
    val happinessNote: String? = null,
    val showMoodCheckin: Boolean = false
)

class HomeViewModel(private val app: SharedApp) {
    private val _state = MutableStateFlow(snapshot())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    fun refresh() { _state.value = snapshot() }

    private fun snapshot(): HomeUiState {
        val store = app.store
        val nowMs = store.nowMs()
        val txs = store.transactions()
        val filtered = txs.filter { !it.sleeping && store.sameMonthNow(it.timestampMs) }
        val income = filtered.filter { it.type == TxType.ENTRADA }.sumOf { it.value }
        val expense = filtered.filter { it.type == TxType.SAIDA }.sumOf { it.value }

        val awake = txs.filter { it.sleeping && it.sleepUntilMs != null && it.sleepUntilMs <= nowMs }

        val goals = happinessGoals(nowMs)
        val note = goals.firstOrNull()?.second

        return HomeUiState(
            userName = store.currentUser()?.name.orEmpty(),
            mood = store.latestMood()?.mood,
            monthlyIncome = income,
            monthlyExpense = expense,
            recent = txs.take(5),
            sleepingWakeUp = awake,
            happinessNote = note,
            showMoodCheckin = store.latestMood() == null
        )
    }

    fun pickMood(m: Mood): Boolean {
        app.store.addMood(m)
        refresh()
        return m.isImpulsive
    }

    fun dismissMoodCheckin() {
        _state.value = _state.value.copy(showMoodCheckin = false)
        refresh()
    }

    private fun happinessGoals(nowMs: Long): List<Triple<Category, String, Int>> {
        val transactions = app.store.transactions().filter { it.type == TxType.SAIDA }
        return listOf(Category.LAZER, Category.SAUDE, Category.EDUCACAO).map { cat ->
            val catTxs = transactions.filter { it.category == cat }
            if (catTxs.isEmpty()) {
                Triple(cat, "Voce nao gasta com ${cat.label} ha muito tempo. Que tal investir em voce?", 30)
            } else {
                val last = catTxs.maxBy { it.timestampMs }
                val days = floor((nowMs - last.timestampMs) / 86_400_000.0).toInt()
                if (days >= 15) Triple(cat, "Voce nao gasta com ${cat.label} ha $days dias. Que tal investir em voce?", days)
                else Triple(cat, "", -1)
            }
        }.filter { it.third != -1 }
    }
}
