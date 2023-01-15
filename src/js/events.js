const EventType = {
    "Unknown": "unknown",
    "Init": "init",
    "Poll": "poll",
    "ResumeTimeReached": "resumeTimeReached",
    "WaitCancelled": "waitCancelled",
    "NewEventNotImplemented": "newEventNotImplemented",
    "WindowResized": "windowResized",
    "WindowMoved": "windowMoved",
    "WindowCloseRequested": "windowCloseRequested",
    "WindowDestroyed": "windowDestroyed",
    "DroppedFile": "droppedFile",
    "HoveredFile": "hoveredFile",
    "HoveredFileCancelled": "hoveredFileCancelled",
    "ReceivedImeText": "receivedImeText",
    "Focused": "focused",
    "KeyboardInput": "keyboardInput",
    "ModifiersChanged": "modifiersChanged",
    "CursorMoved": "cursorMoved",
    "CursorEntered": "cursorEntered",
    "CursorLeft": "cursorLeft",
    "WindowMouseWheel": "windowMouseWheel",
    "MouseInput": "mouseInput",
    "TouchpadPressure": "touchpadPressure",
    "AxisMotion": "axisMotion",
    "Touch": "touch",
    "ScaleFactorChanged": "scaleFactorChanged",
    "ThemeChanged": "themeChanged",
    "DecorationsClick": "decorationsClick",
    "WindowNotImplemented": "windowNotImplemented",
    "DeviceAdded": "deviceAdded",
    "DeviceRemoved": "deviceRemoved",
    "MouseMotion": "mouseMotion",
    "MouseWheel": "mouseWheel",
    "Motion": "motion",
    "Button": "button",
    "Key": "key",
    "DeviceText": "deviceText",
    "DeviceNotImplemented": "deviceNotImplemented",
    "UserEvent": "userEvent",
    "MenuEvent": "menuEvent",
    "TrayEvent": "trayEvent",
    "GlobalShortcutEvent": "globalShortcutEvent",
    "Suspended": "suspended",
    "Resumed": "resumed",
    "MainEventsCleared": "mainEventsCleared",
    "RedrawRequested": "redrawRequested",
    "RedrawEventsCleared": "redrawEventsCleared",
    "LoopDestroyed": "loopDestroyed",
};

const eventTypes = Object.values(EventType);

function isEvent(obj) {
    if(!(obj instanceof Object)) return false;

    let keys = Object.keys(obj);
    let validKeys = ["event", "data"];
    if(keys.length !== 2) return false;
    for(const k of keys) if(!validKeys.includes(k)) return false;

    if(!(obj.data instanceof Object)) return false;
    if(!eventTypes.includes(obj.event)) return false;

    return true;
}

module.exports = {
    isEvent,
};

Object.defineProperty(module.exports, "EventType", {
    writable: false,
    value: EventType
});