# useRef Hook

useRef는 렌더링에 필요하지 않은 값을 참조할 수 있게 해주는 Hook입니다.

## 🎯 useRef란?

`useRef`는 두 가지 주요 용도로 사용됩니다:

1. **DOM 요소에 직접 접근**
2. **렌더링과 무관한 값 저장**

## 📝 기본 사용법

```tsx
import { useRef } from 'react';

const MyComponent = () => {
  const ref = useRef(initialValue);

  return <div>컴포넌트</div>;
}
```

### 구조

```tsx
const ref = useRef(초기값);

// ref.current로 값에 접근
ref.current = 새로운값;
```

## 🎨 DOM 요소 접근

### input 요소에 포커스 주기

```tsx
import { useRef } from 'react';

const FocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // DOM 요소에 직접 접근
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>포커스</button>
    </div>
  );
}
```

### 스크롤 위치로 이동

```tsx
const ScrollExample = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <button onClick={scrollToSection}>섹션으로 이동</button>
      <div style={{ height: '100vh' }}>스크롤...</div>
      <div ref={sectionRef}>목표 섹션</div>
    </div>
  );
}
```

## 💾 값 저장하기

### useState vs useRef

**useState:**
- 값이 변경되면 **리렌더링 발생**
- 화면에 보여지는 데이터에 사용

**useRef:**
- 값이 변경되어도 **리렌더링 없음**
- 화면과 무관한 데이터에 사용

### 이전 값 기억하기

```tsx
const PreviousValue = () => {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);

  const handleClick = () => {
    // 이전 값을 ref에 저장
    prevCountRef.current = count;
    setCount(count + 1);
  };

  return (
    <div>
      <p>현재 값: {count}</p>
      <p>이전 값: {prevCountRef.current}</p>
      <button onClick={handleClick}>증가</button>
    </div>
  );
}
```

### 렌더링 횟수 세기

```tsx
const RenderCounter = () => {
  const renderCount = useRef(0);

  // 렌더링될 때마다 증가 (리렌더링 발생 안 함!)
  renderCount.current += 1;

  return <div>렌더링 횟수: {renderCount.current}</div>;
}
```

## ⏱️ 타이머 관리

### setInterval ID 저장

```tsx
const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current) return; // 이미 실행 중이면 무시

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  return (
    <div>
      <p>시간: {seconds}초</p>
      <button onClick={start} disabled={isRunning}>시작</button>
      <button onClick={stop} disabled={!isRunning}>정지</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
}
```

## 🎬 비디오/오디오 제어

```tsx
const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    videoRef.current?.play();
  };

  const pause = () => {
    videoRef.current?.pause();
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div>
      <video ref={videoRef} src="/video.mp4" />
      <button onClick={play}>재생</button>
      <button onClick={pause}>일시정지</button>
      <button onClick={restart}>처음부터</button>
    </div>
  );
}
```

## ⚠️ 주의사항

### 1. 렌더링 중에 ref.current 읽기/쓰기 금지

```tsx
// ❌ 잘못된 예
const BadExample = () => {
  const ref = useRef(0);
  ref.current += 1; // 렌더링 중 변경 - 예측 불가능!

  return <div>{ref.current}</div>;
}

// ✅ 올바른 예
const GoodExample = () => {
  const ref = useRef(0);

  const handleClick = () => {
    ref.current += 1; // 이벤트 핸들러에서 변경
    console.log(ref.current);
  };

  return <button onClick={handleClick}>클릭</button>;
}
```

### 2. ref.current 변경으로 리렌더링 트리거 불가

```tsx
const Counter = () => {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1;
    // 화면이 업데이트되지 않음!
  };

  return (
    <div>
      <p>{countRef.current}</p> {/* 항상 0 */}
      <button onClick={increment}>증가</button>
    </div>
  );
}
```

화면에 표시해야 한다면 **useState**를 사용하세요!

### 3. null 체크

TypeScript에서 DOM ref는 초기값이 `null`입니다:

```tsx
const inputRef = useRef<HTMLInputElement>(null);

// ✅ 안전한 접근
inputRef.current?.focus();

// ❌ 에러 가능성
inputRef.current.focus(); // current가 null일 수 있음
```

## 💡 실전 패턴

### 커스텀 Hook과 함께 사용

```tsx
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 사용
const Component = () => {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>현재: {count}</p>
      <p>이전: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

### 외부 라이브러리 인스턴스 저장

```tsx
import SomeLibrary from 'some-library';

const LibraryComponent = () => {
  const instanceRef = useRef<SomeLibrary | null>(null);

  useEffect(() => {
    // 라이브러리 인스턴스 생성
    instanceRef.current = new SomeLibrary();

    return () => {
      // 정리
      instanceRef.current?.destroy();
    };
  }, []);

  const doSomething = () => {
    instanceRef.current?.method();
  };

  return <button onClick={doSomething}>실행</button>;
}
```

## 🔍 useState vs useRef 비교

| 특징 | useState | useRef |
|------|----------|--------|
| 리렌더링 | 값 변경 시 O | 값 변경 시 X |
| 용도 | UI에 표시되는 데이터 | UI와 무관한 데이터 |
| 값 접근 | `state` 직접 | `ref.current` |
| 초기화 | `useState(초기값)` | `useRef(초기값)` |
| 업데이트 | `setState(새값)` | `ref.current = 새값` |

## 📚 정리

- **DOM 접근**: `ref={myRef}`로 DOM 요소 참조
- **값 저장**: 렌더링과 무관한 값 저장 (리렌더링 없음)
- **타이머/인스턴스**: setInterval ID, 라이브러리 인스턴스 등
- **주의**: 렌더링 중 ref.current 변경 금지

## 다음 단계

다음 장에서는 [useMemo Hook](/docs/react-hooks/usememo)에 대해 알아보겠습니다.
