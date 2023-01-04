/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export interface WebViewSettings {
  title?: string
  minWidth?: number
  minHeight?: number
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  positionX?: number
  positionY?: number
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
  icon?: string
}
export interface Internal_WebViewSettings {
  title: string
  minWidth: number
  minHeight: number
  width: number
  height: number
  maxWidth: number
  maxHeight: number
  positionX: number
  positionY: number
  center?: boolean
  resizable: boolean
  fullscreen: boolean
  maximized: boolean
  maximizable: boolean
  minimizable: boolean
  decorations: boolean
  transparent: boolean
  alwaysOnLayer: string
  url: string
  theme: string
  visible: boolean
  icon: string
}
export type InternalWebView = WebView
export class WebView {
  constructor(settings?: WebViewSettings | undefined | null)
  run(): void
}