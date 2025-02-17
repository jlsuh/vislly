import type { ComponentType } from 'react';
import { PROVIDERS } from './providers';
import withProvider from './withProvider';

function withProviders(Component: ComponentType): ComponentType {
  return PROVIDERS.reduceRight(
    (ComponentWrappedWithProviders, Provider) =>
      withProvider(Provider, ComponentWrappedWithProviders),
    Component,
  );
}

export default withProviders;
