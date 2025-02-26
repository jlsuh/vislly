import type { JSX } from 'react';
import type { DataRouter, RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import Layout from '../layout/Layout.tsx';

type Loadable = Promise<{ Component: () => JSX.Element }>;

const ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'brownian-motion',
        async lazy(): Loadable {
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
