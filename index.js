let AceClass = require("./src/ace.cjs");
let mech = require("./src/mech.cjs");
const AceTK = new AceClass()

if(typeof exports != "undefined"){    
    exports.AceTK = AceTK;
    exports.mechanism = mechanis
} else {    
    const mechanism = mech;
}