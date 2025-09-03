import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SingUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹 브라우저 갱신 막기
    e.preventDefault();

    // 회원가입 하기
    const { error } = await signUp(email, pw);
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(`회원가입이 성공됐습니다. 이메일 인증 링크를 확인해주세요.`);
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={e => handleSubmit(e)}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SingUpPage;
