(function() {
  var __slice = [].slice;

  Object.prototype.extend = function() {
    var key, object, objects, value, _i, _len;
    objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      object = objects[_i];
      for (key in object) {
        value = object[key];
        this[key] = value;
      }
    }
  };

}).call(this);
