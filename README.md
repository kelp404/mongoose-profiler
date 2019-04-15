# mongoose-profiler
[![npm version](https://badge.fury.io/js/mongoose-profiler.svg)](https://www.npmjs.com/package/mongoose-profiler)
[![Coverage Status](https://coveralls.io/repos/github/kelp404/mongoose-profiler/badge.svg?branch=master&a)](https://coveralls.io/github/kelp404/mongoose-profiler?branch=master)
[![CircleCI](https://circleci.com/gh/kelp404/mongoose-profiler.svg?style=svg)](https://circleci.com/gh/kelp404/mongoose-profiler)

This is a [mongoose](https://mongoosejs.com) plugin for tuning performance.  
It will show the [explain results](https://docs.mongodb.com/manual/reference/explain-results/) on the console when the query is slow.  
Such as mongodb scans all documents in the collection without index.

## Installation
```bash
$ npm install mongoose-profiler --save-dev
```

## Quick start
```js
const mongooseProfiler = require('mongoose-profiler');
schema.plugin(mongooseProfiler());
```

When you execute this query without the index then you will get some messages on the console.
```js
ProductModel
  .where({state: 'active'})
  .where({owner: {$in: ['5c9d9428e7462d3d989cb69b', '5c9d95acea5c9b4036d97c88']}})
  .limit(100);
```
```base
Mongoose:      64ms Products.find({ state: 'active', owner: { '$in': [ ObjectId("5c9d9428e7462d3d989cb69b"), ObjectId("5c9d95acea5c9b4036d97c88") ] } }, { skip: 0, limit: 100 })
[ { queryPlanner:
     { plannerVersion: 1,
       namespace: 'database.Products',
       indexFilterSet: false,
       parsedQuery:
        { '$and':
           [ { state: { '$eq': 'active' } },
             { owne:
                { '$in':
                   [ ObjectID {
                       _bsontype: 'ObjectID',
                       id: Buffer [Uint8Array] [ ... ] },
                     ObjectID {
                       _bsontype: 'ObjectID',
                       id: Buffer [Uint8Array] [ ... ] } ] } } ] },
       winningPlan:
        { stage: 'LIMIT',
          limitAmount: 100,
          inputStage:
           { stage: 'COLLSCAN',
             filter:
              { '$and':
                 [ { state: { '$eq': 'active' } },
                   { owne:
                      { '$in':
                         [ ObjectID {
                             _bsontype: 'ObjectID',
                             id: Buffer [Uint8Array] [ ... ] },
                           ObjectID {
                             _bsontype: 'ObjectID',
                             id: Buffer [Uint8Array] [ ... ] } ] } } ] },
             direction: 'forward' } },
       rejectedPlans: [] },
    executionStats:
     { executionSuccess: true,
       nReturned: 1,
       executionTimeMillis: 0,
       totalKeysExamined: 0,
       totalDocsExamined: 9,
       executionStages:
        { stage: 'LIMIT',
          nReturned: 1,
          ...
          inputStage:
           { stage: 'COLLSCAN',
             filter:
              { '$and':
                 [ { state: { '$eq': 'active' } },
                   { owne:
                      { '$in':
                         [ ObjectID {
                             _bsontype: 'ObjectID',
                             id: Buffer [Uint8Array] [ ... ] },
                           ObjectID {
                             _bsontype: 'ObjectID',
                             id: Buffer [Uint8Array] [ ... ] } ] } } ] },
             nReturned: 1,
             ...
             docsExamined: 9 } },
       allPlansExecution: [] },
    serverInfo:
     { ... },
    ok: 1 } ]
```

## mongooseProfiler()
```js
const mongooseProfiler = require('mongoose-profiler');
schema.plugin(mongooseProfiler({
  isAlwaysShowQuery: true,
  duration: 1000,
  totalDocsExamined: 1000,
  level: 'COLLSCAN'
}));
```
### Options
  Name                     |        Type      |   Default  |  Description
:------------------|:------------|:---------|:------------
 isAlwaysShowQuery | Boolean         |    true     |     
 duration     |  Number        |  1000ms  |  Show the explain result when the query took more than this time.<br/>(The time from `pre()` to `post()`.)
 totalDocsExamined |  Number        |               | Show the explain result when the query examined documents more than this number.
 level                     |  String           | COLLSCAN |`ALL`: Show the explain result of all queries.<br/>`COLLSCAN`: Show the explain result when the mongodb scan collections.
