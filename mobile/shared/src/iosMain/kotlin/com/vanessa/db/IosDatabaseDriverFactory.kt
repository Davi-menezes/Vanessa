package com.vanessa.db

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver

class IosDatabaseDriverFactory {
    fun create(): SqlDriver = NativeSqliteDriver(VanessaDatabase.Schema, "vanessa.db")
}
