package com.vanessa

import android.app.Application
import com.vanessa.di.AppContainer

class MainApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
