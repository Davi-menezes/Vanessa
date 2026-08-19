package com.vanessa.core.ui

fun formatBRL(value: Double): String {
    val fixed = if (value == kotlin.math.floor(value)) value.toLong().toString()
    else "%.2f".format(value).replace('.', ',')
    val parts = fixed.split(',')
    val inteiro = parts[0].reversed().chunked(3).joinToString(".").reversed()
    return if (parts.size == 2 && parts[1].isNotEmpty()) {
        "R$ $inteiro,${parts[1]}"
    } else "R$ $inteiro"
}

fun formatDate(epochMs: Long): String {
    val dt = kotlinx.datetime.Instant.fromEpochMilliseconds(epochMs)
        .toLocalDateTime(kotlinx.datetime.TimeZone.currentSystemDefault())
    return "${dt.dayOfMonth.toString().padStart(2, '0')}/${dt.monthNumber.toString().padStart(2, '0')}"
}
