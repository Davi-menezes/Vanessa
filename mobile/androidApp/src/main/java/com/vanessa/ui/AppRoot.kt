package com.vanessa.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.vanessa.core.ui.ThemeTokens
import com.vanessa.di.AppContainer
import com.vanessa.ui.screens.auth.AuthScreen
import com.vanessa.ui.screens.home.HomeScreen
import com.vanessa.ui.screens.insights.InsightsScreen
import com.vanessa.ui.screens.mood.MoodScreen
import com.vanessa.ui.screens.planning.PlanningScreen
import com.vanessa.ui.screens.transactions.TransactionsScreen
import kotlinx.coroutines.launch

sealed class TabRoute(val route: String, val label: String) {
    data object Home : TabRoute("home", "Início")
    data object Transactions : TabRoute("transacoes", "Gastos")
    data object Insights : TabRoute("insights", "Insights")
    data object Planning : TabRoute("planejamento", "Planejamento")
}

private val tabs = listOf(TabRoute.Home, TabRoute.Transactions, TabRoute.Insights, TabRoute.Planning)

@androidx.compose.runtime.Composable
fun AppRoot(container: AppContainer) {
    val authState by remember { container.authVm.state }
        .collectWithLifecycle(AuthUiIdle)
    if (!authState.authed) {
        AuthScreen(viewModel = container.authVm)
        return
    }

    val navController = rememberNavController()
    Scaffold(
        containerColor = Color(ThemeTokens.palette.background),
        bottomBar = {
            NavigationBar(containerColor = Color(ThemeTokens.palette.surface)) {
                val backStack by navController.currentBackStackEntryAsState()
                val current = backStack?.destination?.route ?: TabRoute.Home.route
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = current == tab.route,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clip(CircleShape)
                                    .background(Color(ThemeTokens.palette.surfaceElevated)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    tab.glyph(),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        },
                        label = { Text(tab.label) },
                        alwaysShowLabel = true,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(ThemeTokens.palette.lavender),
                            selectedTextColor = Color(ThemeTokens.palette.lavender),
                            unselectedIconColor = Color(ThemeTokens.palette.textSecondary),
                            unselectedTextColor = Color(ThemeTokens.palette.textSecondary),
                            indicatorColor = Color(0x1422223A)
                        )
                    )
                }
            }
        }
    ) { padding ->
        var showMoodCheckin by remember { mutableStateOf(false) }
        NavHost(
            navController = navController,
            startDestination = TabRoute.Home.route,
            modifier = Modifier.padding(padding)
        ) {
            composable(TabRoute.Home.route) {
                HomeScreen(
                    container = container,
                    onOpenMoodCheckin = { showMoodCheckin = true },
                    onLogout = { container.graph.scope.launch {
                        container.graph.auth.logout()
                    }}
                )
            }
            composable(TabRoute.Transactions.route) {
                TransactionsScreen(container = container)
            }
            composable(TabRoute.Insights.route) {
                InsightsScreen(container = container)
            }
            composable(TabRoute.Planning.route) {
                PlanningScreen(container = container)
            }
        }

        if (showMoodCheckin) {
            MoodScreen(
                container = container,
                onDismiss = { showMoodCheckin = false }
            )
        }
    }
}

private data class AuthUiIdle(val authed: Boolean = false)

@Composable
private fun <T> StateFlow<T>.collectWithLifecycle(initial: T) =
    this.collectAsStateWithLifecycle(initialValue = initial)

private fun TabRoute.glyph(): String = when (this) {
    TabRoute.Home -> "🏠"
    TabRoute.Transactions -> "💸"
    TabRoute.Insights -> "📊"
    TabRoute.Planning -> "🎯"
}
