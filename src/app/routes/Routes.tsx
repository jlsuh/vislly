import App from '@/App.tsx';
import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'brownian-motion',
        Component: lazy(
          () => import('@/entities/brownian-motion/ui/BrownianMotion.tsx'),
        ),
      },
    ],
  },
];

export default ROUTES;
