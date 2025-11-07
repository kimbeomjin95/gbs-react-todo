# JSX 문법

JSX는 **JavaScript 안에 HTML 같은 코드를 직접 작성할 수 있게 해주는 문법**입니다.

실제로는 HTML이 아니라 JavaScript로 변환되어 실행됩니다.

```tsx
// JSX 코드 (우리가 작성)
const element = <h1>안녕하세요</h1>

// JavaScript로 변환됨 (실제 실행)
const element = React.createElement('h1', null, '안녕하세요')
```

## 📝 기본 문법

### JSX 표현식

중괄호 `{}`를 사용하여 JavaScript 표현식을 삽입할 수 있습니다.

```tsx
const userName = '강북';
const age = 25;
const user = { name: '김철수', email: 'kim@example.com' };
const isLoggedIn = true;
const items = ['사과', '바나나', '오렌지'];

// 다양한 표현식 사용 예시
<div>{userName}</div>                                    {/* 변수 */}
<div>{2 + 3}</div>                                       {/* 산술 연산 */}
<div>{age > 18 ? '성인' : '미성년자'}</div>               {/* 삼항 연산자 */}
<div>{user.name}</div>                                   {/* 객체 속성 */}
<div>{user.email.toUpperCase()}</div>                    {/* 메서드 호출 */}
<div>{isLoggedIn ? '로그아웃' : '로그인'}</div>          {/* 조건부 렌더링 */}
<div>{items.length}개의 항목</div>                       {/* 배열 길이 */}
<div>{items.join(', ')}</div>                            {/* 배열 메서드 */}
<div>{Math.random().toFixed(2)}</div>                    {/* Math 함수 */}
<div>{`안녕하세요, ${userName}님`}</div>                 {/* 템플릿 리터럴 */}
```

**주의사항:**

```tsx
// ❌ 객체를 직접 렌더링할 수 없음
<div>{user}</div>  // Error: Objects are not valid as a React child

// ✅ 객체의 속성은 가능
<div>{user.name}</div>

// ❌ if문은 표현식이 아니므로 사용 불가
<div>{if (isLoggedIn) { "환영합니다" }}</div>

// ✅ 삼항 연산자 또는 논리 연산자 사용
<div>{isLoggedIn ? "환영합니다" : "로그인하세요"}</div>
<div>{isLoggedIn && "환영합니다"}</div>
```

### JSX는 표현식입니다

JSX도 JavaScript 표현식이므로 변수에 할당하거나 함수에서 반환할 수 있습니다.

```tsx
const getGreeting = (user) => {
  if (user) {
    return <h1>안녕하세요, {user.name}님!</h1>;
  }
  return <h1>안녕하세요, 방문자님!</h1>;
};

export default getGreeting;
```

## 🎨 JSX 속성

### HTML 속성과의 차이

JSX에서는 `camelCase`를 사용합니다:

```tsx
// ❌ HTML
<div class="container" onclick="handleClick()">

// ✅ JSX
<div className="container" onClick={handleClick}>
```

### 동적 속성

```tsx
const imageUrl = 'logo.png';
const element = <img src={imageUrl} alt="로고" />;
```

## 🔄 JSX 자식

### 여러 자식 요소

```tsx
const element = (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);
```

### 자식이 없는 태그

자식이 없는 태그는 `/>` 로 닫아야 합니다:

```tsx
const element = <img src="logo.png" />;
```

## ⚠️ JSX 주의사항

### 1. 하나의 부모 요소

JSX는 반드시 **하나의 부모 요소**로 감싸야 합니다:

```tsx
// ❌ 잘못된 예
return (
  <h1>제목</h1>
  <p>내용</p>
);

// ✅ 올바른 예
return (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);

// ✅ Fragment 사용
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);
```

### 2. JavaScript 예약어

`class` 대신 `className`, `for` 대신 `htmlFor` 사용:

```tsx
<label htmlFor="name" className="label">
  이름
</label>
```

### 3. 인라인 스타일

객체 형태로 작성하며, CSS 속성은 camelCase:

