@echo off
setlocal

REM 환경 변수 설정
set FLASK_API_URL=http://localhost:5001/analyze
set FLASK_PORT=5001

REM 현재 디렉토리 저장
set ROOT_DIR=%cd%

echo 🐍 Python 가상환경 설정 중...
if exist "flask-server\venv" (
  echo 가상환경이 이미 존재합니다.
) else (
  echo 새 가상환경 생성 중...
  cd flask-server
  python -m venv venv
  cd %ROOT_DIR%
)

REM 가상환경 활성화 및 패키지 설치
echo 가상환경 활성화 및 패키지 설치 중...
cd flask-server
call venv\Scripts\activate

REM pip 업그레이드
echo pip 최신 버전으로 업그레이드 중...
pip install --upgrade pip

REM 이전 패키지 제거 후 재설치 (충돌 방지)
echo 의존성 충돌 해결 중...
pip uninstall -y numpy transformers torch einops timm av
pip install torch==2.0.1
echo Torch 설치 완료

REM 다른 의존성 설치
pip install flask==2.3.3 flask-cors==4.0.0 transformers==4.35.2 accelerate==0.25.0 numpy==1.24.3 sentencepiece==0.1.99 protobuf==4.24.4 requests==2.31.0 einops==0.7.0 timm==0.9.16 av==11.0.0
echo 주요 패키지 설치 완료

REM decord 패키지 설치 시도 (Windows 환경)
echo decord 패키지는 선택적으로 사용됩니다.
echo 추가 기능이 필요한 경우 conda로 설치 가능: conda install -c conda-forge decord

REM 의존성 설치 확인
echo 필수 의존성 확인 중...
pip list | findstr /i "torch transformers numpy einops timm av"

REM Flask 서버 실행 (새 창에서)
echo 🚀 Flask 서버 시작 중... (포트: 5001)
start cmd /k "cd %ROOT_DIR%\flask-server && venv\Scripts\activate && set FLASK_PORT=5001 && python app.py"

REM NextJS 디렉토리로 이동
cd %ROOT_DIR%

REM NextJS 서버 실행 (현재 창에서)
echo 🚀 Next.js 서버 시작 중...
echo ✅ 두 서버가 모두 실행 중입니다:
echo - Flask 서버: http://localhost:5001
echo - Next.js 서버: http://localhost:3000
npm run dev 