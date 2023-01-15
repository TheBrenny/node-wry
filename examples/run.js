const path = require("path");
const {WebView, EventType, addUserEvent} = require("../");

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

addUserEvent("customEvent");

wv.addWindowEventListener(({event, data}) => {
    if(event === EventType.WindowCloseRequested) {
        if(data.windowId === wv.id) {
            wv.kill();
            process.exit(1);
        }
    };
    if(event === "customEvent") {
        console.log(`${event}: ${JSON.stringify(data)}`);
    }
});

wv.run();
setInterval(() => wv.emitEvent("customEvent", {num: 1}), 1000);
// setTimeout(() => wv.kill(), 3000);