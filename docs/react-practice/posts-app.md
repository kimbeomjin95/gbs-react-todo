# API 연동 실습: 게시글 앱

useEffect Hook을 활용하여 실제 API에서 데이터를 가져오고 표시하는 애플리케이션을 만들어봅니다.

:::info 선수 학습
이 가이드를 학습하기 전에 먼저 [useEffect Hook](/docs/react-basics/useeffect)을 완료하세요.
:::

## 🎯 학습 목표

이 가이드를 통해 다음을 배울 수 있습니다:

- useEffect로 API 데이터 가져오기
- 로딩 상태와 에러 상태 관리
- 의존성 배열 활용하기
- 목록과 상세 화면 전환
- async/await 패턴 사용

## 🌐 완성 예제

실제 API(JSONPlaceholder)를 사용해서 게시글을 가져오고 표시합니다.

### 주요 기능

1. **게시글 목록** - 컴포넌트 마운트 시 10개 불러오기
2. **게시글 상세** - 클릭한 게시글의 상세 정보 표시
3. **로딩 상태** - 데이터 로드 중 표시
4. **에러 처리** - 오류 발생 시 메시지 표시
5. **화면 전환** - 목록 ↔ 상세 화면

## 📦 완성본 코드

### 파일 구조

```
src/
├── components/
│   ├── PostList.tsx      # 목록 컴포넌트
│   └── PostDetail.tsx    # 상세 컴포넌트
└── PostsApp.tsx          # 메인 컴포넌트 (상태 관리)
```

### 1. PostList.tsx (목록 컴포넌트)

```tsx title="src/components/PostList.tsx"
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface PostListProps {
  posts: Post[];
  loading: boolean;
  onPostClick: (postId: number) => void;
}

const PostList = ({ posts, loading, onPostClick }: PostListProps) => {
  return (
    <div style={styles.container}>
      <h1>게시글 목록</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <ul style={styles.list}>
          {posts.map(post => (
            <li
              key={post.id}
              onClick={() => onPostClick(post.id)}
              style={styles.listItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8e8e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
            >
              <h3 style={styles.title}>
                {post.id}. {post.title}
              </h3>
              <p style={styles.excerpt}>
                {post.body.substring(0, 100)}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#000',
  },
  excerpt: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
};

export default PostList;
```

**주요 포인트:**
- Props로 데이터와 이벤트 핸들러 받음
- 목록 표시에만 집중
- 로딩 상태 조건부 렌더링

### 2. PostDetail.tsx (상세 컴포넌트)

```tsx title="src/components/PostDetail.tsx"
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface PostDetailProps {
  post: Post | null;
  loading: boolean;
  onBack: () => void;
}

const PostDetail = ({ post, loading, onBack }: PostDetailProps) => {
  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← 목록으로 돌아가기
      </button>

      {loading ? (
        <p>로딩 중...</p>
      ) : post ? (
        <div>
          <h1 style={styles.title}>{post.title}</h1>
          <p style={styles.meta}>
            게시글 ID: {post.id} | 작성자 ID: {post.userId}
          </p>
          <div style={styles.content}>
            {post.body}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  backButton: {
    padding: '10px 20px',
    marginBottom: '20px',
    backgroundColor: '#3578e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  title: {
    color: '#000',
  },
  meta: {
    color: '#666',
    marginBottom: '20px',
  },
  content: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    lineHeight: '1.6',
    color: '#000',
  },
};

export default PostDetail;
```

**주요 포인트:**
- Props로 게시글 데이터와 뒤로가기 핸들러 받음
- 상세 정보 표시에만 집중
- 로딩 상태 조건부 렌더링

### 3. PostsApp.tsx (메인 컴포넌트)

