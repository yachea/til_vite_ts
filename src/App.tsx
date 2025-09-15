import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Protected from './components/Protected';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminPage from './pages/AdminPage';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SingUpPage from './pages/SingUpPage';
import TodosPage from './pages/TodosPage';
import TodosInfinitePage from './pages/TodosInfinitePage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 true/false
  const isAdmin = user?.email === 'dev.yachea@gmail.com';
  return (
    <nav className="nav">
      <Link to="/" className="nav-link">
        홈
      </Link>
      {user && (
        <Link to="/todos" className="nav-link">
          할일
        </Link>
      )}
      {user && (
        <Link to="/todos-infinite" className="nav-link">
          무한스크롤 할일
        </Link>
      )}
      {!user && (
        <Link to="/signup" className="nav-link">
          회원가입
        </Link>
      )}
      {!user && <Link to="/signin">로그인</Link>}
      {user && (
        <Link to="/profile" className="nav-link">
          프로필
        </Link>
      )}
      {user && (
        <button onClick={signOut} className="btn-secondary btn-sm">
          로그아웃
        </button>
      )}
      {isAdmin && (
        <Link to="/admin" className="nav-link">
          관리자
        </Link>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📢Todo Service</h1>
        </div>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SingUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/todos"
              element={
                <Protected>
                  <TodosPage />
                </Protected>
              }
            />
            <Route
              path="/todos-infinite"
              element={
                <Protected>
                  <TodosInfinitePage />
                </Protected>
              }
            />
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected>
                  <AdminPage />
                </Protected>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
