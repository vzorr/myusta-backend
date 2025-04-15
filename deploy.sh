#!/bin/bash

cd /root/myusta-backend || exit
echo "📥 Pulling latest code..."
git pull origin dev
echo "📦 Installing packages..."
npm install 
echo "🚀 Restarting PM2 App..."
pm2 restart myusta-backend
echo "✅ Deployment completed successfully!"