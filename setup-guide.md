# 🔥 HotAI Platform 설정 가이드

## 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성 (예: `hotai-platform`)
2. 로컬 프로젝트를 GitHub에 푸시:

```bash
cd C:\Users\admin\hotai-platform
git init
git add .
git commit -m "feat: initial commit - HotAI Platform"
git branch -M main
git remote add origin https://github.com/yourusername/hotai-platform.git
git push -u origin main
```

## 2. Supabase 설정

### 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: HotAI Platform
   - Database Password: 강력한 비밀번호 설정
   - Region: Northeast Asia (Seoul)

### 데이터베이스 스키마 적용
1. SQL Editor 접속
2. `supabase/migrations/001_initial_schema.sql` 내용 복사/붙여넣기
3. "Run" 클릭하여 실행

### API 키 확인
1. Settings > API 메뉴 접속
2. 다음 키들을 복사:
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
3. Project URL 복사 → `NEXT_PUBLIC_SUPABASE_URL`

## 3. Vercel 배포

### Vercel CLI 설치 및 프로젝트 연결
```bash
npm i -g vercel
vercel login
vercel
```

### 환경 변수 설정
Vercel 대시보드 > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

### GitHub 연동
1. Vercel 대시보드에서 "Import Git Repository"
2. GitHub 계정 연결 및 저장소 선택
3. 자동 배포 활성화

## 4. GitHub Actions 설정

### Secrets 추가
GitHub 저장소 > Settings > Secrets and variables > Actions:

- `VERCEL_TOKEN`: Vercel 계정 설정에서 생성
- `VERCEL_ORG_ID`: Vercel 프로젝트 설정에서 확인
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 설정에서 확인
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. 로컬 개발 환경

```bash
# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 API 키 입력

# 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```

## 6. 프로덕션 체크리스트

- [ ] Supabase RLS 정책 확인
- [ ] API 키 보안 설정
- [ ] 환경 변수 설정 완료
- [ ] GitHub Actions 테스트
- [ ] Vercel 도메인 설정
- [ ] 모니터링 설정 (Sentry, Analytics)

## 7. 추가 설정 (선택사항)

### 커스텀 도메인
1. Vercel > Settings > Domains
2. 도메인 추가 (예: hotai.com)
3. DNS 설정 업데이트

### 이메일 인증
1. Supabase > Authentication > Email Templates
2. 템플릿 커스터마이징
3. SMTP 설정 (선택사항)

### 모니터링
- Google Analytics: `NEXT_PUBLIC_GA_ID` 설정
- Sentry: `SENTRY_DSN` 설정

## 문제 해결

### Supabase 연결 오류
- API 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS 정책이 올바르게 설정되어 있는지 확인

### Vercel 빌드 오류
- 환경 변수가 모두 설정되어 있는지 확인
- `npm run build` 로컬에서 테스트
- TypeScript 오류 확인

### AI API 오류
- API 키가 유효한지 확인
- API 사용량 한도 확인
- 네트워크 연결 확인