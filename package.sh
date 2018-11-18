#!/usr/bin/env bash

# Package script by @keesvv.
# I use this to ship Delta.
# If you want to use it yourselves,
# install electron-packager globally using NPM.

# Get the package version
version=$(jq -r .version package.json)
prefix="Delta-v$version"

# OS specific filenames
windows="$prefix-windows"
macos="$prefix-macOS"
linux="$prefix-linux"

# Package Delta using electron-packager
echo "Packaging Delta v$version..."
npm run package

# Move all build folders into build directory
mkdir build
mv Delta-* build

# Rename build folders
cd build
mv "Delta-win32-x64" "$windows"
mv "Delta-darwin-x64" "$macos"
mv "Delta-linux-x64" "$linux"

# Compress all builds
zip -r "$windows.zip" "$windows"
zip -r "$macos.zip" "$macos"
zip -r "$linux.zip" "$linux"

# Clean up
echo "Cleaning up..."
rm -R $windows $macos $linux

# Print the build files
echo "Done."
ls -lh
