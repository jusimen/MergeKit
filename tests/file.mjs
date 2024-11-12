import { mergekit } from '../dist/mergekit.esm.js';

// Use for JSDoc / IntelliSense testing
mergekit;
mergekit({
  afterEach({}) {
    return true;
  },
  filter({}) {
    return true;
  }
});
mergekit({}, { a: 1 });
