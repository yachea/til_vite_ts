type SampleProps = {
  age: number;
  nickname: string;
  children?: React.ReactNode;
};
const Sample = ({ age, nickname, children }: SampleProps) => {
  return (
    <div>
      {age}살이고요. 별명이 {nickname} 인 샘플입니다.
    </div>
  );
};
const App = () => {
  return (
    <div>
      <h1>App</h1>
      <Sample age={20} nickname="홍길동" />
    </div>
  );
};

export default App;
