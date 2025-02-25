import Layout from '@/app/layout/Layout.tsx';
import type { JSX } from 'react';

function App(): JSX.Element {
  return (
    <Layout>
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
    </Layout>
  );
}

export default App;
