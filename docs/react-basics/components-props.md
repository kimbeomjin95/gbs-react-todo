# 컴포넌트와 Props

컴포넌트는 UI를 독립적이고 재사용 가능한 조각으로 나눕니다. Props는 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다.

## 📦 컴포넌트 정의

### 함수형 컴포넌트

가장 간단한 컴포넌트 정의 방법입니다:

```tsx
const Welcome = () => {
  return <h1>안녕하세요!</h1>;
}
```

### TypeScript와 함께 사용

```tsx
import type { ReactNode } from 'react';

const Welcome = (): ReactNode => {
  return <h1>안녕하세요!</h1>;
}
```

## 🎁 Props 사용하기

### Props 전달

```tsx
const Welcome = (props) => {
  return <h1>안녕하세요, {props.name}님!</h1>;
}

// 사용
<Welcome name="강북" />
```

### TypeScript Props 타입 정의

```tsx
type WelcomeProps = {
  name: string;
  age?: number; // 선택적 prop
};

const Welcome = ({ name, age }: WelcomeProps): ReactNode => {
  return (
    <div>
      <h1>안녕하세요, {name}님!</h1>
      {age && <p>나이: {age}세</p>}
    </div>
  );
}
```

### 구조 분해 할당

Props를 더 간결하게 사용할 수 있습니다:

```tsx
// ❌ 반복적인 props
const Welcome = (props) => {
  return <h1>안녕하세요, {props.name}님!</h1>;
}

// ✅ 구조 분해 할당
const Welcome = ({ name }) => {
  return <h1>안녕하세요, {name}님!</h1>;
}
```

## 🧩 컴포넌트 합성

컴포넌트 안에서 다른 컴포넌트를 사용할 수 있습니다:

```tsx
const Welcome = ({ name }) => {
  return <h1>안녕하세요, {name}님!</h1>;
}

const App = () => {
  return (
    <div>
      <Welcome name="강북" />
      <Welcome name="스터디" />
      <Welcome name="React" />
    </div>
  );
}
```

## 🔒 Props는 읽기 전용

컴포넌트는 **절대 자신의 Props를 수정해서는 안 됩니다**:

```tsx
// ❌ 잘못된 예
const Welcome = ({ name }) => {
  name = 'Modified'; // 이렇게 하면 안 됩니다!
  return <h1>안녕하세요, {name}님!</h1>;
}

// ✅ 올바른 예 (새 변수 사용)
const Welcome = ({ name }) => {
  const greeting = `${name}님, 환영합니다`;
  return <h1>{greeting}</h1>;
}
```

## 🌊 Props Drilling 문제

컴포넌트가 깊게 중첩되면 Props 전달이 불편해집니다.

### Props Drilling이란?

Props를 여러 단계의 컴포넌트를 거쳐 전달해야 하는 상황입니다:

```tsx
// 최상위 컴포넌트
const App = () => {
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  return <Dashboard user={user} />;
}

// 중간 컴포넌트 (user를 사용하지 않지만 전달만 함)
const Dashboard = ({ user }) => {
  return (
    <div>
      <Header user={user} />
      <Sidebar user={user} />
    </div>
  );
}

// 또 다른 중간 컴포넌트
const Header = ({ user }) => {
  return (
    <div>
      <Navigation />
      <UserMenu user={user} />
    </div>
  );
}

// 최종적으로 user를 사용하는 컴포넌트
const UserMenu = ({ user }) => {
  return <div>안녕하세요, {user.name}님</div>;
}
```

**문제점:**
```
App (user 소유)
  ↓ props로 전달
Dashboard (user 사용 안 함, 전달만)
  ↓ props로 전달
Header (user 사용 안 함, 전달만)
  ↓ props로 전달
UserMenu (user 최종 사용)
```

- 중간 컴포넌트들이 불필요하게 Props를 전달
- Props 이름 변경 시 모든 컴포넌트 수정 필요
- 코드 가독성 저하

### 해결 방법

**1. 컴포넌트 구조 재설계**

