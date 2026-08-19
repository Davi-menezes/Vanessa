package com.vanessa.core.ui

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

abstract class StateHolder<S>(initial: S) {
    private val _state = MutableStateFlow(initial)
    val state: StateFlow<S> = _state

    protected fun setState(reducer: (S) -> S) = _state.update(reducer)
    fun current(): S = _state.value
    fun snapshot(): S = _state.value
}

abstract class MviViewModel<S, I>(initial: S) : StateHolder<S>(initial) {
    abstract fun onIntent(intent: I, scope: CoroutineScope)
}


