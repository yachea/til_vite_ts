import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { profile as Profile, Todo } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { deleteTodos, getTodoById, getTodos } from '../services/todoService';
import Loading from '../components/Loading';

function TodoDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // param 값을 읽기
  const { id } = useParams<{ id: string }>();
  // id 를 이용해서 Todo 내용 가져오기
  const [todo, setTodo] = useState<Todo | null>(null);
  // 상세 페이지오면 todo 내용을 호출해야 하므로 true 셋팅
  const [loading, setLoading] = useState(true);

  // 현재 삭제 중인지 처리
  const [actionLoading, setActionLoading] = useState<{
    delete: boolean;
  }>({ delete: false });

  useEffect(() => {
    const loadTodo = async () => {
      if (!id) {
        navigate('/todos');
        return;
      }
      try {
        setLoading(true);
        const todoData = await getTodoById(parseInt(id));
        if (!todoData) {
          alert('해당 할일을 찾을 수 없습니다.');
          navigate('/todos');
          return;
        }
        // 본인의 Todo 인지 확인
        if (todoData.user_id !== user?.id) {
          alert('조회 권한이 없습니다.');
          navigate('/todos');
          return;
        }
        setTodo(todoData);
      } catch (error) {
        console.log('Todo 로드 실패 :', error);
        alert('할 일을 불러오는데 실패했습니다.');
        navigate('/todos');
      } finally {
        setLoading(false);
      }
    };
    loadTodo();
  }, [id, user?.id, navigate]);

  const handleDelete = async () => {
    if (!todo) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setActionLoading({ ...actionLoading, delete: true });
      await deleteTodos(todo.id);
      alert('할일이 삭제되었습니다.');
      navigate('/todos');
    } catch (error) {
      console.log();
    } finally {
      setActionLoading({ ...actionLoading, delete: false });
    }
  };

  const [profile, setprofile] = useState<Profile | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const userProfil = await getProfile(user.id);
        setprofile(userProfil);
      }
    };
    loadProfile();
  }, [user?.id]);

  if (loading) {
    return <Loading message="할 일 정보를 불러오는 중..." size="lg" />;
  }
  if (!todo) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>할 일을 찾을 수 없습니다.</h3>
        <button className="btn btn-primary" onClick={() => navigate('/todos')}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">할 일 상세보기</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 할일</p>}
      </div>
      {/* 실제내용 */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 var(--space-2) 0',
                color: 'var(--gray-800)',
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              {todo.title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: todo.completed ? 'var(--success-100)' : 'var(--primary-100)',
                color: todo.completed ? 'var(--success-700)' : 'var(--primary-700)',
              }}
            >
              {todo.completed ? '✅ 완료' : '⏳ 진행 중'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => navigate(`/todos/edit/${todo.id}`)}
            className="btn btn-primary btn-sm"
            disabled={actionLoading.delete}
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            disabled={actionLoading.delete}
          >
            {actionLoading.delete ? '⏳ 삭제 중...' : '🗑️ 삭제'}
          </button>
        </div>
        {/* 상세 내용 */}
        {todo.content && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--gray-700)' }}>상세 내용</h4>
            <p
              style={{
                margin: 0,
                color: 'var(--gray-600)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}
            >
              {todo.content}
            </p>
          </div>
        )}
        {/* 추가정보 출력 */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--gray-700)' }}>할일 정보</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성일 :</span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.created_at ? new Date(todo.created_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>수정일 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.updated_at ? new Date(todo.updated_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성자 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {profile?.nickname || user?.email}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/todos')}>
            📃목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoDetailPage;
