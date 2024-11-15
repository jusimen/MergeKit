/**
 * Returns a map of array values and their occurrence count
 *
 * @example
 * countOccurrences([1, 2], [2, 3]); // { 1: 1, 2: 2, 3: 1 }
 *
 * @param {...any[]} arrays - Arrays to be compared
 * @return {Record<string, number>} Array values and their occurrence count
 */
export function countOccurrences(...arrays: any[][]): Record<string, number> {
  const countObj: Record<string, number> = {};

  arrays.forEach(array => {
    array.forEach(v => {
      const key = String(v);
      countObj[key] = key in countObj ? ++countObj[key] : 1;
    });
  });

  return countObj;
}

/**
 * Returns values found in all arrays
 *
 * @example
 * getInAll([1, 2], [2, 3]); // [2]
 * getInAll([1, 2, 3], [2, 3, 4], [3, 4, 5]); // [3]
 * getInAll([1, 2, 3, 'x'], [2, 3, 4, 'x'], [3, 4, 5]); // [3]
 *
 * @param {...any[]} arrays - Arrays to be compared
 * @return {any[]} List of values
 */
export function getInAll(...arrays: any[][]): any[] {
  return arrays.reduce((acc, curr) =>
    acc.filter(value => new Set(curr).has(value))
  );
}

/**
 * Returns values found in multiple (possibly all) arrays
 *
 * @example
 * getInMultiple([1, 2], [2, 3]); // [2]
 * getInMultiple([1, 2, 3], [2, 3, 4], [3, 4, 5]); // [2, 3, 4]
 * getInMultiple([1, 2, 3, 'x'], [2, 3, 4, 'x'], [3, 4, 5]); // [2, 3, 4, 'x']
 *
 * @param {...any[]} arrays - Arrays to be compared
 * @return {any[]} List of values
 */
export function getInMultiple(...arrays: any[][]): any[] {
  const countObj = countOccurrences(...arrays);

  return Object.keys(countObj)
    .filter(v => countObj[v] > 1)
    .map(key => parseValue(key));
}

/**
 * Returns values not found in all arrays
 *
 * @example
 * getNotInAll([1, 2], [2, 3]); // [1, 3]
 * getNotInAll([1, 2, 3], [2, 3, 4], [3, 4, 5]); // [1, 2, 4, 5]
 * getNotInAll([1, 2, 3, 'x'], [2, 3, 4, 'x'], [3, 4, 5]); // [1, 2, 4, 5, 'x']
 *
 * @param {...any[]} arrays - Arrays to be compared
 * @return {any[]} List of values
 */
export function getNotInAll(...arrays: any[][]): any[] {
  const countObj = countOccurrences(...arrays);

  return Object.keys(countObj)
    .filter(v => countObj[v] < arrays.length)
    .map(key => parseValue(key));
}

/**
 * Returns values found in one array only (i.e. not multiple)
 *
 * @example
 * getNotInMultiple([1, 2], [2, 3]); // [1, 3]
 * getNotInMultiple([1, 2, 3], [2, 3, 4], [3, 4, 5]); // [1, 5]
 * getNotInMultiple([1, 2, 3, 'x'], [2, 3, 4, 'x'], [3, 4, 5]); // [1, 5]
 *
 * @param {...any[]} arrays - Arrays to be compared
 * @return {any[]} List of values
 */
export function getNotInMultiple(...arrays: any[][]): any[] {
  const countObj = countOccurrences(...arrays);

  return Object.keys(countObj)
    .filter(v => countObj[v] === 1)
    .map(key => parseValue(key));
}

/**
 * Returns array of an object's own keys and (optionally) the enumerable keys
 * from the object's prototype chain.
 *
 * @example
 * getObjectKeys({ a: 1 }); // ['a']
 * getObjectKeys({ a: 1 }, true); // ['a', 'b', 'c', ...]
 *
 * @param {object} obj - Object to parse
 * @param {boolean} [hoistEnumerable=false] include enumerable prototype properties
 * @return {string[]} List of keys
 */
export function getObjectKeys(
  obj: object,
  hoistEnumerable: boolean = false
): string[] {
  const keys: string[] = Object.getOwnPropertyNames(obj);

  if (hoistEnumerable) {
    for (const key in obj) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  }

  return keys;
}

/**
 * Determines if the value passed was created using the Object constructor
 *
 * @param {*} value - Value to test
 * @return {boolean}
 */
export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Determines if the value passed is a property descriptor
 *
 * @param {*} obj - Value to test
 * @return {boolean}
 */
export function isPropDescriptor(obj: any): obj is PropertyDescriptor {
  if (!isObject(obj)) {
    return false;
  }

  const hasFlagKey = ['writable', 'enumerable', 'configurable'].some(
    key => key in obj
  );
  const hasMethod = ['get', 'set'].some(key => typeof obj[key] === 'function');
  const hasMethodKeys = ['get', 'set'].every(key => key in obj);

  let isDescriptor =
    ('value' in obj && hasFlagKey) ||
    (hasMethod && (hasMethodKeys || hasFlagKey));

  // Test for invalid key(s)
  if (isDescriptor) {
    const validKeys = new Set([
      'configurable',
      'get',
      'set',
      'enumerable',
      'value',
      'writable'
    ]);

    isDescriptor = Object.keys(obj).every(key => validKeys.has(key));
  }

  return isDescriptor;
}

/**
 * Helper function to parse string keys back to their original types.
 * Note: This assumes that the original values can be correctly parsed from strings.
 *
 * @param key - The key to parse.
 * @returns The parsed value.
 */
function parseValue(key: string): any {
  try {
    return JSON.parse(key);
  } catch {
    return key;
  }
}
