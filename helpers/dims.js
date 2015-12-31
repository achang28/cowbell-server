var _ = require("lodash");

var dims = function (app) {
  var _specs = { img: { max: 960 } };
  _.assign(app.locals, { specs: this._specs });    

  return {
    adjustDims: function(dims) {
      var ratio = _specs.img.max / ( (dims.width > dims.height) ? dims.width : dims.height);
      return { "height": dims.height * ratio, "width": dims.width * ratio };
    }
  }
}

module.exports = dims;