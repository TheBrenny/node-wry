const {EventType} = require("./events")

function isEvent(obj) {
    if(!(obj instanceof Object)) return false;
    
    let keys = Object.keys(obj);
    let validKeys = ["event", "data"];
    if(keys.length !== 2) return false;
    for(const k of keys) if(!validKeys.includes(k)) return false;
    
    if(!(obj.data instanceof Object)) return false;
    if(!Object.values(EventType).includes(obj.event)) return false;

    return true;
}

module.exports = {
    isEvent
}