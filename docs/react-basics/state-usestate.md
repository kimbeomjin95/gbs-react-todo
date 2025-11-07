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
};

export default Counter;
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

// ✅ 이전 값을 사용하는 올바른 방법 (함수형 업데이트)
setCount(prevCount => prevCount + 1);

// ⚠️ 여러 번 업데이트 시 문제가 될 수 있음
setCount(count + 1);
```

#### 왜 함수형 업데이트를 사용해야 하나?

**문제 상황: 여러 번 업데이트할 때**

```tsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 세 번 호출했으니 +3이 될 것 같지만...
    setCount(count + 1);  // 0 + 1 = 1
    setCount(count + 1);  // 0 + 1 = 1 (여전히 0을 참조!)
    setCount(count + 1);  // 0 + 1 = 1 (여전히 0을 참조!)
    // 결과: count는 1만 증가 ❌
  };

  return <button onClick={handleClick}>클릭: {count}</button>;
};

export default Counter;
```

**이유: State 업데이트는 비동기적**

React는 성능 최적화를 위해 여러 state 업데이트를 **배치(batch)**로 처리합니다:

```tsx
// handleClick 실행 시점에 count = 0
setCount(count + 1);  // setCount(0 + 1) - "1로 업데이트해줘"
setCount(count + 1);  // setCount(0 + 1) - "1로 업데이트해줘" (count는 아직 0)
setCount(count + 1);  // setCount(0 + 1) - "1로 업데이트해줘" (count는 아직 0)

// React: "1로 업데이트 요청이 3번 왔네? → 1로 설정!"
// 결과: count = 1
```

**해결: 함수형 업데이트 사용**

```tsx
const Counter = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 함수형 업데이트: 최신 state 값을 보장받음
    setCount(prev => prev + 1);  // prev = 0, 반환 = 1
    setCount(prev => prev + 1);  // prev = 1, 반환 = 2
    setCount(prev => prev + 1);  // prev = 2, 반환 = 3
    // 결과: count는 3 증가 ✅
  };

  return <button onClick={handleClick}>클릭: {count}</button>;
};

export default Counter;
```

**동작 원리:**

```tsx
// 함수형 업데이트는 이전 업데이트의 결과를 받습니다
setCount(prev => prev + 1);  // React: "현재 값(0)에 +1 해서 1을 반환"
setCount(prev => prev + 1);  // React: "이전 결과(1)에 +1 해서 2를 반환"
setCount(prev => prev + 1);  // React: "이전 결과(2)에 +1 해서 3을 반환"

// React: "최종 결과는 3!"
// 결과: count = 3
```

#### 실전 예제: 타이머

```tsx
import { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ 잘못된 방법: 클로저로 인해 항상 초기값(0) 참조
      // setSeconds(seconds + 1);  // 계속 1로만 설정됨

      // ✅ 올바른 방법: 항상 최신 값 사용
      setSeconds(prev => prev + 1);  // 1, 2, 3, 4...
    }, 1000);

    return () => clearInterval(interval);
  }, []);  // 의존성 배열이 비어있어도 함수형 업데이트는 동작

  return <div>{seconds}초</div>;
};

export default Timer;
```

#### 핵심 정리

**언제 함수형 업데이트를 사용해야 하나?**

1. ✅ **이전 state 값 기반으로 업데이트할 때**
   ```tsx
   setCount(prev => prev + 1);
   ```

2. ✅ **한 함수에서 여러 번 업데이트할 때**
   ```tsx
   const handleClick = () => {
     setCount(prev => prev + 1);
     setCount(prev => prev + 1);
   };
   ```

3. ✅ **useEffect, setTimeout, setInterval 내부에서 업데이트할 때**
   ```tsx
   useEffect(() => {
     setInterval(() => {
       setCount(prev => prev + 1);  // 클로저 문제 해결
     }, 1000);
   }, []);  // 의존성 배열에 count 불필요
   ```

**단순 설정은 직접 값 사용 가능:**
```tsx
// 이전 값과 무관하게 특정 값으로 설정
setCount(0);  // 리셋
setCount(100);  // 특정 값으로 설정
setIsOpen(true);  // boolean 토글이 아닌 명시적 설정
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
import { useState } from 'react';

const ArrayOperations = () => {
  const [items, setItems] = useState([1, 2, 3]);

  // 추가
  const addItem = () => setItems([...items, 4]);

  // 삭제
  const removeItem = () => setItems(items.filter(item => item !== 2));

  // 수정
  const updateItem = () => setItems(items.map(item => item === 2 ? 20 : item));

  return (
    <div>
      <button onClick={addItem}>추가</button>
      <button onClick={removeItem}>삭제</button>
      <button onClick={updateItem}>수정</button>
    </div>
  );
};

export default ArrayOperations;
```

## 🔒 불변성 (Immutability)

React에서 state를 업데이트할 때 **불변성을 유지**하는 것은 매우 중요합니다.

### 불변성이란?

기존 값을 직접 수정하지 않고, **새로운 값을 만들어서** 교체하는 것입니다.

```tsx
// ❌ 가변적 (Mutable) - 기존 객체 직접 수정
const user = { name: '김철수', age: 25 };
user.age = 26; // 원본이 변경됨

