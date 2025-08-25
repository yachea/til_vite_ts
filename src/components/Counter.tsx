import { useState } from 'react';
type CounterProps = {};
type VoidFun = () => void;

const Counter = ({}: CounterProps): JSX.Element => {
  const [count, setCount] = useState<number>(0);
  const add: VoidFun = (): void => {
    setCount(count + 1);
  };
  const minus: VoidFun = (): void => {
    setCount(count - 1);
  };
  const reset: VoidFun = (): void => {
    setCount(0);
  };
  return (
    <div>
      <h1>Counter : {count}</h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
};

export default Counter;
