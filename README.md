# MergeKit

## Introductory Note

> This repository is a fork of [mergician](https://github.com/jhildenbiddle/mergekit) with the goal of making it available on npm and updating with new features.<br>
> A huge thanks to [John Hildenbiddle](https://github.com/jhildenbiddle) for creating such a great utility! 🎉

## About

mergekit is a uniquely flexible and light-weight utility for cloning and deep (recursive) merging of JavaScript objects.

Unlike native methods and other utilities, mergekit faithfully clones and merges objects by properly handling [descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) values, [accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors) functions, and prototype properties while offering advanced options for customizing the clone/merge process.

- 🚀 [Documentation & Demos](https://jhildenbiddle.github.io/mergekit/)

## Features

- Deep (recursive) clone/merge JavaScript objects
- Generates new object without modifying source object(s)
- Clone/merge enumerable and non-enumerable properties
- Clone/merge property [descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) values
- Retain, skip, or convert [accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors) functions to static values
- Inspect, filter, and modify properties
- Merge, skip, or hoist prototype properties
- Merge or skip key intersections, unions, and differences
- Merge, sort, and remove duplicate array items
- IntelliSense / code hinting support
- TypeScript support
- Lightweight (2k min+gzip) and dependency-free

**Platform Support**

<img src="https://raw.githubusercontent.com/jhildenbiddle/mergekit/main/docs/assets/img/node.svg" valign="middle" alt=""> <span valign="middle">Node 10+</span>
<br>
<img src="https://raw.githubusercontent.com/jhildenbiddle/mergekit/main/docs/assets/img/chrome.svg" valign="middle" alt=""> <span valign="middle">Chrome 61+</span>
<br>
<img src="https://raw.githubusercontent.com/jhildenbiddle/mergekit/main/docs/assets/img/edge.svg" valign="middle" alt=""> <span valign="middle">Edge 16+</span>
<br>
<img src="https://raw.githubusercontent.com/jhildenbiddle/mergekit/main/docs/assets/img/firefox.svg" valign="middle" alt=""> <span valign="middle">Firefox 60+</span>
<br>
<img src="https://raw.githubusercontent.com/jhildenbiddle/mergekit/main/docs/assets/img/safari.svg" valign="middle" alt=""> <span valign="middle">Safari 10.1+</span>

## Examples

Basic object cloning using default options:

```javascript
// ES module shown. CommonJS module also available (see below).
import { mergekit } from 'mergekit';

const obj1 = { a: [1, 1], b: { c: 1, d: 1 } };
const clonedObj = mergekit({}, obj1);

// Results
console.log(clonedObj); // { a: [1, 1], b: { c: 1, d: 1 } }
console.log(clonedObj === obj1); // false
console.log(clonedObj.a === obj1.a); // false
console.log(clonedObj.b === obj1.b); // false
```

Advanced object merging using custom options:

```javascript
// ES module shown. CommonJS module also available (see below).
import { mergekit } from 'mergekit';

const obj1 = { a: [1, 1], b: { c: 1, d: 1 } };
const obj2 = { a: [2, 2], b: { c: 2 } };
const obj3 = { e: 3 };

const mergedObj = mergekit({
  skipKeys: ['d'],
  appendArrays: true,
  dedupArrays: true,
  filter({ depth, key, srcObj, srcVal, targetObj, targetVal }) {
    if (key === 'e') {
      targetObj['hello'] = 'world';
      return false;
    }
  }
})(obj1, obj2, obj3);

// Result
console.log(mergedObj); // { a: [1, 2], b: { c: 2 }, hello: 'world' }
```

## Installation

**NPM**

```bash
npm install mergekit
```

```javascript
// ES module
import { mergekit } from 'mergekit';
```

```javascript
// CommonJS module
const { mergekit } = require('mergekit');
```

**CDN**

Available on [jsdelivr](https://www.jsdelivr.com/package/npm/mergekit) (below), [unpkg](https://unpkg.com/browse/mergekit/), and other CDN services that auto-publish npm packages.

> 💡 Note the `@` version lock in the URLs below. This prevents breaking changes in future releases from affecting your project and is therefore the safest method of loading dependencies from a CDN. When a new major version is released, you will need to manually update your CDN URLs by changing the version after the `@` symbol.

```javascript
// ES module @ latest v2.x.x
import { mergekit } from 'https://cdn.jsdelivr.net/npm/mergekit@2';
```

## Usage & Options

See the [documentation site](https://jusimen.github.io/mergekit/) for details.

## Contact & Support

- Follow 👨🏻‍💻 **@jusimen** on [Twitter](https://twitter.com/jusimen) and [GitHub](https://github.com/jusimen) for announcements
- Create a 💬 [GitHub issue](https://github.com/jusimen/mergekit/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jusimen/mergekit) and 🐦 [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjusimen%2Fmergekit&hashtags=developers,frontend,javascript) to promote the project

## License

This project is licensed under the [MIT license](https://github.com/jusimen/mergekit/blob/main/LICENSE).

Copyright (c) Josue "Jusi" Monteiro ([@jusimen](https://twitter.com/jusimen))
