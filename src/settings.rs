use napi::JsFunction;

#[derive(Clone)]
#[napi(object)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}
#[derive(Clone)]
#[napi(object)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[napi(js_name = "WebViewSettings", object)]
pub struct NodeWebViewSettings {
    pub title: Option<String>,
    pub minSize: Option<Size>,
    pub size: Option<Size>,
    pub maxSize: Option<Size>,
    pub position: Option<Position>,
    pub center: Option<bool>,
    pub resizable: Option<bool>,
    pub fullscreen: Option<bool>,
    pub maximized: Option<bool>,
    pub maximizable: Option<bool>,
    pub minimizable: Option<bool>,
    pub transparent: Option<bool>,
    pub alwaysOnLayer: Option<String>,
    pub decorations: Option<bool>,
    pub url: Option<String>,
    pub theme: Option<String>,
    pub visible: Option<bool>,
    pub icon: Option<Vec<u8>>,
    pub acceptFirstMouse: Option<bool>,
    pub navigationGestures: Option<bool>,
    pub backgroundColor: Option<String>,
    pub clipboard: Option<bool>,
    // pub customProtocol: Option<String>,
    pub devtools: Option<bool>,
    pub hotkeysZoom: Option<bool>,
    pub html: Option<String>,
    pub initializationScript: Option<String>,
    pub useragent: Option<String>,
    pub defaultEventHandler: Option<bool>,
    pub nativeFileHandler: Option<bool>,
    pub ipcHandler: Option<bool>,
    pub winReqHandler: Option<JsFunction>,
}