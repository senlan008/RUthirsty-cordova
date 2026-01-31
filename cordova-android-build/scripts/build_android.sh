#!/bin/bash
# Cordova Android Build Script
# Builds the Cordova application into an Android APK

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BUILD_TYPE="debug"
CORDOVA_DIR="."

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --debug)
            BUILD_TYPE="debug"
            shift
            ;;
        --dir)
            CORDOVA_DIR="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --debug          Build debug APK (default)"
            echo "  --release        Build release APK (requires signing)"
            echo "  --dir <path>     Cordova project directory (default: current directory)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Change to Cordova directory
cd "$CORDOVA_DIR"

# Check if this is a Cordova project
if [ ! -f "config.xml" ]; then
    echo -e "${RED}Error: config.xml not found. This doesn't appear to be a Cordova project.${NC}"
    exit 1
fi

echo -e "${GREEN}Building Cordova Android application...${NC}"
echo -e "Build type: ${YELLOW}${BUILD_TYPE}${NC}"
echo -e "Project directory: ${YELLOW}$(pwd)${NC}"
echo ""

# Check if Android platform is added
if [ ! -d "platforms/android" ]; then
    echo -e "${YELLOW}Android platform not found. Adding it now...${NC}"
    cordova platform add android
fi

# Build the application
echo -e "${GREEN}Starting build process...${NC}"
if [ "$BUILD_TYPE" = "release" ]; then
    cordova build android --release
    APK_PATH="platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    echo -e "${GREEN}✓ Release APK built successfully!${NC}"
    echo -e "${YELLOW}Note: Release APK is unsigned. You need to sign it before distribution.${NC}"
else
    cordova build android --debug
    APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo -e "${GREEN}✓ Debug APK built successfully!${NC}"
fi

# Display APK location
if [ -f "$APK_PATH" ]; then
    echo -e "APK location: ${YELLOW}$(realpath $APK_PATH)${NC}"
    echo -e "APK size: ${YELLOW}$(du -h $APK_PATH | cut -f1)${NC}"
else
    echo -e "${RED}Warning: APK not found at expected location: $APK_PATH${NC}"
fi

echo ""
echo -e "${GREEN}Build complete!${NC}"
