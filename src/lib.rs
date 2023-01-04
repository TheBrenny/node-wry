#![deny(clippy::all)]
#![allow(non_snake_case)]

use std::fs::{self};

use napi::NapiValue;
use wry::{
  application::{
    dpi::{LogicalPosition, LogicalSize, PhysicalPosition},
    event::{Event, StartCause, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    platform::run_return::EventLoopExtRunReturn,
    window::{Fullscreen, Icon, Theme, WindowBuilder},
  },
  http::{Request, Response},
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
  let r =
    color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
  let g =
    color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
  let b =
    color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
  let a =
    color.next().unwrap().to_digit(16).unwrap() * 16 + color.next().unwrap().to_digit(16).unwrap();
  (r as u8, g as u8, b as u8, a as u8)
}

#[napi(js_name = "WebViewSettings", object)]
pub struct NodeWebViewSettingsBuilder {
  pub title: Option<String>,
  pub minWidth: Option<f64>,
  pub minHeight: Option<f64>,
  pub width: Option<f64>,
  pub height: Option<f64>,
  pub maxWidth: Option<f64>,
  pub maxHeight: Option<f64>,
  pub positionX: Option<f64>,
  pub positionY: Option<f64>,
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
}

// #[napi(js_name = "Internal_WebViewSettings", object)]
pub struct NodeWebViewSettings {
  pub title: String,
  pub minWidth: f64,
  pub minHeight: f64,
  pub width: f64,
  pub height: f64,
  pub maxWidth: f64,
  pub maxHeight: f64,
  pub positionX: f64,
  pub positionY: f64,
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
}

impl From<Option<NodeWebViewSettingsBuilder>> for NodeWebViewSettings {
  fn from(settings: Option<NodeWebViewSettingsBuilder>) -> Self {
    let settings = settings.unwrap();
    Self {
      // Window Settings
      title: settings.title.unwrap_or("Hello World!".to_string()),
      minWidth: settings.minWidth.unwrap_or(0.0),
      minHeight: settings.minHeight.unwrap_or(0.0),
      width: settings.width.unwrap_or(800.0),
      height: settings.height.unwrap_or(600.0),
      maxWidth: settings.maxWidth.unwrap_or(0.0),
      maxHeight: settings.maxHeight.unwrap_or(-0.0),
      positionX: settings.positionX.unwrap_or(-0.0),
      positionY: settings.positionY.unwrap_or(-0.0),
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

      // Webview Settings
      acceptFirstMouse: settings.acceptFirstMouse.unwrap_or(false),
      navigationGestures: settings.navigationGestures.unwrap_or(true),
      backgroundColor: settings.backgroundColor.unwrap_or("#ffffffff".to_string()),
      clipboard: settings.clipboard.unwrap_or(true),
      // customProtocol: settings.customProtocol,
      devtools: settings
        .devtools
        .unwrap_or(if cfg!(debug_assertions) { true } else { false }),
      hotkeysZoom: settings.hotkeysZoom.unwrap_or(false),
      html: settings.html.unwrap_or("".to_string()),
      initializationScript: settings.initializationScript.unwrap_or("()=>{}".to_string()),
      useragent: settings.useragent.unwrap_or("node-wry/0.0.0".to_string()),

      // Both Settings
      transparent: settings.transparent.unwrap_or(false),
    }
  }
}

#[napi(js_name = "WebView")]
pub struct InternalWebView {
  event_loop: EventLoop<()>,
  webview: WebView,
  // event_proxy: EventProxy,
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
      .with_inner_size(LogicalSize::new(settings.width, settings.height))
      .with_maximizable(settings.maximizable)
      .with_maximized(settings.maximized)
      .with_min_inner_size(LogicalSize::new(settings.minWidth, settings.minHeight))
      .with_minimizable(settings.minimizable)
      .with_resizable(settings.resizable)
      .with_theme(getTheme(settings.theme))
      .with_title(settings.title)
      .with_transparent(settings.transparent)
      // .with_menu() // TODO: Implement this -- you'll need to NAPI the wry::application::menu::MenuBar tho
      ;

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
    if settings.maxWidth > 0.0 && settings.maxHeight > 0.0 {
      _wb = _wb.with_max_inner_size(LogicalSize::new(settings.maxWidth, settings.maxHeight));
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

    if settings.devtools { webview.open_devtools(); }

    webview.window().set_visible(settings.visible);

    Self {
      event_loop,
      webview,
    }
  }

  #[napi]
  pub fn run(&mut self) {
    self.event_loop.run_return(move |event, _, control_flow| {
      *control_flow = ControlFlow::Wait;

      match event {
        Event::NewEvents(StartCause::Init) => println!("Node-Wry has started!"),
        Event::WindowEvent {
          event: WindowEvent::CloseRequested,
          ..
        } => {
          // BUG: This actually hangs the thread?
          // Maybe we can call an exit function which should kill the thread?
          *control_flow = ControlFlow::Exit;
          println!("Node-Wry has closed!");
        }
        _ => (),
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
