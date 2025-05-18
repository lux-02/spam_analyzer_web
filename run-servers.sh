#!/bin/bash

# 환경 설정
export FLASK_API_URL=http://localhost:5001/analyze
export FLASK_PORT=5001

# 현재 디렉토리 저장
ROOT_DIR=$(pwd)

# 색상 코드 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# NMAP 설치 확인 및 설치
echo -e "${BLUE}🔍 nmap 확인 중...${NC}"
if ! command -v nmap &> /dev/null; then
    echo -e "${YELLOW}⚠️ nmap이 설치되어 있지 않습니다. 포트 스캔 및 배너그랩 기능을 사용하려면 필요합니다.${NC}"
    
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo -e "${BLUE}Homebrew로 nmap 설치 중...${NC}"
            brew install nmap
            echo -e "${GREEN}✓ nmap 설치 완료${NC}"
        else
            echo -e "${RED}❌ Homebrew가 설치되어 있지 않습니다. nmap을 수동으로 설치해주세요.${NC}"
            echo -e "${YELLOW}https://nmap.org/download 에서 다운로드 가능합니다.${NC}"
        fi
    elif [ "$(uname)" == "Linux" ]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            echo -e "${BLUE}apt로 nmap 설치 중...${NC}"
            sudo apt-get update && sudo apt-get install -y nmap
            echo -e "${GREEN}✓ nmap 설치 완료${NC}"
        elif command -v yum &> /dev/null; then
            echo -e "${BLUE}yum으로 nmap 설치 중...${NC}"
            sudo yum install -y nmap
            echo -e "${GREEN}✓ nmap 설치 완료${NC}"
        else
            echo -e "${RED}❌ 패키지 매니저를 찾을 수 없습니다. nmap을 수동으로 설치해주세요.${NC}"
            echo -e "${YELLOW}https://nmap.org/download 에서 다운로드 가능합니다.${NC}"
        fi
    else
        echo -e "${RED}❌ 지원되지 않는 운영체제입니다. nmap을 수동으로 설치해주세요.${NC}"
        echo -e "${YELLOW}https://nmap.org/download 에서 다운로드 가능합니다.${NC}"
    fi
else
    echo -e "${GREEN}✓ nmap이 설치되어 있습니다. 버전: $(nmap --version | head -n1)${NC}"
fi

# Python 가상환경 생성 및 설정
echo -e "${BLUE}🐍 Python 가상환경 설정 중...${NC}"
if [ -d "flask-server/venv" ]; then
  echo "가상환경이 이미 존재합니다."
else
  echo "새 가상환경 생성 중..."
  cd flask-server
  python3 -m venv venv
  cd $ROOT_DIR
fi

# 가상환경 활성화
echo -e "${BLUE}가상환경 활성화 중...${NC}"
cd flask-server
source venv/bin/activate

# pip 업그레이드
echo -e "${BLUE}pip 최신 버전으로 업그레이드 중...${NC}"
pip install --upgrade pip

# 의존성 설치 전 환경 정리
echo -e "${BLUE}기존 패키지 제거 중...${NC}"
pip uninstall -y transformers torch accelerate numpy sentencepiece protobuf einops timm av decord

# 필수 패키지 설치 - 중요도 순으로 설치
echo -e "${BLUE}핵심 패키지 설치 중...${NC}"
pip install torch==2.0.1
echo -e "${GREEN}✓ PyTorch 설치 완료${NC}"

pip install numpy==1.24.3 
echo -e "${GREEN}✓ NumPy 설치 완료${NC}"

pip install transformers==4.35.2
echo -e "${GREEN}✓ Transformers 설치 완료${NC}"

# 나머지 필수 패키지 설치
echo -e "${BLUE}추가 의존성 설치 중...${NC}"
pip install flask==2.3.3 flask-cors==4.0.0 accelerate==0.25.0 sentencepiece==0.1.99 protobuf==4.24.4 requests==2.31.0 safetensors==0.4.1 regex==2023.10.3 tqdm==4.66.1
echo -e "${GREEN}✓ 필수 패키지 설치 완료${NC}"

