# Custom Hooks

Custom Hook을 만들어 로직을 재사용하는 방법을 알아봅니다.

## 🎯 Custom Hook이란?

**Custom Hook**은 React의 기본 Hook들을 조합하여 **재사용 가능한 로직**을 만드는 방법입니다.

### 기본 개념

```tsx
import { useState, useEffect } from 'react';

// Custom Hook = Hook들을 조합한 함수
const useCustomLogic = () => {
  const [state, setState] = useState(initialValue);
  useEffect(() => {
    // 로직...
  }, []);

  return [state, setState];
}
```

## 📏 Custom Hook 작성 규칙

### 1. 이름은 `use`로 시작

```tsx
// ✅ 올바른 이름
const useCounter = () => { ... }
const useFetch = () => { ... }
const useLocalStorage = () => { ... }

// ❌ 잘못된 이름
const counter = () => { ... }       // use 없음
const getCounter = () => { ... }    // use 없음
const Counter = () => { ... }       // 컴포넌트처럼 보임
```

**왜 `use`로 시작해야 하나?**
- React가 Hook 규칙을 자동으로 체크
- ESLint가 Hook 규칙 위반을 감지
- 다른 개발자가 Hook임을 바로 알 수 있음

### 2. 최상위 레벨에서만 Hook 호출

```tsx
// ✅ 올바른 사용
const useCustom = () => {
  const [value, setValue] = useState(0);  // 최상위
  useEffect(() => { ... }, []);           // 최상위
  return value;
}

// ❌ 잘못된 사용
const useCustom = () => {
  if (condition) {
    const [value, setValue] = useState(0);  // 조건문 안
  }

  const handleClick = () => {
    useEffect(() => { ... }, []);  // 함수 안
  }
}
```

### 3. React 컴포넌트나 다른 Hook에서만 호출

```tsx
// ✅ 컴포넌트에서 사용
const Component = () => {
  const data = useCustomHook();
  return <div>{data}</div>;
}

// ✅ 다른 Custom Hook에서 사용
const useComposed = () => {
  const data = useCustomHook();
  return data;
}

// ❌ 일반 함수에서 사용
const normalFunction = () => {
  const data = useCustomHook();  // 에러!
  return data;
}
```

## 💡 실전 Custom Hooks

### 1. useToggle (토글 상태)

```tsx
import { useState, useCallback } from 'react';

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, toggle, setTrue, setFalse };
}

// 사용
const Modal = () => {
  const modal = useToggle();

  return (
    <div>
      <button onClick={modal.setTrue}>열기</button>
      {modal.value && (
        <div className="modal">
          <p>모달 내용</p>
          <button onClick={modal.setFalse}>닫기</button>
        </div>
      )}
    </div>
  );
}

export default Modal;
```

### 2. useLocalStorage (로컬 스토리지)

```tsx
import { useState, useEffect } from 'react';

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  // 초기값 로드
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 값 변경 시 로컬 스토리지 업데이트
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// 사용
const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('lang', 'ko');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">라이트</option>
        <option value="dark">다크</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export default Settings;
```

### 3. useFetch (데이터 가져오기)

```tsx
import { useState, useEffect } from 'react';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const useFetch = <T,>(url: string) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();

        if (!isCancelled) {
          setState({ data: json, loading: false, error: null });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return state;
}

// 사용
const UserProfile = ({ userId }) => {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}

export default UserProfile;
```

### 4. useDebounce (디바운스)

```tsx
import { useState, useEffect } from 'react';

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 사용
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // API 호출
      console.log('검색:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="검색..."
    />
  );
}

export default SearchInput;
```

### 5. usePrevious (이전 값 기억)

```tsx
import { useState, useRef, useEffect } from 'react';

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 사용
const Counter = () => {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>현재: {count}</p>
      <p>이전: {prevCount}</p>
      <button onClick={() => setCount(prev => prev + 1)}>증가</button>
    </div>
  );
}

export default Counter;
```

### 6. useInterval (인터벌)

