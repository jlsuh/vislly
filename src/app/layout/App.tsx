import type { JSX, PropsWithChildren } from 'react';
import Footer from './Footer.tsx';
import Header from './Header.tsx';
import Main from './Main.tsx';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}

export default App;
