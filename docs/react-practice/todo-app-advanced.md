# 컴포넌트 설계 실습: Todo 앱 리팩토링

[기본 Todo 앱](/docs/react-practice/todo-app)을 컴포넌트로 분리하여 유지보수성을 높이는 방법을 알아봅니다.

:::info 선수 학습
이 가이드를 학습하기 전에 먼저 [상태 관리 실습: Todo 앱](/docs/react-practice/todo-app)을 완료하세요.
:::

## 🎯 학습 목표

- 단일 컴포넌트를 여러 개로 분리하는 방법
- 컴포넌트 간 Props 전달
- 책임 분리 원칙 적용
- Context API로 Props Drilling 해결

## 📦 컴포넌트 분리 전략

### 기존 구조 (단일 컴포넌트)

기본 Todo 앱에서 만든 단일 컴포넌트 구조입니다:

```tsx
// ❌ 모든 로직이 하나의 컴포넌트에
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

  const addTodo = () => { /* ... */ };
  const toggleTodo = (id: number) => { /* ... */ };
  const deleteTodo = (id: number) => { /* ... */ };
  const startEdit = (id: number, text: string) => { /* ... */ };
  const saveEdit = (id: number) => { /* ... */ };
  const cancelEdit = () => { /* ... */ };

  return (
    <div className="container">
      <h1 className="title">📝 React Todo</h1>

      {/* 입력 폼 */}
      <div className="input-container">
        <input value={inputValue} onChange={...} />
        <button onClick={addTodo}>추가</button>
      </div>

      {/* Todo 리스트 */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input type="checkbox" checked={todo.completed} onChange={...} />
            {editingId === todo.id ? (
              /* 수정 모드 */
            ) : (
              /* 일반 모드 */
              <>
                <span>{todo.text}</span>
                <button onClick={() => startEdit(todo.id, todo.text)}>수정</button>
                <button onClick={() => deleteTodo(todo.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* 통계 */}
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

**문제점:**
- **코드가 길고 복잡함**: 150줄 이상의 코드가 한 파일에
- **재사용 불가능**: TodoItem, TodoInput 등을 다른 곳에서 사용 불가
- **테스트 어려움**: 전체 앱을 테스트해야 함
- **책임이 명확하지 않음**: 한 컴포넌트가 너무 많은 일을 담당
- **수정 기능 추가 시 복잡도 증가**: State가 4개로 늘어남

### 개선된 구조 (컴포넌트 분리)

```
TodoApp (상태 관리)
├── TodoInput (입력)
├── TodoList (리스트)
│   └── TodoItem (개별 항목)
└── TodoStats (통계)
```

## 🏗️ 컴포넌트 분리 구현

### 1. TodoInput (입력 컴포넌트)

할 일을 입력하고 추가하는 컴포넌트입니다.

```tsx title="TodoInput.tsx"
import { useState } from 'react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

const TodoInput = ({ onAdd }: TodoInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() === '') return;
    onAdd(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="할 일을 입력하세요..."
        className="input"
      />
      <button onClick={handleAdd} className="add-button">
        추가
      </button>
    </div>
  );
};

