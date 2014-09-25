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
;(function() {
  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @VertexSort
   * Ready to use sorting methods for controlling vertex morph animations
   */

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
;(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @ParticlePool
   * Wraps a THREE.ParticleSystem to include morphing methods specific to
   * ParticleSaga
   */

  ParticleSaga.ParticlePool = (function() {
    function ParticlePool(options) {
      this.setRotationY = __bind(this.setRotationY, this);
      this.getRotationY = __bind(this.getRotationY, this);
      this.morph = __bind(this.morph, this);
      this.nextIndexForPool = __bind(this.nextIndexForPool, this);
      this.makeRandomVertex = __bind(this.makeRandomVertex, this);
      this.getParticles = __bind(this.getParticles, this);
      this.createParticles = __bind(this.createParticles, this);
      this.resize = __bind(this.resize, this);
      this.setTarget = __bind(this.setTarget, this);
      this.destroy = __bind(this.destroy, this);
      this.particles;
      this.respondingToMouse = false;
      this.morphing = false;
      this.morphStartTime;
      this.currentTargetIndex;
      this.targets = [];
      this.halfW = 0;
      this.halfH = 0;
      this.halfZ = 0;
      this.opts = {
        numFloatingParticles: 40,
        numParticles: 10000,
        particleRevertDelay: 0.008,
        revertDuration: 1000,
        sizeAttenuation: true
      };
      ParticleSaga.Utils.extend(this.opts, options);
    }

    ParticlePool.prototype.init = function() {
      return this.createParticles();
    };

    ParticlePool.prototype.destroy = function() {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.particles = null;
      return this.opts = null;
    };

    ParticlePool.prototype.setTarget = function(targetParticles, animated) {
      var color, duration, i, nextVertex, nextVertexIndex, randomV, vertex, _i, _len, _ref;
      if (animated == null) {
        animated = true;
      }
      targetParticles = targetParticles.clone();
      this.particles.material.size = targetParticles.material.size;
      _ref = this.particles.geometry.vertices;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        vertex = _ref[i];
        duration = animated ? this.opts.revertDuration : 0;
        vertex.userData.morph.duration = duration;
        vertex.userData.morph.delay = i * this.opts.particleRevertDelay;
        vertex.userData.prevV = vertex.clone();
        vertex.userData.prevC = this.particles.geometry.colors[i].clone();
        nextVertexIndex = this.nextIndexForPool(i, targetParticles);
        nextVertex = targetParticles.geometry.vertices[nextVertexIndex];
        vertex.userData.nextV = nextVertex.clone();
        if (vertex.userData.alwaysFloating) {
          randomV = this.makeRandomVertex();
          vertex.userData.nextV.set(randomV.x, randomV.y, randomV.z);
        }
        color = nextVertex.userData.color;
        if (!color) {
          color.r = color.b = color.g = 0;
        }
        vertex.userData.nextC.setRGB(color.r, color.g, color.b);
      }
      this.morphStartTime = new Date();
      return this.morphing = true;
    };

    ParticlePool.prototype.resize = function(halfW, halfH, halfZ) {
      this.halfW = halfW;
      this.halfH = halfH;
      this.halfZ = halfZ;
    };

    ParticlePool.prototype.createParticles = function() {
      var floatingVertexOffset, geometry, i, isAlwaysFloating, material, _i, _ref;
      geometry = new THREE.Geometry();
      if (this.opts.numFloatingParticles > 0) {
        floatingVertexOffset = Math.floor(this.opts.numParticles / this.opts.numFloatingParticles);
      }
      for (i = _i = 0, _ref = this.opts.numParticles; _i < _ref; i = _i += 1) {
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        if (floatingVertexOffset != null) {
          isAlwaysFloating = i % floatingVertexOffset === 0;
        }
        geometry.vertices[i].userData = {
          alwaysFloating: isAlwaysFloating,
          prevV: geometry.vertices[i].clone(),
          nextV: geometry.vertices[i].clone(),
          prevC: new THREE.Color(1, 1, 1),
          nextC: new THREE.Color(1, 1, 1),
          morph: {
            delay: 0,
            duration: 0
          }
        };
        geometry.colors.push(new THREE.Color(1, 1, 1));
      }
      material = new THREE.ParticleSystemMaterial({
        vertexColors: true,
        transparent: true,
        depthTest: false,
        sizeAttenuation: this.opts.sizeAttenuation
      });
      this.particles = new THREE.ParticleSystem(geometry, material);
      return this.particles.sortParticles = false;
    };

    ParticlePool.prototype.getParticles = function() {
      return this.particles;
    };

    ParticlePool.prototype.makeRandomVertex = function() {
      var vert;
      vert = new THREE.Vector3(0, 0, 0);
      vert.x = Math.random() * 2 * this.halfW - this.halfW;
      vert.y = Math.random() * 2 * this.halfH - this.halfH;
      vert.z = Math.random() * 2 * this.halfZ / 3 - this.halfZ / 3;
      return vert;
    };


    /*
     * Used to evenly distribute particles over the target's vertices
     * @param poolIndex - The current pool particle's index
     * @param targetParticles - The target's particle system
     * @return The target particle vertex index that should map to i
     */

    ParticlePool.prototype.nextIndexForPool = function(poolIndex, targetParticles) {
      var numTargetParticles, ratio;
      numTargetParticles = targetParticles.geometry.vertices.length;
      ratio = numTargetParticles / this.opts.numParticles;
      return Math.floor(poolIndex * ratio);
    };

    ParticlePool.prototype.morph = function() {
      var b, complete, deltaT, g, i, now, progress, r, v, x, y, z, _i, _len, _ref;
      now = new Date();
      deltaT = now - this.morphStartTime;
      complete = true;
      _ref = this.particles.geometry.vertices;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        progress = 1;
        if (v.userData.morph.duration > 0) {
          progress = Math.max(0, deltaT - v.userData.morph.delay);
          progress = Math.min(1, progress / v.userData.morph.duration);
          progress = 1 - (--progress * progress * progress * progress);
        }
        r = v.userData.prevC.r + progress * (v.userData.nextC.r - v.userData.prevC.r);
        g = v.userData.prevC.g + progress * (v.userData.nextC.g - v.userData.prevC.g);
        b = v.userData.prevC.b + progress * (v.userData.nextC.b - v.userData.prevC.b);
        this.particles.geometry.colors[i].setRGB(r, g, b);
        x = v.userData.prevV.x + progress * (v.userData.nextV.x - v.userData.prevV.x);
        y = v.userData.prevV.y + progress * (v.userData.nextV.y - v.userData.prevV.y);
        z = v.userData.prevV.z + progress * (v.userData.nextV.z - v.userData.prevV.z);
        v.set(x, y, z);
        if (progress < 1) {
          complete = false;
        }
      }
      if (complete) {
        this.morphing = false;
      }
      this.particles.geometry.verticesNeedUpdate = true;
      return this.particles.geometry.colorsNeedUpdate = true;
    };

    ParticlePool.prototype.getRotationY = function() {
      return this.particles.rotation.y;
    };

    ParticlePool.prototype.setRotationY = function(theta) {
      return this.particles.rotation.y = theta;
    };

    return ParticlePool;

  })();

}).call(this);
;(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @Scene
   * The Particle Saga scene controller
   */

  ParticleSaga.Scene = (function() {

    /*
     * @param context - The element that contain the canvas
     * @param targetData - The array of defined targets objects
     * @param options - Object that will override default @opts
     */
    function Scene(context, targetData, options) {
      this.context = context != null ? context : document.body;
      this.targetData = targetData != null ? targetData : [];
      this.setSceneMouseRotation = __bind(this.setSceneMouseRotation, this);
      this.onMouseMove = __bind(this.onMouseMove, this);
      this.render = __bind(this.render, this);
      this.setupPool = __bind(this.setupPool, this);
      this.onTargetsReady = __bind(this.onTargetsReady, this);
      this.onTargetLoad = __bind(this.onTargetLoad, this);
      this.loadTarget = __bind(this.loadTarget, this);
      this.load = __bind(this.load, this);
      this.setupScene = __bind(this.setupScene, this);
      this.animate = __bind(this.animate, this);
      this.stop = __bind(this.stop, this);
      this.resize = __bind(this.resize, this);
      this.stopSlideshow = __bind(this.stopSlideshow, this);
      this.startSlideshow = __bind(this.startSlideshow, this);
      this.resetSlideshow = __bind(this.resetSlideshow, this);
      this.prevTarget = __bind(this.prevTarget, this);
      this.nextTarget = __bind(this.nextTarget, this);
      this.setTarget = __bind(this.setTarget, this);
      this.destroy = __bind(this.destroy, this);
      this.camera;
      this.scene;
      this.renderer;
      this.raf;
      this.pool;
      this.respondingToMouse = false;
      this.sceneReady = false;
      this.numTargetsLoaded = 0;
      this.currentTargetIndex;
      this.targets = [];
      this.halfW = this.context.offsetWidth / 2;
      this.halfH = this.context.offsetHeight / 2;
      this.mouseX = 0;
      this.destinationSceneRotationY = 0;
      this.dirty = true;
      this.slideshowInterval = null;
      this.onAssetsLoad = null;
      this.opts = {
        fov: 45,
        maxMouseRotation: Math.PI / 6,
        mouseRotationFriction: 0.2,
        numFloatingParticles: 40,
        numParticles: 10000,
        particleRevertDelay: 0.01,
        revertDuration: 800,
        sizeAttenuation: true,
        slideshowDuration: 5000,
        sort: null
      };
      ParticleSaga.Utils.extend(this.opts, options);
      document.addEventListener('mousemove', this.onMouseMove);
      this.setupScene();
    }

    Scene.prototype.destroy = function() {
      var i, target, _i, _j, _len, _ref, _ref1;
      this.stop();
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('mousemove', this.onMouseMove);
      for (i = _i = _ref = this.scene.children.length - 1; _i >= 0; i = _i += -1) {
        this.scene.children[i].geometry.dispose();
        this.scene.children[i].material.dispose();
        this.scene.remove(this.scene.children[i]);
      }
      _ref1 = this.targets;
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        target = _ref1[_j];
        target.destroy();
      }
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.pool.destroy();
      this.pool = null;
      this.targets = null;
      return this.opts = null;
    };

    Scene.prototype.setTarget = function(index, animated) {
      var targetParticles;
      if (animated == null) {
        animated = true;
      }
      this.currentTargetIndex = index;
      if (!this.sceneReady || typeof this.currentTargetIndex === 'undefined') {
        return;
      }
      if (this.targets[this.currentTargetIndex].opts.respondsToMouse) {
        this.respondingToMouse = true;
        this.setSceneMouseRotation(this.mouseX);
      } else {
        this.respondingToMouse = false;
        this.setSceneMouseRotation(this.halfW);
      }
      targetParticles = this.targets[index].getParticles();
      return this.pool.setTarget(targetParticles, animated);
    };

    Scene.prototype.nextTarget = function(animated) {
      var index;
      if (animated == null) {
        animated = true;
      }
      this.resetSlideshow();
      index = this.currentTargetIndex;
      index++;
      if (index >= this.targets.length) {
        index = 0;
      }
      return this.setTarget(index, animated);
    };

    Scene.prototype.prevTarget = function(animated) {
      var index;
      if (animated == null) {
        animated = true;
      }
      this.resetSlideshow();
      index = this.currentTargetIndex;
      index--;
      if (index < 0) {
        index = this.targets.length - 1;
      }
      return this.setTarget(index, animated);
    };

    Scene.prototype.resetSlideshow = function() {
      if (this.slideshowInterval != null) {
        return this.startSlideshow();
      }
    };

    Scene.prototype.startSlideshow = function() {
      clearInterval(this.slideshowInterval);
      return this.slideshowInterval = setInterval(this.nextTarget, this.opts.slideshowDuration);
    };

    Scene.prototype.stopSlideshow = function() {
      clearInterval(this.slideshowInterval);
      return this.slideshowInterval = null;
    };

    Scene.prototype.resize = function() {
      var i, target, _i, _len, _ref;
      this.dirty = true;
      this.halfW = this.context.offsetWidth / 2;
      this.halfH = this.context.offsetHeight / 2;
      this.camera.aspect = (2 * this.halfW) / (2 * this.halfH);
      this.camera.updateProjectionMatrix();
      this.camera.position.z = 2 * this.halfH / (2 * Math.tan(this.opts.fov / 2 * (Math.PI / 180)));
      this.renderer.setSize(2 * this.halfW, 2 * this.halfH);
      this.pool.resize(this.halfW, this.halfH, this.camera.position.z);
      _ref = this.targets;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        target = _ref[i];
        target.resize();
      }
      return this.setTarget(this.currentTargetIndex, false);
    };

    Scene.prototype.stop = function() {
      return cancelAnimationFrame(this.raf);
    };

    Scene.prototype.animate = function() {
      if (!this.sceneReady) {
        return;
      }
      this.raf = requestAnimationFrame(this.animate);
      return this.render();
    };

    Scene.prototype.setupScene = function() {
      this.camera = new THREE.PerspectiveCamera(this.opts.fov, this.halfW / this.halfH, 1, 2000);
      this.camera.position.z = 2 * this.halfH / (2 * Math.tan(this.opts.fov / 2 * (Math.PI / 180)));
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(2 * this.halfW, 2 * this.halfH);
      return this.context.appendChild(this.renderer.domElement);
    };

    Scene.prototype.load = function(onAssetsLoad) {
      var t, _i, _len, _ref, _results;
      this.onAssetsLoad = onAssetsLoad;
      _ref = this.targetData;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        _results.push(this.loadTarget(t, this.onTargetLoad));
      }
      return _results;
    };


    /*
     * Load an individual target (safe to use for targets beyond the initial ones)
     * @param target {PlainObject} - The target object description
     * @param onLoad {Function} - Optional callback
     */

    Scene.prototype.loadTarget = function(target, onLoad) {
      var particleTarget;
      if (target.container == null) {
        target.container = this.context;
      }
      if (target.options == null) {
        target.options = {};
      }
      if (target.type !== ParticleSaga.ModelTarget) {
        target.options.numParticles = this.opts.numParticles;
      }
      target.options.sort = this.opts.sort;
      particleTarget = new target.type(target, target.options);
      this.targets.push(particleTarget);
      particleTarget.init();
      particleTarget.load(onLoad);
      return this.resetSlideshow();
    };

    Scene.prototype.onTargetLoad = function() {
      this.numTargetsLoaded++;
      if (this.numTargetsLoaded > 0 && this.numTargetsLoaded === this.targetData.length) {
        return this.onTargetsReady();
      }
    };

    Scene.prototype.onTargetsReady = function() {
      this.setupPool();
      window.addEventListener('resize', this.resize);
      this.animate();
      if (typeof this.onAssetsLoad === 'function') {
        return this.onAssetsLoad();
      }
    };

    Scene.prototype.setupPool = function() {
      this.pool = new ParticleSaga.ParticlePool(this.opts);
      this.pool.resize(this.halfW, this.halfH, this.camera.position.z);
      this.pool.init();
      this.scene.add(this.pool.getParticles());
      this.sceneReady = true;
      if (this.currentTargetIndex != null) {
        return this.setTarget(this.currentTargetIndex);
      }
    };

    Scene.prototype.render = function() {
      var oldTheta;
      oldTheta = this.pool.getRotationY();
      this.setSceneMouseRotation(this.mouseX);
      if (oldTheta !== this.pool.getRotationY() || this.pool.morphing) {
        this.dirty = true;
      }
      if (this.pool.morphing) {
        this.pool.morph();
      }
      if (this.dirty) {
        this.dirty = false;
        return this.renderer.render(this.scene, this.camera);
      }
    };

    Scene.prototype.onMouseMove = function(event) {
      return this.mouseX = event.clientX;
    };

    Scene.prototype.setSceneMouseRotation = function(mouseX) {
      var deltaRY, mouseXProportion, newTheta, theta;
      this.destinationSceneRotationY = 0;
      theta = this.pool.getRotationY();
      if (this.halfW > 0 && this.respondingToMouse) {
        mouseXProportion = (mouseX - this.halfW) / this.halfW;
        this.destinationSceneRotationY = this.opts.maxMouseRotation * mouseXProportion;
      }
      if (0.01 > Math.abs(theta - this.destinationSceneRotationY)) {
        return this.pool.setRotationY(this.destinationSceneRotationY);
      } else {
        deltaRY = this.destinationSceneRotationY - theta;
        newTheta = theta + this.opts.mouseRotationFriction * deltaRY;
        return this.pool.setRotationY(newTheta);
      }
    };

    return Scene;

  })();

}).call(this);
;(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @AbstractTarget
   * Abstract class that all particle targets must implement or override
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


    /*
     * Must return a THREE.ParticleSystem - this is needed by the pool to maps
     * vertices to this target
     */

    AbstractTarget.prototype.getParticles = function() {
      return null;
    };

    return AbstractTarget;

  })();

}).call(this);
;(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @ImageTarget
   * Identifies and produces geometry for particles based on an image.
   */

  ParticleSaga.ImageTarget = (function(_super) {
    __extends(ImageTarget, _super);

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


    /*
     * Generate particles for an image
     * @param img - A loaded img element
     */

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


    /*
     * Extracts image data object from an image
     * @param img - A loaded img element
     */

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


    /*
     * Returns a vertex based on the index of a visible red component in the pixel
     * data array
     */

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
;(function() {
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
;(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
   * @MultiTarget
   * A target for merging multiple targets into one.
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
