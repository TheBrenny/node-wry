const path = require("path");
const {WebView, EventType, addCustomEvent} = require("../");

let wv = new WebView({
    title: "Hello World! Form the code too!",
    center: true,
    url: "https://html5test.com",
    backgroundColor: "#000000",
    initializationScript: "console.log('Hello world!!')",
    icon: path.resolve(__dirname, "wry_logo.png"),
    defaultEventHandler: false,
    // transparent: true,
});

wv.addWindowEventListener(({event, data}) => {
    if(event === EventType.WindowCloseRequested) {
        if(data.windowId === wv.id) {
            wv.kill();
            process.exit(0);
        }
    };
    if(event === "customEvent") {
        console.log(`${event}: ${JSON.stringify(data)}`);
    }
});

wv.run();
// setTimeout(() => {
//     wv.resize(wv.width + 100, wv.height + 100)
// }, 1000);

// Testing custom events
// addCustomEvent("customEvent");
// let i = 0;
// setInterval(() => {
//     wv.emitEvent("customEvent", {num: i++})
// }, 1000);