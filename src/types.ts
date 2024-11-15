export interface MergekitOptions {
  onlyKeys: string[]; // Exclusive array of keys to be merged (others are skipped)
  skipKeys: string[]; // Array of keys to skip (others are merged)
  onlyCommonKeys: boolean; // Merge only keys found in multiple objects (ignore single occurrence keys)
  onlyUniversalKeys: boolean; // Merge only keys found in all objects
  skipCommonKeys: boolean; // Skip keys found in multiple objects (merge only single occurrence keys)
  skipUniversalKeys: boolean; // Skip keys found in all objects (merge only common keys)
  onlyObjectWithKeyValues: { key: string; value: any }[]; // Merge only objects that have the key and value pair
  invokeGetters: boolean; // Invoke "getter" methods and merge returned values
  skipSetters: boolean; // Skip "setter" methods during merge
  appendArrays: boolean; // Merge array values at the end of existing arrays
  prependArrays: boolean; // Merge array values at the beginning of existing arrays
  dedupArrays: boolean; // Remove duplicate array values in new merged object
  sortArrays: boolean | ((a: any, b: any) => number); // Sort array values in new merged object
  hoistEnumerable: boolean; // Merge enumerable prototype properties as direct properties of merged object
  hoistProto: boolean; // Merge custom prototype properties as direct properties of merged object
  skipProto: boolean; // Skip merging of custom prototype properties
  filter?: (callbackData: CallbackData) => boolean | void; // Callback used to conditionally merge or skip a property
  beforeEach?: (callbackData: CallbackData) => any; // Callback used for inspecting/modifying properties before merge
  afterEach?: (callbackData: AfterEachCallbackData) => any; // Callback used for inspecting/modifying properties after merge
  onCircular: (callbackData: CallbackData) => any; // Callback used for handling circular object references during merge
}

// Callback data types
export interface CallbackData {
  depth: number; // Nesting level of the key being processed
  key: string; // Object key being processed
  srcObj: object; // Object containing the source value
  srcVal: any; // Source object’s property value
  targetObj: object; // New merged object
  targetVal: any; // New merged object’s current property value
}

export interface AfterEachCallbackData {
  depth: number; // Nesting level of the key being processed
  key: string; // Object key being processed
  mergeVal: any; // New merged value
  srcObj: object; // Object containing the source value
  targetObj: object; // New merged object
}
