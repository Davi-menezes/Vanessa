package com.vanessa.feature.audio

data class AudioExtraction(
    val value: Double,
    val category: String,
    val description: String
)

expect class AudioCapture() {
    fun startRecording()
    fun stopRecording(): ShortArray?
    fun transcribe16khzPcm(pcm: ShortArray): String
    fun parseTransactionFromText(text: String): AudioExtraction?
}
