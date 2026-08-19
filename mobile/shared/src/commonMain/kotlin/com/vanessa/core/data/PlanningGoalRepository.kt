package com.vanessa.core.data

import com.vanessa.core.domain.PlanningGoal
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

class PlanningGoalRepository(private val db: VanessaDatabase) {
    private val _items = MutableStateFlow<List<PlanningGoal>>(emptyList())
    val items = _items.asStateFlow()

    init { refresh() }

    fun refresh() {
        _items.value = db.planningGoalQueries.selectAll().executeAsList().map {
            PlanningGoal(it.id, it.title, it.type, it.targetAmount, it.targetMonths, Instant.fromEpochMilliseconds(it.createdAtEpoch))
        }
    }

    fun add(title: String, type: String, target: Double, months: Int): PlanningGoal {
        val now = Clock.System.now()
        val goal = PlanningGoal(VanessaRepository.newId(), title, type, target, months, now)
        db.planningGoalQueries.insert(goal.id, goal.title, goal.type, goal.targetAmount, goal.targetMonths, now.toEpochMilliseconds())
        refresh()
        return goal
    }

    fun delete(id: String) {
        db.planningGoalQueries.delete(id)
        refresh()
    }
}
