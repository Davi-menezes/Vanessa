package com.vanessa.shared.data

import com.vanessa.shared.domain.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.random.Random

/**
 * Store with persistent session via platform Storage (UserDefaults/SharedPreferences).
 * Users and session are persisted so login survives app restarts.
 * Transactions and other data are also persisted per-user.
 */
class Store {

    fun nowMs(): Long = currentTimeMillisImpl()

    private val storage = createStorage()

    private val _users = mutableListOf<User>()
    private val _sessionUserId = MutableStateFlow<String?>(null)
    val sessionUserId: StateFlow<String?> = _sessionUserId.asStateFlow()

    private val moods = mutableMapOf<String, MutableList<MoodEntry>>()

    // --- Persistence helpers ------------------------------------------------
    private companion object {
        const val KEY_USERS = "mdmr_users"
        const val KEY_SESSION = "mdmr_session"
        const val KEY_TX_PREFIX = "mdmr_tx_"
        const val KEY_MOODS_PREFIX = "mdmr_moods_"
    }

    private fun userToJson(u: User): String =
        "${u.id}\u001F${u.name}\u001F${u.email}\u001F${u.passwordHash}\u001F${u.createdAtMs}"

    private fun userFromJson(line: String): User? {
        val parts = line.split("\u001F")
        if (parts.size < 5) return null
        return User(parts[0], parts[1], parts[2], parts[3], parts[4].toLongOrNull() ?: 0L)
    }

    private fun loadUsers() {
        val raw = storage.getString(KEY_USERS) ?: return
        try {
            raw.split("\n").forEach { line ->
                if (line.isBlank()) return@forEach
                userFromJson(line)?.let { _users.add(it) }
            }
        } catch (e: Exception) {
            // Corrupted data — clear and start fresh
            storage.remove(KEY_USERS)
            _users.clear()
        }
    }

    private fun saveUsers() {
        try {
            storage.putString(KEY_USERS, _users.joinToString("\n") { userToJson(it) })
        } catch (e: Exception) {
            // ignore — non-fatal
        }
    }

    private fun loadSession() {
        try {
            val sid = storage.getString(KEY_SESSION)
            if (sid != null && sid.isNotBlank()) {
                _sessionUserId.value = sid
            }
        } catch (e: Exception) {
            storage.remove(KEY_SESSION)
        }
    }

    private fun saveSession(userId: String?) {
        try {
            storage.putString(KEY_SESSION, userId)
        } catch (e: Exception) {
            // ignore
        }
    }

    private fun txToJson(t: Transaction): String =
        listOf(
            t.id, t.value.toString(), t.category.name, t.type.name, t.paymentMethod.name,
            t.description.replace("\n", "\\n").replace("\u001F", " "), t.moodId ?: "", t.mood?.name ?: "", t.timestampMs.toString(),
            t.sleeping.toString(), t.sleepUntilMs?.toString() ?: "",
            t.excludeFromSavingsAdvice.toString()
        ).joinToString("\u001F")

    private fun txFromJson(line: String): Transaction? {
        val p = line.split("\u001F", limit = 12)
        if (p.size < 12) return null
        return try {
            Transaction(
                id = p[0],
                value = p[1].toDoubleOrNull() ?: 0.0,
                category = runCatching { Category.valueOf(p[2]) }.getOrDefault(Category.OUTROS),
                type = runCatching { TxType.valueOf(p[3]) }.getOrDefault(TxType.SAIDA),
                paymentMethod = runCatching { PaymentMethod.valueOf(p[4]) }.getOrDefault(PaymentMethod.CONTA_CORRENTE),
                description = p[5].replace("\\n", "\n"),
                moodId = p[6].ifEmpty { null },
                mood = p[7].ifEmpty { null }?.let { runCatching { Mood.valueOf(it) }.getOrNull() },
                timestampMs = p[8].toLongOrNull() ?: 0L,
                sleeping = p[9] == "true",
                sleepUntilMs = p[10].ifEmpty { null }?.toLongOrNull(),
                excludeFromSavingsAdvice = p[11] == "true"
            )
        } catch (e: Exception) {
            null
        }
    }

