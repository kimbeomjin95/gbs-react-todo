# React 앱이 실행되는 원리

React가 브라우저에서 어떻게 실행되고 화면에 표시되는지 알아봅니다.

## 🎯 SPA (Single Page Application)

React는 **SPA(Single Page Application)** 방식으로 작동합니다.

### 전통적인 웹사이트 vs SPA

**전통적인 웹사이트:**
```
페이지 이동 → 서버에서 새 HTML 받음 → 전체 페이지 새로고침
```

**SPA (React):**
```
페이지 이동 → JavaScript가 DOM 업데이트 → 부분만 변경 (새로고침 없음)
```

### SPA의 장점

- ⚡ **빠른 페이지 전환**: 전체 페이지를 다시 로드하지 않음
- 🎨 **부드러운 사용자 경험**: 네이티브 앱처럼 느껴짐
- 📦 **효율적인 데이터 사용**: 필요한 데이터만 가져옴

## 📁 프로젝트 구조 다시 보기

Vite React 프로젝트의 핵심 파일들:

```
my-react-app/
├── index.html          ← 1. 브라우저가 처음 로드하는 파일
├── src/
│   ├── main.tsx        ← 2. JavaScript 진입점
│   └── App.tsx         ← 3. 루트 컴포넌트
└── ...
```

## 🔄 React 앱 실행 과정

### 1단계: index.html 로드

브라우저가 가장 먼저 `index.html`을 로드합니다:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <!-- React 앱이 렌더링될 위치 -->
    <div id="root"></div>

    <!-- JavaScript 파일 로드 -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**핵심 포인트:**
- `<div id="root"></div>`: React 앱이 렌더링될 **빈 컨테이너**
- `<script src="/src/main.tsx">`: React 코드를 로드

### 2단계: main.tsx 실행

`src/main.tsx` 파일이 실행됩니다:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 1. root DOM 노드를 찾습니다
const rootElement = document.getElementById('root')!

// 2. React Root를 생성합니다
const root = ReactDOM.createRoot(rootElement)

// 3. App 컴포넌트를 렌더링합니다
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**단계별 설명:**

1. **DOM 노드 찾기**
   ```tsx
   const rootElement = document.getElementById('root')!
   ```
   - `index.html`의 `<div id="root">`를 찾습니다
   - `!`는 TypeScript에게 "이 요소는 확실히 존재해"라고 알려줍니다

2. **React Root 생성**
   ```tsx
   const root = ReactDOM.createRoot(rootElement)
   ```
   - React 18의 새로운 방식
   - 해당 DOM 노드를 React가 관리하도록 설정

3. **컴포넌트 렌더링**
   ```tsx
   root.render(<App />)
   ```
   - `App` 컴포넌트를 `root` div 안에 렌더링
   - `<React.StrictMode>`는 개발 모드에서 잠재적 문제를 발견하는 도구

### 3단계: App 컴포넌트 실행

`src/App.tsx`의 코드가 실행됩니다:

```tsx
import { useState } from 'react'
import './App.css'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>강북 스터디</h1>
      <button onClick={() => setCount(count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
```

이 컴포넌트가 반환하는 JSX가 실제 DOM으로 변환됩니다.

### 4단계: 최종 결과

브라우저의 실제 DOM:

```html
<div id="root">
  <div class="App">
    <h1>강북 스터디</h1>
    <button>count is 0</button>
  </div>
</div>
```

React가 JSX를 실제 HTML 요소로 변환하여 주입했습니다!

## 🔍 더 깊게 이해하기

### Virtual DOM

React는 직접 실제 DOM을 조작하지 않고 Virtual DOM을 사용합니다:

```
1. 컴포넌트 렌더링 → Virtual DOM 생성
2. 이전 Virtual DOM과 비교
3. 변경된 부분만 실제 DOM에 반영
```

**예시:**

```tsx
const App = () => {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>
    count is {count}
  </button>
}
```

버튼 클릭 시:
1. `count` 상태가 변경됨 (0 → 1)
2. React가 새로운 Virtual DOM 생성
3. 이전 Virtual DOM과 비교 (`count is 0` vs `count is 1`)
4. **텍스트 부분만** 실제 DOM에서 업데이트

버튼 전체를 다시 만드는 게 아니라 **텍스트만 변경**합니다!

### 개발자 도구로 확인하기

1. 브라우저에서 React 앱 실행
2. F12 (개발자 도구) 열기
3. Elements 탭에서 `<div id="root">` 확인
4. 버튼 클릭하며 텍스트만 변경되는 것 관찰

## 🎨 실습: 직접 확인해보기

### 실습 1: index.html 수정

`index.html`을 열고 title을 변경해보세요:

```html
<title>나의 첫 React 앱</title>
```

브라우저 탭의 제목이 바뀝니다!

### 실습 2: root div 확인

`index.html`에서 `id="root"`를 다른 이름으로 바꾸면?

```html
<div id="app"></div>
```

**결과**: 에러 발생! React가 `root`를 찾지 못합니다.

`main.tsx`도 함께 수정해야 합니다:

```tsx
const rootElement = document.getElementById('app')!
```

### 실습 3: 렌더링 과정 로그 찍기

`main.tsx`에 로그를 추가해보세요:

```tsx
console.log('1. main.tsx 실행')

const rootElement = document.getElementById('root')!
console.log('2. root 요소 찾음:', rootElement)

const root = ReactDOM.createRoot(rootElement)
console.log('3. React Root 생성 완료')

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
console.log('4. App 컴포넌트 렌더링 요청')
```

브라우저 콘솔(F12)에서 순서대로 로그가 출력됩니다!

## 🚀 빌드 과정

### 개발 모드 (npm run dev)

```
src/main.tsx → Vite 개발 서버 → 브라우저
   ↓
빠른 HMR (Hot Module Replacement)
변경 시 즉시 반영
```

### 프로덕션 빌드 (npm run build)

```
src/ 폴더의 모든 파일
   ↓
Vite + Rollup 빌드
   ↓
dist/ 폴더
├── index.html
├── assets/
│   ├── index-abc123.js  (최적화된 JavaScript)
│   └── index-xyz789.css (최적화된 CSS)
```

빌드 후 `dist/index.html`을 보면:

```html
<div id="root"></div>
<script type="module" src="/assets/index-abc123.js"></script>
```

모든 React 코드가 하나의 최적화된 JavaScript 파일로 번들링됩니다!

## 💡 핵심 정리

1. **HTML은 하나뿐**: `index.html`만 존재 (SPA)
2. **빈 div에서 시작**: `<div id="root"></div>`
3. **JavaScript가 주입**: React가 DOM을 동적으로 생성
4. **Virtual DOM 활용**: 효율적인 업데이트
5. **번들링**: 모든 코드가 하나의 JavaScript 파일로 합쳐짐

## 🎯 다음 단계

React의 실행 원리를 이해했다면 [React란 무엇인가?](/docs/react-basics/what-is-react)로 이동하여 본격적인 학습을 시작하세요!
