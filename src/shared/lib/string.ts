import { composeRandomFlooredIntegerBetween } from './random';

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateRandomNumericStringOfLength(length: number): string {
  return Array.from({ length }, () =>
    composeRandomFlooredIntegerBetween(0, 10),
  ).join('');
}

export { capitalizeFirstLetter, generateRandomNumericStringOfLength };
