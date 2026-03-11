function sanitizeInput(rawInput: string, pattern: string): string {
  const regex = new RegExp(`^${pattern}$`);
  if (rawInput === '' || regex.test(rawInput)) return rawInput;
  let sanitized = '';
  for (const char of rawInput) {
    if (regex.test(sanitized + char)) {
      sanitized += char;
    }
  }
  return sanitized;
}

function findInsertionDiff(oldText: string, newText: string) {
  const canExtendPrefix = (index: number) =>
    index < oldText.length &&
    index < newText.length &&
    oldText[index] === newText[index];
  let prefixLen = 0;
  while (canExtendPrefix(prefixLen)) {
    ++prefixLen;
  }
  const canExtendSuffix = (suffixIndex: number) =>
    suffixIndex < oldText.length - prefixLen &&
    suffixIndex < newText.length - prefixLen &&
    oldText[oldText.length - 1 - suffixIndex] ===
      newText[newText.length - 1 - suffixIndex];
  let suffixLen = 0;
  while (canExtendSuffix(suffixLen)) {
    ++suffixLen;
  }
  return {
    prefix: oldText.slice(0, prefixLen),
    suffix: suffixLen === 0 ? '' : oldText.slice(-suffixLen),
    inserted: newText.slice(prefixLen, newText.length - suffixLen),
  };
}

function findMaxValidText({
  evaluateFn,
  inserted,
  pattern,
  prefix,
  suffix,
}: {
  evaluateFn: (text: string) => number;
  inserted: string;
  pattern: string;
  prefix: string;
  suffix: string;
}): {
  bits: number;
  insertedLength: number;
  validText: string;
} {
  const regex = new RegExp(`^${pattern}$`);
  let low = 0;
  let high = inserted.length;
  let optimalInsert = '';
  let optimalBits = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testInsert = inserted.slice(0, mid);
    const testStr = prefix + testInsert + suffix;
    if (testStr !== '' && !regex.test(testStr)) {
      high = mid - 1;
      continue;
    }
    const remainingBits = evaluateFn(testStr);
    if (remainingBits >= 0) {
      optimalInsert = testInsert;
      optimalBits = remainingBits;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return {
    validText: prefix + optimalInsert + suffix,
    bits: optimalBits,
    insertedLength: optimalInsert.length,
  };
}

export { findInsertionDiff, findMaxValidText, sanitizeInput };
