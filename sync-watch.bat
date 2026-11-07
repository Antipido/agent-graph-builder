@echo off
chcp 65001 >nul
title Agent Graph Builder - Auto Sync ^& Docker Runner (D:\agent-graph-builder)

set "TARGET_DIR=D:\agent-graph-builder"
set "REPO_URL=https://github.com/Antipido/agent-graph-builder.git"
set "APP_URL=http://localhost:3210"

echo ============================================================================
echo   AGENT GRAPH BUILDER - INSTALADOR E SINCRONIZADOR AUTOMATICO (DISCO D:)
echo ============================================================================
echo.

if not exist "%TARGET_DIR%\.git" (
    echo [1/4] Clonando repositorio em %TARGET_DIR% ...
    git clone "%REPO_URL%" "%TARGET_DIR%"
) else (
    echo [1/4] Projeto encontrado em %TARGET_DIR%. Sincronizando com GitHub...
    cd /d "%TARGET_DIR%"
    git fetch origin main
    git reset --hard origin/main
)

cd /d "%TARGET_DIR%"

echo.
echo [2/4] Construindo e subindo container no Docker Desktop (porta 3210)...
docker compose down --remove-orphans >nul 2>&1
docker compose up --build -d
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao subir o container no Docker Desktop.
    echo Verifique se o Docker Desktop esta aberto e em execucao.
    pause
    exit /b 1
)

echo.
echo [3/4] Verificando healthcheck do container em %APP_URL%/healthz ...
timeout /t 2 /nobreak >nul
curl -s "%APP_URL%/healthz" | findstr /i "ok" >nul
if errorlevel 1 (
    echo Aguardando inicializacao do Nginx...
    timeout /t 3 /nobreak >nul
)

echo.
echo [4/4] Abrindo %APP_URL% no seu navegador...
start "" "%APP_URL%"

echo.
echo ============================================================================
echo   APLICACAO RODANDO EM: %APP_URL%
echo   MODO AUTO-SYNC ATIVO EM: %TARGET_DIR%
echo   Verificando atualizacoes do GitHub a cada 15 segundos...
echo ============================================================================
echo.

:loop
timeout /t 15 /nobreak >nul
git fetch origin main >nul 2>&1
for /f %%i in ('git rev-parse HEAD') do set LOCAL_HEAD=%%i
for /f %%i in ('git rev-parse origin/main') do set REMOTE_HEAD=%%i

if not "%LOCAL_HEAD%"=="%REMOTE_HEAD%" (
    echo [%time%] Nova atualizacao detectada! Atualizando arquivos em %TARGET_DIR%...
    git reset --hard origin/main
    docker compose up --build -d
    echo [%time%] Container e arquivos atualizados com sucesso em %APP_URL%!
)
goto loop
