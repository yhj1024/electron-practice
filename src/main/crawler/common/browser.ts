/**
 * Electron의 내장 Chromium 실행 파일 경로 반환
 * @returns Chromium 실행 파일 경로
 */
export function getChromiumPath(): string {
  // Electron의 process.execPath는 내장 Chromium을 포함한 실행 파일을 가리킴
  return process.execPath
}

/**
 * Puppeteer 기본 실행 옵션 (Electron용)
 * @returns Puppeteer launch 옵션
 */
export function getDefaultLaunchOptions() {
  return {
    executablePath: getChromiumPath(),
    headless: true, // 백그라운드 실행 (브라우저 창 숨김)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // 제한된 리소스 환경 대응
      '--disable-gpu', // GPU 하드웨어 가속 비활성화
    ],
  }
}
