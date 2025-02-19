import type { ComponentType, JSX, PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router';
import type { ReadonlyDeep } from 'type-fest';
import ThemeProvider from './ThemeProvider.tsx';

type Provider = ComponentType<PropsWithChildren>;

interface Wrap {
  Wrappable: ComponentType;
  Wrapper: Provider;
}

const PROVIDERS: ReadonlyDeep<Provider[]> = [BrowserRouter, ThemeProvider];

/**
 * @param Wrappable.displayName - Used for debugging purposes in user-defined components.
 * @param Wrappable.name - Used for debugging purposes in HTML elements.
 * @param Wrapper.displayName - Used for debugging purposes in user-defined components.
 * @param Wrapper.name - Used for debugging purposes in HTML elements.
 */
function composeDisplayName({ Wrappable, Wrapper }: Wrap): string {
  const wrappableName = Wrappable.displayName || Wrappable.name || 'Component';
  const wrapperName = Wrapper.displayName || Wrapper.name || 'Provider';
  return `with${wrapperName}(${wrappableName})`;
}

function withProvider({ Wrappable, Wrapper }: Wrap): ComponentType {
  function WithProvider(): JSX.Element {
    return (
      <Wrapper>
        <Wrappable />
      </Wrapper>
    );
  }
  WithProvider.displayName = composeDisplayName({ Wrappable, Wrapper });
  return WithProvider;
}

function withProviders(Component: ComponentType): ComponentType {
  return PROVIDERS.reduceRight(
    (Wrappable, Wrapper) => withProvider({ Wrappable, Wrapper }),
    Component,
  );
}

export default withProviders;
