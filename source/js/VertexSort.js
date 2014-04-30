(function() {
  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }

  ParticleSaga.VertexSort = {
    topToBottom: (function(_this) {
      return function(a, b) {
        if (a.y < b.y) {
          return 1;
        } else if (a.y > b.y) {
          return -1;
        }
        return 0;
      };
    })(this),
    bottomToTop: (function(_this) {
      return function(a, b) {
        if (a.y < b.y) {
          return -1;
        } else if (a.y > b.y) {
          return 1;
        }
        return 0;
      };
    })(this),
    leftToRight: (function(_this) {
      return function(a, b) {
        if (a.x < b.x) {
          return -1;
        } else if (a.x > b.x) {
          return 1;
        }
        return 0;
      };
    })(this),
    rightToLeft: (function(_this) {
      return function(a, b) {
        if (a.x < b.x) {
          return 1;
        } else if (a.x > b.x) {
          return -1;
        }
        return 0;
      };
    })(this),
    backToFront: (function(_this) {
      return function(a, b) {
        if (a.z < b.z) {
          return -1;
        } else if (a.z > b.z) {
          return 1;
        }
        return 0;
      };
    })(this),
    frontToBack: (function(_this) {
      return function(a, b) {
        if (a.z < b.z) {
          return 1;
        } else if (a.z > b.z) {
          return -1;
        }
        return 0;
      };
    })(this),
    randomish: (function(_this) {
      return function(a, b) {
        var rand;
        rand = Math.random();
        if (rand < 0.33) {
          return 1;
        } else if (rand < 0.66) {
          return -1;
        } else {
          return 0;
        }
      };
    })(this)
  };

}).call(this);
