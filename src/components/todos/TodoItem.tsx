import { useEffect, useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';
import React from 'react';

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
