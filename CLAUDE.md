# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Electron-based desktop application using React 19, TypeScript, and Vite. This is a practice project for learning cross-platform desktop development.

**Tech Stack**: Electron 38 + React 19 + TypeScript + Vite + Tailwind CSS 4

**Package Manager**: pnpm (required)

## Development Commands

### Essential Commands

```bash
# Install dependencies (required before first run)
pnpm install

# Development with HMR and DevTools
pnpm dev

# Production build (output: /out directory)
pnpm build

# Code quality checks
pnpm lint              # Check for issues
pnpm lint:fix          # Auto-fix ESLint issues
pnpm format            # Format all code with Prettier
pnpm format:check      # Verify formatting only
```

### Testing

Testing infrastructure is configured but **no tests exist yet**. The project uses Vitest with React Testing Library.

```bash
# When tests are added, run with:
vitest
# Or with UI:
pnpm vitest --ui
```

**Note**: The setup file `src/test/setup.ts` is referenced in `vitest.config.ts` but doesn't exist yet. Create it before writing tests.

## Architecture

### Electron Multi-Process Model

The application follows Electron's standard three-process architecture:

| Process | Location | Purpose |
|---------|----------|---------|
| **Main** | `src/main/index.ts` | Window management, app lifecycle, native APIs |
| **Preload** | `src/preload/index.ts` | IPC bridge between main and renderer (currently empty) |
| **Renderer** | `src/renderer/` | React UI application running in browser context |

### Main Process (`src/main/index.ts`)

- Creates `BrowserWindow` (1200×800 default)
- Opens DevTools automatically in development
- Handles app lifecycle events
- Platform-aware quit behavior (macOS vs others)

**Currently minimal** - no IPC handlers or advanced Electron APIs implemented yet.

### Renderer Process (`src/renderer/`)

- **Entry**: `index.html` → `main.tsx` → `App.tsx`
- React 19 with new JSX transform (no React imports needed)
- Tailwind CSS for styling

### Preload Script (`src/preload/index.ts`)

**Currently empty**. When implementing IPC:
- Use `contextBridge.exposeInMainWorld()` to expose secure APIs
- Never expose entire Node.js APIs to renderer
- Follow principle of least privilege

## TypeScript Configuration

**Strict mode enabled** with modern ES2020 target:
- All strict checks active
- JSX mode: `react-jsx` (React 17+ transform)
- Module resolution: bundler mode
- Target: ES2020

When adding new code:
- Enable strict null checks
- Avoid `any` types
- Use explicit return types for public functions

## Code Style

### Language Requirements

**IMPORTANT**: All test code and comments must be written in Korean.

- **Test descriptions**: Use Korean for `describe()`, `it()`, `test()` blocks
- **Code comments**: All inline comments, JSDoc, and documentation comments in Korean
- **Production code**: Variable/function names in English, comments in Korean

**Example**:
```typescript
// 사용자 인증 상태를 확인합니다
function checkAuthStatus(user: User) {
  // 토큰이 만료되었는지 검증
  if (isTokenExpired(user.token)) {
    return false
  }
  return true
}

// 테스트 예시
describe('사용자 인증', () => {
  it('토큰이 만료되면 false를 반환해야 함', () => {
    // 테스트 코드
  })
})
```

### ESLint Configuration

Uses flat config format (`eslint.config.js`) with:
- TypeScript plugin with strict rules
- React plugin (v19 configuration)
- React Hooks plugin (enforces rules of hooks)
- Prettier integration (runs as ESLint rule)

**Key rules**:
- Unused vars: Warning (allow underscore prefix: `_unusedVar`)
- Console.warn/error allowed; console.log flagged
- React 19: No JSX import needed in components

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "arrowParens": "avoid"
}
```

**Always run** `pnpm format` before committing.

## Build System

### Electron Vite (`electron.vite.config.ts`)

Custom configuration that handles:
- Main process compilation (Node.js target)
- Preload script compilation (isolated context)
- Renderer process compilation (browser target with React + Tailwind)

Build outputs to `/out` directory with three subdirectories matching process types.

### Development Server

Running `pnpm dev`:
1. Starts Vite dev server for renderer (HMR enabled)
2. Compiles main and preload in watch mode
3. Launches Electron with DevTools open
4. Changes to React code reload instantly (HMR)
5. Changes to main process restart app automatically

## Common Patterns

### Adding New React Components

1. Create in `src/renderer/components/` (create directory if needed)
2. Use `.tsx` extension
3. No React import needed (configured in tsconfig)
4. Use Tailwind classes for styling

### Implementing IPC Communication

When ready to add main ↔ renderer communication:

**1. Preload** (`src/preload/index.ts`):
```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  doSomething: (data) => ipcRenderer.invoke('do-something', data)
})
```

**2. Main** (`src/main/index.ts`):
```typescript
import { ipcMain } from 'electron'

ipcMain.handle('do-something', async (event, data) => {
  // Handle request
  return result
})
```

**3. Renderer** (add types in `src/renderer/global.d.ts`):
```typescript
declare global {
  interface Window {
    api: {
      doSomething: (data: any) => Promise<any>
    }
  }
}
```

### Testing Setup (when adding tests)

1. Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

2. Add test files as `*.test.tsx` or `*.spec.tsx`
3. Use React Testing Library patterns:
   - `render()` for components
   - `screen` queries for assertions
   - `userEvent` for interactions (install `@testing-library/user-event` first)

## Project Status

**Current state**: Minimal scaffolding with demo component

**Missing/TODO**:
- Test suite implementation (infrastructure configured, no tests written)
- Preload script IPC implementation (currently empty)
- Application features beyond demo component
- `src/test/setup.ts` file (referenced but not created)

## File Structure

```
src/
├── main/           # Electron main process (Node.js environment)
├── preload/        # Secure IPC bridge scripts
└── renderer/       # React application (browser environment)
    ├── App.tsx     # Root component
    ├── main.tsx    # React DOM entry
    ├── index.html  # HTML template
    └── index.css   # Tailwind imports

out/                # Production build output
├── main/
├── preload/
└── renderer/
```

## Development Notes

- **DevTools**: Opens automatically in dev mode (see `src/main/index.ts:22`)
- **HMR**: Only works for renderer process; main process changes require app restart
- **Node Version**: Designed for Node.js 18+, types target Node 24.8.1+
- **Platform**: Tested on macOS (Darwin 24.6.0); cross-platform testing needed

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Electron Vite](https://electron-vite.org/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)