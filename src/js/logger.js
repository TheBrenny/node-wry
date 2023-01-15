module.exports = (name, message, type) => {
    type = type ?? logTypes.LOG;
    let msg = (`[${name} / ${process.pid} / ${Date.now()} / ${type}]: ${message}`);
    getLogMethod(type)(msg);
}

// TODO: Actually find out what the severity/verbosity is per log type.
function getLogMethod(type) {
    switch(type) {
        case logTypes.ERROR:
            return console.error;
        case logTypes.WARN:
            return console.warn;
        case logTypes.DEBUG:
            return console.debug;
        case logTypes.INFO:
            return console.info;
        default:
        case logTypes.LOG:
            return console.log;
    }
}

const logTypes = {
    INFO: "info",
    DEBUG: "debug",
    LOG: "log",
    WARN: "warn",
    ERROR: "error",
};
module.exports.types = logTypes;