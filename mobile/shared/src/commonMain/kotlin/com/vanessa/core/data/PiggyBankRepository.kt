package com.vanessa.core.data

import com.vanessa.core.domain.PiggyBank
import com.vanessa.db.VanessaDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

class PiggyBankRepository(private val db: VanessaDatabase) {
    private val _items = MutableStateFlow<List<PiggyBank>>(emptyList())
    val items = _items.asStateFlow()

    init { refresh() }

    fun refresh() {
        _items.value = db.piggyBankQueries.selectAll().executeAsList().map {
            PiggyBank(it.id, it.name, it.savedAmount, it.targetAmount, Instant.fromEpochMilliseconds(it.createdAtEpoch))
        }
    }

    fun add(name: String, saved: Double, target: Double): PiggyBank {
        val now = Clock.System.now()
        val pb = PiggyBank(VanessaRepository.newId(), name, saved, target, now)
        db.piggyBankQueries.insert(pb.id, pb.name, pb.savedAmount, pb.targetAmount, now.toEpochMilliseconds())
        refresh()
        return pb
    }

    fun update(id: String, saved: Double) {
        val current = _items.value.firstOrNull { it.id == id } ?: return
        db.piggyBankQueries.update(current.name, saved, current.targetAmount)
        refresh()
    }

    fun delete(id: String) {
        db.piggyBankQueries.delete(id)
        refresh()
    }
}
