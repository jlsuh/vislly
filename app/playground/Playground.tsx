'use client';

import { type JSX, useState } from 'react';
import Checkbox from '@/shared/ui/Checkbox/Checkbox.tsx';

export default function Playground(): JSX.Element {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Checkbox
        checked={checked}
        disabled={false}
        handleOnChangeCheckbox={() => setChecked(!checked)}
        label="Checkbox"
      />
    </>
  );
}