```tsx
const style = {
  backgroundColor: 'blue',
  fontSize: '16px'
};

<div style={style}>스타일 적용</div>
```

## 💡 조건부 렌더링

### 삼항 연산자

```tsx
{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}
```

### 논리 AND 연산자

```tsx
{messages.length > 0 && (
  <div>새 메시지가 {messages.length}개 있습니다.</div>
)}
```

## 📚 리스트 렌더링

`map()` 함수를 사용하여 배열을 JSX 요소로 변환:

```tsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => (
  <li key={number}>{number}</li>
));

return <ul>{listItems}</ul>;
```

**중요**: 각 항목에는 고유한 `key` prop이 필요합니다!

## 🔧 JSX 변환 과정

JSX는 실제로 JavaScript가 아닙니다. **Babel**이라는 도구가 JSX를 일반 JavaScript로 변환합니다.

### JSX → JavaScript 변환

**JSX 코드:**
```tsx
const element = <h1 className="greeting">안녕하세요!</h1>;
```

**변환된 JavaScript (React 17 이전):**
```tsx
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  '안녕하세요!'
);
```

**변환된 JavaScript (React 17+):**
```tsx
import { jsx as _jsx } from 'react/jsx-runtime';

const element = _jsx(
  'h1',
  { className: 'greeting', children: '안녕하세요!' }
);
```

### React.createElement 구조

```tsx
React.createElement(
  type,        // 'div', 'h1' 또는 컴포넌트
  props,       // { className: 'title', onClick: handleClick }
  children     // 자식 요소들
)
```

**복잡한 예제:**

**JSX:**
```tsx
<div className="container">
  <h1>제목</h1>
  <p>내용</p>
</div>
```

**변환된 JavaScript:**
```tsx
React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, '제목'),
  React.createElement('p', null, '내용')
)
```

### 컴포넌트 변환

**JSX:**
```tsx
const App = () => {
  return <Welcome name="강북" />;
}
```

**변환된 JavaScript:**
```tsx
const App = () => {
  return React.createElement(Welcome, { name: '강북' });
}
```

### 왜 React를 import 해야 했을까?

React 17 이전에는 JSX를 사용하면 `React.createElement`가 호출되므로:

```tsx
import React from 'react';  // 이게 필요했음!

const App = () => {
  return <div>Hello</div>;
}
```

React 17+부터는 자동으로 import되므로 생략 가능:

```tsx
// import React 없이도 동작!
const App = () => {
  return <div>Hello</div>;
}
```

## 🔑 key prop의 중요성

리스트를 렌더링할 때 `key` prop은 **필수**입니다.

### key가 필요한 이유

React는 리스트가 변경될 때 **어떤 항목이 변경/추가/제거**되었는지 알아야 합니다.

**key 없이 렌더링:**
```tsx
// ❌ key 없음
{todos.map(todo => (
  <TodoItem todo={todo} />
))}

// 경고: Warning: Each child in a list should have a unique "key" prop.
```

React는 항목을 구별할 수 없어서 **전체를 다시 렌더링**할 수 있습니다.

**key와 함께 렌더링:**
```tsx
// ✅ key 사용
{todos.map(todo => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

React가 각 항목을 추적하여 **변경된 것만** 업데이트합니다.

### key 선택 기준

**1. 고유한 ID 사용 (최선):**
```tsx
// ✅ 데이터베이스 ID 또는 고유 ID
const todos = [
  { id: 1, text: 'A' },
  { id: 2, text: 'B' },
];

{todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>
))}
```

**2. 안정적인 고유값 생성:**
```tsx
// ✅ 추가 시 고유 ID 생성
const addTodo = () => {
  const newTodo = {
    id: Date.now(),  // 또는 uuid()
    text: inputValue
  };
  setTodos([...todos, newTodo]);
};
```

**3. index 사용 (최후의 수단):**
```tsx
// ⚠️ 항목이 추가/제거/재정렬되지 않을 때만
{items.map((item, index) => (
  <li key={index}>{item}</li>
))}
```

### index를 key로 사용하면 안 되는 이유

**문제 상황:**

```tsx
import { useState } from 'react';