```tsx
import { useState, useRef, useEffect } from 'react';

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // 콜백 최신 상태 유지
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 인터벌 설정
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// 사용
const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => setSeconds(prev => prev + 1),
    isRunning ? 1000 : null
  );

  return (
    <div>
      <p>{seconds}초</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '일시정지' : '시작'}
      </button>
    </div>
  );
}

export default Timer;
```

### 7. useWindowSize (윈도우 크기)

```tsx
import { useState, useEffect } from 'react';

type WindowSize = {
  width: number;
  height: number;
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// 사용
const ResponsiveComponent = () => {
  const { width } = useWindowSize();

  return (
    <div>
      {width < 768 ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}

export default ResponsiveComponent;
```

### 8. useOnClickOutside (외부 클릭 감지)

```tsx
import { useState, useRef, useEffect } from 'react';

const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // ref 요소 내부 클릭 시 무시
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 사용
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>메뉴</button>
      {isOpen && (
        <div className="dropdown">
          <a href="#">항목 1</a>
          <a href="#">항목 2</a>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
```

## 🎨 Custom Hook 조합

여러 Custom Hook을 조합하여 더 강력한 Hook 만들기:

```tsx
import { useState } from 'react';

// 여러 Hook 조합
const useSearchWithDebounce = (initialValue = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data, loading, error } = useFetch(
    `/api/search?q=${debouncedSearchTerm}`
  );

  return {
    searchTerm,
    setSearchTerm,
    results: data,
    loading,
    error,
  };
}

// 사용
const SearchPage = () => {
  const { searchTerm, setSearchTerm, results, loading } = useSearchWithDebounce();

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <div>검색 중...</div>}
      {results && <SearchResults data={results} />}
    </div>
  );
}

export default SearchPage;
```

## 💡 Custom Hook 작성 팁

### 1. 단일 책임 원칙

```tsx
import { useState } from 'react';

// ❌ 너무 많은 일을 하는 Hook
const useTodoManager = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  // ... 너무 많은 기능
}

// ✅ 각각의 역할로 분리
const useTodos = () => { /* ... */ }
const useFilter = () => { /* ... */ }
const useTheme = () => { /* ... */ }
const useAuth = () => { /* ... */ }
```

### 2. 명확한 반환값

```tsx
import { useState } from 'react';

// ✅ 배열 반환 (useState 스타일)
const useCounter = () => {
  const [count, setCount] = useState(0);
  return [count, setCount] as const;
}

const Component1 = () => {
  const [count, setCount] = useCounter();
  return <div>{count}</div>;
}

// ✅ 객체 반환 (명확한 이름)
const useCounterWithMethods = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return { count, increment, decrement };
}

const Component2 = () => {
  const { count, increment, decrement } = useCounterWithMethods();
  return <div>{count}</div>;
}

export default Component2;
```

### 3. TypeScript 활용

```tsx
import { useState, useCallback } from 'react';

type UseCounterReturn = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounter = (initialValue = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

### 4. 에러 처리

```tsx
import { useState, useCallback } from 'react';

const useSafeLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('로컬 스토리지 읽기 실패:', error);
      return initialValue;
    }
  });

  const setSafeValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('로컬 스토리지 쓰기 실패:', error);
    }
  }, [key]);

  return [value, setSafeValue] as const;
}
```

## 📚 정리

### Custom Hook을 만들어야 하는 경우

✅ **이런 경우에 만드세요:**
- 같은 로직이 여러 컴포넌트에서 반복됨
- 복잡한 상태 로직을 분리하고 싶을 때
- 테스트하기 쉽게 만들고 싶을 때

❌ **만들지 않아도 되는 경우:**
- 한 곳에서만 사용하는 로직
- 너무 간단한 로직 (useState 하나만 있는 경우 등)

### 핵심 원칙

1. **이름은 `use`로 시작**
2. **Hook 규칙 준수** (최상위, 조건문 금지)
3. **단일 책임 원칙**
4. **명확한 인터페이스** (입력/출력)
5. **재사용 가능하게**

## 다음 단계

다음 장에서는 실전 프로젝트에서 Custom Hook을 어떻게 활용하는지 알아보겠습니다!
