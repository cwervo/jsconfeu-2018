// Note: this is a custom version of the
// clone-along-curve component provided by: https://github.com/protyze/aframe-curve-component/blob/master/index.js

let zAxis = new THREE.Vector3(0, 0, 1);
let {degToRad} = THREE.Math
AFRAME.registerComponent('clone-along-curve-custom', {

    //dependencies: ['curve'],

    schema: {
        curve: {type: 'selector'},
        spacing: {default: 1},
        rotation: {
            type: 'vec3',
            default: '0 0 0'
        },
        scale: {
            type: 'vec3',
            default: '1 1 1'
        }
    },

    init: function () {
        this.el.addEventListener('model-loaded', this.update.bind(this));
        this.data.curve.addEventListener('curve-updated', this.update.bind(this));
    },

    update: function () {
        this.remove();

        if (this.data.curve) {
            this.curve = this.data.curve.components.curve;
        }

        if (!this.el.getObject3D('clones') && this.curve && this.curve.curve) {
            var mesh = this.el.getObject3D('mesh');

            var length = this.curve.curve.getLength();
            var start = 0;
            var counter = start;

            var cloneMesh = this.el.getOrCreateObject3D('clones', THREE.Group);

            var parent = new THREE.Object3D();
            mesh.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z);
            mesh.rotation.set(degToRad(this.data.rotation.x), degToRad(this.data.rotation.y), degToRad(this.data.rotation.z));
            mesh.rotation.order = 'YXZ';

            parent.add(mesh);

            while (counter <= length) {
                var child = parent.clone(true);

                child.position.copy(this.curve.curve.getPointAt(counter / length));
                // console.log("new position: ", child.position)

                tangent = this.curve.curve.getTangentAt(counter / length).normalize();

                child.quaternion.setFromUnitVectors(zAxis, tangent);

                cloneMesh.add(child);

                counter += this.data.spacing;
            }
        }
    },

    remove: function () {
        this.curve = null;
        if (this.el.getObject3D('clones')) {
            this.el.removeObject3D('clones');
        }
    }

});

