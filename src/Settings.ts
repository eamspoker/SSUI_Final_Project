
import { Root } from "./Root.js";
import { FSMInteractor } from "./FSMInteractor.js";
import { Region,Region_json } from "./Region.js";
import { State } from "./State.js";
import { EventType, EventSpec_json, EventSpec } from "./EventSpec.js";
import { Action_json, Action } from "./Action.js";
import { FSM } from "./FSM.js";
import { Err } from "./Err.js";
import { Transition } from "./Transition.js";


//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

// The root object which will be linked to our canvas (which must have 
// an ID of "FSM-main-canvae"), and which we will build our test objects under.
let root : Root;

//-------------------------------------------------------------------
// Main testing routine -- invoked from index.html 
//-------------------------------------------------------------------
export function ShowSettings() {
	console.log("Running...");
	
	root = new Root("FSM-main-canvas");
	root.doDebugOutput = true;

	submenu();

	console.log("Settings are set up...");
}

//-------------------------------------------------------------------



// my custom interactor: a tip-maximizer fsm
function submenu() {

	// render it under the
	let fsmInt = new FSMInteractor(undefined, 0,0);
	root.addChild(fsmInt);

	// load from custom.json
	fsmInt.startLoadFromJson("./fsm_json/custom.json");
}

//-------------------------------------------------------------------
