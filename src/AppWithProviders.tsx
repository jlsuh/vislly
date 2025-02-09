import ThemeContext from '@/app/providers/ThemeContext';
import withProviders from '@/app/providers/withProviders';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import isThemeValue from '@/shared/lib/theme/isThemeValue';
import { Theme } from '@/shared/lib/theme/theme';
import { type ComponentType, type JSX, use } from 'react';

function App(): JSX.Element {
  const { changeTheme, theme } = use(ThemeContext);

  return (
    <>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (isThemeValue(value)) changeTheme(value);
        }}
        title="Select Theme"
        value={theme}
        id="theme-select"
      >
        <option value={Theme.Auto}>System Default</option>
        <option value={Theme.Dark}>Dark</option>
        <option value={Theme.Light}>Light</option>
      </select>
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

const AppWithProviders: ComponentType = withProviders(App);

export default AppWithProviders;
