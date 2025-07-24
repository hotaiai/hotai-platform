# 🔥 HotAI Platform

Next.js + Supabase + Vercel로 구축된 멀티 AI 통합 플랫폼

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hotai-platform)

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/hotai-platform.git
cd hotai-platform
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL 편집기에서 `supabase/migrations/001_initial_schema.sql` 실행
3. 프로젝트 설정에서 API 키 복사

### 3. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 필요한 값들을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

### 4. 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 앱을 확인할 수 있습니다.

## Vercel 배포

### 1. Vercel에 프로젝트 연결

```bash
npm i -g vercel
vercel
```

### 2. 환경 변수 설정

Vercel 대시보드에서 프로젝트 설정 > Environment Variables에 다음 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`

### 3. GitHub 연동

1. GitHub 저장소에 코드 푸시
2. Vercel에서 GitHub 저장소 연결
3. 자동 배포 설정 완료

## 주요 기능

- 🤖 **멀티 AI 채팅**: GPT-4, Claude, Gemini 동시 사용
- 📚 **프롬프트 라이브러리**: 템플릿 저장 및 공유
- 📊 **사용량 분석**: 실시간 비용 추적
- 👥 **팀 협업**: 워크스페이스 및 권한 관리
- 🔐 **보안**: Supabase RLS로 데이터 보호

## 프로젝트 구조

```
hotai-platform/
├── app/                  # Next.js App Router
│   ├── (auth)/          # 인증 페이지
│   ├── (dashboard)/     # 대시보드
│   └── api/             # API 라우트
├── components/          # React 컴포넌트
├── lib/                 # 유틸리티
│   ├── supabase/       # Supabase 클라이언트
│   └── ai/             # AI 서비스
├── supabase/           # 데이터베이스 마이그레이션
└── public/             # 정적 파일
```

## 개발 가이드

### 브랜치 전략

- `main`: 프로덕션 배포
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `hotfix/*`: 긴급 수정

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 작업 수정
```

## 라이선스

MIT License

## 문의

- 이메일: contact@hotai.com
- 웹사이트: https://hotai.com# Deploy trigger
