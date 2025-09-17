import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import { InfiniteScrollProvider, useInfiniteScroll } from '../services/InfiniteScrollContext';
import type { profile } from '../types/TodoType';
// 용서하세요. 입력창 컴포넌트
const InfiniteTodoWrite = () => {
  const navigate = useNavigate();
  const handleWrite = () => {
    navigate('/todos/write');
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <button onClick={handleWrite} className="btn btn-primary">
            작성하기
          </button>
        </div>
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
                return (
                  <li
                    key={item.id}
                    className={`todo-item ${item.completed ? 'completed' : ''}`}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)',
                    }}
                  >
                    {/* 번호표시 */}
                    <span className="todo-number">{getGlobalIndex(index)}.</span>
                    <div className="todo-content">
                      <span className={`todo-title ${item.completed ? 'completed' : ''}`}>
                        <Link to={`/todos/edit/${item.id}`}>{item.title}</Link>
                      </span>
                      <span className="todo-date">작성일: {formatDate(item.created_at)}</span>
                    </div>
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
