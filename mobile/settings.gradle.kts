pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        flatDir {
            dirs("/tmp/kotlin-native-cache")
        }
    }
}

rootProject.name = "VanessaKMP"

include(":shared")
include(":androidApp")
