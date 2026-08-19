@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package com.vanessa.shared

import platform.UIKit.UIViewController
import platform.UIKit.UIView

fun MainViewController(app: Any? = null): UIViewController {
    return UIViewController()
}