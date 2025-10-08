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
