package com.vanessa.settings

import com.russhwolf.settings.NSUserDefaultsSettings
import com.russhwolf.settings.Settings
import platform.Foundation.NSUserDefaults

class IosSettingsFactory {
    fun create(): Settings = NSUserDefaultsSettings(NSUserDefaults.standardUserDefaults)
}
