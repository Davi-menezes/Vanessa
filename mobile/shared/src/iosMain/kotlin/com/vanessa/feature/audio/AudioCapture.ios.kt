package com.vanessa.feature.audio

import platform.AVFAudio.AVAudioRecorder
import platform.AVFAudio.AVAudioSession
import platform.AVFAudio.AVFormatIDKey
import platform.AVFAudio.AVNumberOfChannelsKey
import platform.AVFAudio.AVRecorderIsMeteringEnabledKey
import platform.AVFAudio.AVSampleRateKey
import platform.AVFAudio.AVAudioSessionRecordPermission
import platform.AVFAudio.AVAudioApplicationRecordPermissionGranted

actual class AudioCapture actual constructor() {
    private var recorder: AVAudioRecorder? = null
    private var writePath: String? = null

    actual fun startRecording() {
        val session = AVAudioSession.sharedInstance()
        session.requestRecordPermission { granted ->
            if (!granted) return@requestRecordPermission
            session.setCategory(platform.AVFAudio.AVAudioSessionCategoryPlayAndRecord, null)
            session.setActive(true, null)
            val dir = platform.Foundation.NSTemporaryDirectory()
            val path = "$dir/vanessa_${Clock_mark()}.m4a"
            writePath = path
            val url = platform.Foundation.NSURL.fileURLWithPath(path)
            val settings = mapOf<Any?, Any?>(
                AVFormatIDKey to platform.AVFAudio.kAudioFormatMPEG4AAC,
                AVSampleRateKey to 16000.0,
                AVNumberOfChannelsKey to 1,
                AVRecorderIsMeteringEnabledKey to true
            )
            recorder = AVAudioRecorder(u = url, settings = settings as Map<Any?, *>, error = null)
            recorder?.prepareToRecord()
            recorder?.record()
        }
    }

    actual fun stopRecording(): ShortArray? {
        val r = recorder ?: return null
        r.stop()
        r.release()
        recorder = null
        return null
    }

    actual fun transcribe16khzPcm(pcm: ShortArray): String = ""

    actual fun parseTransactionFromText(text: String): AudioExtraction? =
        AudioCapture.parsePT(text)
}

private fun Clock_mark(): String {
    return platform.Foundation.NSDate().timeIntervalSince1970.toString()
}

internal fun AudioCapture.Companion.parsePT(text: String): AudioExtraction? {
    val valueRegex = Regex("(\\d+[\\.,]?\\d*)")
    val match = valueRegex.find(text) ?: return null
    val raw = match.groupValues[1].replace('.', ',').replace(',', '.')
    val value = raw.toDoubleOrNull() ?: return null
    val desc = text.replace(Regex("(\\d+[\\.,]?\\d*)"), "")
        .replace("gastei", "", ignoreCase = true)
        .replace("reais", "", ignoreCase = true)
        .replace("em", "", ignoreCase = true)
        .trim()
    val cat = when {
        desc.contains("almoco", true) || desc.contains("jantar", true) ||
        desc.contains("comida", true) || desc.contains("mercado", true) -> "alimentacao"
        desc.contains("uber", true) || desc.contains("taxi", true) -> "transporte"
        desc.contains("gasolina", true) || desc.contains("combustivel", true) -> "combustivel"
        desc.contains("cinema", true) || desc.contains("bar", true) -> "lazer"
        desc.contains("remedio", true) || desc.contains("farmacia", true) -> "saude"
        desc.contains("curso", true) || desc.contains("livro", true) -> "educacao"
        desc.contains("aluguel", true) || desc.contains("condominio", true) -> "moradia"
        desc.contains("roupa", true) || desc.contains("sapato", true) -> "vestuario"
        else -> "outros"
    }
    return AudioExtraction(value, cat, desc.ifBlank { "Transacao por voz" })
}