```tsx title="src/PostsApp.tsx"
import { useState, useEffect } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const PostsApp = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시글 목록 불러오기 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setPosts(data.slice(0, 10)); // 처음 10개만 표시
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  // 선택된 게시글 상세 정보 불러오기 (선택 변경 시마다)
  useEffect(() => {
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }

    const fetchPostDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${selectedPostId}`
        );
        if (!response.ok) {
          throw new Error('게시글 상세 정보를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setSelectedPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [selectedPostId]); // selectedPostId가 변경될 때마다 실행

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
  };

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>오류 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 목록 화면
  if (!selectedPostId) {
    return (
      <PostList
        posts={posts}
        loading={loading}
        onPostClick={handlePostClick}
      />
    );
  }

  // 상세 화면
  return (
    <PostDetail
      post={selectedPost}
      loading={loading}
      onBack={handleBackToList}
    />
  );
};

const styles = {
  errorContainer: {
    padding: '20px',
    color: 'red',
  },
};

export default PostsApp;
```

**주요 포인트:**
- 모든 상태를 메인 컴포넌트에서 관리
- useEffect로 API 호출
- 자식 컴포넌트에 Props 전달
- 화면 전환 로직

## 🏗️ 컴포넌트 분리 전략

### 왜 컴포넌트를 분리했나?

**분리 전 (단일 컴포넌트):**
- 한 파일에 모든 UI 로직
- JSX가 길고 복잡함
- 재사용 불가능

**분리 후 (3개 컴포넌트):**
- 각 컴포넌트가 명확한 책임
- 코드 가독성 향상
- PostList, PostDetail을 다른 곳에서도 사용 가능

### 컴포넌트 역할 분담

```
PostsApp (Container)
├─ 역할: 상태 관리, API 호출, 화면 전환
├─ State: posts, selectedPostId, selectedPost, loading, error
└─ useEffect: API 호출 로직

PostList (Presentational)
├─ 역할: 게시글 목록 표시
├─ Props: posts, loading, onPostClick
└─ UI만 담당 (상태 관리 없음)

PostDetail (Presentational)
├─ 역할: 게시글 상세 표시
├─ Props: post, loading, onBack
└─ UI만 담당 (상태 관리 없음)
```

### Container vs Presentational 패턴

**Container 컴포넌트 (PostsApp):**
- 데이터 로직 담당
- useEffect, useState 사용
- API 호출, 상태 관리
- 자식 컴포넌트에 데이터/함수 전달

**Presentational 컴포넌트 (PostList, PostDetail):**
- UI 렌더링만 담당
- Props로 데이터 받음
- 상태 없음 (또는 UI 상태만)
- 재사용 가능

### Props 전달 패턴

```tsx
// PostsApp → PostList
<PostList
  posts={posts}           // 데이터
  loading={loading}       // 상태
  onPostClick={handlePostClick}  // 이벤트 핸들러
/>

// PostsApp → PostDetail
<PostDetail
  post={selectedPost}     // 데이터
  loading={loading}       // 상태
  onBack={handleBackToList}  // 이벤트 핸들러
