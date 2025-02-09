import { ColorScheme, type ColorSchemeValue } from './color-scheme';

function isColorSchemeValue(
  colorScheme: string | null,
): colorScheme is ColorSchemeValue {
  return (
    colorScheme !== null &&
    Object.values(ColorScheme).some(
      (colorSchemeValue) => colorSchemeValue === colorScheme,
    )
  );
}

export default isColorSchemeValue;
