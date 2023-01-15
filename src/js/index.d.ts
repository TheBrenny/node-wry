import { WebViewSettings } from "./bindings";
import { WebViewEvent } from "./events";
export { WebViewEvent, EventType } from "./events";

export class WebView {
    constructor(settings?: WebViewSettings);
    build(): void;
    addWindowEventListener(fn: (data: WebViewEvent) => {}): void;
    async run(): void;
    get id(): String;
    kill(): void;
    serialize(): string;
    static deserialize(data: string): void;
}
