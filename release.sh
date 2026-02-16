#!/bin/bash
set -e

# get version from package.json
VERSION=$(jq -r '.version' package.json)
echo "Building version $VERSION..."

# run build
bun run build

# create Releases dir if not exists
mkdir -p releases

# go into dist, zip everything inside as reels-queue-VERSION.zip
cd dist
zip -r ../releases/reels-queue-$VERSION.zip ./*
cd ..

echo "Release created: releases/reels-queue-$VERSION.zip"
