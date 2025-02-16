import ThemeContext from '@/app/providers/ui/ThemeContext';
import withProviders from '@/app/providers/ui/withProviders';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import Header from '@/shared/ui/Header/Header';
import ThemeSelect from '@/shared/ui/ThemeSelect/ThemeSelect';
import { type ComponentType, type JSX, use } from 'react';

function App(): JSX.Element {
  const { changeTheme, currentThemeValue } = use(ThemeContext);

  const handleOnChangeTheme = (value: string) => {
    changeTheme(value);
  };

  return (
    <>
      <Header />
      <ThemeSelect />
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

const AppWithProviders: ComponentType = withProviders(App);

export default AppWithProviders;
