---
name: cordova-android-build
description: Build Apache Cordova applications into Android APK packages. Use when working with Cordova projects and need to (1) Build debug APK for testing, (2) Build release APK for distribution, (3) Package the app for Android devices, (4) Sign APKs for Google Play Store, or (5) Troubleshoot build issues. Triggers on requests like "build Android APK", "package Cordova app", "create APK", or "build for Android".
---

# Cordova Android Build

Build Apache Cordova applications into Android APK packages for testing and distribution.

## Quick Start

### Build Debug APK

For development and testing:

```bash
bash scripts/build_android.sh --debug --dir /path/to/cordova/project
```

Output: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK

For production distribution:

```bash
bash scripts/build_android.sh --release --dir /path/to/cordova/project
```

Output: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Note**: Release APKs must be signed before distribution. See [signing_and_config.md](references/signing_and_config.md) for signing instructions.

## Build Script Options

The `scripts/build_android.sh` script supports:

- `--debug`: Build debug APK (default, includes debugging symbols)
- `--release`: Build release APK (optimized, requires signing)
- `--dir <path>`: Specify Cordova project directory (default: current directory)
- `--help`: Show usage information

## Prerequisites

Ensure the following are installed:

1. **Node.js and npm**: Required for Cordova CLI
2. **Cordova CLI**: Install with `npm install -g cordova`
3. **Android SDK**: Required for building Android apps
4. **Java JDK**: Required by Android build tools
5. **Gradle**: Usually installed automatically by Cordova

Verify installation:
```bash
cordova requirements android
```

## Common Workflows

### First-Time Build

If Android platform is not yet added:

```bash
cd /path/to/cordova/project
cordova platform add android
bash /path/to/skill/scripts/build_android.sh --debug
```

The build script automatically adds the Android platform if missing.

### Build and Install on Device

```bash
# Build debug APK
bash scripts/build_android.sh --debug --dir /path/to/project

# Install on connected device
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Release Build

1. Build release APK:
```bash
bash scripts/build_android.sh --release --dir /path/to/project
```

2. Sign the APK (see [signing_and_config.md](references/signing_and_config.md))

3. Verify signature:
```bash
apksigner verify app-release-signed.apk
```

## Advanced Configuration

For detailed information on:
- **APK Signing**: Keystore generation, signing process, automated signing
- **Build Configuration**: Version management, SDK versions, ProGuard
- **Troubleshooting**: Common build errors and solutions
- **Optimization**: Reducing APK size, improving build performance

See [signing_and_config.md](references/signing_and_config.md)

## Troubleshooting

### Build Fails with "config.xml not found"

Ensure you're in the Cordova project root directory or use `--dir` to specify the correct path.

### Gradle Build Errors

Update Gradle wrapper:
```bash
cd platforms/android
./gradlew wrapper --gradle-version=7.6
```

### SDK Version Conflicts

Check `config.xml` for SDK version preferences and ensure they match installed SDK versions:
```xml
<preference name="android-minSdkVersion" value="22" />
<preference name="android-targetSdkVersion" value="33" />
```

### Out of Memory Errors

Increase Gradle memory in `platforms/android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m
```

For more troubleshooting guidance, see [signing_and_config.md](references/signing_and_config.md).

## Resources

### scripts/build_android.sh
Automated build script that handles the complete Cordova Android build process, including platform verification, dependency checks, and APK generation.

### references/signing_and_config.md
Comprehensive reference for APK signing, build configurations, optimization techniques, and troubleshooting common build issues.
