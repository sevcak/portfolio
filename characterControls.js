import * as THREE from 'three';
import { A, D, DIRECTIONS, S, W } from './input';

export class CharacterControls {
    // Character references
    model;
    mixer;
    animationMap;
    orbitControls;
    camera;
    
    // State
    toggleRun = true;
    currentAction;

    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    // Constants
    fadeDuration = 0.2;
    runVelocity = 4;


    constructor(model, mixer, animationMap, orbitControls, camera, currentAction) {
        this.model = model;
        this.mixer = mixer;
        this.animationMap = animationMap;
        this.orbitControls = orbitControls;
        this.camera = camera;
        this.currentAction = currentAction;

        this.animationMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play();
            }
        });
    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun;
    }

    update(delta, keysPressed) {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true);

        let play = '';
        if (directionPressed) {
            play = 'run';
        } else {
            play = 'idle';
        }

        if (this.currentAction != play) {
            const toPlay = this.animationMap.get(play);
            const current = this.animationMap.get(this.currentAction);

            current.fadeOut(this.fadeDuration);
            toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play;
        }

        this.mixer.update(delta);

        if (this.currentAction == 'run') {
            let angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            );

            let directionOffset = this.directionOffset(keysPressed);

            this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);

            // Get direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);


            // Move model and camera
            const moveX = this.walkDirection.x * this.runVelocity * delta;
            const moveZ = this.walkDirection.z * this.runVelocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
        }
    }

    directionOffset(keysPressed) {
        var directionOffset = 0 // W

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 // W + A
            } else if (keysPressed[D]) {
                directionOffset = - Math.PI / 4 // W + D
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // S + A
            } else if (keysPressed[D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // S + D
            } else {
                directionOffset = Math.PI // S
            }
        } else if (keysPressed[A]) {
            directionOffset = Math.PI / 2 // A
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // D
        }

        return directionOffset
    }
}