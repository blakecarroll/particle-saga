(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @ModelTarget
   * Provides particle data for a 3D model based particle target.
   */

  ParticleSaga.ModelTarget = (function(_super) {
    __extends(ModelTarget, _super);

    function ModelTarget(targetData, options) {
      this.targetData = targetData;
      this.getParticles = __bind(this.getParticles, this);
      this.processGeometry = __bind(this.processGeometry, this);
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
      ParticleSaga.Utils.extend(this.opts, options);
    }

    ModelTarget.prototype.load = function(callback) {
      var geometry, i, loader, verts, _i, _ref;
      ModelTarget.__super__.load.call(this, callback);
      if (this.targetData.preloadedVertices != null) {
        geometry = new THREE.Geometry();
        verts = this.targetData.preloadedVertices;
        for (i = _i = 0, _ref = verts.length; _i < _ref; i = _i += 3) {
          geometry.vertices.push(new THREE.Vector3(verts[i], verts[i + 1], verts[i + 2]));
        }
        return this.onLoad(geometry);
      } else {
        loader = new THREE.JSONLoader();
        return loader.load(this.targetData.url, this.onLoad);
      }
    };

    ModelTarget.prototype.onLoad = function(geometry) {
      this.processGeometry(geometry);
      return ModelTarget.__super__.onLoad.call(this);
    };

    ModelTarget.prototype.processGeometry = function(geometry) {
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
