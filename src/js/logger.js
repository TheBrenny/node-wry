// const stdoutWrite = process.stdout.write;
// const stderrWrite = process.stderr.write;

// process.stdout.write = function (data) {
//     stdoutWrite.call(process.stdout, data);
// }

// process.stderr.write = function (data) {
//     stderrWrite.call(process.stderr, data);
// }

module.exports = (name, message, type) => {
    type = type ?? logTypes.LOG;
    let msg = (`[${name} / ${process.pid} / ${Date.now()} / ${type}]: ${message}`);
    getLogMethod(type)(msg);
}

function getLogMethod(type) {
    switch(type) {
        case logTypes.WARN:
            return console.warn;
        case logTypes.ERROR:
            return console.error;
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