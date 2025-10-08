function generateRandomAngle(): number {
  return Math.random() * 2 * Math.PI;
}

function generateSeed() {
  return (Math.random() * 2 ** 32) >>> 0;
}

function xoshiro128ss(
  a: number = generateSeed(),
  b: number = generateSeed(),
  c: number = generateSeed(),
  d: number = generateSeed(),
) {
  return (): number => {
    let t = b << 9,
      r = b * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
}

export { generateRandomAngle, xoshiro128ss };
