package com.vanessa.db

import android.content.Context
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import app.cash.sqldelight.db.SqlDriver

class AndroidDatabaseDriverFactory(private val context: Context) {
    fun create(): SqlDriver =
        AndroidSqliteDriver(VanessaDatabase.Schema, context, "vanessa.db")
}
