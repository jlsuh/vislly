import { lazy } from 'react';
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
        Component: lazy(
          () => import('@/entities/brownian-motion/ui/BrownianMotion.tsx'),
        ),
      },
    ],
  },
];

const ROUTER: DataRouter = createBrowserRouter(ROUTES);

export default ROUTER;
