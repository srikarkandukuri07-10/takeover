@echo off
echo ========================================
echo  Autonomous HR Manager - Quick Setup
echo ========================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    pip install fastapi uvicorn pydantic pydantic-settings python-dotenv httpx groq supabase python-multipart psycopg2-binary
)
echo.

echo Step 2: Please run the SQL schema in Supabase
echo   1. Go to: https://supabase.com/dashboard/project/jytziovekurjzacgjejw/sql/new
echo   2. Open the file: backend\app\db\migrations\001_schema.sql
echo   3. Copy ALL the content and paste it in Supabase SQL Editor
echo   4. Click "Run" (or Ctrl+Enter)
echo.
pause

echo Step 3: Seeding demo data...
python seed_data.py
echo.

echo Step 4: Starting Backend Server...
start "Backend" cmd /c "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo Backend starting on http://localhost:8000
echo.

cd ..\frontend
echo Step 5: Installing frontend dependencies...
if not exist "node_modules" (
    npm install
)
echo.

echo Step 6: Starting Frontend Server...
start "Frontend" cmd /c "npm run dev"
echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo  Open http://localhost:3000/dashboard
echo ========================================
pause
