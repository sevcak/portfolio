import './style.css'
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { CharacterControls } from './characterControls';

const renderer = new THREE.WebGLRenderer({ antialias: true });

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const scene = new THREE.Scene();
scene.backgroundBlurriness = .4
scene.backgroundIntensity = 1.6

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 6, 3);

// Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();
const keysPressed = { }
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true
}, false);
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false
}, false);


const clock = new THREE.Clock();
function animate(time) {
    let delta = clock.getDelta(time);

    if (animationMixer) {
        animationMixer.update(delta);
    }
    if (characterControls) {
        characterControls.update(delta, keysPressed);
    }

    orbitControls.update();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

let animationMixer;

let characterControls;

rgbeLoader.load(
    './assets/hdr/graveyard_pathways_1k.hdr',
    (hdr) => {
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdr
        scene.background = hdr

        gltfLoader.load(
            './assets/character/character.glb',
            (glb) => {
                console.log(glb);
                const model = glb.scene;
                scene.add(model);

                animationMixer = new THREE.AnimationMixer(model);
                const clips = glb.animations;
                // const idleClip = THREE.AnimationClip.findByName(clips, 'idle');
                // idleAction.timeScale = .4;
                // const idleAction = animationMixer.clipAction(idleClip);
                // idleAction.play();
                
                const animationMap = new Map();
                clips.forEach((a) => {
                    animationMap.set(a.name, animationMixer.clipAction(a));
                });

                characterControls = new CharacterControls(model, animationMixer, animationMap, orbitControls, camera, 'idle');
            },
            // Called while loading is progressing
            (xhr) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // Called when loading has errors
            (error) => {
                console.log( 'An error happened:' + error);
            }
        );
    }
);

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
