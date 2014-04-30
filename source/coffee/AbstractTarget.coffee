@ParticleSaga ?= {}

###
@class AbstractTarget
Provides particle data for a particle scene.
###

class ParticleSaga.AbstractTarget
  constructor: (@targetData, options) ->
    @onLoadCallback

  init: () =>
    # Typically required for targets that need to be size aware.

  load: (callback) =>
    @onLoadCallback = callback

  onLoad: () =>
    if @onLoadCallback?
      @onLoadCallback()

  destroy: =>
    if @particles?
      @particles.geometry.dispose()
      @particles.material.dispose()
      @particles = null

  resize: =>

  getParticles: =>
    return null