@ParticleSaga ?= {}

###
# @VertexSort
# Ready to use sorting methods for controlling vertex morph animations
###

ParticleSaga.VertexSort =

  topToBottom: (a, b) =>
    if a.y < b.y
      return 1
    else if a.y > b.y
      return -1
    return 0

  bottomToTop: (a, b) =>
    if a.y < b.y
      return -1
    else if a.y > b.y
      return 1
    return 0

  leftToRight: (a, b) =>
    if a.x < b.x
      return -1
    else if a.x > b.x
      return 1
    return 0

  rightToLeft: (a, b) =>
    if a.x < b.x
      return 1
    else if a.x > b.x
      return -1
    return 0

  backToFront: (a, b) =>
    if a.z < b.z
      return -1
    else if a.z > b.z
      return 1
    return 0

  frontToBack: (a, b) =>
    if a.z < b.z
      return 1
    else if a.z > b.z
      return -1
    return 0

  randomish: (a, b) =>
    rand = Math.random()
    if rand < 0.33
      return 1
    else if rand < 0.66
      return -1
    else
      return 0
