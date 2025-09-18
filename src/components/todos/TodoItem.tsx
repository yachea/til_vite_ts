import React, { act, useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import {
  deleteTodos as deleteTodoService,
  toggleTodo as toggleTodoService,
  updateTodos as updateTodoService,
} from '../../services/todoService';
import type { Todo } from '../../types/TodoType';

type TodoItemProps = {
  todo: Todo;
  index: number;
};

const TodoItem = ({ todo, index }: TodoItemProps): JSX.Element => {
  const { toggleTodo, editTodo, deleteTodo, currentPage, itemsPerPage, totalCount } = useTodos();
  //순서번호 매기기
  const globalIndex = totalCount - ((currentPage - 1) * itemsPerPage + index);
  // 작성 날짜 포맷팅
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // 수정중인지
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);

  // 개별 액션 로딩 상태 (편집중인지, 토글중인지, 삭제중인지)
  const [actionLoading, setActionLoading] = useState<{
    edit: boolean;
    toggle: boolean;
    delete: boolean;
  }>({ edit: false, toggle: false, delete: false });

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  // 비동기로 DB 에 update 한다.
  const handleEditSave = async (): Promise<void> => {
    if (!editTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      // 수정 진행중
      setActionLoading({ ...actionLoading, edit: true });
      // DB 의 내용 업데이트
      const result = await updateTodoService(todo.id, { title: editTitle });
      if (result) {
        // context 의 state, todos 의 항목 1개의 타이틀 수정
        editTodo(todo.id, editTitle);
        setIsEdit(false);
      }
    } catch (error) {
      // console.log('데이터 업데이트에 실패하였습니다.');
    } finally {
      setActionLoading({ ...actionLoading, edit: false });
    }

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

  // 비동기 통신으로 toggle 업데이트
  const handleToggle = async (): Promise<void> => {
    try {
      // toggle 이 진행됨.
      setActionLoading({ ...actionLoading, toggle: true });
      // DB 의 completed 가 업데이트 성공시 Todo 타입 리턴
      const result = await toggleTodoService(todo.id, !todo.completed);
      if (result) {
        // context 의 state.todos 의 1개 항목 completed 업데이트
        toggleTodo(todo.id);
      }
    } catch (error) {
      // console.log('데이터베이스 Toggle 이 실패하였습니다.');
    } finally {
      setActionLoading({ ...actionLoading, toggle: false });
    }
  };
  // DB 의 데이터 delete
  const handleDelete = async (): Promise<void> => {
    try {
      // delete 활성화
      setActionLoading({ ...actionLoading, delete: true });
      // db 삭제
      await deleteTodoService(todo.id);
      // state 삭제기능
      deleteTodo(todo.id);
    } catch (error) {
      // console.log('DB 삭제에 실패했습니다.', error);
    } finally {
      setActionLoading({ ...actionLoading, delete: false });
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* 출력번호 */}
      <span className="todo=number">{globalIndex}</span>
      {isEdit ? (
        <>
          <div className="todo-content">
            <input
              type="text"
              value={editTitle}
              onChange={e => handleChangeTitle(e)}
              onKeyDown={e => handleKeyDown(e)}
              className="form-input"
              style={{ fontSize: '14px', padding: 'var(--space-2)' }}
            />
            <span className="todo-date">작성일: {formatDate(todo.created_at)}</span>
          </div>
          <div className="todo-actions">
            <button
              onClick={handleEditSave}
              className="btn btn-success btn-sm"
              disabled={actionLoading.edit}
            >
              {actionLoading.edit ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleEditCancel}
              className="btn btn-secondary btn-sm"
              disabled={actionLoading.edit}
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            disabled={actionLoading.toggle}
            style={{
              cursor: actionLoading.toggle ? 'not-allowed' : 'pointer',
              opacity: actionLoading.toggle ? 0.6 : 1,
            }}
          />
          <div className="todo-content">
            <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
            <span className="todo-date">작성일: {formatDate(todo.created_at)}</span>
          </div>
          <div className="todo-actions">
            <button
              onClick={() => setIsEdit(true)}
              className="btn btn-primary btn-sm"
              disabled={actionLoading.toggle || actionLoading.delete}
            >
              수정
            </button>
            <button
              onClick={() => handleDelete()}
              className="btn btn-danger btn-sm"
              disabled={actionLoading.toggle || actionLoading.delete}
            >
              {actionLoading.delete ? '⏳ 삭제 중...' : '🗑️ 삭제'}
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default TodoItem;
