declare namespace Events {
    interface UserEvent {
        "event": String,
        "data": Object
    }
    interface Unknown {
        "event": EventType.Unknown,
        "data": {}
    }
    interface Init {
        "event": EventType.Init,
        "data": {}
    }
    interface Poll {
        "event": EventType.Poll,
        "data": {}
    }
    interface ResumeTimeReached {
        "event": EventType.ResumeTimeReached,
        "data": {
            "start": Number,
            "requestedResumeTime": Number
        }
    }
    interface WaitCancelled {
        "event": EventType.WaitCancelled,
        "data": {
            "start": Number,
            "requestedResumeTime": Number | null
        }
    }
    interface NewEventNotImplemented {
        "event": EventType.NewEventNotImplemented,
        "data": {}
    }
    interface WindowResized {
        "event": EventType.WindowResized,
        "data": {
            "windowId": String,
            "width": Number,
            "height": Number
        }
    }
    interface WindowMoved {
        "event": EventType.WindowMoved,
        "data": {
            "windowId": String,
            "x": Number,
            "y": Number
        }
    }
    interface WindowCloseRequested {
        "event": EventType.WindowCloseRequested,
        "data": {
            "windowId": String
        }
    }
    interface WindowDestroyed {
        "event": EventType.WindowDestroyed,
        "data": {
            "windowId": String
        }
    }
    interface DroppedFile {
        "event": EventType.DroppedFile,
        "data": {
            "windowId": String,
            "path": String[]
        }
    }
    interface HoveredFile {
        "event": EventType.HoveredFile,
        "data": {
            "windowId": String,
            "path": String[]
        }
    }
    interface HoveredFileCancelled {
        "event": EventType.HoveredFileCancelled,
        "data": {
            "windowId": String
        }
    }
    interface ReceivedImeText {
        "event": EventType.ReceivedImeText,
        "data": {
            "windowId": String,
            "text": String
        }
    }
    interface Focused {
        "event": EventType.Focused,
        "data": {
            "windowId": String,
            "focused": Boolean
        }
    }
    interface KeyboardInput {
        "event": EventType.KeyboardInput,
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
        "event": EventType.ModifiersChanged,
        "data": {
            "windowId": String,
            "shift": Boolean,
            "control": Boolean,
            "alt": Boolean,
            "super": Boolean
        }
    }
    interface CursorMoved {
        "event": EventType.CursorMoved,
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
        "event": EventType.CursorEntered,
        "data": {
            "windowId": String,
            "deviceId": String,
        }
    }
    interface CursorLeft {
        "event": EventType.CursorLeft,
        "data": {
            "windowId": String,
            "deviceId": String
        }
    }
    interface WindowMouseWheel {
        "event": EventType.WindowMouseWheel,
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
        "event": EventType.MouseInput,
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
        "event": EventType.TouchpadPressure,
        "data": {
            "windowId": String,
            "deviceId": String,
            "pressure": Number,
            "stage": Number,
        }
    }
    interface AxisMotion {
        "event": EventType.AxisMotion,
        "data": {
            "windowId": String,
            "deviceId": String,
            "axis": Number,
            "value": Number
        }
    }
    interface Touch {
        "event": EventType.Touch,
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
        "event": EventType.ScaleFactorChanged,
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
        "event": EventType.ThemeChanged,
        "data": {
            "windowId": String,
            "theme": DeviceTheme
        }
    }
    interface DecorationsClick {
        "event": EventType.DecorationsClick,
        "data": {
            "windowId": String
        }
    }
    interface WindowNotImplemented {
        "event": EventType.WindowNotImplemented,
        "data": {
            "windowId": String
        }
    }
    interface DeviceAdded {
        "event": EventType.DeviceAdded,
        "data": {
            "deviceId": String
        }
    }
    interface DeviceRemoved {
        "event": EventType.DeviceRemoved,
        "data": {
            "deviceId": String
        }
    }
    interface MouseMotion {
        "event": EventType.MouseMotion,
        "data": {
            "deviceId": String,
            "delta": {
                "x": Number,
                "y": Number
            }
        }
    }
    interface MouseWheel {
        "event": EventType.MouseWheel,
        "data": {
            "deviceId": String,
            "delta": {
                "x": Number,
                "y": Number
            }
        }
    }
    interface Motion {
        "event": EventType.Motion,
        "data": {
            "deviceId": String,
            "axis": Number,
            "value": Number
        }
    }
    interface Button {
        "event": EventType.Button,
        "data": {
            "deviceId": String,
            "button": Number,
            "state": ButtonState
        }
    }
    interface Key {
        "event": EventType.Key,
        "data": {
            "deviceId": String,
            "key": {
                "code": KeyCode,
                "state": ButtonState
            }
        }
    }
    interface DeviceText {
        "event": EventType.DeviceText,
        "data": {
            "deviceId": String,
            "codepoint": String
        }
    }
    interface DeviceNotImplemented {
        "event": EventType.DeviceNotImplemented,
        "data": {
            "deviceId": String
        }
    }
    interface MenuEvent {
        "event": EventType.MenuEvent,
        "data": {
            "windowId": String,
            "menuId": Number,
            "origin": MenuType
        }
    }
    interface TrayEvent {
        "event": EventType.TrayEvent,
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
        "event": EventType.GlobalShortcutEvent,
        "data": {
            "acceleratorId": Number
        }
    }
    interface Suspended {
        "event": EventType.Suspended,
        "data": {}
    }
    interface Resumed {
        "event": EventType.Resumed,
        "data": {}
    }
    interface MainEventsCleared {
        "event": EventType.MainEventsCleared,
        "data": {}
    }
    interface RedrawRequested {
        "event": EventType.RedrawRequested,
        "data": {
            "windowId": String
        }
    }
    interface RedrawEventsCleared {
        "event": EventType.RedrawEventsCleared,
        "data": {}
    }
    interface LoopDestroyed {
        "event": EventType.LoopDestroyed,
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

// TODO: Maybe there's a way that we can generate this EventType enum?
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
    FileDropped = "droppedFile", // alias
    HoveredFile = "hoveredFile",
    FileHovered = "hoveredFile", // alias
    HoveredFileCancelled = "hoveredFileCancelled",
    FileHoveredCancelled = "hoveredFileCancelled", // alias
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

export type WebViewEvent =
    Events.UserEvent |
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
    Events.MenuEvent |
    Events.TrayEvent |
    Events.GlobalShortcutEvent |
    Events.Suspended |
    Events.Resumed |
    Events.MainEventsCleared |
    Events.RedrawRequested |
    Events.RedrawEventsCleared |
    Events.LoopDestroyed;

export function isEvent(obj: Object): boolean;
export function addCustomEvent(eventName: String): void;