declare namespace Events {
    interface Unknown {
        "event": "unknown",
        "data": {}
    }
    interface Init {
        "event": "init",
        "data": {}
    }
    interface Poll {
        "event": "poll",
        "data": {}
    }
    interface ResumeTimeReached {
        "event": "resumeTimeReached",
        "data": {
            "start": Number,
            "requestedResumeTime": Number
        }
    }
    interface WaitCancelled {
        "event": "waitCancelled",
        "data": {
            "start": Number,
            "requestedResumeTime": Number | null
        }
    }
    interface NewEventNotImplemented {
        "event": "newEventNotImplemented",
        "data": {}
    }
    interface WindowResized {
        "event": "windowResized",
        "data": {
            "windowId": String,
            "width": Number,
            "height": Number
        }
    }
    interface WindowMoved {
        "event": "windowMoved",
        "data": {
            "windowId": String,
            "x": Number,
            "y": Number
        }
    }
    interface WindowCloseRequested {
        "event": "windowCloseRequested",
        "data": {
            "windowId": String
        }
    }
    interface WindowDestroyed {
        "event": "windowDestroyed",
        "data": {
            "windowId": String
        }
    }
    interface DroppedFile {
        "event": "droppedFile",
        "data": {
            "windowId": String,
            "path": String
        }
    }
    interface HoveredFile {
        "event": "hoveredFile",
        "data": {
            "windowId": String,
            "path": String
        }
    }
    interface HoveredFileCancelled {
        "event": "hoveredFileCancelled",
        "data": {
            "windowId": String
        }
    }
    interface ReceivedImeText {
        "event": "receivedImeText",
        "data": {
            "windowId": String,
            "text": String
        }
    }
    interface Focused {
        "event": "focused",
        "data": {
            "windowId": String,
            "focused": Boolean
        }
    }
    interface KeyboardInput {
        "event": "keyboardInput",
        "data": {
            "windowId": String,
            "deviceId": String,
            "isSynthetic": Boolean,
            "physicalKey": KeyCode,
            "text": String,
            "location": KeyLocation,
            "state": ButtonState,
            "repeat": Boolean
        }
    }
    interface ModifiersChanged {
        "event": "modifiersChanged",
        "data": {
            "windowId": String,
            "shift": Boolean,
            "control": Boolean,
            "alt": Boolean,
            "super": Boolean
        }
    }
    interface CursorMoved {
        "event": "cursorMoved",
        "data": {
            "windowId": String,
            "deviceId": String,
            "x": Number,
            "y": Number,
            "modifiers_deprecated": {
                "shift": Boolean,
                "control": Boolean,
                "alt": Boolean,
                "super": Boolean
            }
        }
    }
    interface CursorEntered {
        "event": "cursorEntered",
        "data": {
            "windowId": String,
            "deviceId": String,
        }
    }
    interface CursorLeft {
        "event": "cursorLeft",
        "data": {
            "windowId": String,
            "deviceId": String
        }
    }
    interface WindowMouseWheel {
        "event": "windowMouseWheel",
        "data": {
            "windowId": String,
            "deviceId": String,
            "delta": {
                "x": Number,
                "y": Number
            },
            "phase": TouchPhase,
            "modifiers_deprecated": {
                "shift": Boolean,
                "control": Boolean,
                "alt": Boolean,
                "super": Boolean
            }
        }
    }
    interface MouseInput {
        "event": "mouseInput",
        "data": {
            "windowId": String,
            "deviceId": String,
            "state": ButtonState,
            "button": MouseButton | Number,
            "modifiers_deprecated": {
                "shift": Boolean,
                "control": Boolean,
                "alt": Boolean,
                "super": Boolean
            }
        }
    }
    interface TouchpadPressure {
        "event": "touchpadPressure",
        "data": {
            "windowId": String,
            "deviceId": String,
            "pressure": Number,
            "stage": Number,
        }
    }
    interface AxisMotion {
        "event": "axisMotion",
        "data": {
            "windowId": String,
            "deviceId": String,
            "axis": Number,
            "value": Number
        }
    }
    interface Touch {
        "event": "touch",
        "data": {
            "windowId": String,
            "deviceId": String,
            "phase": TouchPhase,
            "location": {
                "x": Number,
                "y": Number
            },
            "id": Number,
            "force": Number
        }
    }
    interface ScaleFactorChanged {
        "event": "scaleFactorChanged",
        "data": {
            "windowId": String,
            "scaleFactor": Number,
            "newInnerSize": {
                "width": Number,
                "height": Number
            }
        }
    }
    interface ThemeChanged {
        "event": "themeChanged",
        "data": {
            "windowId": String,
            "theme": DeviceTheme
        }
    }
    interface DecorationsClick {
        "event": "decorationsClick",
        "data": {
            "windowId": String
        }
    }
    interface WindowNotImplemented {
        "event": "windowNotImplemented",
        "data": {
            "windowId": String
        }
    }
    interface DeviceAdded {
        "event": "deviceAdded",
        "data": {
            "deviceId": String
        }
    }
    interface DeviceRemoved {
        "event": "deviceRemoved",
        "data": {
            "deviceId": String
        }
    }
    interface MouseMotion {
        "event": "mouseMotion",
        "data": {
            "deviceId": String,
            "delta": {
                "x": Number,
                "y": Number
            }
        }
    }
    interface MouseWheel {
        "event": "mouseWheel",
        "data": {
            "deviceId": String,
            "delta": {
                "x": Number,
                "y": Number
            }
        }
    }
    interface Motion {
        "event": "motion",
        "data": {
            "deviceId": String,
            "axis": Number,
            "value": Number
        }
    }
    interface Button {
        "event": "button",
        "data": {
            "deviceId": String,
            "button": Number,
            "state": ButtonState
        }
    }
    interface Key {
        "event": "key",
        "data": {
            "deviceId": String,
            "key": {
                "code": KeyCode,
                "state": ButtonState
            }
        }
    }
    interface DeviceText {
        "event": "deviceText",
        "data": {
            "deviceId": String,
            "codepoint": String
        }
    }
    interface DeviceNotImplemented {
        "event": "deviceNotImplemented",
        "data": {
            "deviceId": String
        }
    }
    interface UserEvent {
        "event": "userEvent",
        "data": {
            "event": Object
        }
    }
    interface MenuEvent {
        "event": "menuEvent",
        "data": {
            "windowId": String,
            "menuId": Number,
            "origin": MenuType
        }
    }
    interface TrayEvent {
        "event": "trayEvent",
        "data": {
            "id": Number,
            "bounds": {
                "x": Number,
                "y": Number,
                "width": Number,
                "height": Number
            },
            "event": TrayEvent,
            "position": {
                "x": Number,
                "y": Number
            }
        }
    }
    interface GlobalShortcutEvent {
        "event": "globalShortcutEvent",
        "data": {
            "acceleratorId": Number
        }
    }
    interface Suspended {
        "event": "suspended",
        "data": {}
    }
    interface Resumed {
        "event": "resumed",
        "data": {}
    }
    interface MainEventsCleared {
        "event": "mainEventsCleared",
        "data": {}
    }
    interface RedrawRequested {
        "event": "redrawRequested",
        "data": {
            "windowId": String
        }
    }
    interface RedrawEventsCleared {
        "event": "redrawEventsCleared",
        "data": {}
    }
    interface LoopDestroyed {
        "event": "loopDestroyed",
        "data": {}
    }
}

