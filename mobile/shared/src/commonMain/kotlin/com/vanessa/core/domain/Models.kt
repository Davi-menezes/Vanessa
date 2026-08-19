package com.vanessa.core.domain

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String,
    val passwordHash: String,
    val createdAt: Instant
)

enum class MoodType(val label: String, val isImpulsive: Boolean) {
    ANSIEDADE("Ansiedade", true),
    TEDIO("Tédio", false),
    EUFORIA("Euforia", true),
    TRISTEZA("Tristeza", false),
    CALMARIA("Calmaria", false)
}

enum class TransactionCategory(val label: String) {
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

enum class TransactionType { ENTRADA, SAIDA }
enum class PaymentMethod { CONTA_CORRENTE, CREDITO }

@Serializable
data class MoodEntry(
    val id: String,
    val mood: MoodType,
    val timestamp: Instant
)

@Serializable
data class Transaction(
    val id: String,
    val value: Double,
    val category: TransactionCategory,
    val type: TransactionType,
    val paymentMethod: PaymentMethod,
    val description: String,
    val moodId: String?,
    val mood: MoodType?,
    val timestamp: Instant,
    val sleeping: Boolean,
    val sleepUntil: Instant?,
    val excludeFromSavingsAdvice: Boolean = false
)

@Serializable
data class PiggyBank(
    val id: String,
    val name: String,
    val savedAmount: Double,
    val targetAmount: Double,
    val createdAt: Instant
)

@Serializable
data class PlanningGoal(
    val id: String,
    val title: String,
    val type: String,
    val targetAmount: Double,
    val targetMonths: Int,
    val createdAt: Instant
)

@Serializable
data class FixedCost(
    val id: String,
    val name: String,
    val amount: Double,
    val dueDay: Int,
    val category: String,
    val createdAt: Instant,
    val paidMonths: Map<String, Boolean> = emptyMap()
)

@Serializable
data class BudgetSettings(
    val monthlyLimit: Double?,
    val categoryLimits: Map<TransactionCategory, Double> = emptyMap(),
    val updatedAt: Instant
)
