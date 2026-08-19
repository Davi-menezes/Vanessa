plugins {
    id("org.jetbrains.kotlin.multiplatform") version "1.9.25"
    id("com.android.library") version "8.5.2"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.25"
    id("app.cash.sqldelight") version "2.0.2"
}

kotlin {
    applyDefaultHierarchyTemplate()
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework {
            baseName = "VanessaShared"
            isStatic = true
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.25")
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
            implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.0")
            implementation("org.jetbrains.kotlin:kotlincrypto-core:0.5.0")
            implementation("com.russhwolf:multiplatform-settings:1.1.1")
            implementation("app.cash.sqldelight:runtime:2.0.2")
            implementation("app.cash.sqldelight:coroutines-extensions:2.0.2")
        }
        androidMain.dependencies {
            implementation("com.russhwolf:multiplatform-settings-datastore:1.1.1")
            implementation("app.cash.sqldelight:android-driver:2.0.2")
        }
        iosMain.dependencies {
            implementation("com.russhwolf:multiplatform-settings-nsuserdefaults:1.1.1")
            implementation("app.cash.sqldelight:native-driver:2.0.2")
        }
    }
}

android {
    namespace = "com.vanessa.shared"
    compileSdk = 34
    defaultConfig {
        minSdk = 24
    }
}

sqldelight {
    databases {
        create("VanessaDatabase") {
            packageName.set("com.vanessa.db")
        }
    }
}