    private fun saveTransactions() {
        val key = KEY_TX_PREFIX + userKey()
        val list = transactions[userKey()] ?: return
        try {
            storage.putString(key, list.joinToString("\n") { txToJson(it) })
        } catch (e: Exception) {
            // ignore
        }
    }

    private fun loadTransactionsForUser(uid: String) {
        val raw = storage.getString(KEY_TX_PREFIX + uid) ?: return
        try {
            val list = raw.split("\n").mapNotNull { line ->
                if (line.isBlank()) null else txFromJson(line)
            }.toMutableList()
            transactions[uid] = list
        } catch (e: Exception) {
            storage.remove(KEY_TX_PREFIX + uid)
            transactions[uid] = mutableListOf()
        }
    }

    private fun moodToJson(m: MoodEntry): String =
        "${m.id}\u001F${m.mood.name}\u001F${m.timestampMs}"

    private fun moodFromJson(line: String): MoodEntry? {
        val p = line.split("\u001F", limit = 3)
        if (p.size < 3) return null
        return try {
            MoodEntry(
                p[0],
                runCatching { Mood.valueOf(p[1]) }.getOrDefault(Mood.CALMARIA),
                p[2].toLongOrNull() ?: 0L
            )
        } catch (e: Exception) {
            null
        }
    }

    private fun saveMoods() {
        val key = KEY_MOODS_PREFIX + userKey()
        val list = moods[userKey()] ?: return
        try {
            storage.putString(key, list.joinToString("\n") { moodToJson(it) })
        } catch (e: Exception) {
            // ignore
        }
    }

    private fun loadMoodsForUser(uid: String) {
        val raw = storage.getString(KEY_MOODS_PREFIX + uid) ?: return
        try {
            val list = raw.split("\n").mapNotNull { line ->
                if (line.isBlank()) null else moodFromJson(line)
            }.toMutableList()
            moods[uid] = list
        } catch (e: Exception) {
            storage.remove(KEY_MOODS_PREFIX + uid)
            moods[uid] = mutableListOf()
        }
    }

    private fun loadAllData() {
        val uid = _sessionUserId.value
        if (uid != null) {
            loadTransactionsForUser(uid)
            loadMoodsForUser(uid)
        }
    }

    private val transactions = mutableMapOf<String, MutableList<Transaction>>()
    private val hiddenHome = mutableMapOf<String, MutableSet<String>>()
    private val hiddenExpenses = mutableMapOf<String, MutableSet<String>>()
    private val piggyBanks = mutableMapOf<String, MutableList<PiggyBank>>()
    private val planningGoals = mutableMapOf<String, MutableList<PlanningGoal>>()
    private val fixedCosts = mutableMapOf<String, MutableList<FixedCost>>()
    private val fixedCostsPaid = mutableMapOf<String, MutableMap<String, String>>()
    private val budgetSettings = mutableMapOf<String, BudgetSettings>()

    // Precisa vir depois das declarações acima: os inicializadores rodam na ordem
    // de declaração, e ler dados persistidos toca esses mapas.
    init {
        loadUsers()
        loadSession()
        // Clear session if the user doesn't exist (corrupted/incomplete data)
        if (_sessionUserId.value != null && currentUser() == null) {
            _sessionUserId.value = null
            saveSession(null)
        }
        loadAllData()
    }

    private fun newId(): String =
        Random.nextBytes(8).joinToString("") { byte -> byte.toString(16).padStart(2, '0') } +
                nowMs().toString(36)

    private fun userKey() = _sessionUserId.value ?: "anon"

