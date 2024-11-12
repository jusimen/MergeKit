# Change Log

## 2.0.3

_2024-11-12_

- Merge nested object arrays
- Add `onlyObjectWithKeyValues` option

  > Only merge properties that match the **key/value** pairs specified in the array, for example:

  ```js
  const objs = [
    { action: 'read', domain: 'movies', id: '123' },
    {
      action: 'read',
      resource: { director: ['Christopher Nolan'] },
      domain: 'movies',
      id: '345'
    },
    {
      action: 'read',
      resource: { director: ['Quentin Tarantino'] },
      domain: 'movies',
      id: '7890'
    },
    {
      action: 'write',
      resource: { director: ['James Cameron'] },
      domain: 'movies',
      id: '9999'
    }
  ];

  mergician({
    dedupArrays: true,
    appendArrays: true,
    onlyObjectWithKeyValues: [
      { key: 'domain', value: 'movies' },
      { key: 'action', value: 'read' }
    ]
  })(...objs);
  ```

  **Output:**

  ```json
  {
    "action": "read",
    "domain": "movies",
    "resource": {
      "director": ["Christopher Nolan", "Quentin Tarantino"]
    }
  }
  ```

## 2.0.2

_2024-05-05_

- Fix date object handling (#7)

## 2.0.1

_2024-03-05_

- Export types in `package.json`

## 2.0.0

_2024-01-18_

- ❗️ Breaking: Switch to named export
- ❗️ Breaking: Clone/merge non-enumerable properties by default
- ❗️ Breaking: Clone/merge custom prototype properties by default
- ❗️ Breaking: Update `hoistProto` option to include non-enumerable custom prototype properties
- ❗️ Breaking: Rename distributable `.mjs` files to `.esm.js`
- ❗️ Breaking: Remove IIFE build
- Add `hoistEnumerable` option
- Add `skipProto` option
- Add TypeScript type declarations
- Update JSDoc comments / code hinting

## 1.1.0

_2023-02-23_

- Add `invokeGetters` option
- Add `skipSetters` option
- Add `hoistProto` option
- Add support for circular references
- Add unminified IIFE distributable
- Fix callback return values not replacing getter/setter properties
- Fix internal object detection
- Fix missing `</script>` tag in docs
- Update dependencies

## 1.0.1 - 1.0.3

_2022-07-28 - 2022-08-01_

- Update README.md

## 1.0.0

_2022-07-14_

- Initial release
