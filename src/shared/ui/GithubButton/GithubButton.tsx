import type { JSX } from 'react';
import GithubIcon from '../GithubIcon/GithubIcon';

function GithubButton(): JSX.Element {
  return (
    <a
      href="https://github.com/jlsuh/visually"
      rel="noopener noreferrer"
      target="_blank"
    >
      <GithubIcon />
    </a>
  );
}

export default GithubButton;
