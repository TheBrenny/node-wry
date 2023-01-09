#![deny(clippy::all)]
#![allow(non_snake_case)]

use std::{
    fs,
    time::{Instant, SystemTime, UNIX_EPOCH},
};

use serde_json::json;
use wry::{
    application::{
        dpi::{LogicalSize, PhysicalPosition},
        event::{Event, StartCause, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        platform::run_return::EventLoopExtRunReturn,
        window::{Fullscreen, Icon, Theme, WindowBuilder},
    },
    webview::{WebView, WebViewBuilder},
};

#[macro_use]
extern crate napi_derive;

fn colorTupleFromString(color: String) -> (u8, u8, u8, u8) {
    let mut color = color;
    if color.starts_with("#") {
        color = color.trim_start_matches("#").to_string();
    }
    if color.len() == 3 {
        color = color
            .split("")
            .map(|c| format!("{}{}", c, c))
            .collect::<Vec<String>>()
            .join("");
        color = format!("{}{}", color, "FF");
    }
    if color.len() == 6 {
        color = format!("{}{}", color, "FF");
    }
    if color.len() != 8 {
        panic!("Invalid color string: {}", color);
    }
    let mut color = color.chars();
    let r = color.next().unwrap().to_digit(16).unwrap() * 16
        + color.next().unwrap().to_digit(16).unwrap();
    let g = color.next().unwrap().to_digit(16).unwrap() * 16
        + color.next().unwrap().to_digit(16).unwrap();
    let b = color.next().unwrap().to_digit(16).unwrap() * 16
        + color.next().unwrap().to_digit(16).unwrap();
    let a = color.next().unwrap().to_digit(16).unwrap() * 16
        + color.next().unwrap().to_digit(16).unwrap();
    (r as u8, g as u8, b as u8, a as u8)
}

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

pub struct WebViewEvent {
    pub event: String,
    pub data: serde_json::Value,
}
impl WebViewEvent {
    pub fn toJSON(self) -> String {
        json!({
            "event": self.event,
            "data": self.data,
        })
        .to_string()
    }
}
impl From<&Event<'_, ()>> for WebViewEvent {
    fn from(event: &Event<'_, ()>) -> Self {
        match event {
            Event::NewEvents(startCause) => Self {
                event: "NewEvent".to_string(),
                data: match startCause {
                    StartCause::Init => json!({
                        "StartCause": "Init"
                    }),
                    StartCause::Poll => json!({
                        "StartCause": "Poll"
                    }),
                    StartCause::ResumeTimeReached {
                        start,
                        requested_resume,
                        ..
                    } => json!({
                        "StartCause": "ResumeTimeReached",
                        "start": instantToMillis(start),
                        "requested_resume": instantToMillis(requested_resume),
                    }),
                    StartCause::WaitCancelled {
                        start,
                        requested_resume,
                        ..
                    } => json!({
                        "StartCause": "WaitCancelled",
                        "start": instantToMillis(start),
                        "requested_resume": match requested_resume {
                            Some(instant) => json!(instantToMillis(instant)),
                            None => json!(serde_json::Value::Null),
                        },
                    }),
                    &_ => json!({
                        "StartCause": "Unknown"
                    }),
                },
            },
            _ => Self {
                event: "Unknown".to_string(),
                data: json!({}),
            },
        }
    }
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
            devtools: settings.devtools.unwrap_or(if cfg!(debug_assertions) {
                true
            } else {
                false
            }),
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

#[napi(js_name = "WebView")]
pub struct InternalWebView {
    event_loop: EventLoop<()>,
    #[allow(dead_code)] // HACK: This shouldn't be dead code! don't forget to remove this before 1.0.o
    webview: WebView,
    // event_proxy: EventProxy,
    defaultEventHandler: bool,
}

#[napi]
impl InternalWebView {
    #[napi(constructor)]
    pub fn new(settings: Option<NodeWebViewSettingsBuilder>) -> Self {
        let settings = NodeWebViewSettings::from(settings);

        let event_loop = EventLoop::new();
        // TODO: Create and expose the event proxy
        let mut _wb = WindowBuilder::new()
      .with_always_on_bottom(settings.alwaysOnLayer == "bottom")
      .with_always_on_top(settings.alwaysOnLayer == "top")
      .with_decorations(settings.decorations)
      .with_fullscreen(if settings.fullscreen {
        Some(Fullscreen::Borderless(None))
      } else {
        None
      })
      .with_maximizable(settings.maximizable)
      .with_maximized(settings.maximized)
      .with_minimizable(settings.minimizable)
      .with_resizable(settings.resizable)
      .with_theme(getTheme(settings.theme))
      .with_title(settings.title)
      .with_transparent(settings.transparent)
      // .with_menu() // TODO: Implement this -- you'll need to NAPI the wry::application::menu::MenuBar tho
      ;

        // Set the sizes if given
        if let Some(minSize) = settings.minSize {
            _wb = _wb.with_min_inner_size(LogicalSize::new(minSize.width, minSize.height));
        }
        if let Some(size) = settings.size {
            _wb = _wb.with_inner_size(LogicalSize::new(size.width, size.height));
        }
        if let Some(maxSize) = settings.maxSize {
            _wb = _wb.with_max_inner_size(LogicalSize::new(maxSize.width, maxSize.height));
        }

        // TODO: Change this to a B64 decode of the passed string!
        // What we want to do instead is embed b64 encoded icons somewhere, or
        // let the main JS read and build a b64 encoded image
        let icon: Icon;
        let iconPath = settings.icon.as_str();
        if iconPath != "" && fs::metadata(iconPath).is_ok() {
            let imgDecoder = image::io::Reader::open(iconPath)
                .unwrap()
                .with_guessed_format()
                .unwrap()
                .decode()
                .unwrap();
            let img = imgDecoder.to_rgba8();
            let imgW = img.width();
            let imgH = img.height();
            icon = Icon::from_rgba(img.into_raw(), imgW, imgH).unwrap();
            _wb = _wb.with_window_icon(Some(icon));
        } else {
            _wb = _wb.with_window_icon(Some(
                Icon::from_rgba(buildDefaultIcon(256), 256, 256).unwrap(),
            ));
        }

        let _window = _wb.with_visible(false).build(&event_loop).unwrap();

        if settings.center {
            let (screenWidth, screenHeight): (u32, u32) =
                _window.current_monitor().unwrap().size().into();
            let (windowWidth, windowHeight): (u32, u32) = _window.outer_size().into();
            let (centerX, centerY) = (
                (screenWidth - windowWidth) / 2,
                (screenHeight - windowHeight) / 2,
            );
            _window.set_outer_position(PhysicalPosition::new(centerX, centerY))
        }

        let mut initScript = settings.initializationScript.as_str();
        if initScript == "" {
            initScript = "()=>{}";
        }

        let mut _wvb = WebViewBuilder::new(_window)
      .unwrap()
      .with_accept_first_mouse(settings.acceptFirstMouse)
      .with_back_forward_navigation_gestures(settings.navigationGestures)
      .with_background_color(colorTupleFromString(settings.backgroundColor))
      .with_clipboard(settings.clipboard)
      .with_devtools(settings.devtools)
      .with_hotkeys_zoom(settings.hotkeysZoom)
      .with_initialization_script(initScript)
      .with_transparent(settings.transparent)
      .with_user_agent(settings.useragent.as_str())
      .with_visible(settings.visible)
      // TODO: These are all things that I'll get to eventually
      // MAYBE: For the Handlers, the rust code will register a handler, and it'll check if one was passed on init and then invoke that using Napi casts?
      // .with_custom_protocol()            // I have no idea what to do here...
      // .with_download_completed_handler() // No idea here either
      // .with_download_started_handler()   // Or here
      // .with_file_drop_handler()          // or here...
      // .with_ipc_handler()                // More handlers
      // .with_navigation_handler()         // More handlers
      // .with_new_window_req_handler()     // More handlers
      // .with_web_context()                // I don't even know what the heck this one is!
      ;

        // Set HTML/URL
        _wvb = _wvb.with_url(settings.url.as_str()).unwrap();
        _wvb = _wvb.with_html(settings.html.as_str()).unwrap();

        let webview = _wvb.build().unwrap();

        if settings.devtools {
            webview.open_devtools();
        }

        webview.window().set_visible(settings.visible);

        Self {
            event_loop,
            webview,
            defaultEventHandler: settings.defaultEventHandler,
        }
    }

    #[napi(ts_args_type = "callback: (data: String) => void")]
    pub fn run<E>(&mut self, eventHandler: E)
    where
        E: Fn(String) -> napi::Result<()>,
    {
        let deh: bool = self.defaultEventHandler.clone();

        self.event_loop.run_return(move |event, _, control_flow| {
            *control_flow = ControlFlow::Wait;

            let wvEvent = WebViewEvent::from(&event).toJSON();
            let _res = eventHandler(wvEvent);

            if deh {
                match event {
                    // Event::NewEvents(StartCause::Init) => println!("Node-Wry has started!"),
                    Event::WindowEvent {
                        event: WindowEvent::CloseRequested,
                        ..
                    } => {
                        *control_flow = ControlFlow::Exit;
                        println!("Node-Wry has closed!");
                    }
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

fn getTheme(theme: String) -> Option<Theme> {
    Some(match theme.as_str() {
        "dark" => Theme::Dark,
        "light" => Theme::Light,
        _ => Theme::default(),
    })
}

fn instantToMillis(instant: &Instant) -> u64 {
    let since_the_epoch = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    let now = Instant::now();
    (since_the_epoch - (now - *instant))
        .as_millis()
        .try_into()
        .unwrap_or(0)
}
