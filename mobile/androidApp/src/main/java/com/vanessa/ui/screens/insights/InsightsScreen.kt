package com.vanessa.ui.screens.insights

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.core.ui.formatBRL
import com.vanessa.di.AppContainer

@Composable
fun InsightsScreen(container: AppContainer) {
    val state by container.insightsVm.state.collectAsStateWithLifecycle()

    Column(
        Modifier
            .fillMaxSize()
            .background(Color(ThemeTokens.palette.background))
            .padding(16.dp)
    ) {
        Text("Insights",
            color = Color(ThemeTokens.palette.textPrimary),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(16.dp))

        Text("Por humor", color = Color(ThemeTokens.palette.textSecondary))
        Spacer(Modifier.height(8.dp))
        if (state.byMood.isEmpty()) {
            Text("Sem dados suficientes ainda.",
                color = Color(ThemeTokens.palette.textSecondary))
        } else {
            BarChart(values = state.byMood.map {
                val max = state.byMood.maxOf { s -> s.second }
                if (max == 0.0) 0f else (it.second / max).toFloat()
            })
            Spacer(Modifier.height(8.dp))
            state.byMood.forEach { (mood, total, count) ->
                Row(Modifier.padding(vertical = 4.dp)) {
                    Text(mood.label, Modifier.width(96.dp),
                        color = Color(ThemeTokens.palette.textPrimary))
                    Text(formatBRL(total) + " · $count transações",
                        color = Color(ThemeTokens.palette.textSecondary))
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        Text("Por categoria (mês atual)", color = Color(ThemeTokens.palette.textSecondary))
        Spacer(Modifier.height(8.dp))
        if (state.byCategory.isEmpty()) {
            Text("Sem despesas neste mês ainda.",
                color = Color(ThemeTokens.palette.textSecondary))
        } else {
            val max = state.byCategory.maxOf { it.second }
            state.byCategory.forEach { (cat, total) ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(cat.label, Modifier.width(96.dp),
                        color = Color(ThemeTokens.palette.textPrimary))
                    Box(
                        Modifier
                            .height(12.dp)
                            .fillMaxWidth(0.55f)
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(ThemeTokens.palette.surface))
                    ) {
                        Box(
                            Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(if (max == 0.0) 0f else (total / max).toFloat())
                                .background(Color(ThemeTokens.palette.lavender))
                        )
                    }
                    Spacer(Modifier.width(8.dp))
                    Text(formatBRL(total), color = Color(ThemeTokens.palette.textSecondary))
                }
            }
        }

        if (state.goals.isNotEmpty()) {
            Spacer(Modifier.height(20.dp))
            Text("Invista em você", color = Color(ThemeTokens.palette.textSecondary))
            state.goals.forEach { (cat, msg, _) ->
                Surface(
                    color = Color(ThemeTokens.palette.surface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(12.dp)) {
                        Text(cat.label, color = Color(ThemeTokens.palette.lavender),
                            fontWeight = FontWeight.SemiBold)
                        Text(msg, color = Color(ThemeTokens.palette.textPrimary))
                    }
                }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun BarChart(values: List<Float>) {
    Canvas(
        Modifier
            .fillMaxWidth()
            .height(120.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(ThemeTokens.palette.surface))
            .padding(12.dp)
    ) {
        val n = values.size
        if (n == 0) return@Canvas
        val barWidth = size.width / (n * 1.5f)
        values.forEachIndexed { idx, v ->
            val h = (size.height - 8.dp.toPx()) * v
            val x = size.width * (idx + 0.25f) / (n + 0.5f)
            drawRect(
                color = Color(ThemeTokens.palette.lavender),
                topLeft = Offset(x, size.height - h),
                size = Size(barWidth, h)
            )
        }
    }
}
