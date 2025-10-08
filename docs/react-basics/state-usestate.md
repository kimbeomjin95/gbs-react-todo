# State와 useState

State는 컴포넌트가 기억하는 데이터입니다. State가 변경되면 컴포넌트가 다시 렌더링됩니다.

## 🎯 State란?

State는 컴포넌트의 **현재 상태**를 나타내는 데이터입니다:

- 사용자 입력값
- 선택된 항목
- 토글 상태 (열림/닫힘)
- API에서 받은 데이터

## 🪝 useState Hook

`useState`는 함수형 컴포넌트에서 state를 사용하게 해주는 Hook입니다.

### 기본 사용법

```tsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

### 구조

```tsx
const [상태변수, 상태변경함수] = useState(초기값);
```

- **상태변수**: 현재 state 값
- **상태변경함수**: state를 업데이트하는 함수
- **초기값**: state의 초기 값

## 📊 TypeScript와 함께 사용

### 타입 추론

TypeScript는 초기값으로 타입을 추론합니다:

```tsx
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string
const [isOpen, setIsOpen] = useState(false); // boolean
```

### 명시적 타입 지정

```tsx
type User = {
  name: string;
  age: number;
};

const [user, setUser] = useState<User | null>(null);
```

## 🔄 State 업데이트

### 직접 값 설정

```tsx
const [count, setCount] = useState(0);

setCount(5); // count를 5로 설정
```

### 이전 값 기반 업데이트

```tsx
const [count, setCount] = useState(0);

// ✅ 이전 값을 사용하는 올바른 방법
setCount(prevCount => prevCount + 1);

// ⚠️ 여러 번 업데이트 시 문제가 될 수 있음
setCount(count + 1);
```

## ⚠️ State 사용 시 주의사항

### 1. 직접 수정하지 말기

```tsx
// ❌ 잘못된 예
count = count + 1;
count++;

// ✅ 올바른 예
setCount(count + 1);
```

### 2. 객체/배열 State 업데이트

불변성을 유지해야 합니다:

```tsx
const [user, setUser] = useState({ name: '김철수', age: 25 });

// ❌ 잘못된 예
user.age = 26;
setUser(user);

// ✅ 올바른 예 (새 객체 생성)
setUser({ ...user, age: 26 });
```

### 3. 배열 State 업데이트

```tsx
const [items, setItems] = useState([1, 2, 3]);

// 추가
setItems([...items, 4]);

// 삭제
setItems(items.filter(item => item !== 2));

// 수정
setItems(items.map(item => item === 2 ? 20 : item));
```

## 💡 여러 State 사용하기

하나의 컴포넌트에서 여러 state를 사용할 수 있습니다:

```tsx
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={isLoading}>로그인</button>
    </form>
  );
}
```

## 🎨 실전 예제

### 토글 버튼

```tsx
const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

### 입력 폼

```tsx
const NameForm = () => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`제출된 이름: ${name}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
      />
      <button type="submit">제출</button>
    </form>
  );
}
```

### 카운터

```tsx
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>리셋</button>
    </div>
  );
}
```

## 🔍 State vs Props

| | State | Props |
|---|---|---|
| 변경 가능? | ✅ Yes (setState로) | ❌ No (읽기 전용) |
| 누가 소유? | 컴포넌트 자신 | 부모 컴포넌트 |
| 목적 | 컴포넌트 내부 데이터 관리 | 부모→자식 데이터 전달 |

## 다음 단계

다음 장에서는 렌더링과 리렌더링에 대해 알아보겠습니다.
