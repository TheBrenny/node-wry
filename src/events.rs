use std::{
    hash::{Hash, Hasher},
    time::{Instant, SystemTime, UNIX_EPOCH},
};

use serde_json::json;

use wry::application::event::{Event, MouseScrollDelta, StartCause, WindowEvent};

pub fn createEvent(wryEvent: &Event<'_, ()>) -> serde_json::Value {
    let mut eventName: &str = "Unknown";
    // TODO: json!({}).as_object_mut().unwrap() to then insert into it, rather than creating a new object each time
    // Then at the bottom, we can go json!({ "eventName": eventName, "data": data }) ?
    // Otherwise it would be json!({ "eventName": eventName, "data": json!(data) })
    let mut data = serde_json::Map::new();

    match wryEvent {
        Event::NewEvents(startCause) => match startCause {
            StartCause::Init => eventName = "init",
            StartCause::Poll => eventName = "poll",
            StartCause::ResumeTimeReached {
                start,
                requested_resume,
                ..
            } => {
                eventName = "resumeTimeReached";
                data.insert("start".to_string(), json!(instantToMillis(start)));
                data.insert(
                    "requestedResumeTime".to_string(),
                    json!(instantToMillis(requested_resume)),
                );
            },
            StartCause::WaitCancelled {
                start,
                requested_resume,
                ..
            } => {
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
            &_ => {},
        },
        Event::WindowEvent {
            window_id, event, ..
        } => {
            data.insert("windowId".to_string(), json!(hash(window_id)));
            match event {
                WindowEvent::Resized(size) => {
                    eventName = "resized";
                    data.insert("width".to_string(), json!(size.width));
                    data.insert("height".to_string(), json!(size.height));
                },
                WindowEvent::Moved(position) => {
                    eventName = "moved";
                    data.insert("x".to_string(), json!(position.x));
                    data.insert("y".to_string(), json!(position.y));
                },
                WindowEvent::CloseRequested => eventName = "closeRequested",
                WindowEvent::Destroyed => eventName = "destroyed",
                WindowEvent::DroppedFile(path) => {
                    eventName = "droppedFile";
                    data.insert("path".to_string(), json!(path));
                },
                WindowEvent::HoveredFile(path) => {
                    eventName = "hoveredFile";
                    data.insert("path".to_string(), json!(path));
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
                WindowEvent::KeyboardInput {
                    device_id,
                    event,
                    is_synthetic,
                    ..
                } => {
                    eventName = "keyboardInput";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("isSynthetic".to_string(), json!(is_synthetic));

                    data.insert(
                        "physicalKey".to_string(),
                        json!(format!("{:?}", event.physical_key)),
                    );
                    data.insert("text".to_string(), json!(event.text.unwrap_or("")));
                    data.insert(
                        "location".to_string(),
                        json!(format!("{:?}", event.location)),
                    );
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
                WindowEvent::CursorMoved {
                    device_id,
                    position,
                    modifiers,
                } => {
                    eventName = "cursorMoved";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("x".to_string(), json!(position.x));
                    data.insert("y".to_string(), json!(position.y));
                    data.insert(
                        "modifiers".to_string(),
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
                WindowEvent::MouseWheel {
                    device_id,
                    delta,
                    phase,
                    modifiers,
                } => {
                    eventName = "mouseWheel";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert(
                        "delta".to_string(),
                        json!({
                            "x": match delta {
                                MouseScrollDelta::LineDelta(x, _) => x.to_string(),
                                MouseScrollDelta::PixelDelta(pos) => pos.x.to_string(),
                                &_ => "Infinity".to_string()
                            },
                            "y": match delta {
                                MouseScrollDelta::LineDelta(_, y) => y.to_string(),
                                MouseScrollDelta::PixelDelta(pos) => pos.y.to_string(),
                                &_ => "Infinity".to_string()
                            },
                        }),
                    );
                    data.insert("phase".to_string(), json!(format!("{:?}", phase)));
                    data.insert(
                        "modifiers".to_string(),
                        json!({
                            "shift": modifiers.shift_key(),
                            "control": modifiers.control_key(),
                            "alt": modifiers.alt_key(),
                            "super": modifiers.super_key(),
                        }),
                    );
                },
                WindowEvent::MouseInput {
                    device_id,
                    state,
                    button,
                    modifiers,
                } => {
                    eventName = "mouseInput";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("state".to_string(), json!(format!("{:?}", state)));
                    data.insert("button".to_string(), json!(format!("{:?}", button)));
                    data.insert(
                        "modifiers".to_string(),
                        json!({
                            "shift": modifiers.shift_key(),
                            "control": modifiers.control_key(),
                            "alt": modifiers.alt_key(),
                            "super": modifiers.super_key(),
                        }),
                    );
                },
                WindowEvent::TouchpadPressure {
                    device_id,
                    pressure,
                    stage,
                } => {
                    eventName = "touchpadPressure";
                    data.insert("deviceId".to_string(), json!(hash(device_id)));
                    data.insert("pressure".to_string(), json!(pressure));
                    data.insert("stage".to_string(), json!(stage));
                },
                WindowEvent::AxisMotion {
                    device_id,
                    axis,
                    value,
                } => {
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
                            None => 0.0,
                        }),
                    );
                },
                WindowEvent::ScaleFactorChanged {
                    scale_factor,
                    new_inner_size,
                } => {
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
                    data.insert(
                        "theme".to_string(),
                        json!(format!("{:?}", theme).to_lowercase()),
                    );
                },
                WindowEvent::DecorationsClick => eventName = "decorationsClick",
                &_ => {},
            }
        },
        &_ => {},
    }

    json!({
        "event": eventName,
        "data": data
    })
}

fn instantToMillis(instant: &Instant) -> u32 {
    let since_the_epoch = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    let now = Instant::now();
    (since_the_epoch - (now - *instant))
        .as_millis()
        .try_into()
        .unwrap_or(0)
}

// HACK:
// TODO: Watching https://github.com/tauri-apps/tao/issues/667 to see if we can implement a numeric ID getter instead of having to hash on every event!
fn hash<H: Hash>(hashable: H) -> String {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    hashable.hash(&mut hasher);
    hasher.finish().to_string()
}
