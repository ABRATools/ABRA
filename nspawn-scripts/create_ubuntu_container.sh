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

# Install necessary packages
echo "Installing necessary packages..."
dnf install -y systemd-container curl

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
if sestatus | grep -q "SELinux status:.*enabled"; then
    echo "Setting SELinux context..."
    chcon -R -t container_file_t "$CONTAINER_DIR"
fi

# Configure the container (optional)
echo "Configuring the container..."

# For example, set the container's hostname
echo "$CONTAINER_NAME" > "$CONTAINER_DIR"/etc/hostname

# Enable and start the container as a systemd service
echo "Enabling and starting the container as a background service..."
systemctl enable systemd-nspawn@"$CONTAINER_NAME".service
systemctl start systemd-nspawn@"$CONTAINER_NAME".service

echo "Container '$CONTAINER_NAME' is now running persistently in the background."
