require('aframe')
require('./aframe-meshline-component-local/aframe-meshline-component.min.js')
require('aframe-curve-component')
// TODO: When next version of super-hands gets published this can be updated
// (as of today, April 6, 2018, the npm version is 5 months out of date, so I'm using a script to the git version)
require('./super-hands-local/super-hands.min.js');
Tone = require('tone');

const TWO_PI = Math.PI * 2

let params = new URLSearchParams(document.location.search.substring(1));
let isInstallationComputer = params.get("installation-computer") != null; // is the string "Jonathan"
console.log("isInstallationComputer?", isInstallationComputer)

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

            plane.setAttribute('position', `${x} ${y} -0.5`)
            plane.setAttribute('width', this.data.stationSize)
            plane.setAttribute('height', this.data.stationSize)
            plane.setAttribute('class', 'station')
            plane.setAttribute('fade-out', '')

            plane.setAttribute('rotation', `0 0 ${i * (360 - 360 / 6)}`)
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
        // for (let i = 0; i < this.data.numStations; ++i) {
        //     let station = this.data.stations[i]
        //     let {x,y,z} = AFRAME.utils.coordinates.parse(station.getAttribute('position'))
        //     // let angle = TWO_PI * (i / this.data.numStations) + (performance.now() * -0.0001)
        //     // let angle = TWO_PI * (i / this.data.numStations) + (performance.now() * -0.0001)
        //     // const angleMultiplier = (t/1000 * -0.1)
        //     let newT = t/1000;
        //
        //     // Write actual easing function, sketch out the whole thing
        //     if (newT < 30) {
        //         newT = 1
        //     } else if (newT < 35) {
        //     } else if (newT > 40 && newT < 70) {
        //         newT = 2
        //     }
        //
        //     // easeInOutQuad = function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }
        //
        //     // const angleMultiplier = (Math.floor(newT % 6) / 6) * TWO_PI
        //     const angleMultiplier = (Math.floor(t * 0.00001 % 6) / 6) * TWO_PI
        //     // const angleMultiplier = ((newT % 6) / 6) * TWO_PI
        //     const angle = TWO_PI * (i / this.data.numStations) + angleMultiplier
        //     x = Math.sin(angle) * this.data.positionMultiplier
        //     y = Math.cos(angle) * this.data.positionMultiplier
        //     // console.log(`${i}: ${x}, ${y}`)
        //     station.setAttribute('position', `${x} ${y} ${z}`)
        // }
        this.data.stationHolder.setAttribute('rotation', `0 0 ${performance.now() * 0.005}`)
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

function makeNewMeshline(i, linewidth, path) {
    let newEntity = document.createElement('a-entity')
    // newEntity.id = "beep"
    newEntity.id = `beep${i}`
    newEntity.setAttribute('meshline', `lineWidth: ${linewidth}; path: ${path}; color: #E20049`)
    return newEntity
}

