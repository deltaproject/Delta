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

# Download a fresh copy of DeltaSetup
git clone https://github.com/deltaproject/DeltaSetup deltasetup

# Compile Windows setup
cp -r $windows deltasetup/input
cd deltasetup
cat DeltaSetup.iss | sed "s/0.0.0/$version/g" > .compile.iss
innosetup-compiler .compile.iss --verbose
mv output/*.exe ..
cd ..

# Compress all builds
zip -r "$macos.zip" "$macos"
zip -r "$linux.zip" "$linux"

# Clean up
echo "Cleaning up..."
rm -rf $windows $macos $linux deltasetup

# Print the build files
echo "Done."
ls -lh
