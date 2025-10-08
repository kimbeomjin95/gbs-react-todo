# 자주 묻는 질문 (FAQ)

React 학습 중 자주 발생하는 질문과 해결 방법을 정리했습니다.

## 🔴 일반적인 오류

### 1. "React is not defined"

**오류:**
```
ReferenceError: React is not defined
```

**원인:**
React 17 이전 버전에서 JSX 사용 시 React를 import하지 않음

**해결:**
```tsx
// React 17+ (자동 import)
const App = () => <div>Hello</div>;

// React 17 이전
import React from 'react';  // 추가!
const App = () => <div>Hello</div>;
```

---

### 2. "Each child in a list should have a unique key prop"

**오류:**
```
Warning: Each child in a list should have a unique "key" prop.
```

**원인:**
리스트 렌더링 시 key prop 누락

**해결:**
```tsx
// ❌ key 없음
{todos.map(todo => <li>{todo.text}</li>)}

// ✅ key 추가
{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
```

---

### 3. "Cannot update during an existing state transition"

**오류:**
```
Warning: Cannot update a component while rendering a different component.
```

**원인:**
렌더링 중에 setState 호출

**해결:**
```tsx
// ❌ 렌더링 중 setState
const Component = () => {
  const [count, setCount] = useState(0);
  setCount(1);  // 무한 루프!
  return <div>{count}</div>;
}

// ✅ useEffect 사용
const Component = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(1);  // 안전
  }, []);

  return <div>{count}</div>;
}
```

---

### 4. "Objects are not valid as a React child"

**오류:**
```
Error: Objects are not valid as a React child
```

**원인:**
JSX에 객체를 직접 렌더링

**해결:**
```tsx
// ❌ 객체 직접 렌더링
const user = { name: '김철수', age: 25 };
<div>{user}</div>  // 에러!

// ✅ 객체의 속성 렌더링
<div>{user.name}</div>  // OK
<div>{JSON.stringify(user)}</div>  // OK
```

---

## 🤔 개념 관련 질문

### Q: 왜 리렌더링이 안 되나요?

**A:** State를 직접 수정했을 가능성이 높습니다.

```tsx
// ❌ 직접 수정 (리렌더링 안 됨)
const [user, setUser] = useState({ name: '김철수' });
user.name = '박철수';
setUser(user);  // 같은 참조!

// ✅ 새 객체 생성 (리렌더링 됨)
setUser({ ...user, name: '박철수' });
```

---

### Q: useEffect가 무한 루프에 빠져요!

**A:** 의존성 배열을 잘못 설정했습니다.

```tsx
// ❌ 무한 루프
useEffect(() => {
  setCount(count + 1);
}, [count]);  // count 변경 → effect 실행 → count 변경 → ...

// ✅ 조건 추가
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);

// ✅ 의존성 제거
useEffect(() => {
  setCount(c => c + 1);  // 함수형 업데이트
}, []);  // 한 번만 실행
```

---

### Q: Props가 변경되는데 자식이 업데이트 안 돼요!

**A:** Props로 객체/배열을 전달할 때 참조가 같으면 변경으로 감지되지 않습니다.

```tsx
// ❌ 같은 참조
const Parent = () => {
  const config = { theme: 'dark' };  // 매번 같은 객체처럼 보이지만...
  return <Child config={config} />;  // 매번 새 객체!
}

// ✅ useMemo로 참조 유지
const Parent = () => {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <Child config={config} />;
}
```

---

### Q: useState의 초기값이 매번 계산돼요!

**A:** 함수 형태로 전달하세요.

```tsx
// ❌ 매번 계산됨 (느림)
const [data, setData] = useState(expensiveCalculation());

// ✅ 한 번만 계산됨 (빠름)
const [data, setData] = useState(() => expensiveCalculation());
```

---

## ⚡ 성능 관련

### Q: 리스트가 느려요!

**A:** React.memo + useCallback 조합을 사용하세요.

```tsx
const ListItem = memo(({ item, onDelete }) => {
  return (
    <li>
      {item.text}
      <button onClick={() => onDelete(item.id)}>삭제</button>
    </li>
  );
});

const List = ({ items }) => {
  const handleDelete = useCallback((id) => {
    // 삭제 로직
  }, []);

  return (
    <ul>
      {items.map(item => (
        <ListItem key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

---

### Q: 언제 useMemo를 사용하나요?

**A:** 비용이 큰 계산이 반복될 때만 사용하세요.

```tsx
// ❌ 불필요한 useMemo
const double = useMemo(() => count * 2, [count]);  // 간단한 연산

// ✅ 필요한 useMemo
const filtered = useMemo(() => {
  return items.filter(...).sort(...).map(...);  // 복잡한 연산
}, [items]);
```

---

## 📝 패턴 관련

### Q: Props Drilling을 어떻게 해결하나요?

**A:** Context API를 사용하세요.

```tsx
const ThemeContext = createContext();

const App = () => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DeepComponent />  {/* Props 전달 불필요! */}
    </ThemeContext.Provider>
  );
}

const DeepComponent = () => {
  const { theme } = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

---

### Q: 폼 입력을 어떻게 다루나요?

**A:** Controlled Component 패턴을 사용하세요.

```tsx
const Form = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
    </form>
  );
}
```

---

## 🔧 도구 관련

### Q: TypeScript 타입 에러가 나요!

**A:** 정확한 타입을 지정하세요.

```tsx
// ❌ 타입 에러
const [user, setUser] = useState({});  // 타입: {}
user.name  // 에러!

// ✅ 타입 지정
type User = { name: string; age: number };
const [user, setUser] = useState<User | null>(null);

if (user) {
  user.name  // OK!
}
```

---

### Q: ESLint 경고가 계속 떠요!

**A:** 의존성 배열을 정확히 작성하세요.

```tsx
// ⚠️ 경고: 'count' is missing in dependency array
useEffect(() => {
  console.log(count);
}, []);

// ✅ 의존성 추가
useEffect(() => {
  console.log(count);
}, [count]);
```

---

## 💡 베스트 프랙티스

### Q: 컴포넌트를 언제 분리하나요?

**A:** 다음 경우에 분리하세요:
- 100줄 이상일 때
- 재사용이 필요할 때
- 책임이 2개 이상일 때
- 테스트하기 어려울 때

---

### Q: Custom Hook을 언제 만드나요?

**A:** 같은 로직이 2번 이상 반복될 때 만드세요.

```tsx
// 반복되는 로직
const Component1 = () => {
  const [value, setValue] = useLocalStorage('key1', 'default');
  // ...
}

const Component2 = () => {
  const [value, setValue] = useLocalStorage('key2', 'default');
  // ...
}

// Custom Hook으로 추출
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) ?? initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}
```

---

## 📚 추가 학습 자료

- [React 공식 문서](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Patterns](https://reactpatterns.com/)

---

**더 궁금한 점이 있으신가요?**
- React 기초부터 다시: [React란 무엇인가?](/docs/react-basics/what-is-react)
- 실습 프로젝트: [Todo 앱 만들기](/docs/react-practice/todo-app)
