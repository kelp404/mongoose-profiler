const utils = require('./utils');

const LEVEL_ALL = 'ALL';
const LEVEL_COLLSCAN = 'COLLSCAN';

module.exports = class Profiler {
  /**
   * @param {boolean} isAlwaysShowQuery - The default is true.
   * @param {number} duration
   *  The default is 1,000 milliseconds.
   *  Show the explain result when the query took more than this time.
   *  The time from `pre()` to `post()`.
   * @param {number|null} totalDocsExamined
   *  Show the explain result when the query examined documents more than this number.
   *  "null" is disable this function.
   * @param {string} level - "ALL|COLLSCAN"
   *  The default is COLLSCAN.
   *    ALL: Show the explain result of all queries.
   *    COLLSCAN: Show the explain result when the mongodb scan collections.
   * @param {{info: function, error: function}|null} logger - Custom console log.
   * @property {function()} preFunction
   * @property {function(res: *, next: function)} generatePostFunction
   */
  constructor({isAlwaysShowQuery, duration, totalDocsExamined, level, logger} = {}) {
    this.options = {
      isAlwaysShowQuery: isAlwaysShowQuery == null ? true : isAlwaysShowQuery,
      duration: duration == null ? 1000 : duration,
      totalDocsExamined: totalDocsExamined,
      level: [LEVEL_ALL, LEVEL_COLLSCAN].indexOf(level) >= 0 ?
        level :
        LEVEL_COLLSCAN,
      logger: logger || {
        info: value => console.dir(value, {depth: null, colors: true}),
        error: console.error
      }
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
            _this.options.logger.error(error);
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
              `${processTime.padStart(7)}ms ${this.mongooseCollection.collectionName}`,
              this.op,
              [this._conditions, this.options]
            );
          }

          if (isShowExplainResult) {
            _this.options.logger.info(result);
          }
        });
      next();
    };
  }
};
