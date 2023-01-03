import { WebViewSettings } from "./bindings";

export class WebView {
    constructor(settings?: WebViewSettings);
    build(): void;
    async run(): void;
    kill(): void;
    serialize(): string;
    static deserialize(data: string): void;
}