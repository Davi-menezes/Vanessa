package com.vanessa.shared.data

import platform.Foundation.NSUserDefaults

internal actual fun createStorage(): Storage {
    return object : Storage {
        private val defaults = NSUserDefaults.standardUserDefaults()

        override fun putString(key: String, value: String?) {
            if (value == null) {
                defaults.removeObjectForKey(key)
            } else {
                defaults.setObject(value, forKey = key)
            }
        }

        override fun getString(key: String): String? {
            return defaults.stringForKey(key)
        }

        override fun remove(key: String) {
            defaults.removeObjectForKey(key)
        }
    }
}
