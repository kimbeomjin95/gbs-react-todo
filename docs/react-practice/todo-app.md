# 상태 관리 실습: Todo 앱

React의 useState Hook을 활용하여 Todo 애플리케이션을 만들어봅니다.

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

**파일 경로**: `src/todo/index.tsx`

### 학습 방법

**방법 1: 처음부터 따라하기 (추천)**
1. `src/todo/index.tsx` 파일의 내용을 백업하거나 삭제
2. 아래 "시작하기"부터 순차적으로 코드 작성
3. 각 단계마다 브라우저에서 동작 확인 (`pnpm start`)

**방법 2: 완성본 분석하기**
1. `src/todo/index.tsx` 파일 열기
2. 이 가이드 문서와 비교하며 코드 이해
3. 각 함수와 UI 컴포넌트의 역할 파악

## 🚀 시작하기

### 1. 기본 구조 설정

Todo 애플리케이션의 기본 타입을 정의합니다:

```tsx
import { useState } from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};
```

### 2. State 관리

React의 `useState` Hook을 사용하여 상태를 관리합니다:

```tsx
const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  return <div>Todo App</div>;
};

export default TodoApp;
```

## 💡 핵심 기능 구현

### Todo 추가하기

```tsx
import { useState } from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos(prev => [...prev, newTodo]); // 함수형 업데이트
    setInputValue('');
  };

  return <div>Todo App</div>;
};

export default TodoApp;
```

**주요 포인트:**
- 빈 입력값 검증
- 고유한 ID 생성 (Date.now() 사용)
- 함수형 업데이트로 불변성 유지
- 입력값 초기화

### Todo 토글하기

```tsx
const toggleTodo = (id: number) => {
  setTodos(prev => prev.map(todo =>
    todo.id === id ? {...todo, completed: !todo.completed} : todo
  ));
};
```

**주요 포인트:**
- `map`을 사용한 배열 업데이트
- 조건부로 특정 항목만 수정
- 불변성 유지 (새 객체 생성)
- 함수형 업데이트 사용

### Todo 삭제하기

```tsx
const deleteTodo = (id: number) => {
  setTodos(prev => prev.filter(todo => todo.id !== id));
};
```

**주요 포인트:**
- `filter`를 사용한 항목 제거
- 원본 배열 변경 없이 새 배열 반환
- 함수형 업데이트 사용

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
setTodos(prev => [...prev, newTodo]);
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

```tsx title="TodoApp.tsx"
import {useState} from 'react';
import './TodoApp.css';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id: number) => {
    if (editingText.trim() === '') return;

    setTodos(prev => prev.map(todo =>
      todo.id === id ? {...todo, text: editingText} : todo
    ));
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="container">
      <h1 className="title">📝 React Todo</h1>

      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="할 일을 입력하세요..."
          className="input"
        />
        <button onClick={addTodo} className="add-button">
          추가
        </button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="checkbox"
            />
            {editingId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
                  className="edit-input"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  className="save-button"
                >
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="cancel-button"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <span className={todo.completed ? 'completed' : ''}>
                  {todo.text}
                </span>
                <button
                  onClick={() => startEdit(todo.id, todo.text)}
                  className="edit-button"
                >
                  수정
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  삭제
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="empty-message">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
      )}

      <div className="stats">
        <span>전체: {todos.length}</span>
        <span>완료: {todos.filter(t => t.completed).length}</span>
        <span>미완료: {todos.filter(t => !t.completed).length}</span>
      </div>
    </div>
  );
};

export default TodoApp;
```

```css title="TodoApp.css"
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #3578e5;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e3e3e3;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3578e5;
}

.add-button {
  padding: 0.75rem 1.5rem;
  background-color: #3578e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #2a5fb8;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.todo-item:hover {
  background-color: #e8e8e8;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-item span {
  flex: 1;
  font-size: 1rem;
  color: #333;
}

.completed {
  text-decoration: line-through;
  color: #999;
  opacity: 0.7;
}

.edit-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #3578e5;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background-color: white;
}

.edit-input:focus {
  outline: none;
  border-color: #2a5fb8;
}

.edit-button {
  padding: 0.5rem 1rem;
  background-color: #3578e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #2a5fb8;
}

.save-button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.delete-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #c82333;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-weight: bold;
}

.stats span {
  color: #3578e5;
}
```

**코드 구조 설명:**

1. **Import 영역 (1-2줄)**: 필요한 React 함수와 CSS import
2. **타입 정의 (4-8줄)**: Todo 데이터 구조 정의
3. **State 관리 (11-14줄)**: todos 배열, inputValue, 수정 모드 상태
4. **함수 영역 (16-63줄)**: CRUD + 수정 기능 함수들
   - `addTodo`: 새 할 일 추가
   - `toggleTodo`: 완료 상태 토글
   - `deleteTodo`: 할 일 삭제
   - `startEdit`: 수정 모드 시작
   - `cancelEdit`: 수정 취소
   - `saveEdit`: 수정 내용 저장
   - `handleKeyPress`: Enter로 추가
   - `handleEditKeyPress`: Enter로 저장, Escape로 취소
5. **UI 렌더링 (65-152줄)**: JSX로 화면 구성
   - 조건부 렌더링으로 일반 모드와 수정 모드 전환

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
import { useState } from 'react';

const TodoApp = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [todos, setTodos] = useState<Todo[]>([]);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return <div>{/* UI */}</div>;
};

export default TodoApp;
```

### 3. 전체 선택/해제

```tsx
const toggleAll = () => {
  setTodos(prev => {
    const allCompleted = prev.every(t => t.completed);
    return prev.map(t => ({...t, completed: !allCompleted}));
  });
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
