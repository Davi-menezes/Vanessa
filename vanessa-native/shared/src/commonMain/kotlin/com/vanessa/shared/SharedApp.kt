package com.vanessa.shared

import com.vanessa.shared.data.Store
import com.vanessa.shared.domain.Category
import com.vanessa.shared.domain.Mood
import com.vanessa.shared.domain.PaymentMethod
import com.vanessa.shared.domain.Transaction
import com.vanessa.shared.domain.TxType

/**
 * Single entry-point shared by iOS and Android.
 * Holds the in-memory store + plugin callbacks that Swift can hook.
 */
class SharedApp {
    val store = Store()

    // -- Audio callback hooks: iOS sets these in AppHost -----------------
    /** Set by Swift: trigger audio capture from native side. */
    var onRequestAudioCapture: (() -> Unit)? = null

    /** Set by Swift: present a file/document picker from native side. */
    var onRequestPickFiles: (() -> Unit)? = null

    fun requestAudioCapture() { onRequestAudioCapture?.invoke() }
    fun requestPickFiles() { onRequestPickFiles?.invoke() }

    /**
     * Called by Swift after speech recognition completes.
     * Only builds a transaction for the confirmation screen: it is not persisted
     * here, because saving happens when the user taps "Confirmar".
     * Returns null if no value could be parsed from the transcript.
     */
    fun previewVoiceTranscript(text: String): Transaction? {
        val parsed = parseVoiceTranscript(text) ?: return null
        val latest = store.latestMood()
        return Transaction(
            id = "",
            value = parsed.first,
            category = parsed.second,
            type = TxType.SAIDA,
            paymentMethod = PaymentMethod.CONTA_CORRENTE,
            description = parsed.third,
            moodId = latest?.id,
            mood = latest?.mood,
            timestampMs = store.nowMs(),
            sleeping = false,
            sleepUntilMs = null,
            excludeFromSavingsAdvice = false
        )
    }

    private fun parseVoiceTranscript(text: String): Triple<Double, Category, String>? {
        val normalized = text.lowercase().trim()
        val valueMatch = Regex("(\\d+[.,]?\\d{0,2})").find(normalized)
        val valueStr = valueMatch?.groupValues?.get(1)?.replace(",", ".")
        val value = valueStr?.toDoubleOrNull()
        if (value == null || value <= 0.0) return null

        val categoryMap = listOf(
            Triple(listOf("gasolina", "etanol", "diesel", "combustivel", "combustível", "posto"), Category.COMBUSTIVEL, "Combustível"),
            Triple(listOf("uber", "onibus", "ônibus", "metro", "metrô", "taxi", "táxi", "transporte"), Category.TRANSPORTE, "Transporte"),
            Triple(listOf("mercado", "comida", "almoco", "almoço", "janta", "jantar", "sushi", "lanche", "restaurante", "padaria", "alimentação", "alimentacao"), Category.ALIMENTACAO, "Alimentação"),
            Triple(listOf("netflix", "cinema", "show", "bar", "lazer", "jogo", "entretenimento"), Category.LAZER, "Lazer"),
            Triple(listOf("curso", "livro", "faculdade", "escola", "educacao", "educação", "aula"), Category.EDUCACAO, "Educação"),
            Triple(listOf("farmacia", "farmácia", "medico", "médico", "saude", "saúde", "consulta", "exame", "remedio", "remédio"), Category.SAUDE, "Saúde"),
            Triple(listOf("aluguel", "condominio", "condomínio", "agua", "água", "luz", "internet", "moradia", "casa"), Category.MORADIA, "Moradia"),
            Triple(listOf("roupa", "camisa", "tenis", "tênis", "calcado", "calçado", "vestuário", "vestuario"), Category.VESTUARIO, "Vestuário")
        )

        val detected = categoryMap.find { (keywords, _, _) ->
            keywords.any { normalized.contains(it) }
        }

        return if (detected != null) {
            Triple(value, detected.second, detected.third)
        } else {
            Triple(value, Category.OUTROS, "Despesa por voz")
        }
    }
}
