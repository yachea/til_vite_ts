import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { profile as Profile, TodoInsert } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';
import { createTodos } from '../services/todoService';

function TodoWritePage() {
  const { user } = useAuth();
  // 사용자 입력내용
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCancel = () => {
    // 사용자가 실수로 취소를 할 수 있으므로 이에 대비
    if (title.trim() || content.trim()) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        // 목록으로
        navigate('/todos');
      }
    } else {
      // 목록으로
      navigate('/todos');
    }
  };
  const handleSave = async () => {
    // 제목은 필수 입력
    if (!title.trim()) {
      alert('제목은 필수 입니다.');
      return;
    }
    try {
      setSaving(true);
      const newTodo: TodoInsert = { user_id: user!.id, title, content };
      const result = await createTodos(newTodo);
      if (result) {
        alert('할 일이 성공적으로 등록되었습니다.');
        navigate('/todos');
      } else {
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.log('데이터 추가에 실패하였습니다.', error);
      alert(`데이터 추가에 실패하였습니다., ${error}`);
    } finally {
      setSaving(false);
    }
  };

  // 사용자 정보
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

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">❗새 할 일 작성</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 새로운 할일</p>}
      </div>
      {/* 입력창 */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={e => handleTitleChange(e)}
            placeholder="할 일을 입력해 주세요."
            disabled={saving}
          />
        </div>
        <div className="form-group">
          <label className="form-label">상세 내용</label>
          <textarea
            className="form-input"
            value={content}
            onChange={e => handleContentChange(e)}
            rows={6}
            placeholder="상세 내용을 입력해 주세요.(선택사항)"
            disabled={saving}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ 등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoWritePage;
