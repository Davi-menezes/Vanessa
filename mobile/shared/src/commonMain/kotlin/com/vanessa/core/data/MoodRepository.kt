package com.vanessa.core.data

import com.vanessa.core.domain.MoodEntry
import com.vanessa.core.domain.MoodType
import com.vanessa.data.VanessaRepository
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

class MoodRepository(private val db: VanessaDatabase) {
    private val _latest = MutableStateFlow<MoodEntry?>(null)
    val latest: Flow<MoodEntry?> get() = _latest.asStateFlow()

    init { refresh() }

    fun refresh() {
        _latest.value = db.moodQueries.selectLatestMood().executeAsOneOrNull()?.toDomain()
    }

    fun addMood(type: MoodType): MoodEntry {
        val now = Clock.System.now()
        val entry = MoodEntry(id = VanessaRepository.newId(), mood = type, timestamp = now)
        db.moodQueries.insertMood(entry.id, entry.mood.name, now.toEpochMilliseconds())
        refresh()
        return entry
    }

    private fun com.vanessa.db.Mood.toDomain(): MoodEntry = MoodEntry(
        id = id,
        mood = MoodType.valueOf(mood),
        timestamp = Instant.fromEpochMilliseconds(timestampEpoch)
    )
}
