const Profiler = require('../../lib/profiler');

test('The default options of Profiler.', () => {
  const profiler = new Profiler();
  expect(profiler.options).toMatchSnapshot();
});
