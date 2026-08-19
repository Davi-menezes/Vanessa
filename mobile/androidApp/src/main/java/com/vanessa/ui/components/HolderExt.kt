package com.vanessa.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.vanessa.core.ui.StateHolder
import kotlinx.coroutines.flow.StateFlow

@Composable
fun <S> rememberHolder(holder: StateHolder<S>): S {
    val state by holder.state.collectAsStateWithLifecycle(initialValue = holder.current())
    return state
}
