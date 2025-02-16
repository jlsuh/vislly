import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import type { ComponentType, JSX } from 'react';
import Header from './app/layout/Header';
import withProviders from './app/providers/ui/withProviders';

function App(): JSX.Element {
  return (
    <>
      <Header />
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

const AppWithProviders: ComponentType = withProviders(App);

export default AppWithProviders;
