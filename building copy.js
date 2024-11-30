import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();



const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(2.5, 7.5, 15);
scene.add(light);


const building_canvas = document.getElementById("building-canvas");

const camera = new THREE.PerspectiveCamera( 75, building_canvas.clientWidth/ building_canvas.clientHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer( {antialias: true} );

renderer.setSize(building_canvas.clientWidth, building_canvas.clientHeight);
renderer.setAnimationLoop( animate );
building_canvas.appendChild( renderer.domElement );

let building = null;

camera.position.z = 5;


loader.load( 'models/large_buildingA.glb', function ( gltf ) {
	building = gltf.scene;

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );


function animate() {
	// console.log(document.getElementById("output").value);
	// cube.material.color.setHex(document.getElementById("output").value);

	gltf.scene.rotation.x += 0.01;
	gltf.scene.rotation.y += 0.01;
	renderer.render( scene, camera );

}