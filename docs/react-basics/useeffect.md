# useEffect Hook

useEffect는 컴포넌트에서 **사이드 이펙트**(부수 효과)를 처리할 때 사용하는 Hook입니다.

## 🎯 사이드 이펙트란?

렌더링 외에 발생하는 작업들을 의미합니다:

- API 호출
- 타이머 설정
- DOM 직접 조작
- 로그 기록
- 구독(subscription) 설정

## 📝 기본 사용법

```tsx
import { useEffect } from 'react';

function Component() {
  useEffect(() => {
    // 사이드 이펙트 코드
    console.log('컴포넌트가 렌더링됨');
  });

  return <div>컴포넌트</div>;
}
```

## 🔄 의존성 배열

### 의존성 배열 없음

매 렌더링마다 실행됩니다:

```tsx
useEffect(() => {
  console.log('매 렌더링마다 실행');
});
```

### 빈 의존성 배열

컴포넌트가 마운트될 때 한 번만 실행됩니다:

```tsx
useEffect(() => {
  console.log('마운트 시 한 번만 실행');
}, []);
```

### 특정 값이 변경될 때

```tsx
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('count가 변경됨:', count);
}, [count]); // count가 변경될 때만 실행
```

## 🧹 정리(Cleanup) 함수

useEffect는 정리 함수를 반환할 수 있습니다:

```tsx
useEffect(() => {
  // 구독 시작
  const subscription = subscribe();

  // 정리 함수 (컴포넌트 언마운트 시 실행)
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 정리 함수가 실행되는 시점

1. 컴포넌트 언마운트 시
2. 다음 effect 실행 전

```tsx
useEffect(() => {
  console.log('Effect 실행');

  return () => {
    console.log('정리 함수 실행');
  };
}, [dependency]);
```

## 💡 실전 예제

### API 데이터 가져오기

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]); // userId가 변경될 때마다 다시 가져오기

  if (loading) return <div>로딩 중...</div>;
  return <div>{user.name}</div>;
}
```

### 타이머 설정

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // 정리: 컴포넌트 언마운트 시 타이머 제거
    return () => clearInterval(interval);
  }, []);

  return <div>{seconds}초</div>;
}
```

### Document Title 변경

```tsx
function Page({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <div>{title} 페이지</div>;
}
```

### 로컬 스토리지 동기화

```tsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 사용
function App() {
  const [name, setName] = useLocalStorage('name', '');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

## ⚠️ 주의사항

### 1. 무한 루프 조심

```tsx
// ❌ 무한 루프!
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1); // count 변경 → effect 실행 → count 변경 → ...
}, [count]);

// ✅ 조건부 업데이트
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

### 2. 의존성 배열 정직하게 작성

```tsx
// ❌ 나쁜 예
useEffect(() => {
  console.log(count); // count 사용하지만 의존성 배열에 없음
}, []);

// ✅ 좋은 예
useEffect(() => {
  console.log(count);
}, [count]);
```

### 3. async/await 사용 시

```tsx
// ❌ useEffect 자체를 async로 만들면 안 됨
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ 내부에 async 함수 정의
useEffect(() => {
  async function loadData() {
    const data = await fetchData();
    setData(data);
  }

  loadData();
}, []);
```

## 🔍 여러 useEffect 사용

관심사를 분리하여 여러 useEffect를 사용할 수 있습니다:

```tsx
function Component() {
  // 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, []);

  // 타이머 설정
  useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그 기록
  useEffect(() => {
    log('Component rendered');
  });

  return <div>컴포넌트</div>;
}
```

## 다음 단계

다음 장에서는 지금까지 배운 내용을 활용하여 Todo 앱을 만들어보겠습니다!
