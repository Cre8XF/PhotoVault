#!/bin/bash
# Production build script for Netlify
# Disables "treat warnings as errors" behavior in CI environments

# Set CI to false temporarily to allow warnings (but keep other CI behavior)
# This is needed because @ffmpeg/ffmpeg uses dynamic imports that trigger webpack warnings
export CI=false

# Run the build
npm run build

# Capture exit code
EXIT_CODE=$?

# Exit with the build's exit code
exit $EXIT_CODE
