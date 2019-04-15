const Profiler = require('./lib/profiler');

module.exports = options => {
  const profiler = new Profiler(options);

  return schema => {
    schema.pre('find', profiler.preFunction);
    schema.pre('findOne', profiler.preFunction);
    schema.post('find', profiler.postFunction);
    schema.post('findOne', profiler.postFunction);
  };
};
