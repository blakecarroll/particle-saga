@ParticleSaga ?= {}

###
# @AbstractTarget
# Abstract class that all particle targets must implement or override
###

class ParticleSaga.AbstractTarget

  constructor: (@targetData, options) ->
    @onLoadCallback

  init: () =>
    # Typically required for targets that need to be size aware.

  load: (callback) =>
    @onLoadCallback = callback

  # Called after target has loaded
  onLoad: () =>
    if @onLoadCallback?
      @onLoadCallback()

  destroy: =>
    if @particles?
      @particles.geometry.dispose()
      @particles.material.dispose()
      @particles = null

  resize: =>

  ###
  # Must return a THREE.ParticleSystem - this is needed by the pool to maps
  # vertices to this target
  ###
  getParticles: =>
    return null