import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import { type JSX, use } from 'react';
import isColorSchemeValue from './lib/isColorSchemeValue';
import ColorScheme from './model/color-scheme';
import ColorSchemeContext from './providers/ColorSchemeContext';
import ColorSchemeProvider from './providers/ColorSchemeProvider';

function Main(): JSX.Element {
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
        <option value={ColorScheme.Auto}>System Default</option>
        <option value={ColorScheme.Dark}>Dark</option>
        <option value={ColorScheme.Light}>Light</option>
      </select>
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

function App(): JSX.Element {
  return (
    <ColorSchemeProvider>
      <Main />
    </ColorSchemeProvider>
  );
}

export default App;
