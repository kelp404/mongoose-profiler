const MockDate = require('mockdate');
const Profiler = require('../../lib/profiler');
const explainResult = require('../../fake-data/explain-result');

afterEach(() => {
  jest.restoreAllMocks();
  MockDate.reset();
});

test('The default options of Profiler.', () => {
  const profiler = new Profiler();
  expect(profiler.options).toMatchSnapshot();
});

test('Options of Profiler.', () => {
  const profiler = new Profiler({
    isAlwaysShowQuery: false,
    duration: 500,
    totalDocsExamined: 200,
    level: 'ALL',
  });
  expect(profiler.options).toMatchSnapshot();
});

test('`preFunction()` will add a member `startTime`.', () => {
  MockDate.set(new Date('2019-04-15T00:00:00.000Z'));
  const profiler = new Profiler();
  const _this = {};
  profiler.preFunction.call(_this);
  expect(_this).toMatchSnapshot();
});

test('`postFunction()` will call mongoose query function with explain arguments.', () => {
  const profiler = new Profiler();
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
});

test('Show the error message at the console when the explain query got error.', async () => {
  jest.spyOn(console, 'error');
  const profiler = new Profiler();
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => {
        throw new Error('fake error');
      }),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(console.error).toBeCalledWith(new Error('fake error'));
});

test('Show the query information at the console.', async () => {
  const profiler = new Profiler();
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => {
        jest.spyOn(console, 'dir');
        return explainResult.withoutCollectionScan;
      }),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  MockDate.set(new Date('2019-04-15T00:00:00.000Z'));
  profiler.preFunction.apply(_this);
  MockDate.set(new Date('2019-04-15T00:00:00.001Z'));
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(_this.mongooseCollection.$print).toBeCalledWith(
    '      1ms CollectionName',
    'find',
    [_this._conditions, _this.options],
  );
  expect(console.dir).not.toBeCalled();
});

test('Show the explain result at the console.', async () => {
  jest.spyOn(console, 'dir');
  const profiler = new Profiler({
    isAlwaysShowQuery: false,
  });
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => explainResult.withCollectionScan),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(_this.mongooseCollection.$print).toHaveBeenCalled();
  expect(console.dir).toBeCalledWith(
    explainResult.withCollectionScan,
    {depth: null, colors: true},
  );
});

test('Show the explain result at the console when the total docs examined is over.', async () => {
  jest.spyOn(console, 'dir');
  const profiler = new Profiler({
    totalDocsExamined: 0,
  });
  const _this = {
    mongooseCollection: {
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => explainResult.withoutCollectionScan),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(_this.mongooseCollection.$print).toHaveBeenCalled();
  expect(console.dir).toBeCalledWith(
    explainResult.withoutCollectionScan,
    {depth: null, colors: true},
  );
});

test('Does not show anything for the index scan query.', async () => {
  jest.spyOn(console, 'dir');
  const profiler = new Profiler({
    isAlwaysShowQuery: false,
  });
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => explainResult.withoutCollectionScan),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(_this.mongooseCollection.$print).not.toBeCalled();
  expect(console.dir).not.toBeCalled();
});

test('Call custom log function to explain the result.', async () => {
  const logFunction = jest.fn(result => result);

  const profiler = new Profiler({
    isAlwaysShowQuery: false,
    logger: {
      info: logFunction,
    },
  });
  const _this = {
    mongooseCollection: {
      $print: jest.fn(),
    },
    _collection: {
      find: jest.fn(async () => explainResult.withCollectionScan),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(_this.mongooseCollection.$print).toHaveBeenCalled();
  expect(logFunction).toBeCalledWith(
    explainResult.withCollectionScan,
  );
});

test('Call custom error log function when the explain query got error.', async () => {
  const logError = jest.fn(result => result);
  const profiler = new Profiler({
    logger: {
      error: logError,
    },
  });
  const _this = {
    _collection: {
      find: jest.fn(async () => {
        throw new Error('fake error');
      }),
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100},
  };
  await profiler.postFunction.apply(_this, [{}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
  );
  expect(logError).toBeCalledWith(new Error('fake error'));
});
