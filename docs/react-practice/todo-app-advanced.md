# Todo 앱 컴포넌트 분리

기본 Todo 앱을 컴포넌트로 분리하여 유지보수성을 높이는 방법을 알아봅니다.

## 🎯 학습 목표

- 단일 컴포넌트를 여러 개로 분리하는 방법
- 컴포넌트 간 Props 전달
- 책임 분리 원칙 적용
- Context API로 Props Drilling 해결

## 📦 컴포넌트 분리 전략

### 기존 구조 (단일 컴포넌트)

```tsx
// ❌ 모든 로직이 하나의 컴포넌트에
const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => { ... };
  const toggleTodo = (id) => { ... };
  const deleteTodo = (id) => { ... };

  return (
    <div>
      {/* 입력 폼 */}
      <input value={inputValue} onChange={...} />
      <button onClick={addTodo}>추가</button>

      {/* Todo 리스트 */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.completed} onChange={...} />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>삭제</button>
          </li>
        ))}
      </ul>

      {/* 통계 */}
      <div>
        <span>전체: {todos.length}</span>
        <span>완료: {todos.filter(t => t.completed).length}</span>
      </div>
    </div>
  );
}
```

**문제점:**
- 코드가 길고 복잡함
- 재사용 불가능
- 테스트 어려움
- 책임이 명확하지 않음

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

```tsx
type TodoInputProps = {
  onAdd: (text: string) => void;
}

const TodoInput = ({ onAdd }: TodoInputProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="할 일을 입력하세요"
      />
      <button type="submit">추가</button>
    </form>
  );
}
```

### 2. TodoItem (개별 항목)

```tsx
type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
}
```

### 3. TodoList (리스트 컴포넌트)

```tsx
type TodoListProps = {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList = ({ todos, onToggle, onDelete }: TodoListProps) => {
  if (todos.length === 0) {
    return <p>할 일이 없습니다!</p>;
  }

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
```

### 4. TodoStats (통계 컴포넌트)

```tsx
type TodoStatsProps = {
  todos: Todo[];
}

const TodoStats = ({ todos }: TodoStatsProps) => {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;

  return (
    <div>
      <span>전체: {total}</span> |
      <span>완료: {completed}</span> |
      <span>미완료: {remaining}</span>
    </div>
  );
}
```

### 5. TodoApp (메인 컴포넌트)

```tsx
const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <h1>Todo 앱</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      <TodoStats todos={todos} />
    </div>
  );
}
```

## 🔄 Context API로 Props Drilling 해결

Props를 여러 단계로 전달하지 않고 Context 사용:

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type TodoContextType = {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

// Provider
export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

// Custom Hook
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos는 TodoProvider 안에서 사용해야 합니다');
  }
  return context;
}

// 사용
const TodoInput = () => {
  const { addTodo } = useTodos();  // Props 없이 직접 접근!
  // ...
}

const TodoList = () => {
  const { todos, toggleTodo, deleteTodo } = useTodos();
  // ...
}

const App = () => {
  return (
    <TodoProvider>
      <TodoInput />
      <TodoList />
      <TodoStats />
    </TodoProvider>
  );
}
```

## 📊 분리 전후 비교

| 항목 | 분리 전 | 분리 후 |
|-----|---------|---------|
| **파일 수** | 1개 | 5개 |
| **코드 길이** | ~150줄 | 각 ~30줄 |
| **재사용성** | 불가능 | 가능 |
| **테스트** | 어려움 | 쉬움 |
| **유지보수** | 어려움 | 쉬움 |

## 📚 정리

### 컴포넌트 분리 기준

1. **UI 단위로 분리**: 입력, 리스트, 항목, 통계
2. **책임별로 분리**: 각 컴포넌트는 하나의 역할만
3. **재사용 가능하게**: TodoItem은 다른 곳에서도 사용 가능

### 장점

- ✅ 코드 가독성 향상
- ✅ 재사용 가능
- ✅ 테스트 용이
- ✅ 유지보수 쉬움
- ✅ 여러 명이 동시 작업 가능

## 다음 단계

더 깊은 학습을 원한다면:
- [useReducer로 상태 관리](/docs/react-hooks/usereducer)
- [Custom Hooks 만들기](/docs/react-hooks/custom-hooks)
