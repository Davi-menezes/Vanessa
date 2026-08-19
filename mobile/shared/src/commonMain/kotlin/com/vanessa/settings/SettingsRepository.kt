package com.vanessa.settings

interface SettingsRepository {
    companion object
    suspend fun getString(key: String): String?
    suspend fun putString(key: String, value: String)
    suspend fun remove(key: String)
}
