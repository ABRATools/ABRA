#!/bin/bash

# Create necessary directories if they don't exist
mkdir -p ../backend/static
mkdir -p ../backend/static/assets

# Compile tailwind
npx tailwindcss -i ./src/index.css -o ./src/output.css

# Build the frontend
tsc && vite build

# Copy all assets to backend static folder
cp -r ./dist/assets/* ../backend/static/assets/

# Copy public assets (like vite.svg)
cp -r ./public/* ../backend/static/

# Copy the index.html to templates
cp ./dist/index.html ../backend/templates/index.html

# Copy the output.css
cp -p ./src/output.css ../backend/static/output.css