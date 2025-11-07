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

### 🔬 실제로 확인해보기

개발자 도구를 사용하여 React가 부분만 업데이트하는 것을 직접 확인할 수 있습니다:

**1단계: 개발 서버 실행**

```bash
pnpm dev
```

**2단계: 브라우저에서 열기**

http://localhost:5173 접속

**3단계: 개발자 도구 열기**

- Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**4단계: Elements 탭에서 관찰**

1. Elements 탭 선택
2. `<div id="root">` 아래의 `<button>` 요소 찾기
3. 버튼을 클릭하면서 Elements 탭 관찰

![개발자 도구에서 count 값이 20으로 변경된 화면](image.png)

*버튼을 클릭하면 `"20"` 부분만 하이라이트되며 업데이트됩니다*

**결과**:
- 버튼의 텍스트 부분만 **깜빡이며 변경**됨 (`count is 0` → `count is 1`)
- 버튼 전체나 다른 요소는 재생성되지 않음
- **HTML 전체가 새로 로드되지 않음** (Network 탭에서도 확인 가능)

이것이 바로 React의 효율적인 DOM 업데이트 방식입니다!

### SPA의 장점

#### ⚡ 빠른 페이지 전환

전통적인 웹사이트는 페이지 이동 시 서버에서 새로운 HTML을 받아와 전체 페이지를 새로고침합니다. 반면 SPA는:

- 초기 로딩 시에만 전체 HTML/CSS/JavaScript를 다운로드
- 이후 페이지 이동 시에는 **필요한 부분만 업데이트**
- 화면 깜빡임 없이 즉각적인 반응

**예시:**
```
전통적인 웹사이트: 홈 → 상품 목록 (전체 로딩 2초)
SPA (React):      홈 → 상품 목록 (부분 업데이트 0.1초)
```

#### 🎨 부드러운 사용자 경험

- **애니메이션과 트랜지션**: 페이지 전환 시 부드러운 애니메이션 적용 가능
- **상태 유지**: 스크롤 위치, 입력 폼 데이터 등이 유지됨
- **로딩 인디케이터**: 데이터 로딩 중에도 UI는 반응형으로 동작

모바일 앱처럼 자연스러운 UX를 제공하여 사용자 만족도가 높아집니다.

#### 📦 효율적인 데이터 사용

- **필요한 데이터만 요청**: 전체 HTML이 아닌 JSON 데이터만 받아옴
- **캐싱 활용**: 한 번 로드한 리소스는 재사용
- **대역폭 절약**: 모바일 환경에서 특히 유리

**데이터 전송량 비교:**
```
전통적인 방식: 매 페이지마다 전체 HTML (100KB) 전송
SPA:           초기 로딩 후 JSON 데이터만 (10KB) 전송
```

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

1. **`<div id="root"></div>`**: React 앱이 렌더링될 **빈 컨테이너**
   - 처음에는 완전히 비어있음
   - React가 여기에 컴포넌트를 주입함

2. **`<script type="module" src="/src/main.tsx">`**: JavaScript 진입점 로드
   - `type="module"`: ES6 모듈 방식으로 로드 (import/export 사용 가능)
   - 개발 모드에서는 Vite가 실시간으로 TypeScript를 JavaScript로 변환
   - 빌드 후에는 `/assets/index-[hash].js` 같은 번들 파일로 변경됨

**개발 vs 프로덕션:**