/>
```

## 💡 핵심 개념 설명

### 1. State 관리

```tsx
const [posts, setPosts] = useState<Post[]>([]);                    // 게시글 목록
const [selectedPostId, setSelectedPostId] = useState<number | null>(null);  // 선택된 ID
const [selectedPost, setSelectedPost] = useState<Post | null>(null);        // 선택된 게시글
const [loading, setLoading] = useState(false);                     // 로딩 상태
const [error, setError] = useState<string | null>(null);           // 에러 상태
```

**주요 포인트:**
- 5개의 독립적인 state로 각 관심사 분리
- TypeScript로 타입 안전성 보장
- `null` 타입으로 "선택 안 됨" 상태 표현

### 2. 목록 불러오기 (마운트 시 한 번만)

```tsx
useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setPosts(data.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행
```

**주요 포인트:**
- `async/await`로 비동기 처리
- `try-catch-finally`로 에러 처리
- `response.ok` 체크로 HTTP 에러 감지
- `finally`로 로딩 상태 항상 종료
- 의존성 배열 `[]`: 마운트 시 한 번만 실행

### 3. 상세 정보 불러오기 (ID 변경 시마다)

```tsx
useEffect(() => {
  if (!selectedPostId) {
    setSelectedPost(null);
    return;
  }

  const fetchPostDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${selectedPostId}`
      );
      if (!response.ok) {
        throw new Error('게시글 상세 정보를 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setSelectedPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  fetchPostDetail();
}, [selectedPostId]); // selectedPostId가 변경될 때마다 실행
```

**주요 포인트:**
- **Early return**: `selectedPostId`가 없으면 API 호출 안 함
- **의존성 배열** `[selectedPostId]`: 이 값이 변경될 때마다 실행
- **동적 URL**: 템플릿 리터럴로 ID를 URL에 포함
- 각 게시글 클릭 시 해당 상세 정보만 불러옴

### 4. 조건부 렌더링

```tsx
// 1. 에러 화면
if (error) {
  return <ErrorScreen />;
}

// 2. 목록 화면
if (!selectedPostId) {
  return <PostList />;
}

// 3. 상세 화면
return <PostDetail />;
```

**주요 포인트:**
- Guard 패턴으로 에러 우선 처리
- `selectedPostId` 유무로 목록/상세 전환
- 각 화면이 독립적으로 렌더링

### 5. 이벤트 핸들러

```tsx
const handlePostClick = (postId: number) => {
  setSelectedPostId(postId);  // 상세 화면으로 전환
};

const handleBackToList = () => {
  setSelectedPostId(null);     // 목록 화면으로 전환
};
```

## 🔄 데이터 흐름

### 초기 로드

```
1. 컴포넌트 마운트
   ↓
2. useEffect (의존성 []) 실행
   ↓
3. fetchPosts() 호출
   ↓
4. API 요청 → 응답 받음
   ↓
5. setPosts(data) → 목록 표시
```

### 게시글 클릭

```
1. handlePostClick(id) 호출
   ↓
2. setSelectedPostId(id)
   ↓
3. useEffect (의존성 [selectedPostId]) 실행
   ↓
4. fetchPostDetail() 호출
   ↓
5. API 요청 → 응답 받음
   ↓
6. setSelectedPost(data) → 상세 표시
```

### 목록으로 돌아가기

```
1. handleBackToList() 호출
   ↓
2. setSelectedPostId(null)
   ↓
3. useEffect에서 early return
   ↓
4. setSelectedPost(null)
   ↓
5. 목록 화면 렌더링
```

## 🎨 UI 패턴

### 로딩 상태 표시

```tsx
{loading ? (
  <p>로딩 중...</p>
) : (
  <ActualContent />
)}
```

### 에러 상태 표시

```tsx
if (error) {
  return (
    <div style={{ padding: '20px', color: 'red' }}>
      <h2>오류 발생</h2>
      <p>{error}</p>
    </div>
  );
}
```

### Hover 효과

```tsx
<li
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#e8e8e8';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#f5f5f5';
  }}
>
```

## 🔧 개선 아이디어

### 1. CSS 파일로 스타일 분리

```tsx
// PostsApp.css
.post-item {
  padding: 15px;
  margin: 10px 0;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-item:hover {
  background-color: #e8e8e8;
}
```

### 2. 컴포넌트 분리

```tsx
// PostList.tsx
const PostList = ({ posts, onPostClick }) => { ... };

// PostDetail.tsx
const PostDetail = ({ post, onBack }) => { ... };

// PostsApp.tsx
const PostsApp = () => {
  // ...
  return selectedPostId ? (
    <PostDetail post={selectedPost} onBack={handleBackToList} />
  ) : (
    <PostList posts={posts} onPostClick={handlePostClick} />
  );
};
```

### 3. Custom Hook으로 분리

```tsx
const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        setPosts(data.slice(0, 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return { posts, loading, error };
};

// 사용
const PostsApp = () => {
  const { posts, loading, error } = usePosts();
  // ...
};
```

### 4. 페이지네이션 추가

```tsx
const [page, setPage] = useState(1);
const itemsPerPage = 10;

useEffect(() => {
  const fetchPosts = async () => {
    const start = (page - 1) * itemsPerPage;
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_start=${start}&_limit=${itemsPerPage}`
    );
    // ...
  };
  fetchPosts();
}, [page]);
```

### 5. 검색 기능

```tsx
const [searchTerm, setSearchTerm] = useState('');

