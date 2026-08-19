package com.vanessa.ui.screens.mood

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.vanessa.core.domain.MoodType
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.core.ui.colorHex
import com.vanessa.di.AppContainer

@Composable
fun MoodScreen(container: AppContainer, onDismiss: () -> Unit) {
    var picked by remember { mutableStateOf<MoodType?>(null) }
    var impulsive by remember { mutableStateOf(false) }
    Box(
        Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(24.dp)
    ) {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(40.dp))
            Text("Como você está agora?",
                color = Color(ThemeTokens.palette.textPrimary),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            Text("Sua emoção influencia suas decisões financeiras.",
                color = Color(ThemeTokens.palette.textSecondary))
            Spacer(Modifier.height(32.dp))

            MoodType.entries.forEach { mood ->
                Box(
                    Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(ThemeTokens.palette.surface))
                        .clickable {
                            picked = mood
                            val result = container.moodVm.pickMood(mood)
                            impulsive = result.isImpulsive
                        }
                        .padding(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(Color(mood.colorHex()).copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(when (mood) {
                                MoodType.ANSIEDADE -> "🧠"
                                MoodType.TEDIO -> "😐"
                                MoodType.EUFORIA -> "✨"
                                MoodType.TRISTEZA -> "🌧"
                                MoodType.CALMARIA -> "🍃"
                            }, color = Color(mood.colorHex()))
                        }
                        Spacer(Modifier.width(12.dp))
                        Text(mood.label, color = Color(ThemeTokens.palette.textPrimary),
                            style = MaterialTheme.typography.titleMedium)
                    }
                }
            }

            if (picked != null) {
                Spacer(Modifier.height(16.dp))
                if (impulsive) {
                    Surface(
                        color = Color(ThemeTokens.palette.warning),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Text("⚠ Pausa",
                                color = Color.Black,
                                fontWeight = FontWeight.Bold)
                            Text("Alguns gastos impulsivos acontecem quando estamos ${picked!!.label.lowercase()}. " +
                                    "Antes de registrar uma despesa nova, considere esperar 30 min.",
                                color = Color.Black)
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
                Button(onClick = onDismiss) { Text("Continuar") }
            }
        }
    }
}
