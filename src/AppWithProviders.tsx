import type { ComponentType, JSX } from 'react';
import Header from './app/layout/Header.tsx';
import withProviders from './app/providers/withProviders.tsx';
import BrownianMotion from './entities/brownian-motion/ui/BrownianMotion.tsx';

function App(): JSX.Element {
  return (
    <>
      <Header />
      <h1>Hello world!</h1>
      <h1
        style={{
          fontFamily: 'Mona Sans',
        }}
      >
        Hello world!
      </h1>
      <h1>g f</h1>
      <p
        style={{
          fontFamily: 'MonaSansFallback',
          fontStyle: 'italic',
          fontWeight: 'bold',
        }}
      >
        Hello world!
      </p>
      <br />
      <b
        style={{
          fontFamily: 'MonaspaceNeonFallback',
        }}
      >
        Hello world!
      </b>
      <br />
      <i>Hello world!</i>
      <br />
      <b>Hello world!</b>
      <br />
      <p>Hello world!</p>
      <BrownianMotion />
    </>
  );
}

const AppWithProviders: ComponentType = withProviders(App);

export default AppWithProviders;
