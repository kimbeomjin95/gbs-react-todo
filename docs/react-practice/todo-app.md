# React Todo 가이드

React로 Todo 애플리케이션을 만드는 완벽한 가이드입니다.

## 🎯 학습 목표

이 가이드를 통해 다음을 배울 수 있습니다:

- React Hooks (useState) 사용법
- TypeScript와 React 함께 사용하기
- 컴포넌트 상태 관리
- 이벤트 핸들링
- 리스트 렌더링

## 📋 실습 예제

[Todo 앱 실습하기](/todo)

## 📂 실습 파일

이 가이드의 코드는 다음 파일에서 실습합니다:

**파일 경로**: `src/pages/todo/index.tsx`

### 학습 방법

**방법 1: 처음부터 따라하기 (추천)**
1. `src/pages/todo/index.tsx` 파일의 내용을 백업하거나 삭제
2. 아래 "시작하기"부터 순차적으로 코드 작성
3. 각 단계마다 브라우저에서 동작 확인 (`pnpm start`)

**방법 2: 완성본 분석하기**
1. `src/pages/todo/index.tsx` 파일 열기
2. 이 가이드 문서와 비교하며 코드 이해
3. 각 함수와 UI 컴포넌트의 역할 파악

## 🚀 시작하기

### 1. 기본 구조 설정

Todo 애플리케이션의 기본 타입을 정의합니다:

```tsx
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};
```

### 2. State 관리

React의 `useState` Hook을 사용하여 상태를 관리합니다:

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [inputValue, setInputValue] = useState('');
```

## 💡 핵심 기능 구현

### Todo 추가하기

```tsx
const addTodo = () => {
  if (inputValue.trim() === '') return;

  const newTodo: Todo = {
    id: Date.now(),
    text: inputValue,
    completed: false,
  };

  setTodos([...todos, newTodo]);
  setInputValue('');
};
```

**주요 포인트:**
- 빈 입력값 검증
- 고유한 ID 생성 (Date.now() 사용)
- 스프레드 연산자로 불변성 유지
- 입력값 초기화

### Todo 토글하기

```tsx
const toggleTodo = (id: number) => {
  setTodos(todos.map(todo =>
    todo.id === id ? {...todo, completed: !todo.completed} : todo
  ));
};
```

**주요 포인트:**
- `map`을 사용한 배열 업데이트
- 조건부로 특정 항목만 수정
- 불변성 유지 (새 객체 생성)

### Todo 삭제하기

```tsx
const deleteTodo = (id: number) => {
  setTodos(todos.filter(todo => todo.id !== id));
};
```

**주요 포인트:**
- `filter`를 사용한 항목 제거
- 원본 배열 변경 없이 새 배열 반환

### 키보드 이벤트 처리

```tsx
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    addTodo();
  }
};
```

**주요 포인트:**
- Enter 키로 Todo 추가
- 사용자 경험 향상

## 🎨 UI 렌더링

### 리스트 렌더링

```tsx
<ul>
  {todos.map(todo => (
    <li key={todo.id}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
      />
      <span className={todo.completed ? styles.completed : ''}>
        {todo.text}
      </span>
      <button onClick={() => deleteTodo(todo.id)}>
        삭제
      </button>
    </li>
  ))}
</ul>
```

**주요 포인트:**
- `key` prop 필수 (고유한 식별자)
- 조건부 클래스명 적용
- 인라인 이벤트 핸들러

### 조건부 렌더링

```tsx
{todos.length === 0 && (
  <p>할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
)}
```

### 통계 표시

```tsx
<div>
  <span>전체: {todos.length}</span>
  <span>완료: {todos.filter(t => t.completed).length}</span>
  <span>미완료: {todos.filter(t => !t.completed).length}</span>
</div>
```

## 📚 React 핵심 개념

### 1. 불변성 (Immutability)

React에서 상태를 업데이트할 때는 항상 새로운 객체/배열을 생성해야 합니다:

```tsx
// ❌ 잘못된 방법 (직접 수정)
todos.push(newTodo);
setTodos(todos);

// ✅ 올바른 방법 (새 배열 생성)
setTodos([...todos, newTodo]);
```

### 2. 단방향 데이터 흐름

- 부모에서 자식으로 데이터 전달 (props)
- 자식에서 부모로 이벤트 전달 (callback)

### 3. 선언적 UI

조건과 상태에 따라 UI가 자동으로 업데이트됩니다:

```tsx
{todo.completed ? <CompletedIcon /> : <ActiveIcon />}
```

## 📦 완성본 코드

아래는 모든 기능이 구현된 완성본 코드입니다:

```tsx title="src/pages/todo/index.tsx"
import type {ReactNode} from 'react';
import {useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function TodoPage(): ReactNode {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <Layout
      title="React Todo"
      description="Simple Todo application built with React">
      <div className={styles.container}>
        <Heading as="h1" className={styles.title}>📝 React Todo</Heading>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="할 일을 입력하세요..."
            className={styles.input}
          />
          <button onClick={addTodo} className={styles.addButton}>
            추가
          </button>
        </div>

        <ul className={styles.todoList}>
          {todos.map(todo => (
            <li key={todo.id} className={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className={styles.checkbox}
              />
              <span className={todo.completed ? styles.completed : ''}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className={styles.deleteButton}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className={styles.emptyMessage}>할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
        )}

        <div className={styles.stats}>
          <span>전체: {todos.length}</span>
          <span>완료: {todos.filter(t => t.completed).length}</span>
          <span>미완료: {todos.filter(t => !t.completed).length}</span>
        </div>
      </div>
    </Layout>
  );
}
```

**코드 구조 설명:**

1. **Import 영역 (1-5줄)**: 필요한 React 타입과 컴포넌트 import
2. **타입 정의 (7-11줄)**: Todo 데이터 구조 정의
3. **State 관리 (14-15줄)**: todos 배열과 inputValue 상태
4. **함수 영역 (17-44줄)**: CRUD 기능 함수들
5. **UI 렌더링 (46-100줄)**: JSX로 화면 구성

## 🛠️ 개선 아이디어

### 1. LocalStorage 연동

```tsx
// 초기값 로드
const [todos, setTodos] = useState<Todo[]>(() => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
});

// 변경 시 저장
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);
```

### 2. 필터링 기능

```tsx
const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

const filteredTodos = todos.filter(todo => {
  if (filter === 'active') return !todo.completed;
  if (filter === 'completed') return todo.completed;
  return true;
});
```

### 3. 수정 기능

```tsx
const editTodo = (id: number, newText: string) => {
  setTodos(todos.map(todo =>
    todo.id === id ? {...todo, text: newText} : todo
  ));
};
```

### 4. 전체 선택/해제

```tsx
const toggleAll = () => {
  const allCompleted = todos.every(t => t.completed);
  setTodos(todos.map(t => ({...t, completed: !allCompleted})));
};
```

## 🎓 다음 단계

1. **Context API**: 전역 상태 관리
2. **Custom Hooks**: 로직 재사용
3. **useReducer**: 복잡한 상태 관리
4. **React Query**: 서버 상태 관리
5. **Testing**: Jest + React Testing Library

## 📖 참고 자료

- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org)
- [React Hooks 가이드](https://react.dev/reference/react)
