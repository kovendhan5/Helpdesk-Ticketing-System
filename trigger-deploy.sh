#!/bin/bash
# 🚀 Deployment Trigger Script
# Run this after setting up GitHub secrets

echo "🚀 Triggering GitHub Actions Deployment..."
echo "Timestamp: $(date)"

# Create a deployment log entry
echo "# Deployment Trigger - $(date)" >> DEPLOYMENT_LOG.md
echo "SSH Setup Complete - Ready for Production Deployment!"

# Add changes and trigger deployment
git add .
git commit -m "🚀 Trigger production deployment - $(date)"
git push origin main

echo "✅ Deployment triggered successfully!"
echo "🌐 Monitor progress at: https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions"
echo "🎯 Once complete, access your application at: http://34.173.186.108"
