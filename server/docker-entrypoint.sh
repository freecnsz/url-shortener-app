#!/bin/bash
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running admin seeder..."
npm run seed:admin || echo "⚠️ Admin seeder failed or already exists."

echo "🚀 Starting the application..."
exec "$@"
