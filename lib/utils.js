const STAGE_COLLSCAN = 'COLLSCAN';

exports.isIncludeCollScanStage = explainResult => {
  /*
  Search "COLLSCAN" in the explain result.
  @param explainResult {any}
  @returns {Boolean}
   */
  if (!explainResult) {
    return false;
  }

  if (Array.isArray(explainResult)) {
    for (let index = 0; index < explainResult.length; index += 1) {
      if (exports.isIncludeCollScanStage(explainResult[index])) {
        return true;
      }
    }

    return false;
  }

  if ('executionStats' in explainResult) {
    return exports.isIncludeCollScanStage(explainResult.executionStats);
  }

  if ('executionStages' in explainResult || 'allPlansExecution' in explainResult) {
    return (
      exports.isIncludeCollScanStage(explainResult.executionStages) ||
      exports.isIncludeCollScanStage(explainResult.allPlansExecution)
    );
  }

  if (explainResult.stage === STAGE_COLLSCAN) {
    return true;
  }

  if ('inputStage' in explainResult) {
    return exports.isIncludeCollScanStage(explainResult.inputStage);
  }

  return false;
};

exports.getTotalDocsExamined = explainResult => {
  /*
  Get totalDocsExamined in the explain result.
  @param explainResult {any}
  @returns {Number}
   */
  if (Array.isArray(explainResult)) {
    let totalDocsExamined = 0;
    for (let index = 0; index < explainResult.length; index += 1) {
      totalDocsExamined += exports.getTotalDocsExamined(explainResult[index]);
    }

    return totalDocsExamined;
  }

  return explainResult.executionStats.totalDocsExamined;
};
