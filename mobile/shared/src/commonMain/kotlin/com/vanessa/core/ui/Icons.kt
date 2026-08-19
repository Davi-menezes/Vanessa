package com.vanessa.core.ui

import com.vanessa.core.domain.TransactionCategory
import com.vanessa.core.domain.MoodType

object MoodLabels {
    fun iconChar(type: MoodType): String = when (type) {
        MoodType.ANSIEDADE -> "🧠"
        MoodType.TEDIO -> "😐"
        MoodType.EUFORIA -> "✨"
        MoodType.TRISTEZA -> "🌧"
        MoodType.CALMARIA -> "🍃"
    }
}

object CategoryLabels {
    fun iconChar(c: TransactionCategory): String = when (c) {
        TransactionCategory.ALIMENTACAO -> "🍽"
        TransactionCategory.TRANSPORTE -> "🚗"
        TransactionCategory.COMBUSTIVEL -> "⛽"
        TransactionCategory.LAZER -> "🎬"
        TransactionCategory.SAUDE -> "💊"
        TransactionCategory.EDUCACAO -> "📚"
        TransactionCategory.MORADIA -> "🏠"
        TransactionCategory.VESTUARIO -> "👕"
        TransactionCategory.OUTROS -> "📦"
    }
}
