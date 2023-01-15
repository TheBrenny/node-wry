import { WebViewSettings } from "./bindings";
import { WebViewEvent } from "./events";
export { WebViewEvent, EventType, addCustomEvent } from "./events";

export class WebView {
    constructor(settings?: WebViewSettings);
    build(): void;
    addWindowEventListener(fn: (event: WebViewEvent) => {}): void;
    emitEvent(event: WebViewEvent): void;
    emitEvent(event: String, data: Object | undefined): void;
    async run(): void;
    get id(): String;
    kill(): void;
    serialize(): string;
    static deserialize(data: string): void;
}

