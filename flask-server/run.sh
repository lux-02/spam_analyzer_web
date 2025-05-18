#!/bin/bash

# VirusTotal API 키 확인
if [ -z "$VIRUSTOTAL_API_KEY" ]; then
  echo "경고: VIRUSTOTAL_API_KEY 환경 변수가 설정되지 않았습니다."
fi

# 필요한 패키지 설치
pip install -r requirements.txt

# Flask 서버 실행
python app.py 