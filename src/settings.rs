#[napi(object)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}
#[napi(object)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[napi(js_name = "WebViewSettings", object)]
pub struct NodeWebViewSettingsBuilder {
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
    pub icon: Option<String>,
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
}
pub struct NodeWebViewSettings {
    pub title: String,
    pub minSize: Option<Size>,
    pub size: Option<Size>,
    pub maxSize: Option<Size>,
    pub position: Option<Position>,
    pub center: bool,
    pub resizable: bool,
    pub fullscreen: bool,
    pub maximized: bool,
    pub maximizable: bool,
    pub minimizable: bool,
    pub decorations: bool,
    pub transparent: bool,
    pub alwaysOnLayer: String,
    pub url: String,
    pub theme: String,
    pub visible: bool,
    pub icon: String,
    pub acceptFirstMouse: bool,
    pub navigationGestures: bool,
    pub backgroundColor: String,
    pub clipboard: bool,
    // pub customProtocol: Option<String>,
    pub devtools: bool,
    pub hotkeysZoom: bool,
    pub html: String,
    pub initializationScript: String,
    pub useragent: String,
    pub defaultEventHandler: bool,
}

impl From<Option<NodeWebViewSettingsBuilder>> for NodeWebViewSettings {
    fn from(settings: Option<NodeWebViewSettingsBuilder>) -> Self {
        let settings = settings.unwrap();
        Self {
            // Window Settings
            title: settings.title.unwrap_or("Hello World!".to_string()),
            minSize: settings.minSize,
            size: settings.size,
            maxSize: settings.maxSize,
            position: settings.position,
            center: settings.center.unwrap_or(true),
            resizable: settings.resizable.unwrap_or(true),
            fullscreen: settings.fullscreen.unwrap_or(false),
            decorations: settings.decorations.unwrap_or(true),
            maximized: settings.maximized.unwrap_or(false),
            maximizable: settings.maximizable.unwrap_or(true),
            minimizable: settings.minimizable.unwrap_or(true),
            alwaysOnLayer: settings.alwaysOnLayer.unwrap_or("none".to_string()),
            url: settings.url.unwrap_or("https://html5test.com/".to_string()),
            theme: settings.theme.unwrap_or("light".to_string()),
            visible: settings.visible.unwrap_or(true),
            icon: settings.icon.unwrap_or("".to_string()),
            defaultEventHandler: settings.defaultEventHandler.unwrap_or(true),

            // Webview Settings
            acceptFirstMouse: settings.acceptFirstMouse.unwrap_or(false),
            navigationGestures: settings.navigationGestures.unwrap_or(true),
            backgroundColor: settings.backgroundColor.unwrap_or("#ffffffff".to_string()),
            clipboard: settings.clipboard.unwrap_or(true),
            // customProtocol: settings.customProtocol,
            devtools: settings.devtools.unwrap_or(cfg!(debug_assertions)),
            hotkeysZoom: settings.hotkeysZoom.unwrap_or(false),
            html: settings.html.unwrap_or("".to_string()),
            initializationScript: settings
                .initializationScript
                .unwrap_or("()=>{}".to_string()),
            useragent: settings.useragent.unwrap_or("node-wry/0.0.0".to_string()),

            // Both Settings
            transparent: settings.transparent.unwrap_or(false),
        }
    }
}