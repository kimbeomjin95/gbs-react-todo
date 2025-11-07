# 렌더링 최적화

React 애플리케이션의 성능을 최적화하는 방법을 알아봅니다.

:::info 사전 지식
이 문서는 [렌더링과 리렌더링](/docs/react-basics/rendering), [useMemo](/docs/react-hooks/usememo), [useCallback](/docs/react-hooks/usecallback)을 먼저 학습한 후 읽는 것을 권장합니다.
:::

## ⚡ 불필요한 리렌더링 방지

### 문제 상황

```tsx
import { useState } from 'react';

const ExpensiveChild = () => <div>무거운 컴포넌트</div>;

const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
      <ExpensiveChild /> {/* count와 무관하지만 매번 리렌더링 */}
    </div>
  );
};

export default Parent;
```

### 해결 방법 1: React.memo

```tsx
import { memo } from 'react';

const ExpensiveChild = memo(() => {
  console.log('ExpensiveChild 렌더링');
  return <div>무거운 컴포넌트</div>;
});

export default ExpensiveChild;
```

### 해결 방법 2: children prop 활용

```tsx
import { useState, type ReactNode } from 'react';

const ExpensiveChild = () => <div>무거운 컴포넌트</div>;

const Parent = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
      {children} {/* children은 리렌더링되지 않음 */}
    </div>
  );
};

// 사용
const App = () => (
  <Parent>
    <ExpensiveChild />
  </Parent>
);

export default App;
```

## ⚡ 렌더링 최적화 완벽 가이드

React의 렌더링 최적화는 **React.memo**, **useMemo**, **useCallback** 세 가지 도구로 이루어집니다.

### 최적화 도구 비교

| 도구 | 목적 | 반환값 | 사용 시점 |
|------|------|--------|----------|
| **React.memo** | 컴포넌트 메모이제이션 | 컴포넌트 | Props 변경 시에만 리렌더링 |
| **useMemo** | 값 메모이제이션 | 계산된 값 | 비용이 큰 계산 결과 캐싱 |
| **useCallback** | 함수 메모이제이션 | 함수 | 함수 참조 안정화 |

### 1. React.memo (컴포넌트 최적화)

**목적:** 부모가 리렌더링되어도 Props가 같으면 자식은 리렌더링하지 않음

**사용법:**
```tsx
import { memo, useState } from 'react';

const Child = memo(({ name, age }: { name: string; age: number }) => {
  console.log('Child 렌더링');
  return <div>{name} ({age}세)</div>;
});

const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
      <Child name="김철수" age={25} />
      {/* count 변경해도 Child는 리렌더링 안 됨! */}
    </div>
  );
};

export default Parent;
```

**작동 원리:**
```tsx
// React가 내부적으로 하는 일
if (prevProps.name === nextProps.name && prevProps.age === nextProps.age) {
  // Props가 같으면 이전 렌더링 결과 재사용
  return previousResult;
} else {
  // Props가 다르면 리렌더링
  return <Child {...nextProps} />;
}
```

**주의사항:**
```tsx
import { useState, useMemo, memo } from 'react';

interface User {
  name: string;
  age: number;
}

const Child = memo(({ user }: { user: User }) => <div>{user.name}</div>);

const BadParent = () => {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 새 객체 생성
  const user = { name: '김철수', age: 25 };

  return <Child user={user} />;
  // user 객체가 매번 다른 참조 → memo 무용지물!
};

// ✅ 올바른 방법
const GoodParent = () => {
  const [count, setCount] = useState(0);

  const user = useMemo(() => ({ name: '김철수', age: 25 }), []);

  return <Child user={user} />;
  // user 객체 참조 유지 → memo 정상 작동!
};

export default GoodParent;
```

### 2. useMemo (값 최적화)

**목적:** 비용이 큰 계산 결과를 캐싱

