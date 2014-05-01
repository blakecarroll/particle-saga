(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @class ImageTarget
  Identifies and produces geometry for particles based on an image.
   */

  ParticleSaga.ImageTarget = (function(_super) {
    __extends(ImageTarget, _super);


    /*
    @param {Object} targetData - Must contain a url and any other options
     */

    function ImageTarget(targetData, options) {
      this.targetData = targetData;
      this.getParticles = __bind(this.getParticles, this);
      this.scalevertex = __bind(this.scalevertex, this);
      this.centerVertex = __bind(this.centerVertex, this);
      this.getVertexForPixelDataOffset = __bind(this.getVertexForPixelDataOffset, this);
      this.randomVertexInImage = __bind(this.randomVertexInImage, this);
      this.getImageDataFromImg = __bind(this.getImageDataFromImg, this);
      this.processImage = __bind(this.processImage, this);
      this.onLoad = __bind(this.onLoad, this);
      this.load = __bind(this.load, this);
      this.updateParticlePositions = __bind(this.updateParticlePositions, this);
      this.updatePositionAdjustments = __bind(this.updatePositionAdjustments, this);
      this.resize = __bind(this.resize, this);
      this.init = __bind(this.init, this);
      ImageTarget.__super__.constructor.call(this, this.targetData, options);
      this.particles;
      this.container = this.targetData.container;
      this.validPixelArrayOffsets = [];
      this.maxW = 0;
      this.maxH = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.imageData;
      this.aspectFillImageScaleX = 1;
      this.aspectFillImageScaleY = 1;
      this.opts = {
        numParticles: 10000,
        respondsToMouse: false,
        size: 1.0,
        sort: null
      };
      ParticleSaga.Utils.extend(this.opts, options);
    }

    ImageTarget.prototype.init = function() {
      return this.resize();
    };

    ImageTarget.prototype.resize = function() {
      this.maxW = this.container.offsetWidth;
      this.maxH = this.container.offsetHeight;
      if (this.imageData) {
        this.updatePositionAdjustments();
        if (this.particles) {
          return this.updateParticlePositions();
        }
      }
    };

    ImageTarget.prototype.updatePositionAdjustments = function() {
      var height, innerRatio, outerRatio, width;
      width = this.maxW;
      height = this.maxH;
      outerRatio = this.maxW / this.maxH;
      innerRatio = this.imageData.width / this.imageData.height;
      if (outerRatio > innerRatio) {
        width = this.maxW;
        height = width / innerRatio;
      } else {
        height = this.maxH;
        width = height * innerRatio;
      }
      this.aspectFillImageScaleX = width / this.imageData.width;
      this.aspectFillImageScaleY = height / this.imageData.height;
      this.offsetX = (this.maxW - this.imageData.width) / 2;
      return this.offsetY = -(this.maxH - this.imageData.height) / 2;
    };

    ImageTarget.prototype.updateParticlePositions = function() {
      var v, vertex, _i, _len, _ref, _results;
      _ref = this.particles.geometry.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        v = this.getVertexForPixelDataOffset(vertex.userData.pixelOffset);
        vertex.x = v.x;
        vertex.y = v.y;
        _results.push(vertex.z = v.z);
      }
      return _results;
    };

    ImageTarget.prototype.load = function(callback) {
      var loader;
      ImageTarget.__super__.load.call(this, callback);
      loader = new THREE.ImageLoader();
      return loader.load(this.targetData.url, this.onLoad);
    };

    ImageTarget.prototype.onLoad = function(img) {
      this.processImage(img);
      return ImageTarget.__super__.onLoad.call(this);
    };

    ImageTarget.prototype.processImage = function(img) {
      var geometry, i, material, vertex, _i, _j, _ref, _ref1;
      this.imageData = this.getImageDataFromImg(img);
      this.updatePositionAdjustments();
      for (i = _i = 3, _ref = this.imageData.data.length; _i < _ref; i = _i += 4) {
        if (this.imageData.data[i] > 0) {
          this.validPixelArrayOffsets.push(i - 3);
        }
      }
      geometry = new THREE.Geometry();
      for (i = _j = 0, _ref1 = this.opts.numParticles; _j < _ref1; i = _j += 1) {
        vertex = this.randomVertexInImage();
        geometry.vertices.push(vertex);
      }
      if (this.opts.sort != null) {
        geometry.vertices.sort(this.opts.sort);
      }
      material = new THREE.ParticleSystemMaterial({
        size: this.opts.size
      });
      return this.particles = new THREE.ParticleSystem(geometry, material);
    };

    ImageTarget.prototype.getImageDataFromImg = function(img) {
      var canvas, ctx;
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, img.width, img.height);
    };

    ImageTarget.prototype.randomVertexInImage = function() {
      var pixelOffset, randomIndex, vertex;
      randomIndex = Math.floor(Math.random() * this.validPixelArrayOffsets.length);
      pixelOffset = this.validPixelArrayOffsets[randomIndex];
      vertex = this.getVertexForPixelDataOffset(pixelOffset);
      return vertex;
    };

    ImageTarget.prototype.getVertexForPixelDataOffset = function(pixelOffset) {
      var b, compsPerRow, g, r, vertex, x, y;
      r = this.imageData.data[pixelOffset];
      g = this.imageData.data[pixelOffset + 1];
      b = this.imageData.data[pixelOffset + 2];
      compsPerRow = 4 * this.imageData.width;
      x = Math.ceil((pixelOffset % compsPerRow) / 4);
      y = Math.ceil(pixelOffset / compsPerRow);
      vertex = new THREE.Vector3(x, y, 0);
      vertex.userData = {
        color: {
          r: r / 255,
          g: g / 255,
          b: b / 255
        },
        pixelOffset: pixelOffset
      };
      this.centerVertex(vertex);
      this.scalevertex(vertex);
      return vertex;
    };

    ImageTarget.prototype.centerVertex = function(vertex) {
      vertex.x -= this.maxW / 2;
      vertex.y = -vertex.y + this.maxH / 2;
      vertex.x += this.offsetX;
      return vertex.y += this.offsetY;
    };

    ImageTarget.prototype.scalevertex = function(vertex) {
      vertex.x *= this.aspectFillImageScaleX;
      return vertex.y *= this.aspectFillImageScaleY;
    };

    ImageTarget.prototype.getParticles = function() {
      return this.particles;
    };

    return ImageTarget;

  })(ParticleSaga.AbstractTarget);

}).call(this);
