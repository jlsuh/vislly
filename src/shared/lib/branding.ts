declare const __brand: unique symbol;

type Brand<B> = { readonly [__brand]: B };
type Branded<T, B extends string> = T & Brand<B>;

function make<T>(validator: (value: unknown) => asserts value is T) {
  return (value: unknown): T => {
    validator(value);
    return value;
  };
}

export { make, type Brand, type Branded };
