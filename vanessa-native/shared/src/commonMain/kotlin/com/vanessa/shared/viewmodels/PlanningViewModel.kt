package com.vanessa.shared.viewmodels

import com.vanessa.shared.SharedApp
import com.vanessa.shared.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class PlanningUiState(
    val piggy: List<PiggyBank> = emptyList(),
    val goals: List<PlanningGoal> = emptyList(),
    val fixed: List<FixedCost> = emptyList(),
    val monthlyIncome: Double = 0.0,
    val dueSoon: List<Pair<FixedCost, Int>> = emptyList(),
    val dueToday: List<FixedCost> = emptyList(),
    val overdue: List<Pair<FixedCost, Int>> = emptyList()
)

class PlanningViewModel(private val app: SharedApp) {
    private val _state = MutableStateFlow(snapshot())
    val state: StateFlow<PlanningUiState> = _state.asStateFlow()

    fun refresh() { _state.value = snapshot() }

    private fun snapshot(): PlanningUiState {
        val store = app.store
        val txs = store.transactions()
        val nowMs = store.nowMs()
        val income = txs
            .filter { it.type == TxType.ENTRADA && !it.sleeping && store.sameMonthNow(it.timestampMs) }
            .sumOf { it.value }

        val fixed = store.fixedList()
        val monthKeyOfNow = store.currentMonthNow()

        // Compute today's day-of-month given fixed's "days since 1970-01-01 basis".
        // For day-of-month computation, we use the same monthKey math path: derive from nowMs.
        val todayDayOfMonth = dayOfMonth(nowMs)

        val dueSoon = mutableListOf<Pair<FixedCost, Int>>()
        val dueToday = mutableListOf<FixedCost>()
        val overdue = mutableListOf<Pair<FixedCost, Int>>()
        fixed.forEach { f ->
            if (f.paidMonths[monthKeyOfNow] == true) return@forEach
            val delta = f.dueDay - todayDayOfMonth
            when {
                delta == 0 -> dueToday += f
                delta < 0 -> overdue += f to -delta
                delta in 1..3 -> dueSoon += f to delta
            }
        }

        return PlanningUiState(
            piggy = store.piggyList(),
            goals = store.planningList(),
            fixed = fixed,
            monthlyIncome = income,
            dueSoon = dueSoon,
            dueToday = dueToday,
            overdue = overdue
        )
    }

    fun addPiggy(name: String, saved: Double, target: Double) {
        app.store.addPiggy(name, saved, target); refresh()
    }
    fun depositPiggy(id: String, delta: Double) {
        app.store.depositPiggy(id, delta); refresh()
    }
    fun removePiggy(id: String) {
        app.store.removePiggy(id); refresh()
    }

    fun addGoal(title: String, type: String, target: Double, months: Int) {
        app.store.addPlanning(title, type, target, months); refresh()
    }
    fun removeGoal(id: String) { app.store.removePlanning(id); refresh() }

    fun addFixed(name: String, amount: Double, dueDay: Int, category: String) {
        app.store.addFixed(name, amount, dueDay, category); refresh()
    }
    fun removeFixed(id: String) { app.store.removeFixed(id); refresh() }
    fun markFixedPaid(id: String) { app.store.markFixedPaid(id); refresh() }

    /** Returns 1..31 — day of month for the given timestamp UTC. */
    private fun dayOfMonth(ts: Long): Int {
        val secs = ts / 1000L
        val days = secs / 86400L
        var year = 1970L
        var remaining = days
        while (true) {
            val leap = (year % 4 == 0L && year % 100 != 0L) || year % 400 == 0L
            val yearDays = if (leap) 366L else 365L
            if (remaining < yearDays) break
            remaining -= yearDays
            year++
        }
        val monthDays = arrayOf(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
        val leap = (year % 4 == 0L && year % 100 != 0L) || year % 400 == 0L
        if (leap) monthDays[1] = 29
        var m = 0
        var r = remaining
        while (m < 12 && r >= monthDays[m]) {
            r -= monthDays[m]
            m++
        }
        return (r + 1).toInt()
    }
}
