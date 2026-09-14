@echo off
echo ========================================
echo   PMO - Sistema de Gestion de Proyectos
echo ========================================
echo.

echo Instalando dependencias...
call npm install

echo.
echo Instalando dependencias del backend...
cd backend
call npm install
cd ..

echo.
echo Instalando dependencias del frontend...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo   Instalacion completada!
echo ========================================
echo.
echo Para iniciar el sistema:
echo   1. Ejecutar: npm run dev
echo   2. Abrir http://localhost:5173
echo.
echo Credenciales de prueba:
echo   Email: admin@sistema.com
echo   Pass:  admin123
echo.
pause
