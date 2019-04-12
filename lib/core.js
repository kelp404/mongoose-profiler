const leftPad = require('left-pad');
const utils = require('./utils');

const LEVEL_ALL = 'ALL';
const LEVEL_COLLSCAN = 'COLLSCAN';

module.exports = (options = {}) => {
  /*
  @param options {Object}
    isAlwaysShowQuery {Boolean} The default is true.
    duration {Number} The default is 1,000 milliseconds.
      Show the explain result when the query took more than this time.
      (The time from `pre()` to `post()`.)
    totalDocsExamined {Number|null}
      Show the explain result when the query examined documents more than this number.
    level {String} "ALL|COLLSCAN" The default is COLLSCAN.
      ALL: Show the explain result of all queries.
      COLLSCAN: Show the explain result when the mongodb scan collections.
   */
  options.isAlwaysShowQuery =
    options.isAlwaysShowQuery == null ? true : options.isAlwaysShowQuery;
  options.duration = options.duration == null ? 1000 : options.duration;
  options.level = [LEVEL_ALL, LEVEL_COLLSCAN].indexOf(options.level) >= 0 ?
    (options.level || LEVEL_COLLSCAN) :
    LEVEL_COLLSCAN;

  const preFunction = function () {
    this.startTime = new Date();
  };

  const postFunction = function (res, next) {
    this.endTime = new Date();
    this._collection[this.op](
      this._conditions,
      Object.assign({explain: true}, this.options),
      (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        const processTime = `${this.endTime - this.startTime}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const isIncludeCollScanStage = utils.isIncludeCollScanStage(result);
        const isOverDuration = (this.endTime - this.startTime) > options.duration;
        const isOverTotalDocsExamined = options.totalDocsExamined == null ?
          false :
          utils.getTotalDocsExamined(result) > options.totalDocsExamined;
        const isShowExplainResult = isOverDuration || isOverTotalDocsExamined ||
          options.level === LEVEL_ALL ||
          (options.level === LEVEL_COLLSCAN && isIncludeCollScanStage);

        if (options.isAlwaysShowQuery || isShowExplainResult) {
          this.mongooseCollection.$print(
            `${leftPad(processTime, 7)}ms ${this.mongooseCollection.collectionName}`,
            this.op,
            [this._conditions, this.options],
          );
        }

        if (isShowExplainResult) {
          console.dir(result, {depth: null, colors: true});
        }
      });
    next();
  };

  return schema => {
    schema.pre('find', preFunction);
    schema.pre('findOne', preFunction);
    schema.post('find', postFunction);
    schema.post('findOne', postFunction);
  };
};
