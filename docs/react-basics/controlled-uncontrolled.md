# Controlled vs Uncontrolled Components

Form 요소를 제어하는 두 가지 방식에 대해 알아봅니다.

## 🎯 두 가지 Form 제어 방식

React에서 `<input>`, `<textarea>`, `<select>` 같은 form 요소를 다루는 방법은 크게 두 가지입니다.

## 🎮 Controlled Components (제어 컴포넌트)

React state가 **"Single Source of Truth"**(유일한 진실의 원천)가 되는 방식입니다.

### 기본 개념

```tsx
import { useState } from 'react';

const ControlledInput = () => {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}           // State가 값을 제어
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default ControlledInput;
```

**데이터 흐름:**
```
1. 사용자가 input에 타이핑
2. onChange 이벤트 발생
3. setValue로 state 업데이트
4. state 변경으로 리렌더링
5. 새로운 value로 input 업데이트
```

### 장점

**1. 즉각적인 유효성 검사**

```tsx
import { useState } from 'react';

const EmailInput = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // 실시간 유효성 검사
    if (!newEmail.includes('@')) {
      setError('@ 기호가 필요합니다');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};

export default EmailInput;
```

**2. 입력값 포매팅**

```tsx
import { useState } from 'react';

const PhoneInput = () => {
  const [phone, setPhone] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만
    const formatted = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    setPhone(formatted);
  };

  return <input value={phone} onChange={handleChange} />;
};

export default PhoneInput;
```

**3. 조건부 입력 차단**

```tsx
import { useState } from 'react';

const MaxLengthInput = () => {
  const [text, setText] = useState('');
  const maxLength = 10;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setText(newValue);
    }
  };

  return (
    <div>
      <input value={text} onChange={handleChange} />
      <p>{text.length} / {maxLength}</p>
    </div>
  );
};

export default MaxLengthInput;
```

**4. 동적 입력 변환**

```tsx
import { useState } from 'react';

const UpperCaseInput = () => {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value.toUpperCase());
  };

  return <input value={text} onChange={handleChange} />;
};

export default UpperCaseInput;
```

### Controlled Form 예제

```tsx
import { useState } from 'react';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('제출:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="사용자명"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="비밀번호"
      />
      <label>
        <input
          name="agreeToTerms"
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={handleChange}
        />
        약관에 동의합니다
      </label>
      <button type="submit">가입</button>
    </form>
  );
};

export default SignupForm;
```

## 🆓 Uncontrolled Components (비제어 컴포넌트)

DOM이 **자체적으로** 값을 관리하고, `ref`로 필요할 때만 값을 가져오는 방식입니다.

### 기본 개념

```tsx
import { useRef } from 'react';

const UncontrolledInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    // 필요할 때만 DOM에서 값 가져오기
    console.log(inputRef.current?.value);
  };

  return (
    <div>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
};

export default UncontrolledInput;
```

**주요 차이점:**
- `value` 대신 `defaultValue` 사용
- `onChange` 없이 ref로 접근
- State 없음

### 장점

**1. 간단한 구현**

```tsx
import { useRef } from 'react';

const SimpleForm = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name: nameRef.current?.value,
      email: emailRef.current?.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <input ref={emailRef} type="email" defaultValue="" />
      <button>제출</button>
    </form>
  );
};

export default SimpleForm;
```

**2. 성능 (불필요한 리렌더링 없음)**

```tsx
import { useRef } from 'react';

const PerformanceExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 타이핑해도 리렌더링 발생하지 않음
  console.log('렌더링');

  return <input ref={inputRef} />;
};

export default PerformanceExample;
```

**3. 파일 입력**

파일 input은 보안상 제어할 수 없으므로 항상 Uncontrolled:

```tsx
import { useRef } from 'react';

const FileUpload = () => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      console.log('파일:', file.name);
    }
  };

  return (
    <div>
      <input type="file" ref={fileRef} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
};

export default FileUpload;
```

### defaultValue vs value

```tsx
import { useRef, useState } from 'react';

const InputComparison = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState('');

  const handleChange = (e) => setState(e.target.value);

  return (
    <div>
      {/* ❌ Uncontrolled인데 value 사용 */}
      <input ref={ref} value="고정값" />  {/* 읽기 전용이 됨 */}

      {/* ✅ Uncontrolled에는 defaultValue */}
      <input ref={ref} defaultValue="초기값" />  {/* 사용자가 변경 가능 */}

      {/* ✅ Controlled는 value + onChange */}
      <input value={state} onChange={handleChange} />
    </div>
  );
};

export default InputComparison;
```

## ⚖️ 비교

| 특징 | Controlled | Uncontrolled |
|------|-----------|--------------|
| **값 저장** | State | DOM |
| **값 접근** | 항상 가능 | 필요할 때만 (ref) |
| **리렌더링** | 입력마다 | 없음 |
| **유효성 검사** | 실시간 가능 | 제출 시에만 |
| **코드량** | 많음 | 적음 |
| **React 방식** | ✅ 권장 | 특수 경우만 |

## 📊 언제 무엇을 사용할까?

### Controlled Components 사용

✅ **대부분의 경우 권장됩니다**

- 실시간 유효성 검사 필요
- 입력값 포매팅 (전화번호, 카드번호 등)
- 조건부 입력 차단
- 동적 폼 (입력값에 따라 다른 필드 표시)
- 제출 전 입력값 미리보기
- 자동 완성 기능
- 복잡한 폼 로직

### Uncontrolled Components 사용

✅ **특수한 경우에만**

- 매우 간단한 폼 (이름 하나만 받기 등)
- 파일 업로드
- 서드파티 라이브러리 통합
- 성능이 중요하고 실시간 검증이 불필요한 경우
- 비-React 코드와 통합할 때

## 💡 실전 패턴

### Controlled + useReducer (복잡한 폼)

```tsx
import { useReducer } from 'react';

type FormState = {
  username: string;
  email: string;
  password: string;
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { username: '', email: '', password: '' };
    default:
      return state;
  }
};

const ComplexForm = () => {
  const [state, dispatch] = useReducer(formReducer, {
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (field: keyof FormState) => (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  };

  return (
    <form>
      <input value={state.username} onChange={handleChange('username')} />
      <input value={state.email} onChange={handleChange('email')} />
      <input value={state.password} onChange={handleChange('password')} />
      <button onClick={() => dispatch({ type: 'RESET' })}>초기화</button>
    </form>
  );
};

export default ComplexForm;
```

### React Hook Form (라이브러리 추천)

복잡한 폼은 라이브러리 사용 권장:

```tsx
import { useForm } from 'react-hook-form';

const HookForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: true })} />
      {errors.username && <span>필수 항목입니다</span>}

      <input {...register('email', { pattern: /^\S+@\S+$/i })} />
      {errors.email && <span>올바른 이메일을 입력하세요</span>}

      <button>제출</button>
    </form>
  );
};

export default HookForm;
```

## 📚 정리

1. **기본은 Controlled**: React state로 관리
2. **특수한 경우만 Uncontrolled**: ref 사용
3. **복잡한 폼**: useReducer 또는 React Hook Form
4. **파일 업로드**: 항상 Uncontrolled

## 다음 단계

다음 장에서는 [렌더링과 리렌더링](/docs/react-basics/rendering)에 대해 알아보겠습니다.
