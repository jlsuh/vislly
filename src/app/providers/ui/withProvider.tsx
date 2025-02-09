import type { ComponentType, ReactNode } from 'react';

type Provider = ComponentType<{ children: ReactNode }>;

function composeDisplayName(
  Provider: Provider,
  WrappedComponent: ComponentType,
): string {
  const providerName = Provider.displayName || Provider.name || 'Provider';
  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return `with${providerName}(${wrappedComponentName})`;
}

function withProvider(
  Provider: Provider,
  WrappedComponent: ComponentType,
): ComponentType {
  function WithProvider() {
    return (
      <Provider>
        <WrappedComponent />
      </Provider>
    );
  }
  WithProvider.displayName = composeDisplayName(Provider, WrappedComponent);
  return WithProvider;
}

export default withProvider;
