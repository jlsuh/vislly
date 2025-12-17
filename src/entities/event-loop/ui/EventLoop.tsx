'use client';

import { parse } from '@babel/parser';
import type { JSX } from 'react';

function EventLoop(): JSX.Element {
  const tsCode = `import { Something } from 'somewhere';
                  function A() {
                    return -1;
                  }
                  setTimeout(() => {
                    console.log('hi');
                  });
  `;
  try {
    const babelAST = parse(tsCode, {
      sourceType: 'module',
      plugins: ['estree'],
    });
    console.log('Babel AST:\n', JSON.stringify(babelAST.program, null, 2));
  } catch (error) {
    console.error(
      'Error parsing code (Strict JS Only):',
      JSON.stringify(error, null, 2),
    );
  }

  return <></>;
}

export default EventLoop;
