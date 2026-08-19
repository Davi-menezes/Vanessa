package com.vanessa.core.data

import com.vanessa.core.domain.FixedCost
import com.vanessa.core.domain.PaymentMethod
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class FixedCostRepository(
    private val db: VanessaDatabase,
    private val txRepo: TransactionRepository
) {
    private val _items = MutableStateFlow<List<FixedCost>>(emptyList())
    val items = _items.asStateFlow()

    init { refresh() }

    fun refresh() {
        _items.value = db.fixedCostQueries.selectAll().executeAsList().map {
            FixedCost(
                it.id, it.name, it.amount, it.dueDay, it.category,
                Instant.fromEpochMilliseconds(it.createdAtEpoch),
                paidMonths = runCatching {
                    Json.decodeFromString<Map<String, Boolean>>(it.paidMonthsJson)
                }.getOrDefault(emptyMap())
            )
        }
    }

    fun add(name: String, amount: Double, dueDay: Int, category: String): FixedCost {
        val now = Clock.System.now()
        val fc = FixedCost(VanessaRepository.newId(), name, amount, dueDay, category, now)
        db.fixedCostQueries.insert(fc.id, fc.name, fc.amount, fc.dueDay, fc.category, now.toEpochMilliseconds(), "{}")
        refresh()
        return fc
    }

    fun delete(id: String) {
        db.fixedCostQueries.delete(id)
        refresh()
    }

    fun markAsPaid(id: String) {
        val fc = _items.value.firstOrNull { it.id == id } ?: return
        val monthKey = monthKeyFor(Clock.System.now())
        if (fc.paidMonths[monthKey] == true) return
        val txCat = when (fc.category) {
            "assinaturas" -> TransactionCategory.OUTROS
            else -> runCatching { TransactionCategory.valueOf(fc.category.uppercase()) }
                .getOrDefault(TransactionCategory.OUTROS)
        }
        txRepo.addTransaction(
            value = fc.amount,
            category = txCat,
            type = TransactionType.SAIDA,
            paymentMethod = PaymentMethod.CONTA_CORRENTE,
            description = "Gasto fixo pago: ${fc.name}",
            moodEntry = null,
            excludeFromSavingsAdvice = false
        )
        val newPaid = fc.paidMonths + (monthKey to true)
        val json = runCatching { Json.encodeToString(newPaid) }.getOrDefault("{}")
        db.fixedCostQueries.update(fc.name, fc.amount, fc.dueDay, fc.category, json)
        refresh()
    }

    fun reminders(): Triple<List<Pair<FixedCost, Int>>, List<FixedCost>, List<Pair<FixedCost, Int>>> {
        val tz = TimeZone.currentSystemDefault()
        val todayDt = Clock.System.now().toLocalDateTime(tz)
        val refDay = todayDt.dayOfMonth
        val items = _items.value
        val dueSoon = mutableListOf<Pair<FixedCost, Int>>()
        val dueToday = mutableListOf<FixedCost>()
        val overdue = mutableListOf<Pair<FixedCost, Int>>()
        val monthKey = monthKeyFor(Clock.System.now())
        for (fc in items) {
            if (fc.paidMonths[monthKey] == true) continue
            val delta = fc.dueDay - refDay
            when {
                delta == 0 -> dueToday += fc
                delta < 0 -> overdue += fc to -delta
                delta in 1..3 -> dueSoon += fc to delta
            }
        }
        return Triple(dueSoon, dueToday, overdue)
    }

    private fun monthKeyFor(now: Instant): String {
        val dt = now.toLocalDateTime(TimeZone.currentSystemDefault())
        return "${dt.year}-${dt.monthNumber.toString().padStart(2, '0')}"
    }
}
