import Link from 'next/link';
import type { JSX } from 'react';
import CodebergIcon from '../CodebergIcon/CodebergIcon.tsx';
import IconButton from '../IconButton/IconButton.tsx';

type CodebergButtonProps = {
  href: string;
};

function CodebergButton({ href }: CodebergButtonProps): JSX.Element {
  return (
    <Link
      href={href}
      prefetch={false}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IconButton isCheckboxControlled={false}>
        <CodebergIcon />
      </IconButton>
    </Link>
  );
}

export default CodebergButton;
