var _ = require("lodash");

var dims = {
  _specs: { img: { max: 768 } },
  adjustDims: function(dims) {
    var ratio = this._specs.img.max / ( (dims.width > dims.height) ? dims.width : dims.height);
    return { "height": dims.height * ratio, "width": dims.width * ratio };
  }
}

module.exports = dims;