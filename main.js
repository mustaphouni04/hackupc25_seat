import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Camera + renderer
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('c') });
renderer.setSize(innerWidth, innerHeight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Load model
const loader = new GLTFLoader();
loader.load(
  'Tavascan.glb',
  gltf => {
    console.log('✔️ Loaded glTF', gltf);
    // Center model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    scene.add(gltf.scene);
    animate();
  },
  xhr => console.log(`Loading: ${(xhr.loaded/xhr.total*100).toFixed(1)}%`),
  err => console.error('❌ Error loading glTF', err)
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
