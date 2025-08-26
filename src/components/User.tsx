import { useEffect, useState } from 'react';

type UserProps = {
  children?: React.ReactNode;
  name: string;
  age: number;
};
export type UserType = {
  name: string;
  age: number;
};
const User = ({ name, age }: UserProps): JSX.Element => {
  const [user, setUser] = useState<UserType | null>(null);
  const handleClick = (): void => {
    // 타입 좁히기 if로 타입을 좁혔다.
    if (user) {
      setUser({ ...user, age: user.age + 1 });
    }
  };
  useEffect(() => {
    setUser({ name, age });
  }, []);

  return (
    <div>
      <h2>
        User :{/* 타입좁히기 3항연산자로 타입을 좁혔다. */}
        {user ? (
          <span>
            {user.name}님의 나이는 {user.age}살 입니다.
          </span>
        ) : (
          '사용자 정보가 없습니다.'
        )}
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
