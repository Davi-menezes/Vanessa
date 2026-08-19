package com.vanessa.feature.audio

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import java.io.File

class AudioRecorder(private val context: Context) {
    private var recorder: MediaRecorder? = null
    private var outputFile: File? = null

    fun start(): Boolean {
        return try {
            val file = File(context.cacheDir, "vanessa_${System.currentTimeMillis()}.m4a")
            outputFile = file
            val r = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION") MediaRecorder()
            }
            r.setAudioSource(MediaRecorder.AudioSource.MIC)
            r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            r.setOutputFile(file.absolutePath)
            r.prepare()
            r.start()
            recorder = r
            true
        } catch (_: Throwable) {
            recorder = null
            false
        }
    }

    fun stop(): File? {
        val r = recorder ?: return null
        return try {
            r.stop()
            r.release()
            recorder = null
            outputFile
        } catch (_: Throwable) {
            null
        }
    }

    fun isRecording(): Boolean = recorder != null
}

actual class AudioCapture actual constructor() {
    private lateinit var recorder: AudioRecorder
    actual fun startRecording() {
        recorder.start()
    }

    actual fun stopRecording(): ShortArray? {
        recorder.stop()
        return null
    }

    actual fun transcribe16khzPcm(pcm: ShortArray): String = ""

    actual fun parseTransactionFromText(text: String): AudioExtraction? =
        portugueseTransactionParser.parse(text)
}

object portugueseTransactionParser {
    fun parse(text: String): AudioExtraction? {
        val valueRegex = Regex("(\\d+[\\.,]?\\d*)")
        val match = valueRegex.find(text) ?: return null
        val raw = match.groupValues[1].replace('.', ',').replace(',', '.')
        val value = raw.toDoubleOrNull() ?: return null
        val desc = text.replace(match.range.first, match.range.last + 1, "")
            .replace("gastei", "", ignoreCase = true)
            .replace("reais", "", ignoreCase = true)
            .replace("em", "", ignoreCase = true)
            .trim()
        val cat = when {
            desc.contains("almoco", true) || desc.contains("jantar", true) ||
            desc.contains("comida", true) || desc.contains("mercado", true) -> "alimentacao"
            desc.contains("uber", true) || desc.contains("taxi", true) ||
            desc.contains("onibus", true) -> "transporte"
            desc.contains("gasolina", true) || desc.contains("combustivel", true) -> "combustivel"
            desc.contains("cinema", true) || desc.contains("bar", true) ||
            desc.contains("show", true) -> "lazer"
            desc.contains("remedio", true) || desc.contains("farmacia", true) -> "saude"
            desc.contains("curso", true) || desc.contains("livro", true) -> "educacao"
            desc.contains("aluguel", true) || desc.contains("condominio", true) -> "moradia"
            desc.contains("roupa", true) || desc.contains("sapato", true) -> "vestuario"
            else -> "outros"
        }
        return AudioExtraction(value, cat, desc.ifBlank { "Transacao por voz" })
    }
}
