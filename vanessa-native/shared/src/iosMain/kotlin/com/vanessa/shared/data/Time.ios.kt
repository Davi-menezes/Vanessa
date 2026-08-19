package com.vanessa.shared.data

import platform.Foundation.NSDate
import platform.Foundation.timeIntervalSince1970

internal actual fun currentTimeMillisImpl(): Long {
    return (NSDate().timeIntervalSince1970 * 1000).toLong()
}
