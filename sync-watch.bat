@echo off
chcp 65001 >nul
title Agent Graph Builder - Auto Sync ^& Docker Runner (D:\agent-graph-builder)

set "TARGET_DIR=D:\agent-graph-builder"
set "REPO_URL=https://github.com/Antipido/agent-graph-builder.git"

echo ============================================================================
echo   AGENT GRAPH BUILDER - INSTALADOR E SINCRONIZADOR AUTOMATICO (DISCO D:)
echo ============================================================================
echo.

if not exist "%TARGET_DIR%\.git" (
    echo [1/3] Clonando repositorio em %TARGET_DIR% ...
    git clone "%REPO_URL%" "%TARGET_DIR%"
) else (
    echo [1/3] Projeto ja encontrado em %TARGET_DIR%. Atualizando arquivos...
    cd /d "%TARGET_DIR%"
    git pull origin main
)

cd /d "%TARGET_DIR%"

echo.
echo [2/3] Subindo container no Docker Desktop (porta 8080)...
docker compose up --build -d

echo.
echo [3/3] Abrindo http://localhost:8080 no navegador...
start http://localhost:8080

echo.
echo ============================================================================
echo   MODO AUTO-SYNC ATIVO!
echo   Verificando atualizacoes do GitHub a cada 15 segundos...
echo   (Sempre que o agente atualizar o projeto na nuvem, seu PC baixa e atualiza)
echo ============================================================================
echo.

:loop
timeout /t 15 /nobreak >nul
git fetch origin main >nul 2>&1
for /f %%i in ('git rev-parse HEAD') do set LOCAL_HEAD=%%i
for /f %%i in ('git rev-parse origin/main') do set REMOTE_HEAD=%%i

if not "%LOCAL_HEAD%"=="%REMOTE_HEAD%" (
    echo [%time%] Nova atualizacao detectada! Sincronizando arquivos em %TARGET_DIR%...
    git pull origin main
    docker compose up --build -d
    echo [%time%] Container e arquivos atualizados com sucesso!
)
goto loop
