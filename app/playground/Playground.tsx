'use client';

import type { JSX } from 'react';
import Button from '@/shared/ui/Button/Button.tsx';
import PauseIcon from '@/shared/ui/PauseIcon/PauseIcon.tsx';
import PlayIcon from '@/shared/ui/PlayIcon/PlayIcon.tsx';

export default function Playground(): JSX.Element {
  return (
    <>
      <Button
        fullWidth
        handleOnClickButton={() => console.log('clicked')}
        icon={<PlayIcon />}
        label="Play"
      />
      <Button
        fullWidth
        handleOnClickButton={() => console.log('clicked')}
        icon={<PauseIcon />}
        label="Play"
      />
    </>
  );
}
