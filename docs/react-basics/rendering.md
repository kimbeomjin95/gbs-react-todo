# 렌더링과 리렌더링

React가 화면을 어떻게 업데이트하는지 이해하는 것은 성능 최적화에 중요합니다.

## 🎨 렌더링이란?

렌더링은 React가 컴포넌트를 호출해서 화면에 무엇을 표시할지 결정하는 과정입니다.

### 렌더링 단계

1. **트리거**: 렌더링이 필요한 상황 발생
2. **렌더**: 컴포넌트 함수 호출
3. **커밋**: 실제 DOM에 변경사항 반영

## 🔄 리렌더링이 발생하는 경우

### 1. State가 변경될 때

```tsx
const Counter = () => {
  const [count, setCount] = useState(0);

  // setCount가 호출되면 리렌더링됩니다
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### 2. Props가 변경될 때

```tsx
const Child = ({ name }) => {
  // name prop이 변경되면 리렌더링됩니다
  return <div>{name}</div>;
}

const Parent = () => {
  const [name, setName] = useState('강북');

  return <Child name={name} />;
}
```

### 3. 부모 컴포넌트가 리렌더링될 때

```tsx
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child /> {/* Parent가 리렌더링되면 Child도 리렌더링 */}
    </div>
  );
}
```

## 🎯 렌더링 과정 예시

```tsx
const App = () => {
  const [count, setCount] = useState(0);

  console.log('렌더링!'); // state 변경 시마다 출력됨

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

**흐름:**
1. 버튼 클릭
2. `setCount` 호출
3. React가 `App` 컴포넌트 재실행
4. 새로운 JSX 반환
5. Virtual DOM 비교
6. 변경된 부분만 실제 DOM에 반영

## ⚡ 불필요한 리렌더링 방지

### 문제 상황

```tsx
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveChild /> {/* count와 무관하지만 매번 리렌더링 */}
    </div>
  );
}
```

### 해결 방법 1: React.memo

```tsx
import { memo } from 'react';

const ExpensiveChild = memo(() => {
  console.log('ExpensiveChild 렌더링');
  return <div>무거운 컴포넌트</div>;
});
```

### 해결 방법 2: children prop 활용

```tsx
const Parent = ({ children }) => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      {children} {/* children은 리렌더링되지 않음 */}
    </div>
  );
}

// 사용
<Parent>
  <ExpensiveChild />
</Parent>
```

## 🔍 렌더링 vs 커밋

### 렌더링

- 컴포넌트 함수를 호출하는 과정
- Virtual DOM에서 발생
- 빠름

### 커밋

- 실제 DOM을 업데이트하는 과정
- 브라우저에서 발생
- 상대적으로 느림

```tsx
const Component = () => {
  console.log('렌더링 단계'); // 매번 실행

  useEffect(() => {
    console.log('커밋 후 실행'); // DOM 업데이트 후 실행
  });

  return <div>컴포넌트</div>;
}
```

## 💡 Batch 업데이트

React는 여러 state 업데이트를 **하나로 묶어서(batch)** 처리합니다:

```tsx
const handleClick = () => {
  setCount(count + 1);
  setName('새 이름');
  setFlag(true);

  // React는 이 세 개의 업데이트를 하나로 묶어서
  // 리렌더링을 한 번만 수행합니다
}
```

## 🎨 렌더링 최적화 팁

### 1. State를 최소화

```tsx
// ❌ 나쁜 예
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // 불필요!

// ✅ 좋은 예
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`; // 계산된 값
```

### 2. State를 적절한 위치에

```tsx
// ❌ 전역 state (모든 컴포넌트 리렌더링)
const App = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <Header />
      <Main />
      <Modal isOpen={modalOpen} />
    </div>
  );
}

// ✅ 필요한 곳에만 state 배치
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

### 3. 객체 참조 유지

```tsx
const Parent = () => {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 새 객체 생성
  const config = { theme: 'dark' };

  // ✅ 참조 유지
  const config = useMemo(() => ({ theme: 'dark' }), []);

  return <Child config={config} />;
}
```

## 🐛 렌더링 디버깅

### 렌더링 횟수 확인

```tsx
const Component = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`렌더링 횟수: ${renderCount.current}`);
  });

  return <div>컴포넌트</div>;
}
```

### React DevTools 사용

1. Chrome React DevTools 설치
2. Profiler 탭에서 렌더링 성능 측정
3. Highlight updates 옵션으로 리렌더링 확인

## 다음 단계

다음 장에서는 useEffect Hook에 대해 알아보겠습니다.
