package com.vanessa.core.data

import com.vanessa.core.domain.BudgetSettings
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class BudgetRepository(private val db: VanessaDatabase) {
    private val _state = MutableStateFlow<BudgetSettings?>(null)
    val state = _state.asStateFlow()

    init { refresh() }

    fun refresh() {
        val row = db.budgetSettingsQueries.selectAll().executeAsOneOrNull()
        _state.value = if (row == null) {
            BudgetSettings(null, emptyMap(), Clock.System.now())
        } else {
            val limits: Map<TransactionCategory, Double> = runCatching {
                val raw: Map<String, Double> = Json.decodeFromString(row.categoryLimitsJson)
                raw.mapNotNull { (k, v) -> runCatching { TransactionCategory.valueOf(k) to v }.getOrNull() }
                    .toMap()
            }.getOrDefault(emptyMap())
            BudgetSettings(row.monthlyLimit, limits, Instant.fromEpochMilliseconds(row.updatedAtEpoch))
        }
    }

    fun setMonthlyLimit(limit: Double?) {
        val current = _state.value ?: BudgetSettings(null, emptyMap(), Clock.System.now())
        val next = current.copy(monthlyLimit = limit, updatedAt = Clock.System.now())
        persist(next)
    }

    fun setCategoryLimit(category: TransactionCategory, limit: Double) {
        val current = _state.value ?: BudgetSettings(null, emptyMap(), Clock.System.now())
        val next = current.copy(
            categoryLimits = current.categoryLimits + (category to limit),
            updatedAt = Clock.System.now()
        )
        persist(next)
    }

    fun removeCategoryLimit(category: TransactionCategory) {
        val current = _state.value ?: return
        val next = current.copy(
            categoryLimits = current.categoryLimits - category,
            updatedAt = Clock.System.now()
        )
        persist(next)
    }

    private fun persist(next: BudgetSettings) {
        val json = runCatching {
            Json.encodeToString(next.categoryLimits.mapKeys { it.key.name }.mapValues { it.value })
        }.getOrDefault("{}")
        db.budgetSettingsQueries.upsert(next.monthlyLimit, json, next.updatedAt.toEpochMilliseconds())
        _state.value = next
    }
}
