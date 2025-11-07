# useEffect 심화

useEffect의 고급 패턴과 실전 활용법을 알아봅니다.

:::info 사전 지식
이 문서는 [useEffect 기초](/docs/react-basics/useeffect)를 먼저 학습한 후 읽는 것을 권장합니다.
:::

## 🎯 여러 useEffect 분리하기

관심사를 분리하여 여러 useEffect를 사용하는 것이 좋습니다.

### ❌ 하나의 useEffect에 모든 로직

```tsx
import { useState, useEffect } from 'react';

const Dashboard = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 모든 로직이 섞여있음
  useEffect(() => {
    // 사용자 정보 가져오기
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);

    // 포스트 가져오기
    fetch(`/api/posts?userId=${userId}`)
      .then(res => res.json())
      .then(setPosts);

    // 알림 구독
    const subscription = notifications.subscribe(userId, setNotifications);

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return <div>...</div>;
};

export default Dashboard;
```

### ✅ 관심사별로 분리

```tsx
import { useState, useEffect } from 'react';

const Dashboard = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 1. 사용자 정보 가져오기
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  // 2. 포스트 가져오기
  useEffect(() => {
    fetch(`/api/posts?userId=${userId}`)
      .then(res => res.json())
      .then(setPosts);
  }, [userId]);

  // 3. 알림 구독
  useEffect(() => {
    const subscription = notifications.subscribe(userId, setNotifications);
    return () => subscription.unsubscribe();
  }, [userId]);

  return <div>...</div>;
};

export default Dashboard;
```

**장점:**
- 각 effect의 목적이 명확
- 디버깅이 쉬움
- 의존성 배열 관리가 단순
- 재사용 가능한 Custom Hook으로 추출하기 쉬움

## 🔄 Race Condition 처리

여러 비동기 요청이 경쟁 상태를 만드는 문제를 해결합니다.

### 문제 상황

```tsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
};
```

**문제:**
```
1. userId = 1로 요청 시작 (느림)
2. userId = 2로 변경, 요청 시작 (빠름)
3. userId = 2 응답 도착 → setUser(user2)
4. userId = 1 응답 도착 → setUser(user1) ← 잘못된 데이터!
```

### 해결 방법 1: ignore 플래그

```tsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {  // 최신 요청만 처리
          setUser(data);
        }
      });

    return () => {
      ignore = true;  // 정리 시 이전 요청 무시
    };
  }, [userId]);

  return <div>{user?.name}</div>;
};

export default UserProfile;
```

### 해결 방법 2: AbortController

```tsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, {
      signal: controller.signal  // 요청에 signal 연결
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error:', err);
        }
      });

    return () => {
      controller.abort();  // 요청 취소
    };
  }, [userId]);

  return <div>{user?.name}</div>;
};

export default UserProfile;
```

## 🎨 로컬 스토리지 동기화

Custom Hook으로 추출한 예제:

```tsx
import { useState, useEffect } from 'react';

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  // 초기값 로드
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 변경 시 저장
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
};

// 사용
const App = () => {
  const [name, setName] = useLocalStorage('name', '');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
      />
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        테마 변경: {theme}
      </button>
    </div>
  );
};

export default App;
```

## 🔔 이벤트 리스너 관리

### Window 이벤트

```tsx
import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // 정리: 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};

// 사용
const Component = () => {
  const { width, height } = useWindowSize();

  return (
    <div>
      화면 크기: {width} x {height}
    </div>
  );
};

export default Component;
```

### Document 이벤트

```tsx
import { useEffect } from 'react';

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, handler]);
};

// 사용
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>토글</button>
      {isOpen && <div>드롭다운 내용</div>}
    </div>
  );
};

export default Dropdown;
```

## 📡 WebSocket 구독 관리

```tsx
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
}

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://example.com/chat/${roomId}`);

    ws.onopen = () => {
      console.log('연결됨');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };

    ws.onclose = () => {
      console.log('연결 종료');
      setIsConnected(false);
    };

    // 정리: 연결 종료
    return () => {
      ws.close();
    };
  }, [roomId]);

  return (
    <div>
      <p>상태: {isConnected ? '연결됨' : '연결 끊김'}</p>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoom;
```

## ⏱️ Debounce / Throttle 패턴

### Debounce (입력 지연)

```tsx
import { useState, useEffect } from 'react';

const SearchInput = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // 500ms 후에 검색 실행
    const timer = setTimeout(() => {
      if (query) {
        fetch(`/api/search?q=${query}`)
          .then(res => res.json())
          .then(setResults);
      }
    }, 500);

    // 정리: 이전 타이머 취소
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
      />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchInput;
```

### Custom Hook으로 추출

```tsx
import { useState, useEffect } from 'react';

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// 사용
const SearchInput = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedQuery) {
      fetch(`/api/search?q=${debouncedQuery}`)
        .then(res => res.json())
        .then(setResults);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색..."
    />
  );
};

export default SearchInput;
```

## 🔄 Interval 패턴

### 기본 Interval

```tsx
import { useState, useEffect } from 'react';

const AutoRefresh = () => {
  const [data, setData] = useState(null);
  const [count, setCount] = useState(0);

  // 5초마다 데이터 새로고침
  useEffect(() => {
    const fetchData = () => {
      fetch('/api/data')
        .then(res => res.json())
        .then(setData);
    };

    // 즉시 한 번 실행
    fetchData();

    // 5초마다 실행
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  // count는 1초마다 증가
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
};

export default AutoRefresh;
```

### 조건부 Interval

```tsx
import { useState, useEffect } from 'react';

const ConditionalTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div>
      <p>{seconds}초</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '정지' : '시작'}
      </button>
      <button onClick={() => setSeconds(0)}>리셋</button>
    </div>
  );
};

export default ConditionalTimer;
```

## 📚 핵심 정리

1. **관심사 분리**: 여러 useEffect로 나누기
2. **Race Condition**: ignore 플래그 또는 AbortController 사용
3. **이벤트 리스너**: 반드시 정리 함수에서 제거
4. **WebSocket/구독**: 연결 종료를 정리 함수에서 처리
5. **Debounce**: setTimeout으로 입력 지연 처리
6. **Interval**: clearInterval로 타이머 정리
7. **Custom Hook**: 재사용 가능한 로직은 추출

## 다음 단계

더 자세한 내용은 다음 문서를 참고하세요:
- [useRef](/docs/react-hooks/useref)
- [Custom Hooks](/docs/react-hooks/custom-hooks)
- [useMemo](/docs/react-hooks/usememo)
