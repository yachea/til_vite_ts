import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../contexts/AuthContext';
import { InfiniteScrollProvider, useInfiniteScroll } from '../services/InfiniteScrollContext';
import { getProfile } from '../lib/profile';
import type { profile } from '../types/TodoType';
// 용서하세요. 입력창 컴포넌트
const InfiniteTodoWrite = () => {
  const { addTodo, loadingIntialTodos } = useInfiniteScroll();

  const [title, setTitle] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요');
      return;
    }
    try {
      // 새할일 추가
      await addTodo(title);
      // 다시 데이터를 로딩한다.
      await loadingIntialTodos();
      setTitle('');
    } catch (error) {
      console.log('등록에 오류가 발생 : ', error);
      alert(`등록에 오류가 발생 : ${error}`);
    }
  };
  return (
    <div className="card">
      <h3
        style={{
          margin: '0 0 15px 0',
          color: 'var(--gray-900)',
          fontSize: '18px',
          fontWeight: '600',
        }}
      >
        ✏️ 할일 작성
      </h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할일을 입력하세요."
          className="form-input"
          style={{ flex: 1 }}
        />
        <button onClick={handleSave} className="btn btn-primary">
          등록
        </button>
      </div>
    </div>
  );
};

// 용서하세요. 목록 컴포넌트
const InfiniteTodoList = () => {
  const {
    loading,
    loadingMore,
    hasMore,
    loadMoreTodos,
    todos,
    totalCount,
    editTodo,
    toggleTodo,
    deleteTodo,
    loadingIntialTodos,
  } = useInfiniteScroll();
  const { user } = useAuth();
  const [profile, setProfile] = useState<profile | null>(null);

  // 사용자 프로필 가져오기
  useEffect(() => {
    const loadProifle = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProifle();
  }, [user?.id]);

  // 번호 계산 함수 (최신글이 높은 번호가지도록 )
  const getGlobalIndex = (index: number) => {
    // 무한스크롤시에 계산 해서 번호 출력
    const globalIndex = totalCount - index;
    // console.log(
    //   `번호 계산 - index : ${index}, totalCount : ${totalCount}, globalIndex: ${globalIndex}`,
    // );
    return globalIndex;
  };

  // 날짜 포맷팅 함수
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

  // 수정 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // 개별 액션 로딩 상태 관리
  const [actionLoading, setActionLoading] = useState<{
    [key: number]: {
      edit: boolean;
      toggle: boolean;
      delete: boolean;
    };
  }>({});

  // 수정 시작
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      // 수정 진행 중
      setActionLoading(prev => ({
        ...prev,
        [id]: { ...prev[id], edit: true },
      }));

      await editTodo(id, editingTitle);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.log('수정 실패:', error);
      alert('수정에 실패했습니다.');
    } finally {
      // 수정 완료
      setActionLoading(prev => ({
        ...prev,
        [id]: { ...prev[id], edit: false },
      }));
    }
  };

  const handleToggle = async (id: number) => {
    try {
      // 토글 진행 중
      setActionLoading(prev => ({
        ...prev,
        [id]: { ...prev[id], toggle: true },
      }));

      await toggleTodo(id);
    } catch (error) {
      console.log('토글 실패:', error);
      alert('상태 변경에 실패하였습니다.');
    } finally {
      // 토글 완료
      setActionLoading(prev => ({
        ...prev,
        [id]: { ...prev[id], toggle: false },
      }));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // 삭제 진행 중
        setActionLoading(prev => ({
          ...prev,
          [id]: { ...prev[id], delete: true },
        }));

        await deleteTodo(id);
        // 삭제 이후에 번호를 갱신해서 정리해줌
        await loadingIntialTodos();
      } catch (error) {
        console.log('삭제 실패:', error);
        alert('삭제에 실패하였습니다.');
      } finally {
        // 삭제 완료
        setActionLoading(prev => ({
          ...prev,
          [id]: { ...prev[id], delete: false },
        }));
      }
    }
  };

  if (loading) {
    return <div className="loading-container">데이터 로딩중 ...</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--gray-200)',
          backgroundColor: 'var(--gray-50)',
        }}
      >
        <h3
          style={{
            margin: '0',
            color: 'var(--gray-900)',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          📋 TodoList(무한 스크롤)
          {profile?.nickname && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                color: 'var(--gray-600)',
                fontWeight: '400',
              }}
            >
              {profile.nickname}님의 할일
            </span>
          )}
        </h3>
      </div>

      {todos.length === 0 ? (
        <div className="loading-container">등록된 할일이 없습니다.</div>
      ) : (
        // 무한 스크롤 라이브러리 적용
        <div style={{ height: '500px', overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={todos.length}
            next={loadMoreTodos}
            hasMore={hasMore}
            height={500}
            loader={<div className="loading-container">데이터를 불러오는 중...</div>}
            endMessage={
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: 'var(--success-500)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                모든 데이터를 불러왔습니다.
              </div>
            }
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {todos.map((item, index) => {
                const itemLoading = actionLoading[item.id] || {
                  edit: false,
                  toggle: false,
                  delete: false,
                };

                return (
                  <li
                    key={item.id}
                    className={`todo-item ${item.completed ? 'completed' : ''}`}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)',
                      opacity: itemLoading.edit || itemLoading.delete ? 0.7 : 1,
                    }}
                  >
                    {/* 번호표시 */}
                    <span className="todo-number">{getGlobalIndex(index)}.</span>

                    {editingId === item.id ? (
                      <>
                        {/* 수정 모드 */}
                        <div className="todo-content">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleEditSave(item.id);
                              } else if (e.key === 'Escape') {
                                handleEditCancel();
                              }
                            }}
                            className="form-input"
                            style={{
                              fontSize: '14px',
                              padding: 'var(--space-2)',
                              width: '100%',
                              marginBottom: '4px',
                            }}
                            disabled={itemLoading.edit}
                            autoFocus
                          />
                          <span className="todo-date">작성일: {formatDate(item.created_at)}</span>
                        </div>

                        <div className="todo-actions">
                          <button
                            onClick={() => handleEditSave(item.id)}
                            className="btn btn-success btn-sm"
                            disabled={itemLoading.edit}
                          >
                            {itemLoading.edit ? '⏳ 저장 중...' : '✅ 저장'}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="btn btn-secondary btn-sm"
                            disabled={itemLoading.edit}
                          >
                            ❌ 취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 일반 모드 */}
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggle(item.id)}
                          disabled={itemLoading.toggle}
                          style={{
                            transform: 'scale(1.2)',
                            cursor: itemLoading.toggle ? 'not-allowed' : 'pointer',
                            opacity: itemLoading.toggle ? 0.6 : 1,
                          }}
                        />

                        <div className="todo-content">
                          <span className={`todo-title ${item.completed ? 'completed' : ''}`}>
                            {item.title}
                          </span>
                          <span className="todo-date">작성일: {formatDate(item.created_at)}</span>
                        </div>

                        <div className="todo-actions">
                          <button
                            onClick={() => handleEditStart(item)}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#ffc107',
                              color: '#212529',
                            }}
                            disabled={itemLoading.toggle || itemLoading.delete}
                          >
                            ✏️ 수정
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger btn-sm"
                            disabled={itemLoading.toggle || itemLoading.delete}
                          >
                            {itemLoading.delete ? '⏳ 삭제 중...' : '🗑️ 삭제'}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <InfiniteScrollProvider itemsPerPage={10}>
      <div>
        <div className="page-header">
          <h2 className="page-title">🔄 무한 스크롤 Todo 목록</h2>
          <p className="page-subtitle">스크롤하여 더 많은 할일을 확인하세요</p>
        </div>

        <div className="container">
          <div style={{ marginBottom: '20px' }}>
            <InfiniteTodoWrite />
          </div>

          <div>
            <InfiniteTodoList />
          </div>
        </div>
      </div>
    </InfiniteScrollProvider>
  );
}

export default TodosInfinitePage;
