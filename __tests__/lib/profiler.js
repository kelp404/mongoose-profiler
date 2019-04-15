const MockDate = require('mockdate');
const Profiler = require('../../lib/profiler');

test('The default options of Profiler.', () => {
  const profiler = new Profiler();
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
