# useCallback Hook

useCallback은 함수를 메모이제이션하는 Hook입니다.

## 🎯 useCallback이란?

`useCallback`은 **함수의 참조를 유지**하여 불필요한 리렌더링을 방지합니다.

## 📝 기본 사용법

```tsx
import { useCallback } from 'react';

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // 의존성 배열
```

**동작 방식:**
- 의존성이 변경되지 않으면 → 같은 함수 참조 반환
- 의존성이 변경되면 → 새로운 함수 생성

## 🔍 왜 필요한가?

### 문제 상황

```tsx
import { useState, memo } from 'react';

const Parent = () => {
  const [count, setCount] = useState(0);

  // 매 렌더링마다 새로운 함수 생성!
  const handleClick = () => {
    console.log('클릭!');
  };

  return <Child onClick={handleClick} />;
}

const Child = memo(({ onClick }) => {
  console.log('Child 렌더링'); // 매번 실행됨!
  return <button onClick={onClick}>클릭</button>;
});

export default Parent;
```

`handleClick`이 매번 새로 생성되어 `Child`가 계속 리렌더링됩니다.

### 해결: useCallback 사용

```tsx
import { useState, useCallback, memo } from 'react';

const Parent = () => {
  const [count, setCount] = useState(0);

  // 함수 참조 유지
  const handleClick = useCallback(() => {
    console.log('클릭!');
  }, []);

  return <Child onClick={handleClick} />;
}

const Child = memo(({ onClick }) => {
  console.log('Child 렌더링'); // 한 번만 실행
  return <button onClick={onClick}>클릭</button>;
});

export default Parent;
```

## 💡 실전 예제

### 이벤트 핸들러

```tsx
import { useCallback } from 'react';

const TodoItem = ({ todo, onToggle, onDelete }) => {
  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      <span>{todo.text}</span>
      <button onClick={handleDelete}>삭제</button>
    </div>
  );
}

export default TodoItem;
```

### 디바운스 검색

```tsx
import { useState, useCallback } from 'react';

const SearchInput = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      onSearch(searchTerm);
    }, 300),
    [onSearch]
  );

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return <input value={value} onChange={handleChange} />;
}

export default SearchInput;
```

### 폼 제출

```tsx
import { useState, useCallback } from 'react';

const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('제출:', { name, email });
  }, [name, email]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">제출</button>
    </form>
  );
}

export default Form;
```

## 🎨 자식 컴포넌트 최적화

### 리스트 아이템

```tsx
import { useCallback, memo } from 'react';

const TodoList = ({ todos }) => {
  const handleToggle = useCallback((id) => {
    // API 호출 등
    toggleTodo(id);
  }, []);

  const handleDelete = useCallback((id) => {
    deleteTodo(id);
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

const TodoItem = memo(({ todo, onToggle, onDelete }) => {
  console.log(`${todo.text} 렌더링`);

  return (
    <li>
      <span>{todo.text}</span>
      <button onClick={() => onToggle(todo.id)}>완료</button>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
});

export default TodoList;
```

## ⚠️ 주의사항

### 1. 의존성 배열 정확히 작성

```tsx
import { useState, useCallback } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  // ❌ 잘못된 예
  const badHandleClick = useCallback(() => {
    console.log(count); // count 사용하지만 의존성에 없음
  }, []);

  // ✅ 올바른 예
  const goodHandleClick = useCallback(() => {
    console.log(count);
  }, [count]);

  return <button onClick={goodHandleClick}>클릭</button>;
}

export default Component;
```

### 2. setState의 함수형 업데이트

의존성을 줄이려면 함수형 업데이트 사용:

```tsx
import { useState, useCallback } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  // ❌ count를 의존성에 포함해야 함
  const badIncrement = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  // ✅ 의존성 없이 가능
  const goodIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <button onClick={goodIncrement}>증가</button>;
}

export default Component;
```

### 3. 모든 함수에 useCallback 사용하지 말 것

```tsx
import { useCallback } from 'react';

// ❌ 불필요한 useCallback
const BadComponent = () => {
  const handleClick = useCallback(() => {
    console.log('클릭');
  }, []);

  // 자식 컴포넌트가 없고, memo도 사용하지 않음
  return <button onClick={handleClick}>클릭</button>;
}

// ✅ 일반 함수로 충분
const GoodComponent = () => {
  const handleClick = () => {
    console.log('클릭');
  };

  return <button onClick={handleClick}>클릭</button>;
}

export default GoodComponent;
```

## 🔍 useCallback vs useMemo

### useCallback

```tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo (동일한 결과)

```tsx
const memoizedCallback = useMemo(() => {
  return () => doSomething(a, b);
}, [a, b]);
```

`useCallback(fn, deps)`는 `useMemo(() => fn, deps)`와 같습니다.

## 💡 실전 패턴

### Custom Hook과 함께

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
const Component = () => {
  const modal = useToggle();

  return (
    <div>
      <button onClick={modal.setTrue}>열기</button>
      {modal.value && (
        <Modal onClose={modal.setFalse} />
      )}
    </div>
  );
}

export default Component;
```

### 이벤트 핸들러 팩토리

```tsx
import { useCallback } from 'react';

const ListComponent = ({ items }) => {
  const createClickHandler = useCallback((id) => {
    return () => {
      console.log('클릭:', id);
    };
  }, []);

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={createClickHandler(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

export default ListComponent;
```

### useEffect와 함께

```tsx
import { useState, useCallback, useEffect } from 'react';

const Component = ({ userId }) => {
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // fetchUser가 안정적인 참조

  return <div>{user?.name}</div>;
}

export default Component;
```

## 📊 언제 사용해야 하나?

### useCallback 사용

- ✅ memo로 감싼 자식 컴포넌트에 props로 전달
- ✅ useEffect의 의존성 배열에 포함
- ✅ Custom Hook에서 함수 반환
- ✅ 비용이 큰 계산을 트리거하는 함수

### useCallback 불필요

- ❌ 자식 컴포넌트가 없는 경우
- ❌ 자식이 memo로 감싸지지 않은 경우
- ❌ 간단한 이벤트 핸들러

## 📚 정리

- **목적**: 함수 참조 유지, 불필요한 리렌더링 방지
- **언제**: memo와 함께, useEffect 의존성, Custom Hook
- **주의**: 모든 함수에 사용하지 말 것
- **대안**: 함수형 업데이트로 의존성 줄이기

## 다음 단계

다음 장에서는 [useContext Hook](/docs/react-hooks/usecontext)에 대해 알아보겠습니다.
