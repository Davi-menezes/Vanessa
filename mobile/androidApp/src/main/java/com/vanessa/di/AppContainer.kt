package com.vanessa.di

import android.content.Context
import com.vanessa.core.data.AppGraph
import com.vanessa.core.data.VanessaGraph
import com.vanessa.feature.audio.AudioCapture
import com.vanessa.feature.audio.AudioRecorder
import com.vanessa.db.AndroidDatabaseDriverFactory
import com.vanessa.db.VanessaDatabase
import com.vanessa.feature.auth.AuthViewModel
import com.vanessa.feature.home.HomeViewModel
import com.vanessa.feature.insights.InsightsViewModel
import com.vanessa.feature.mood.MoodViewModel
import com.vanessa.feature.planning.PlanningViewModel
import com.vanessa.feature.transactions.TransactionsViewModel
import com.vanessa.settings.AndroidSettingsFactory
import com.vanessa.settings.SettingsRepositoryImpl

class AppContainer(context: Context) {
    val audioRecorder = AudioRecorder(context)
    val audioCapture = AudioCapture()

    val db: VanessaDatabase = VanessaDatabase(
        AndroidDatabaseDriverFactory(context).create()
    )
    val settings = SettingsRepositoryImpl(
        AndroidSettingsFactory(context).create()
    )
    val graph: AppGraph = VanessaGraph.create(db, settings)

    val authVm = AuthViewModel(graph)
    val homeVm = HomeViewModel(graph)
    val transactionsVm = TransactionsViewModel(graph)
    val insightsVm = InsightsViewModel(graph)
    val planningVm = PlanningViewModel(graph)
    val moodVm = MoodViewModel(graph)
}