const filteredPosts = posts.filter(post =>
  post.title.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
  <>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="게시글 검색..."
    />
    <PostList posts={filteredPosts} />
  </>
);
```

## ⚠️ 개발 환경에서 API가 두 번 호출되는 이유

### 현상
브라우저의 네트워크 탭을 열어보면 API가 **두 번 호출**되는 것을 확인할 수 있습니다.

### 원인: React 18 Strict Mode
React 18의 **Strict Mode**는 개발 환경에서 useEffect를 의도적으로 두 번 실행합니다.

**실행 순서:**
```
1. 컴포넌트 마운트
2. useEffect 실행 (첫 번째)
3. cleanup 함수 실행 (있다면)
4. useEffect 다시 실행 (두 번째) ← 여기서 중복 호출!
```

**왜 이렇게 하나요?**
- 컴포넌트가 여러 번 마운트/언마운트 되어도 안전한지 확인
- cleanup 함수가 제대로 작동하는지 테스트
- 향후 React 기능(Fast Refresh, Suspense)과의 호환성 보장

**중요:** 프로덕션 빌드(`pnpm build`)에서는 한 번만 호출됩니다!

### 해결 방법

#### 방법 1: cleanup 함수로 중복 방지 (권장)

```tsx
useEffect(() => {
  let cancelled = false;  // cleanup 플래그

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다');
      }
      const data = await response.json();

      // cleanup되지 않았을 때만 state 업데이트
      if (!cancelled) {
        setPosts(data.slice(0, 10));
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchPosts();

  // cleanup 함수: 컴포넌트 언마운트 시 실행
  return () => {
    cancelled = true;
  };
}, []);
```

**장점:**
- Strict Mode의 이점을 유지
- 실제 버그를 미리 발견 가능
- 프로덕션과 동일한 동작 보장

#### 방법 2: Strict Mode 비활성화

일반 React 앱의 경우 `src/main.tsx` 또는 `src/index.tsx`:

```tsx
// 변경 전
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 변경 후
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
```

**단점:**
- React의 안전성 검사를 놓침
- 잠재적 버그를 발견하기 어려움

:::tip 권장사항
개발 중에는 Strict Mode를 유지하고, API 중복 호출이 신경 쓰인다면 **방법 1의 cleanup 패턴**을 사용하세요.
:::

## 📚 핵심 정리

### useEffect 활용

1. **두 개의 useEffect**
   - 첫 번째: 목록 불러오기 (`[]`)
   - 두 번째: 상세 불러오기 (`[selectedPostId]`)

2. **의존성 배열의 의미**
   - `[]`: "한 번만 실행해" → 초기 데이터 로드
   - `[selectedPostId]`: "이 값이 변할 때마다 실행해" → 동적 데이터 로드

3. **Early Return 패턴**
   - 불필요한 API 호출 방지
   - 코드 가독성 향상

### State 관리

1. **관심사의 분리**
   - 각 state는 하나의 책임만
   - posts, selectedPost, loading, error 모두 독립적

2. **로딩과 에러**
   - 모든 비동기 작업에 필수
   - 사용자 경험 향상

3. **null 활용**
   - "없음" 상태를 명시적으로 표현
   - 조건부 렌더링에 활용

### 비동기 처리

1. **async/await**
   - fetch API와 함께 사용
   - 가독성 좋은 비동기 코드

2. **try-catch-finally**
   - try: 정상 로직
   - catch: 에러 처리
   - finally: 정리 작업 (로딩 종료)

3. **HTTP 상태 확인**
   - `response.ok` 체크
   - 명시적인 에러 처리

## 🎯 다음 단계

1. **컴포넌트 분리**
   - [Todo 앱 컴포넌트 분리](/docs/react-practice/todo-app-advanced)

2. **Custom Hooks**
   - [Custom Hooks 만들기](/docs/react-hooks/custom-hooks)

3. **상태 관리 라이브러리**
   - React Query로 서버 상태 관리
   - Zustand로 전역 상태 관리

4. **고급 패턴**
   - [useEffect 심화](/docs/react-hooks/useeffect)
   - Race Condition 방지
   - Debouncing, Throttling

## 📖 참고 자료

- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)
- [Fetch API - MDN](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API)
- [React useEffect 공식 문서](https://react.dev/reference/react/useEffect)
