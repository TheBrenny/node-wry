require("get-promise-state"); // I'm not sure if this plays nicely with everything else...

const {fork, ChildProcess} = require("child_process");
const {serialize, deserialize} = require("./serialisation");
const {resolve} = require("path");
const logger = require("./logger");
const log = () => {
    let args = Array.from(arguments);
    let fork = args.shift();
    if(fork instanceof Fork) fork = `fork_${fork.name}`;
    logger.apply(this, [fork, ...args])
}


/**
 * @type {{fork: {name: string, fn: string, args: ...any, handle: ChildProcess, retVal: any, retValCache: any[], promise: Promise}}}
 */
const forks = {}

class Fork {
    #name;
    #fn;
    #args;
    #promise;
    #promiseTriggers;
    #handle;
    #retVal;
    #retValCache;
    #messageHandlers;

    constructor({name = "nullname", fn, args = [], messageHandler = null}) {
        const self = this;

        this.#name = name;

        if(!fn) throw new Error("No function provided");
        if(!["function", "string"].includes(typeof fn)) throw new Error("Function provided doesn't match String or Function");
        this.#fn = fn.toString();
        this.#args = args;
        this.#retVal = undefined;
        this.#retValCache = [];
        this.#messageHandlers = !!messageHandler ? [messageHandler] : [];

        this.#promiseTriggers = [];
        this.#promise = new Promise((res, rej) => {self.#promiseTriggers.push({res, rej});});

        this.#handle = fork(resolve(__dirname, "runner.js"), [name], {stdio: "inherit"});
        this.#handle.on("message", this.#handleMessage.bind(this));
        this.#handle.send(serialize({
            name: this.#name,
            fn: this.#fn,
            args: this.#args
        }));
    }

    reuse({fn, args, messageHandler = null}) {
        if(this.#retVal !== undefined) {
            this.#retValCache.unshift(this.#retVal);
            this.#retVal = undefined;
        }
        if(!!fn) this.#fn = fn;
        if(!!args) this.#args = args;
        if(!!messageHandler) this.#messageHandlers.push(messageHandler);
        const prom = new Promise((res, rej) => {this.#promiseTriggers.push({res, rej});})
        this.#promise = this.#promise.then(() => prom);
        this.#handle.send(serialize({
            name: this.#name,
            fn: this.#fn,
            args: this.#args
        }));
    }

    kill(signal) {
        this.#handle.kill(signal);
    }

    get name() {return this.#name;}
    get promise() {return this.#promise;}
    get retVal() {return this.#retVal;}
    get retValCache() {return this.#retValCache;}
    get isConnected() {return this.#handle.connected;}
    // expose the handle or just a way to send a message?

    #handleMessage(data) {
        try {
            data = deserialize(data);
            // Checking if {retVal: any} exists means we can make sure that we're actually receiving the retVal
            // BUG/SQUASHED: Could this introduce a race condition if the fork returns a message before we even send our data?
            // No bug because we're looking for the property 'retVal' on the object, so unless something returns {retVal ...} we should be safe
            if(this.#promise.isPending && data.retVal !== undefined) {
                this.#retVal = data.retVal;
                this.#promiseTriggers.shift().res(data.retVal);
            } else if(this.#messageHandlers.length > 0) this.#messageHandlers.forEach((mh) => mh(null, data));
        } catch(e) {
            log(this, `Error`, logger.types.ERROR);
            log(this, e.message ?? "No message given!", logger.types.ERROR);
            log(this, e.stack ?? "No stack given!", logger.types.ERROR);
            if(this.#promise.isPending) this.#promiseTriggers.shift().rej(e);
            if(this.#messageHandlers.length > 0) this.#messageHandlers.forEach((mh) => mh(e, null));
        }
    }
}

module.exports = {
    Fork
}