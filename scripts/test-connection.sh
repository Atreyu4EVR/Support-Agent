#!/bin/bash

# Test script to check backend connectivity
echo "Testing backend connectivity..."

# Get the backend URL from environment
BACKEND_URL=${VITE_API_URL:-"http://localhost:3001"}
echo "Backend URL: $BACKEND_URL"

# Test basic connectivity
echo "Testing basic connectivity..."
curl -f -s "$BACKEND_URL/api/health" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is reachable"
else
    echo "❌ Backend is not reachable"
    echo "Response:"
    curl -v "$BACKEND_URL/api/health" 2>&1
fi

# Test with timeout
echo "Testing with timeout..."
timeout 10 curl -f -s "$BACKEND_URL/api/health" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend responds within timeout"
else
    echo "❌ Backend timeout or not responding"
fi

# Test DNS resolution
echo "Testing DNS resolution..."
if [[ "$BACKEND_URL" == http* ]]; then
    HOST=$(echo "$BACKEND_URL" | sed -E 's|^https?://([^:/]+).*|\1|')
    echo "Host: $HOST"
    nslookup "$HOST" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ DNS resolution successful"
    else
        echo "❌ DNS resolution failed"
    fi
fi