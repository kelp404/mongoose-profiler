const utils = require('../../lib/utils');
const explainResult = require('../../fake-data/explain-result');

test('Find the collection scan stage in the index scan explain result.', () => {
  expect(utils.isIncludeCollScanStage(explainResult.withoutCollectionScan)).toEqual(false);
});

test('Find the collection scan stage in the collection scan explain result.', () => {
  expect(utils.isIncludeCollScanStage(explainResult.withCollectionScan)).toEqual(true);
});

test('Find the collection scan stage in null.', () => {
  expect(utils.isIncludeCollScanStage(null)).toEqual(false);
});

test('Get total docs examined.', () => {
  expect(utils.getTotalDocsExamined(explainResult.withoutCollectionScan)).toEqual(22);
});
