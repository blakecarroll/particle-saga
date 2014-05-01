@ParticleSaga ?= {}

class ParticleSaga.Utils
  @extend = (target, objects...) ->
    for object in objects
      for key, value of object
        target[key] = value
    return
