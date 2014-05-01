@ParticleSaga ?= {}

###
@class ModelTarget
Provides particle data for a 3D model based particle target.
###

class ParticleSaga.ModelTarget extends ParticleSaga.AbstractTarget
  ###
  @param {String} modelUrl - the .stl file url.
  ###
  constructor: (@targetData, options) ->
    super(@targetData, options)
    @particles
    @container = @targetData.container
    @opts =
      color:
        r: 1
        g: 1
        b: 1
      initialMatrices: []
      respondsToMouse: false
      scale: 1.0
      size: 1.0
      sort: null
    ParticleSaga.Utils.extend @opts, options

  load: (callback) =>
    super(callback)
    if @targetData.preloadedVertices?
      geometry = new THREE.Geometry()
      verts = @targetData.preloadedVertices
      for i in [0...verts.length] by 3
        geometry.vertices.push new THREE.Vector3 verts[i], verts[i+1], verts[i+2]
      @onLoad geometry
    else
      loader = new THREE.JSONLoader()
      loader.load @targetData.url, @onLoad

  onLoad: (geometry) =>
    @processGeometry geometry
    super()

  processGeometry: (geometry) =>
    geometry.mergeVertices()
    for vertex in geometry.vertices
      vertex.userData = {color: @opts.color}
    for matrix in @opts.initialMatrices
      geometry.applyMatrix matrix
    geometry.applyMatrix new THREE.Matrix4().makeScale(@opts.scale, @opts.scale, @opts.scale)
    if @opts.sort?
      geometry.vertices.sort @opts.sort
    material = new THREE.ParticleSystemMaterial size: @opts.size
    @particles = new THREE.ParticleSystem geometry, material

  getParticles: =>
    return @particles