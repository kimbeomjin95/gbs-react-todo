# useMemo Hook

useMemo는 계산 비용이 높은 값을 메모이제이션(캐싱)하는 Hook입니다.

## 🎯 useMemo란?

`useMemo`는 **비용이 큰 계산 결과를 캐싱**하여 불필요한 재계산을 방지합니다.

## 📝 기본 사용법

```tsx
import { useMemo } from 'react';

const value = useMemo(() => {
  // 비용이 큰 계산
  return computeExpensiveValue(a, b);
}, [a, b]); // 의존성 배열
```

**동작 방식:**
- 의존성 배열의 값이 변경되지 않으면 → 캐시된 값 반환
- 의존성 배열의 값이 변경되면 → 함수 재실행

## ⚡ 성능 최적화 예제

### 문제 상황

```tsx
import React from 'react';

const TodoList = ({ todos, filter }) => {
  // 매 렌더링마다 필터링 실행! (비효율적)
  const filteredTodos = todos.filter(todo => {
    console.log('필터링 실행...');
    return filter === 'all' ? true :
           filter === 'active' ? !todo.completed :
           todo.completed;
  });

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

export default TodoList;
```

다른 state가 변경되어도 매번 필터링이 실행됩니다!

### 해결: useMemo 사용

```tsx
import { useMemo } from 'react';

const TodoList = ({ todos, filter }) => {
  // todos나 filter가 변경될 때만 필터링 실행
  const filteredTodos = useMemo(() => {
    console.log('필터링 실행...');
    return todos.filter(todo => {
      return filter === 'all' ? true :
             filter === 'active' ? !todo.completed :
             todo.completed;
    });
  }, [todos, filter]);

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

export default TodoList;
```

## 💡 실전 예제

### 복잡한 계산 캐싱

```tsx
import { useMemo } from 'react';

const ExpensiveComponent = ({ numbers }) => {
  const sum = useMemo(() => {
    console.log('합계 계산 중...');
    return numbers.reduce((acc, n) => acc + n, 0);
  }, [numbers]);

  const average = useMemo(() => {
    console.log('평균 계산 중...');
    return sum / numbers.length;
  }, [sum, numbers.length]);

  return (
    <div>
      <p>합계: {sum}</p>
      <p>평균: {average}</p>
    </div>
  );
}

export default ExpensiveComponent;
```

### 정렬된 리스트

```tsx
import { useMemo } from 'react';

const SortedList = ({ items, sortKey }) => {
  const sortedItems = useMemo(() => {
    console.log('정렬 실행...');
    return [...items].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });
  }, [items, sortKey]);

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

export default SortedList;
```

### 검색 필터링

```tsx
import { useMemo } from 'react';

const SearchableList = ({ items, searchTerm }) => {
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm]);

  return (
    <div>
      <p>{filteredItems.length}개 결과</p>
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchableList;
```

## 🎨 객체/배열 참조 유지

### 문제: 매번 새로운 객체 생성

```tsx
import { useState, memo } from 'react';

const Parent = () => {
  const [count, setCount] = useState(0);

  // 매 렌더링마다 새로운 객체 생성!
  const config = { theme: 'dark', locale: 'ko' };

  return <Child config={config} />; // Child가 매번 리렌더링
}

const Child = memo(({ config }) => {
  console.log('Child 렌더링');
  return <div>{config.theme}</div>;
});

export default Parent;
```

### 해결: useMemo로 참조 유지

```tsx
import { useState, useMemo } from 'react';

const Parent = () => {
  const [count, setCount] = useState(0);

  // 참조가 유지됨
  const config = useMemo(() => ({
    theme: 'dark',
    locale: 'ko'
  }), []);

  return <Child config={config} />; // 리렌더링 안 됨
}

export default Parent;
```

## ⚠️ 주의사항

### 1. 모든 곳에 사용하지 말 것

```tsx
import { useMemo } from 'react';

// ❌ 불필요한 useMemo
const BadComponent = () => {
  const sum = useMemo(() => 2 + 2, []); // 간단한 계산에는 불필요

  return <div>{sum}</div>;
}

// ✅ 그냥 계산하는 게 나음
const GoodComponent = () => {
  const sum = 2 + 2;

  return <div>{sum}</div>;
}

export default GoodComponent;
```

### 2. useMemo를 사용해야 하는 경우

- ✅ 계산 비용이 높은 경우
- ✅ 리스트 필터링/정렬
- ✅ 복잡한 데이터 변환
- ✅ 자식 컴포넌트의 props로 전달되는 객체/배열

### 3. 의존성 배열 정확히 작성

```tsx
import { useMemo } from 'react';

// ❌ 잘못된 예
const BadExample = ({ items, type }) => {
  const filtered = useMemo(() => {
    return items.filter(item => item.type === type);
  }, [items]); // type이 빠짐!

  return <div>{filtered.length}</div>;
}

// ✅ 올바른 예
const GoodExample = ({ items, type }) => {
  const filtered = useMemo(() => {
    return items.filter(item => item.type === type);
  }, [items, type]);

  return <div>{filtered.length}</div>;
}

export default GoodExample;
```

## 🔍 useMemo vs useCallback

### useMemo: 값을 메모이제이션

```tsx
const value = useMemo(() => computeValue(), [dep]);
```

### useCallback: 함수를 메모이제이션

```tsx
const callback = useCallback(() => doSomething(), [dep]);

// 동일한 코드:
const callback = useMemo(() => () => doSomething(), [dep]);
```

## 📊 성능 측정

useMemo의 효과를 확인하려면:

```tsx
import { useMemo } from 'react';

const Component = ({ data }) => {
  const start = performance.now();

  const processed = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);

  const end = performance.now();
  console.log(`처리 시간: ${end - start}ms`);

  return <div>{processed}</div>;
}

export default Component;
```

## 💡 실전 패턴

### 페이지네이션

```tsx
import { useMemo } from 'react';

const PaginatedList = ({ items, page, pageSize }) => {
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  return (
    <div>
      {paginatedItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

export default PaginatedList;
```

### 그룹화

```tsx
import { useMemo } from 'react';

const GroupedList = ({ items }) => {
  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          <ul>
            {items.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default GroupedList;
```

## 📚 정리

- **목적**: 비용이 큰 계산 결과 캐싱
- **언제**: 계산이 복잡하거나 리스트 처리 시
- **주의**: 단순한 계산에는 사용하지 말 것
- **의존성**: 사용하는 모든 값을 배열에 포함

## 다음 단계

다음 장에서는 [useCallback Hook](/docs/react-hooks/usecallback)에 대해 알아보겠습니다.
