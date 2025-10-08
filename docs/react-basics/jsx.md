# JSX 문법

JSX는 JavaScript XML의 약자로, JavaScript 안에서 HTML과 유사한 문법을 사용할 수 있게 해줍니다.

## 📝 기본 문법

### JSX 표현식

중괄호 `{}`를 사용하여 JavaScript 표현식을 삽입할 수 있습니다.

```tsx
const name = '강북 스터디';
const element = <h1>안녕하세요, {name}!</h1>;
```

### JSX는 표현식입니다

JSX도 JavaScript 표현식이므로 변수에 할당하거나 함수에서 반환할 수 있습니다.

```tsx
const getGreeting = (user) => {
  if (user) {
    return <h1>안녕하세요, {user.name}님!</h1>;
  }
  return <h1>안녕하세요, 방문자님!</h1>;
}
```

## 🎨 JSX 속성

### HTML 속성과의 차이

JSX에서는 `camelCase`를 사용합니다:

```tsx
// ❌ HTML
<div class="container" onclick="handleClick()">

// ✅ JSX
<div className="container" onClick={handleClick}>
```

### 동적 속성

```tsx
const imageUrl = 'logo.png';
const element = <img src={imageUrl} alt="로고" />;
```

## 🔄 JSX 자식

### 여러 자식 요소

```tsx
const element = (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);
```

### 자식이 없는 태그

자식이 없는 태그는 `/>` 로 닫아야 합니다:

```tsx
const element = <img src="logo.png" />;
```

## ⚠️ JSX 주의사항

### 1. 하나의 부모 요소

JSX는 반드시 **하나의 부모 요소**로 감싸야 합니다:

```tsx
// ❌ 잘못된 예
return (
  <h1>제목</h1>
  <p>내용</p>
);

// ✅ 올바른 예
return (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);

// ✅ Fragment 사용
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);
```

### 2. JavaScript 예약어

`class` 대신 `className`, `for` 대신 `htmlFor` 사용:

```tsx
<label htmlFor="name" className="label">
  이름
</label>
```

### 3. 인라인 스타일

객체 형태로 작성하며, CSS 속성은 camelCase:

```tsx
const style = {
  backgroundColor: 'blue',
  fontSize: '16px'
};

<div style={style}>스타일 적용</div>
```

## 💡 조건부 렌더링

### 삼항 연산자

```tsx
{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}
```

### 논리 AND 연산자

```tsx
{messages.length > 0 && (
  <div>새 메시지가 {messages.length}개 있습니다.</div>
)}
```

## 📚 리스트 렌더링

`map()` 함수를 사용하여 배열을 JSX 요소로 변환:

```tsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => (
  <li key={number}>{number}</li>
));

return <ul>{listItems}</ul>;
```

**중요**: 각 항목에는 고유한 `key` prop이 필요합니다!

## 다음 단계

다음 장에서는 컴포넌트와 Props에 대해 알아보겠습니다.
