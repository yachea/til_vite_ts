# profiles 테이블에 추가 정보시 오류 발생

- RLS 정책으로 회원이 아니면 CRUD 를 하지 못한다.

## 1. 기존 방식

- 회원가입 > profiles 에 insert 진행함 (오류발생)
- 회원가입 > 이메일인증 > 인증 확인 > profiles 에 insert 필요

## 2. 회원가입 진행 과정 개선

- /src/pages/SignUpPage.tsx 수정

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { profileInsert } from '../types/TodoType';

function SingUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  // 추가정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹 브라우저 갱신 막기
    e.preventDefault();
    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }
    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자입니다.');
      return;
    }
    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원가입 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가정보를 보관합니다.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭이 metadata 라고 합니다.
        // 이메일 인증 후에 프로필 생성 시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={e => handleSubmit(e)}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <br />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SingUpPage;
```

- /src/pages/AuthCallback.tsx 변경

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { profileInsert } from '../types/TodoType';
import { createProfile } from '../lib/profile';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중...');

  // 사용자가 이메일 확인 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickname 을 알아내서 여기서 profiles 를 추가
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL 에서 세션(웹브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져옴
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함.
      if (data.session?.user) {
        const user = data.session.user;
        // 추가적인 정보 파악 가능(metadata 라고 함.)
        const nickName = user.user_metadata.nickName;
        // 먼저 프로필이 이미 존재하는지 확인이 필요
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        // 존재하지 않는 id 이고, nickName 내용이 있다면
        // profiles 에 insert 한다.
        if (!existingProfile && nickName) {
          // 프로필이 없고 닉네임이 존재하므로 프로필 생성하자.
          const newProfile: profileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            setMsg('✨이메일 인증 완료. 프로필 생성 성공! 홈으로 이동하세요.');
          } else {
            setMsg('✨이메일 인증 완료. 프로필이 생성 실패 ! 관리자에게 문의하세요.');
          }
        } else {
          setMsg('✨이메일 인증 완료. 홈으로 이동하세요.');
        }
      } else {
        setMsg('✨이메일 인증 정보 자체가 없습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류: ${err}`);
      setMsg('✨이메일 인증 처리중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2>인증 페이지</h2>
      <div>{msg}</div>
    </div>
  );
}

