(function() {
  var __slice = [].slice;

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }

  ParticleSaga.Utils = (function() {
    function Utils() {}

    Utils.extend = function() {
      var key, object, objects, target, value, _i, _len;
      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        for (key in object) {
          value = object[key];
          target[key] = value;
        }
      }
    };

    return Utils;

  })();

}).call(this);
