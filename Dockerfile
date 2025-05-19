# 멀티스테이지 빌드를 사용하여 최종 이미지 크기 최적화

# 1. Frontend 빌드 스테이지
FROM node:18-slim AS frontend-build
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2. Python 기반 최종 이미지
FROM python:3.10-slim

# 서버 이름 및 버전 설정
LABEL name="spam_analyzer_web"
LABEL version="1.0.0"

# 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# Next.js 빌드 파일 복사
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/package*.json ./
COPY --from=frontend-build /app/node_modules ./node_modules

# Flask 서버 파일 복사
COPY flask-server /app/flask-server
COPY run-servers.sh /app/run-servers.sh

# 실행 권한 부여
RUN chmod +x /app/run-servers.sh

# Python 가상환경 설정 및 의존성 설치
RUN cd flask-server && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir vt-graph-api python-dotenv
    
# 포트 노출
EXPOSE 3000 5001

# 환경 변수 설정
ENV FLASK_API_URL=http://localhost:5001/analyze
ENV FLASK_PORT=5001
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb://localhost:27017/spam_analyzer
ENV FLASK_SERVER_URL=http://localhost:5001

# 서버 실행
CMD ["./run-servers.sh"] 