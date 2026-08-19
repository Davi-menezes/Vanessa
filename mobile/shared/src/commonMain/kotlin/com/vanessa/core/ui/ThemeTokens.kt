package com.vanessa.core.ui

import com.vanessa.core.domain.MoodType

enum class VanessaSemanticRole {
    Calm, Warning, Danger, Success, Lavender,
}

data class VanessaPalette(
    val background: Long,
    val surface: Long,
    val surfaceElevated: Long,
    val textPrimary: Long,
    val textSecondary: Long,
    val lavender: Long,
    val success: Long,
    val warning: Long,
    val danger: Long,
    val calm: Long,
    val glow: Long
)

object ThemeTokens {
    // Hex ARGB values: matches web's oklch dark-zen theme
    val palette = VanessaPalette(
        background = 0xFF11121FL,
        surface = 0xFF1A1B2EL,
        surfaceElevated = 0xFF22243ALL,
        textPrimary = 0xFFE6E1FFL,
        textSecondary = 0xFF9A99B5L,
        lavender = 0xFF9C8FE8L,
        success = 0xFF66C9A1L,
        warning = 0xFFE0B05CL,
        danger = 0xFFE0756AL,
        calm = 0xFF6AA8E0L,
        glow = 0xFFB0A2F0L
    )
    val radiusSm = 8.0
    val radiusMd = 10.0
    val radiusLg = 12.0
    val radiusXl = 16.0
}

fun MoodType.colorHex(): Long = when (this) {
    MoodType.ANSIEDADE -> ThemeTokens.palette.warning
    MoodType.TEDIO -> ThemeTokens.palette.textSecondary
    MoodType.EUFORIA -> ThemeTokens.palette.lavender
    MoodType.TRISTEZA -> ThemeTokens.palette.calm
    MoodType.CALMARIA -> ThemeTokens.palette.success
}
