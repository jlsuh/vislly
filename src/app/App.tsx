import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import { type JSX, use } from 'react';
import isColorSchemeValue from './lib/isColorSchemeValue';
import ColorSchemeContext from './providers/ColorSchemeContext';
import ColorSchemeProvider from './providers/ColorSchemeProvider';

function All(): JSX.Element {
  const { changeColorScheme, colorScheme } = use(ColorSchemeContext);

  return (
    <>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (isColorSchemeValue(value)) changeColorScheme(value);
        }}
        title="Select Color Scheme"
        value={colorScheme}
      >
        <option value="light dark">System Default</option>
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
    <ColorSchemeProvider>
      <All />
    </ColorSchemeProvider>
  );
}

export default App;
