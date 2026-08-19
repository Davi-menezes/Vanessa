plugins {
    kotlin("multiplatform")
    kotlin("native.cocoapods")
}

version = "1.0-SNAPSHOT"

kotlin {
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    cocoapods {
        summary = "mdmr — Assistente Financeiro Comportamental (shared UI module)"
        homepage = "https://mdmr.app"
        ios.deploymentTarget = "14.1"
        framework {
            baseName = "shared"
            isStatic = true
        }
        podfile = project.file("../iosApp/Podfile")
    }

    targets.configureEach {
        compilations.all {
            kotlinOptions.freeCompilerArgs = (kotlinOptions.freeCompilerArgs + listOf(
                "-Xbinary=bundleId=com.vanessa.shared"
            ))
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
