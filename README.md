# react-router-dom

## 1. 설치

- v7은 조금 문제가 있어서, v6 사용

```bash
npm i react-router-dom@6.30.1
```

## 2. 폴더 및 파일 구조

- `/src/pages` 폴더 생성
- `/src/pages/HomePage.tsx` 파일 생성

```tsx
import React from 'react';

function HomePage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fafafa',
    marginTop: 12,
    textAlign: 'center',
  };
  return (
    <div style={box}>
      <h2>HomePage</h2>
      <div>환영합니다!😘</div>
      <p>이곳은 홈 화면입니다. 상단 메뉴에서 쇼핑을 해주세요.</p>
    </div>
  );
}

export default HomePage;
```

- `/src/pages/GoosPage.tsx` 파일 생성

```tsx
import React from 'react';
import GoodList from '../components/shop/GoodList';
import Cart from '../components/shop/Cart';

function GoosPage() {
  return (
    <div>
      <h2>🎁판매 제품 리스트</h2>
      <div>
        <GoodList />
        <Cart />
      </div>
    </div>
  );
}

export default GoosPage;
```

- `/src/pages/CartPage.tsx` 파일 생성

```tsx
import React from 'react';
import Cart from '../components/shop/Cart';

function CartPage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fafafa',
    marginTop: 12,
    textAlign: 'center',
  };

  return (
    <div style={box}>
      <h2>장바구니</h2>
      <div>
        <Cart />
      </div>
    </div>
  );
}

export default CartPage;
```

- `/src/pages/WalletPage.tsx` 파일 생성

```tsx
import React from 'react';
import Wallet from '../components/shop/Wallet';

function WalletPage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fafafa',
    marginTop: 12,
    textAlign: 'center',
  };

  return (
    <div style={box}>
      <h2>내지감</h2>
      <div>
        <Wallet />
      </div>
    </div>
  );
}

export default WalletPage;
```

- `/src/pages/NotFound.tsx` 파일 생성
- App.tsx

```tsx
import React from 'react';
import Cart from './components/shop/Cart';
import GoodList from './components/shop/GoodList';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './features/shop';
import { NavLink, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GoosPage from './pages/GoosPage';
import CartPage from './pages/CartPage';
import WalletPage from './pages/WalletPage';
import NotFound from './pages/NotFound';

function App() {
  // ts 자리
  const page: React.CSSProperties = {
    maxWidth: 960,
    margin: '0 auto',
    padding: 24,
    background: 'skyblue',
  };
  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 20,
    alignItems: 'start',
  };

  const menu: React.CSSProperties = {
    display: 'flex',
    gap: 15,
    padding: 16,
    borderBottom: '1px solid #e5e7eb',
  };
  // 링크 관련
  const link: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #fff',
    textDecoration: 'none',
  };
  const active: React.CSSProperties = {
    fontWeight: 700,
    textDecoration: 'underline',
  };

  // tsx 자리
  return (
    <Router>
      <div style={page}>
        <nav style={menu}>
          <NavLink to={'/'} style={link}>
            {({ isActive }) => <span style={isActive ? active : undefined}>홈</span>}
          </NavLink>
          <NavLink to={'/goods'} style={link}>
            {({ isActive }) => <span style={isActive ? active : undefined}>제품목록</span>}
          </NavLink>
          <NavLink to={'/cart'} style={link}>
            {({ isActive }) => <span style={isActive ? active : undefined}>장바구니</span>}
          </NavLink>
          <NavLink to={'/wallet'} style={link}>
            {({ isActive }) => <span style={isActive ? active : undefined}>내지갑</span>}
          </NavLink>
        </nav>
        <h1>🧶 나의 가게</h1>
        <ShopProvider>
          <div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/goods" element={<GoosPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ShopProvider>
      </div>
    </Router>
  );
}

export default App;
```
