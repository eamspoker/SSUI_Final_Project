import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();

const nullError = (id : string) => {
	throw "HTML element with ID: " + id + " returned null."
}

const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(2.5, 7.5, 15);
scene.add(light);


const building_canvas = document.getElementById("building-canvas") ?? nullError("building-canvas");


const camera = new THREE.PerspectiveCamera( 75, building_canvas.clientWidth/ building_canvas.clientHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer( {antialias: true} );

renderer.setSize(building_canvas.clientWidth, building_canvas.clientHeight);
renderer.setAnimationLoop( animate );
building_canvas.appendChild( renderer.domElement );

let building : any = null;

camera.position.z = 5;


loader.load( 'models/large_buildingA.glb', function ( gltf ) {
	building = gltf.scene;

	scene.add( gltf.scene );
	building = gltf.scene;

}, undefined, function ( error ) {

	console.error( error );

} );

function setColor (object : any, color : string)
{
	if (object.material)
	{
		object.material.color.setHex(color);
	} else {
		object.children.forEach((child: any) => {
			setColor(child, color);
		});
	}
	
}

function animate() {
	// console.log(document.getElementById("output").value);
	// cube.material.color.setHex(document.getElementById("output").value);


	if (building)
	{
		building.rotation.y += 0.003;
		let color : string = 
			(document.getElementById("output") as HTMLInputElement).value ?? nullError("output");
		setColor(building, color);
		// building.material.color.setHex(document.getElementById("output").value)

	}

	
	renderer.render( scene, camera );

}