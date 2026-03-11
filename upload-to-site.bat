@echo off
title 홈페이지에 매물 업로드 (GitHub 반영)
chcp 65001 > nul

echo.
echo ==========================================
echo    현재 변경사항을 홈페이지에 반영합니다...
echo ==========================================
echo.

:: Git 설치 확인
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Git이 설치되어 있지 않습니다.
    pause
    exit /b
)

:: Git 상태 확인 및 업로드
echo [1/3] 변경된 파일들을 정리 중...
git add .

echo [2/3] 업데이트 메시지 작성 중...
:: %date%와 %time%을 직접 사용하되 공백 문제를 피하기 위해 따옴표 사용
git commit -m "매물 정보 업데이트: %date% %time%"

echo [3/3] 서버(GitHub)로 전송 중... (잠시만 기다려주세요)
git push

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo    ✅ 업로드가 성공적으로 완료되었습니다!
    echo    약 1~2분 뒤에 주소에서 확인하실 수 있습니다.
    echo    주소: https://r-6441115.vercel.app/
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo    ❌ 업로드 중 오류가 발생했습니다.
    echo    인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.
    echo ==========================================
)

echo.
echo 아무 키나 누르면 창이 닫힙니다.
pause > nul
