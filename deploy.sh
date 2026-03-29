#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting LuxeStay Deployment Process..."

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

# 2. Stop and remove existing containers
echo "🧹 Cleaning up old containers..."
docker-compose down --remove-orphans

# 3. Build and Start Services
echo "🏗️ Building and Launching Services..."
docker-compose up --build -d

echo "✅ Deployment Successful!"
echo "🌐 Frontend: http://localhost"
echo "🌐 Backend: http://localhost:8082"
echo "📊 Database: localhost:3306"

# 4. View logs
echo "📝 Tailing logs (Ctrl+C to exit)..."
docker-compose logs -f
