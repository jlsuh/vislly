import type { ComponentType } from 'react';
import { BrowserRouter } from 'react-router';
import ThemeProvider from './theme/ThemeProvider';
import withProvider from './withProvider';

const PROVIDERS = [BrowserRouter, ThemeProvider];

function withProviders(Component: ComponentType): ComponentType {
  return PROVIDERS.reduceRight(
    (ComponentWrappedWithProviders, Provider) =>
      withProvider(Provider, ComponentWrappedWithProviders),
    Component,
  );
}

export default withProviders;
