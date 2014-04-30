@ParticleSaga ?= {}

###
@ParticlePool
Extends a THREE.ParticleSystem to include morphing methods specific to
ParticleSaga
###

class ParticleSaga.ParticlePool
  constructor: (options) ->
    @particles
    @respondingToMouse = false
    @morphing = false
    @morphStartTime
    @currentTargetIndex
    @targets = []
    @halfW = 0
    @halfH = 0
    @halfZ = 0
    @opts =
      numFloatingParticles: 40
      numParticles: 10000
      particleRevertDelay: 0.008
      revertDuration: 1000
      sizeAttenuation: true
    @opts.extend options

  init: ->
    @createParticles()

  destroy: =>
    @particles.geometry.dispose()
    @particles.material.dispose()
    @particles = null
    @opts = null

  setTarget: (targetParticles, animated=true) =>
    targetParticles = targetParticles.clone()
    @particles.material.size = targetParticles.material.size
    for vertex, i in @particles.geometry.vertices
      duration = if animated then @opts.revertDuration else 0
      vertex.userData.morph.duration = duration
      vertex.userData.morph.delay = i * @opts.particleRevertDelay
      # Morph target attributes
      vertex.userData.prevV = vertex.clone()
      vertex.userData.prevC = @particles.geometry.colors[i].clone()
      nextVertexIndex = @nextIndexForPool i, targetParticles
      nextVertex = targetParticles.geometry.vertices[nextVertexIndex]
      vertex.userData.nextV = nextVertex.clone()
      if vertex.userData.alwaysFloating
        randomV = @makeRandomVertex()
        vertex.userData.nextV.set(randomV.x, randomV.y, randomV.z)
      color = nextVertex.userData.color
      if not color
        color.r = color.b = color.g = 0
      vertex.userData.nextC.setRGB color.r, color.g, color.b
    @morphStartTime = new Date();
    @morphing = true

  resize: (@halfW, @halfH, @halfZ) =>

  createParticles: =>
    geometry = new THREE.Geometry()
    if @opts.numFloatingParticles > 0
      floatingVertexOffset = Math.floor(@opts.numParticles / @opts.numFloatingParticles)
    for i in [0...@opts.numParticles] by 1
      geometry.vertices.push new THREE.Vector3 0, 0, 0
      if floatingVertexOffset?
        isAlwaysFloating = i % floatingVertexOffset == 0
      geometry.vertices[i].userData =
        alwaysFloating: isAlwaysFloating
        prevV: geometry.vertices[i].clone()
        nextV: geometry.vertices[i].clone()
        prevC: new THREE.Color(1, 1, 1);
        nextC: new THREE.Color(1, 1, 1);
        morph: {
          delay: 0
          duration: 0
        }
      geometry.colors.push new THREE.Color(1, 1, 1);
    material = new THREE.ParticleSystemMaterial
      vertexColors: true
      transparent: true
      depthTest: false
      sizeAttenuation: @opts.sizeAttenuation
    @particles = new THREE.ParticleSystem geometry, material
    @particles.sortParticles = false

  getParticles: =>
    return @particles

  makeRandomVertex: =>
    vert = new THREE.Vector3 0, 0, 0
    vert.x = Math.random() * 2 * @halfW - @halfW
    vert.y = Math.random() * 2 * @halfH - @halfH
    vert.z = Math.random() * 2 * @halfZ/3 - @halfZ/3
    return vert

  nextIndexForPool: (poolIndex, targetParticles) =>
    numTargetParticles = targetParticles.geometry.vertices.length
    ratio = numTargetParticles/@opts.numParticles
    return Math.floor poolIndex * ratio

  morph: =>
    now = new Date();
    deltaT = now - @morphStartTime
    complete = true
    for v, i in @particles.geometry.vertices
      progress = 1
      if v.userData.morph.duration > 0
        progress = Math.max(0, deltaT - v.userData.morph.delay)
        progress = Math.min(1, progress / v.userData.morph.duration)
        progress = 1 - (--progress * progress * progress * progress)
      # Color
      r = v.userData.prevC.r + progress * (v.userData.nextC.r - v.userData.prevC.r)
      g = v.userData.prevC.g + progress * (v.userData.nextC.g - v.userData.prevC.g)
      b = v.userData.prevC.b + progress * (v.userData.nextC.b - v.userData.prevC.b)
      @particles.geometry.colors[i].setRGB r, g, b
      # Position
      x = v.userData.prevV.x + progress * (v.userData.nextV.x - v.userData.prevV.x)
      y = v.userData.prevV.y + progress * (v.userData.nextV.y - v.userData.prevV.y)
      z = v.userData.prevV.z + progress * (v.userData.nextV.z - v.userData.prevV.z)
      v.set x, y, z
      if progress < 1
        complete = false
    if complete
      @morphing = false
    @particles.geometry.verticesNeedUpdate = true
    @particles.geometry.colorsNeedUpdate = true

  getRotationY: =>
    return @particles.rotation.y

  setRotationY: (theta) =>
    @particles.rotation.y = theta
