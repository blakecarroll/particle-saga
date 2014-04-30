@ParticleSaga ?= {}

###
@class ImageTarget
Identifies and produces geometry for particles based on an image.
###

class ParticleSaga.ImageTarget extends ParticleSaga.AbstractTarget

  ###
  @param {Object} targetData - Must contain a url and any other options
  ###
  constructor: (@targetData, options) ->
    super(@targetData, options)
    @particles
    @container = @targetData.container
    @validPixelArrayOffsets = []
    @maxW = 0
    @maxH = 0
    @offsetX = 0
    @offsetY = 0
    @imageData
    @aspectFillImageScaleX = 1
    @aspectFillImageScaleY = 1
    @opts =
      numParticles: 10000
      respondsToMouse: false
      size: 1.0
      sort: null
    @opts.extend options

  init: =>
    @resize()

  resize: =>
    @maxW = @container.offsetWidth
    @maxH = @container.offsetHeight
    if @imageData
      @updatePositionAdjustments()
      if @particles
        @updateParticlePositions()

  updatePositionAdjustments: =>
    width = @maxW
    height = @maxH
    outerRatio = @maxW/@maxH
    innerRatio = @imageData.width/@imageData.height
    if outerRatio > innerRatio
      width = @maxW
      height = width / innerRatio
    else
      height = @maxH
      width = height * innerRatio
    @aspectFillImageScaleX = width / @imageData.width
    @aspectFillImageScaleY = height / @imageData.height
    @offsetX = (@maxW - @imageData.width) / 2
    @offsetY = -(@maxH - @imageData.height) / 2

  updateParticlePositions: =>
    for vertex in @particles.geometry.vertices
      v = @getVertexForPixelDataOffset vertex.userData.pixelOffset
      vertex.x = v.x
      vertex.y = v.y
      vertex.z = v.z

  load: (callback) =>
    super(callback)
    loader = new THREE.ImageLoader()
    loader.load(@targetData.url, @onLoad)

  onLoad: (img) =>
    @processImage(img)
    super()

  processImage: (img) =>
    @imageData = @getImageDataFromImg(img)
    @updatePositionAdjustments()

    # Store valid pixel data offsets if alpha > 0
    for i in [3...@imageData.data.length] by 4
      if @imageData.data[i] > 0
        @validPixelArrayOffsets.push(i - 3)

    geometry = new THREE.Geometry()
    for i in [0...@opts.numParticles] by 1
      vertex = @randomVertexInImage()
      geometry.vertices.push vertex
    if @opts.sort?
      geometry.vertices.sort @opts.sort
    material = new THREE.ParticleSystemMaterial size: @opts.size
    @particles = new THREE.ParticleSystem geometry, material

  getImageDataFromImg: (img) =>
    canvas = document.createElement 'canvas'
    canvas.width = img.width
    canvas.height = img.height
    ctx = canvas.getContext '2d'
    ctx.drawImage img, 0, 0
    return ctx.getImageData 0, 0, img.width, img.height

  randomVertexInImage: =>
    randomIndex = Math.floor(Math.random()*@validPixelArrayOffsets.length)
    pixelOffset = @validPixelArrayOffsets[randomIndex]
    vertex = @getVertexForPixelDataOffset pixelOffset
    return vertex

  getVertexForPixelDataOffset: (pixelOffset) =>
    r = @imageData.data[pixelOffset]
    g = @imageData.data[pixelOffset+1]
    b = @imageData.data[pixelOffset+2]
    compsPerRow = 4*@imageData.width
    x = Math.ceil (pixelOffset%compsPerRow)/4
    y = Math.ceil pixelOffset/compsPerRow
    vertex = new THREE.Vector3(x, y, 0)
    vertex.userData =
      color:
        r: r/255
        g: g/255
        b: b/255
      pixelOffset: pixelOffset
    @centerVertex vertex
    @scalevertex vertex
    return vertex

  centerVertex: (vertex) =>
    # Convert coordinates centered about origin
    vertex.x -= @maxW/2
    vertex.y = -vertex.y + @maxH/2
    # Apply aspect-fill derived offsets
    vertex.x += @offsetX
    vertex.y += @offsetY

  scalevertex: (vertex) =>
    vertex.x *= @aspectFillImageScaleX
    vertex.y *= @aspectFillImageScaleY

  getParticles: =>
    return @particles
