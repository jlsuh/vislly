import type BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion.tsx';
import type { DataRouter, RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import Layout from '../layout/Layout.tsx';

const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'brownian-motion',
        async lazy(): Promise<{ Component: typeof BrownianMotion }> {
          const { default: Component } = await import(
            '@/entities/brownian-motion/ui/BrownianMotion.tsx'
          );
          return { Component };
        },
      },
    ],
  },
];

const ROUTER: DataRouter = createBrowserRouter(ROUTES);

export default ROUTER;
