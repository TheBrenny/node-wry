use std::time::{Instant, SystemTime, UNIX_EPOCH};

use crate::hash;

use serde_json::json;

use wry::{
    application::{
        event::{DeviceEvent, Event, MouseScrollDelta, StartCause, WindowEvent},
        window::Window,
    },
    webview::FileDropEvent,
};

pub fn eventToJson(wryEvent: &Event<'_, serde_json::Value>) -> serde_json::Value {
    #[allow(unused_assignments)]
    let mut eventName: &str = "unknown";
    let mut data = serde_json::Map::new();

    match wryEvent {
        Event::NewEvents(startCause) => match startCause {
            StartCause::Init => eventName = "init",
            StartCause::Poll => eventName = "poll",
            StartCause::ResumeTimeReached { start, requested_resume, .. } => {
                eventName = "resumeTimeReached";
                data.insert("start".to_string(), json!(instantToMillis(start)));
                data.insert("requestedResumeTime".to_string(), json!(instantToMillis(requested_resume)));
            },
            StartCause::WaitCancelled { start, requested_resume, .. } => {
                eventName = "waitCancelled";
                data.insert("start".to_string(), json!(instantToMillis(start)));
                data.insert(
                    "requestedResumeTime".to_string(),
                    json!(match requested_resume {
                        Some(instant) => json!(instantToMillis(instant)),
                        None => json!(serde_json::Value::Null),
                    }),
                );
            },
            &_ => eventName = "newEventNotImplemented",
        },
        Event::WindowEvent { window_id, event, .. } => {
            data.insert("windowId".to_string(), json!(hash(window_id)));
            match event {
                WindowEvent::Resized(size) => {
                    eventName = "windowResized";
                    data.insert("width".to_string(), json!(size.width));
                    data.insert("height".to_string(), json!(size.height));
                },
                WindowEvent::Moved(position) => {
                    eventName = "windowMoved";
                    data.insert("x".to_string(), json!(position.x));
                    data.insert("y".to_string(), json!(position.y));
                },
                WindowEvent::CloseRequested => eventName = "windowCloseRequested",
                WindowEvent::Destroyed => eventName = "windowDestroyed",
                WindowEvent::DroppedFile(path) => {
                    eventName = "droppedFile";
                    data.insert("paths".to_string(), json!([path]));
                },
                WindowEvent::HoveredFile(path) => {
                    eventName = "hoveredFile";
                    data.insert("paths".to_string(), json!([path]));
                },
                WindowEvent::HoveredFileCancelled => eventName = "hoveredFileCancelled",
                WindowEvent::ReceivedImeText(text) => {
                    eventName = "receivedImeText";
                    data.insert("text".to_string(), json!(text));
                },
                WindowEvent::Focused(flag) => {
                    eventName = "focused";
                    data.insert("focused".to_string(), json!(flag));
                },
                WindowEvent::KeyboardInput { device_id, event, is_synthetic, .. } => {
                    eventName = "keyboardInput";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("isSynthetic".to_string(), json!(is_synthetic));

                    data.insert("physicalKey".to_string(), json!(format!("{:?}", event.physical_key)));
                    data.insert("text".to_string(), json!(event.text.unwrap_or("")));
                    data.insert("location".to_string(), json!(format!("{:?}", event.location)));
                    data.insert("state".to_string(), json!(format!("{:?}", event.state)));
                    data.insert("repeat".to_string(), json!(event.repeat));
                },
                WindowEvent::ModifiersChanged(modState) => {
                    eventName = "modifiersChanged";
                    data.insert("shift".to_string(), json!(modState.shift_key()));
                    data.insert("control".to_string(), json!(modState.control_key()));
                    data.insert("alt".to_string(), json!(modState.alt_key()));
                    data.insert("super".to_string(), json!(modState.super_key()));
                },
                #[allow(deprecated)]
                WindowEvent::CursorMoved { device_id, position, modifiers } => {
                    eventName = "cursorMoved";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("x".to_string(), json!(position.x));
                    data.insert("y".to_string(), json!(position.y));
                    data.insert(
                        "modifiers_deprecated".to_string(),
                        json!({
                            "shift": modifiers.shift_key(),
                            "control": modifiers.control_key(),
                            "alt": modifiers.alt_key(),
                            "super": modifiers.super_key(),
                        }),
                    );
                },
                WindowEvent::CursorEntered { device_id } => {
                    eventName = "cursorEntered";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                },
                WindowEvent::CursorLeft { device_id } => {
                    eventName = "cursorLeft";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                },
                #[allow(deprecated)]
                WindowEvent::MouseWheel { device_id, delta, phase, modifiers } => {
                    eventName = "windowMouseWheel";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert(
                        "delta".to_string(),
                        json!({
                            "x": match delta {
                                MouseScrollDelta::LineDelta(x, _) => x.clone(),
                                MouseScrollDelta::PixelDelta(pos) => pos.x as f32,
                                &_ => f32::INFINITY
                            },
                            "y": match delta {
                                MouseScrollDelta::LineDelta(_, y) => y.clone(),
                                MouseScrollDelta::PixelDelta(pos) => pos.y as f32,
                                &_ => f32::INFINITY
                            },
                        }),
                    );
                    data.insert("phase".to_string(), json!(format!("{:?}", phase)));
                    data.insert(
                        "modifiers_deprecated".to_string(),
                        json!({
                            "shift": modifiers.shift_key(),
                            "control": modifiers.control_key(),
                            "alt": modifiers.alt_key(),
                            "super": modifiers.super_key(),
                        }),
                    );
                },
                #[allow(deprecated)]
                WindowEvent::MouseInput { device_id, state, button, modifiers } => {
                    eventName = "mouseInput";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("state".to_string(), json!(format!("{:?}", state)));
                    data.insert("button".to_string(), json!(format!("{:?}", button)));
                    data.insert(
                        "modifiers_deprecated".to_string(),
                        json!({
                            "shift": modifiers.shift_key(),
                            "control": modifiers.control_key(),
                            "alt": modifiers.alt_key(),
                            "super": modifiers.super_key(),
                        }),
                    );
                },
                WindowEvent::TouchpadPressure { device_id, pressure, stage } => {
                    eventName = "touchpadPressure";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("pressure".to_string(), json!(pressure));
                    data.insert("stage".to_string(), json!(stage));
                },
                WindowEvent::AxisMotion { device_id, axis, value } => {
                    eventName = "axisMotion";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("axis".to_string(), json!(axis));
                    data.insert("value".to_string(), json!(value));
                },
                WindowEvent::Touch(touch) => {
                    eventName = "touch";
                    data.insert("deviceId".to_string(), json!(hash(touch.device_id)));
                    data.insert("phase".to_string(), json!(format!("{:?}", touch.phase)));
                    data.insert(
                        "location".to_string(),
                        json!({
                            "x": touch.location.x,
                            "y": touch.location.y,
                        }),
                    );
                    data.insert("id".to_string(), json!(touch.id));
                    data.insert(
                        "force".to_string(),
                        json!(match touch.force {
                            Some(force) => force.normalized(),
                            None => -1.0,
                        }),
                    );
                },
                WindowEvent::ScaleFactorChanged { scale_factor, new_inner_size } => {
                    eventName = "scaleFactorChanged";
                    data.insert("scaleFactor".to_string(), json!(scale_factor));
                    data.insert(
                        "newInnerSize".to_string(),
                        json!({
                            "width": new_inner_size.width,
                            "height": new_inner_size.height,
                        }),
                    );
                },
                WindowEvent::ThemeChanged(theme) => {
                    eventName = "themeChanged";
                    data.insert("theme".to_string(), json!(format!("{:?}", theme).to_lowercase()));
                },
                WindowEvent::DecorationsClick => eventName = "decorationsClick",
                &_ => eventName = "windowNotImplemented",
            }
        },
        Event::DeviceEvent { device_id, event, .. } => {
            data.insert("deviceId".to_string(), json!(hash(device_id)));
            match event {
                DeviceEvent::Added => eventName = "deviceAdded",
                DeviceEvent::Removed => eventName = "deviceRemoved",
                DeviceEvent::MouseMotion { delta, .. } => {
                    eventName = "mouseMotion";
                    data.insert(
                        "delta".to_string(),
                        json!({
                            "x": delta.0,
                            "y": delta.1,
                        }),
                    );
                },
                DeviceEvent::MouseWheel { delta, .. } => {
                    eventName = "mouseWheel";
                    data.insert(
                        "delta".to_string(),
                        json!({
                            "x": match delta {
                                MouseScrollDelta::LineDelta(x, _) => x.clone(),
                                MouseScrollDelta::PixelDelta(pos) => pos.x as f32,
                                &_ => f32::INFINITY
                            },
                            "y": match delta {
                                MouseScrollDelta::LineDelta(_, y) => y.clone(),
                                MouseScrollDelta::PixelDelta(pos) => pos.y as f32,
                                &_ => f32::INFINITY
                            },
                        }),
                    );
                },
                DeviceEvent::Motion { axis, value, .. } => {
                    eventName = "motion";
                    data.insert("axis".to_string(), json!(axis));
                    data.insert("value".to_string(), json!(value));
                },
                DeviceEvent::Button { button, state, .. } => {
                    eventName = "button";
                    data.insert("button".to_string(), json!(button));
                    data.insert("state".to_string(), json!(format!("{:?}", state)));
                },
                DeviceEvent::Key(key) => {
                    eventName = "key";
                    data.insert(
                        "key".to_string(),
                        json!({
                            "code": key.physical_key,
                            "state": format!("{:?}", key.state),
                        }),
                    );
                },
                DeviceEvent::Text { codepoint, .. } => {
                    eventName = "deviceText";
                    data.insert("codepoint".to_string(), json!(codepoint));
                },
                &_ => eventName = "deviceNotImplemented",
            }
        },
        Event::UserEvent(event) => {
            eventName = event["event"].as_str().unwrap_or("userEvent");
            data = event["data"].as_object().unwrap_or(&serde_json::Map::new()).clone();
        },
        Event::MenuEvent { window_id, menu_id, origin, .. } => {
            eventName = "menuEvent";
            data.insert(
                "windowId".to_string(),
                json!(match window_id {
                    Some(window_id) => hash(window_id),
                    None => "".to_string(),
                }),
            );
            data.insert("menuId".to_string(), json!(menu_id.0));
            data.insert("origin".to_string(), json!(format!("{:?}", origin)));
        },
        Event::TrayEvent { id, bounds, event, position, .. } => {
            eventName = "trayEvent";
            data.insert("id".to_string(), json!(id.0));
            data.insert(
                "bounds".to_string(),
                json!({
                    "x": bounds.position.x,
                    "y": bounds.position.y,
                    "width": bounds.size.width,
                    "height": bounds.size.height,
                }),
            );
            data.insert("event".to_string(), json!(format!("{:?}", event)));
            data.insert(
                "position".to_string(),
                json!({
                    "x": position.x,
                    "y": position.y,
                }),
            );
        },
        Event::GlobalShortcutEvent(id) => {
            eventName = "globalShortcutEvent";
            data.insert("acceleratorId".to_string(), json!(id.0));
        },
        Event::Suspended => eventName = "suspended",
        Event::Resumed => eventName = "resumed",
        Event::MainEventsCleared => eventName = "mainEventsCleared",
        Event::RedrawRequested(window_id) => {
            eventName = "redrawRequested";
            data.insert("windowId".to_string(), json!(hash(window_id)));
        },
        Event::RedrawEventsCleared => eventName = "redrawEventsCleared",
        Event::LoopDestroyed => eventName = "loopDestroyed",
        &_ => eventName = "unknown",
    }

    json!({
        "event": eventName,
        "data": data
    })
}

pub fn dropEventToJson(window: &Window, event: &FileDropEvent) -> serde_json::Value {
    #[allow(unused_mut, unused_assignments)]
    let mut eventName: &str = "unknown";
    let mut data = serde_json::Map::new();

    data.insert("windowId".to_string(), json!(hash(window.id())));

    match event {
        FileDropEvent::Hovered(paths) => {
            eventName = "hoveredFile";
            data.insert("paths".to_string(), json!(paths));
        },
        FileDropEvent::Dropped(paths) => {
            eventName = "droppedFile";
            data.insert("paths".to_string(), json!(paths));
        },
        FileDropEvent::Cancelled => eventName = "hoveredFileCancelled",
        &_ => eventName = "unknown",
    }

    json!({
        "event": eventName,
        "data": data
    })
}

fn instantToMillis(instant: &Instant) -> u32 {
    let since_the_epoch = SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards");
    let now = Instant::now();
    (since_the_epoch - (now - *instant)).as_millis().try_into().unwrap_or(0)
}
