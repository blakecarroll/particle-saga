(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (this.ParticleSaga == null) {
    this.ParticleSaga = {};
  }


  /*
  @ParticlePool
  Extends a THREE.ParticleSystem to include morphing methods specific to
  ParticleSaga
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
      this.opts.extend(options);
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
