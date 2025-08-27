# Context API 와 useReducer

- useState 를 대체하고, props 를 줄여보자.

## 1. 기본폴더 구성 및 파일구조

- `/src/contexts` 폴더 생성
- `/src/context/TodoContext.jsx` 생성

```jsx
import { act, createContext, useContext, useReducer } from 'react';

// 1. 초기값
const initialState = {
  todos: [],
};
// 2. 리듀서
// action 은 {type: "문자열", payload: 재료} 형태
function reducer(state, action) {
  switch (action.type) {
    //  return 외에 다른 함수가 추가적으로 들어갈때 함수{}로 묶어줘야 한다.
    case 'ADD': {
      const { todo } = action.payload;
      return { ...state, todos: [todo, ...state.todos] };
    }
    case 'TOGGLE': {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case 'DELETE': {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case 'EDIT': {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title: title } : item));
      return { ...state, todos: arr };
    }
    default:
      return state;
  }
}
// 3. context 생성
const TodoContext = createContext();
// 3. provider 생성
export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위함 함수 표현식 모음
  const addTodo = newTodo => {
    dispatch({ type: 'ADD', payload: { todo: newTodo } });
  };
  const toggleTodo = id => {
    dispatch({ type: 'TOGGLE', payload: { id } });
  };
  const deleteTodo = id => {
    dispatch({ type: 'DELETE', payload: { id } });
  };
  const editTodo = (id, editTitle) => {
    dispatch({ type: 'EDIT', payload: { id, title: editTitle } });
  };

  // value 전달할 값
  const value = {
    todos: state.todos,
    // 이름과 값이 같으면 하나로 줄여서 해도됨.
    addTodo: addTodo,
    toggleTodo: toggleTodo,
    deleteTodo: deleteTodo,
    editTodo: editTodo,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
// 3. custom hook 생성
export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
```

- App.tsx

```tsx
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import { TodoProvider } from './contexts/TodoContext';

function App() {
  return (
    <div>
      <h1>할일 웹서비스</h1>
      <TodoProvider>
        <div>
          <TodoWrite />
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default App;
```

- TodoWrite.tsx

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';

type TodoWriteProps = {
  childres?: React.ReactNode;
};

const TodoWrite = ({}: TodoWriteProps): JSX.Element => {
  // Context 를 사용함.
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = (): void => {
    if (title.trim()) {
      // 업데이트 시키기
      const newTodo: TodoType = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
    }
  };

  return (
    <div>
      <h2>할일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
```

- TodoList.tsx

```tsx
import { useTodos } from '../../contexts/TodoContext';
import type { TodoType } from '../../types/TodoType';
import TodoItem from './TodoItem';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem key={item.id} todo={item}></TodoItem>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- TodoItem.tsx

```tsx
import { useEffect, useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';

type TodoItemProps = {
  todo: TodoType;
};

const TodoItem = ({ todo }: TodoItemProps): JSX.Element => {
  const { toggleTodo, editTodo, deleteTodo } = useTodos();
  // 수정중인지
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);
  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  const handleEditSave = (): void => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      // setEditTitle(''); //필요없음
      setIsEdit(false);
    }
  };
  const handleEditCancel = (): void => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };
  return (
    <li>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancel}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```

## 2. TodoContexts.jsx 를 ts로 마이그레이션

- 확장자 `tsx` 로 변경
- import 를 다시 불러오기

```tsx
import React, { createContext, useContext, useReducer, type PropsWithChildren } from 'react';
import type { TodoType } from '../types/TodoType';

// 1. 초기값
type TodosState = { todos: TodoType[] };
const initialState: TodosState = {
  todos: [],
};
// 2. 리듀서
// action 은 {type: "문자열", payload: 재료} 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
}

type ADDAction = { type: TodoActionType.ADD; payload: { todo: TodoType } };
type DELETEAction = { type: TodoActionType.DELETE; payload: { id: string } };
type TOGGLEAction = { type: TodoActionType.TOGGLE; payload: { id: string } };
type EDITAction = { type: TodoActionType.EDIT; payload: { id: string; title: string } };

function reducer(state: TodosState, action: ADDAction | DELETEAction | TOGGLEAction | EDITAction) {
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
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 Value 의 모양
type TodoContextValue = {
  todos: TodoType[];
  addTodo: (todo: TodoType) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 3. provider 생성

// type TodoProviderProps = {
//   children: React.ReactNode;
// }; 이걸 더 권장함.
export const TodoProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위함 함수 표현식 모음
  const addTodo = (newTodo: TodoType) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: string) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: string) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: string, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    addTodo: addTodo,
    toggleTodo: toggleTodo,
    deleteTodo: deleteTodo,
    editTodo: editTodo,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
// 3. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
```
