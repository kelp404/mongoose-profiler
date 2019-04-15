const utils = require('../../lib/utils');

const _fakeExplainResultA = [{
  queryPlanner:
    {
      plannerVersion: 1,
      namespace: 'database.ProjectAreas',
      indexFilterSet: false,
      parsedQuery: {},
      winningPlan:
        {
          stage: 'LIMIT',
          limitAmount: 100,
          inputStage:
            {
              stage: 'FETCH',
              inputStage:
                {
                  stage: 'IXSCAN',
                  keyPattern: {'title.zh-TW': 1},
                  indexName: 'TitleZhTW',
                  isMultiKey: false,
                  multiKeyPaths: {'title.zh-TW': []},
                  isUnique: false,
                  isSparse: false,
                  isPartial: false,
                  indexVersion: 2,
                  direction: 'forward',
                  indexBounds: {'title.zh-TW': ['[MinKey, MaxKey]']}
                }
            }
        },
      rejectedPlans: []
    },
  executionStats:
    {
      executionSuccess: true,
      nReturned: 22,
      executionTimeMillis: 0,
      totalKeysExamined: 22,
      totalDocsExamined: 22,
      executionStages:
        {
          stage: 'LIMIT',
          nReturned: 22,
          executionTimeMillisEstimate: 0,
          works: 23,
          advanced: 22,
          needTime: 0,
          needYield: 0,
          saveState: 0,
          restoreState: 0,
          isEOF: 1,
          invalidates: 0,
          limitAmount: 100,
          inputStage:
            {
              stage: 'FETCH',
              nReturned: 22,
              executionTimeMillisEstimate: 0,
              works: 23,
              advanced: 22,
              needTime: 0,
              needYield: 0,
              saveState: 0,
              restoreState: 0,
              isEOF: 1,
              invalidates: 0,
              docsExamined: 22,
              alreadyHasObj: 0,
              inputStage:
                {
                  stage: 'IXSCAN',
                  nReturned: 22,
                  executionTimeMillisEstimate: 0,
                  works: 23,
                  advanced: 22,
                  needTime: 0,
                  needYield: 0,
                  saveState: 0,
                  restoreState: 0,
                  isEOF: 1,
                  invalidates: 0,
                  keyPattern: {'title.zh-TW': 1},
                  indexName: 'TitleZhTW',
                  isMultiKey: false,
                  multiKeyPaths: {'title.zh-TW': []},
                  isUnique: false,
                  isSparse: false,
                  isPartial: false,
                  indexVersion: 2,
                  direction: 'forward',
                  indexBounds: {'title.zh-TW': ['[MinKey, MaxKey]']},
                  keysExamined: 22,
                  seeks: 1,
                  dupsTested: 0,
                  dupsDropped: 0,
                  seenInvalidated: 0
                }
            }
        },
      allPlansExecution: []
    },
  serverInfo:
    {
      host: '127.0.0.1',
      port: 27017,
      version: '4.0.2',
      gitVersion: 'fc1573ba18aee42f97a3bb13b67af7d837826b47'
    },
  ok: 1
}];
const _fakeExplainResultB = [{
  queryPlanner:
    {
      plannerVersion: 1,
      namespace: 'database.ProjectAreas',
      indexFilterSet: false,
      parsedQuery: {},
      winningPlan:
        {
          stage: 'SORT',
          sortPattern: {'title.zh-TW': 1},
          limitAmount: 100,
          inputStage:
            {
              stage: 'SORT_KEY_GENERATOR',
              inputStage: {stage: 'COLLSCAN', direction: 'forward'}
            }
        },
      rejectedPlans: []
    },
  executionStats:
    {
      executionSuccess: true,
      nReturned: 22,
      executionTimeMillis: 0,
      totalKeysExamined: 0,
      totalDocsExamined: 22,
      executionStages:
        {
          stage: 'SORT',
          nReturned: 22,
          executionTimeMillisEstimate: 0,
          works: 48,
          advanced: 22,
          needTime: 25,
          needYield: 0,
          saveState: 0,
          restoreState: 0,
          isEOF: 1,
          invalidates: 0,
          sortPattern: {'title.zh-TW': 1},
          memUsage: 3018,
          memLimit: 33554432,
          limitAmount: 100,
          inputStage:
            {
              stage: 'SORT_KEY_GENERATOR',
              nReturned: 22,
              executionTimeMillisEstimate: 0,
              works: 25,
              advanced: 22,
              needTime: 2,
              needYield: 0,
              saveState: 0,
              restoreState: 0,
              isEOF: 1,
              invalidates: 0,
              inputStage:
                {
                  stage: 'COLLSCAN',
                  nReturned: 22,
                  executionTimeMillisEstimate: 0,
                  works: 24,
                  advanced: 22,
                  needTime: 1,
                  needYield: 0,
                  saveState: 0,
                  restoreState: 0,
                  isEOF: 1,
                  invalidates: 0,
                  direction: 'forward',
                  docsExamined: 22
                }
            }
        },
      allPlansExecution: []
    },
  serverInfo:
    {
      host: '127.0.0.1',
      port: 27017,
      version: '4.0.2',
      gitVersion: 'fc1573ba18aee42f97a3bb13b67af7d837826b47'
    },
  ok: 1
}];

test('Find the collection scan stage in the index scan explain result.', () => {
  expect(utils.isIncludeCollScanStage(_fakeExplainResultA)).toEqual(false);
});

test('Find the collection scan stage in the collection scan explain result.', () => {
  expect(utils.isIncludeCollScanStage(_fakeExplainResultB)).toEqual(true);
});

test('Find the collection scan stage in null.', () => {
  expect(utils.isIncludeCollScanStage(null)).toEqual(false);
});

test('Get total docs examined.', () => {
  expect(utils.getTotalDocsExamined(_fakeExplainResultA)).toEqual(22);
});
