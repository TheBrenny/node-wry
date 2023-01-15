require("get-promise-state"); // I'm not sure if this plays nicely with everything else...

const {fork, ChildProcess} = require("child_process");
const {serialize, deserialize} = require("./serialisation");
const {resolve} = require("path");
const logger = require("./logger");
const log = logger.bind(this, "fork");


/**
 * @type {{fork: {name: string, fn: string, args: ...any, handle: ChildProcess, retVal: any, retValCache: any[], promise: Promise}}}
 */
const forks = {}

// I want to rewrite this because I hate how it jumps around so fucking much.
const runFork = ({handle = null, name = "nullname", fn, args = [], messageHandler = null}) => {
    log(`${!!forks[name] ? "Reusing" : "Creating"} fork: "${name}"`);

    // Create or reuse a (new) fork
    let f = forks[name] ?? { // I'm being verbose for consistency in this obj
        name: name,
        fn: fn,
        args: args,
        promise: null,
        promiseTriggers: [],
        handle: handle,
        retVal: undefined,
        retValCache: [],
        messageHandlers: !!messageHandler ? [messageHandler] : [],
    };
    if(!!forks[name]) { // Reusing, so fix the old vals
        f.fn = fn;
        f.args = args;
        f.retValCache.push(f.retVal);
        f.retVal = undefined;
        if(!!messageHandler) f.messageHandlers.push(messageHandler);
    }

    // Ensure that we should even run
    if(!f.fn) throw new Error("No function provided to runFork");
    f.fn = f.fn.toString();

    // Create the promise
    const prom = new Promise((res, rej) => {f.promiseTriggers.push({res, rej});})
    f.promise = !f.promise ? prom : f.promise.then(() => prom);

    // Create the fork handle and prepare the receiver
    if(f.handle === null) {
        f.handle = fork(resolve(__dirname, "runner.js"), [name], {stdio: "inherit"});
        f.handle.on("message", (data) => {
            try {
                data = deserialize(data);
                // Checking if {retVal: any} exists means we can make sure that we're actually receiving the retVal
                if(f.promise.isPending && data.retVal !== undefined) {
                    f.retVal = data.retVal;
                    f.promiseTriggers.shift().res(data.retVal);
                } else if(f.messageHandlers.length > 0) f.messageHandlers.forEach((mh) => mh(null, data));
                // log(`Message received from fork "${name}"`);
            } catch(e) {
                log(`Error occured from fork "${name}"`, logger.types.ERROR);
                log(e, logger.types.ERROR);
                if(f.promise.isPending) f.promiseTriggers.shift().rej(e);
                if(f.messageHandlers.length > 0) f.messageHandlers.forEach((mh) => mh(e, null));
            }
        });
    }
    log(`Sending message to fork "${name}"`);
    f.handle.send(serialize({
        name: f.name,
        fn: f.fn,
        args: f.args
    }));

    // Save and return the fork
    return (forks[name] = f);
};
// I want to get rid of these and just pass around fork objects
const getFork = (name) => forks[name];
const deleteFork = (name) => delete forks[name];

module.exports = {
    runFork,
    getFork,
    deleteFork,
}