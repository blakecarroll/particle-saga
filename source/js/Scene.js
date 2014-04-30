(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @Scene
  The Particle Saga scene controller
   */


  /*
  @param {Element} context - the container element for the component elements.
   */

  ParticleSaga.Scene = (function() {
    function Scene(context, targetData, options) {
      this.context = context != null ? context : document.body;
      this.targetData = targetData != null ? targetData : [];
      this.setSceneMouseRotation = __bind(this.setSceneMouseRotation, this);
      this.onMouseMove = __bind(this.onMouseMove, this);
      this.render = __bind(this.render, this);
      this.setupPool = __bind(this.setupPool, this);
      this.onTargetsReady = __bind(this.onTargetsReady, this);
      this.onTargetLoad = __bind(this.onTargetLoad, this);
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
      this.opts.extend(options);
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
      if (!this.sceneReady) {
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
      var i, target, _i, _len, _ref, _results;
      this.onAssetsLoad = onAssetsLoad;
      _ref = this.targetData;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        target = _ref[i];
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
        this.targets.push(new target.type(target, target.options));
        this.targets[i].init();
        _results.push(this.targets[i].load(this.onTargetLoad));
      }
      return _results;
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
