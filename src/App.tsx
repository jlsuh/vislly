import BrownianMotion from '@/entities/brownian-motion/ui/BrownianMotion';
import { type ComponentType, type JSX, type ReactNode, use } from 'react';
import { BrowserRouter } from 'react-router';
import ThemeContext from './app/providers/ThemeContext';
import ThemeProvider from './app/providers/ThemeProvider';
import isThemeValue from './shared/lib/theme/isThemeValue';
import { Theme } from './shared/lib/theme/theme';

function Main(): JSX.Element {
  const { changeTheme, theme } = use(ThemeContext);

  return (
    <>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (isThemeValue(value)) changeTheme(value);
        }}
        title="Select Theme"
        value={theme}
        id="theme-select"
      >
        <option value={Theme.Auto}>System Default</option>
        <option value={Theme.Dark}>Dark</option>
        <option value={Theme.Light}>Light</option>
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

const providers = [BrowserRouter, ThemeProvider];

function withProviders(Component: ComponentType) {
  return providers.reduceRight((AccumulatedComponent, Provider) => {
    return withProvider(AccumulatedComponent, Provider);
  }, Component);
}

const App: ComponentType = withProviders(Main);

export default App;