**사용법:**
```tsx
import { useMemo } from 'react';

interface ExpensiveListProps {
  items: string[];
  filter: string;
}

const ExpensiveList = ({ items, filter }: ExpensiveListProps) => {
  // ❌ 매 렌더링마다 필터링 실행
  // const filteredItems = items.filter(item => item.includes(filter));

  // ✅ filter나 items가 변경될 때만 필터링
  const filteredItems = useMemo(
    () => items.filter(item => item.includes(filter)),
    [items, filter]
  );

  return (
    <ul>
      {filteredItems.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
};

export default ExpensiveList;
```

**비용이 큰 계산 예제:**
```tsx
import { useMemo } from 'react';

interface DataAnalysisProps {
  data: number[];
}

const DataAnalysis = ({ data }: DataAnalysisProps) => {
  const analysis = useMemo(() => {
    console.log('복잡한 계산 실행...');

    // 비용이 큰 계산
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);

    return { sum, avg, max, min };
  }, [data]);

  return (
    <div>
      <p>합계: {analysis.sum}</p>
      <p>평균: {analysis.avg}</p>
      <p>최대: {analysis.max}</p>
      <p>최소: {analysis.min}</p>
    </div>
  );
};

export default DataAnalysis;
```

### 3. useCallback (함수 최적화)

**목적:** 함수 참조를 안정화하여 자식 컴포넌트 리렌더링 방지

**사용법:**
```tsx
import { useCallback, memo } from 'react';

interface Todo {
  id: number;
  text: string;
}

interface TodoListProps {
  todos: Todo[];
}

const deleteTodo = (id: number) => {
  console.log('삭제:', id);
};

const TodoList = ({ todos }: TodoListProps) => {
  // ❌ 매 렌더링마다 새 함수 생성
  // const handleDelete = (id: number) => {
  //   deleteTodo(id);
  // };

  // ✅ 함수 참조 유지
  const handleDelete = useCallback((id: number) => {
    deleteTodo(id);
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete}  // 안정된 참조
        />
      ))}
    </ul>
  );
};

const TodoItem = memo(({ todo, onDelete }: { todo: Todo; onDelete: (id: number) => void }) => {
  console.log('TodoItem 렌더링');
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
});

export default TodoList;
```

## 🎯 통합 최적화 예제

세 가지를 모두 활용한 실전 예제:

```tsx
import { useState, useMemo, useCallback, memo } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductListProps {
  products: Product[];
  category: string;
}

const ProductList = ({ products, category }: ProductListProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

  // 1. useMemo: 필터링 + 정렬 결과 캐싱
  const processedProducts = useMemo(() => {
    console.log('제품 처리 중...');

    const filtered = products.filter(p => p.category === category);
    const sorted = [...filtered].sort((a, b) =>
      a[sortBy] > b[sortBy] ? 1 : -1
    );

    return sorted;
  }, [products, category, sortBy]);

  // 2. useCallback: 함수 참조 안정화
  const handleAddToCart = useCallback((productId: number) => {
    console.log('장바구니 추가:', productId);
    // API 호출 등
  }, []);

  const handleToggleFavorite = useCallback((productId: number) => {
    console.log('즐겨찾기 토글:', productId);
    // API 호출 등
  }, []);

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}>
        <option value="name">이름순</option>
        <option value="price">가격순</option>
      </select>

      <div>
        {processedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

// 3. React.memo: 컴포넌트 메모이제이션
const ProductCard = memo(({ product, onAddToCart, onToggleFavorite }: {
  product: Product;
  onAddToCart: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}) => {
  console.log('ProductCard 렌더링:', product.name);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}원</p>
      <button onClick={() => onAddToCart(product.id)}>장바구니</button>
      <button onClick={() => onToggleFavorite(product.id)}>♥</button>
    </div>
  );
});

export default ProductList;
```

## 🗺️ 최적화 의사결정 플로우차트

