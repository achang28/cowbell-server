var _ = require("lodash");

function init(app) {
  var _locals = _.assign(app.locals, {
    base: "",
    imgBucket: ""
  });
  
  return {
    setBaseDir: function(baseDir) {
      _.set(_locals, ["paths", "base"], baseDir);
    },

    setImgBucket: function(path) {
      _.set(_locals, ["paths", "imgBucket"], path);
    }
  }
}

module.exports = init;