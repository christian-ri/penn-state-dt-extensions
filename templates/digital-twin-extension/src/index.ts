import type { DigitalTwinExtension } from '@penn-state-dt/extension-sdk';
import './style.css';
const extension: DigitalTwinExtension = {
  activate(context) {
    const panel = context.ui.addSidePanel({id:'details',title:'My Extension',render(container) {
      const note=document.createElement('p'); note.textContent='Synthetic example marker'; container.append(note);
    }});
    const marker=context.entities.addMarker({id:'demo',name:'Demo',longitude:-77.86,latitude:40.8});
    marker.show=false;
    context.ui.addToolbarToggle({id:'demo',label:'My Extension',onChange(active){marker.show=active;active?panel.open():panel.close();}});
    context.events.on('viewer-ready',()=>context.logger.info('Ready'));
  }
};
export default extension;
