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
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  // setCount가 호출되면 리렌더링됩니다
  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      {count}
    </button>
  );
};

export default Counter;
```

### 2. Props가 변경될 때

```tsx
import { useState } from 'react';

const Child = ({ name }) => {
  // name prop이 변경되면 리렌더링됩니다
  return <div>{name}</div>;
};

const Parent = () => {
  const [name, setName] = useState('강북');

  return <Child name={name} />;
};

export default Parent;
```

### 3. 부모 컴포넌트가 리렌더링될 때

```tsx
import { useState } from 'react';

const Child = () => <div>자식 컴포넌트</div>;

const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
      <Child /> {/* Parent가 리렌더링되면 Child도 리렌더링 */}
    </div>
  );
};

export default Parent;
```

## 🎯 렌더링 과정 예시

```tsx
import { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);

  console.log('렌더링!'); // state 변경 시마다 출력됨

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>증가</button>
    </div>
  );
};

export default App;
```

**흐름:**
1. 버튼 클릭
2. `setCount` 호출
3. React가 `App` 컴포넌트 재실행
4. 새로운 JSX 반환
5. Virtual DOM 비교
6. 변경된 부분만 실제 DOM에 반영


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
import { useEffect, useState } from 'react';

const Component = () => {
  console.log('렌더링 단계'); // 매번 실행

  useEffect(() => {
    console.log('커밋 후 실행'); // DOM 업데이트 후 실행
  });

  return <div>컴포넌트</div>;
};

export default Component;
```

## 💡 Batch 업데이트

React는 여러 state 업데이트를 **하나로 묶어서(batch)** 처리합니다:

```tsx
import { useState } from 'react';

const BatchExample = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    setCount(prev => prev + 1);
    setName('새 이름');
    setFlag(true);

    // React는 이 세 개의 업데이트를 하나로 묶어서
    // 리렌더링을 한 번만 수행합니다
  };

  return <button onClick={handleClick}>클릭</button>;
};

export default BatchExample;
```

## 🎨 기본 최적화 팁

### 1. State를 최소화

```tsx
import { useState } from 'react';

const Example = () => {
  // ❌ 나쁜 예
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(''); // 불필요!

  // ✅ 좋은 예
  const [firstName2, setFirstName2] = useState('');
  const [lastName2, setLastName2] = useState('');
  const fullName2 = `${firstName2} ${lastName2}`; // 계산된 값

  return <div>{fullName2}</div>;
};

export default Example;
```

### 2. State를 적절한 위치에

```tsx
import { useState } from 'react';

// ❌ 전역 state (모든 컴포넌트 리렌더링)
const BadApp = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <Header />
      <Main />
      <Modal isOpen={modalOpen} />
    </div>
  );
};

// ✅ 필요한 곳에만 state 배치
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  // ...
  return <div>{isOpen ? '열림' : '닫힘'}</div>;
};

export default Modal;
```

## 🐛 렌더링 디버깅

### 렌더링 횟수 확인

```tsx
import { useRef, useEffect } from 'react';

const Component = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`렌더링 횟수: ${renderCount.current}`);
  });

  return <div>컴포넌트</div>;
};

export default Component;
```

### React DevTools 사용

1. Chrome React DevTools 설치
2. Profiler 탭에서 렌더링 성능 측정
3. Highlight updates 옵션으로 리렌더링 확인

## 📚 정리

1. **렌더링**: 컴포넌트를 호출해서 Virtual DOM 생성
2. **커밋**: 변경된 부분을 실제 DOM에 반영
3. **리렌더링 발생 시점**: State 변경, Props 변경, 부모 리렌더링
4. **Batch 업데이트**: 여러 state 업데이트를 하나로 묶어서 처리
5. **기본 최적화**: State 최소화, 적절한 위치에 배치

## 다음 단계

- 다음 장: [useEffect](/docs/react-hooks/useeffect)
- 고급 최적화: [렌더링 최적화](/docs/react-basics/rendering-optimization) (React.memo, useMemo, useCallback)
