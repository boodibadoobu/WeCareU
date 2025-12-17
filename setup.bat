@echo off
echo ============================================
echo 🔧 WeCareU - First Time Setup Script
echo ============================================
echo.

:: Check if Node.js is installed
echo [1/6] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✅ npm found
echo.

:: Install Backend Dependencies
echo [2/6] Installing Backend dependencies...
cd backend
if not exist node_modules (
    echo Installing backend packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ℹ️  Backend dependencies already installed
)
cd ..
echo.

:: Install Frontend Dependencies
echo [3/6] Installing Frontend dependencies...
cd frontend
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ℹ️  Frontend dependencies already installed
)
cd ..
echo.

:: Setup .env file
echo [4/6] Setting up environment configuration...
cd backend
if not exist .env (
    if exist .env.example (
        echo Creating .env file from .env.example...
        copy .env.example .env >nul
        echo ✅ .env file created
        echo.
        echo ⚠️  IMPORTANT: Please edit backend\.env file and configure:
        echo    - DATABASE_URL (your Supabase PostgreSQL connection)
        echo    - JWT_SECRET (use a strong random string)
        echo    - SUPABASE_URL and keys (if using Supabase features)
        echo.
    ) else (
        echo ⚠️  WARNING: .env.example not found!
    )
) else (
    echo ℹ️  .env file already exists
)
cd ..
echo.

:: Run Prisma Setup
echo [5/6] Setting up Prisma database...
cd backend
echo Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo ⚠️  WARNING: Prisma generate failed. Make sure DATABASE_URL is configured.
    echo You can run 'npx prisma generate' manually later.
)

echo.
echo Running database migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% neq 0 (
    echo ⚠️  WARNING: Database migration failed.
    echo Please make sure:
    echo   1. DATABASE_URL in .env is correct
    echo   2. Database is accessible
    echo   3. Run 'npx prisma migrate deploy' manually after fixing
)

echo.
echo Seeding database (optional)...
call npx ts-node prisma/seed.ts
if %ERRORLEVEL% neq 0 (
    echo ℹ️  Database seeding skipped or failed (this is optional)
)
cd ..
echo.

:: Final Instructions
echo [6/6] Setup Complete!
echo ============================================
echo.
echo ✅ All dependencies installed!
echo ✅ Configuration files created!
echo.
echo 📝 NEXT STEPS:
echo 1. Edit backend\.env file with your database credentials
echo 2. Run database migrations: cd backend ^&^& npx prisma migrate deploy
echo 3. (Optional) Seed the database: cd backend ^&^& npx ts-node prisma/seed.ts
echo 4. Start the application by running: start_app.bat
echo.
echo 🚀 To start the application now, type: start_app.bat
echo ============================================
echo.
pause
