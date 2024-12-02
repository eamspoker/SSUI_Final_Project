
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

// number of total submenus
let numMenus : number = 3;

// index of the current submenu
let currMenu : number = 0;

//-------------------------------------------------------------------
// Show settings menu-- invoked from index.html 
//-------------------------------------------------------------------
export function ShowSettings() {
	console.log("Running...");
	
	root = new Root("FSM-main-canvas");
	root.doDebugOutput = false;

	submenu(0);

	// get the previous and next menu buttons from the HTML
	let prev_button = document.getElementById("prev_menu") as HTMLButtonElement;
	let next_button = document.getElementById("next_menu") as HTMLButtonElement;
	if (prev_button && next_button)
	{
		// assign the callback functions
		// so that the menu advances by one index for the next button
		// and goes back by one index for the previous button
		prev_button.onclick = () => {UpdateSettings(-1)};
		next_button.onclick = () => {UpdateSettings(1)};
	} else {
		throw "Error: next or previous button not found.";
	}

	console.log("Settings are set up...");
}

function UpdateSettings(add : number)
{
	// updated based on button pres
	let newMenu = add + currMenu;

	// calculate new index so it wraps
	currMenu = newMenu >= 0 ? 
		(newMenu < numMenus ? newMenu : 0) : numMenus - 1;


	// remove each of the root's old children (old menu)	
	root.children.forEach((child : FSMInteractor) =>
		{
			root.removeChild(child);
		}	
	);


	// add the new submenu
	submenu(currMenu);

	root.damage();
}

//-------------------------------------------------------------------



// my custom interactor: a tip-maximizer fsm
function submenu(index : number) {

	// render it under the root
	let fsmInt = new FSMInteractor(undefined, 0,0);
	root.addChild(fsmInt);

	// load the menu FSMInteractor according to the index
	fsmInt.startLoadFromJson("./fsm_json/setting_menu" + index + ".json");
}

//-------------------------------------------------------------------
