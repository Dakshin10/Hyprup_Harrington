#!/bin/bash

echo "========================================================"
echo "🚀 Starting WorkHop Initialization..."
echo "========================================================"

cd workhop || exit

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚡ Starting the development server..."
npm run dev
