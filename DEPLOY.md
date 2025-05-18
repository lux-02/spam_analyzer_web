# 네이비 클라우드 배포 가이드

이 문서는 스팸 분석기 웹 애플리케이션을 네이비 클라우드 서버(Ubuntu 24.04)에 배포하는 방법을 설명합니다.

## 서버 정보

- **서버 이름**: mailanlyzer (105231838)
- **OS**: Ubuntu 24.04
- **IP**: 211.188.57.108 (공인), 10.0.0.6 (비공인)
- **스펙**: vCPU 1EA, Memory 1GB

## 배포 절차

### 1. 필수 소프트웨어 설치

```bash
# 시스템 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io docker-compose

# Docker 서비스 활성화
sudo systemctl enable docker
sudo systemctl start docker

# 현재 사용자를 docker 그룹에 추가 (재로그인 필요)
sudo usermod -aG docker $USER
```

### 2. 프로젝트 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p ~/projects
cd ~/projects

# 깃허브에서 프로젝트 클론
git clone https://github.com/yourusername/spam_analyzer_web.git
cd spam_analyzer_web
```

### 3. 환경 변수 설정

`.env` 파일을 생성하여 필요한 환경 변수를 설정합니다:

```bash
# .env 파일 생성
cat > .env << EOL
# 프로덕션 환경 변수 설정
NODE_ENV=production

# MongoDB 연결 문자열
MONGODB_URI=mongodb://mongo:27017/spam_analyzer

# Flask 서버 URL (네이비 클라우드 공인 IP 사용)
FLASK_SERVER_URL=http://211.188.57.108:5001

# API 키 (실제 값으로 변경 필요)
VIRUSTOTAL_API_KEY=여기에_실제_API_키_입력

# 포트 설정
FLASK_PORT=5001
NEXT_PORT=3000
EOL
```

### 4. Docker Compose로 배포

```bash
# Docker 이미지 빌드 및 컨테이너 실행
docker-compose up -d --build
```

### 5. 방화벽 설정

Ubuntu 기본 방화벽(ufw)을 설정하여 필요한 포트를 개방합니다:

```bash
# 방화벽 활성화
sudo ufw enable

# Next.js 포트 개방
sudo ufw allow 3000/tcp

# Flask 서버 포트 개방
sudo ufw allow 5001/tcp

# SSH 포트 개방 (기본 포트)
sudo ufw allow 22/tcp

# 방화벽 상태 확인
sudo ufw status
```

### 6. 배포 확인

웹 브라우저에서 다음 URL로 접속하여 애플리케이션이 정상적으로 실행되는지 확인합니다:

- Next.js 웹 애플리케이션: http://211.188.57.108:3000
- Flask 서버 API: http://211.188.57.108:5001

### 7. 로그 확인

```bash
# 애플리케이션 로그 확인
docker logs -f spam_analyzer_web

# MongoDB 로그 확인
docker logs -f mongo_db
```

### 8. 서비스 관리

```bash
# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 컨테이너와 볼륨까지 모두 삭제
docker-compose down -v
```

## 메모리 최적화 팁

해당 서버는 메모리가 1GB로 제한되어 있으므로 다음과 같은 최적화를 권장합니다:

1. **스왑 파일 생성**:

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Docker 메모리 제한 설정**:
   docker-compose.yml 파일에 다음 설정 추가:

   ```yaml
   services:
     spam_analyzer:
       deploy:
         resources:
           limits:
             memory: 512M
     mongo:
       deploy:
         resources:
           limits:
             memory: 256M
   ```

3. **백그라운드 프로세스 최소화**:
   불필요한 시스템 서비스 비활성화:
   ```bash
   sudo systemctl disable snapd.service
   sudo systemctl disable snapd.socket
   sudo systemctl disable snapd.seeded.service
   ```

## 문제 해결

### MongoDB 연결 실패

MongoDB 컨테이너가 실행 중인지 확인:

```bash
docker ps | grep mongo
```

### Next.js 서버가 실행되지 않는 경우

로그 확인:

```bash
docker logs spam_analyzer_web
```

### Flask 서버가 실행되지 않는 경우

컨테이너에 접속하여 직접 Flask 서버 실행:

```bash
docker exec -it spam_analyzer_web bash
cd flask-server
source venv/bin/activate
python app.py
```

## 추가 보안 설정

1. **HTTPS 설정**:
   Nginx를 사용하여 역방향 프록시 설정 및 Let's Encrypt로 SSL 인증서 발급:

   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **백업 설정**:
   MongoDB 데이터 정기 백업:
   ```bash
   # crontab에 추가
   0 0 * * * docker exec mongo_db mongodump --out /data/backup/$(date +\%Y\%m\%d) && tar -zcvf ~/backups/mongodb-$(date +\%Y\%m\%d).tar.gz /data/backup/$(date +\%Y\%m\%d)
   ```
