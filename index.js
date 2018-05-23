require('aframe')
//
// require('aframe-animation-component')
// // require('aframe-extras.ocean')
// require('aframe-gradient-sky')
// require('aframe-particle-system-component')
//
// require('aframe-gradient-sky')
require('aframe-physics-system')
require('aframe-event-set-component')
require('aframe-physics-extras')
require('aframe-environment-component')
require('aframe-template-component')

// var THREE = require( 'three' );
MeshLine = require( 'three.meshline' );

require('aframe-meshline-component')
require('aframe-curve-component')

// TODO: When next version of super-hands gets published this can be updated
// (as of today, April 6, 2018, the npm version is 5 months out of date, so I'm using a script to the git version)
require('./super-hands-local/super-hands.min.js');

console.log("hello world");

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

// AFRAME.registerComponent('head-path', {
//     schema : {
//         path : { value : '-2 1 0, 0 2 0, 2 1 0' }
//     },
//     init: function() {
//         // let geometry = new THREE.Geometry();
//         // const mult = 100
//         // for( let j = 0; j < Math.PI; j += 2 * Math.PI / 100 ) {
//         //     let v = new THREE.Vector3( Math.cos( j ) * mult, Math.sin( j ) * mult, 0 )
//         //     console.log(v)
//         //     geometry.vertices.push( v );
//         // }
//         // let line = new MeshLine.MeshLine();
//         // line.setGeometry( geometry );
//         // line.setGeometry( geometry, function( p ) { return 2; } ); // makes width 2 * lineWidth
//         // line.setGeometry( geometry, function( p ) { return 1 - p; } ); // makes width taper
//         // line.setGeometry( geometry, function( p ) { return 2 + Math.sin( 50 * p ); } ); // makes width sinusoidal
//         //
//         // var mesh = new THREE.Mesh( line.geometry, new THREE.MeshNormalMaterial({})); // this syntax could definitely be improved!
//
//         let newEntity = document.createElement('a-entity')
//         newEntity.id = "beep"
//         newEntity.setAttribute('meshline', `lineWidth: 20; path: ${this.data.path}; color: #E20049`)
//         this.el.appendChild(newEntity)
//     },
//     tick: function () {
//         let pos = document.querySelector('a-camera').getAttribute('position')
//         // let s = document.createElement('a-sphere')
//         // s.setAttribute('color', 'red')
//         // s.setAttribute('radius', '0.05')
//         // // console.log(pos)
//         // s.setAttribute('position', pos)
//         // this.el.appendChild(s)
//
//         // Replace this with addative geometry/extending the bones on a skeleton???
//         // Also, use quaternion of camera to place tracing object behind your head at all times???
//         this.data.path += pos.toArray().join(" ") + ', '
//         document.querySelector('#beep').setAttribute('meshline', `lineWidth: 20; path: ${this.data.path}; color: #E20049`)
//     }
// });

AFRAME.registerComponent('head-path', {
    schema : {
        curve: { default: '#knot', type: 'selector' },
        camera: { default: '[camera]', type: 'selector' },
        sample_inc: { default : 0.01 },
        scale: { default : 1 }
    },
    init: function() {
        // every second to every half second
        this.throttledFunction = AFRAME.utils.throttle(this.everySecond, 500, this);
    },
    everySecond: function (t) {
        let point = document.createElement('a-curve-point')
        let pos = document.querySelector('a-camera').getAttribute('position')
        console.log(pos)
        point.setAttribute('position', pos)
        point.setAttribute('bioluminescence', `initialTime: ${t}`)
        this.data.curve.appendChild(point)
        this.data.beta += this.data.sample_inc
    },
    tick: function (t, dt) {
        this.throttledFunction(t);
    }
});

AFRAME.registerComponent('bioluminescence', {
    schema: {
        initialTime: { default : 0 }
    },
    init: function () {
        console.log('started at: ', this.data.initialTime)
        // this.el.setAttribute('geometry', "primitive:box; height:0.06; width:0.06; depth:0.06")
        // this.el.setAttribute('material', 'color: #2EAFAC;')
    }
});
