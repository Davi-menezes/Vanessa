package com.vanessa.settings

import com.russhwolf.settings.SharedPreferencesSettings
import com.russhwolf.settings.Settings
import android.content.Context

class AndroidSettingsFactory(private val context: Context) {
    fun create(): Settings = SharedPreferencesSettings(
        context.getSharedPreferences("vanessa_prefs", Context.MODE_PRIVATE)
    )
}

fun SettingsRepository.Companion.create(settings: Settings): SettingsRepository =
    SettingsRepositoryImpl(settings)
