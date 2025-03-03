import type { JSX, PropsWithChildren } from 'react';
import Header from './layout/Header.tsx';
import Main from './layout/Main.tsx';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header />
      <Main>{children}</Main>
    </>
  );
}

export default App;