// ✅ 불변적 (Immutable) - 새 객체 생성
const user = { name: '김철수', age: 25 };
const newUser = { ...user, age: 26 }; // 새 객체 생성
```

### 왜 불변성이 중요한가?

**1. React의 변경 감지 방식**

React는 **얕은 비교(Shallow Comparison)**로 변경을 감지합니다:

```tsx
// React는 이렇게 비교합니다
prevState === newState  // 참조 비교

// 객체 내부를 일일이 확인하지 않음
prevState.name === newState.name &&
prevState.age === newState.age  // 이렇게 하지 않음
```

**잘못된 예 (리렌더링 안 됨):**
```tsx
import { useState } from 'react';

const BadExample = () => {
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  const updateAge = () => {
    user.age = 26;  // 객체 직접 수정
    setUser(user);  // 같은 참조를 전달
    // user === user → true
    // React: "변경 없음" → 리렌더링 안 함!
  };

  return <button onClick={updateAge}>나이 변경</button>;
};

export default BadExample;
```

**올바른 예 (리렌더링 됨):**
```tsx
import { useState } from 'react';

const GoodExample = () => {
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  const updateAge = () => {
    const newUser = { ...user, age: 26 };  // 새 객체 생성
    setUser(newUser);  // 다른 참조를 전달
    // user !== newUser → false
    // React: "변경됨!" → 리렌더링 실행
  };

  return <button onClick={updateAge}>나이 변경</button>;
};

export default GoodExample;
```

**2. 이전 상태 보존**

불변성을 유지하면 이전 상태가 보존됩니다:

```tsx
import { useState } from 'react';

const HistoryExample = () => {
  const [history, setHistory] = useState([{ step: 1, value: 'A' }]);

  // ❌ 가변적 업데이트
  const addStepBad = () => {
    history.push({ step: 2, value: 'B' });
    setHistory(history);
    // 이전 history도 변경됨! (같은 배열 참조)
  };

  // ✅ 불변적 업데이트
  const addStepGood = () => {
    setHistory([...history, { step: 2, value: 'B' }]);
    // 이전 history는 그대로! (새 배열 생성)
  };

  return <button onClick={addStepGood}>단계 추가</button>;
};

export default HistoryExample;
```

### 불변성 유지 방법

**객체 업데이트:**
```tsx
// Spread 연산자
const newUser = { ...user, age: 26 };

// 여러 속성 변경
const newUser = { ...user, age: 26, city: '서울' };

// 중첩 객체
const newUser = {
  ...user,
  address: {
    ...user.address,
    city: '서울'
  }
};
```

**배열 업데이트:**
```tsx
const [items, setItems] = useState([1, 2, 3]);

// 추가
setItems([...items, 4]);
setItems([0, ...items]);  // 앞에 추가

// 삭제
setItems(items.filter(item => item !== 2));

// 수정
setItems(items.map(item => item === 2 ? 20 : item));

// 특정 인덱스 수정
setItems(items.map((item, i) => i === 1 ? 20 : item));
```

**중첩 배열:**
```tsx
import { useState } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'A', completed: false },
    { id: 2, text: 'B', completed: false }
  ]);

  // 특정 항목 수정
  const toggleTodo = () => {
    setTodos(todos.map(todo =>
      todo.id === 1
        ? { ...todo, completed: true }
        : todo
    ));
  };

  return <button onClick={toggleTodo}>Todo 토글</button>;
};

export default TodoList;
```

### 불변성 헬퍼 라이브러리

복잡한 중첩 구조는 라이브러리 사용을 고려:

**Immer:**
```tsx
import { useState } from 'react';
import { produce } from 'immer';

const ImmerExample = () => {
  const [user, setUser] = useState({
    name: '김철수',
    address: { city: '서울', district: '강남' }
  });

  // Immer 없이
  const updateWithoutImmer = () => {
    setUser({
      ...user,
      address: {
        ...user.address,
        district: '강북'
      }
    });
  };

  // Immer 사용
  const updateWithImmer = () => {
    setUser(produce(draft => {
      draft.address.district = '강북';  // 직접 수정처럼 보이지만 불변성 유지
    }));
  };

  return (
    <div>
      <button onClick={updateWithoutImmer}>일반 업데이트</button>
      <button onClick={updateWithImmer}>Immer 업데이트</button>
    </div>
  );
};

export default ImmerExample;
```

### 핵심 정리

1. **state는 읽기 전용**처럼 다루기
2. **항상 새로운 객체/배열** 생성하기
3. **Spread 연산자** 적극 활용
4. 복잡한 구조는 **Immer** 같은 라이브러리 고려

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
};

export default LoginForm;
```

## 🎨 실전 예제

### 토글 버튼

```tsx
const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <button onClick={() => setIsOn(prev => !prev)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
};

export default ToggleButton;
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
};

export default NameForm;
```

### 카운터

```tsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>리셋</button>
    </div>
  );
};

export default Counter;
```

## 🔍 State vs Props

| | State | Props |
|---|---|---|
| 변경 가능? | ✅ Yes (setState로) | ❌ No (읽기 전용) |
| 누가 소유? | 컴포넌트 자신 | 부모 컴포넌트 |
| 목적 | 컴포넌트 내부 데이터 관리 | 부모→자식 데이터 전달 |

## 다음 단계

다음 장에서는 렌더링과 리렌더링에 대해 알아보겠습니다.
