# Vanessa Mobile (Kotlin Multiplatform)

App nativo iOS + Android com o mesmo design e funcionalidades da versão web Next.js, escrito em **Kotlin Multiplatform** com **SwiftUI** (iOS) e **Jetpack Compose** (Android).

## Estrutura

```
mobile/
├─ settings.gradle.kts          # Módulos: shared, androidApp
├─ build.gradle.kts             # Plugins versionados
├─ gradle/libs.versions.toml    # Catálogo de dependências
├─ shared/                      # Módulo Kotlin Multiplatform (lógica + DB + estado)
│  ├─ src/commonMain/kotlin/    # Domain, data, viewmodels, audio
│  ├─ src/androidMain/kotlin/   # Drivers Android (SQLDelight, Settings)
│  └─ src/iosMain/kotlin/       # Drivers iOS (SQLDelight, AVAudioRecorder)
├─ androidApp/                  # App Android (Jetpack Compose)
│  ├─ src/main/AndroidManifest.xml
│  └─ src/main/java/com/vanessa/# MainActivity + 6 telas Compose
├─ iosApp/                      # App iOS (SwiftUI)
│  ├─ project.yml               # XcodeGen
│  └─ Vanessa/                  # App + 6 telas SwiftUI
└─ gradlew, gradle/wrapper/     # Bootstrap do Gradle
```

## Pré-requisitos

- **Android:** Android Studio Koala+ (Android SDK 34), JDK 17, `ANDROID_HOME` configurado
- **iOS:** Xcode 16+, XcodeGen (`brew install xcodegen`)
- **macOS apenas para iOS:** você está em macOS, então OK

## Setup inicial (uma vez)

```bash
cd mobile

# Gera gradle-wrapper.jar (~70kb) usando a sua instalação de Gradle
gradle wrapper --gradle-version=8.10.2

# Cria o local.properties com SDK do Android (ajuste se necessário)
cp local.properties.template local.properties
```

## Build

### Android
```bash
cd mobile
./gradlew :shared:assembleDebug       # Compila o framework Kotlin compartilhado
./gradlew :androidApp:assembleDebug   # Gera o APK
# Saída: androidApp/build/outputs/apk/debug/app-debug.apk
```

### Instalar no seu celular Android (USB)
1. Ative "Opções do desenvolvedor" (Config → Sobre o telefone → toque 7× no Número da build)
2. Ative "Depuração USB"
3. Conecte via USB
4. `adb devices` (confirma que aparece)
5. `./gradlew :androidApp:installDebug`
6. Abra o app "Vanessa" no celular

### iOS
```bash
cd mobile
./gradlew :shared:linkDebugFrameworkIosSimulatorArm64   # Compila o framework iOS

# Gera o Xcode project
cd iosApp
xcodegen generate
open Vanessa.xcodeproj
```
No Xcode: selecione o simulador (iPhone 14 Pro), pressione **⌘R** para rodar.

Para instalar em **iPhone físico** você precisa de uma conta Apple Developer ($99/ano):
1. Xcode → Signing & Capabilities → selecione seu Team
2. Conecte o iPhone, aceite "Confiar neste computador"
3. ⌘R para instalar

## Funcionalidades (idênticas ao web)

| Funcionalidade          | Android | iOS |
|-------------------------|---------|-----|
| Auth (login/signup/reset)| ✓      | ✓   |
| Mood check-in           | ✓       | ✓   |
| Impulsivity alert       | ✓       | ✓   |
| Lista de transações     | ✓       | ✓   |
| Cadastro de transações  | ✓       | ✓   |
| Insights (por humor/cat)| ✓       | ✓   |
| Planej. (cofrinhos/metas/fixos)| ✓ | ✓ |
| Áudio (transação por voz)| ✓      | ✓   |
| Limpar histórico        | ✓       | ✓   |

## Persistência
- **Android:** SQLDelight (SQLite) + EncryptedSharedPreferences 
- **iOS:** SQLDelight (SQLite nativo) + NSUserDefaults
- Mesmo schema serializado → dados portáveis entre plataformas

## Próximos passos para produção
1. Adicionar ícone próprio (substitui `ic_launcher_foreground.xml` e AppIcon)
2. Splash screen
3. Migrar áudio para STT real (WhisperLocal / iOS Speech) — atual é stub
4. Renomear `applicationId`/`bundleId` para o domínio definitivo
5. Configurar CI (Fastlane para iOS, Gradle Play Publisher)

## Troubleshooting

**"SDK location not found"**: edite `mobile/local.properties` → `sdk.dir=/Users/SEUUSER/Library/Android/sdk`

**"gradle-wrapper.jar not found"**: rode `gradle wrapper` (Gradle CLI já precisa estar instalado)

**Build Android falha em Compose**: confirme Compose Compiler 1.5.15+ e `kotlinCompilerExtensionVersion` no `androidApp/build.gradle.kts`

**Xcode "VanessaShared not found"**: rode `./gradlew :shared:linkDebugFrameworkIosSimulatorArm64` antes de gerar o project
