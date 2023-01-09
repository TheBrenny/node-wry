const path = require("path");
const {WebView} = require("../");

let wv = new WebView({
    title: "Hello World! Form the code too!",
    center: true,
    url: "https://html5test.com",
    backgroundColor: "#000000",
    initializationScript: "console.log('Hello world!!')",
    icon: path.resolve(__dirname, "wry_logo.png")
    // transparent: true,
});

wv.addWindowEventListener((event, data) => {
    if(event === "Unknown") return;
    if(data.StartCause === "WaitCancelled") return;
    console.log(`${event}: ${JSON.stringify(data)}`);
});

wv.run();
setTimeout(() => wv.kill(), 3000);