declare enum KeyCode {
  "Unidentified",
  "Backquote",
  "Backslash",
  "BracketLeft",
  "BracketRight",
  "Comma",
  "Digit0",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Equal",
  "IntlBackslash",
  "IntlRo",
  "IntlYen",
  "KeyA",
  "KeyB",
  "KeyC",
  "KeyD",
  "KeyE",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyI",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyM",
  "KeyN",
  "KeyO",
  "KeyP",
  "KeyQ",
  "KeyR",
  "KeyS",
  "KeyT",
  "KeyU",
  "KeyV",
  "KeyW",
  "KeyX",
  "KeyY",
  "KeyZ",
  "Minus",
  "Plus",
  "Period",
  "Quote",
  "Semicolon",
  "Slash",
  "AltLeft",
  "AltRight",
  "Backspace",
  "CapsLock",
  "ContextMenu",
  "ControlLeft",
  "ControlRight",
  "Enter",
  "SuperLeft",
  "SuperRight",
  "ShiftLeft",
  "ShiftRight",
  "Space",
  "Tab",
  "Convert",
  "KanaMode",
  "Lang1",
  "Lang2",
  "Lang3",
  "Lang4",
  "Lang5",
  "NonConvert",
  "Delete",
  "End",
  "Help",
  "Home",
  "Insert",
  "PageDown",
  "PageUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "NumLock",
  "Numpad0",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "NumpadAdd",
  "NumpadBackspace",
  "NumpadClear",
  "NumpadClearEntry",
  "NumpadComma",
  "NumpadDecimal",
  "NumpadDivide",
  "NumpadEnter",
  "NumpadEqual",
  "NumpadHash",
  "NumpadMemoryAdd",
  "NumpadMemoryClear",
  "NumpadMemoryRecall",
  "NumpadMemoryStore",
  "NumpadMemorySubtract",
  "NumpadMultiply",
  "NumpadParenLeft",
  "NumpadParenRight",
  "NumpadStar",
  "NumpadSubtract",
  "Escape",
  "Fn",
  "FnLock",
  "PrintScreen",
  "ScrollLock",
  "Pause",
  "BrowserBack",
  "BrowserFavorites",
  "BrowserForward",
  "BrowserHome",
  "BrowserRefresh",
  "BrowserSearch",
  "BrowserStop",
  "Eject",
  "LaunchApp1",
  "LaunchApp2",
  "LaunchMail",
  "MediaPlayPause",
  "MediaSelect",
  "MediaStop",
  "MediaTrackNext",
  "MediaTrackPrevious",
  "Power",
  "Sleep",
  "AudioVolumeDown",
  "AudioVolumeMute",
  "AudioVolumeUp",
  "WakeUp",
  "Hyper",
  "Turbo",
  "Abort",
  "Resume",
  "Suspend",
  "Again",
  "Copy",
  "Cut",
  "Find",
  "Open",
  "Paste",
  "Props",
  "Select",
  "Undo",
  "Hiragana",
  "Katakana",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "F13",
  "F14",
  "F15",
  "F16",
  "F17",
  "F18",
  "F19",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "F25",
  "F26",
  "F27",
  "F28",
  "F29",
  "F30",
  "F31",
  "F32",
  "F33",
  "F34",
  "F35",
}

