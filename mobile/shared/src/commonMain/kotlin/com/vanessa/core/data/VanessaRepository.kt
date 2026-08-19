package com.vanessa.core.data

import com.vanessa.core.domain.MoodEntry
import com.vanessa.core.domain.MoodType
import com.vanessa.core.domain.PiggyBank
import com.vanessa.core.domain.PlanningGoal
import com.vanessa.core.domain.Transaction
import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.TransactionType
import com.vanessa.core.domain.User
import com.vanessa.settings.SettingsRepository
import com.vanessa.crypto.PasswordHasher
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.datetime.Clock
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.random.Random

@Serializable
data class Session(val userId: String)

@Serializable
private data class StoredUser(
    val id: String,
    val name: String,
    val email: String,
    val passwordHash: String,
    val createdAtEpoch: Long
)

private fun User.toStored() =
    StoredUser(id, name, email, passwordHash, createdAt.toEpochMilliseconds())

private fun StoredUser.toDomain(): User = User(
    id = id,
    name = name,
    email = email,
    passwordHash = passwordHash,
    createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(createdAtEpoch)
)

class VanessaRepository(
    private val settings: SettingsRepository,
    private val hasher: PasswordHasher = PasswordHasher()
) {    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    suspend fun restoreSession() = mutex.withLock {
        val sessionRaw = settings.getString(SESSION_KEY) ?: return@withLock
        val session = runCatching { json.decodeFromString<Session>(sessionRaw) }.getOrNull()
            ?: return@withLock
        val usersRaw = settings.getString(USERS_KEY) ?: return@withLock
        val stored = runCatching {
            json.decodeFromString<List<StoredUser>>(usersRaw)
        }.getOrNull() ?: return@withLock
        _currentUser.value = stored.firstOrNull { it.id == session.userId }?.toDomain()
    }

    private suspend fun saveUsers(list: List<User>) {
        settings.putString(USERS_KEY, json.encodeToString(list.map { it.toStored() }))
    }

    suspend fun signup(name: String, email: String, password: String): Result<User> = mutex.withLock {
        val normalizedEmail = email.lowercase().trim()
        val existing = loadUsers().firstOrNull { it.email == normalizedEmail }
        if (existing != null) {
            return@withLock Result.failure(IllegalStateException("Esse email ja esta cadastrado."))
        }
        val user = User(
            id = newId(),
            name = name.trim(),
            email = normalizedEmail,
            passwordHash = hasher.hash(password),
            createdAt = Clock.System.now()
        )
        val updated = loadUsers() + user
        saveUsers(updated)
        settings.putString(SESSION_KEY, json.encodeToString(Session(user.id)))
        _currentUser.value = user
        Result.success(user)
    }

    suspend fun login(email: String, password: String): Result<User> = mutex.withLock {
        val normalizedEmail = email.lowercase().trim()
        val user = loadUsers().firstOrNull { it.email == normalizedEmail }
            ?: return@withLock Result.failure(IllegalStateException("Email nao encontrado."))
        if (hasher.hash(password) != user.passwordHash) {
            return@withLock Result.failure(IllegalStateException("Senha incorreta."))
        }
        settings.putString(SESSION_KEY, json.encodeToString(Session(user.id)))
        _currentUser.value = user
        Result.success(user)
    }

    suspend fun logout() = mutex.withLock {
        settings.remove(SESSION_KEY)
        _currentUser.value = null
    }

    suspend fun resetPassword(email: String, newPassword: String): Result<Unit> = mutex.withLock {
        if (newPassword.length < 4) {
            return@withLock Result.failure(IllegalStateException("A nova senha precisa ter pelo menos 4 caracteres."))
        }
        val users = loadUsers().toMutableList()
        val index = users.indexOfFirst { it.email == email.lowercase().trim() }
        if (index == -1) return@withLock Result.failure(IllegalStateException("Email nao encontrado."))
        users[index] = users[index].copy(passwordHash = hasher.hash(newPassword))
        saveUsers(users)
        Result.success(Unit)
    }

    private suspend fun loadUsers(): List<User> {
        val raw = settings.getString(USERS_KEY) ?: return emptyList()
        return runCatching {
            json.decodeFromString<List<StoredUser>>(raw)
        }.getOrNull().orEmpty().map { it.toDomain() }
    }

    companion object {
        private const val USERS_KEY = "vanessa_users"
        private const val SESSION_KEY = "vanessa_session"

        fun newId(): String =
            Random.nextBytes(8).joinToString("") { "%02x".format(it) } +
                    Clock.System.now().toEpochMilliseconds().toString(36)
    }
}
