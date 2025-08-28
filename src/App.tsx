import React from 'react';
import Cart from './components/shop/Cart';
import GoodList from './components/shop/GoodList';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './features/shop';

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
  // tsx 자리
  return (
    <div style={page}>
      <h1>🧶 나의 가게</h1>
      <ShopProvider>
        <div style={grid}>
          <div>
            <GoodList />
            <Cart />
          </div>
          <div>
            <Wallet />
          </div>
        </div>
      </ShopProvider>
    </div>
  );
}

export default App;