    private fun monthKey(timestampMs: Long): String {
        val secs = timestampMs / 1000L
        // Approximate UTC ISO-style year/month: just enough for budget grouping.
        // Roughly: minute, hour, day, month, year offsets from epoch 1970-01-01.
        // Using a tiny adaptation of Gregorian conversion via Zeller-like math.
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
        val mount = monthDays.toMutableList()
        if (leap) mount[1] = 29
        var m = 0
        for (i in 0 until 12) {
            if (remaining < mount[i]) { m = i; remaining -= mount[i - 1].toLong() }
            else { m = i + 1; }
        }
        return "$year-${(m + 2).toString().padStart(2, '0')}"
    }

    private fun isSameMonth(a: Long, b: Long): Boolean = monthKey(a) == monthKey(b)

    // --- Auth ---------------------------------------------------------------
    fun signup(name: String, email: String, password: String): AuthResult {
        val normalized = email.lowercase().trim()
        val existing = _users.firstOrNull { it.email == normalized }
        if (existing != null) return AuthResult(false, "Esse email ja esta cadastrado.")
        val hash = simpleHash(password)
        val user = User(newId(), name.trim(), normalized, hash, nowMs())
        _users.add(user)
        saveUsers()
        _sessionUserId.value = user.id
        saveSession(user.id)
        return AuthResult(true, user = user)
    }

    fun login(email: String, password: String): AuthResult {
        val normalized = email.lowercase().trim()
        val user = _users.firstOrNull { it.email == normalized }
            ?: return AuthResult(false, "Email nao encontrado.")
        if (user.passwordHash != simpleHash(password)) {
            return AuthResult(false, "Senha incorreta.")
        }
        _sessionUserId.value = user.id
        saveSession(user.id)
        loadAllData()
        return AuthResult(true, user = user)
    }

    fun logout() {
        _sessionUserId.value = null
        saveSession(null)
    }

    fun currentUser(): User? = _users.firstOrNull { it.id == _sessionUserId.value }

    private fun simpleHash(input: String): String {
        val prime = 31L
        var hash = 7L
        input.forEach { c ->
            hash = (hash * prime + c.code.toLong()) and 0x7FFFFFFF
        }
        return hash.toString(36)
    }

    // --- Moods --------------------------------------------------------------
    fun addMood(mood: Mood): MoodEntry {
        val entry = MoodEntry(newId(), mood, nowMs())
        moods.getOrPut(userKey()) { mutableListOf() }.add(entry)
        saveMoods()
        return entry
    }

    fun latestMood(): MoodEntry? = moods[userKey()]?.lastOrNull()

    // --- Transactions -------------------------------------------------------
    fun addTransaction(t: Transaction): Transaction {
        val tx = t.copy(id = newId())
        transactions.getOrPut(userKey()) { mutableListOf() }.add(tx)
        saveTransactions()
        return tx
    }

    fun transactions(): List<Transaction> =
        transactions[userKey()]?.sortedByDescending { it.timestampMs } ?: emptyList()

    fun deleteTransaction(id: String) {
        transactions[userKey()]?.removeAll { it.id == id }
        hiddenHome[userKey()]?.remove(id)
        hiddenExpenses[userKey()]?.remove(id)
        saveTransactions()
    }

    fun clearTransactions() {
        transactions[userKey()]?.clear()
        hiddenHome[userKey()]?.clear()
        hiddenExpenses[userKey()]?.clear()
        fixedCostsPaid[userKey()]?.clear()
        saveTransactions()
    }

    fun hideHomeNotification(id: String) {
        hiddenHome.getOrPut(userKey()) { mutableSetOf() }.add(id)
    }

    fun hideExpensesNotification(id: String) {
        hiddenExpenses.getOrPut(userKey()) { mutableSetOf() }.add(id)
    }

    fun isHomeHidden(id: String) = hiddenHome[userKey()]?.contains(id) == true
    fun isExpenseHidden(id: String) = hiddenExpenses[userKey()]?.contains(id) == true

