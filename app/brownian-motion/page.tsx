import type { JSX } from 'react';
import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';

export default function Page(): JSX.Element {
  return (
    <article>
      <h1>Brownian Motion</h1>
      <BrownianMotion />
    </article>
  );
}
