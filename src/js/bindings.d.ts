/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export interface Size {
  width: number
  height: number
}
export interface Position {
  x: number
  y: number
}
export interface WebViewSettings {
  title?: string
  minSize?: Size
  size?: Size
  maxSize?: Size
  position?: Position
  center?: boolean
  resizable?: boolean
  fullscreen?: boolean
  maximized?: boolean
  maximizable?: boolean
  minimizable?: boolean
  transparent?: boolean
  alwaysOnLayer?: string
  decorations?: boolean
  url?: string
  theme?: string
  visible?: boolean
  icon?: Array<number>
  acceptFirstMouse?: boolean
  navigationGestures?: boolean
  backgroundColor?: string
  clipboard?: boolean
  devtools?: boolean
  hotkeysZoom?: boolean
  html?: string
  initializationScript?: string
  useragent?: string
  defaultEventHandler?: boolean
  nativeFileHandler?: boolean
  ipcHandler?: boolean
}
export type InternalWebView = WebView
export class WebView {
  constructor(settingsObj?: WebViewSettings | undefined | null)
  get hash(): string
  run(callback: (data: String) => void): void
}
