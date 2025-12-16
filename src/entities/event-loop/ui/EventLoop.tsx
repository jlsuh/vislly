import { parse } from '@babel/parser';
import type { JSX } from 'react';

function EventLoop(): JSX.Element {
  const tsxCode = `
    import type { JSX } from 'react';
    function A(): JSX.Element {
      return <div>Hello</div>;
    }
    setTimeout(() => {
      console.log('hi');
    });
  `;
  const babelAST = parse(tsxCode, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'estree'],
    tokens: false,
  });
  console.log('Babel AST:\n', JSON.stringify(babelAST.program, null, 2));
  return <></>;
}

export default EventLoop;
