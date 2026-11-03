import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createSandbox} from '../packages/extension-sandbox/dist/index.js';
const manifest={id:'test-extension',name:'Test',description:'Synthetic',version:'1.0.0',apiVersion:'1',entry:'index.js'};
function setup(options){const dom=new JSDOM('<main></main>');return {dom,host:dom.window.document.querySelector('main'),sandbox:createSandbox(manifest,dom.window.document.querySelector('main'),options)};}
test('UI, event isolation, synthetic data, navigation and cleanup',async()=>{
  const {sandbox:s,host,dom}=setup();let changes=[],events=0,cleanups=0;
  await s.activate({activate(c){
    const marker=c.entities.addMarker({id:'demo',name:'Demo',longitude:0,latitude:0});marker.show=false;
    const panel=c.ui.addSidePanel({id:'panel',title:'Panel',className:'extension-test',render(){return()=>cleanups++;}});
    for(const placement of ['top-left','top-right','bottom-left','bottom-right'])c.ui.addMapOverlay({id:placement,title:placement,placement,render(){}});
    c.ui.addToolbarToggle({id:'toggle',label:'Toggle',onChange(active){changes.push(active);marker.show=active;active?panel.open():panel.close();}});
    c.events.on('building-selected',()=>{throw Error('expected');});c.events.on('building-selected',()=>{events++;});
  },deactivate(){throw Error('cleanup still runs');}});
  host.querySelector('button').click();await new Promise(r=>setTimeout(r,0));assert.equal(s.entities.values[0].show,true);
  await s.hidePresentations();assert.equal(s.entities.values[0].show,false);assert.equal(host.querySelector('[data-kind=panel]').hidden,true);
  await s.emit('building-selected',{building:null});assert.equal(events,1);assert.ok(s.calls.some(c=>c.method==='error'));
  assert.equal(s.context.buildings.findByName('demo building').id,'demo-building');assert.equal(s.context.spaces.findByPsuSpaceId('absent'),null);assert.equal(s.context.spaces.highlight(null),true);
  await s.context.navigation.flyToCoordinates(0,0);await assert.rejects(s.context.navigation.flyToAsset(1));
  await s.context.entities.addGeoJson({type:'FeatureCollection',features:[{type:'Feature',properties:{synthetic:true},geometry:null}]});assert.equal(s.sources.size,1);
  await s.deactivate();await s.deactivate();assert.equal(s.entities.values.length,0);assert.equal(s.sources.size,0);assert.equal(host.children.length,0);assert.equal(cleanups,1);
  assert.throws(()=>s.context.entities.add({id:'late'}),/deactivated/);dom.window.close();
});
test('failed activation cleans resources, including failed renderer',async()=>{
  const {sandbox:s,host,dom}=setup();
  await assert.rejects(s.activate({activate(c){c.entities.add({id:'created'});c.ui.addSidePanel({id:'broken',title:'Broken',render(){throw Error('render failed');}});}}),/render failed/);
  assert.equal(host.children.length,0);assert.equal(s.entities.values.length,0);dom.window.close();
});
test('fetch fixtures never use the network and honor aborts',async()=>{
  const {sandbox:s,dom}=setup({responses:{'api/demo':{status:200,body:{ok:true}}}});
  assert.deepEqual(await (await s.context.api.fetch('api/demo')).json(),{ok:true});
  assert.equal((await s.context.api.fetch('missing')).status,404);
  await assert.rejects(s.context.api.fetch('https://example.test'));
  const controller=new AbortController();controller.abort();await assert.rejects(s.context.api.fetch('api/demo',{signal:controller.signal}),/Aborted/);
  await s.deactivate();dom.window.close();
});
test('unsubscribe and late GeoJSON completion',async()=>{
  const {sandbox:s,dom}=setup();let count=0;const off=s.context.events.on('space-selected',()=>{count++;});off();await s.emit('space-selected',{space:null});assert.equal(count,0);
  const pending=s.context.entities.addGeoJson({type:'FeatureCollection',features:[]});await s.deactivate();await assert.rejects(pending,/deactivated/);assert.equal(s.sources.size,0);dom.window.close();
});
