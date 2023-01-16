import { WebViewSettings as InternalSettings } from "./bindings";
import { WebViewEvent } from "./events";
export { WebViewEvent, EventType, addCustomEvent } from "./events";

type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & { [K in Keys]-?:
        Required<Pick<T, K>>
        & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys]

export type WebViewSettings = Omit<RequireOnlyOne<InternalSettings, "html" | "url">, "icon"> & {
    icon?: string | Buffer;
};

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

