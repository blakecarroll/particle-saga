@ParticleSaga ?= {}

###
@class MultiTarget
Provides particle data for a scene based on multiple targets.
###

class ParticleSaga.MultiTarget extends ParticleSaga.AbstractTarget

  ###
  @param {Array.object} targetData - the list of target data objects.
  ###
  constructor: (@targetData, options) ->
    super(@targetData, options)
    @targets = []
    @particles
    @container = @targetData.container
    @numTargetsLoaded = 0
    @opts =
      color:
        r: 1
        g: 1
        b: 1
      respondsToMouse: false
      size: 1.0
      sort: null
    @opts.extend options

  load: (callback) =>
    super(callback)
    for target, i in @targetData.targets
      target.container ?= @container
      target.options ?= target.options || {}
      if target.type != ParticleSaga.ModelTarget
        target.options.numParticles = @opts.numParticles
      opts = {}
      opts.extend @opts
      opts.extend target.options
      @targets.push new target.type target, opts
      @targets[i].init()
      @targets[i].load(@onTargetLoad)

  onTargetLoad: =>
    @numTargetsLoaded++
    if @numTargetsLoaded > 0 and @numTargetsLoaded is @targetData.targets.length
      @resize()
      @onLoad()

  prepareParticles: =>
    geometry = new THREE.Geometry()
    for target, i in @targets
      targetData = @targetData.targets[i]
      targetOffsets = @getTargetOffsets targetData
      targetParticles = target.getParticles()
      for vertex in targetParticles.geometry.vertices
        userData = vertex.userData
        v = vertex.clone()
        v.userData = vertex.userData
        v.x += targetOffsets.x
        v.y += targetOffsets.y
        geometry.vertices.push v
    if @opts.sort?
      geometry.vertices.sort @opts.sort
    material = new THREE.ParticleSystemMaterial size: @opts.size
    @particles = new THREE.ParticleSystem geometry, material

  getTargetOffsets: (targetData) =>
    halfW = 0
    halfH = 0
    offsetY = 0
    halfW = @container.offsetWidth / 2
    halfH = @container.offsetHeight / 2
    el = targetData.container
    x = (el.offsetLeft + 0.5 * el.offsetWidth) - halfW
    y = halfH - (el.offsetTop + offsetY + 0.5 * el.offsetHeight)
    return {x: x, y: y}

  resize: =>
    @prepareParticles()

  getParticles: =>
    return @particles
