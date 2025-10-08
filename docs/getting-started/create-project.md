# React 프로젝트 생성하기

Vite를 사용하여 React + TypeScript 프로젝트를 생성하는 방법을 알아봅니다.

## 🚀 Vite란?

Vite는 빠른 개발 서버와 최적화된 빌드를 제공하는 최신 프론트엔드 빌드 도구입니다.

### Vite의 장점

- ⚡ **매우 빠른 개발 서버**: HMR(Hot Module Replacement) 지원
- 📦 **최적화된 빌드**: Rollup 기반의 프로덕션 빌드
- 🎯 **간단한 설정**: 별도 설정 없이 바로 시작 가능
- 🔌 **TypeScript 기본 지원**: 추가 설정 없이 TypeScript 사용

## 📋 사전 준비

- [Node.js 20.0 이상 설치](/docs/getting-started/install-nodejs)
- 터미널(명령 프롬프트) 사용법 숙지

## 🎯 프로젝트 생성

### 1. 프로젝트 디렉토리 생성

원하는 위치에서 터미널을 열고 다음 명령어를 실행합니다:

```bash
# npm 사용
npm create vite@latest my-react-app

# pnpm 사용 (권장)
pnpm create vite my-react-app

# yarn 사용
yarn create vite my-react-app
```

### 2. 프레임워크 및 템플릿 선택

대화형 프롬프트가 나타나면 다음과 같이 선택합니다:

```
? Select a framework: › React
? Select a variant: › TypeScript
```

### 3. 프로젝트 디렉토리 이동

```bash
cd my-react-app
```

### 4. 의존성 설치

```bash
# npm
npm install

# pnpm (권장)
pnpm install

# yarn
yarn
```

### 5. 개발 서버 실행

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
```

성공적으로 실행되면 다음과 같은 메시지가 나타납니다:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

브라우저에서 http://localhost:5173/ 을 열면 Vite + React 시작 페이지를 볼 수 있습니다!

## 📁 프로젝트 구조

생성된 프로젝트의 기본 구조는 다음과 같습니다:

```
my-react-app/
├── node_modules/       # 설치된 패키지들
├── public/             # 정적 파일
│   └── vite.svg
├── src/                # 소스 코드
│   ├── assets/         # 이미지, 폰트 등
│   ├── App.css
│   ├── App.tsx         # 메인 컴포넌트
│   ├── index.css
│   └── main.tsx        # 진입점
├── .gitignore
├── index.html          # HTML 템플릿
├── package.json        # 프로젝트 설정
├── tsconfig.json       # TypeScript 설정
├── tsconfig.node.json
└── vite.config.ts      # Vite 설정
```

## 🎨 첫 번째 수정해보기

`src/App.tsx` 파일을 열고 내용을 수정해보세요:

```tsx
import { useState } from 'react'
import './App.css'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>강북 스터디</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          React + TypeScript + Vite 프로젝트입니다!
        </p>
      </div>
    </div>
  )
}

export default App
```

저장하면 브라우저가 자동으로 업데이트됩니다! 🎉

## 📦 주요 npm 스크립트

### 개발 서버 실행

```bash
npm run dev
```

로컬 개발 서버를 실행합니다. 기본 포트는 5173입니다.

### 프로덕션 빌드

```bash
npm run build
```

`dist/` 폴더에 최적화된 프로덕션 빌드를 생성합니다.

### 빌드 결과 미리보기

```bash
npm run preview
```

빌드된 결과물을 로컬에서 미리 볼 수 있습니다.

### 타입 체크

```bash
npm run type-check
# 또는
tsc --noEmit
```

TypeScript 타입 에러를 확인합니다.

## 🔧 유용한 VS Code 확장 프로그램

React + TypeScript 개발을 위해 다음 확장 프로그램 설치를 권장합니다:

- **ES7+ React/Redux/React-Native snippets**: React 코드 스니펫
- **TypeScript Vue Plugin (Volar)**: TypeScript 지원 강화
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포매팅
- **Auto Rename Tag**: HTML/JSX 태그 자동 수정

## 📚 추가 패키지 설치

필요에 따라 다음 패키지들을 추가로 설치할 수 있습니다:

### React Router (페이지 라우팅)

```bash
npm install react-router-dom
```

### ESLint + Prettier (코드 품질)

```bash
npm install -D eslint prettier eslint-config-prettier
```

### CSS 프레임워크

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 또는 Material-UI
npm install @mui/material @emotion/react @emotion/styled
```

## 🎯 다음 단계

프로젝트 생성이 완료되었다면 [React 기초](/docs/react-basics/what-is-react)를 학습하세요!

## ❓ 문제 해결

### 포트가 이미 사용 중인 경우

다른 포트로 실행:

```bash
npm run dev -- --port 3000
```

### 빌드 오류 발생 시

1. `node_modules` 삭제 후 재설치:
```bash
rm -rf node_modules
npm install
```

2. npm 캐시 정리:
```bash
npm cache clean --force
```

### TypeScript 오류

`tsconfig.json` 확인 및 필요시 재생성:

```bash
npx tsc --init
```