필요한 곳에서만 데이터를 관리:

```tsx
const Dashboard = () => {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  );
}

const Header = () => {
  // Header에서 user state 관리
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  return (
    <div>
      <Navigation />
      <UserMenu user={user} />
    </div>
  );
}
```

**2. Context API 사용**

전역 상태처럼 사용 (자세한 내용은 [useContext](/docs/react-hooks/usecontext) 참고):

```tsx
import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

// 커스텀 훅으로 Context 접근
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser는 UserContext.Provider 내부에서 사용되어야 합니다');
  }
  return context;
};

const App = () => {
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  return (
    <UserContext.Provider value={user}>
      <Dashboard />
    </UserContext.Provider>
  );
}

const Dashboard = () => {
  // user props 전달 불필요
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  );
}

const UserMenu = () => {
  // 커스텀 훅으로 user에 접근
  const user = useUser();
  return <div>안녕하세요, {user.name}님</div>;
}
```

**3. children prop 활용**

컴포넌트 합성(Composition) 패턴:

```tsx
const App = () => {
  const [user, setUser] = useState({ name: '김철수', age: 25 });

  return (
    <Dashboard>
      <Header>
        <UserMenu user={user} />
      </Header>
    </Dashboard>
  );
}

// Dashboard와 Header는 user를 몰라도 됨
const Dashboard = ({ children }) => {
  return <div>{children}</div>;
}

const Header = ({ children }) => {
  return <div>{children}</div>;
}

const UserMenu = ({ user }) => {
  return <div>안녕하세요, {user.name}님</div>;
}
```

### 언제 Props Drilling이 문제가 되나?

**괜찮은 경우:**
- 2-3 단계 정도의 얕은 컴포넌트 트리
- Props가 중간 컴포넌트에서도 사용되는 경우

**문제가 되는 경우:**
- 5단계 이상의 깊은 컴포넌트 트리
- 중간 컴포넌트가 Props를 사용하지 않고 전달만 하는 경우
- 여러 Props를 동시에 전달해야 하는 경우

**해결 기준:**
- 3단계 이상: **children prop** 또는 **컴포넌트 재구성** 고려
- 전역적으로 필요: **Context API** 사용
- 복잡한 전역 상태: **Zustand** 같은 상태 관리 라이브러리 고려

## 🎨 Children Props

컴포넌트 사이에 있는 내용을 `children` prop으로 받을 수 있습니다:

```tsx
type CardProps = {
  title: string;
  children: ReactNode;
};

const Card = ({ title, children }: CardProps) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// 사용
<Card title="제목">
  <p>여기는 children입니다!</p>
  <button>버튼</button>
</Card>
```

## 💡 기본값 설정

Props의 기본값을 설정할 수 있습니다:

```tsx
type ButtonProps = {
  text: string;
  color?: string;
};

const Button = ({ text, color = 'blue' }: ButtonProps) => {
  return <button style={{ color }}>{text}</button>;
}

// color를 전달하지 않으면 'blue'가 사용됨
<Button text="클릭" />
```

## 🔄 Props로 함수 전달

이벤트 핸들러도 Props로 전달할 수 있습니다:

```tsx
type ButtonProps = {
  text: string;
  onClick: () => void;
};

const Button = ({ text, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{text}</button>;
}

// 사용
const App = () => {
  const handleClick = () => {
    alert('클릭됨!');
  };

  return <Button text="클릭하세요" onClick={handleClick} />;
}
```

## 📋 실전 예제

```tsx
type UserCardProps = {
  name: string;
  email: string;
  avatar?: string;
  onEdit: () => void;
};

const UserCard = ({ name, email, avatar, onEdit }: UserCardProps) => {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} />}
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>수정</button>
    </div>
  );
}

// 사용
<UserCard
  name="김철수"
  email="chulsoo@example.com"
  avatar="/avatar.jpg"
  onEdit={() => console.log('수정 클릭')}
/>
```

## 다음 단계

다음 장에서는 State와 useState Hook에 대해 알아보겠습니다.
