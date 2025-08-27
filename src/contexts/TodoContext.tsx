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
