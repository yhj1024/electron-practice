# 주요 기능 및 구현 방식

## 1. 🕷️ 크롤링 시스템

### 멀티 사이트 데이터 수집 (원티드, 사람인, 점핏)

#### REST API 방식 (원티드, 점핏)
- HTTP GET → JSON 응답 수신 → 타입 변환 → JSON 파일 저장
- 깔끔하고 안정적인 구조화된 데이터 수집

#### 웹 스크래핑 방식 (사람인)
- **이유**: 공개 API 미제공
- **기술**: Cheerio.js로 HTML 파싱
- HTML 다운로드 → CSS 선택자로 데이터 추출 → 타입 변환 → JSON 파일 저장
- API 부하 방지 500ms 딜레이 적용

#### 데이터 저장
- 위치: `~/Library/Application Support/electron-saju/jobs/`
- `wanted-raw.json`, `jumpit-raw.json`, `saramin-raw.json` (사이트별 원본)
- `normalized.json` (통일된 형식) ← Renderer가 읽는 파일

## 2. ⚡ 대량 데이터 렌더링 최적화

### TanStack Virtual 가상 스크롤링

**문제**: 2,000개 공고 한 번에 렌더링 시 성능 저하

**해결**: 화면에 보이는 ~20개만 DOM 렌더링, 스크롤 시 동적 교체

**기술**:
- `@tanstack/react-table` - 테이블 데이터 관리
- `@tanstack/react-virtual` - 가상 스크롤링

**성능**:
- 렌더링 시간: 10초 → 0.5초 (20배)
- 메모리: 500MB → 50MB (10배)
- 스크롤: 10fps → 60fps

## 3. 🔄 실시간 상세 내용 업데이트

### IPC 이벤트 기반 실시간 UI 반영 (invoke + send/on 혼합)

**동작**:
1. Renderer → `invoke('load-job-details')` 작업 시작
2. Main Process → 각 공고 크롤링 완료마다 `send('job-detail-loaded', job)` 이벤트 발행
3. Renderer → `onJobDetailLoaded()` 리스너로 실시간 수신, 해당 row 즉시 업데이트
4. Main Process → JSON 파일에 동시 저장

**특징**:
- 진행률 실시간 표시 (23/2,000)
- 개별 row 단위 즉시 업데이트
- 중단해도 진행 상황 유지 (JSON 저장)

## 4. 💬 AI 채팅 스트리밍

### HTTP Streaming API 실시간 응답

**AI 서버**: Ollama (qwen3:32b, Mac Studio)

**기존 문제**: 30초 동안 응답 없음 → 사용자 불안감

**해결**: HTTP Streaming으로 ChatGPT 스타일 실시간 응답

**동작**:
1. Main Process → Ollama API에 `stream: true` 요청
2. `ReadableStream.getReader()`로 청크 단위 읽기
3. 각 청크마다 Main → `send('ai-chat-chunk', chunk)` 이벤트 발행
4. Renderer → `onAiChatChunk()` 리스너로 실시간 텍스트 누적 표시

**Event Loop 동시성**:
- 각 `await reader.read()`마다 CPU 해제 → 다른 채팅 처리 가능
- Event Loop가 여러 스트림 사이를 빠르게 전환 (인터리빙)
- 테스트 결과: 195.9% 효율 (거의 2배 빠름)
- 단일 스레드지만 여러 채팅이 동시에 응답되는 느낌

## 기술 스택 요약

| 기능 | 기술 | 특징 |
|------|------|------|
| 크롤링 | REST API + Cheerio.js | 멀티 소스 데이터 수집 |
| 데이터 저장 | JSON 파일 | 영구 저장 |
| 렌더링 | TanStack Virtual | 20배 성능 개선 |
| 실시간 업데이트 | IPC send/on | 즉시 반영 |
| AI 채팅 | HTTP Streaming | 실시간 응답 |
| 동시성 | Event Loop | 인터리빙 처리 |
