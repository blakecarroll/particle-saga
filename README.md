ParticleSaga
============

A gallery for images and models rendered as particles with three.js

[Demo](http://blakecarroll.github.io/particle-saga/)

### Dependencies

* [three.js](http://threejs.org/) - A Javascript 3D Library
* WebGL Enabled Browser

## Usage

Download the [minified script](https://github.com/blakecarroll/particle-saga/deploy/particlesaga.min.js) as well as a copy of [three.js](http://threejs.org/build/three.min.js) and include it in your markup.

```html
<script src="js/three.min.js"></script>
<script src="js/particlesaga.min.js"></script>
```

To prepare ParticleSaga scene you'll then need to define a set of targets (images and/or models) to map the particles to.

```javascript
var targets = [
  {
    type: ParticleSaga.ImageTarget,
    url: 'images/excellent.png',
    options: {
      size: 3
    }
  }, {
    type: ParticleSaga.ModelTarget,
    url: 'models/unicorn.json',
    options: {
      color: {
        r: 0.8,
        g: 1,
        b: 1
      },
      scale: 1.5,
      size: 3,
      respondsToMouse: true
    }
  }
];
```

Next you just need to instantiate a scene with this target data and then either start a slideshow or control the sequence manually.

```javascript
// The scene's context element contains the canvas
var saga = document.getElementById('saga');
		
var scene = new ParticleSaga.Scene(saga, targets, {
  numParticles: 40000,
  sort: ParticleSaga.VertexSort.leftToRight
});
    
// init will make all targets begin loading assets
// and create everything else needed in the scene.      
scene.load(function() {
  scene.setTarget(0);
  scene.startSlideshow();
});
```

# Particle Targets

All targets need to be defined in with json and passed into the scene constructor. The definition consists of the target type, an asset URL, and a set of options. Optionally you can include a container element to assist with sizing and positioning of the particle display - the scene's context element will be used by default.


## ImageTarget

ImageTargets generate particles in the XY plane based on random non-transparent pixels. The particles are scaled to fill the `container` using an aspect-fill scaling.

For best results you should use a high-contrast image with transparent negative space and a lot of padding around content you don't want to have cropped since it's going to be scaled to fill the `container`.

Example definition:

```javascript
{
  type: ParticleSaga.ImageTarget,
  url: 'images/excellent.png',
  options: {
    size: 3
  }
}
```

*Attributes*

Property | Type | Description
--- | :---: | ---
type | Value must be `ParticleSaga.ImageTarget` | The target class (must extend `ParticleSaga.AbstractTarget`)
url | `String` | Path to the image
container | `Element` | Element to constrain position of target with. Default is the scene's `context`
options | `PlainObject` | Options list to override default values described below


*Options*

Property | Type | Description
--- | :---: | ---
respondsToMouse | `Boolean` | Whether or not to rotate the particle system along with the mouse position. Default is `false`
size | `Number` | Sets the size of the particles. Default is `1.0`

## ModelTarget

ModelTargets load a json mesh file using a [THREE.JSONLoader](http://threejs.org/docs/#Reference/Loaders/JSONLoader). You can find model exporters [here](https://github.com/mrdoob/three.js/tree/master/utils/exporters).

Example definition:

```javascript
{
  type: ParticleSaga.ModelTarget,
  url: 'models/unicorn.json',
  options: {
    color: {
      r: 0.8,
      g: 1,
      b: 1
    },
    initialMatrices: [
      new THREE.Matrix4().makeTranslation(0, -2, 0),
      new THREE.Matrix4().makeRotationY(Math.PI/2)
    ],
    respondsToMouse: true,
    scale: 1.5,
    size: 3
  }
}
```

*Optimization:* If you inspect the models used in the examples you'll notice that a lot of data have been stripped out since we only really need the vertices here.

*Attributes*

Property | Type | Description
--- | :---: | ---
type | Value must be `ParticleSaga.ModelTarget` | The target class (must extend `ParticleSaga.AbstractTarget`)
url | `String` | Path to the model json
options | `PlainObject` | Options list to override default values described below


*Options*

Property | Type | Description
--- | :---: | ---
color | `PlainObject` containing `r`, `g`, and `b` properties with `0-1` values <br> Ex/ `{r: 0.5, g: 0.9, b: 1}` | Particle colors
initialMatrices | `Array.<THREE.Matrix4>` | Initial transformations applied to the imported geometry. Default is `[]`
respondsToMouse | `Boolean` | Whether or not to rotate the particle system along with the mouse position. Default is `false`
scale | `Number` | Scales the intial geometry by this value. Default is `1.0`
size | `Number` | Sets the size of the particles. Default is `1.0`

## MultiTarget

MultiTargets can combine a list of other targets into a single geometry to display with the main scene's particles.

Example definition:

```javascript
{
  type: ParticleSaga.MultiTarget,
  container: document.getElementById('multitarget-references'),
  options: {
    size: 3
  },
  targets: [
    {
      type: ParticleSaga.ModelTarget,
      url: 'models/unicorn.json',
      container: document.getElementById('unicorn-multitarget-reference'),
      options: {
        scale: 1.2,
        color: {
          r: 0.8,
          g: 1,
          b: 0.2
        }
      }
    }, {
      type: ParticleSaga.ImageTarget,
      url: 'images/excellent.png',
      container: document.getElementById('excellent-multitarget-reference')
    }
  ]
}
```

*Optimization:* If you inspect the models used in the examples you'll notice that a lot of data have been stripped out since we only really need the vertices here.

*Attributes*

Property | Type | Description
--- | :---: | ---
type | Value must be `ParticleSaga.MultiTarget` | The target class (must extend `ParticleSaga.AbstractTarget`)
container | `Element` | Element to constrain position of target with. Default is the scene's `context`
options | `PlainObject` | Options list to override default values described below
targets | `Array` | List of targets mostly identical to those above, however some properties such as size will be inherited from the MultiTarget's options instead


*Options*

Property | Type | Description
--- | :---: | ---
color | `PlainObject` containing `r`, `g`, and `b` properties with `0-1` values <br> Ex/ `{r: 0.5, g: 0.9, b: 1}` | Default particle colors - will be overridden by any specified model target color in the nested targets array.
respondsToMouse | `Boolean` | Whether or not to rotate the particle system along with the mouse position. Default is `false`
size | `Number` | Sets the size of the particles. Default is `1.0`

## Scene

The scene is the top level object that you'll be interacting with after declaring your targets in order to control the gallery.

### Paramters

*Attributes*

Property | Type | Description
--- | :---: | ---
context | `Element` | The element to append canvas to and to derive max sizing from
targets | `Array` | List of targets as defined above
options | `PlainObject` | Options list to override default values described below

*Options*

Property | Type | Description
--- | :---: | ---
fov | `Number` | Camera field of view degrees. Default is `45`
maxMouseRotation | `Number` | Max radians the mouse position can rotate the particle system's about the y-axis by in either direction. Default is `π/6`
mouseRotationFriction | `Number` | Ratio of decay for how quickly the particle system will catch up to the mouse triggered rotation. Default is `0.2`
numFloatingParticles | `Number` | Number of particles that will appear in a random position rather than attached to a target. Default is `40`
numParticles | `Number` | Number of particles rendered on screen. Note that this does not have to match any other particle/vertex count - they will be evenly distributed or repeated as necessary. Default is `10000`
particleRevertDelay | `Number` | Delay in milliseconds for each particle to begin morph. Default is `0.01`
revertDuration | `Number` | Morph duration in milliseconds for each particle. Default is `800`
sizeAttenuation | `Boolean` | Specify whether particles' size will get smaller with the distance. Default is `true`.
slideshowDuration | `Number` | Duration in milliseconds between each slide if slideshow is enabled. Default is `5000`
sort | `Function` | Javascript (a, b) sort method to be applied to each target's vertices initially. See VertexSort.coffee for some quick options. Default is `null`

### API


Method | Params | Description
--- | :---: | ---
load | (optional) <br> `onAssetsLoad {Function}` | Triggers loading of all initial targets with optional callback
loadTarget | `target {PlainObject}`, `onLoad {Function}` | Load an individual target with an optional callback. This can also be used to load targets beyond the initial ones
destroy || Halts all animation and attempts to dump all references (also calls relevant three.js dispose methods on scene children)
setTarget | `index {Integer}` <br> `animated {Boolean}` (default=`true`) | Morph to the target you supplied at that index
nextTarget | `animated {Boolean}` (default=`true`) | Morph to next target (wraps around)
prevTarget | `animated {Boolean}` (default=`true`) | Morph to previous target (wraps around)
startSlideshow || Start interval going through each target
stopSlideshow || Stops interval going through each target


## Build

Requires [Grunt](http://gruntjs.com/getting-started) and related dependencies ([Node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/)).

After satisfying those requirements you can install the project-specific dependencies and build as follows:

	$ cd path/to/particle-saga
	$ npm install
	$ grunt deploy


## Inspiration

Special thanks to [Eric Moncada](https://github.com/theskabeater), [Brijan Powell](https://twitter.com/brijanp), and [Impossible Bureau](http://www.impossible-bureau.com/). This originally came about while working on our ever-upcoming website where we wanted to showcase our team using individual models that Eric made after scanning us all with a Kinect, and then the idea of intertwining these with images came through Brijan's designs.


## Example Artwork:

3D models used in examples extracted from originals by [izuzf](http://www.blendswap.com/user/izuzf) (Helm) and [simon_k](http://www.blendswap.com/user/simon_k) (Gryphon)

Images used in examples come from Wikimedia Commons [Olav den helliges saga](http://commons.wikimedia.org/wiki/File:Olav_den_helliges_saga_GM18.jpg), [Pomerania coat of arms](http://commons.wikimedia.org/wiki/File:POL_wojew%C3%B3dztwo_zachodniopomorskie_COA.svg)

