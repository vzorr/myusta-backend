#!/bin/bash

echo "🚀 Deployment started at dev $(date)"

# Go to project directory
cd /root/myusta-backend || exit

echo "📥 Pulling latest code..."
git reset --hard
git pull origin dev

echo "📦 Installing dependencies..."
npm install 

echo "🔁 Restarting PM2 app..."
pm2 restart myusta-api

echo "✅ Deployment done at $(date)"
