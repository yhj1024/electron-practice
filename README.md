# Electron Practice

모던 데스크톱 애플리케이션 개발을 위한 Electron 기반 프로젝트

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
