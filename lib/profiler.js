const leftPad = require('left-pad');
const utils = require('./utils');

const LEVEL_ALL = 'ALL';
const LEVEL_COLLSCAN = 'COLLSCAN';

module.exports = class Profiler {
  constructor(options = {}) {
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
    @returns {Function} (schema) => {}
     */
    this.options = {
      isAlwaysShowQuery: options.isAlwaysShowQuery == null ? true : options.isAlwaysShowQuery,
      duration: options.duration == null ? 1000 : options.duration,
      totalDocsExamined: options.totalDocsExamined,
      level: [LEVEL_ALL, LEVEL_COLLSCAN].indexOf(options.level) >= 0 ?
        options.level :
        LEVEL_COLLSCAN,
      log: options.log || this._defaultLogFunction,
      logError: options.logError || this._defaultLogErrorFunction
    };

    this.preFunction = this.generatePreFunction();
    this.postFunction = this.generatePostFunction();
  }

  generatePreFunction() {
    return function () {
      this.startTime = new Date();
    };
  }

  generatePostFunction() {
    const _this = this;
    return function (res, next) {
      const endTime = new Date();
      this._collection[this.op](
        this._conditions,
        Object.assign({explain: true}, this.options),
        (error, result) => {
          if (error) {
            _this.options.logError(error);
            return;
          }

          const processTime = `${endTime - this.startTime}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const isIncludeCollScanStage = utils.isIncludeCollScanStage(result);
          const isOverDuration = (endTime - this.startTime) > _this.options.duration;
          const isOverTotalDocsExamined = _this.options.totalDocsExamined == null ?
            false :
            utils.getTotalDocsExamined(result) > _this.options.totalDocsExamined;
          const isShowExplainResult = isOverDuration || isOverTotalDocsExamined ||
            _this.options.level === LEVEL_ALL ||
            (_this.options.level === LEVEL_COLLSCAN && isIncludeCollScanStage);

          if (_this.options.isAlwaysShowQuery || isShowExplainResult) {
            this.mongooseCollection.$print(
              `${leftPad(processTime, 7)}ms ${this.mongooseCollection.collectionName}`,
              this.op,
              [this._conditions, this.options],
            );
          }

          if (isShowExplainResult) {
            _this.options.log(result);
          }
        });
      next();
    };
  }

  _defaultLogFunction(result) {
    console.dir(result, {depth: null, colors: true});
  }

  _defaultLogErrorFunction(error) {
    console.error(error);
  }
};
