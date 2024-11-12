const { mergekit } = require('../dist/mergekit.cjs');

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
