import type * as Cesium from "cesium";

/** Stable API contract, version 1. This package contains types only. */
export declare const EXTENSION_API_VERSION: "1";
export type ExtensionApiVersion = typeof EXTENSION_API_VERSION;
export type ExtensionBuilding = { id: string; osmId: string; name: string; longitude: number; latitude: number };
export type ExtensionSpace = { id: string; psuSpaceId: string | null; name: string | null; longName: string | null; properties: Readonly<Record<string, unknown>> };
export type ToolbarToolOptions = { id: string; label: string; title?: string; iconText?: string; onClick: () => void | Promise<void> };
export type ToolbarToggleOptions = { id: string; label: string; initiallyActive?: boolean; onChange: (active: boolean) => void | Promise<void> };
export type ExtensionMarkerOptions = { id: string; name: string; longitude: number; latitude: number; height?: number; surface?: "3d-tiles" | "terrain" | "ellipsoid"; color?: string; properties?: Record<string, unknown> };
export type SidePanelOptions = { id: string; title: string; className?: string; render: (container: HTMLElement) => void | (() => void) };
export type MapOverlayOptions = { id: string; title: string; placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right"; className?: string; render: (container: HTMLElement) => void | (() => void) };
export type ExtensionPlatformEvents = {
  "viewer-ready": { apiVersion: ExtensionApiVersion };
  "building-selected": { building: ExtensionBuilding | null };
  "space-selected": { space: ExtensionSpace | null };
  "extension-loaded": { id: string; version: string };
};
export interface DigitalTwinExtensionContext {
  readonly extension: Readonly<{ id: string; name: string; version: string; apiVersion: string }>;
  readonly apiVersion: ExtensionApiVersion;
  readonly entities: { add: (options: Cesium.Entity.ConstructorOptions) => Cesium.Entity; addMarker: (options: ExtensionMarkerOptions) => Cesium.Entity; remove: (entity: Cesium.Entity | string) => boolean; addGeoJson: (data: object | string, options?: Cesium.GeoJsonDataSource.LoadOptions) => Promise<Cesium.DataSource> };
  readonly navigation: { flyToCoordinates: (longitude: number, latitude: number, options?: { height?: number; duration?: number }) => Promise<void>; flyToEntity: (entity: Cesium.Entity, options?: { duration?: number }) => Promise<boolean>; flyToBuilding: (building: ExtensionBuilding, options?: { height?: number; duration?: number }) => Promise<void>; flyToAsset: (assetId: number, options?: { duration?: number }) => Promise<boolean> };
  readonly buildings: { list: () => readonly ExtensionBuilding[]; findById: (id: string) => ExtensionBuilding | null; findByName: (name: string) => ExtensionBuilding | null };
  readonly spaces: { list: () => readonly ExtensionSpace[]; findByPsuSpaceId: (psuSpaceId: string) => ExtensionSpace | null; highlight: (psuSpaceId: string | null) => boolean };
  readonly ui: { addToolbarTool: (options: ToolbarToolOptions) => () => void; addToolbarToggle: (options: ToolbarToggleOptions) => () => void; addSidePanel: (options: SidePanelOptions) => { open: () => void; close: () => void; toggle: () => void; dispose: () => void }; addMapOverlay: (options: MapOverlayOptions) => { open: () => void; close: () => void; toggle: () => void; dispose: () => void } };
  readonly events: { on: <K extends keyof ExtensionPlatformEvents>(event: K, listener: (payload: ExtensionPlatformEvents[K]) => void | Promise<void>) => () => void };
  readonly api: { fetch: (path: string, init?: RequestInit) => Promise<Response> };
  readonly logger: { debug: (...args: unknown[]) => void; info: (...args: unknown[]) => void; warn: (...args: unknown[]) => void; error: (...args: unknown[]) => void };
}
export interface DigitalTwinExtension { activate(context: DigitalTwinExtensionContext): void | Promise<void>; deactivate?(): void | Promise<void> }

export type ExtensionManifest = { id: string; name: string; version: string; description: string; author?: string; projectUrl?: string; apiVersion: string; entry: string; stylesheet?: string; icon?: string; capabilities?: Array<"entities" | "buildings" | "spaces" | "ui" | "events" | "network"> };
export type ExtensionRegistryEntry = ExtensionManifest & { enabled: boolean };
