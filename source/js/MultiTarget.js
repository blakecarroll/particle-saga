(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @class MultiTarget
  Provides particle data for a scene based on multiple targets.
   */

  ParticleSaga.MultiTarget = (function(_super) {
    __extends(MultiTarget, _super);


    /*
    @param {Array.object} targetData - the list of target data objects.
     */

    function MultiTarget(targetData, options) {
      this.targetData = targetData;
      this.getParticles = __bind(this.getParticles, this);
      this.resize = __bind(this.resize, this);
      this.getTargetOffsets = __bind(this.getTargetOffsets, this);
      this.prepareParticles = __bind(this.prepareParticles, this);
      this.onTargetLoad = __bind(this.onTargetLoad, this);
      this.load = __bind(this.load, this);
      MultiTarget.__super__.constructor.call(this, this.targetData, options);
      this.targets = [];
      this.particles;
      this.container = this.targetData.container;
      this.numTargetsLoaded = 0;
      this.opts = {
        color: {
          r: 1,
          g: 1,
          b: 1
        },
        respondsToMouse: false,
        size: 1.0,
        sort: null
      };
      ParticleSaga.Utils.extend(this.opts, options);
    }

    MultiTarget.prototype.load = function(callback) {
      var i, opts, target, _i, _len, _ref, _results;
      MultiTarget.__super__.load.call(this, callback);
      _ref = this.targetData.targets;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        target = _ref[i];
        if (target.container == null) {
          target.container = this.container;
        }
        if (target.options == null) {
          target.options = target.options || {};
        }
        if (target.type !== ParticleSaga.ModelTarget) {
          target.options.numParticles = this.opts.numParticles;
        }
        opts = {};
        ParticleSaga.Utils.extend(opts, this.opts);
        ParticleSaga.Utils.extend(opts, target.options);
        this.targets.push(new target.type(target, opts));
        this.targets[i].init();
        _results.push(this.targets[i].load(this.onTargetLoad));
      }
      return _results;
    };

    MultiTarget.prototype.onTargetLoad = function() {
      this.numTargetsLoaded++;
      if (this.numTargetsLoaded > 0 && this.numTargetsLoaded === this.targetData.targets.length) {
        this.resize();
        return this.onLoad();
      }
    };

    MultiTarget.prototype.prepareParticles = function() {
      var geometry, i, material, target, targetData, targetOffsets, targetParticles, userData, v, vertex, _i, _j, _len, _len1, _ref, _ref1;
      geometry = new THREE.Geometry();
      _ref = this.targets;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        target = _ref[i];
        targetData = this.targetData.targets[i];
        targetOffsets = this.getTargetOffsets(targetData);
        targetParticles = target.getParticles();
        _ref1 = targetParticles.geometry.vertices;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          vertex = _ref1[_j];
          userData = vertex.userData;
          v = vertex.clone();
          v.userData = vertex.userData;
          v.x += targetOffsets.x;
          v.y += targetOffsets.y;
          geometry.vertices.push(v);
        }
      }
      if (this.opts.sort != null) {
        geometry.vertices.sort(this.opts.sort);
      }
      material = new THREE.ParticleSystemMaterial({
        size: this.opts.size
      });
      return this.particles = new THREE.ParticleSystem(geometry, material);
    };

    MultiTarget.prototype.getTargetOffsets = function(targetData) {
      var el, halfH, halfW, offsetY, x, y;
      halfW = 0;
      halfH = 0;
      offsetY = 0;
      halfW = this.container.offsetWidth / 2;
      halfH = this.container.offsetHeight / 2;
      el = targetData.container;
      x = (el.offsetLeft + 0.5 * el.offsetWidth) - halfW;
      y = halfH - (el.offsetTop + offsetY + 0.5 * el.offsetHeight);
      return {
        x: x,
        y: y
      };
    };

    MultiTarget.prototype.resize = function() {
      return this.prepareParticles();
    };

    MultiTarget.prototype.getParticles = function() {
      return this.particles;
    };

    return MultiTarget;

  })(ParticleSaga.AbstractTarget);

}).call(this);
