# Cordova Android Build Reference

## APK Signing for Release

Release APKs must be signed before they can be distributed on Google Play Store or installed on devices.

### Generate a Keystore

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Sign the APK

After building a release APK, sign it:

```bash
# Align the APK
zipalign -v -p 4 app-release-unsigned.apk app-release-unsigned-aligned.apk

# Sign the APK
apksigner sign --ks my-release-key.keystore \
  --out app-release-signed.apk \
  app-release-unsigned-aligned.apk

# Verify the signature
apksigner verify app-release-signed.apk
```

### Automated Signing with build.json

Create a `build.json` file in the Cordova project root:

```json
{
  "android": {
    "release": {
      "keystore": "path/to/my-release-key.keystore",
      "storePassword": "your-keystore-password",
      "alias": "my-key-alias",
      "password": "your-key-password",
      "keystoreType": ""
    }
  }
}
```

Then build with: `cordova build android --release`

**Security Note**: Never commit `build.json` with passwords to version control. Use environment variables or secure credential storage.

## Build Configurations

### Version Management

Update version in `config.xml`:

```xml
<widget id="com.example.app" version="1.2.3" android-versionCode="10203">
```

- `version`: Human-readable version (e.g., "1.2.3")
- `android-versionCode`: Integer that must increase with each release

### Build Variants

Cordova supports different build variants through Gradle:

```xml
<!-- In config.xml -->
<platform name="android">
    <preference name="android-minSdkVersion" value="22" />
    <preference name="android-targetSdkVersion" value="33" />
    <preference name="android-compileSdkVersion" value="33" />
</platform>
```

### ProGuard (Code Obfuscation)

Enable ProGuard for release builds by adding to `config.xml`:

```xml
<platform name="android">
    <preference name="android-minifyEnabled" value="true" />
</platform>
```

## Common Build Issues

### Gradle Build Failures

**Issue**: `Could not find com.android.tools.build:gradle`

**Solution**: Update Android SDK and Gradle wrapper:
```bash
cd platforms/android
./gradlew wrapper --gradle-version=7.6
```

### Out of Memory Errors

**Issue**: `java.lang.OutOfMemoryError: Java heap space`

**Solution**: Increase Gradle memory in `platforms/android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### SDK Version Conflicts

**Issue**: Plugin requires different SDK version

**Solution**: Check plugin compatibility and update `config.xml` preferences to match required SDK versions.

## APK Analysis

### Check APK Contents

```bash
# List files in APK
unzip -l app-debug.apk

# Extract APK
unzip app-debug.apk -d extracted/

# Analyze APK size
apkanalyzer apk file-size app-debug.apk
```

### Test APK Installation

```bash
# Install on connected device
adb install app-debug.apk

# Install and replace existing
adb install -r app-debug.apk

# Uninstall
adb uninstall com.example.app
```

## Build Optimization

### Reduce APK Size

1. Enable ProGuard/R8 (code shrinking)
2. Use WebP images instead of PNG/JPG
3. Remove unused resources
4. Enable APK splitting by ABI:

```xml
<platform name="android">
    <preference name="android-enableAbiSplit" value="true" />
</platform>
```

### Build Performance

Speed up builds by enabling Gradle daemon and parallel execution in `platforms/android/gradle.properties`:

```
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```
