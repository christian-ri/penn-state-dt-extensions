import { Entity, EntityCollection, CustomDataSource, Cartesian3 } from 'cesium';
import type { DigitalTwinExtension, DigitalTwinExtensionContext, ExtensionManifest, ExtensionPlatformEvents, ExtensionBuilding, ExtensionSpace } from '@penn-state-dt/extension-sdk';
export type SandboxOptions = {
  buildings?: ExtensionBuilding[];
  spaces?: ExtensionSpace[];
  responses?: Record<string, {status?: number; body: unknown}>;
};
export function createSandbox(manifest: ExtensionManifest, host: HTMLElement, options: SandboxOptions = {}) {
  const document=host.ownerDocument;
  const root=document.createElement('section'); host.append(root);
  const toolbar=document.createElement('nav'), panels=document.createElement('div'), overlays=document.createElement('div');
  toolbar.setAttribute('aria-label','Extension toolbar'); root.append(toolbar,panels,overlays);
  const entities=new EntityCollection(), sources=new Set<CustomDataSource>();
  const calls: Array<{method:string;args:unknown[]}>=[];
  const listeners=new Map<string,Set<(payload:never)=>void|Promise<void>>>();
  const disposers:Array<()=>void>=[];
  const toggles:Array<()=>Promise<void>>=[];
  let closed=false, instance:DigitalTwinExtension|undefined;
  const buildings=options.buildings??[{id:'demo-building',osmId:'synthetic-1',name:'Demo Building',longitude:-77.86,latitude:40.8}];
  const spaces=options.spaces??[{id:'demo-space',psuSpaceId:'DEMO-101',name:'Demo Room',longName:'Synthetic demonstration room',properties:{synthetic:true}}];
  const log=(method:string,...args:unknown[])=>{calls.push({method,args});};
  const ensureOpen=()=>{if(closed)throw Error('Extension context is deactivated.');};
  const safe=async(action:()=>void|Promise<void>)=>{try{await action();}catch(error){log('error',String(error));}};
  function presentation(kind:'panel'|'overlay', settings:{id:string;title:string;className?:string;placement?:string;render:(container:HTMLElement)=>void|(()=>void)}) {
    ensureOpen();
    if(settings.className && !/^extension-[a-z0-9-]+$/i.test(settings.className))throw Error('className must begin with extension-.');
    const element=document.createElement('section'); element.hidden=true; element.dataset.kind=kind; element.dataset.id=settings.id;
    element.className=settings.className??'';
    if(settings.placement)element.dataset.placement=settings.placement;
    const title=document.createElement('h2');title.textContent=settings.title;
    const body=document.createElement('div'); element.append(title,body); (kind==='panel'?panels:overlays).append(element);
    // Register cleanup before calling user code, including failing render callbacks.
    disposers.push(()=>element.remove());
    const cleanup=settings.render(body); if(cleanup)disposers.push(cleanup);
    const handle={open(){ensureOpen();element.hidden=false;},close(){element.hidden=true;},toggle(){ensureOpen();element.hidden=!element.hidden;},dispose(){element.remove();}};
    return handle;
  }
  const context:DigitalTwinExtensionContext={
    extension:manifest,apiVersion:'1',
    entities:{
      add(settings){ensureOpen();return entities.add(settings);},
      addMarker(settings){ensureOpen();return entities.add({id:`extension:${manifest.id}:${settings.id}`,name:settings.name,position:Cartesian3.fromDegrees(settings.longitude,settings.latitude,settings.height??0),properties:settings.properties});},
      remove(entity){ensureOpen();const found=typeof entity==='string'?entities.getById(entity):entity;return found?entities.remove(found):false;},
      async addGeoJson(data,loadOptions){
        ensureOpen();log('entities.addGeoJson',data,loadOptions);
        // Data model simulation only: no network, projection, styling or geometry rendering.
        if(typeof data==='string')throw Error('Sandbox GeoJSON requires an inline FeatureCollection; URL loading requires Core integration.');
        const collection=data as {type?:string;features?:Array<{id?:string|number;properties?:Record<string,unknown>}>};
        if(collection.type!=='FeatureCollection'||!Array.isArray(collection.features))throw Error('Expected GeoJSON FeatureCollection.');
        const source=new CustomDataSource('sandbox-geojson');
        for(const [index,feature] of collection.features.entries())source.entities.add({id:String(feature.id??index),properties:feature.properties});
        await Promise.resolve();
        if(closed){source.entities.removeAll();throw Error('Extension deactivated during GeoJSON loading.');}
        sources.add(source);return source;
      }
    },
    navigation:{
      async flyToCoordinates(...args){ensureOpen();log('navigation.flyToCoordinates',...args);},
      async flyToBuilding(...args){ensureOpen();log('navigation.flyToBuilding',...args);},
      async flyToEntity(...args){ensureOpen();log('navigation.flyToEntity',...args);return entities.contains(args[0]);},
      async flyToAsset(...args){ensureOpen();log('navigation.flyToAsset',...args);throw Error('No campus assets in sandbox. Use coordinate fallback.');}
    },
    buildings:{list:()=>buildings,findById:id=>buildings.find(b=>b.id===id||b.osmId===id)??null,findByName:name=>buildings.find(b=>b.name.localeCompare(name,undefined,{sensitivity:'accent'})===0)??null},
    spaces:{list:()=>spaces,findByPsuSpaceId:id=>spaces.find(s=>s.psuSpaceId===id)??null,highlight(id){ensureOpen();log('spaces.highlight',id);return id===null||spaces.some(s=>s.psuSpaceId===id);}},
    ui:{
      addToolbarTool(settings){ensureOpen();const button=document.createElement('button');button.textContent=settings.label;button.title=settings.title??'';button.onclick=()=>{void safe(settings.onClick);};toolbar.append(button);const dispose=()=>button.remove();disposers.push(dispose);return dispose;},
      addToolbarToggle(settings){
        ensureOpen();let active=settings.initiallyActive??false;
        const button=document.createElement('button');button.textContent=settings.label;button.setAttribute('aria-pressed',String(active));
        let queue=Promise.resolve();
        const change=(value:boolean)=>{queue=queue.then(async()=>{if(closed)return;active=value;button.setAttribute('aria-pressed',String(active));await safe(()=>settings.onChange(active));});return queue;};
        button.onclick=()=>{void change(!active);};toolbar.append(button);toggles.push(()=>change(false));
        const dispose=()=>button.remove();disposers.push(dispose);return dispose;
      },
      addSidePanel:settings=>presentation('panel',settings),
      addMapOverlay:settings=>presentation('overlay',settings)
    },
    events:{on(event,listener){ensureOpen();const set=listeners.get(event)??new Set();const fn=listener as (payload:never)=>void|Promise<void>;set.add(fn);listeners.set(event,set);const off=()=>{set.delete(fn);};disposers.push(off);return off;}},
    api:{async fetch(requestPath,init){
      ensureOpen();
      if(!requestPath||requestPath.startsWith('/')||/[\\:]|\.\./.test(requestPath))throw Error('Use a same-origin relative API path.');
      if(init?.signal?.aborted)throw new DOMException('Aborted','AbortError');
      log('api.fetch',requestPath,init);
      const fixture=options.responses?.[requestPath];
      return new Response(JSON.stringify(fixture?.body??{error:'No sandbox response configured'}),{status:fixture?.status??404,headers:{'Content-Type':'application/json'}});
    }},
    logger:{debug:(...args)=>log('debug',...args),info:(...args)=>log('info',...args),warn:(...args)=>log('warn',...args),error:(...args)=>log('error',...args)}
  };
  async function emit<K extends keyof ExtensionPlatformEvents>(event:K,payload:ExtensionPlatformEvents[K]) {
    ensureOpen();for(const fn of listeners.get(event)??[])await safe(()=>fn(payload as never));
  }
  async function deactivate(){
    if(closed)return;closed=true;
    if(instance)await safe(()=>instance!.deactivate?.());
    for(const dispose of disposers.reverse())await safe(dispose);
    listeners.clear();entities.removeAll();for(const source of sources)source.entities.removeAll();sources.clear();root.remove();
  }
  return {context,entities,sources,calls,emit,deactivate,root,
    async activate(extension:DigitalTwinExtension){
      ensureOpen();if(instance)throw Error('Already activated.');instance=extension;
      try{await extension.activate(context);await this.hidePresentations();await emit('extension-loaded',{id:manifest.id,version:manifest.version});await emit('viewer-ready',{apiVersion:'1'});}
      catch(error){await deactivate();throw error;}
    },
    async hidePresentations(){ensureOpen();for(const off of toggles)await off();for(const element of root.querySelectorAll<HTMLElement>('[data-kind]'))element.hidden=true;}
  };
}
export async function mountSandbox(extension:DigitalTwinExtension,manifest:ExtensionManifest,host:HTMLElement){
  const document=host.ownerDocument;
  const heading=document.createElement('h1');heading.textContent='Extension development sandbox';
  const notice=document.createElement('p');notice.textContent='Synthetic data. Navigation is recorded; there is no 3D viewer, authentication or real backend. Core integration requires maintainer review.';
  const controls=document.createElement('div'),stage=document.createElement('div'),output=document.createElement('pre');
  host.append(heading,notice,controls,stage,output);
  let sandbox:ReturnType<typeof createSandbox>|undefined;
  const refresh=()=>{output.textContent=JSON.stringify(sandbox?.calls??[],null,2);};
  for(const [label,action] of [
    ['Activate',async()=>{await sandbox?.deactivate();sandbox=createSandbox(manifest,stage);await sandbox.activate(extension);}],
    ['Deactivate',async()=>{await sandbox?.deactivate();}],
    ['Core tool selected',async()=>{await sandbox?.hidePresentations();}],
    ['Select building',async()=>{if(sandbox)await sandbox.emit('building-selected',{building:sandbox.context.buildings.list()[0]??null});}],
    ['Select space',async()=>{if(sandbox)await sandbox.emit('space-selected',{space:sandbox.context.spaces.list()[0]??null});}],
    ['Show recorded calls',async()=>{}]
  ] as const){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{void action().then(refresh).catch(error=>{output.textContent=String(error);});};controls.append(button);}
  sandbox=createSandbox(manifest,stage);await sandbox.activate(extension);refresh();
  return {deactivate:()=>sandbox?.deactivate()};
}
