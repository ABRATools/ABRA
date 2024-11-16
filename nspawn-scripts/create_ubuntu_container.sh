#!/bin/bash

# Check if the script is run as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root."
    exit
fi

# Variables
CONTAINER_NAME="ubuntu-container"
CONTAINER_DIR="/var/lib/machines/$CONTAINER_NAME"
UBUNTU_VERSION="22.04"
ARCH="amd64"
BASE_URL="http://cdimage.ubuntu.com/ubuntu-base/releases/$UBUNTU_VERSION/release"
FILENAME="ubuntu-base-$UBUNTU_VERSION-base-$ARCH.tar.gz"
DOWNLOAD_URL="$BASE_URL/$FILENAME"

# Create the container directory
mkdir -p "$CONTAINER_DIR"

# Change to the container directory
cd "$CONTAINER_DIR" || exit

# Download the Ubuntu root filesystem
echo "Downloading Ubuntu root filesystem..."
curl -O "$DOWNLOAD_URL"

# Extract the root filesystem
echo "Extracting Ubuntu root filesystem..."
tar xzf "$FILENAME" --numeric-owner

# Remove the downloaded tarball
rm "$FILENAME"

# Set SELinux context if SELinux is enabled
if command -v chcon >/dev/null 2>&1; then
    echo "Setting SELinux context..."
    chcon -R -t container_file_t "$CONTAINER_DIR"
fi

# Start the container
echo "Starting the container..."
systemd-nspawn -D "$CONTAINER_DIR" --machine="$CONTAINER_NAME"
