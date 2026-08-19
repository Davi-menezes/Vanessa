package com.vanessa.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.vanessa.core.ui.ThemeTokens

private val DarkColors = darkColorScheme(
    background = Color(ThemeTokens.palette.background),
    surface = Color(ThemeTokens.palette.surface),
    surfaceVariant = Color(ThemeTokens.palette.surfaceElevated),
    onBackground = Color(ThemeTokens.palette.textPrimary),
    onSurface = Color(ThemeTokens.palette.textPrimary),
    primary = Color(ThemeTokens.palette.lavender),
    secondary = Color(ThemeTokens.palette.calm),
    tertiary = Color(ThemeTokens.palette.success),
    error = Color(ThemeTokens.palette.danger)
)

@Composable
fun VanessaTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = DarkColors, content = content)
}
