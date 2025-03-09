import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import type { JSX } from 'react';

export default function Page(): JSX.Element {
  return (
    <>
      <h1>Brownian Motion</h1>
      <BrownianMotion />
    </>
  );
}
