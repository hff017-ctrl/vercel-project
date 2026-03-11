@echo off
title 네이버 부동산 매물 업데이트 도구
chcp 65001 > nul

echo.
echo ==========================================
echo    네이버 부동산 매물 정보 업데이트 중...
echo ==========================================
echo.

:: Node.js가 설치되어 있는지 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 설치 후 다시 실행해주세요.
    pause
    exit /b
)

:: 의존성 설치 확인 및 실행
if not exist "node_modules" (
    echo [정보] 처음 실행 시 필요한 모듈을 설치합니다...
    npm install
)

:: 데이터 수집 스크립트 실행
node fetch-properties.js

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo    ✅ 업데이트가 완료되었습니다!
    echo    properties-data.json 파일이 갱신되었습니다.
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo    ❌ 업데이트 중 오류가 발생했습니다.
    echo    인터넷 연결이나 중개사 ID를 확인해주세요.
    echo ==========================================
)

echo.
echo 아무 키나 누르면 창이 닫힙니다.
pause > nul