```html
<!-- 개발 모드 (pnpm dev) -->
<script type="module" src="/src/main.tsx"></script>
→ Vite가 실시간으로 변환해서 제공

<!-- 프로덕션 빌드 후 (pnpm build) -->
<script type="module" src="/assets/index-abc123.js"></script>
→ 모든 코드가 하나로 번들링된 최적화 파일
```

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

   **이전 방식 (React 17 이하)과 비교:**
   ```tsx
   // ❌ 구식 방법 (React 17)
   import ReactDOM from 'react-dom'
   ReactDOM.render(<App />, document.getElementById('root'))

   // ✅ 최신 방법 (React 18+)
   import ReactDOM from 'react-dom/client'
   const root = ReactDOM.createRoot(document.getElementById('root')!)
   root.render(<App />)
   ```

   `ReactDOM.createRoot`는 **React 18에서 도입된 새로운 Root API**로, React 애플리케이션을 DOM에 마운트하는 현대적인 방법입니다.

   **주요 특징:**
   - Concurrent Mode 기능 활성화 (동시성 렌더링)
   - 자동 배치(Automatic Batching) 지원
   - 더 나은 성능과 사용자 경험 제공

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
      <button onClick={() => setCount(prev => prev + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App
```

이 컴포넌트가 반환하는 **JSX**가 실제 DOM으로 변환됩니다.

:::info JSX란?
JSX는 **HTML이 아니지만, JavaScript 안에서 HTML처럼 보이는 문법을 사용할 수 있게 해주는 React 문법**입니다.

```tsx
// JSX 사용 (HTML처럼 보임)
<div className="App">
  <h1>강북 스터디</h1>
</div>
```

실제로는 JavaScript 코드로 변환되어 실행됩니다.

JSX에 대한 자세한 내용은 [JSX 가이드](/docs/react-basics/jsx)를 참고하세요!
:::

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
import { useState } from 'react'

const App = () => {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(prev => prev + 1)}>
    count is {count}
  </button>
}

export default App
```

버튼 클릭 시:
1. `count` 상태가 변경됨 (0 → 1)
2. React가 새로운 Virtual DOM 생성
3. 이전 Virtual DOM과 비교 (`count is 0` vs `count is 1`)
4. **텍스트 부분만** 실제 DOM에서 업데이트

버튼 전체를 다시 만드는 게 아니라 **텍스트만 변경**합니다!

### 개발자 도구로 Virtual DOM 확인하기

Chrome 개발자 도구에서 변경사항을 더 자세히 관찰할 수 있습니다:

**방법 1: Highlight Updates 활성화 (Chrome DevTools)**

1. Elements 탭 열기
2. 설정(⚙️) → Preferences 열기
3. Elements 섹션에서 "Show user agent shadow DOM" 체크
4. 버튼 클릭 시 변경된 DOM 요소가 **보라색으로 깜빡임**

**방법 2: Network 탭으로 확인**

1. Network 탭 열기
2. 버튼 여러 번 클릭
3. **새로운 HTML 요청이 없음**을 확인 (기존 페이지에서 JavaScript만 실행됨)

**방법 3: React DevTools 사용**

Chrome 확장 프로그램 "React Developer Tools" 설치 후:
1. Components 탭에서 실시간 state 변경 확인
2. Profiler 탭에서 렌더링 성능 측정

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

### 개발 모드 (pnpm dev)

개발 모드에서는 **빌드 없이** 바로 실행됩니다:

```
1. 브라우저가 index.html 요청
   ↓
2. <script src="/src/main.tsx"> 만남
   ↓
3. 브라우저가 /src/main.tsx 요청
   ↓
4. Vite가 실시간으로 TypeScript → JavaScript 변환
   ↓
5. 변환된 JavaScript를 브라우저에 전달
   ↓
6. 브라우저가 실행
```

**특징:**
- 빌드 과정 없이 즉시 실행 (매우 빠름!)
- HMR (Hot Module Replacement): 코드 수정 시 즉시 반영
- TypeScript/JSX를 **요청할 때마다** 실시간 변환
- 각 파일이 개별적으로 로드됨

### 프로덕션 빌드 (pnpm build)

배포용으로 최적화된 파일을 생성합니다.

#### 💡 번들링(Bundling)이란?

**여러 개의 파일을 하나로 합치는 과정**입니다.

React 프로젝트는 수많은 파일로 구성되어 있습니다:

```
src/
├── main.tsx           (10줄)
├── App.tsx            (50줄)
├── components/
│   ├── Header.tsx     (30줄)
│   ├── Footer.tsx     (20줄)
│   └── Button.tsx     (15줄)
└── utils/
    └── helpers.ts     (25줄)

node_modules/
└── react/             (수천 개의 파일!)
```

**번들링 전 (개발 모드):**
```
브라우저가 각 파일을 개별적으로 요청:
GET /src/main.tsx              ← 요청 1
GET /src/App.tsx               ← 요청 2
GET /src/components/Header.tsx ← 요청 3
GET /node_modules/react/...    ← 요청 4, 5, 6...
→ 총 100개 이상의 파일 요청!
```

**번들링 후 (프로덕션 빌드):**
```
모든 코드가 하나의 파일로 합쳐짐:
GET /assets/index-abc123.js    ← 단 1개의 요청!

이 파일 안에 모든 코드 포함:
- main.tsx + App.tsx + Header.tsx + Footer.tsx + ...
- React 라이브러리 코드
- 기타 모든 의존성
```

**번들링의 장점:**

1. **요청 횟수 감소**
   ```
   번들링 전: 100개 파일 = 100번 요청
   번들링 후: 1개 파일 = 1번 요청
   → 로딩 속도 대폭 향상!
   ```

2. **파일 크기 감소**
   - 중복 코드 제거
   - 사용하지 않는 코드 제거 (Tree Shaking)
   - 공백/주석 제거 (Minify)
   ```
   번들링 전: 500KB
   번들링 후: 150KB (압축)
   ```

3. **캐싱 최적화**
   ```
   index-abc123.js  ← 파일 내용 기반 해시
   (코드 변경 시 해시도 변경 → 새로 다운로드)
   (코드 동일 시 브라우저 캐시 사용 → 빠름)
   ```

#### 빌드 과정 상세

```
src/ 폴더의 모든 파일
├── main.tsx
├── App.tsx
├── index.css
└── ...
   ↓
Vite + Rollup 빌드 도구
- TypeScript → JavaScript 변환
- 모든 파일을 하나로 합침 (번들링)
- 코드 압축 (Minify)
- 사용하지 않는 코드 제거 (Tree Shaking)
   ↓
dist/ 폴더
├── index.html          (원본과 거의 동일)
└── assets/
    ├── index-abc123.js  (모든 JavaScript 통합)
    └── index-xyz789.css (모든 CSS 통합)
```

**빌드 전 index.html:**
```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

**빌드 후 dist/index.html:**
```html
<div id="root"></div>
<script type="module" src="/assets/index-abc123.js"></script>
```

**변경사항:**
- `/src/main.tsx` → `/assets/index-abc123.js`로 변경
- `abc123`은 파일 내용 기반 해시 (캐싱 최적화)
- 수백 개의 파일이 하나의 JavaScript 파일로 합쳐짐

### 실제로 확인하기

**1. 빌드 실행:**
```bash
pnpm build
```

**2. dist 폴더 확인:**
```bash
ls dist/
# index.html  assets/

ls dist/assets/
# index-abc123.js  index-xyz789.css
```

**3. 번들 파일 내용 확인:**

```bash
# 첫 200자만 출력
head -c 200 dist/assets/index-*.js
```

출력 예시:
```javascript
(function(){const e=React.createElement;function t(){const[n,r]=React.useState(0);return e("div",null,e("h1",null,"강북 스터디"),e("button",{onClick:()=>r(n+1)},"count is "...
```

엄청나게 긴 코드가 **한 줄로 압축**되어 있습니다! 이것이 main.tsx, App.tsx 등 모든 파일이 합쳐진 번들 파일입니다.

**4. 빌드된 파일 미리보기:**
```bash
pnpm preview
# http://localhost:4173 에서 실행
```

**5. Network 탭으로 번들링 효과 비교:**

개발 모드 (`pnpm dev`):
1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. 페이지 새로고침
4. 결과: **수십 개의 파일 요청**
   - main.tsx
   - App.tsx
   - node_modules/react/...
   - node_modules/react-dom/...
   - 각 컴포넌트 파일들

프로덕션 (`pnpm preview`):
1. 빌드 후 미리보기 실행
2. Network 탭에서 페이지 새로고침
3. 결과: **단 2-3개의 파일만 요청**
   - index.html
   - index-abc123.js (모든 JavaScript가 번들링됨)
   - index-xyz789.css (모든 CSS가 번들링됨)

이것이 번들링의 효과입니다! 🚀

## 💡 핵심 정리

1. **HTML은 하나뿐**: `index.html`만 존재 (SPA)
2. **빈 div에서 시작**: `<div id="root"></div>`
3. **JavaScript가 주입**: React가 DOM을 동적으로 생성
4. **Virtual DOM 활용**: 효율적인 업데이트
5. **번들링**: 모든 코드가 하나의 JavaScript 파일로 합쳐짐

## 🎯 다음 단계

React의 실행 원리를 이해했다면 [React란 무엇인가?](/docs/react-basics/what-is-react)로 이동하여 본격적인 학습을 시작하세요!
