package com.vanessa.feature.planning

import com.vanessa.core.data.AppGraph
import com.vanessa.core.domain.FixedCost
import com.vanessa.core.domain.PiggyBank
import com.vanessa.core.domain.PlanningGoal
import com.vanessa.core.domain.TransactionType
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

data class PlanningUiState(
    val piggy: List<PiggyBank> = emptyList(),
    val goals: List<PlanningGoal> = emptyList(),
    val fixed: List<FixedCost> = emptyList(),
    val monthlyIncome: Double = 0.0,
    val reminders: PlanningReminders = PlanningReminders()
)

data class PlanningReminders(
    val dueSoon: List<Pair<FixedCost, Int>> = emptyList(),
    val dueToday: List<FixedCost> = emptyList(),
    val overdue: List<Pair<FixedCost, Int>> = emptyList()
)

class PlanningViewModel(private val graph: AppGraph) : StateHolder<PlanningUiState>(PlanningUiState()) {
    init { observe() }

    private fun observe() {
        graph.scope.launch {
            combine(
                graph.piggyBanks.items,
                graph.planning.items,
                graph.fixedCosts.items,
                graph.transactions.transactions
            ) { pb, gl, fc, txs ->
                val tz = kotlinx.datetime.TimeZone.currentSystemDefault()
                val now = kotlinx.datetime.Clock.System.now().toLocalDateTime(tz)
                val income = txs.filter {
                    it.type == TransactionType.ENTRADA &&
                            !it.sleeping &&
                            it.timestamp.toLocalDateTime(tz).monthNumber == now.monthNumber &&
                            it.timestamp.toLocalDateTime(tz).year == now.year
                }.sumOf { it.value }
                val reminders = graph.fixedCosts.reminders()
                PlanningUiState(
                    piggy = pb,
                    goals = gl,
                    fixed = fc,
                    monthlyIncome = income,
                    reminders = PlanningReminders(reminders.first, reminders.second, reminders.third)
                )
            }.collect { setState { it } }
        }
    }

    fun addPiggyBank(name: String, saved: Double, target: Double) {
        graph.piggyBanks.add(name, saved, target)
    }

    fun deposit(id: String, amount: Double) {
        val current = graph.piggyBanks.items.value.firstOrNull { it.id == id } ?: return
        graph.piggyBanks.update(id, current.savedAmount + amount)
    }

    fun removePiggy(id: String) = graph.piggyBanks.delete(id)

    fun addGoal(title: String, type: String, target: Double, months: Int) {
        graph.planning.add(title, type, target, months)
    }

    fun removeGoal(id: String) = graph.planning.delete(id)

    fun addFixed(name: String, amount: Double, dueDay: Int, category: String) {
        graph.fixedCosts.add(name, amount, dueDay, category)
    }

    fun removeFixed(id: String) = graph.fixedCosts.delete(id)

    fun markFixedPaid(id: String) = graph.fixedCosts.markAsPaid(id)
}
