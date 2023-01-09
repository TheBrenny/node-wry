import { WebViewSettings } from "./bindings";

export class WebView {
  constructor(settings?: WebViewSettings);
  build(): void;
  addWindowEventListener(fn: (data: WebViewEvent) => {}): void;
  async run(): void;
  kill(): void;
  serialize(): string;
  static deserialize(data: string): void;
}

export interface WebViewEvent {
  event: string;
  data?: string;
}
