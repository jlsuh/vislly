import type { JSX } from 'react';
import EventLoop from '@/entities/event-loop/ui/EventLoop.tsx';
import styles from './page.module.css';

export default function EventLoopPage(): JSX.Element {
  return (
    <article className={styles.eventLoopArticle}>
      <h1>Event Loop</h1>
      <EventLoop />
    </article>
  );
}
