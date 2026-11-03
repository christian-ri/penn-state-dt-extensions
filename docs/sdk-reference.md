# SDK reference — stable API v1

The authoritative signatures are in [the SDK declarations](../packages/extension-sdk/index.d.ts). Do not import internal Core modules. The package exports actual runtime EXTENSION_API_VERSION = "1" and all public types.

```ts
import type { DigitalTwinExtension, ExtensionMarkerOptions } from '@penn-state-dt/extension-sdk';
const extension: DigitalTwinExtension = {
  activate(context) {
    const marker = context.entities.addMarker({id:'demo',name:'Demo',longitude:-77.86,latitude:40.8});
    marker.show = false;
    context.ui.addToolbarToggle({id:'demo',label:'Demo',onChange(active){marker.show=active;}});
  }
};
export default extension;
```

## Lifecycle

The default export implements activate(context): void | Promise<void> and optional deactivate(): void | Promise<void>. An extension becomes active after activation completes. Core-owned cleanup removes SDK resources after deactivation and failed activation. Manage your own timers, AbortControllers, direct DOM listeners and external resources in deactivate. Do not await viewer-ready inside activate: the Core emits it after extension loading completes.

Toolbar Off hides an experience; it does not unload its JavaScript. Registry disable affects new loads; existing browser sessions must refresh. A service restart follows current maintainer operations, but is not equivalent to revoking already running JavaScript.

## SDK surface

| Area | Methods and behavior |
| --- | --- |
| entities | add(Cesium.Entity.ConstructorOptions), addMarker(options), remove(entityOrId), addGeoJson(data, options). Owned resources are removed on deactivation. Marker surface defaults to 3d-tiles; terrain and ellipsoid are alternatives. |
| navigation | flyToCoordinates, flyToEntity, flyToBuilding, flyToAsset. Asset navigation requires an already loaded Core asset. Do not assume coordinate flight promises represent completed animation. |
| buildings | list, findById, findByName. Summary records, possibly empty or stale. |
| spaces | list, findByPsuSpaceId, highlight. Space properties and IDs may be absent. No automatic data-readiness subscription. |
| ui | addToolbarTool, addToolbarToggle, addSidePanel, addMapOverlay. Panel/overlay handles support open, close, toggle, dispose. |
| events | on returns unsubscribe; viewer-ready, building-selected, space-selected, extension-loaded. Handler failures are isolated. |
| api | fetch(path, init) makes same-origin credentialed requests. api/... addresses a Core API; another relative path addresses the extension namespace. No backend is automatically provisioned. |
| logger | debug, info, warn, error; namespaced in Core. |

Panels and overlays render only inside the provided container. Shell className must start with extension-. Overlays support top-left, top-right, bottom-left and bottom-right. Do not query or restyle Core DOM. Core tool selection hides extension presentations and calls active toggles with false; restore a fully hidden state there.

No raw viewer, Core state, cookies or server environment is exposed by the contract. Browser capability remains broader than the contract: see [security](security.md).
