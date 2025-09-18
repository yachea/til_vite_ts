import { useState } from 'react';

type NameEditorProps = {
  children?: React.ReactNode;
};
const NameEditor = ({}: NameEditorProps) => {
  const [name, setName] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  const handleClick = (): void => {
    setName('');
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      setName('');
    }
  };

  return (
    <div>
      <h2>NameEditor: {name}</h2>
      <div>
        <input
          type="text"
          value={name}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default NameEditor;
