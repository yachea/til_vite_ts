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
