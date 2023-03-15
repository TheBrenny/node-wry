const path = require("path");
const fs = require("fs");
const {WebView, EventType, addCustomEvent} = require("../");

const html = fs.readFileSync(path.resolve(__dirname, "page.html"));

let wv = new WebView({
    title: "Hello World! Form the code too!",
    center: true,
    // url: "https://html5test.com",
    html: html,
    backgroundColor: "#00000000",
    initializationScript: "console.log('Hello world!!')",
    icon: path.resolve(__dirname, "wry_logo.png"),
    defaultEventHandler: false,
    transparent: true,
    ipcHandler: true,
});

wv.addWindowEventListener(({event, data}) => {
    if(event === EventType.WindowCloseRequested) {
        if(data.windowId === wv.id) {
            wv.kill();
            process.exit(0);
        }
    };

    if([EventType.FileDropped, EventType.FileHovered].includes(event)) console.log(`Path: ${data.paths}`);

    if(event === EventType.IPCMessage) console.log(`IPC Message: ${data.windowId}, ${data.message}`)
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