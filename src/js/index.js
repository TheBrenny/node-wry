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
const runFork = ({handle = null, name = "nullname", fn, args = []}) => {
	log(`${!!forks[name] ? "Reusing" : "Creating"} fork: "${name}"`);

	// Create or reuse a (new) fork
	let forkObj = forks[name] ?? { // I'm being verbose for consistency in this obj
		name: name,
		fn: fn,
		args: args,
		promise: null,
		handle: handle,
		retVal: undefined,
		retValCache: [],
	};
	if(!!forks[name]) { // Reusing, so fix the old vals
		forkObj.fn = fn;
		forkObj.args = args;
		forkObj.retValCache.push(forkObj.retVal);
		forkObj.retVal = undefined;
	}

	// Ensure that we should even run
	if(!forkObj.fn) throw new Error("No function provided to runFork");
	forkObj.fn = forkObj.fn.toString();

	// Create the promise
	let [resolver, rejector] = [undefined, undefined];
	const prom = new Promise((res, rej) => {resolver = res; rejector = rej;})
	if(!forkObj.promise) forkObj.promise = prom;
	else forkObj.promise.then(() => prom);

	// Create the fork handle and send the message
	if(forkObj.handle === null) forkObj.handle = fork(resolve(__dirname, "runner.js"), [name], {stdio: "inherit"});
	forkObj.handle.on("message", (data) => {
		try {
			data = deserialize(data);
			forks[name].retVal = data;
			resolver(data);
			log(`Fork "${name}" returned`);
		} catch(e) {
			log(`Fork "${name}" errored`, logger.types.ERROR);
			log(e, logger.types.ERROR);
			rejector(e);
		}
	});
	forkObj.handle.send(serialize({
		name: forkObj.name,
		fn: forkObj.fn,
		args: forkObj.args
	}));

	// Save and return the fork
	return (forks[name] = forkObj);
};
// I want to get rid of these and just pass around fork objects
const getFork = (name) => forks[name];
const deleteFork = (name) => delete forks[name];

class WebView {
	#settings = {};
	#webviewFork = null;

	constructor(settings = {}) {
		this.#settings = settings ?? {};

		if(!!settings?.icon) settings.icon = path.resolve(settings.icon);

		let trace = (new Error()).stack.split("\n")[2];
		trace = trace.substring(7, trace.indexOf(" ", 7)); // just gets the calling function name

		// This is a hack to prevent a `new WebView()` from being built upon deserialisation
		if(trace !== "WebView.deserialize") this.#build();
		else log("Deserialised WebView", logger.types.INFO)
	}

	#build() {
		this.#webviewFork = runFork({
			name: "webview",
			fn: (s) => {global.wv = new bindings.WebView(s);},
			args: [this.#settings]
		});
	}

	async run() {
		if(this.#webviewFork.promise.isPending) await this.#webviewFork.promise;
		this.#webviewFork = runFork({ // We probably don't need to re-set this, but I will anyway
			name: "webview",
			fn: () => global.wv.run(),
			args: []
		});
		this.#webviewFork.promise = this.#webviewFork.promise.finally(() => this.kill());
	}

	kill() {
		log(`Killing Webview`)
		this.#webviewFork.handle.kill();
	}

	toJSON() {
		let m = {
			settings: serialize(this.#settings),
			webviewFork: serialize(this.#webviewFork),
		};
		return `WebView{${serialize(m)}}`;
	}

	// serialize() {
	// 	let m = {
	// 		settings: serialize(this.#settings),
	// 		internalWebView: serialize(this.#internalWebView),
	// 		runHandle: serialize(this.#runHandle),
	// 	};
	// 	return `WebView{${Object.entries(m).map(([k, v]) => `${k}:${v}`).join(",")}}`;
	// }

	static fromJSON(data) {
		let {settings, webviewFork} = JSON.parse(data.substring("WebView{".length, data.length - 1));
		let wv = new WebView(settings);
		wv.#webviewFork = webviewFork;
	}
}

module.exports = {
	WebView
};