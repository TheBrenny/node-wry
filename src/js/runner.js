global.bindings = require("./bindings");
const logger = require("./logger");
const log = logger.bind(this, process.argv[2] ?? "nullname");
const {serialize, deserialize} = require("./serialisation");

process.on("message", (serialisedMessage) => {
    try {
        let {name, fn, args} = deserialize(serialisedMessage);
        fn = new Function(`return ${fn}`)();
        let retVal = fn.call(this, ...args);

        // Sending {retVal: any} means we can make sure we're actually sending the retVal
        process.send(serialize({retVal: retVal ?? null}))
    } catch(e) {
        log("Error", logger.types.ERROR);
        log(e, logger.types.ERROR);
    }
});

function sendMessageCallback(message) {
    try {
        process.send(message);
    } catch(e) {
        log("Error", logger.types.ERROR);
        log(e.stack, logger.types.ERROR);
    }
}
global.sendMessageCallback = sendMessageCallback;