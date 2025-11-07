# useEffect Hook

useEffect는 컴포넌트에서 **렌더링 이외의 작업**을 처리할 때 사용하는 Hook입니다.

## 🎯 렌더링 이외의 작업이란?

React 컴포넌트의 주요 역할은 **UI를 렌더링**하는 것입니다. 하지만 때로는 렌더링 외에 다른 작업도 필요합니다:

### 렌더링 작업 (컴포넌트 함수 안에서)
```tsx
const Component = () => {
  const [count, setCount] = useState(0);

  // ✅ 렌더링 작업: JSX 반환
  return <div>{count}</div>;
};
```

### 렌더링 이외의 작업 (useEffect 안에서)
```tsx
const Component = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ❌ 렌더링과 직접 관련 없는 작업들
    // 1. API 호출 - 서버와 통신
    fetch('/api/data');

    // 2. 타이머 설정 - 시간 관련 작업
    const timer = setInterval(() => {}, 1000);

    // 3. DOM 직접 조작 - React 외부 작업
    document.title = '새 제목';

    // 4. 브라우저 API 사용
    localStorage.setItem('key', 'value');

    return () => clearInterval(timer);
  }, []);

  return <div>{count}</div>;
};
```

### 왜 useEffect를 사용해야 하나?

**잘못된 예 (컴포넌트 함수 안에서 직접 실행):**
```tsx
const BadExample = () => {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 실행됨!
  fetch('/api/data'); // 불필요한 중복 호출
  document.title = `Count: ${count}`; // 매번 변경

  return <div>{count}</div>;
};
```

**올바른 예 (useEffect 사용):**
```tsx
const GoodExample = () => {
  const [count, setCount] = useState(0);

  // ✅ 마운트 시 한 번만 실행
  useEffect(() => {
    fetch('/api/data');
  }, []);

  // ✅ count 변경 시에만 실행
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return <div>{count}</div>;
};
```

### 핵심 차이

| | 컴포넌트 함수 안 | useEffect 안 |
|---|---|---|
| **목적** | UI 렌더링 | 렌더링 외 작업 |
| **실행 시점** | 매 렌더링마다 | 의존성 배열에 따라 |
| **예시** | JSX 반환, 계산 | API 호출, 타이머, DOM 조작 |

:::info 용어 참고
"사이드 이펙트(Side Effect)"는 프로그래밍에서 두 가지 의미로 사용됩니다:
1. **나쁜 의미**: 함수가 예상치 못한 곳에 영향을 미침 (버그)
2. **중립적 의미**: 함수의 주 목적 외의 작업 (React에서는 이 의미)

React 문서에서는 "렌더링이 주 목적, 그 외는 부수적인 작업"이라는 의미로 사용합니다.
:::

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
import { useEffect } from 'react';

const Component = () => {
  console.log('1. 컴포넌트 함수 실행');

  useEffect(() => {
    console.log('2. 마운트 완료! (DOM에 추가됨)');
  }, []);

  return <div>컴포넌트</div>;
};

export default Component;
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
import { useState, useEffect } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  console.log('렌더링 (마운트 + 매 업데이트)');

  useEffect(() => {
    console.log('count가 변경됨:', count);
  }, [count]); // count가 변경될 때마다 실행

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      {count}
    </button>
  );
};

export default Component;
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
import { useEffect } from 'react';

const Component = () => {
  useEffect(() => {
    console.log('마운트');

    return () => {
      console.log('언마운트! (정리 작업)');
    };
  }, []);

  return <div>컴포넌트</div>;
};

export default Component;
```

**언마운트 시점:**
- 부모 컴포넌트에서 해당 컴포넌트를 제거할 때
- 조건부 렌더링으로 컴포넌트가 사라질 때
- 페이지 이동 시

### useEffect와 생명주기의 관계

```tsx
import { useState, useEffect } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

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

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>증가</button>
    </div>
  );
};

export default Component;
```

### 실전 예제: 생명주기 활용

**타이머 관리:**
```tsx
import { useState, useEffect } from 'react';

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
};

export default Timer;
```

**API 호출:**
```tsx
import { useState, useEffect } from 'react';

interface User {
  name: string;
}

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);

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
};

export default UserProfile;
```

**구독 관리:**
```tsx
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
}

