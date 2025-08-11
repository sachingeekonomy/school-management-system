@echo off
setlocal enabledelayedexpansion

REM School Management System Setup Script for Windows
REM This script automates the initial setup process

echo 🚀 School Management System Setup
echo ==================================

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo [ERROR] Node.js version 18 or higher is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed
for /f "tokens=*" %%i in ('node --version') do echo   Version: %%i

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

echo [SUCCESS] npm is installed
for /f "tokens=*" %%i in ('npm --version') do echo   Version: %%i

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not installed. You can still run the project locally without Docker.
    set DOCKER_AVAILABLE=false
) else (
    echo [SUCCESS] Docker is installed
    for /f "tokens=*" %%i in ('docker --version') do echo   Version: %%i
    set DOCKER_AVAILABLE=true
)

REM Check Docker Compose
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker Compose is not installed. You can still run the project locally.
    set DOCKER_COMPOSE_AVAILABLE=false
) else (
    echo [SUCCESS] Docker Compose is installed
    set DOCKER_COMPOSE_AVAILABLE=true
)

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Git is not installed. Version control features will not be available.
) else (
    echo [SUCCESS] Git is installed
    for /f "tokens=*" %%i in ('git --version') do echo   Version: %%i
)

echo.

REM Environment setup
echo [INFO] Setting up environment...

if not exist .env (
    if exist env.example (
        copy env.example .env >nul
        echo [SUCCESS] Created .env file from .env.example
        echo [WARNING] Please edit .env file with your configuration values
    ) else (
        echo [WARNING] No .env.example file found. Creating basic .env file...
        (
            echo # Database Configuration
            echo DATABASE_URL="postgresql://postgres:password@localhost:5432/school_management"
            echo POSTGRES_USER=postgres
            echo POSTGRES_PASSWORD=password
            echo POSTGRES_DB=school_management
            echo.
            echo # Clerk Authentication
            echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
            echo CLERK_SECRET_KEY=your_clerk_secret_key
            echo.
            echo # Next.js Configuration
            echo NEXTAUTH_SECRET=your_nextauth_secret
            echo NEXTAUTH_URL=http://localhost:3000
            echo.
            echo # Application Configuration
            echo NODE_ENV=development
        ) > .env
        echo [SUCCESS] Created basic .env file
        echo [WARNING] Please update the .env file with your actual configuration values
    )
) else (
    echo [SUCCESS] .env file already exists
)

echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

echo.

REM Setup database
echo [INFO] Setting up database...

REM Generate Prisma client
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated

REM Check if we should run migrations
if "%DOCKER_AVAILABLE%"=="true" if "%DOCKER_COMPOSE_AVAILABLE%"=="true" (
    echo [INFO] Docker is available. You can start the application with:
    echo   docker compose up -d
    echo.
    echo [INFO] Or run locally with:
    echo   npm run dev
) else (
    echo [INFO] To run the application locally:
    echo   npm run dev
    echo.
    echo [WARNING] Note: You'll need to set up a PostgreSQL database manually for local development
)

echo.

REM Final instructions
echo [SUCCESS] Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Edit the .env file with your configuration values
echo 2. If using Docker: docker compose up -d
echo 3. If running locally: npm run dev
echo 4. Access the application at: http://localhost:3000
echo.
echo 📚 For more information, see the README.md file
echo.
echo [SUCCESS] Happy coding! 🎉
pause
