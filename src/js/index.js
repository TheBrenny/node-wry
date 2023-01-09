require("get-promise-state"); // I'm not sure if this plays nicely with everything else...

const path = require("path");
const {fork, ChildProcess} = require("child_process");
const {serialize, deserialize} = require("./serialisation");
const bindings = require('./bindings');
const {resolve} = require("path");
const logger = require("./logger");
const log = logger.bind(this, "main");

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

let debugWebview;

class WebView {
    #settings = {};
    #webviewFork = null;
    #listeners = [];

    constructor(settings = {}) {
        this.#settings = settings ?? {};

        if(!!settings?.icon) settings.icon = path.resolve(settings.icon);

        let trace = (new Error()).stack.split("\n")[2];
        trace = trace.substring(7, trace.indexOf(" ", 7)); // just gets the calling function name

        // This is a hack to prevent a `new WebView()` from being built upon deserialisation
        if(trace !== "WebView.deserialize") this.#build();
        else log("Deserialised WebView", logger.types.INFO)

        debugWebview = this;
    }

    get debugWebviewFork() {return this.#webviewFork;}

    #build() {
        this.#webviewFork = runFork({
            name: "webview",
            fn: (s) => {global.wv = new bindings.WebView(s);},
            args: [this.#settings]
        });
        // TODO: Create a way to submit user events via the Rust Proxy
    }

    addWindowEventListener(fn) {
        if(!this.#listeners) this.#listeners = [];
        this.#listeners.push(fn);
    }

    async run() {
        if(this.#webviewFork.promise.isPending) await this.#webviewFork.promise;

        // `type` is either "message" or "error"
        const messageHandler = (error, data) => {
            if(!error) this.#listeners.forEach((fn) => fn(data.event, data.data));
            else log(`Error in message handler: ${error}`, logger.types.ERROR);
        };
        this.#webviewFork = runFork({ // We probably don't need to re-set this, but I will anyway
            name: "webview",
            fn: () => global.wv.run(global.sendMessageCallback),
            args: [],
            messageHandler: messageHandler
        });
        this.#webviewFork.promise = this.#webviewFork.promise.finally(() => {
            this.kill();
        });
    }

    kill() {
        if(this.#webviewFork.handle.connected) {
            log(`Killing Webview`);
            this.#webviewFork.handle.kill("SIGTERM");
        } else {
            log(`Webview already closed!`, logger.types.WARN);
        }
    }

    toJSON() {
        let m = {
            settings: serialize(this.#settings),
            webviewFork: serialize(this.#webviewFork),
        };
        return `WebView{${serialize(m)}}`;
    }

    static fromJSON(data) {
        let {settings, webviewFork} = JSON.parse(data.substring("WebView{".length, data.length - 1));
        let wv = new WebView(settings);
        wv.#webviewFork = webviewFork;
    }
}

module.exports = {
    WebView
};