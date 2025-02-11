import { Theme } from '@/app/providers/constant/theme';
import ThemeContext from '@/app/providers/ui/ThemeContext';
import withProviders from '@/app/providers/ui/withProviders';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import Button from '@/shared/ui/Button/Button';
import { type ComponentType, type JSX, use } from 'react';

function App(): JSX.Element {
  const { changeTheme, currentThemeValue } = use(ThemeContext);

  return (
    <>
      <select
        onChange={(e) => changeTheme(e.target.value)}
        title="Select Theme"
        value={currentThemeValue}
        id="theme-select"
      >
        {Object.values(Theme).map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <Button />
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

const AppWithProviders: ComponentType = withProviders(App);

export default AppWithProviders;
