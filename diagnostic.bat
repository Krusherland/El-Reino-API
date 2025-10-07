@echo off
echo =====================================
echo Scroll Upload Diagnostic Tool
echo =====================================
echo.

echo [1/5] Checking if backend server is running...
timeout /t 1 /nobreak >nul
curl -s http://localhost:3100 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server is RUNNING on port 3100
    echo.
    curl -s http://localhost:3100
    echo.
) else (
    echo ✗ Backend server is NOT running!
    echo.
    echo Please run: npm start
    echo Or double-click: starter.bat
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Checking MongoDB connection...
timeout /t 1 /nobreak >nul
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% equ 0 (
    echo ✓ MongoDB is RUNNING
) else (
    echo ✗ MongoDB is NOT running!
    echo Please start MongoDB or run starter.bat
)

echo.
echo [3/5] Checking scroll upload directory...
if exist "c:\xampp\htdocs\Proyecto-El-Reino\El-Reino_API\uploads\scrolls" (
    echo ✓ Upload directory exists
) else (
    echo ✗ Upload directory missing!
    echo Creating directory...
    mkdir "c:\xampp\htdocs\Proyecto-El-Reino\El-Reino_API\uploads\scrolls"
    echo ✓ Directory created
)

echo.
echo [4/5] Testing scroll upload endpoint...
timeout /t 1 /nobreak >nul
curl -s -X POST http://localhost:3100/net/scroll/upload >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Upload endpoint is accessible
) else (
    echo ✗ Upload endpoint not accessible
    echo Check if route is properly configured
)

echo.
echo [5/5] Checking for required npm packages...
cd /d "c:\xampp\htdocs\Proyecto-El-Reino\El-Reino_API"
if exist "node_modules\multer" (
    echo ✓ Multer package is installed
) else (
    echo ✗ Multer package missing!
    echo Run: npm install
)

echo.
echo =====================================
echo Diagnostic Complete!
echo =====================================
echo.
echo If all checks passed, try uploading a scroll again.
echo If issues persist, check the TROUBLESHOOTING_SCROLL_UPLOAD.md file.
echo.
pause
