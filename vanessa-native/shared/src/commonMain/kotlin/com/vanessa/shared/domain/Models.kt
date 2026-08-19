package com.vanessa.shared.domain

enum class Mood(val label: String, val isImpulsive: Boolean) {
    ANSIEDADE("Ansiedade", true),
    TEDIO("Tédio", false),
    EUFORIA("Euforia", true),
    TRISTEZA("Tristeza", false),
    CALMARIA("Calmaria", false)
}

enum class Category(val label: String) {
    ALIMENTACAO("Alimentação"),
    TRANSPORTE("Transporte"),
    COMBUSTIVEL("Combustível"),
    LAZER("Lazer"),
    SAUDE("Saúde"),
    EDUCACAO("Educação"),
    MORADIA("Moradia"),
    VESTUARIO("Vestuário"),
    OUTROS("Outros")
}

enum class TxType { ENTRADA, SAIDA }
enum class PaymentMethod { CONTA_CORRENTE, CREDITO }

data class MoodEntry(val id: String, val mood: Mood, val timestampMs: Long)

data class Transaction(
    val id: String,
    val value: Double,
    val category: Category,
    val type: TxType,
    val paymentMethod: PaymentMethod,
    val description: String,
    val moodId: String?,
    val mood: Mood?,
    val timestampMs: Long,
    val sleeping: Boolean,
    val sleepUntilMs: Long?,
    val excludeFromSavingsAdvice: Boolean = false
) {
    override fun toString(): String {
        return if (description.isNotBlank()) description else category.label
    }
}

data class PiggyBank(
    val id: String,
    val name: String,
    val savedAmount: Double,
    val targetAmount: Double,
    val createdAtMs: Long
)

data class PlanningGoal(
    val id: String,
    val title: String,
    val type: String,
    val targetAmount: Double,
    val targetMonths: Int,
    val createdAtMs: Long
)

data class FixedCost(
    val id: String,
    val name: String,
    val amount: Double,
    val dueDay: Int,
    val category: String,
    val createdAtMs: Long,
    val paidMonths: Map<String, Boolean> = emptyMap()
)

data class BudgetSettings(
    val monthlyLimit: Double?,
    val categoryLimits: Map<Category, Double> = emptyMap(),
    val updatedAtMs: Long
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val passwordHash: String,
    val createdAtMs: Long
)

data class AuthResult(
    val success: Boolean,
    val errorMessage: String? = null,
    val user: User? = null
)
