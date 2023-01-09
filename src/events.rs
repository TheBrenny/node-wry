use std::time::{Instant, SystemTime, UNIX_EPOCH};

use serde_json::json;
use wry::application::event::{Event, StartCause};

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