# 배너그랩 및 포트 스캔 기능을 위한 패키지 설치
echo -e "${BLUE}포트 스캔 의존성 설치 중...${NC}"
pip install python-nmap==0.7.1
echo -e "${GREEN}✓ python-nmap 설치 완료${NC}"

# einops와 timm 설치 - 필요할 수 있음
pip install einops==0.7.0 timm==0.9.16
echo -e "${GREEN}✓ einops 및 timm 설치 완료${NC}"

# 시스템 환경 감지 및 맞춤 설치
if [ "$(uname)" == "Darwin" ]; then
  echo -e "${YELLOW}macOS 환경 감지됨${NC}"
  # M1/M2 Mac인지 확인
  ARCH=$(uname -m)
  if [ "$ARCH" == "arm64" ]; then
    echo -e "${YELLOW}Apple Silicon(M1/M2/M3) 감지됨${NC}"
    
    # Mac에서는 av, decord가 이슈가 있을 수 있음
    echo -e "${YELLOW}av 패키지 설치 시도 (선택적 의존성)${NC}"
    pip install av==11.0.0 || echo -e "${YELLOW}⚠️ av 설치 실패, 일부 기능이 제한될 수 있습니다${NC}"
    
    echo -e "${YELLOW}decord는 macOS에서 이슈가 있으므로 설치를 건너뜁니다${NC}"
    echo -e "${YELLOW}필요한 경우 conda로 설치 가능: conda install -c conda-forge decord${NC}"
  else
    # Intel Mac
    echo -e "${YELLOW}Intel Mac 감지됨${NC}"
    pip install av==11.0.0 decord || echo -e "${YELLOW}⚠️ 일부 패키지 설치 실패, 일부 기능이 제한될 수 있습니다${NC}"
  fi
else
  # Linux 등 다른 환경
  echo -e "${BLUE}Linux 또는 다른 환경 감지됨${NC}"
  pip install av==11.0.0 decord || echo -e "${YELLOW}⚠️ 일부 패키지 설치 실패, 일부 기능이 제한될 수 있습니다${NC}"
fi

# 필수 의존성 확인
echo -e "${BLUE}필수 의존성 확인 중...${NC}"
pip list | grep -E 'torch|transformers|numpy|flask|python-nmap'

# 모델 사전 다운로드 시도 (선택적)
echo -e "${BLUE}모델 캐싱 시도 중...${NC}"
python -c "from transformers import AutoTokenizer; AutoTokenizer.from_pretrained('EleutherAI/polyglot-ko-1.3b')" || echo -e "${YELLOW}⚠️ 모델 캐싱 실패, 첫 실행 시 다운로드합니다${NC}"

# Flask 서버 백그라운드로 실행
echo -e "${GREEN}🚀 Flask 서버 시작 중... (포트: 5001)${NC}"
python app.py &
FLASK_PID=$!

# NextJS 디렉토리로 이동
cd $ROOT_DIR

# NextJS 서버 실행
echo -e "${GREEN}🚀 Next.js 서버 시작 중...${NC}"
npm run dev &
NEXT_PID=$!

echo -e "${GREEN}✅ 두 서버가 모두 실행 중입니다:${NC}"
echo -e "- Flask 서버: ${BLUE}http://localhost:5001${NC}"
echo -e "- Next.js 서버: ${BLUE}http://localhost:3000${NC}"

# Ctrl+C로 두 서버 모두 종료
function cleanup {
  echo -e "\n${YELLOW}🛑 서버 종료 중...${NC}"
  kill $FLASK_PID
  kill $NEXT_PID
  exit 0
}

trap cleanup INT
echo -e "${YELLOW}서버를 종료하려면 Ctrl+C를 누르세요.${NC}"

# 두 서버가 모두 실행 중인 동안 대기
wait 