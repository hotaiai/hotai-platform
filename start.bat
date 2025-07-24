@echo off
echo 🔥 HotAI Platform 시작 중...
echo.

REM 환경 변수 파일 복사
if not exist .env (
    echo .env 파일을 생성합니다...
    copy .env.example .env
    echo.
    echo ⚠️  .env 파일에 API 키를 설정해주세요!
    echo.
)

REM 패키지 설치
echo 패키지를 설치합니다...
call npm install

REM 데이터베이스 설정
echo.
echo 데이터베이스를 설정합니다...
call npx prisma generate
call npx prisma db push

REM 개발 서버 시작
echo.
echo 개발 서버를 시작합니다...
echo 브라우저에서 http://localhost:3000 으로 접속하세요
echo.
call npm run dev

pause