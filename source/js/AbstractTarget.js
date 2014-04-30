(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @class AbstractTarget
  Provides particle data for a particle scene.
   */

  ParticleSaga.AbstractTarget = (function() {
    function AbstractTarget(targetData, options) {
      this.targetData = targetData;
      this.getParticles = __bind(this.getParticles, this);
      this.resize = __bind(this.resize, this);
      this.destroy = __bind(this.destroy, this);
      this.onLoad = __bind(this.onLoad, this);
      this.load = __bind(this.load, this);
      this.init = __bind(this.init, this);
      this.onLoadCallback;
    }

    AbstractTarget.prototype.init = function() {};

    AbstractTarget.prototype.load = function(callback) {
      return this.onLoadCallback = callback;
    };

    AbstractTarget.prototype.onLoad = function() {
      if (this.onLoadCallback != null) {
        return this.onLoadCallback();
      }
    };

    AbstractTarget.prototype.destroy = function() {
      if (this.particles != null) {
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        return this.particles = null;
      }
    };

    AbstractTarget.prototype.resize = function() {};

    AbstractTarget.prototype.getParticles = function() {
      return null;
    };

    return AbstractTarget;

  })();

}).call(this);
