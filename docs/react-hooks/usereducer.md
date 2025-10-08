# useReducer Hook

useReducer는 복잡한 상태 로직을 관리하는 Hook입니다.

## 🎯 useReducer란?

`useReducer`는 useState의 대안으로, **복잡한 상태 업데이트 로직**을 관리합니다.

## 📝 기본 사용법

```tsx
import { useReducer } from 'react';

type State = {
  count: number;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
};

const Counter = () => {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

## 💡 Todo 앱 예제

```tsx
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type State = {
  todos: Todo[];
};

type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'delete'; id: number };

const todoReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'add':
      return {
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.text, completed: false }
        ]
      };
    case 'toggle':
      return {
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'delete':
      return {
        todos: state.todos.filter(todo => todo.id !== action.id)
      };
    default:
      return state;
  }
};

const TodoApp = () => {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] });
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim()) {
      dispatch({ type: 'add', text });
      setText('');
    }
  };

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAdd}>추가</button>
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', id: todo.id })}
            />
            <span>{todo.text}</span>
            <button onClick={() => dispatch({ type: 'delete', id: todo.id })}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🔍 useState vs useReducer

### useState 사용

```tsx
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [email, setEmail] = useState('');
```

### useReducer 사용

```tsx
const [state, dispatch] = useReducer(reducer, {
  count: 0,
  name: '',
  email: ''
});
```

## 📊 언제 useReducer를 사용하나?

### useState 사용

- ✅ 단순한 상태 (boolean, number, string)
- ✅ 독립적인 상태 업데이트

### useReducer 사용

- ✅ 복잡한 상태 로직
- ✅ 여러 상태가 연관되어 있을 때
- ✅ 상태 업데이트 로직을 컴포넌트 밖으로 분리하고 싶을 때

## 💡 Context와 함께 사용

```tsx
type AppState = {
  user: User | null;
  theme: 'light' | 'dark';
};

type AppAction =
  | { type: 'login'; user: User }
  | { type: 'logout' }
  | { type: 'toggleTheme' };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider 필요');
  return context;
}
```

## 📚 정리

- **목적**: 복잡한 상태 로직 관리
- **언제**: 여러 상태가 연관, 복잡한 업데이트 로직
- **패턴**: reducer + dispatch로 예측 가능한 상태 관리

## 다음 단계

모든 Hook을 학습했습니다! [React 실습](/docs/react-practice/todo-app)으로 이동하여 배운 내용을 활용해보세요!
