# Custom Hooks 적용: 게시글 앱 리팩토링

[기본 게시글 앱](/docs/react-practice/posts-app)을 useFetch Hook으로 리팩토링하여 코드를 간소화하는 방법을 알아봅니다.

:::info 선수 학습
이 가이드를 학습하기 전에 먼저 다음을 완료하세요:
- [게시글 앱 기본](/docs/react-practice/posts-app)
- [Custom Hooks](/docs/react-hooks/custom-hooks)
:::

## 🎯 학습 목표

- useFetch로 API 호출 로직 간소화
- Custom Hooks의 실전 활용

## 📊 기존 코드 vs 리팩토링 후

### 기존 코드의 문제점

```tsx
// ❌ PostsApp.tsx에서 반복되는 패턴
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchPosts();
}, []);
```

**문제점:**
- 같은 패턴이 목록 조회, 상세 조회에서 반복
- 로딩/에러 상태 관리 코드가 중복
- 테스트하기 어려움

### 리팩토링 후

```tsx
// ✅ useFetch로 간소화
const { data: posts, loading, error } = useFetch<Post[]>(
  'https://jsonplaceholder.typicode.com/posts'
);
```

## 📂 board-v2 폴더 준비

Custom Hooks를 적용하기 위해 기존 코드를 복사합니다.

**기존 파일 위치:**
```
src/
├── PostsApp.tsx              # 메인 컴포넌트
└── components/
    ├── PostList.tsx          # 목록 컴포넌트
    └── PostDetail.tsx        # 상세 컴포넌트
```

**1단계: 폴더 생성 및 파일 복사**

`src/board-v2` 폴더를 생성하고, 위의 파일들을 `board-v2` 폴더로 복사하세요.

**2단계: 최종 파일 구조**

리팩토링 후 다음과 같은 구조가 됩니다:
```
src/
├── hooks/                  # 공통 Custom Hooks (새로 생성)
│   └── useFetch.ts
└── board-v2/               # 리팩토링할 폴더
    ├── PostsApp.tsx        # useFetch 적용
    ├── PostList.tsx        # 기존과 동일
    └── PostDetail.tsx      # 기존과 동일
```

## 📦 완성본 코드

### 1. useFetch.ts (API 호출 Hook)

```tsx title="src/hooks/useFetch.ts"
import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useFetch = <T,>(url: string | null) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // url이 null이면 API 호출하지 않음
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();

        if (!isCancelled) {
          setState({ data: json, loading: false, error: null });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
          });
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return state;
};

export default useFetch;
```

**주요 포인트:**
- `url`이 `null`이면 API 호출 안 함 (조건부 fetch)
- `isCancelled` 플래그로 언마운트 시 상태 업데이트 방지
- 제네릭 `<T>`로 타입 안전성 보장

### 2. PostList.tsx (목록 컴포넌트)

기존과 동일하게 유지합니다. Props로 데이터를 받아서 표시만 합니다.

```tsx title="src/board-v2/PostList.tsx"
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

### 3. PostDetail.tsx (상세 컴포넌트)

```tsx title="src/board-v2/PostDetail.tsx"
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

### 4. PostsApp.tsx (메인 컴포넌트) - useFetch 적용

```tsx title="src/board-v2/PostsApp.tsx"
import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import PostList from './PostList';
import PostDetail from './PostDetail';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

type ViewMode = 'list' | 'detail';

const PostsApp = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // ✅ useFetch로 목록 가져오기
  const {
    data: allPosts,
    loading: listLoading,
    error: listError,
  } = useFetch<Post[]>('https://jsonplaceholder.typicode.com/posts');

  // 처음 10개만 표시
  const posts = allPosts?.slice(0, 10) || [];

  // ✅ useFetch로 상세 정보 가져오기 (selectedPostId가 있을 때만)
  const {
    data: selectedPost,
    loading: detailLoading,
    error: detailError,
  } = useFetch<Post>(
    selectedPostId
      ? `https://jsonplaceholder.typicode.com/posts/${selectedPostId}`
      : null  // null이면 API 호출 안 함
  );

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
    setViewMode('list');
  };

  const error = listError || detailError;
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>오류 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 상세 화면
  if (viewMode === 'detail') {
    return (
      <PostDetail
        post={selectedPost}
        loading={detailLoading}
        onBack={handleBackToList}
      />
    );
  }

  // 목록 화면
  return (
    <PostList
      posts={posts}
      loading={listLoading}
      onPostClick={handlePostClick}
    />
  );
};

export default PostsApp;
```

## 🔄 기존 코드와 비교

### 목록 불러오기

**기존 (useEffect 직접 사용):**
```tsx
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) throw new Error('실패');
      const data = await response.json();
      setPosts(data.slice(0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchPosts();
}, []);
```

**리팩토링 후 (useFetch 사용):**
```tsx
const { data: allPosts, loading, error } = useFetch<Post[]>(
  'https://jsonplaceholder.typicode.com/posts'
);
const posts = allPosts?.slice(0, 10) || [];
```

**장점:**
- 코드량 대폭 감소 (20줄 → 3줄)
- 로딩/에러 상태 자동 관리
- 재사용 가능

## 💡 핵심 포인트

### 1. 조건부 API 호출

```tsx
// url이 null이면 API 호출 안 함
const { data } = useFetch<Post>(
  selectedPostId
    ? `https://api.com/posts/${selectedPostId}`
    : null
);
```

### 2. 타입 안전성

```tsx
// 제네릭으로 응답 타입 지정
const { data } = useFetch<Post[]>(url);
// data는 Post[] | null 타입
```

### 3. 화면 전환

```tsx
type ViewMode = 'list' | 'detail';
const [viewMode, setViewMode] = useState<ViewMode>('list');

// 명확한 상태 기반 렌더링
if (viewMode === 'detail') return <PostDetail />;
return <PostList />;
```

## 📊 정리

### Custom Hooks 적용의 장점

| 항목 | 기존 코드 | Custom Hooks 적용 후 |
|-----|---------|-------------------|
| **코드량** | 많음 | 적음 |
| **재사용성** | 불가능 | 가능 |
| **테스트** | 어려움 | 쉬움 |
| **유지보수** | 어려움 | 쉬움 |
| **가독성** | 로직이 분산 | 로직이 집중 |

### 언제 Custom Hook을 만들어야 하나?

✅ **만들어야 하는 경우:**
- 같은 로직이 2곳 이상에서 반복
- 복잡한 상태 로직을 분리하고 싶을 때
- 테스트를 용이하게 하고 싶을 때

❌ **만들지 않아도 되는 경우:**
- 한 곳에서만 사용하는 간단한 로직
- 컴포넌트에 종속된 UI 로직

## 🎯 다음 단계

1. **더 많은 Custom Hooks**
   - useDebounce (검색 기능 추가)
   - useLocalStorage (설정 저장)

2. **상태 관리 라이브러리**
   - React Query로 서버 상태 관리
   - Zustand로 전역 상태 관리

3. **고급 패턴**
   - Optimistic Updates
   - Infinite Scroll

## 📖 참고 자료

- [Custom Hooks 가이드](/docs/react-hooks/custom-hooks)
- [게시글 앱 기본](/docs/react-practice/posts-app)
- [React 공식 문서 - Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
