package com.vanessa.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.clickable
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.vanessa.core.ui.ThemeTokens

@Composable
fun VanessaCard(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val mod = modifier
        .clip(RoundedCornerShape(ThemeTokens.radiusLg.dp))
        .background(Color(ThemeTokens.palette.surface))
        .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
        .padding(contentPadding)
    Box(modifier = mod) { content() }
}

@Composable
fun VanessaSectionTitle(text: String) {
    Text(text, color = Color(ThemeTokens.palette.textSecondary),
        modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp))
}
