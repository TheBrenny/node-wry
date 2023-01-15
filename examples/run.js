const path = require("path");
const {WebView, EventType} = require("../");

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
    console.log(`${event}: ${JSON.stringify(data)}`);

    if(event === EventType.Unknown) return;
    if(event === EventType.WaitCancelled) return;
    if(event === EventType.WindowCloseRequested) {
        if(data.windowId === wv.id) wv.kill();
    };
});

wv.run();
// setTimeout(() => wv.kill(), 3000);