const IndexKeyExample = () => {
  const [items, setItems] = useState(['A', 'B', 'C']);

  // ❌ index를 key로 사용
  return (
    <div>
      {items.map((item, index) => (
        <input key={index} defaultValue={item} />
      ))}
    </div>
  );
};

export default IndexKeyExample;
```

**초기 상태:**
```
index=0: <input key={0} defaultValue="A" />
index=1: <input key={1} defaultValue="B" />
index=2: <input key={2} defaultValue="C" />
```

**'A' 삭제 후:**
```
index=0: <input key={0} defaultValue="B" />  // 재사용됨!
index=1: <input key={1} defaultValue="C" />  // 재사용됨!
```

React는 `key={0}`이 그대로 있다고 판단하여 **기존 input을 재사용**합니다.
사용자가 입력한 값이 잘못된 항목에 남아있을 수 있습니다!

**올바른 방법:**
```tsx
import { useState } from 'react';

const UniqueKeyExample = () => {
  const [items, setItems] = useState([
    { id: 1, text: 'A' },
    { id: 2, text: 'B' },
    { id: 3, text: 'C' },
  ]);

  // ✅ 고유 ID를 key로 사용
  return (
    <div>
      {items.map(item => (
        <input key={item.id} defaultValue={item.text} />
      ))}
    </div>
  );
};

export default UniqueKeyExample;
```

**'A' 삭제 후:**
```
key={2}: <input defaultValue="B" />  // 정확히 B
key={3}: <input defaultValue="C" />  // 정확히 C
```

React가 `key={1}`이 사라졌음을 알고 해당 DOM을 제거합니다.

### key가 작동하는 원리

**Reconciliation (재조정) 과정:**

```tsx
// 이전 렌더링
[
  <li key="1">A</li>,
  <li key="2">B</li>,
  <li key="3">C</li>
]

// 새로운 렌더링 (B 삭제)
[
  <li key="1">A</li>,
  <li key="3">C</li>
]
```

**React의 판단:**
1. `key="1"` 존재 → 유지
2. `key="2"` 사라짐 → 제거
3. `key="3"` 존재 → 유지

결과: B만 DOM에서 제거, A와 C는 재사용

**index를 key로 사용한 경우:**

```tsx
// 이전 렌더링
[
  <li key={0}>A</li>,
  <li key={1}>B</li>,
  <li key={2}>C</li>
]

// 새로운 렌더링 (B 삭제)
[
  <li key={0}>A</li>,
  <li key={1}>C</li>  // key는 1인데 내용은 C!
]
```

**React의 잘못된 판단:**
1. `key={0}` → 유지 (A → A) ✅
2. `key={1}` → 유지 (B → C) ❌ 내용 변경!
3. `key={2}` → 제거 ✅

결과: B의 DOM이 재사용되고 내용만 C로 변경 → 버그 발생 가능!

### key 사용 모범 사례

**✅ 좋은 예:**
```tsx
// 1. 데이터베이스 ID
<li key={user.id}>{user.name}</li>

// 2. 생성 시 고유 ID
<li key={todo.id}>{todo.text}</li>

// 3. 안정적인 고유값
<li key={`${item.category}-${item.name}`}>{item.name}</li>
```

**❌ 나쁜 예:**
```tsx
// 1. 배열 index
<li key={index}>{item}</li>

// 2. Math.random() (매번 변경됨!)
<li key={Math.random()}>{item}</li>

// 3. 중복 가능한 값
<li key={item.name}>{item.name}</li>  // 이름 중복 가능
```

### 핵심 정리

1. **JSX는 `React.createElement`로 변환됨**
2. **리스트에는 반드시 key 필요**
3. **key는 고유하고 안정적이어야 함**
4. **index는 최후의 수단** (추가/삭제/재정렬 없을 때만)
5. **key는 형제 간에만 고유하면 됨** (전역적으로 고유할 필요 없음)

## 다음 단계

다음 장에서는 컴포넌트와 Props에 대해 알아보겠습니다.
