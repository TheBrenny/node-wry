#![deny(clippy::all)]
#![allow(non_snake_case)]

use std::{fs, hash::Hasher};
use std::hash::Hash;

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

#[napi(js_name = "WebView")]
pub struct InternalWebView {
    event_loop: EventLoop<serde_json::Value>,
    webview: WebView,
    // event_proxy: EventLoopProxy<serde_json::Value>, // MAYBE: I actually don't think this is necessary?
    defaultEventHandler: bool,
    hash: String,
}

#[napi]
impl InternalWebView {
    #[napi(constructor)]
    pub fn new(settings: Option<NodeWebViewSettingsBuilder>) -> Self {
        let settings = NodeWebViewSettings::from(settings);

        let event_loop = EventLoop::<serde_json::Value>::with_user_event();
        // let event_proxy = event_loop.create_proxy();
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
            // event_proxy,
            webview,
            defaultEventHandler: settings.defaultEventHandler,
            hash: "".to_string()
        }
    }

    #[napi]
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

            if deh {
                match event {
                    Event::WindowEvent {
                        event: WindowEvent::CloseRequested,
                        ..
                    } => {
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
