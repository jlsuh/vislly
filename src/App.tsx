import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import { type ComponentType, type JSX, type ReactNode, use } from 'react';
import { BrowserRouter } from 'react-router';
import isColorSchemeValue from './app/lib/isColorSchemeValue';
import { ColorScheme } from './app/model/color-scheme';
import ColorSchemeContext from './app/providers/ColorSchemeContext';
import ColorSchemeProvider from './app/providers/ColorSchemeProvider';

function Main(): JSX.Element {
  const { changeColorScheme, colorScheme } = use(ColorSchemeContext);

  return (
    <>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (isColorSchemeValue(value)) changeColorScheme(value);
        }}
        title="Select Color Scheme"
        value={colorScheme}
        id="color-scheme-select"
      >
        <option value={ColorScheme.Auto}>System Default</option>
        <option value={ColorScheme.Dark}>Dark</option>
        <option value={ColorScheme.Light}>Light</option>
      </select>
      <h1>Hello world!</h1>
      <BrownianMotion />
    </>
  );
}

function withProvider(
  WrappedComponent: ComponentType,
  Provider: ComponentType<{ children: ReactNode }>,
) {
  function WithProvider() {
    return (
      <Provider>
        <WrappedComponent />
      </Provider>
    );
  }
  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const providerName = Provider.displayName || Provider.name || 'Provider';
  WithProvider.displayName = `with${providerName}(${wrappedComponentName})`;
  return WithProvider;
}

const providers = [BrowserRouter, ColorSchemeProvider];

function withProviders(Component: ComponentType) {
  return providers.reduceRight((AccumulatedComponent, Provider) => {
    return withProvider(AccumulatedComponent, Provider);
  }, Component);
}

const App: ComponentType = withProviders(Main);

export default App;
