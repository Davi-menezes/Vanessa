package com.vanessa.shared.data

/**
 * Platform-agnostic key-value storage.
 * iOS uses UserDefaults, Android uses SharedPreferences.
 */
interface Storage {
    fun putString(key: String, value: String?)
    fun getString(key: String): String?
    fun remove(key: String)
}

internal expect fun createStorage(): Storage
