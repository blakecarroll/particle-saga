@ParticleSaga ?= {}

class ParticleSaga.Utils

  # Extends target to include all properties in a list of other objects
  @extend = (target, objects...) ->
    for object in objects
      for key, value of object
        target[key] = value
    return
