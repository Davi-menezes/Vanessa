package com.vanessa.core.data

import com.vanessa.core.domain.MoodType
import com.vanessa.core.domain.PaymentMethod
import com.vanessa.core.domain.Transaction
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.db.HiddenNotification
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

class TransactionRepository(private val db: VanessaDatabase) {
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())

    val transactions: Flow<List<Transaction>> = _transactions.asStateFlow()

    private val hiddenHome = MutableStateFlow<Set<String>>(emptySet())
    private val hiddenExpenses = MutableStateFlow<Set<String>>(emptySet())

    val hiddenHomeFlow: Flow<Set<String>> = hiddenHome.asStateFlow()
    val hiddenExpensesFlow: Flow<Set<String>> = hiddenExpenses.asStateFlow()

    init { refresh() }

    fun refresh() {
        _transactions.value = db.transactionQueries.selectAllTransactions().executeAsList().map { it.toDomain() }
        val all = mutableSetOf<String>()
        val exp = mutableSetOf<String>()
        db.hiddenNotificationQueries.selectAllHidden().executeAsList().forEach {
            if (it.scope == "home") all += it.transactionId else exp += it.transactionId
        }
        hiddenHome.value = all
        hiddenExpenses.value = exp
    }

    fun addTransaction(
        value: Double,
        category: TransactionCategory,
        type: TransactionType,
        paymentMethod: PaymentMethod,
        description: String,
        moodEntry: MoodEntry?,
        excludeFromSavingsAdvice: Boolean = false,
        sleeping: Boolean = false,
        sleepUntil: Instant? = null
    ): Transaction {
        val now = Clock.System.now()
        val tx = Transaction(
            id = VanessaRepository.newId(),
            value = value,
            category = category,
            type = type,
            paymentMethod = paymentMethod,
            description = description,
            moodId = moodEntry?.id,
            mood = moodEntry?.mood,
            timestamp = now,
            sleeping = sleeping,
            sleepUntil = sleepUntil,
            excludeFromSavingsAdvice = excludeFromSavingsAdvice
        )
        db.transactionQueries.insertTransaction(
            tx.id, tx.value, tx.category.name, tx.type.name, tx.paymentMethod.name,
            tx.description, tx.moodId, tx.mood?.name, tx.timestamp.toEpochMilliseconds(),
            if (tx.sleeping) 1L else 0L, tx.sleepUntil?.toEpochMilliseconds(),
            if (tx.excludeFromSavingsAdvice) 1L else 0L
        )
        refresh()
        return tx
    }

    fun deleteTransaction(id: String) {
        db.transactionQueries.deleteTransaction(id)
        db.hiddenNotificationQueries.removeHidden(id, "home")
        db.hiddenNotificationQueries.removeHidden(id, "expenses")
        refresh()
    }

    fun clearAll() {
        db.transactionQueries.clearAllTransactions()
        refresh()
    }

    fun hideHomeNotification(id: String) {
        db.hiddenNotificationQueries.addHidden(id, "home")
        refresh()
    }

    fun hideExpensesNotification(id: String) {
        db.hiddenNotificationQueries.addHidden(id, "expenses")
        refresh()
    }

    private fun com.vanessa.db.Transaction.toDomain(): Transaction = Transaction(
        id = id,
        value = value,
        category = TransactionCategory.valueOf(category),
        type = TransactionType.valueOf(type),
        paymentMethod = PaymentMethod.valueOf(paymentMethod),
        description = description,
        moodId = moodId,
        mood = mood?.let { MoodType.valueOf(it) },
        timestamp = Instant.fromEpochMilliseconds(timestampEpoch),
        sleeping = sleeping != 0L,
        sleepUntil = sleepUntilEpoch?.let { Instant.fromEpochMilliseconds(it) },
        excludeFromSavingsAdvice = excludeFromSavingsAdvice != 0L
    )

    fun currentMonthTotals(): Triple<Double, Double, List<Pair<TransactionCategory, Double>>> {
        val tz = TimeZone.currentSystemDefault()
        val now = Clock.System.now().toLocalDateTime(tz)
        // Per-month range using UTC seconds-aligned window
        val txs = db.transactionQueries.selectAllTransactions().executeAsList()
            .map { it.toDomain() }
        val income = txs.filter { it.type == TransactionType.ENTRADA &&
            timestampMatchesMonth(it.timestamp, now.year, now.monthNumber) &&
            !it.sleeping
        }.sumOf { it.value }
        val expenses = txs.filter { it.type == TransactionType.SAIDA &&
            timestampMatchesMonth(it.timestamp, now.year, now.monthNumber) &&
            !it.sleeping
        }.sumOf { it.value }
        val perCat = txs.filter { it.type == TransactionType.SAIDA &&
            timestampMatchesMonth(it.timestamp, now.year, now.monthNumber)
        }.groupBy { it.category }
            .map { it.key to it.value.sumOf { tx -> tx.value } }
        return Triple(income, expenses, perCat)
    }

    private fun timestampMatchesMonth(ts: Instant, year: Int, month: Int): Boolean {
        val tz = TimeZone.currentSystemDefault()
        val dt = ts.toLocalDateTime(tz)
        return dt.year == year && dt.monthNumber == month
    }

    fun spendingByMood(): List<Triple<MoodType, Double, Int>> {
        val map = mutableMapOf<MoodType, Pair<Double, Int>>()
        db.transactionQueries.selectAllTransactions().executeAsList().map { it.toDomain() }
            .filter { it.type == TransactionType.SAIDA && it.mood != null }
            .forEach {
                val (acc, count) = map[it.mood!!] ?: (0.0 to 0)
                map[it.mood!!] = (acc + it.value) to (count + 1)
            }
        return map.entries.map { Triple(it.key, it.value.first, it.value.second) }
    }

    fun happinessGoals(): List<Triple<TransactionCategory, String, Int>> {
        val tz = TimeZone.currentSystemDefault()
        val now = Clock.System.now()
        val categories = listOf(TransactionCategory.LAZER, TransactionCategory.SAUDE, TransactionCategory.EDUCACAO)
        val txs = db.transactionQueries.selectAllTransactions().executeAsList().map { it.toDomain() }
        return categories.map { cat ->
            val catTxs = txs.filter { it.type == TransactionType.SAIDA && it.category == cat }
            if (catTxs.isEmpty()) {
                Triple(cat, "Voce nao gasta com ${cat.label} ha muito tempo. Que tal investir em voce?", 30)
            } else {
                val last = catTxs.maxBy { it.timestamp }
                val days = ((now.toEpochMilliseconds() - last.timestamp.toEpochMilliseconds()) / 86_400_000L).toInt()
                if (days >= 15) Triple(cat, "Voce nao gasta com ${cat.label} ha $days dias. Que tal investir em voce?", days)
                else Triple(cat, "", -1)
            }
        }.filter { it.third != -1 }
    }

    @Suppress("unused")
    private val ignored: HiddenNotification? = null
}
