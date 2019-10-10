function info(result) {
  console.dir(result, {depth: null, colors: true});
}

function error(error) {
  console.error(error);
}

module.exports = {
  info: info,
  error: error
};
