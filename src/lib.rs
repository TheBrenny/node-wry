#![deny(clippy::all)]
#![allow(non_snake_case)]

use std::hash::{Hash, Hasher};

use wry::{
    application::{
        dpi::{LogicalSize, PhysicalPosition},
        event::{Event, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        platform::run_return::EventLoopExtRunReturn,
        window::{Fullscreen, Icon, Theme, WindowBuilder},
    },
    webview::{WebView, WebViewBuilder},
};

mod settings;
use settings::*;

mod events;
use events::*;

#[macro_use]
extern crate napi_derive;

fn colorTupleFromString(color: String) -> (u8, u8, u8, u8) {
    let mut color = color;
    if color.starts_with("#") {
        color = color.trim_start_matches("#").to_string();
    }
    if color.len() == 3 {
        color = color.split("").map(|c| format!("{}{}", c, c)).collect::<Vec<String>>().join("");
        color = format!("{}{}", color, "FF");
    }
    if color.len() == 6 {
        color = format!("{}{}", color, "FF");
    }
    if color.len() != 8 {
        panic!("Invalid color string: {}", color);
    }
    let mut color = color.chars();
    let r = color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
    let g = color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
    let b = color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
    let a = color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
    (r as u8, g as u8, b as u8, a as u8)
}

#[napi(js_name = "WebView")]
pub struct InternalWebView {
    event_loop: EventLoop<serde_json::Value>,
    webview: WebView,
    defaultEventHandler: bool,
    hash: String,
}

#[napi]
impl InternalWebView {
    #[napi(constructor)]
    pub fn new(settingsObj: Option<NodeWebViewSettings>) -> Self {
        // Window Building
        let event_loop = EventLoop::<serde_json::Value>::with_user_event();
        let event_proxy = event_loop.create_proxy();
        let mut _wb = WindowBuilder::new();

        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(alwaysOnLayer) = settingsObj.alwaysOnLayer {
                _wb = _wb.with_always_on_bottom(alwaysOnLayer == "bottom");
                _wb = _wb.with_always_on_bottom(alwaysOnLayer == "top");
            }
            if let Some(decorations) = settingsObj.decorations {
                _wb = _wb.with_decorations(decorations);
            }
            if let Some(fullscreen) = settingsObj.fullscreen {
                if fullscreen {
                    _wb = _wb.with_fullscreen(Some(Fullscreen::Borderless(None)));
                }
            }
            if let Some(maximizable) = settingsObj.maximizable {
                _wb = _wb.with_maximizable(maximizable);
            }
            if let Some(maximized) = settingsObj.maximized {
                _wb = _wb.with_maximized(maximized);
            }
            if let Some(minimizable) = settingsObj.minimizable {
                _wb = _wb.with_minimizable(minimizable);
            }
            if let Some(resizable) = settingsObj.resizable {
                _wb = _wb.with_resizable(resizable);
            }
            if let Some(theme) = settingsObj.theme {
                _wb = _wb.with_theme(getTheme(theme));
            }
            if let Some(title) = settingsObj.title {
                _wb = _wb.with_title(title);
            }
            if let Some(transparent) = settingsObj.transparent {
                _wb = _wb.with_transparent(transparent);
            }
            // TODO: Implement this -- you'll need to NAPI the wry::application::menu::MenuBar tho
            // .with_menu()
            if let Some(minSize) = settingsObj.minSize {
                _wb = _wb.with_min_inner_size(LogicalSize::new(minSize.width, minSize.height));
            }
            if let Some(size) = settingsObj.size {
                _wb = _wb.with_inner_size(LogicalSize::new(size.width, size.height));
            }
            if let Some(maxSize) = settingsObj.maxSize {
                _wb = _wb.with_max_inner_size(LogicalSize::new(maxSize.width, maxSize.height));
            }
            if let Some(position) = settingsObj.position {
                _wb = _wb.with_position(PhysicalPosition::new(position.x, position.y));
            }

            let icon: Icon;
            if let Some(iconBuffer) = settingsObj.icon {
                let img = image::load_from_memory(&iconBuffer).unwrap();
                let imgW = img.width();
                let imgH = img.height();
                icon = Icon::from_rgba(img.as_bytes().to_vec(), imgW, imgH).unwrap();
                _wb = _wb.with_window_icon(Some(icon));
            } else {
                _wb = _wb.with_window_icon(Some(Icon::from_rgba(buildDefaultIcon(256), 256, 256).unwrap()));
            }
        }

        let _window = _wb.with_visible(false).build(&event_loop).unwrap(); // We need to build before we can centre

        // Window Centering
        let mut center = true;
        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(c) = settingsObj.center {
                center = c;
            }
        }
        if center {
            let (screenWidth, screenHeight): (u32, u32) = _window.current_monitor().unwrap().size().into();
            let (windowWidth, windowHeight): (u32, u32) = _window.outer_size().into();
            let (centerX, centerY) = ((screenWidth - windowWidth) / 2, (screenHeight - windowHeight) / 2);
            _window.set_outer_position(PhysicalPosition::new(centerX, centerY));
        }

        // Web View Building
        let mut _wvb = WebViewBuilder::new(_window).unwrap();
        let mut useDefaultEventHandler = true;
        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(acceptFirstMouse) = settingsObj.acceptFirstMouse {
                _wvb = _wvb.with_accept_first_mouse(acceptFirstMouse);
            }
            if let Some(navigationGestures) = settingsObj.navigationGestures {
                _wvb = _wvb.with_back_forward_navigation_gestures(navigationGestures);
            }
            if let Some(backgroundColor) = settingsObj.backgroundColor {
                _wvb = _wvb.with_background_color(colorTupleFromString(backgroundColor));
            }
            if let Some(clipboard) = settingsObj.clipboard {
                _wvb = _wvb.with_clipboard(clipboard);
            }
            if let Some(devtools) = settingsObj.devtools {
                _wvb = _wvb.with_devtools(devtools);
            }
            if let Some(hotkeysZoom) = settingsObj.hotkeysZoom {
                _wvb = _wvb.with_hotkeys_zoom(hotkeysZoom);
            }
            if let Some(initializationScript) = settingsObj.initializationScript {
                _wvb = _wvb.with_initialization_script(initializationScript.as_str());
            }
            if let Some(transparent) = settingsObj.transparent {
                _wvb = _wvb.with_transparent(transparent);
            }
            if let Some(useragent) = settingsObj.useragent {
                _wvb = _wvb.with_user_agent(useragent.as_str());
            }
            if let Some(visible) = settingsObj.visible {
                _wvb = _wvb.with_visible(visible);
            }
            if let Some(deh) = settingsObj.defaultEventHandler {
                useDefaultEventHandler = deh;
            }
        }

        _wvb = _wvb.with_file_drop_handler(move |window, data| {
            let event = dropEventToJson(&window, &data);
            event_proxy.send_event(event).unwrap();
            false // Returning true will block the OS default behaviour.
        });

        // TODO: These are all things that I'll get to eventually
        // MAYBE: For the Handlers, the rust code will register a handler, and it'll check if one was passed on init and then invoke that using Napi casts?
        //   // .with_custom_protocol()            // I have no idea what to do here...
        //   // .with_download_completed_handler() // No idea here either
        //   // .with_download_started_handler()   // Or here
        //   // .with_ipc_handler()                // More handlers
        //   // .with_navigation_handler()         // More handlers
        //   // .with_new_window_req_handler()     // More handlers
        //   // .with_web_context()                // I don't even know what the heck this one is!
        //   ;

        // Set HTML/URL
        let mut setContent = false;
        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(url) = settingsObj.url {
                _wvb = _wvb.with_url(url.as_str()).expect("The passed URL is invalid!");
                setContent = true;
            } else if let Some(html) = settingsObj.html {
                _wvb = _wvb.with_html(html.as_str()).expect("The passed HTML is invalid!");
                setContent = true;
            }
        }
        if !setContent {
            _wvb = _wvb.with_url("https://html5test.com/").unwrap();
        }

        let webview = _wvb.build().unwrap();

        let mut devtools = cfg!(debug_assertions);
        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(true) = settingsObj.devtools {
                devtools = true;
            }
        }
        if devtools {
            webview.open_devtools();
        }

        let mut visible = true;
        if let Some(settingsObj) = settingsObj.clone() {
            if let Some(v) = settingsObj.visible {
                visible = v;
            }
        }
        webview.window().set_visible(visible);

        Self {
            event_loop,
            // event_proxy,
            webview,
            defaultEventHandler: useDefaultEventHandler,
            hash: "".to_string(),
        }
    }

    #[napi(getter)]
    pub fn hash(&mut self) -> String {
        if self.hash == "" {
            self.hash = hash(self.webview.window().id());
        }
        self.hash.clone()
    }

    #[napi(ts_args_type = "callback: (data: String) => void")]
    pub fn run<E>(&mut self, eventHandler: E)
    where
        E: Fn(String) -> napi::Result<()>,
    {
        let deh: bool = self.defaultEventHandler.clone();

        self.event_loop.run_return(move |event, _, control_flow| {
            *control_flow = ControlFlow::Wait;

            let wvEvent = eventToJson(&event);
            let _res = eventHandler(wvEvent.to_string());

            if deh || true {
                match event {
                    Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                        *control_flow = ControlFlow::Exit;
                        println!("Node-Wry has closed!");
                    },
                    _ => (),
                }
            }
        });
    }
}

fn buildDefaultIcon(size: u32) -> Vec<u8> {
    let mut icon = Vec::with_capacity((size * size) as usize);

    for a in 0..size {
        for b in 0..size {
            icon.push((a % 255) as u8);
            icon.push((b % 255) as u8);
            icon.push((a * b % 255) as u8);
            icon.push(255);
        }
    }

    icon
}

// This returns an Option because if the user doesn't supply a theme, we can
fn getTheme(theme: String) -> Option<Theme> {
    match theme.as_str() {
        "dark" => Some(Theme::Dark),
        "light" => Some(Theme::Light),
        _ => None,
    }
}

// MAYBE: Maybe we can make export this to the JS. Maybe NAPI has a page on Generics that could help?
pub fn hash<H: Hash>(hashable: H) -> String {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    hashable.hash(&mut hasher);
    hasher.finish().to_string()
}