```
리렌더링 문제가 있나?
    ↓ Yes
부모가 리렌더링될 때 자식도 불필요하게 리렌더링?
    ↓ Yes
자식 컴포넌트에 React.memo 적용
    ↓
Props로 객체/배열/함수를 전달?
    ↓ Yes
    ├─ 객체/배열 → useMemo로 참조 안정화
    └─ 함수 → useCallback으로 참조 안정화
```

## 📋 언제 최적화해야 하나?

### ✅ 최적화가 필요한 경우

1. **실제 성능 문제가 있을 때**
   - React DevTools Profiler로 측정했을 때 느림
   - 사용자가 버벅임을 느낌

2. **리스트 렌더링**
   - 100개 이상의 항목
   - 각 항목이 복잡한 컴포넌트

3. **비용이 큰 계산**
   - 복잡한 데이터 변환
   - 정렬, 필터링, 집계 연산

4. **고빈도 업데이트**
   - 애니메이션
   - 실시간 데이터
   - 타이핑 입력

### ❌ 최적화가 불필요한 경우

1. **작은 컴포넌트**
   - 단순한 텍스트나 버튼
   - 리렌더링 비용이 낮음

2. **항상 변경되는 Props**
   - 매번 다른 값이 전달됨
   - 메모이제이션해도 효과 없음

3. **성능 문제 없을 때**
   - "혹시 모르니까" 최적화는 오히려 복잡도만 증가

## ✅ 최적화 체크리스트

### 1. 문제 파악
- [ ] React DevTools Profiler로 측정
- [ ] 어떤 컴포넌트가 느린지 확인
- [ ] 불필요한 리렌더링 횟수 확인

### 2. 적절한 도구 선택
- [ ] 컴포넌트 리렌더링 → React.memo
- [ ] 비용이 큰 계산 → useMemo
- [ ] Props로 전달하는 함수 → useCallback

### 3. 의존성 배열 확인
- [ ] useMemo/useCallback의 의존성 정확히 작성
- [ ] ESLint exhaustive-deps 규칙 활성화

### 4. 효과 측정
- [ ] 최적화 전후 Profiler로 비교
- [ ] 실제로 개선되었는지 확인

## 🔄 Reconciliation (재조정)

React가 효율적으로 DOM을 업데이트하는 과정:

```tsx
// 1. 이전 Virtual DOM
<ul>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// 2. 새로운 Virtual DOM
<ul>
  <li>A</li>
  <li>C</li>  // B 삭제됨
  <li>D</li>  // D 추가됨
</ul>

// 3. React가 차이를 찾음 (Diffing)
- A: 변경 없음 (유지)
- B: 삭제됨 (제거)
- C: 변경 없음 (유지)
- D: 추가됨 (생성)

// 4. 실제 DOM에 최소한의 변경만 적용
- B 요소만 제거
- D 요소만 추가
```

### key prop의 역할

```tsx
// key 없이
<li>A</li>, <li>B</li>, <li>C</li>
→ B 삭제 시 모든 요소 재생성 가능

// key와 함께
<li key="1">A</li>, <li key="2">B</li>, <li key="3">C</li>
→ key="2"만 삭제, 나머지 재사용
```

## 📚 핵심 정리

1. **측정 먼저, 최적화는 나중에**
   - 추측하지 말고 Profiler로 측정

2. **세 가지 도구를 적재적소에 사용**
   - React.memo: 컴포넌트
   - useMemo: 값
   - useCallback: 함수

3. **의존성 배열을 정확히**
   - 빠뜨리면 버그, 너무 많으면 무용지물

4. **과도한 최적화 주의**
   - 코드 복잡도 vs 성능 개선 trade-off

5. **key prop 제대로 사용**
   - 고유하고 안정적인 ID 사용
   - index는 최후의 수단

## 다음 단계

더 자세한 내용은 다음 문서를 참고하세요:
- [useMemo](/docs/react-hooks/usememo)
- [useCallback](/docs/react-hooks/usecallback)
- [useEffect](/docs/react-hooks/useeffect)