AFRAME.registerComponent('head-path', {
    schema : {
        path : { default : '' },
        linewidth: { default : 15 },
        maxPoints: { default : 300 }
    },
    meshlines: [],
    meshlineIndex: 0,
    totalPoints: 0,
    init: function() {
        let newEntity = makeNewMeshline(0, this.data.linewidth, this.data.path)
        console.log("ADDED ----")
        this.meshlines.push({
            element: newEntity,
            path: ''
        })
        this.el.appendChild(newEntity)
        this.throttledFunction = AFRAME.utils.throttle(this.addPoints, 100, this);
    },
    zVector: {
        beep: new THREE.Vector3( 0, 1, 0 )
    },
    addPoints: function() {
        // TODO: To solve the n^2 points problem, if we're above X number of points, make a new object, put it in a list, and update that object
        let pos = document.querySelector('a-camera').getAttribute('position')
        pos = new THREE.Vector3( pos.x, pos.y, pos.z )

        const currentMeshline = this.meshlines[this.meshlineIndex]

        let quat = document.querySelector('[camera]').object3D.children[0].getWorldQuaternion()
        var direction = new THREE.Vector3( 0, 0, -10 ).applyQuaternion(quat); // this works, but why the Y-component???
        direction = pos.add(direction)
        if (currentMeshline.path !== '') {
            currentMeshline.path += ', '
        }
        currentMeshline.path += direction.toArray().join(" ")


        // console.log("inited?", window.user, " | ", performance.now() / 1000, Math.floor(performance.now() / 1000) % 1 === 0)
        // Throttle to every 10 times, just keep a this.addTo variable or work off of this.totalPoints % this.data.maxPoints???

        // Hmmmm,
        //
        //URLSearchParams.get(name)

        // if (window.db) {
        //     console.log("uhhhh points?", window.db.ref("points").val)
        //     window.db.ref("points").once('value').then(function(snapshot) {
        //         console.log("boop")
        //         window.db.ref("points").set(snapshot.val() + currentMeshline.path);
        //     });
        // }

        currentMeshline.element.setAttribute('meshline', `lineWidth: ${this.data.linewidth}; path: ${currentMeshline.path}; color: #E20049`)

        // console.log('t', this.totalPoints)
        if (this.totalPoints > this.data.maxPoints) {
            let lastMeshline = this.meshlines[this.meshlineIndex - 1]
            if (!lastMeshline) {
                lastMeshline = {element: '', path: ''}
            }

            let lastElement = lastMeshline.path.split(',')[lastMeshline.path.split(',').length - 1]
            if (!lastElement && this.meshlineIndex === 0) {
                lastElement = ''
            }

            let newEntity = makeNewMeshline(this.meshlineIndex + 1, this.data.linewidth, lastElement)
            console.log("ADDED ---- lastElement:", lastElement)
            this.meshlines.push({
                element: newEntity,
                path: lastElement
            })
            this.el.appendChild(newEntity)
            this.totalPoints = 0
            this.meshlineIndex++
        }
        this.totalPoints++
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
        isSky: { default : false },
        timeEl: { type:  'selector', default: '#time-marker'}
    },
    init: function () {
        console.log("tim", this.data.timeEl)
    },
    tick: function (t) {
        // let t = performance.now()
        t /= 1000
        this.data.timeEl.innerHTML = Math.floor(t)
        if (t > this.data.totalDelay && t < (this.data.totalDelay + this.data.numberFadeSeconds)) {
            let animValue = 1 - ( t / this.data.numberFadeSeconds )
            if (this.data.isModel) {
                this.el.setAttribute('model-opacity', animValue)
            } else if (this.data.isSky) {
                this.el.object3D.children[0].material.color = {r:  animValue, g:  animValue, b:  animValue}
            } else {
                this.el.setAttribute('material', 'opacity', animValue)
            }
        } else if (t > (this.data.totalDelay + this.data.numberFadeSeconds)) {
            if (this.data.isModel) {
                this.el.setAttribute('model-opacity', 0)
            } else if (this.data.isSky) {
                this.el.object3D.children[0].material.color = {r: 0, g:0, b: 0}
            } else {
                this.el.setAttribute('material', 'opacity', 0)
            }
        }
    }
})

AFRAME.registerComponent('add-sound', {
    init: function() {
        let synth = new Tone.Synth().toMaster();
        //play a middle 'C' for the duration of an 8th note
        let player = new Tone.Player("./assets/sounds/raw.wav").toMaster();
        //play as soon as the buffer is loaded
        player.autostart = true;
        player.loop = true;
        this.player = player
        // Modulate playback rate with velocity??
        this.lastPos = new THREE.Vector3(0,0,0)
        this.currentPos = new THREE.Vector3(0,0,0)
    },
    tick: function(t) {
        // Same algorithm as calculating the point!
        let quat = document.querySelector('[camera]').object3D.children[0].getWorldQuaternion()
        var direction = new THREE.Vector3( 0, 0, -10 ).applyQuaternion(quat); // this works, but why the Y-component???
        direction = this.currentPos.clone().add(direction)

        // goes 100 - 99, so scale that down 0-1 :)
        //
        // Then, save points to a database & websocket themmmmm!
        //
        const newPlaybackRate = ( ((this.currentPos.distanceToSquared(this.lastPos)) / 100) * 10 ) % 1
        // console.log( newPlaybackRate)
        this.player.playbackRate = newPlaybackRate

        this.lastPos = this.currentPos.clone()
        this.currentPos = direction
    }
})

var inited = false;
var user;

function firebaseStuff() {
    var db = app.database();
    window.db = db
    console.log("DB:", db)
    // db.ref("testing").set("Andres Cuervo");
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyARkBLd2J9e-yiTEvC55i1Y89M_rneRnCg",
    authDomain: "jsconf-eu-2018.firebaseapp.com",
    databaseURL: "https://jsconf-eu-2018.firebaseio.com",
    projectId: "jsconf-eu-2018",
    storageBucket: "jsconf-eu-2018.appspot.com",
    messagingSenderId: "471578209249"
};
app = firebase.initializeApp(config);

app.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        window.user = user;
        console.log("User:", user.uid);
        if (!inited) {
            inited = true;
            firebaseStuff();
        }
    } else {
        app.auth().signInAnonymously().catch(function(error) {
            console.log(error);
        });
    }
});
