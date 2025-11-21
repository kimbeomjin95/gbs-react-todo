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

### 1. useForm (폼 상태 관리) ⭐ 가장 자주 사용

폼은 웹 애플리케이션에서 가장 흔하게 사용되는 기능입니다. `useForm`을 만들면 **모든 폼에서 반복되는 코드를 재사용**할 수 있습니다.

#### 왜 useForm이 필요한가?

일반적으로 폼을 만들 때마다 다음 코드가 반복됩니다:

```tsx
// ❌ 매번 반복되는 코드
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 제출 로직...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleEmailChange} />
      <input value={password} onChange={handlePasswordChange} />
      <button type="submit">로그인</button>
    </form>
  );
};
```

이 패턴이 **회원가입, 프로필 수정, 게시글 작성** 등 모든 폼에서 반복됩니다!

#### 기본 useForm

```tsx title="hooks/useForm.ts"
import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';

const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [form, setForm] = useState<T>(initialValues);

  // 입력값 변경 핸들러
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // 폼 제출 핸들러 (콜백 함수를 받아서 실행)
  const handleSubmit = useCallback((onSubmit: (form: T) => void) => {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(form);
    };
  }, [form]);

  // 폼 초기화
  const reset = useCallback(() => {
    setForm(initialValues);
  }, [initialValues]);

  return {
    form,
    handleChange,
    handleSubmit,
    reset,
  };
};

export default useForm;
```

#### 사용 예시 - 로그인 폼

```tsx title="LoginForm.tsx"
import useForm from './hooks/useForm';

const LoginForm = () => {
  // 초기값 설정
  const { form, handleChange, handleSubmit, reset } = useForm({
    email: '',
    password: '',
  });

  // 제출 로직만 정의하면 됨!
  const onSubmit = (formData: typeof form) => {
    console.log('로그인 시도:', formData);
    // API 호출 등...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>
      <button type="submit">로그인</button>
      <button type="button" onClick={reset}>초기화</button>
    </form>
  );
};

export default LoginForm;
```

#### 사용 예시 - 회원가입 폼

**같은 useForm을 다른 폼에서도 재사용!**

```tsx title="SignupForm.tsx"
import useForm from './hooks/useForm';

const SignupForm = () => {
  const { form, handleChange, handleSubmit } = useForm({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
  });

  const onSubmit = (formData: typeof form) => {
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    console.log('회원가입:', formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="이름" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="이메일" />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="비밀번호" />
      <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 확인" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="전화번호" />
      <button type="submit">가입하기</button>
    </form>
  );
};

export default SignupForm;
```

**useForm의 장점:**
- ✅ **코드 재사용**: 모든 폼에서 같은 Hook 사용
- ✅ **핸들러 재정의 불필요**: `handleChange`, `handleSubmit`을 매번 만들 필요 없음
- ✅ **일관된 패턴**: 팀원 모두 같은 방식으로 폼 작성
- ✅ **테스트 용이**: Hook만 독립적으로 테스트 가능

### 2. useToggle (토글 상태)

모달, 사이드바, 드롭다운 등 **열기/닫기** 패턴에 매우 자주 사용됩니다.

```tsx title="hooks/useToggle.ts"
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

export default useToggle;
```

**사용 예시:**

```tsx title="Modal.tsx"
import useToggle from './hooks/useToggle';

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

### 3. useLocalStorage (로컬 스토리지)

사용자 설정, 테마, 언어 등을 **브라우저에 저장**할 때 사용합니다.

```tsx title="hooks/useLocalStorage.ts"
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

export default useLocalStorage;
```

**사용 예시:**

```tsx title="Settings.tsx"
import useLocalStorage from './hooks/useLocalStorage';

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

### 4. useFetch (데이터 가져오기)

API 호출 시 **로딩, 에러, 데이터 상태**를 한 번에 관리합니다.

```tsx title="hooks/useFetch.ts"
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

export default useFetch;
```

**사용 예시:**

```tsx title="UserProfile.tsx"
import useFetch from './hooks/useFetch';

const UserProfile = ({ userId }: { userId: string }) => {
  const { data, loading, error } = useFetch<{ name: string }>(`/api/users/${userId}`);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}

export default UserProfile;
```

### 5. useDebounce (디바운스)

검색 입력 등에서 **타이핑이 끝난 후** API를 호출할 때 사용합니다. 불필요한 API 호출을 줄여줍니다.

```tsx title="hooks/useDebounce.ts"
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

export default useDebounce;
```

**사용 예시:**

```tsx title="SearchInput.tsx"
import { useState, useEffect } from 'react';
import useDebounce from './hooks/useDebounce';

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);  // 500ms 후 반영

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 타이핑이 멈춘 후 500ms 뒤에 API 호출
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
