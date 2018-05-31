require('aframe')
require('./aframe-meshline-component-local/aframe-meshline-component.min.js')
require('aframe-curve-component')
// TODO: When next version of super-hands gets published this can be updated
// (as of today, April 6, 2018, the npm version is 5 months out of date, so I'm using a script to the git version)
require('./super-hands-local/super-hands.min.js');

const TWO_PI = Math.PI * 2

AFRAME.registerComponent('add-stations', {
    schema: {
        positionMultiplier: { default : 3.0 },
        numStations: { default : 6 },
        stationSize: { default : 1.5 }
    },
    init: function () {
        let scene = this.el.sceneEl
        let stationHolder = document.createElement('a-entity')
        stationHolder.setAttribute('position', '0 -2 -2.5')
        this.data.stationHolder = stationHolder

        for (let i = 1; i <= this.data.numStations; ++i) {
            let plane = document.createElement('a-plane')
            let {x,y} = plane.getAttribute('position')
            let angle = TWO_PI * (i / this.data.numStations)
            x += Math.sin(angle) * this.data.positionMultiplier
            y +=  Math.cos(angle) * this.data.positionMultiplier

            plane.setAttribute('position', `${x} ${y} -1`)
            plane.setAttribute('width', this.data.stationSize)
            plane.setAttribute('height', this.data.stationSize)
            plane.setAttribute('class', 'station')
            plane.setAttribute('fade-out', '')

            // plane.setAttribute('rotation', `0 0 ${i * (360 - 360 / 6)}`)
            plane.setAttribute('material', `src: ./assets/stations/${i}.jpg`)
            stationHolder.appendChild(plane)
        }
        scene.appendChild(stationHolder)
        this.data.stations = [...document.querySelectorAll('.station')]
    },
    tick: function (t, dt) {
        // 30, 30, 40, 40, 30, 30
        // 35, 70, 115, 155, 185, 215
        // console.log(`seconds: ${t/1000}`)
        for (let i = 0; i < this.data.numStations; ++i) {
            let station = this.data.stations[i]
            let {x,y,z} = AFRAME.utils.coordinates.parse(station.getAttribute('position'))
            // let angle = TWO_PI * (i / this.data.numStations) + (performance.now() * -0.0001)
            // let angle = TWO_PI * (i / this.data.numStations) + (performance.now() * -0.0001)
            // const angleMultiplier = (t/1000 * -0.1)
            let newT = t/1000;

            // Write actual easing function, sketch out the whole thing
            if (newT < 30) {
                newT = 1
            } else if (newT < 35) {
            } else if (newT > 40 && newT < 70) {
                newT = 2
            }

            // easeInOutQuad = function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }

            const angleMultiplier = (Math.floor(newT % 6) / 6) * TWO_PI
            // const angleMultiplier = ((newT % 6) / 6) * TWO_PI
            const angle = TWO_PI * (i / this.data.numStations) + angleMultiplier
            x = Math.sin(angle) * this.data.positionMultiplier
            y = Math.cos(angle) * this.data.positionMultiplier
            // console.log(`${i}: ${x}, ${y}`)
            station.setAttribute('position', `${x} ${y} ${z}`)
        }
        // this.data.stationHolder.setAttribute('rotation', `0 0 ${performance.now() * 0.1}`)
    }
})
//color randomizer
AFRAME.registerComponent('color-randomizer', {
    play: function () {
        this.el.addEventListener('drag-drop', function (evt) {
            evt.detail.dropped.setAttribute('material', 'color',
                '#'+(Math.random()*0xFFFFFF<<0).toString(16));
            // color randomizer credit: http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript#comment6801353_5365036
        });
    }
});

// turn controller's physics presence on only while button held down
AFRAME.registerComponent('phase-shift', {
    init: function () {
        var el = this.el;
        el.addEventListener('gripdown', function () {
            el.setAttribute('collision-filter', {collisionForces: true});
        });
        el.addEventListener('gripup', function () {
            el.setAttribute('collision-filter', {collisionForces: false});
        });
    }
});