export default AuthCallback;
```

- /src/lib/profile.ts 추가

```ts
/**
 * 사용자 프로필 관리
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 *  주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { profile, profileInsert, profileUpdate } from '../types/TodoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: profileInsert): Promise<boolean> => {
  try {
    const { error, data } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패:`, {
        message: error.message,
        detail: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }
    console.log(`프로필 생성 성공:`, data);
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<profile | null> => {
  try {
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.log(error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 사용자 프로필 수정
const updateProgile = async (editUserProfile: profileUpdate, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...editUserProfile })
      .eq('id', userId);
    if (error) {
      console.log(error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    // 파일 타입 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
    }
    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
    }

    // 기존에 만약 아바타 이미지가 있으면 무조건 삭제부터 합니다.
    const result = await cleanupUserAvatars(userId);
    if (!result) {
      console.log('파일 못 지웠어요.');
    }

    // 파일명이 중복되지 않도록 이름을 생성함.
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // storage 에 bucket 이 존재하는지 검사
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      throw new Error(`Storage 버킷 확인 실패 : ${bucketError.message}`);
    }
    // bucket 들의 목록 전달 {} 형태로 나옴. user-images 라는 이름에 업로드
    let profileImagesBucket = buckets.find(item => item.name === 'user-images');
    if (!profileImagesBucket) {
      throw new Error('user-images 버킷이 존재하지 않음. 버킷생성 필요!!');
    }
    // 파일 업로드 : upload(파일명, 실제파일, 옵션)
    const { data, error } = await supabase.storage.from('user-images').upload(filePath, file, {
      cacheControl: '3600', // 3600 초는 1시간 동안 파일 캐시 적용
      upsert: false, // 동일한 파일명은 덮어씌운다.
    });
    if (error) {
      throw new Error(`업로드 실패 : ${error.message}`);
    }
    // https 문자열로 주소를 알아내서 활용
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-images').getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    throw new Error(`아바타 업로드 오류가 발생했습니다. : ${error}`);
  }
};

// 아바타 이미지는 한장을 유지해야 하므로 모두 제거하는 기능 필요
const cleanupUserAvatars = async (userId: string): Promise<boolean> => {
  try {
    const { data, error: listError } = await supabase.storage
      .from('user-images')
      .list('avatars', { limit: 1000 });
    if (listError) {
      console.log(`목록 요청 에러 : ${listError.message}`);
      return false;
    }
    // userId 에 해당하는 것만 필터링 해서 삭제해야 함.
    if (data && data.length > 0) {
      const userFile = data.filter(item => item.name.startsWith(`${userId}-`));
      if (userFile && userFile.length > 0) {
        const filePaths = userFile.map(item => `avatars/${item.name}`);
        const { error: removeError } = await supabase.storage.from('user-images').remove(filePaths);
        if (removeError) {
          console.log(`파일 삭제 에러 : ${removeError.message}`);
          return false;
        }
        return true;
      }
    }
    return true;
  } catch (error) {
    console.log(`아바타 이미지 전체 삭제 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 이미지 제거
const removeAvatar = async (userId: string): Promise<boolean> => {
  try {
    // 현재 로그인한 사용자의 avartar_url 을 읽어와야 합니다.
    // 여기서 파일명을 추출함.
    const profile = await getProfile(userId);
    // 사용자가 avatar_url ㅇ ㅣ없다면
    if (!profile?.avatar_url) {
      return true; // 작업완료
    }
    // 1. 만약 avatar_url 이 존재하면 이름 파악, 파일 삭제
    let deleteSuccess = false;

    try {
      //  url 에 파일명을 찾아야 함. (url 로 변환하면 path 와 파일구분수월함)
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        const bucketName = pathParts[publicIndex + 1];
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        // 실제로 찾아낸 bucketName 과 filePath 로 삭제
        const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
          throw new Error('파일을 찾았지만, 삭제에는 실패했어요.');
        }
        // 파일 삭제 성공
        deleteSuccess = true;
      }
    } catch (err) {
      console.log(err);
    }

    // 2. 만약 avatar_url 을 제대로 파싱 못했다면?
    if (!deleteSuccess) {
      try {
        // 전체 목록을 일단 읽어옴
        const { data: files, error: listError } = await supabase.storage
          .from('user-images')
          .list('avatars', { limit: 1000 });
        if (!listError && files && files.length > 0) {
          const userFiles = files.filter(item => item.name.startsWith(`${userId}-`));
          if (userFiles.length > 0) {
            const filePath = userFiles.map(item => `avatars/${item.name}`);
            const { error } = await supabase.storage.from('user-images').remove(filePath);
            if (!error) {
              deleteSuccess = true;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 내보내기
export { createProfile, getProfile, updateProgile, deleteProfile, uploadAvatar, removeAvatar };
```

# 일반적 네이게이션 진행하기

- npm : https://www.npmjs.com/package/react-paginate
- 우리는 직접 구현 진행함.

## 1. 구현 시나리오

- 한 화면에 10개의 목록을 표시함.
- 페이지 번호로 네비게이션 함.
- 전체 개수 및 현재 페이지 정보 출력함.
- supabase 에 todos 를 이용함.

## 2. 코드 구현

### 2.1. /src/service/todoService.ts

- 페이지 번화와 제한 개수를 이용해서 추출하기 함수 추가

```ts
import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert, TodoUpdate } from '../types/TodoType';

// Todo 목록 조회
export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  // 실행은 되었지만, 결과가 오류이다.
  if (error) {
    throw new Error(`getTodos 오류 : ${error.message}`);
  }
  return data || [];
};
// Todo 생성
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨.
// TodoInsert 에서 user_id : 값을 생략하는 타입을 생성
// 타입스크립트에서 Omit 을 이용하면, 특정 키를 제거할 수 있음.
export const createTodos = async (newTodo: Omit<TodoInsert, 'user_id'>): Promise<Todo | null> => {
  try {
    // 현재 로그인 한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }
    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodo, completed: false, user_id: user.id }])
      .select()
      .single();
    if (error) {
      throw new Error(`createTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 수정
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨.
// TodoUpdate 에서 user_id : 값을 생략하는 타입을 생성
// 타입스크립트에서 Omit 을 이용하면, 특정 키를 제거할 수 있음.
export const updateTodos = async (
  id: number,
  editTitle: Omit<TodoUpdate, 'user_id'>,
): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({ ...editTitle, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new Error(`updateTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 삭제
export const deleteTodos = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteTodos 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
// completed toggle
export const toggleTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  return updateTodos(id, { completed });
};

// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated(1, 10개)
// getTodosPaginated(11, 10개)
// getTodosPaginated(페이지번호, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPage: number }> => {
  // 시작
  // page=2, limit 10
  // (2-1)* 10 => 10
  const from = (page - 1) * limit;
  // 제한
  // 10 + 10 - 1 => 10
  const to = from + limit - 1;
  // 전체 데이터 개수 (row 의 개수)
  const { count } = await supabase.from('todos').select('*', { count: 'exact', head: true });
  // from 부터 to 까지의 상세 데이터
  const { data } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);
  // 편하게 활용
  const totalCount = count || 0;
  // 몇개페이지 인지 계산
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount: totalCount,
    totalPages: totalPages,
    currentPage: page,
  };
};
```

### 2.2. /src/contexts/TodoContext.tsx

```tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
// 전체 DB 가져오기
import { getTodos, getTodosPaginated } from '../services/todoService';
import type { Todo } from '../types/TodoType';

// 1. 초기값 형태가 페이지 객체 형태로 추가
type TodosState = { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };
const initialState: TodosState = {
  todos: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
};
// 2. 리듀서
// action 은 {type: "문자열", payload: 재료} 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
  // Supabase todos 의 목록읽기
  SET_TODOS = 'SET_TODOS',
}

type ADDAction = { type: TodoActionType.ADD; payload: { todo: Todo } };
type DELETEAction = { type: TodoActionType.DELETE; payload: { id: number } };
type TOGGLEAction = { type: TodoActionType.TOGGLE; payload: { id: number } };
type EDITAction = { type: TodoActionType.EDIT; payload: { id: number; title: string } };
// supabase 목록으로 state.todos 배열을 채워라.
type SetTodosAction = {
  type: TodoActionType.SET_TODOS;
  payload: { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };
};

function reducer(
  state: TodosState,
  action: ADDAction | DELETEAction | TOGGLEAction | EDITAction | SetTodosAction,
) {
  switch (action.type) {
    //  return 외에 다른 함수가 추가적으로 들어갈때 함수{}로 묶어줘야 한다.
    case TodoActionType.ADD: {
      const { todo } = action.payload;
      return { ...state, todos: [todo, ...state.todos] };
    }
    case TodoActionType.TOGGLE: {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case TodoActionType.DELETE: {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case TodoActionType.EDIT: {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title: title } : item));
      return { ...state, todos: arr };
    }
    // Supabase 에 목록 읽기
    case TodoActionType.SET_TODOS: {
      const { todos, totalCount, totalPages, currentPage } = action.payload;
      return { ...state, todos, totalCount, totalPages, currentPage };
    }
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 Value 의 모양
type TodoContextValue = {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
  loadTodos: (page: number, limit: number) => Promise<void>;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 4. provider 생성
// 1. props 정의하기
// interface TodoProviderProps {
//   children?: React.ReactNode;
//   currentPage?: number;
//   limit?: number;
// }

interface TodoProviderProps extends PropsWithChildren {
  currentPage?: number;
  limit?: number;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({
  children,
  currentPage = 1,
  limit = 10,
}): JSX.Element => {
  // useReducer 로 상태관리
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 를 위함 함수 표현식 모음
  const addTodo = (newTodo: Todo) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: number) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: number) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: number, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // 실행시 state {todos} 를 업데이트함.
  // reducer 함수를 실행함.
  const setTodos = (todos: Todo[], totalCount: number, totalPages: number, currentPage: number) => {
    dispatch({
      type: TodoActionType.SET_TODOS,
      payload: { todos, totalCount, totalPages, currentPage },
    });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  // const LoadTodos = async (): Promise<void> => {
  //   try {
  //     const result = await getTodos();
  //     setTodos(result);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const loadTodos = async (page: number, limit: number): Promise<void> => {
    try {
      const result = await getTodosPaginated(page, limit);
      // 현재 페이지가 비어있고 첫 페이지가 아니라면 이전 페이지를 출력하자.
      if (result.todos.length === 0 && result.totalPages > 0 && page > 1) {
        const prevPageResult = await getTodosPaginated(page - 1, limit);
        setTodos(
          prevPageResult.todos,
          prevPageResult.totalCount,
          prevPageResult.totalPages,
          prevPageResult.currentPage,
        );
      } else {
        setTodos(result.todos, result.totalCount, result.totalPages, result.currentPage);
      }
    } catch (error) {
      console.log(`목록 가져오기 오류 : ${error}`);
    }
  };

  // 페이지가 바뀌면 다시 실행하도록 해야 한다.
  useEffect(() => {
    loadTodos(currentPage, limit);
  }, [currentPage, limit]);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    itemsPerPage: limit,
    addTodo: addTodo,
    toggleTodo: toggleTodo,
    deleteTodo: deleteTodo,
    editTodo: editTodo,
    loadTodos,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
// 5. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
```

### 2.3. 페이지네이션을 위한 컴포넌트 생성

- /src/components/Pagination.tsx 생성 (재활용 할 수 있으므로)

```tsx
import React from 'react';

interface PaginationProps {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}

const Pagination = ({
  totalCount,
  totalPages,
  currentPage,
  itemsPerPage,
  handleChangePage,
}: PaginationProps): JSX.Element => {
  // ts 자리

  // 시작 번호를 생성함.
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  // 마지막 번호를 생성함.
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // 페이지 번호 버튼들을 생성함
  const getPageNumbers = () => {
    const pages = [];
    // 한 화면에 몇개의 버튼들을 출력할 것인가?
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      // 현재 5 페이지보다 적은 경우
      for (let i = 1; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 5 페이지보다 큰 경우
      // 시나리오
      // ...currentpage-2 currentpage-1 currentpage currentpage+1 currentpage+2...
      // 현재 페이지를 중심으로 앞뒤 2개씩 표현
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      // 시작페이지가 1 보다 크면 첫 페이지와 ... 추가
      if (startPage > 1) {
        pages.push(1); // [1]
        if (startPage > 2) {
          pages.push('...'); // [1, "..."]
        }
      }
      // 중간 페이지를 추가
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      // 끝 페이지가 마지막 보다 작으면 ... 과 페이지 추가
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지네이션이 무조건 나오는 것은 아닙니다.
  if (totalPages <= 1) {
    return <></>;
  }

  // tsx 자리
  return (
    <div>
      {/* 페이지정보 */}
      <div>
        총 {totalCount}개 중 {startItem} ~ {endItem} 개 표시
      </div>
      {/* 페이지 번호들 */}
      <div>
        <button onClick={() => handleChangePage(currentPage - 1)} disabled={currentPage === 1}>
          이전
        </button>
        {/* 버튼들 출력 */}
        {pageNumbers.map((item, indedx) => (
          <React.Fragment key={indedx}>
            {item === '...' ? (
              <span>...</span>
            ) : (
              <button onClick={() => handleChangePage(item as number)}>{item}</button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handleChangePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
```

### 2.4. /src/pages/TodosPage.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { TodoProvider, useTodos } from '../contexts/TodoContext';
import TodoWrite from '../components/todos/TodoWrite';
import TodoList from '../components/todos/TodoList';
import type { profile } from '../types/TodoType';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import Pagination from '../components/Pagination';

// 용서하세요. 컴포넌트는 여기서 작성하겠습니다.
// 필요하시면 이동 부탁합니다.
interface TodosContentProps {
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const TodosContent = ({
  currentPage,
  itemsPerPage,
  handleChangePage,
}: TodosContentProps): JSX.Element => {
  const { totalCount, totalPages } = useTodos();
  return (
    <div>
      <div>
        {/* 새 글 등록시 1페이지로 이동 후 목록새로고침 */}
        <TodoWrite handleChangePage={handleChangePage} />
      </div>
      <div>
        <TodoList />
      </div>
      <div>
        <Pagination
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </div>
    </div>
  );
};

function TodosPage() {
  const { user } = useAuth();
  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 페이지 변경 핸들러
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const [profile, setProfile] = useState<profile | null>(null);
  // 프로필 가져오기
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자님에게 요청하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 Error: ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <h2>{profile?.nickname}할일</h2>
      <TodoProvider currentPage={currentPage} limit={itemsPerPage}>
        <TodosContent
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
```
