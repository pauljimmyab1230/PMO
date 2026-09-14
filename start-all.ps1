# ============================================
# PMO - Script de Inicio Rápido
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PMO - Sistema de Gestión de Proyectos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar MySQL
Write-Host "Verificando MySQL..." -ForegroundColor Yellow
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if (Test-Path $mysqlPath) {
    Write-Host "  ✅ MySQL encontrado" -ForegroundColor Green
} else {
    Write-Host "  ❌ MySQL no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar base de datos
Write-Host "Verificando base de datos..." -ForegroundColor Yellow
$dbCheck = & $mysqlPath -u root -p@pauljimmyAB1230 -e "USE pmo_database; SELECT COUNT(*) as count FROM usuarios;" 2>$null
if ($dbCheck -match "7") {
    Write-Host "  ✅ Base de datos configurada (7 usuarios)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Base de datos necesita configuración" -ForegroundColor Yellow
    Write-Host "  Ejecutando schema.sql..." -ForegroundColor Yellow
    & $mysqlPath -u root -p@pauljimmyAB1230 < "E:\PMO\database\schema.sql"
    & $mysqlPath -u root -p@pauljimmyAB1230 < "E:\PMO\database\seed.sql"
    Write-Host "  ✅ Base de datos configurada" -ForegroundColor Green
}

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✅ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Matar procesos anteriores
Write-Host "Deteniendo procesos anteriores..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Iniciar Backend
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command cd E:\PMO\backend; node src/server.js" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Verificar Backend
$backendRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet
if ($backendRunning) {
    Write-Host "  ✅ Backend ejecutándose en http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "  ❌ Error al iniciar Backend" -ForegroundColor Red
}

# Iniciar Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command cd E:\PMO\frontend; npm run dev" -WindowStyle Hidden
Start-Sleep -Seconds 5

# Verificar Frontend
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet
if ($frontendRunning) {
    Write-Host "  ✅ Frontend ejecutándose en http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  ❌ Error al iniciar Frontend" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema listo para usar!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: http://localhost:5173" -ForegroundColor White
Write-Host "Email: admin@sistema.com" -ForegroundColor White
Write-Host "Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener los servidores" -ForegroundColor Yellow
Write-Host ""

# Mantener el script abierto
pause
