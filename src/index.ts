import {
  getInMultiple,
  getInAll,
  getNotInMultiple,
  getNotInAll,
  getObjectKeys,
  isObject,
  isPropDescriptor
} from './utils';

import type { MergekitOptions } from './types';

const defaults: MergekitOptions = {
  // Keys
  onlyKeys: [],
  skipKeys: [],
  onlyCommonKeys: false,
  onlyUniversalKeys: false,
  skipCommonKeys: false,
  skipUniversalKeys: false,
  onlyObjectWithKeyValues: [],

  // Values
  invokeGetters: false,
  skipSetters: false,
  // Arrays
  appendArrays: false,
  prependArrays: false,
  dedupArrays: false,
  sortArrays: false,
  // Prototype
  hoistEnumerable: false,
  hoistProto: false,
  skipProto: false,
  // Callbacks
  onCircular: () => {}
};

/**
 * Merges multiple objects into one, with various options for customization.
 *
 * @param {object[] | object} objects - The objects to be merged. Can be a single object or an array of objects.
 * @param {Partial<MergekitOptions>} [options=defaults] - Optional settings to customize the merge behavior.
 * @returns {object} - The merged object.
 *
 * @example
 * // Basic usage
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { b: 3, c: 4 };
 * const result = mergekit([obj1, obj2]);
 * // result: { a: 1, b: 3, c: 4 }
 *
 * @example
 * // Using options
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { b: 3, c: 4 };
 * const options = { onlyCommonKeys: true };
 * const result = mergekit([obj1, obj2], options);
 * // result: { b: 3 }
 *
 * @example
 * // Merging with custom prototype properties
 * function CustomProto() {}
 * CustomProto.prototype.customMethod = function() { return 'custom'; };
 * const obj1 = new CustomProto();
 * obj1.a = 1;
 * const obj2 = { b: 2 };
 * const result = mergekit([obj1, obj2]);
 * // result: { a: 1, b: 2, customMethod: [Function] }
 */
