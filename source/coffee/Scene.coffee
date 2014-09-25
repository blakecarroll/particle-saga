@ParticleSaga ?= {}

###
# @Scene
# The Particle Saga scene controller
###

class ParticleSaga.Scene

  ###
  # @param context - The element that contain the canvas
  # @param targetData - The array of defined targets objects
  # @param options - Object that will override default @opts
  ###
  constructor: (@context=document.body, @targetData=[], options) ->
    @camera
    @scene
    @renderer
    @raf
    @pool
    @respondingToMouse = false
    @sceneReady = false
    @numTargetsLoaded = 0
    @currentTargetIndex
    @targets = []
    @halfW = @context.offsetWidth / 2
    @halfH = @context.offsetHeight / 2
    @mouseX = 0
    @destinationSceneRotationY = 0
    @dirty = true
    @slideshowInterval = null
    @onAssetsLoad = null
    @opts =
      fov: 45
      maxMouseRotation: Math.PI/6
      mouseRotationFriction: 0.2
      numFloatingParticles: 40
      numParticles: 10000
      particleRevertDelay: 0.01
      revertDuration: 800
      sizeAttenuation: true
      slideshowDuration: 5000
      sort: null
    ParticleSaga.Utils.extend @opts, options

    document.addEventListener 'mousemove', @onMouseMove
    @setupScene()

  # Halts animations and drops applicable references
  destroy: =>
    @stop()
    window.removeEventListener 'resize', @resize
    document.removeEventListener 'mousemove', @onMouseMove
    for i in [@scene.children.length-1..0] by -1
      @scene.children[i].geometry.dispose()
      @scene.children[i].material.dispose()
      @scene.remove @scene.children[i]
    for target in @targets
      target.destroy()
    @renderer = null
    @scene = null
    @camera = null
    @pool.destroy()
    @pool = null
    @targets = null
    @opts = null

  # Morph particles to specific target
  setTarget: (index, animated=true) =>
    @currentTargetIndex = index
    if not @sceneReady or typeof @currentTargetIndex is 'undefined'
      return
    if @targets[@currentTargetIndex].opts.respondsToMouse
      @respondingToMouse = true
      @setSceneMouseRotation(@mouseX)
    else
      @respondingToMouse = false
      @setSceneMouseRotation(@halfW)
    targetParticles = @targets[index].getParticles()
    @pool.setTarget targetParticles, animated

  nextTarget: (animated=true) =>
    @resetSlideshow()
    index = @currentTargetIndex
    index++
    if index >= @targets.length
      index = 0
    @setTarget index, animated

  prevTarget: (animated=true) =>
    @resetSlideshow()
    index = @currentTargetIndex
    index--
    if index < 0
      index = @targets.length - 1
    @setTarget index, animated

  resetSlideshow: =>
    if @slideshowInterval?
      @startSlideshow()

  startSlideshow: =>
    clearInterval @slideshowInterval
    @slideshowInterval = setInterval @nextTarget, @opts.slideshowDuration

  stopSlideshow: =>
    clearInterval @slideshowInterval
    @slideshowInterval = null

  resize: =>
    @dirty = true
    @halfW = @context.offsetWidth / 2
    @halfH = @context.offsetHeight / 2
    @camera.aspect = (2*@halfW) / (2*@halfH)
    @camera.updateProjectionMatrix()
    @camera.position.z = 2 * @halfH / (2 * Math.tan(@opts.fov / 2 * (Math.PI / 180)))
    @renderer.setSize 2*@halfW, 2*@halfH
    @pool.resize @halfW, @halfH, @camera.position.z
    for target, i in @targets
      target.resize()
    @setTarget @currentTargetIndex, false

  stop: =>
    cancelAnimationFrame @raf

  animate: =>
    if not @sceneReady
      return
    @raf = requestAnimationFrame(@animate)
    @render()

  setupScene: =>
    @camera = new THREE.PerspectiveCamera(@opts.fov, @halfW/@halfH, 1, 2000)
    @camera.position.z = 2 * @halfH / (2 * Math.tan(@opts.fov / 2 * (Math.PI / 180)))
    @scene = new THREE.Scene()
    @renderer = new THREE.WebGLRenderer antialias: true, alpha: true
    @renderer.setClearColor 0x000000, 0
    @renderer.setSize 2*@halfW, 2*@halfH
    @context.appendChild @renderer.domElement

  # Load initial targetData
  load: (@onAssetsLoad) =>
    @loadTarget(t, @onTargetLoad) for t in @targetData

  ###
  # Load an individual target (safe to use for targets beyond the initial ones)
  # @param target {PlainObject} - The target object description
  # @param onLoad {Function} - Optional callback
  ###
  loadTarget: (target, onLoad) =>
    target.container ?= @context
    target.options ?= {}
    if target.type != ParticleSaga.ModelTarget
      target.options.numParticles = @opts.numParticles
    target.options.sort = @opts.sort
    particleTarget = new target.type target, target.options
    @targets.push particleTarget
    particleTarget.init()
    particleTarget.load onLoad
    @resetSlideshow()

  # Load callback used for initial load
  onTargetLoad: =>
    @numTargetsLoaded++
    if @numTargetsLoaded > 0 and @numTargetsLoaded == @targetData.length
      @onTargetsReady()

  # Begins animations when initial assets have loaded
  onTargetsReady: =>
    @setupPool()
    window.addEventListener 'resize', @resize
    @animate()
    if typeof @onAssetsLoad is 'function'
      @onAssetsLoad()

  setupPool: =>
    @pool = new ParticleSaga.ParticlePool @opts
    @pool.resize @halfW, @halfH, @camera.position.z
    @pool.init()
    @scene.add @pool.getParticles()
    @sceneReady = true
    if @currentTargetIndex?
      @setTarget @currentTargetIndex

  render: =>
    oldTheta = @pool.getRotationY()
    @setSceneMouseRotation @mouseX
    if oldTheta != @pool.getRotationY() or @pool.morphing
      @dirty = true
    if @pool.morphing
      @pool.morph()
    if @dirty
      @dirty = false
      @renderer.render @scene, @camera

  onMouseMove: (event) =>
    @mouseX = event.clientX

  setSceneMouseRotation: (mouseX) =>
    @destinationSceneRotationY = 0
    theta = @pool.getRotationY()
    if @halfW > 0 and @respondingToMouse
      mouseXProportion = (mouseX - @halfW) / @halfW
      @destinationSceneRotationY = @opts.maxMouseRotation * mouseXProportion
    if 0.01 > Math.abs theta - @destinationSceneRotationY
      @pool.setRotationY @destinationSceneRotationY
    else
      deltaRY = @destinationSceneRotationY - theta
      newTheta = theta + @opts.mouseRotationFriction * deltaRY
      @pool.setRotationY newTheta