declare enum KeyLocation {
    "Standard",
    "Left",
    "Right",
    "Numpad"
}

declare enum ButtonState {
    "Pressed",
    "Released"
}

declare enum TouchPhase {
    "Started",
    "Moved",
    "Ended",
    "Cancelled"
}

declare enum MouseButton {
    "Left",
    "Right",
    "Middle"
}

declare enum DeviceTheme {
    "light",
    "dark"
}

declare enum MenuType {
    "MenuBar",
    "ContextMenu"
}

declare enum TrayEvent {
    "LeftClick",
    "RightClick",
    "DoubleClick"
}

export enum EventType {
    Unknown = "unknown",
    Init = "init",
    Poll = "poll",
    ResumeTimeReached = "resumeTimeReached",
    WaitCancelled = "waitCancelled",
    NewEventNotImplemented = "newEventNotImplemented",
    WindowResized = "windowResized",
    WindowMoved = "windowMoved",
    WindowCloseRequested = "windowCloseRequested",
    WindowDestroyed = "windowDestroyed",
    DroppedFile = "droppedFile",
    HoveredFile = "hoveredFile",
    HoveredFileCancelled = "hoveredFileCancelled",
    ReceivedImeText = "receivedImeText",
    Focused = "focused",
    KeyboardInput = "keyboardInput",
    ModifiersChanged = "modifiersChanged",
    CursorMoved = "cursorMoved",
    CursorEntered = "cursorEntered",
    CursorLeft = "cursorLeft",
    WindowMouseWheel = "windowMouseWheel",
    MouseInput = "mouseInput",
    TouchpadPressure = "touchpadPressure",
    AxisMotion = "axisMotion",
    Touch = "touch",
    ScaleFactorChanged = "scaleFactorChanged",
    ThemeChanged = "themeChanged",
    DecorationsClick = "decorationsClick",
    WindowNotImplemented = "windowNotImplemented",
    DeviceAdded = "deviceAdded",
    DeviceRemoved = "deviceRemoved",
    MouseMotion = "mouseMotion",
    MouseWheel = "mouseWheel",
    Motion = "motion",
    Button = "button",
    Key = "key",
    DeviceText = "deviceText",
    DeviceNotImplemented = "deviceNotImplemented",
    UserEvent = "userEvent",
    MenuEvent = "menuEvent",
    TrayEvent = "trayEvent",
    GlobalShortcutEvent = "globalShortcutEvent",
    Suspended = "suspended",
    Resumed = "resumed",
    MainEventsCleared = "mainEventsCleared",
    RedrawRequested = "redrawRequested",
    RedrawEventsCleared = "redrawEventsCleared",
    LoopDestroyed = "loopDestroyed",
}

export function isEvent(obj: Object): boolean;

export type WebViewEvent = //#region 
    Events.Unknown |
    Events.Init |
    Events.Poll |
    Events.ResumeTimeReached |
    Events.WaitCancelled |
    Events.NewEventNotImplemented |
    Events.WindowResized |
    Events.WindowMoved |
    Events.WindowCloseRequested |
    Events.WindowDestroyed |
    Events.DroppedFile |
    Events.HoveredFile |
    Events.HoveredFileCancelled |
    Events.ReceivedImeText |
    Events.Focused |
    Events.KeyboardInput |
    Events.ModifiersChanged |
    Events.CursorMoved |
    Events.CursorEntered |
    Events.CursorLeft |
    Events.WindowMouseWheel |
    Events.MouseInput |
    Events.TouchpadPressure |
    Events.AxisMotion |
    Events.Touch |
    Events.ScaleFactorChanged |
    Events.ThemeChanged |
    Events.DecorationsClick |
    Events.WindowNotImplemented |
    Events.DeviceAdded |
    Events.DeviceRemoved |
    Events.MouseMotion |
    Events.MouseWheel |
    Events.Motion |
    Events.Button |
    Events.Key |
    Events.DeviceText |
    Events.DeviceNotImplemented |
    Events.UserEvent |
    Events.MenuEvent |
    Events.TrayEvent |
    Events.GlobalShortcutEvent |
    Events.Suspended |
    Events.Resumed |
    Events.MainEventsCleared |
    Events.RedrawRequested |
    Events.RedrawEventsCleared |
    Events.LoopDestroyed;
    //#endregion