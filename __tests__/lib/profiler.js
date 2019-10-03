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
    level: 'ALL'
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
    _collection: {
      find: jest.fn()
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  const next = jest.fn();
  profiler.postFunction.apply(_this, [{}, next]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
  expect(next).toBeCalled();
});

test('Show the error message at the console when the explain query got error.', () => {
  const profiler = new Profiler();
  const _this = {
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        jest.spyOn(console, 'error');
        const error = 'fake error';
        callback(error, null);
        expect(console.error).toBeCalledWith(error);
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Show the query information at the console.', () => {
  const profiler = new Profiler();
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn()
    },
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        jest.spyOn(console, 'dir');
        callback(null, explainResult.withoutCollectionScan);
        expect(_this.mongooseCollection.$print).toBeCalledWith(
          '      1ms CollectionName',
          'find',
          [_this._conditions, _this.options]
        );
        expect(console.dir).not.toBeCalled();
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  MockDate.set(new Date('2019-04-15T00:00:00.000Z'));
  profiler.preFunction.apply(_this);
  MockDate.set(new Date('2019-04-15T00:00:00.001Z'));
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Show the explain result at the console.', () => {
  const profiler = new Profiler({
    isAlwaysShowQuery: false
  });
  const _this = {
    mongooseCollection: {
      $print: jest.fn()
    },
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        jest.spyOn(console, 'dir');
        callback(null, explainResult.withCollectionScan);
        expect(_this.mongooseCollection.$print).toHaveBeenCalled();
        expect(console.dir).toBeCalledWith(
          explainResult.withCollectionScan,
          {depth: null, colors: true}
        );
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Show the explain result at the console when the total docs examined is over.', () => {
  const profiler = new Profiler({
    totalDocsExamined: 0
  });
  const _this = {
    mongooseCollection: {
      $print: jest.fn()
    },
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        jest.spyOn(console, 'dir');
        callback(null, explainResult.withoutCollectionScan);
        expect(_this.mongooseCollection.$print).toHaveBeenCalled();
        expect(console.dir).toBeCalledWith(
          explainResult.withoutCollectionScan,
          {depth: null, colors: true}
        );
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Does not show anything for the index scan query.', () => {
  const profiler = new Profiler({
    isAlwaysShowQuery: false
  });
  const _this = {
    mongooseCollection: {
      collectionName: 'CollectionName',
      $print: jest.fn()
    },
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        jest.spyOn(console, 'dir');
        callback(null, explainResult.withoutCollectionScan);
        expect(_this.mongooseCollection.$print).not.toBeCalled();
        expect(console.dir).not.toBeCalled();
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Call custom log function to explain the result.', () => {
  let logFunction = jest.fn(result => result);

  const profiler = new Profiler({
    isAlwaysShowQuery: false,
    logger: {
      info: logFunction
    }
  });
  const _this = {
    mongooseCollection: {
      $print: jest.fn()
    },
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        callback(null, explainResult.withCollectionScan);
        expect(_this.mongooseCollection.$print).toHaveBeenCalled();
        expect(logFunction).toBeCalledWith(
          explainResult.withCollectionScan
        );
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});

test('Call custom error log function when the explain query got error.', () => {
  const logError = jest.fn(result => result);
  const profiler = new Profiler({
    logger: {
      error: logError
    }
  });
  const _this = {
    _collection: {
      find: jest.fn((conditions, options, callback) => {
        const error = 'fake error';
        callback(error, null);
        expect(logError).toBeCalledWith(error);
      })
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  profiler.postFunction.apply(_this, [{}, () => {}]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
});
