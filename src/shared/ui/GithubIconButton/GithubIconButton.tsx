import Link from 'next/link';
import type { JSX } from 'react';
import GithubIcon from '../GithubIcon/GithubIcon.tsx';
import IconButton from '../IconButton/IconButton.tsx';

type GithubIconButtonProps = {
  href: string;
};

function GithubIconButton({ href }: GithubIconButtonProps): JSX.Element {
  return (
    <Link
      href={href}
      prefetch={false}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IconButton isCheckboxControlled={false}>
        <GithubIcon />
      </IconButton>
    </Link>
  );
}

export default GithubIconButton;
