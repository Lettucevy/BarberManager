@echo off
REM =====================================================
REM BarberManager - launcher
REM Instala dependencias (se faltarem), popula o banco de
REM exemplo e inicia backend + frontend.
REM =====================================================
setlocal

set ROOT=%~dp0
pushd "%ROOT%"

echo.
echo === BarberManager ===
echo Verificando dependencias...

if not exist "server\node_modules" (
  echo Instalando dependencias do servidor...
  pushd server
  call npm install
  popd
)

if not exist "client\node_modules" (
  echo Instalando dependencias do cliente...
  pushd client
  call npm install
  popd
)

echo Populando banco de dados de exemplo...
pushd server
call node seed.js
popd

echo.
echo Iniciando aplicacao...
echo   - API:    http://localhost:5000
echo   - Vitrine: http://localhost:5173
echo Pressione CTRL+C para encerrar.
echo.

node "%ROOT%start.js"

popd
endlocal
pause
