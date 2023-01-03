global.bindings = require("./bindings");
const logger = require("./logger");
const log = logger.bind(this, process.argv[2] ?? "nullname");
const {serialize, deserialize} = require("./serialisation");

process.on("message", (serialisedMessage) => {
    try {
        let {name, fn, args} = deserialize(serialisedMessage);
        fn = new Function(`return ${fn}`)();
        let retVal = fn.call(this, ...args);

        process.send(serialize(retVal ?? null))
    } catch(e) {
        log("Error", logger.types.ERROR);
        log(e, logger.types.ERROR);
    }
});