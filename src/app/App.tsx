import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import { type JSX, use } from 'react';
import ThemeContext from './ui/ThemeContext';
import ThemeProvider from './ui/ThemeProvider';
import isTheme from './ui/isTheme';

function All(): JSX.Element {
  const { changeTheme, theme } = use(ThemeContext);

  return (
    <>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (isTheme(value)) changeTheme(value);
        }}
        title="Select theme"
        value={theme}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <All />
    </ThemeProvider>
  );
}

export default App;