export function mergekit(
  objects: object[] | object,
  options: Partial<MergekitOptions> = defaults
) {
  const settings = { ...defaults, ...options };

  const dedupArrayMap = new Map();
  const sortArrayMap = new Map();
  const sortArrayFn =
    typeof settings.sortArrays === 'function' ? settings.sortArrays : undefined;

  // Store circular references from source and reassign to target
  // Key = original source reference
  // Value = cloned/merged target reference
  const circularRefs = new WeakMap();

  let mergeDepth = 0;

  function _getObjectKeys(obj) {
    return getObjectKeys(obj, settings.hoistEnumerable);
  }

  function _mergekit(...objects) {
    let mergeKeyList;

    /**
     * If multiple objects are being merged, filter keys based on settings:
     * - onlyCommonKeys: Only include keys that appear in multiple objects
     * - onlyUniversalKeys: Only include keys that appear in all objects
     * - skipCommonKeys: Skip keys that appear in multiple objects
     * - skipUniversalKeys: Skip keys that appear in all objects
     */
    if (objects.length > 1) {
      if (settings.onlyCommonKeys) {
        mergeKeyList = getInMultiple(
          ...objects.map(obj => _getObjectKeys(obj))
        );
      } else if (settings.onlyUniversalKeys) {
        mergeKeyList = getInAll(...objects.map(obj => _getObjectKeys(obj)));
      } else if (settings.skipCommonKeys) {
        mergeKeyList = getNotInMultiple(
          ...objects.map(obj => _getObjectKeys(obj))
        );
      } else if (settings.skipUniversalKeys) {
        mergeKeyList = getNotInAll(...objects.map(obj => _getObjectKeys(obj)));
      }
    }

    if (!mergeKeyList && settings.onlyKeys.length) {
      mergeKeyList = settings.onlyKeys;
    }

    if (
      mergeKeyList &&
      mergeKeyList !== settings.onlyKeys &&
      settings.onlyKeys.length
    ) {
      mergeKeyList = mergeKeyList.filter(key =>
        settings.onlyKeys.includes(key)
      );
    }

    const newObjProps = objects.reduce((targetObj, srcObj) => {
      circularRefs.set(srcObj, targetObj);

      let keys = mergeKeyList || _getObjectKeys(srcObj);

      if (settings.skipKeys.length) {
        keys = keys.filter(key => settings.skipKeys.indexOf(key) === -1);
      }

      if (settings.onlyObjectWithKeyValues.length > 0) {
        const hasValue = settings.onlyObjectWithKeyValues.every(
          ({ key, value }) => {
            if (!Object.keys(srcObj).includes(key)) {
              return true;
            }

            return srcObj[key] === value;
          }
        );

        if (!hasValue) {
          return targetObj;
        }
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const targetVal = targetObj[key];
        const mergeDescriptor: PropertyDescriptor = {
          configurable: true,
          enumerable: true
        };

        if (key in srcObj === false) {
          continue;
        }

        let isReturnVal = false;
        let mergeVal = srcObj[key];

        const srcDescriptor = Object.getOwnPropertyDescriptor(srcObj, key);
        const isSetterOnly =
          srcDescriptor &&
          typeof srcDescriptor.set === 'function' &&
          typeof srcDescriptor.get !== 'function';

        if (isSetterOnly) {
          if (!settings.skipSetters) {
            Object.defineProperty(targetObj, key, srcDescriptor);
          }

          continue;
        }

        if (settings.filter !== defaults.filter) {
          const returnVal = settings.filter({
            depth: mergeDepth,
            key,
            srcObj,
            srcVal: mergeVal,
            targetObj,
            targetVal
          });

          if (returnVal !== undefined && !returnVal) {
            continue;
          }
        }

        if (settings.beforeEach !== defaults.beforeEach) {
          const returnVal = settings.beforeEach({
            depth: mergeDepth,
            key,
            srcObj,
            srcVal: mergeVal,
            targetObj,
            targetVal
          });

          if (returnVal !== undefined) {
            isReturnVal = true;
            mergeVal = returnVal;
          }
        }

        // Circular references
        if (
          settings.onCircular &&
          typeof mergeVal === 'object' &&
          mergeVal !== null
        ) {
          if (circularRefs.has(srcObj[key])) {
            const returnVal = settings.onCircular({
              depth: mergeDepth,
              key,
              srcObj,
              srcVal: srcObj[key],
              targetObj,
              targetVal
            });

            if (returnVal === undefined) {
              mergeVal = circularRefs.get(srcObj[key]);
              targetObj[key] = mergeVal;
              continue;
            }

            isReturnVal = true;
            mergeVal = returnVal;
          }
        }

        // Arrays
        if (Array.isArray(mergeVal)) {
          mergeVal = [...mergeVal];

          if (Array.isArray(targetVal)) {
            if (settings.appendArrays) {
              mergeVal = [...targetVal, ...mergeVal];
            } else if (settings.prependArrays) {
              mergeVal = [...mergeVal, ...targetVal];
            }
          }

          if (settings.dedupArrays) {
            // If a user-defined afterEach callback exists, remove
            // duplicates so the expected value is returned (slower)
            if (settings.afterEach !== defaults.afterEach) {
              mergeVal = [...new Set(mergeVal)];
            }
            // If not, store a reference to the array so duplicates
            // can be removed after merge is complete (faster)
            else {
              const keyArray = dedupArrayMap.get(targetObj);

              if (keyArray && !keyArray.includes(key)) {
                keyArray.push(key);
              } else {
                dedupArrayMap.set(targetObj, [key]);
              }
            }
          }

          if (settings.sortArrays) {
            // If a user-defined afterEach callback exists, sort the
            // array so the expected value is returned (slower)
            if (settings.afterEach !== defaults.afterEach) {
              mergeVal = mergeVal.sort(sortArrayFn);
            }
            // If not, store a reference to the array so duplicates
            // can be removed after merge is complete (faster)
            else {
              const keyArray = sortArrayMap.get(targetObj);

              if (keyArray && !keyArray.includes(key)) {
                keyArray.push(key);
              } else {
                sortArrayMap.set(targetObj, [key]);
              }
            }
          }
        }
        // Dates
        else if (mergeVal instanceof Date) {
          mergeVal = new Date(mergeVal);
        }
        // Buffers
        else if (Buffer.isBuffer(mergeVal)) {
          mergeVal = mergeVal.toString('utf-8');
        }
        // Objects
        else if (
          isObject(mergeVal) &&
          (!isReturnVal || !isPropDescriptor(mergeVal))
        ) {
          mergeDepth++;

          if (isObject(targetVal)) {
            mergeVal = _mergekit(targetVal, mergeVal);
          } else {
            mergeVal = _mergekit(mergeVal);
          }

          mergeDepth--;
        }

        if (settings.afterEach !== defaults.afterEach) {
          const returnVal = settings.afterEach({
            depth: mergeDepth,
            key,
            mergeVal,
            srcObj,
            targetObj
          });

          if (returnVal !== undefined) {
            isReturnVal = true;
            mergeVal = returnVal;
          }
        }

        if (isReturnVal) {
          const returnDescriptor = isPropDescriptor(mergeVal)
            ? mergeVal
            : {
                configurable: true,
                enumerable: true,
                value: mergeVal,
                writable: true
              };

          Object.defineProperty(targetObj, key, returnDescriptor);

          continue;
        }

        if (srcDescriptor) {
          const { configurable, enumerable, get, set, writable } =
            srcDescriptor;

          Object.assign(mergeDescriptor, {
            configurable,
            enumerable
          });

          // Invoke getters
          if (typeof get === 'function') {
            if (settings.invokeGetters) {
              mergeDescriptor.value = mergeVal;
            } else {
              mergeDescriptor.get = get;
            }
          }

          // Skip setters
          if (
            !settings.skipSetters &&
            typeof set === 'function' &&
            !('value' in mergeDescriptor)
          ) {
            mergeDescriptor.set = set;
          }

          // Set writable property if not accessors are defined
          if (!('get' in mergeDescriptor) && !('set' in mergeDescriptor)) {
            mergeDescriptor.writable = Boolean(writable);
          }
        }

        if (
          !mergeDescriptor.get &&
          !mergeDescriptor.set &&
          !('value' in mergeDescriptor)
        ) {
          mergeDescriptor.value = mergeVal;
          mergeDescriptor.writable =
            srcDescriptor && 'writable' in srcDescriptor
              ? srcDescriptor.writable
              : true;
        }

        Object.defineProperty(targetObj, key, mergeDescriptor);
      }

      return targetObj;
    }, {});

    // Remove duplicate
    for (const [obj, keyArray] of dedupArrayMap.entries()) {
      for (const key of keyArray) {
        const propDescriptor = Object.getOwnPropertyDescriptor(obj, key);
        const { configurable, enumerable, writable } = propDescriptor;

        let value = [...new Set(obj[key])];

        // Handle arrays of objects
        if (Array.isArray(obj[key]) && typeof obj[key][0] === 'object') {
          value = [...new Set(obj[key].map(item => JSON.stringify(item)))];
          value = value.map(item => JSON.parse(item as string));
        }

        // Set static value to handle arrays received from srcObj getter
        Object.defineProperty(obj, key, {
          configurable,
          enumerable,
          value: value,
          writable: writable !== undefined ? writable : true
        });
      }
    }

    // Sort arrays
    for (const [obj, keyArray] of sortArrayMap.entries()) {
      for (const key of keyArray) {
        obj[key].sort(sortArrayFn);
      }
    }

    let newObj = newObjProps;

    // Detect and merge custom prototype properties if available
    if (!settings.skipProto) {
      const customProtos = objects.reduce((protosArr, obj) => {
        const proto = Object.getPrototypeOf(obj);

        if (proto && proto !== Object.prototype) {
          protosArr.push(proto);
        }

        return protosArr;
      }, []);

      if (customProtos.length) {
        const newObjProto = _mergekit(...customProtos);

        if (settings.hoistProto) {
          newObj = _mergekit(newObjProto, newObjProps);
        } else {
          newObj = Object.create(
            newObjProto,
            Object.getOwnPropertyDescriptors(newObjProps)
          );
        }
      }
    }

    return newObj;
  }

  const objectsArray = Array.isArray(objects) ? objects : [objects];
  return _mergekit(...objectsArray);
}
