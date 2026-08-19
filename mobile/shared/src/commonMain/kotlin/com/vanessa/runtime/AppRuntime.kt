package com.vanessa.runtime

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

object AppRuntime {
    val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
}
