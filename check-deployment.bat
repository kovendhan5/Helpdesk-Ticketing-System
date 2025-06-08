@echo off
echo ======================================
echo HELPDESK DEPLOYMENT STATUS CHECK
echo ======================================
echo Time: %DATE% %TIME%
echo.

echo Testing Frontend...
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://34.173.186.108/ || echo "Frontend: CONNECTION FAILED"

echo.
echo Testing Backend Health...
curl -s -o nul -w "Backend Health Status: %%{http_code}\n" http://34.173.186.108:3001/health || echo "Backend: CONNECTION FAILED"

echo.
echo Testing Backend API...
curl -s -o nul -w "Backend API Status: %%{http_code}\n" http://34.173.186.108:3001/api/tickets || echo "Backend API: CONNECTION FAILED"

echo.
echo ======================================
echo Deployment URLs:
echo Frontend: http://34.173.186.108
echo Backend: http://34.173.186.108:3001
echo Backend Health: http://34.173.186.108:3001/health
echo ======================================
pause
