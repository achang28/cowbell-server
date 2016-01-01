var _ = require("lodash");

var dims = function () {
  var _specs = { img: { max: 960 } };

  return {
    adjustDims: function(dims) {
      var ratio = _specs.img.max / ( (dims.width > dims.height) ? dims.width : dims.height);
      return { "height": dims.height * ratio, "width": dims.width * ratio };
    }
  }
}

module.exports = dims;