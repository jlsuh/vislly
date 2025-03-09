import type { JSX } from 'react';
import GithubIcon from '../GithubIcon/GithubIcon.tsx';

function GithubButton(): JSX.Element {
  return (
    <a
      href="https://github.com/jlsuh/vislly"
      rel="noopener noreferrer"
      target="_blank"
    >
      <GithubIcon />
    </a>
  );
}

export default GithubButton;
