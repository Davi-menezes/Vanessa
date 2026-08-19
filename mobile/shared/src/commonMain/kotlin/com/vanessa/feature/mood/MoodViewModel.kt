package com.vanessa.feature.mood

import com.vanessa.core.data.AppGraph
import com.vanessa.core.domain.MoodType
import com.vanessa.core.ui.StateHolder

class MoodViewModel(private val graph: AppGraph) : StateHolder<MoodUiState>(MoodUiState()) {
    fun pickMood(type: MoodType): MoodPickResult {
        val entry = graph.mood.addMood(type)
        return MoodPickResult(entry, type.isImpulsive)
    }
}

data class MoodUiState(val showImpulsiveAfter: Boolean = false)

data class MoodPickResult(val entry: com.vanessa.core.domain.MoodEntry, val isImpulsive: Boolean)
