# useEffect Hook

useEffect는 컴포넌트에서 **사이드 이펙트**(부수 효과)를 처리할 때 사용하는 Hook입니다.

## 🎯 사이드 이펙트란?

렌더링 외에 발생하는 작업들을 의미합니다:

- API 호출
- 타이머 설정
- DOM 직접 조작
- 로그 기록
- 구독(subscription) 설정

## 🔄 컴포넌트 생명주기 (Lifecycle)

React 컴포넌트는 생성부터 소멸까지 여러 단계를 거칩니다.

### 생명주기의 3단계

```
1. 마운트 (Mount)
   ↓
2. 업데이트 (Update)
   ↓
3. 언마운트 (Unmount)
```

### 1. 마운트 (Mount)

컴포넌트가 처음 화면에 나타날 때:

```tsx
const Component = () => {
  console.log('1. 컴포넌트 함수 실행');

  useEffect(() => {
    console.log('2. 마운트 완료! (DOM에 추가됨)');
  }, []);

  return <div>컴포넌트</div>;
}
```

**실행 순서:**
```
1. 컴포넌트 함수 실행
2. JSX 반환
3. React가 Virtual DOM 생성
4. 실제 DOM에 추가
5. useEffect 실행 ← 마운트 완료!
```

### 2. 업데이트 (Update)

State나 Props가 변경될 때:

```tsx
const Component = () => {
  const [count, setCount] = useState(0);

  console.log('렌더링 (마운트 + 매 업데이트)');

  useEffect(() => {
    console.log('count가 변경됨:', count);
  }, [count]); // count가 변경될 때마다 실행

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

**업데이트 순서:**
```
1. State 변경 (setCount 호출)
2. 컴포넌트 함수 재실행
3. 새로운 JSX 반환
4. Virtual DOM 비교
5. 변경된 부분만 실제 DOM 업데이트
6. useEffect 실행
```

### 3. 언마운트 (Unmount)

컴포넌트가 화면에서 사라질 때:

```tsx
const Component = () => {
  useEffect(() => {
    console.log('마운트');

    return () => {
      console.log('언마운트! (정리 작업)');
    };
  }, []);

  return <div>컴포넌트</div>;
}
```

**언마운트 시점:**
- 부모 컴포넌트에서 해당 컴포넌트를 제거할 때
- 조건부 렌더링으로 컴포넌트가 사라질 때
- 페이지 이동 시

### useEffect와 생명주기의 관계

**클래스 컴포넌트 (예전 방식):**
```tsx
class OldComponent extends React.Component {
  componentDidMount() {
    // 마운트 시
  }

  componentDidUpdate() {
    // 업데이트 시
  }

  componentWillUnmount() {
    // 언마운트 시
  }
}
```

**함수형 컴포넌트 + useEffect (현대 방식):**
```tsx
const Component = () => {
  // 마운트 시 한 번만 실행
  useEffect(() => {
    console.log('마운트');

    return () => {
      console.log('언마운트');
    };
  }, []);

  // count 변경 시마다 실행 (업데이트)
  useEffect(() => {
    console.log('count 업데이트');
  }, [count]);

  // 매 렌더링마다 실행
  useEffect(() => {
    console.log('렌더링');
  });

  return <div>컴포넌트</div>;
}
```

### 실전 예제: 생명주기 활용

**타이머 관리:**
```tsx
const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 마운트: 타이머 시작
    console.log('타이머 시작');
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // 언마운트: 타이머 정리
    return () => {
      console.log('타이머 정리');
      clearInterval(interval);
    };
  }, []); // 빈 배열 = 마운트/언마운트에만 실행

  return <div>{seconds}초</div>;
}
```

**API 호출:**
```tsx
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // userId 변경 시마다 새로운 사용자 정보 가져오기
    console.log('사용자 정보 가져오는 중...');

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));

    return () => {
      console.log('이전 요청 정리');
      // 필요시 요청 취소 로직
    };
  }, [userId]); // userId가 변경될 때마다 실행

  if (!user) return <div>로딩 중...</div>;
  return <div>{user.name}</div>;
}
```

**구독 관리:**
```tsx
const ChatRoom = ({ roomId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 마운트 또는 roomId 변경: 채팅방 구독
    console.log(`${roomId} 채팅방 입장`);
    const subscription = chatAPI.subscribe(roomId, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // 언마운트 또는 다른 방으로 이동: 이전 구독 해제
    return () => {
      console.log(`${roomId} 채팅방 퇴장`);
      subscription.unsubscribe();
    };
  }, [roomId]);

  return (
    <ul>
      {messages.map(msg => <li key={msg.id}>{msg.text}</li>)}
    </ul>
  );
}
```

### 생명주기 정리

| 시점 | useEffect 패턴 | 용도 |
|-----|---------------|------|
| **마운트** | `useEffect(() => {...}, [])` | 초기 데이터 로드, 구독 시작 |
| **업데이트** | `useEffect(() => {...}, [deps])` | 특정 값 변경 시 작업 |
| **매 렌더링** | `useEffect(() => {...})` | 로그, 분석 (주의해서 사용) |
| **언마운트** | `return () => {...}` | 타이머 정리, 구독 해제 |

### 핵심 원칙

1. **마운트 시 설정, 언마운트 시 정리**
   - 타이머, 구독, 이벤트 리스너는 반드시 정리

2. **의존성 배열이 생명주기를 결정**
   - `[]`: 마운트/언마운트만
   - `[value]`: value 변경 시마다
   - 없음: 매 렌더링마다

3. **정리 함수는 선택사항**
   - 정리가 필요한 경우에만 반환

## 📝 기본 사용법

```tsx
import { useEffect } from 'react';

const Component = () => {
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
const UserProfile = ({ userId }) => {
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
const Timer = () => {
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
const Page = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <div>{title} 페이지</div>;
}
```

### 로컬 스토리지 동기화

```tsx
const useLocalStorage = (key, initialValue) => {
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
const App = () => {
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
  const loadData = async () => {
    const data = await fetchData();
    setData(data);
  }

  loadData();
}, []);
```

## 🔍 여러 useEffect 사용

관심사를 분리하여 여러 useEffect를 사용할 수 있습니다:

```tsx
const Component = () => {
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
