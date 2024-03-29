require("get-promise-state"); // I'm not sure if this plays nicely with everything else...

const fs = require("fs");
const path = require("path");
const bindings = require('./bindings');
const logger = require("./logger");
const events = require("./events");
const {nextTick} = require("process");
const log = logger.bind(this, "main");
const {Fork} = require("./forks");

let debugWebview;

class WebView {
    #id;
    #settings = {};
    /** @type Fork */
    #webviewFork;
    #listeners = [];

    constructor(settings = {}) {
        log("Creating WebView.", logger.types.INFO);
        if(!!settings?.icon) settings.icon = path.resolve(settings.icon);
        if(!!settings?.html && settings.html instanceof Buffer) settings.html = settings.html.toString();
        if(!!settings?.icon && typeof settings.icon === "string") {
            let p = path.resolve(settings.icon);
            settings.icon = Array.from(fs.readFileSync(p));
        }
        this.#settings = settings ?? {};

        this.#build();

        debugWebview = this;
    }

    get id() {return this.#id;}
    get debugWebviewFork() {return this.#webviewFork;}
    async getTitle() {

    }

    #build() {
        this.#webviewFork = new Fork({
            name: "webview",
            fn: (s) => {global.wv = new bindings.WebView(s); return global.wv.hash;},
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

        const messageHandler = (error, event) => {
            if(!error) {
                if(!!event && events.isEvent(event)) this.#handleEvent(event);
                else error = new Error(`Unknown event: ${event}`);
            }
            if(!!error) log(`Error in message handler: ${error}`, logger.types.ERROR);
        };
        this.#webviewFork.reuse({
            fn: () => global.wv.run(global.sendMessageCallback),
            args: [],
            messageHandler: messageHandler
        });
        this.#webviewFork.promise.finally(() => {
            this.kill();
        });
    }

    kill() {
        if(this.#webviewFork.isConnected) {
            log(`Killing Webview`);
            this.#webviewFork.kill("SIGTERM");
        } else {
            log(`Webview already closed!`, logger.types.WARN);
        }
    }
}

module.exports = {
    WebView,
    EventType: events.EventType,
    addCustomEvent: events.addCustomEvent,
};