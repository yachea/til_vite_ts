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
      <div className="page-header">
        <h2 className="page-title">🍈 할 일 관리</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 Todo 관리</p>}
      </div>

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
