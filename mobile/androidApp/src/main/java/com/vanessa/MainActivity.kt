package com.vanessa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.remember
import com.vanessa.ui.AppRoot
import com.vanessa.ui.theme.VanessaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as MainApp).container
        setContent {
            VanessaTheme {
                AppRoot(container = container)
            }
        }
    }
}
