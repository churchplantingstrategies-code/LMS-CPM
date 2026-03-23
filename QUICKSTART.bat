@echo off
REM Quick setup script for eDiscipleship development

echo.
echo ========================================
echo eDiscipleship Local Setup
echo ========================================
echo.

echo [1/3] Checking environment...
if not exist .env.local (
    echo Creating .env.local from template...
    copy .env.local.example .env.local
)

echo.
echo [2/3] DATABASE SETUP - Choose one:
echo.
echo Option A: PostgreSQL with Docker
echo   - Ensure Docker Desktop is running
echo   - Run: docker-compose up -d
echo   - Your DATABASE_URL is already set to: postgresql://postgres:postgres@localhost:5432/ediscipleship
echo.
echo Option B: PostgreSQL on your machine
echo   - Install PostgreSQL 14+ (https://www.postgresql.org/download/windows/)
echo   - Create database: createdb -U postgres ediscipleship
echo   - Update .env.local with your PostgreSQL connection string
echo.
echo.
echo [3/3] After database is ready:
echo   1. Verify .env.local has correct NEXTAUTH_SECRET (already configured)
echo   2. Run: npx prisma db push
echo   3. Run: npm run dev
echo.
echo ========================================
echo Setup Steps:
echo.
echo Step 1: Start your PostgreSQL database
echo Step 2: Run: npx prisma db push
echo Step 3: Run: npm run dev
echo.
echo App will be available at: http://localhost:3000
echo ========================================
echo.
