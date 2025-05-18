# GitHub 저장소에 프로젝트 푸시하기

현재 프로젝트를 GitHub에 푸시할 때 파일 크기 제한으로 인해 문제가 발생했습니다. 다음 단계를 통해 이 문제를 해결할 수 있습니다.

## 문제 해결하기

1. 깃 히스토리를 새로 시작해 대용량 파일을 제외합니다.

```bash
# 현재 디렉토리에서 실행
cd /Users/lux/Documents/spam_analyzer_web

# 기존 .git 폴더 삭제 (주의: 현재 히스토리가 모두 삭제됩니다)
rm -rf .git

# 새 git 저장소 초기화
git init

# 새 .gitignore 규칙이 적용된 상태에서 파일 추가
git add .

# 커밋하기
git commit -m "초기 커밋: 스팸 분석기 웹 애플리케이션"

# 새 GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/[사용자명]/spam_analyzer_web.git

# 푸시하기
git push -u origin main
```

## 주의 사항

1. Flask 가상환경(venv)은 제외되므로, 배포 서버에서 다시 설치해야 합니다.
2. 위 단계를 통해 기존 Git 히스토리를 모두 잃게 됩니다.
3. 만약 기존 히스토리가 중요하다면, Git LFS(Large File Storage)를 사용하는 방법을 고려할 수 있습니다.

## 배포 서버에서 환경 설정하기

1. 저장소 클론 후 가상환경 설정:

```bash
# 저장소 클론
git clone https://github.com/[사용자명]/spam_analyzer_web.git
cd spam_analyzer_web

# Python 가상환경 설정
cd flask-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install vt-graph-api python-dotenv

# 환경 변수 설정
cd ..
cp .env.example .env
# .env 파일 편집하여 실제 API 키 입력
```

2. 도커 환경에서 실행:

```bash
# 환경 변수 설정 후 도커 컴포즈로 실행
docker-compose up -d
```

## GitHub에서 API 키와 같은 민감한 정보 보호하기

1. 저장소를 프라이빗으로 설정하거나
2. GitHub Action Secrets 또는 환경 변수를 사용하여 배포하세요.
