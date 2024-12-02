import { Err } from "./Err.js";
import { Check } from "./Check.js";
const actionTypeStrings = ['set_image', 'clear_image', 'none', 'print', 'print_event', 'set_feature', 'set_color', 'set_slider'];
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
export class Action {
    constructor(actType, regionName, param) {
        this._actType = actType;
        this._onRegionName = regionName !== null && regionName !== void 0 ? regionName : "";
        this._param = param !== null && param !== void 0 ? param : "";
        this._onRegion = undefined; // will be established once we have the whole FSM
    }
    // Construct an Action from an Action_json object.  We type check all the parts here
    // since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we have declared it here.
    static fromJson(jsonVal) {
        var _a, _b;
        const actType = Check.limitedString(jsonVal.act, actionTypeStrings, "none", "Action.fromJson{act:}");
        const regionname = Check.stringVal((_a = jsonVal.region) !== null && _a !== void 0 ? _a : "", "Action.fromJsonl{region:}");
        const param = Check.stringVal((_b = jsonVal.param) !== null && _b !== void 0 ? _b : "", "Action.fromJson{param:}");
        return new Action(actType, regionname, param);
    }
    get actType() { return this._actType; }
    get onRegionName() { return this._onRegionName; }
    get onRegion() { return this._onRegion; }
    get param() { return this._param; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Carry out the action represented by this object.  evtType and evtReg describe
    // the event which is causing the action (for use by print_event actions).
    // Note for final project: I added mouseX and mouseY as parameters so that I could
    // have space-related interactions (sliders, color pickers) and the canvas so that
    // I could read the canvas color for the color picker
    execute(evtType, evtReg, mouseX, mouseY, ctx) {
        if (this._actType === 'none')
            return;
        // perform an action based on this objects' type
        switch (this._actType) {
            case 'set_image':
                // set the image if we have an assigned region 
                if (this.onRegion) {
                    this.onRegion.imageLoc = this.param;
                }
                break;
            case 'clear_image':
                // clear image if we have an assigned region
                if (this.onRegion) {
                    this.onRegion.imageLoc = "";
                }
                break;
            case 'print':
                // print only this action
                console.log(this.param);
                break;
            case 'print_event':
                // print a string representing the entire event
                console.log(this.param + " " + evtType + " " + (evtReg === null || evtReg === void 0 ? void 0 : evtReg.name));
                break;
            case 'set_feature':
                {
                    // set a (non-color) feature of the 3D model
                    // expected parameters are:
                    // setting number, 
                    // value to set
                    let params = this.param.split(",");
                    // look for output field
                    let output = document.getElementById("text_editing");
                    if (output) {
                        let features = output.value.split(";");
                        // look up index with first element, set to second element
                        features[parseInt(params[0])] = params[1];
                        // update the text editing box to reflect the new features
                        output.value = features.join(';');
                    }
                    else {
                        throw "HTML element with ID: text_editing returned null.";
                    }
                    break;
                }
            case 'set_color':
                {
                    // set a color feature of the 3D model based on the color
                    // underneath the mouse
                    // expected parameters are:
                    // setting number
                    let params = this.param.split(",");
                    // look for output field
                    let output = document.getElementById("text_editing");
                    if (output && mouseX != undefined && mouseY != undefined && ctx) {
                        let features = output.value.split(";");
                        // get the image data based on the mouseX and mouseY
                        let curr_imgData = ctx.getImageData(mouseX, mouseY, 1, 1).data;
                        // convert each image value data in the array to the 
                        // corresponding RGB hex value
                        let r = curr_imgData[0].toString(16);
                        r = r.length == 1 ? "0" + r : r;
                        let g = curr_imgData[1].toString(16);
                        g = g.length == 1 ? "0" + g : g;
                        let b = curr_imgData[2].toString(16);
                        b = b.length == 1 ? "0" + b : b;
                        // look up index with first element, set to RGB hex value
                        features[parseInt(params[0])] = "0x" + r + g + b;
                        // update the text editing box to reflect the new features
                        output.value = features.join(';');
                        // if we have a region, we need to declare damage
                        // to redraw color-specific components 
                        if (this.onRegion) {
                            this.onRegion.damage();
                        }
                    }
                    else {
                        throw "HTML element with ID: text_editing returned null.";
                    }
                    break;
                }
            case 'set_slider':
                {
                    let params = this.param.split(",");
                    // look for output field
                    let output = document.getElementById("text_editing");
                    if (output) {
                        let features = output.value.split(";");
                        // calculate the value of the slider by linear interpolation
                        // note that this only supports horizontal sliders
                        if (mouseX != undefined && this.onRegion) {
                            let newValue = ((mouseX - this.onRegion.x) / this.onRegion.w);
                            newValue = newValue < 0 ? 0 : (newValue > 1 ? 1 : newValue);
                            // look up index with param, set to slider value
                            features[parseInt(params[0])] = "" + newValue;
                            // update the text editing box to reflect the new features
                            output.value = features.join(';');
                            // we need to declare damage to redraw the sliders
                            this.onRegion.damage();
                        }
                    }
                    else {
                        throw "HTML element with ID: text_editing returned null.";
                    }
                }
            default:
                break;
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Attempt to find the name listed for this region in the given list of regions
    // (from the whole FSM), assiging the Region object to this._onRegion if found.
    bindRegion(regionList) {
        // since we can't return from the outer function within
        // the lambda passed to the forEach loop, we keep track of whether
        // or not the region was found
        let found = false;
        // iterate through the region lists, set found to true if we find
        // the region
        regionList.forEach(region => {
            if (region.name === this.onRegionName) {
                this._onRegion = region;
                found = true;
            }
        });
        // don't want to move on to the next block of code if found region
        if (found) {
            return;
        }
        // handling if we didn't find the region
        // ok to have no matching region for some actions
        if (this.actType === 'none' || this.actType === 'print' ||
            this.actType === 'print_event') {
            this._onRegion = undefined;
            return;
        }
        Err.emit(`Region '${this._onRegionName}' in action does not match any region.`);
    }
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------
    // Create a short human readable string representing this object for debugging
    debugTag() {
        return `Action(${this.actType} ${this.onRegionName} "${this.param}")`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a human readable string displaying this object for debugging purposes
    debugString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaces per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        // main display
        result += `${this.actType} ${this.onRegionName} "${this.param}"`;
        // possible warning about an unbound region
        if (!this.onRegion && this.actType !== 'none' &&
            this.actType !== 'print' && this.actType !== 'print_event') {
            result += " unbound";
        }
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Log a human readable string for this object to the console
    dump() {
        console.log(this.debugString());
    }
} // end class Action
//===================================================================
//# sourceMappingURL=Action.js.map