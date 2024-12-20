import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import type { ChangeEvent, JSX } from 'react';

const changeTheme = (e: ChangeEvent<HTMLSelectElement>) => {
  const { value } = e.target;
  if (value !== 'light') {
    document.documentElement.classList.remove('light');
    return;
  }
  document.documentElement.classList.add('light');
};

function App(): JSX.Element {
  return (
    <>
      <select
        id="theme"
        className="border-info text-info text-center p-5 rounded-5 text-sm bg-primary"
        onChange={changeTheme}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

export default App;