export default TodoInput;
```

**주요 포인트:**
- 자체 state로 입력값 관리
- Enter 키로도 추가 가능
- 빈 입력값 검증
- 추가 후 입력 필드 자동 초기화

### 2. TodoItem (개별 항목)

개별 할 일 항목을 표시하고 수정하는 컴포넌트입니다.

```tsx title="TodoItem.tsx"
import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete, onEdit }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim() === '') return;
    onEdit(todo.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="checkbox"
      />
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="edit-input"
            autoFocus
          />
          <button onClick={handleSave} className="save-button">
            저장
          </button>
          <button onClick={handleCancel} className="cancel-button">
            취소
          </button>
        </>
      ) : (
        <>
          <span className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="edit-button"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="delete-button"
          >
            삭제
          </button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```

**주요 포인트:**
- `isEditing` state로 수정 모드 관리
- Enter로 저장, Escape로 취소
- 수정 모드와 일반 모드를 조건부 렌더링
- `autoFocus`로 수정 시 자동 포커스

### 3. TodoList (리스트 컴포넌트)

Todo 항목들을 리스트로 표시하는 컴포넌트입니다.

```tsx title="TodoList.tsx"
import TodoItem from './TodoItem';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const TodoList = ({ todos, onToggle, onDelete, onEdit }: TodoListProps) => {
  if (todos.length === 0) {
    return <p className="empty-message">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};

export default TodoList;
```

**주요 포인트:**
- TodoItem 컴포넌트를 반복해서 렌더링
- 빈 리스트일 때 안내 메시지 표시
- Props를 TodoItem에 전달

### 4. TodoStats (통계 컴포넌트)

Todo 통계를 표시하는 컴포넌트입니다.

```tsx title="TodoStats.tsx"
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoStatsProps {
  todos: Todo[];
}

const TodoStats = ({ todos }: TodoStatsProps) => {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;

  return (
    <div className="stats">
      <span>전체: {total}</span>
      <span>완료: {completed}</span>
      <span>미완료: {remaining}</span>
    </div>
  );
};

export default TodoStats;
```

**주요 포인트:**
- todos 배열에서 통계 계산
- filter로 완료된 항목 수 계산
- 단순한 표시 전용 컴포넌트 (Presentational Component)

### 5. TodoApp (메인 컴포넌트)

전체 앱을 통합하고 상태를 관리하는 메인 컴포넌트입니다.

```tsx title="TodoApp.tsx"
import { useState } from 'react';
import './TodoApp.css';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import TodoStats from './TodoStats';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  return (
    <div className="container">
      <h1 className="title">📝 React Todo</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />
      <TodoStats todos={todos} />
    </div>
  );
};

export default TodoApp;
```

**주요 포인트:**
- 모든 상태를 한 곳에서 관리 (Single Source of Truth)
- 함수형 업데이트로 안전한 상태 변경
- 자식 컴포넌트에 필요한 함수만 전달
- 책임이 명확하게 분리됨

## 🔄 Context API로 Props Drilling 해결

여러 단계로 Props를 전달하는 대신 Context API를 사용할 수 있습니다.

```tsx title="TodoContext.tsx"
import { createContext, useContext, useState, type ReactNode } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, newText: string) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

// Provider 컴포넌트
export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, editTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

// Custom Hook으로 편리하게 사용
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos는 TodoProvider 안에서 사용해야 합니다');
  }
  return context;
};

export default TodoProvider;
```

**컴포넌트에서 사용:**

```tsx title="TodoInput.tsx (Context 버전)"
import { useState } from 'react';
import { useTodos } from './TodoContext';

const TodoInput = () => {
  const { addTodo } = useTodos();  // Props 없이 직접 접근!
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() === '') return;
    addTodo(inputValue);
    setInputValue('');
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="할 일을 입력하세요..."
        className="input"
      />
      <button onClick={handleAdd} className="add-button">
        추가
      </button>
    </div>
  );
};

export default TodoInput;
```

```tsx title="App.tsx (Context 사용)"
import { TodoProvider } from './TodoContext';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import TodoStats from './TodoStats';
import './TodoApp.css';

const App = () => {
  return (
    <TodoProvider>
      <div className="container">
        <h1 className="title">📝 React Todo</h1>
        <TodoInput />
        <TodoList />
        <TodoStats />
      </div>
    </TodoProvider>
  );
};

export default App;
```

## 📊 분리 전후 비교

| 항목 | 분리 전 | 분리 후 | Context API 사용 |
|-----|---------|---------|----------------|
| **파일 수** | 1개 | 5개 | 6개 (Context 추가) |
| **코드 길이** | ~150줄 | 각 ~30-50줄 | 각 ~30-50줄 |
| **재사용성** | 불가능 | 가능 | 가능 |
| **테스트** | 어려움 | 쉬움 | 쉬움 |
| **유지보수** | 어려움 | 쉬움 | 쉬움 |
| **Props 전달** | - | 필요 | 불필요 |
| **학습 난이도** | 쉬움 | 보통 | 높음 |

## 💡 어떤 방식을 선택해야 할까?

### Props 전달 방식
**장점:**
- 데이터 흐름이 명확함
- 컴포넌트가 독립적
- 디버깅이 쉬움

**단점:**
- Props Drilling 발생 가능
- 중간 컴포넌트가 불필요한 Props 전달

**추천 상황:**
- 컴포넌트 깊이가 2-3단계 이내
- 소규모 프로젝트
- 명확한 데이터 흐름이 중요한 경우

### Context API 방식
**장점:**
- Props Drilling 해결
- 전역 상태 관리
- 코드가 간결해짐

**단점:**
- 컴포넌트가 Context에 의존적
- 재사용성이 떨어질 수 있음
- 성능 최적화 주의 필요

**추천 상황:**
- 컴포넌트 깊이가 깊음 (4단계 이상)
- 여러 곳에서 같은 데이터 필요
- 전역 상태가 필요한 경우

## 🎯 학습 정리

### 핵심 개념

1. **컴포넌트 분리 원칙**
   - 단일 책임 원칙 (Single Responsibility)
   - 재사용 가능한 작은 단위로 분리
   - 각 컴포넌트는 하나의 역할만 수행

2. **Props 전달**
   - 부모 → 자식으로 데이터 전달
   - 콜백 함수로 이벤트 처리
   - 함수형 업데이트로 안전한 상태 변경

3. **Context API**
   - Provider로 상태 제공
   - useContext로 상태 소비
   - Custom Hook으로 편리한 사용

### 다음 단계

1. **상태 관리 라이브러리**: Redux, Zustand, Recoil
2. **성능 최적화**: React.memo, useMemo, useCallback
3. **테스트**: Jest, React Testing Library
4. **타입 안전성**: TypeScript 심화


## 🔧 추가 개선 아이디어

컴포넌트 분리를 완료한 후 추가할 수 있는 기능들입니다.

### 1. LocalStorage 연동

```tsx
import { useState, useEffect } from 'react';

