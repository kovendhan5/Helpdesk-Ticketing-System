@echo off
echo ================================================================
echo               QUICK DEPLOYMENT FIX - FRONTEND RETRY
echo ================================================================
echo.
echo 🔍 Current deployment analysis:
echo    ✅ Database: Healthy
echo    ⚠️  Backend: Starting (health check pending)
echo    ❌ Frontend: Build failed (network timeout)
echo.
echo 🛠️ Applying fixes:
echo    1. Enhanced npm retry configuration
echo    2. Alternative registry fallback
echo    3. Increased timeout values
echo.
echo ================================================================
echo                        RETRY DEPLOYMENT
echo ================================================================
echo.
echo 🚀 Pushing enhanced frontend configuration...

git add frontend/Dockerfile
git commit -m "Fix frontend build: Enhanced npm retry config with fallback registry and increased timeouts"
git push origin main

echo.
echo ✅ Enhanced frontend configuration pushed to GitHub
echo.
echo 🔄 GitHub Actions will automatically retry deployment...
echo.
echo ⏰ Expected deployment time: 5-8 minutes
echo.
echo 📊 You can monitor progress at:
echo    https://github.com/kovendhan5/Helpdesk-Ticketing-System/actions
echo.
echo ================================================================
echo                      WHAT TO EXPECT
echo ================================================================
echo.
echo 📋 The new deployment will:
echo    1. Use enhanced npm configuration
echo    2. Retry failed downloads automatically
echo    3. Fall back to alternative registry if needed
echo    4. Use verbose logging for better diagnostics
echo.
echo 🎯 Expected result:
echo    ✅ Frontend container will build successfully
echo    ✅ All three containers will be healthy
echo    ✅ Application will be accessible at http://34.173.186.108
echo.
echo ================================================================
echo                    NEXT STEPS (MANUAL)
echo ================================================================
echo.
echo 1. Wait for GitHub Actions to complete (5-8 minutes)
echo 2. Check deployment status in GitHub Actions
echo 3. Test frontend access: http://34.173.186.108
echo 4. Test backend health: http://34.173.186.108:3001/health
echo 5. Login with: admin@example.com / admin123
echo.
echo ⚠️ If issues persist:
echo   - Check container logs on VM via Google Cloud Console
echo   - Verify firewall rules allow ports 80, 3001
echo   - Consider manual container restart if needed
echo.
pause
