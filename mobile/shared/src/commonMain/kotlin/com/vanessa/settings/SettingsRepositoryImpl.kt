package com.vanessa.settings

import com.russhwolf.settings.Settings

class SettingsRepositoryImpl(private val settings: Settings) : SettingsRepository {
    override suspend fun getString(key: String): String? = try {
        settings.getString(key)
    } catch (e: Exception) {
        null
    }

    override suspend fun putString(key: String, value: String) =
        settings.putString(key, value)

    override suspend fun remove(key: String) = settings.remove(key)
}
