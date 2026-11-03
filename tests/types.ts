import { EXTENSION_API_VERSION } from '@penn-state-dt/extension-sdk';
import type { DigitalTwinExtension, ExtensionMarkerOptions, ToolbarToggleOptions, SidePanelOptions, MapOverlayOptions } from '@penn-state-dt/extension-sdk';
const version:'1'=EXTENSION_API_VERSION;
const marker:ExtensionMarkerOptions={id:'typed',name:'Typed',longitude:0,latitude:0};
const toggle:ToolbarToggleOptions={id:'toggle',label:'Toggle',onChange(){}};
const panel:SidePanelOptions={id:'panel',title:'Panel',render(){}};
const overlay:MapOverlayOptions={...panel,placement:'top-right'};
export const extension:DigitalTwinExtension={activate(context){const entity=context.entities.addMarker(marker);entity.show=false;context.entities.remove(entity);context.ui.addToolbarToggle(toggle);context.ui.addSidePanel(panel);context.ui.addMapOverlay(overlay);context.logger.info(version);
// @ts-expect-error raw Core viewer is intentionally absent
context.viewer;
// @ts-expect-error coordinates must be numeric
context.entities.addMarker({...marker,longitude:'invalid'});
}};