    // --- Piggy Banks --------------------------------------------------------
    fun addPiggy(name: String, saved: Double, target: Double): PiggyBank {
        val p = PiggyBank(newId(), name, saved, target, nowMs())
        piggyBanks.getOrPut(userKey()) { mutableListOf() }.add(p)
        return p
    }
    fun piggyList(): List<PiggyBank> = piggyBanks[userKey()] ?: emptyList()
    fun depositPiggy(id: String, delta: Double) {
        val list = piggyBanks[userKey()] ?: return
        val idx = list.indexOfFirst { it.id == id }
        if (idx >= 0) list[idx] = list[idx].copy(savedAmount = list[idx].savedAmount + delta)
    }
    fun removePiggy(id: String) {
        piggyBanks[userKey()]?.removeAll { it.id == id }
    }

    // --- Planning -----------------------------------------------------------
    fun addPlanning(title: String, type: String, target: Double, months: Int): PlanningGoal {
        val g = PlanningGoal(newId(), title, type, target, months, nowMs())
        planningGoals.getOrPut(userKey()) { mutableListOf() }.add(g)
        return g
    }
    fun planningList(): List<PlanningGoal> = planningGoals[userKey()] ?: emptyList()
    fun removePlanning(id: String) {
        planningGoals[userKey()]?.removeAll { it.id == id }
    }

    // --- Fixed costs --------------------------------------------------------
    fun addFixed(name: String, amount: Double, dueDay: Int, category: String): FixedCost {
        val f = FixedCost(newId(), name, amount, dueDay, category, nowMs())
        fixedCosts.getOrPut(userKey()) { mutableListOf() }.add(f)
        return f
    }
    fun fixedList(): List<FixedCost> = fixedCosts[userKey()] ?: emptyList()
    fun removeFixed(id: String) {
        fixedCosts[userKey()]?.removeAll { it.id == id }
    }

    fun markFixedPaid(id: String): Boolean {
        val list = fixedCosts[userKey()] ?: return false
        val f = list.firstOrNull { it.id == id } ?: return false
        val monthKey = monthKey(nowMs())
        val paidMap = fixedCostsPaid.getOrPut(userKey()) { mutableMapOf() }
        if (paidMap[id] == monthKey) return false
        val txCat = when (f.category) {
            "assinaturas" -> Category.OUTROS
            else -> runCatching { Category.valueOf(f.category.uppercase()) }.getOrDefault(Category.OUTROS)
        }
        addTransaction(
            Transaction(
                id = newId(),
                value = f.amount,
                category = txCat,
                type = TxType.SAIDA,
                paymentMethod = PaymentMethod.CONTA_CORRENTE,
                description = "Gasto fixo pago: ${f.name}",
                moodId = null,
                mood = null,
                timestampMs = nowMs(),
                sleeping = false,
                sleepUntilMs = null,
                excludeFromSavingsAdvice = false
            )
        )
        paidMap[id] = monthKey
        return true
    }

    // --- Budget -------------------------------------------------------------
    fun getBudget(): BudgetSettings =
        budgetSettings[userKey()] ?: BudgetSettings(null, emptyMap(), nowMs())

    fun setMonthlyLimit(limit: Double?) {
        val c = getBudget()
        budgetSettings[userKey()] = c.copy(monthlyLimit = limit, updatedAtMs = nowMs())
    }

    fun setCategoryLimit(cat: Category, limit: Double) {
        val cur = getBudget()
        budgetSettings[userKey()] =
            cur.copy(categoryLimits = cur.categoryLimits + (cat to limit), updatedAtMs = nowMs())
    }

    fun removeCategoryLimit(cat: Category) {
        val cur = getBudget()
        budgetSettings[userKey()] =
            cur.copy(categoryLimits = cur.categoryLimits - cat, updatedAtMs = nowMs())
    }

    // Helpers exposed for ViewModel use
    fun sameMonthNow(ts: Long): Boolean = isSameMonth(ts, nowMs())
    fun currentMonthNow(): String = monthKey(nowMs())
}
