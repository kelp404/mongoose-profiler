const MockDate = require('mockdate');
const Profiler = require('../../lib/profiler');

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
  MockDate.reset();
});

test('`postFunction()` will call mongoose query function with explain arguments.', () => {
  const profiler = new Profiler();
  const _this = {
    _collection: {
      find: jest.fn(() => {})
    },
    op: 'find',
    _conditions: {state: 'active'},
    options: {skip: 0, limit: 100}
  };
  const next = jest.fn(() => {});
  profiler.postFunction.apply(_this, [{}, next]);
  expect(_this._collection.find).toBeCalledWith(
    {state: 'active'},
    {explain: true, skip: 0, limit: 100},
    expect.anything()
  );
  expect(next).toBeCalled();
});
