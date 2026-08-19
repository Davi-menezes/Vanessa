package com.vanessa.core.data

import com.vanessa.db.VanessaDatabase
import com.vanessa.runtime.AppRuntime
import com.vanessa.settings.SettingsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

data class AppGraph(
    val auth: VanessaRepository,
    val mood: MoodRepository,
    val transactions: TransactionRepository,
    val piggyBanks: PiggyBankRepository,
    val planning: PlanningGoalRepository,
    val fixedCosts: FixedCostRepository,
    val budget: BudgetRepository,
    val scope: CoroutineScope
) {
    fun refreshAll() {
        mood.refresh()
        transactions.refresh()
        piggyBanks.refresh()
        planning.refresh()
        fixedCosts.refresh()
        budget.refresh()
    }
}

object VanessaGraph {
    fun create(db: VanessaDatabase, settings: SettingsRepository): AppGraph {
        val scope = AppRuntime.scope
        val auth = VanessaRepository(settings)
        val transactions = TransactionRepository(db)
        val piggy = PiggyBankRepository(db)
        val planning = PlanningGoalRepository(db)
        val fixed = FixedCostRepository(db, transactions)
        val mood = MoodRepository(db)
        val budget = BudgetRepository(db)
        scope.launch { auth.restoreSession() }
        return AppGraph(auth, mood, transactions, piggy, planning, fixed, budget, scope)
    }
}

