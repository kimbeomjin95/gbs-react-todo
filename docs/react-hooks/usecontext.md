# useContext Hook

useContext는 Context를 통해 전역 상태를 관리하는 Hook입니다.

## 🎯 Context란?

Props를 여러 단계를 거쳐 전달하지 않고, **컴포넌트 트리 전체에 데이터를 제공**합니다.

## 📝 기본 사용법

### 1. Context 생성

```tsx
import { createContext } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);
```

### 2. Provider로 값 제공

```tsx
const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}
```

### 3. useContext로 값 사용

```tsx
import { useContext } from 'react';

const Header = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('ThemeContext 없음!');
  }

  const { theme, toggleTheme } = context;

  return (
    <header style={{ background: theme === 'light' ? '#fff' : '#000' }}>
      <button onClick={toggleTheme}>테마 변경</button>
    </header>
  );
}
```

## 💡 실전 예제

### 사용자 인증

```tsx
type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook으로 편리하게 사용
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다');
  }
  return context;
}

// 사용
const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>{user?.name}</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

### 장바구니

```tsx
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CartProvider = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider 필요');
  return context;
}
```

## ⚠️ 주의사항

### 1. Provider 밖에서 사용 시 에러

```tsx
const Component = () => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error('Provider 안에서 사용하세요');
  }

  return <div>...</div>;
}
```

### 2. Context 값이 변경되면 모든 소비자가 리렌더링

```tsx
// ❌ 객체를 매번 새로 생성
<MyContext.Provider value={{ data, setData }}>

// ✅ useMemo로 참조 유지
const value = useMemo(() => ({ data, setData }), [data]);
<MyContext.Provider value={value}>
```

## 📚 정리

- **목적**: 전역 상태 관리, Props Drilling 방지
- **사용**: createContext → Provider → useContext
- **패턴**: Custom Hook으로 편리하게 사용

## 다음 단계

다음 장에서는 [useReducer Hook](/docs/react-hooks/usereducer)에 대해 알아보겠습니다.