// 가상의 chatAPI 객체
const chatAPI = {
  subscribe: (roomId: string, callback: (message: Message) => void) => {
    // 실제 구독 로직
    return {
      unsubscribe: () => {
        // 구독 해제 로직
      }
    };
  }
};

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);

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
};

export default ChatRoom;
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
    // 렌더링 외 작업
    console.log('컴포넌트가 렌더링됨');
  });

  return <div>컴포넌트</div>;
};

export default Component;
```

## 🔄 의존성 배열

### 의존성 배열 없음

매 렌더링마다 실행됩니다:

```tsx
import { useEffect } from 'react';

const Component = () => {
  useEffect(() => {
    console.log('매 렌더링마다 실행');
  });

  return <div>컴포넌트</div>;
};

export default Component;
```

### 빈 의존성 배열

컴포넌트가 마운트될 때 한 번만 실행됩니다:

```tsx
import { useEffect } from 'react';

const Component = () => {
  useEffect(() => {
    console.log('마운트 시 한 번만 실행');
  }, []);

  return <div>컴포넌트</div>;
};

export default Component;
```

### 특정 값이 변경될 때

```tsx
import { useState, useEffect } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('count가 변경됨:', count);
  }, [count]); // count가 변경될 때만 실행

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>증가</button>
    </div>
  );
};

export default Component;
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
import { useState, useEffect } from 'react';

interface User {
  name: string;
}

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
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
  return <div>{user?.name}</div>;
};

export default UserProfile;
```

### 타이머 설정

```tsx
import { useState, useEffect } from 'react';

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
};

export default Timer;
```

### Document Title 변경

```tsx
import { useEffect } from 'react';

const Page = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <div>{title} 페이지</div>;
};

export default Page;
```


## ⚠️ 주의사항

### 1. 무한 루프 조심

```tsx
import { useState, useEffect } from 'react';

const BadExample = () => {
  const [count, setCount] = useState(0);

  // ❌ 무한 루프!
  useEffect(() => {
    setCount(count + 1); // count 변경 → effect 실행 → count 변경 → ...
  }, [count]);

  return <div>{count}</div>;
};

const GoodExample = () => {
  const [count, setCount] = useState(0);

  // ✅ 조건부 업데이트
  useEffect(() => {
    if (count < 10) {
      setCount(prev => prev + 1);
    }
  }, [count]);

  return <div>{count}</div>;
};

export default GoodExample;
```

### 2. 의존성 배열 정직하게 작성

```tsx
import { useState, useEffect } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  // ❌ 나쁜 예
  useEffect(() => {
    console.log(count); // count 사용하지만 의존성 배열에 없음
  }, []);

  // ✅ 좋은 예
  useEffect(() => {
    console.log(count);
  }, [count]);

  return <div>{count}</div>;
};

export default Component;
```

### 3. async/await 사용 시

```tsx
import { useState, useEffect } from 'react';

const BadComponent = () => {
  const [data, setData] = useState(null);

  // ❌ useEffect 자체를 async로 만들면 안 됨
  // useEffect(async () => {
  //   const data = await fetchData();
  // }, []);

  return <div>{data}</div>;
};

const GoodComponent = () => {
  const [data, setData] = useState(null);

  // ✅ 내부에 async 함수 정의
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    };

    loadData();
  }, []);

  return <div>{JSON.stringify(data)}</div>;
};

export default GoodComponent;
```

## 🌐 실전 예제

useEffect를 활용한 실전 프로젝트를 만들어보세요:

- [게시글 목록과 상세 페이지](/docs/react-practice/posts-app) - API 호출, 로딩 상태, 에러 처리

## 📚 정리

1. **렌더링 이외의 작업**: API 호출, 타이머, DOM 조작 등
2. **생명주기**: Mount → Update → Unmount
3. **의존성 배열**:
   - 없음: 매 렌더링마다
   - `[]`: 마운트/언마운트만
   - `[deps]`: deps 변경 시
4. **정리 함수**: 타이머, 구독, 이벤트 리스너 정리
5. **주의사항**: 무한 루프, 의존성 배열, async/await

## 다음 단계

- 실전 프로젝트: [게시글 목록과 상세 페이지](/docs/react-practice/posts-app)
- 기본 프로젝트: [Todo 앱 만들기](/docs/react-practice/todo-app)
- 고급 패턴: [useEffect 심화](/docs/react-hooks/useeffect) (Race Condition, Debounce, Custom Hooks)
