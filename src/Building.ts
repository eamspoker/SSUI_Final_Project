import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const cubemap_loader = new THREE.CubeTextureLoader();


let textureCubes : THREE.CubeTexture[] = [];
let names : string[] = ["sunrise", "day", "sunset", "night"];
let texture_index = 1;

names.forEach((name : string) =>
	{
		cubemap_loader.setPath( 'images/' + name + '/' );
		const textureCube = cubemap_loader.load( [
			'px.png', 'nx.png',
			'py.png', 'ny.png',
			'pz.png', 'nz.png'
		] );

		textureCube.name = name;
		textureCubes.push(textureCube);
	}
);

// set the background scene to index 1 (daytime)
scene.background = textureCubes.length > 1 ? textureCubes[1] : null;


// load the first building 
const loader = new GLTFLoader();
loader.load( 'models/large_buildingA.glb', function ( gltf ) {
	gltf.scene.name = "building1";
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// load the second building 
loader.load( 'models/large_buildingC.glb', function ( gltf ) {
	gltf.scene.name = "building2";
	gltf.scene.visible = false;
	scene.add( gltf.scene );
}, undefined, function ( error ) {

	console.error( error );

} );

// load the third building 
loader.load( 'models/large_buildingG.glb', function ( gltf ) {
	gltf.scene.name = "building3";
	gltf.scene.visible = false;
	scene.add( gltf.scene );
}, undefined, function ( error ) {

	console.error( error );

} );

// for throwing errors when HTML elements return null
const nullError = (id : string) => {
	throw "HTML element with ID: " + id + " returned null."
}

// create first point light (white)
const light1 = new THREE.PointLight(0xffffff, 1000);
light1.position.set(2.5, 7.5, 15);

// create second point light to illuminate other side (softer yellow)
const light2 = new THREE.PointLight(0xfcf1d9,500);
light2.position.set(-2.5, -7.5, -15);
scene.add(light1);
scene.add(light2);


// get the canvas element to render the scene to
const building_canvas = document.getElementById("building-canvas") ?? nullError("building-canvas");

// create camera with aspect ratio based on canvas element
const camera = new THREE.PerspectiveCamera( 75, building_canvas.clientWidth/ building_canvas.clientHeight, 0.1, 1000 );

// initialize renderer based on canvas dimensions
var renderer = new THREE.WebGLRenderer();
renderer.setSize(building_canvas.clientWidth, building_canvas.clientHeight);

// use animation function (below) to loop
renderer.setAnimationLoop( animate );

// add the rendered scene to our canvas element
building_canvas.appendChild( renderer.domElement );

// the current building and the index of the current building
let building : string = "building1";
let building_index : number = 0;

// set camera position far away from building so we can see it
camera.position.z = 4;
camera.position.y = 1;




// sets the color of the maerial of an object
// recursively calls to children 
function setColor (object : any, color : string, index : number)
{
	if (object.material)
	{
		if (object.isMesh)
		{
			// find the index of the mesh based on
			// parsing its name
			let mesh_index : number = object.name.split("_").length > 3 ? 
									parseInt(object.name.split("_")[3]) : 0;

			if (mesh_index == index)
			{
				// set the corresponding color if the index is a match
				object.material.color.setHex(color);
			}
		}

		
	} else {

		// objects without materials have children that may,
		// so we recursively set the color down the 3D scene tree
		object.children.forEach((child: any) => {
			setColor(child, color, index);
		});
	}
	
}

// sets the building to be the new index
// Note: in order for this to work, the building has to be named "building" + number
function setBuildingType (building_model : THREE.Object3D<THREE.Object3DEventMap>,
						id : number)
{
	// check if ID is in the bounds
	if (0 < id && id <= 3)
	{
		// id is 1-indexed due to the UI
		building_index = id - 1;

		// find the requested object
		let new_model = scene.getObjectByName("building" + id);

		if (new_model)
		{
			// set the old building to invisible
			// the new one to visible
			building_model.visible = false;
			new_model.visible = true;

			// update our current building
			building = new_model.name;
		}
		
	}

}

function animate() {

	// find the current building model
	let building_model = scene.getObjectByName(building);
	if (building_model) {

		// find the features input box and parse it
		// expected format of the features:
		// idx 0-3: colors
		// idx 4: building type
		// idx 5: time of day
		// idx 6-8: scale
		// idx 9: rotation

		let features : string[] = 
			(document.getElementById("text_editing") as HTMLInputElement).value.split(";")
			?? nullError("text_editing");

		
		// set all of the colors for all the individual pieces of the mesh
		for (let index = 0; index < 4; index++) {
			setColor(building_model, features[index], index);
		}
		setColor(building_model, features[0], 4);

		// if the building index in features is not the current one...
		if (parseInt(features[4]) - 1 != building_index)
		{
			// ... update the building type to match
			setBuildingType(building_model, parseInt(features[4]));
		}

		// if the texture index in features is not the current one...
		if (parseInt(features[5]) - 1 != texture_index)
		{
			// ... update the texture to match
			texture_index = parseInt(features[5])-1;
			scene.background = textureCubes[texture_index];
		}

		// scale the model according to the features
		building_model.scale.x = parseFloat(features[6]) + 0.75;
		building_model.scale.y = parseFloat(features[7]) + 0.75;
		building_model.scale.z = parseFloat(features[8]) + 0.75;

		let spin_checkbox = document.getElementById("spin") as HTMLInputElement ?? nullError("spin");

		// we rotate at a slow but consistent rate if the spin checkbox is checked
		if (spin_checkbox.checked)
		{
			building_model.rotation.y += 0.003;
		} else {

			// otherwise, set the rotation based on the features
			building_model.rotation.y = parseFloat(features[9])*(2*Math.PI);
		}

		// the sliders next to and below the camera control the x and y rotation of the
		// viewport
		let rotation_slider_y = document.getElementById("camera_rot_y") as HTMLInputElement 
												?? nullError("camera_rot_y");
		let rotation_slider_x = document.getElementById("camera_rot_x") as HTMLInputElement
										?? nullError("camera_rot_x");


		// set the camera rotation based on the x and y sliders								
		camera.rotation.y = (parseFloat(rotation_slider_y.value) * (Math.PI/180));
		camera.rotation.x = (parseFloat(rotation_slider_x.value) * (Math.PI/180));

	}

	
	
	renderer.render( scene, camera );

}