const TodoApp = () => {
  // 초기값을 localStorage에서 로드
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  // todos가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // ... 나머지 코드
};
```

### 2. 필터링 기능

```tsx
type FilterType = 'all' | 'active' | 'completed';

const TodoApp = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <>
      <TodoList todos={filteredTodos} ... />
      <div className="filters">
        <button onClick={() => setFilter('all')}>전체</button>
        <button onClick={() => setFilter('active')}>진행중</button>
        <button onClick={() => setFilter('completed')}>완료</button>
      </div>
    </>
  );
};
```

### 3. 드래그 앤 드롭으로 순서 변경

```tsx
// react-beautiful-dnd 라이브러리 사용
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TodoList = ({ todos, onReorder }: TodoListProps) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps}>
            {todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={String(todo.id)} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TodoItem todo={todo} ... />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

### 4. 전체 선택/해제

```tsx
const TodoApp = () => {
  const toggleAll = () => {
    const allCompleted = todos.every(t => t.completed);
    setTodos(prev => prev.map(t => ({...t, completed: !allCompleted})));
  };

  return (
    <>
      <button onClick={toggleAll}>
        {todos.every(t => t.completed) ? '전체 해제' : '전체 선택'}
      </button>
      {/* ... */}
    </>
  );
};
```

## 📚 정리

### 컴포넌트 분리의 핵심

1. **단일 책임 원칙**
   - 각 컴포넌트는 하나의 역할만 수행
   - TodoInput: 입력만, TodoItem: 항목 표시만

2. **재사용 가능성**
   - TodoItem은 다른 곳에서도 사용 가능
   - Props로 동작을 주입받음

3. **테스트 용이성**
   - 각 컴포넌트를 독립적으로 테스트
   - Mock Props로 쉽게 테스트 가능

4. **유지보수성**
   - 수정할 곳이 명확함
   - 영향 범위가 제한적

### Props vs Context 선택 가이드

**Props 사용이 좋은 경우:**
- 컴포넌트 계층이 얕을 때 (2-3단계)
- 데이터 흐름이 명확해야 할 때
- 컴포넌트 재사용성이 중요할 때

**Context 사용이 좋은 경우:**
- 컴포넌트 계층이 깊을 때 (4단계 이상)
- 전역적으로 필요한 데이터 (테마, 사용자 정보 등)
- Props Drilling이 심각할 때

## 🎯 다음 학습 단계

1. **상태 관리 라이브러리**
   - [Redux Toolkit](https://redux-toolkit.js.org/)
   - [Zustand](https://zustand-demo.pmnd.rs/)
   - [Recoil](https://recoiljs.org/)

2. **성능 최적화**
   - [React.memo](/docs/react-basics/rendering-optimization)
   - [useMemo, useCallback](/docs/react-hooks/usememo)

3. **테스팅**
   - Jest + React Testing Library
   - 단위 테스트, 통합 테스트

4. **고급 패턴**
   - [Custom Hooks](/docs/react-hooks/custom-hooks)
   - [useReducer](/docs/react-hooks/usereducer)
   - Compound Components
   - Render Props

## 📖 참고 자료

- [React 공식 문서 - Thinking in React](https://react.dev/learn/thinking-in-react)
- [React 공식 문서 - Context](https://react.dev/reference/react/useContext)
- [React 디자인 패턴](https://www.patterns.dev/react)
