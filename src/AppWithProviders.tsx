import ThemeSelect from '@/app/providers/ui/ThemeSelect';
import withProviders from '@/app/providers/ui/withProviders';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import Header from '@/shared/ui/Header/Header';
import type { ComponentType, JSX } from 'react';

function App(): JSX.Element {
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
