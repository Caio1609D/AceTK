import { AceClass } from "./src/ace.cjs";
import { mech } from "./src/mech.cjs";
const AceTK = new AceClass()

if(typeof exports != "undefined"){    
    exports.AceTK = AceTK;
    exports.mechanism = mechanis
} else {    
    const mechanism = mech;
}