AFRAME.registerComponent('head-path', {
    schema : {
        path : { value : '-2 1 0, 0 2 0, 2 1 0' },
        linewidth: { value : 15 }
    },
    init: function() {
        let newEntity = document.createElement('a-entity')
        newEntity.id = "beep"
        newEntity.setAttribute('meshline', `lineWidth: ${this.data.linewidth}; path: ${this.data.path}; color: #E20049`)
        console.log("ADDED ----")
        this.el.appendChild(newEntity)
        this.throttledFunction = AFRAME.utils.throttle(this.addPoints, 50, this);
    },
    zVector: {
        beep: new THREE.Vector3( 0, 1, 0 )
    },
    addPoints: function() {
        // console.log("beep")
        let pos = document.querySelector('a-camera').getAttribute('position')
        pos = new THREE.Vector3( pos.x, pos.y, pos.z )

        let quat = document.querySelector('[camera]').object3D.children[0].getWorldQuaternion()
        var direction = new THREE.Vector3( 0, 0, -10 ).applyQuaternion(quat); // this works, but why the Y-component???
        direction = pos.add(direction)
        this.data.path += ', ' + direction.toArray().join(" ")
        document.querySelector('#beep').setAttribute('meshline', `lineWidth: ${this.data.linewidth}; path: ${this.data.path}; color: #E20049`)

        // let pathArray = this.data.path.split(',')
        // let newString = ''
        // for (let i in pathArray) {
        //     // Change z value of pathArray????
        //     let {x,y,z} = AFRAME.utils.coordinates.parse(pathArray[i])
        //     if (!Number.isNaN(x)) {
        //         newString += `${x} ${y} ${z + 0.1},`
        //         // newString += `${x} ${y} ${z},`
        //     }
        // }
        // this.data.path = newString
        // pathArray = this.data.path.split(',')
        // let lineWidth = `1 - Math.abs(${performance.now() * 2 % 5} * p - 1)`
        // let lineWidth = 10
        // document.querySelector('#beep').setAttribute('meshline', `lineWidth: 10; path: ${newString}; color: #E20049`)
        document.querySelector('#beep').setAttribute('meshline', `lineWidth: 10; path: ${this.data.path}; color: #E20049`)
    },
    tick: function (t, dt) {
        this.throttledFunction();
    }
});

// AFRAME.registerComponent('head-path', {
//     schema : {
//         curve: { default: '#headCurve', type: 'selector' },
//         camera: { default: '[camera]', type: 'selector' },
//         sample_inc: { default : 0.01 },
//         scale: { default : 1 }
//     },
//     init: function() {
//         // every second to every half second
//         this.throttledFunction = AFRAME.utils.throttle(this.everySecond, 1000, this);
//         // this.throttledFunction = AFRAME.utils.throttle(this.everySecond, 5, this);
//     },
//     everySecond: function (t) {
//         let point = document.createElement('a-curve-point')
//         let pos = document.querySelector('a-camera').getAttribute('position')
//         point.setAttribute('position', pos)
//
//         // point.setAttribute('geometry', 'primitive:box; height:0.06; width:0.06; depth:0.06')
//         // point.setAttribute('material', 'shader: displacement-offset;')
//         // for (let v in document.querySelector('a-draw-curve').object3DMap.mesh.geometry.vertices) {
//         //     // console.log(v)
//         // }
//
//         // point.setAttribute('bioluminescence', `initialTime: ${t}`)
//         this.data.curve.appendChild(point)
//         this.data.beta += this.data.sample_inc
//     },
//     tick: function (t, dt) {
//         this.throttledFunction(t);
//     }
// });

AFRAME.registerComponent('bioluminescence', {
    schema: {
        initialTime: { default : 0 }
    },
    init: function () {
        // this.data.initialTime = performance.now()
        // console.log('started at: ', this.data.initialTime)
        // this.el.setAttribute('geometry', "primitive:box; height:0.06; width:0.06; depth:0.06")
        // this.el.setAttribute('material', 'color: #2EAFAC;')
    },
    tick: function () {
        // console.log('tick => started at: ', this.data.initialTime)
        // let s = (this.data.initialTime + performance.now() % 1) + 0.1
        // this.el.setAttribute('scale', `${s} ${s} ${s}`)
    }
});

// From: https://gist.github.com/Strae/8b62ee637699b4218b53b3f158351864
AFRAME.registerComponent('model-opacity', {
  schema: {default: 1.0},
  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this));
  },
  update: function () {
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;
    if (!mesh) { return; }
    mesh.traverse(function (node) {
      if (node.isMesh) {
        node.material.opacity = data;
        node.material.transparent = data < 1.0;
        node.material.needsUpdate = true;
      }
    });
  }
});

AFRAME.registerComponent('fade-out', {
    schema: {
        totalDelay: { default : 180 },
        numberFadeSeconds: { default : 20 },
        isModel: { default : false },
        isSky: { default : false }
    },
    init: function () {
        // console.log('FADDDDingggg', this.el)
        // this.el.setAttribute('model-opacity', 0)
    },
    easeInOutQuad: function (t) {
        return t<.5 ? 2*t*t : -1+(4-2*t)*t;
    },
    tick: function (t) {
        t /= 1000
        if (t > this.data.totalDelay && t < (this.data.totalDelay + this.data.numberFadeSeconds)) {
            // console.log(`t: ${t}`)

            let animValue = this.easeInOutQuad(t / this.data.numberFadeSeconds)
            if (this.data.isModel) {
                this.el.setAttribute('model-opacity', animValue)
            } else if (this.data.isSky) {
                this.el.object3D.children[0].material.color = {r:  animValue, g:  animValue, b:  animValue}
            } else {
                this.el.setAttribute('material', 'opacity', animValue)
            }
        }
    }
})
