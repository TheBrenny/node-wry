require("get-promise-state"); // I'm not sure if this plays nicely with everything else...

const path = require("path");
const {serialize} = require("./serialisation");
const bindings = require('./bindings');
const logger = require("./logger");
const events = require("./events");
const {nextTick} = require("process");
const log = logger.bind(this, "main");
const {runFork} = require("./forks");

let debugWebview;

class WebView {
    #id;
    #settings = {};
    #webviewFork = null;
    #listeners = [];

    constructor(settings = {}) {
        this.#settings = settings ?? {};

        if(!!settings?.icon) settings.icon = path.resolve(settings.icon);

        // This is a hack to prevent a `new WebView()` from being built upon deserialisation
        let trace = (new Error()).stack.split("\n")[2];
        trace = trace.substring(7, trace.indexOf(" ", 7)); // just gets the calling function name
        if(trace !== "WebView.deserialize") this.#build();
        else log("Deserialised WebView", logger.types.INFO)

        debugWebview = this;
    }

    get id() {return this.#id;}
    get debugWebviewFork() {return this.#webviewFork;}

    #build() {
        this.#webviewFork = runFork({
            name: "webview",
            fn: (s) => {global.wv = new bindings.WebView(s); return global.wv.hash();},
            args: [this.#settings]
        });
        this.#webviewFork.promise.then((id) => this.#id = id);
    }

    addWindowEventListener(fn) {
        if(!this.#listeners) this.#listeners = [];
        this.#listeners.push(fn);
    }
    emitEvent(event, data) {
        if(typeof event === "string") {
            event = {
                event,
                data: data ?? {}
            }
        }
        if(events.isEvent(event)) nextTick(() => this.#handleEvent(event));
    }

    #handleEvent(event) {
        this.#listeners.forEach((fn) => fn(event));
    }

    async run() {
        if(this.#webviewFork.promise.isPending) await this.#webviewFork.promise;

        // `type` is either "message" or "error"
        const messageHandler = (error, event) => {
            if(!error) {
                if(!!event && events.isEvent(event)) this.#handleEvent(event);
                else error = new Error(`Unknown event: ${event}`);
            }
            if(!!error) log(`Error in message handler: ${error}`, logger.types.ERROR);
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
    WebView,
    EventType: events.EventType,
    addUserEvent: events.addUserEvent,
};