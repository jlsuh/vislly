import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import type { ChangeEvent, JSX } from 'react';

const changeTheme = (e: ChangeEvent<HTMLSelectElement>) => {
  const { value } = e.target;
  document.documentElement.dataset.theme = value;
  localStorage.setItem('theme', value);
};

function App(): JSX.Element {
  return (
    <>
      <select id="theme" onChange={changeTheme} title="Select theme">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

export default App;
