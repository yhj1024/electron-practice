# Electron Practice

모던 데스크톱 애플리케이션 개발을 위한 Electron 기반 프로젝트

## 프로젝트 소개

본 프로젝트는 **Electron을 학습하기 위한 실습 프로젝트**입니다.

현재는 **국내의 다양한 채용공고 사이트**(원티드, 사람인, 점핏)의 자료들을 크롤링하여 빠르게 채용정보를 확인하는 기능을 제공합니다. 또한 **AI(Ollama)를 통해 채용공고에 대한 질문**을 하고 실시간 스트리밍 답변을 받을 수 있습니다.

### 주요 기능

- 📋 **다중 사이트 채용공고 크롤링** - 원티드, 사람인, 점핏의 채용공고를 한 곳에서 조회
- 🔍 **통합 검색 및 필터링** - 제목, 회사명, 출처별 필터링 지원
- 📝 **상세 내용 자동 수집** - 클릭 한 번으로 모든 공고의 상세 내용 크롤링
- 💬 **AI 채팅 기능** - 채용공고에 대해 AI와 대화하며 분석
- ⚡ **실시간 스트리밍 답변** - AI 답변을 실시간으로 타이핑되는 것처럼 확인
- 📊 **가상 스크롤링** - TanStack Virtual로 대량의 데이터를 빠르게 렌더링

## 기술 스택

- **Electron 38** - 크로스 플랫폼 데스크톱 앱 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성을 위한 정적 타입 시스템
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Electron Vite** - Electron을 위한 Vite 기반 빌드 시스템
- **Tailwind CSS 4** - 유틸리티 기반 CSS 프레임워크

## 개발 환경 설정

### 필수 요구사항

- Node.js 18 이상
- pnpm 8 이상

### 설치

```bash
# 의존성 설치
pnpm install
```

## 실행 방법

### 개발 모드

```bash
pnpm dev
```

개발 서버가 시작되고 Electron 앱이 자동으로 실행됩니다.
- Hot Module Replacement (HMR) 지원
- 개발자 도구 자동 오픈

### 프로덕션 빌드

```bash
pnpm build
```

`out/` 디렉토리에 최적화된 빌드 파일이 생성됩니다.

## 코드 품질

### Linting

```bash
# ESLint 검사
pnpm lint

# 자동 수정
pnpm lint:fix
```

### Formatting

```bash
# Prettier 포맷팅
pnpm format

# 포맷 검사만
pnpm format:check
```

## 프로젝트 구조

```
electron-practice/
├── src/
│   ├── main/           # Electron Main Process
│   ├── preload/        # Preload Scripts
│   └── renderer/       # React 앱 (Renderer Process)
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── out/                # 빌드 결과물
├── electron.vite.config.ts
└── package.json
```

## 주요 기능

- ✅ TypeScript 전체 지원
- ✅ React 19 + Hooks
- ✅ Tailwind CSS 4 스타일링
- ✅ ESLint + Prettier 코드 품질 관리
- ✅ Hot Module Replacement
- ✅ 개발자 도구 통합

## 라이선스

MIT
