(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @class ModelTarget
  Provides particle data for a 3D model based particle target.
   */

  ParticleSaga.ModelTarget = (function(_super) {
    __extends(ModelTarget, _super);


    /*
    @param {String} modelUrl - the .stl file url.
     */

    function ModelTarget(targetData, options) {
      this.targetData = targetData;
      this.getParticles = __bind(this.getParticles, this);
      this.processGeomtry = __bind(this.processGeomtry, this);
      this.onLoad = __bind(this.onLoad, this);
      this.load = __bind(this.load, this);
      ModelTarget.__super__.constructor.call(this, this.targetData, options);
      this.particles;
      this.container = this.targetData.container;
      this.opts = {
        color: {
          r: 1,
          g: 1,
          b: 1
        },
        initialMatrices: [],
        respondsToMouse: false,
        scale: 1.0,
        size: 1.0,
        sort: null
      };
      this.opts.extend(options);
    }

    ModelTarget.prototype.load = function(callback) {
      var loader;
      ModelTarget.__super__.load.call(this, callback);
      loader = new THREE.JSONLoader();
      return loader.load(this.targetData.url, this.onLoad);
    };

    ModelTarget.prototype.onLoad = function(geometry) {
      this.processGeomtry(geometry);
      return ModelTarget.__super__.onLoad.call(this);
    };

    ModelTarget.prototype.processGeomtry = function(geometry) {
      var material, matrix, vertex, _i, _j, _len, _len1, _ref, _ref1;
      geometry.mergeVertices();
      _ref = geometry.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        vertex.userData = {
          color: this.opts.color
        };
      }
      _ref1 = this.opts.initialMatrices;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        matrix = _ref1[_j];
        geometry.applyMatrix(matrix);
      }
      geometry.applyMatrix(new THREE.Matrix4().makeScale(this.opts.scale, this.opts.scale, this.opts.scale));
      if (this.opts.sort != null) {
        geometry.vertices.sort(this.opts.sort);
      }
      material = new THREE.ParticleSystemMaterial({
        size: this.opts.size
      });
      return this.particles = new THREE.ParticleSystem(geometry, material);
    };

    ModelTarget.prototype.getParticles = function() {
      return this.particles;
    };

    return ModelTarget;

  })(ParticleSaga.AbstractTarget);

}).call(this);
