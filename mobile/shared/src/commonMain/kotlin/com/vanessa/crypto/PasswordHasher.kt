package com.vanessa.crypto

import kotlincrypto.core.digest.Digest
import kotlincrypto.core.digest.Sha256
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable
import kotlin.random.Random

@Serializable
private data class HashedPassword(val salt: String, val hash: String)

class PasswordHasher {
    fun hash(password: String): String {
        val saltBytes = Random.nextBytes(16)
        val salt = saltBytes.joinToString("") { "%02x".format(it) }
        val toHash = password + ":" + salt
        val digest: Digest = Sha256()
        val raw = digest.digest(toHash.encodeToByteArray())
        val hex = raw.joinToString("") { "%02x".format(it) }
        return Json.encodeToString(HashedPassword(salt, hex))
    }
}
