const {WebView} = require("../");

let wv = new WebView({
    title: "Hello World! Form the code too!",
    center: true,
    // transparent: true,

});

wv.run();

/*
const {fork} = require("child_process");
const path = require("path");

// wv.run();
let i = 1;
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
fork(path.join(__dirname, "child.js"));
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
(async (d) => console.log(d))(i++);
// (async () => {
//     while(true) {
//         await new Promise((res) => setTimeout(res, 1000));
//         console.log(".\b");
//     }
// })();

*/