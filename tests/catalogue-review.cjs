const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const nodes=new Map();
class El{
 constructor(tag='div'){this.tagName=tag;this.dataset={};this.listeners={};this.children=[];this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.style={};this.files=[];this.options=[];this.attrs={};const set=new Set();this.classList={add:(...v)=>v.forEach(x=>set.add(x)),remove:(...v)=>v.forEach(x=>set.delete(x)),contains:x=>set.has(x),toggle:(x,b)=>{if(b??!set.has(x))set.add(x);else set.delete(x)}}}
 set innerHTML(v){this._html=v;this.children=[];for(const m of v.matchAll(/<input\b[^>]*value="([^"]*)"[^>]*>/g)){const e=new El('input');e.value=m[1];e.checked=false;this.children.push(e)}for(const m of v.matchAll(/<select data-editor-category="([^"]*)">([\s\S]*?)<\/select>/g)){const e=new El('select');e.dataset.editorCategory=m[1];e.innerHTML=m[2];this.children.push(e)}if(this.tagName==='select'){this.options=[...v.matchAll(/<option\b([^>]*)>(.*?)<\/option>/g)].map(m=>({value:m[1].match(/value="([^"]*)"/)?.[1]||'',selected:m[1].includes('selected')}));this.value=(this.options.find(o=>o.selected)||this.options[0]||{}).value||''}}
 get innerHTML(){return this._html||''}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f)} removeEventListener(n,f){this.listeners[n]=(this.listeners[n]||[]).filter(x=>x!==f)}
 fire(n,event={}){for(const f of this.listeners[n]||[])f(event);return this['on'+n]?.(event)}
 setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}removeAttribute(k){delete this.attrs[k]}
 append(...v){this.children.push(...v)}appendChild(v){this.children.push(v);return v}after(){}remove(){}focus(){}click(){}scrollIntoView(){}
 replaceChildren(...v){this.children=v;this._html=''}add(v){this.options.push(v)}
 querySelectorAll(q){if(q.includes('input'))return this.children.filter(x=>x.tagName==='input'&&(!q.includes(':checked')||x.checked));if(q.includes('select'))return this.children.filter(x=>x.tagName==='select');return []}
 querySelector(q){return null}
}
for(const m of html.matchAll(/id="([^"]+)"/g)){const e=new El();e.id=m[1];nodes.set(m[1],e)}
const form=nodes.get('form');form.elements={};for(const m of html.matchAll(/<(input|select|textarea)\b[^>]*name="([^"]+)"/g)){form.elements[m[2]]=new El(m[1])}
const doc={getElementById:id=>nodes.get(id)||null,querySelector:q=>q==='#form select[name=category]'?form.elements.category:q.startsWith('#')&&!q.includes(' ')?nodes.get(q.slice(1))||null:null,createElement:t=>new El(t),addEventListener(){},querySelectorAll:()=>[],head:new El(),body:new El()};
const storage=new Map();const ctx={document:doc,window:{open(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Option:class{constructor(text,value){this.text=text;this.value=value}},navigator:{},fetch:async()=>({ok:true,json:async()=>[]}),console,Intl,URL,Blob,AbortController,AbortSignal,Map,Set,Date,JSON,Image:class{},FormData:class{constructor(f){this.f=f}entries(){return Object.entries(this.f.elements).filter(([k,e])=>!e.disabled).map(([k,e])=>[k,e.value])[Symbol.iterator]()}},alert:()=>{},confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{},requestAnimationFrame:f=>f()};
ctx.form=form;vm.createContext(ctx);const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
vm.runInContext(script,ctx);const run=s=>vm.runInContext(s,ctx);run('WorldLocations.setCities('+fs.readFileSync(__dirname+'/../world-cities.json','utf8')+')');

const baseline=JSON.parse(require('child_process').execFileSync('git',['show','4d40353030b95ccbfa936f6ae60fefb5f6999831:experiencias_de_vida_v6_0_datos.json'],{encoding:'utf8',maxBuffer:3000000}));
const current=JSON.parse(JSON.stringify(run('data'))),audit=JSON.parse(fs.readFileSync(__dirname+'/../catalogue-review-2026-11-24.json','utf8'));
assert(html.includes('#buildingTypeLabel[hidden],#building-nav[hidden]{display:none!important}'));assert.equal(current.length,625);assert.equal(new Set(current.map(x=>x.id)).size,625);assert.equal(audit.mergedCount,23);
for(const source of baseline){const target=current.find(x=>x.id===source.id)||current.find(x=>x.mergedIds?.includes(source.id));assert(target,`Missing ${source.id}`);if(target.id!==source.id)assert(target.mergedRecords.some(x=>x.id===source.id));else for(const k of ['date','person','detail','image','imageSource'])if(source[k])assert(target[k]===source[k]||target.mergedRecords?.some(x=>x[k]===source[k]),`Preserve ${source.id}.${k}`)}
assert.equal(run(`subcategoryOf(data.find(x=>x.id===654))`),'Ciudades y paseos');
assert.equal(run(`subcategoryOf(data.find(x=>x.id===625))`),'Parques temáticos');
for(const id of [7,13,14,22,23,195,550]){assert(run(`categoriesOf(data.find(x=>x.id===${id})).includes('Deportes')`));assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Deportes')`),'Actividades acuáticas');assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Actividades y excursiones')`),'Aventura y excursiones')}
for(const id of [147,311,320,387,512,518,520])assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Actividades y excursiones')`),'Aventura y excursiones');
assert(current.some(x=>x.id===32)&&current.some(x=>x.id===701));assert(current.some(x=>x.id===489)&&current.some(x=>x.id===494));
assert.equal(run(`data.find(x=>x.id===161).name`),'Castillo de Montjuïc');assert.equal(run(`cleanTitle(data.find(x=>x.id===161))`),'Castillo de Montjuïc');
for(const id of [151,153])assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Cultura y patrimonio')`),'Museos');
assert.equal(run(`data.find(x=>x.id===124).category`),'Actividades y excursiones');
for(const id of [15,114,472,74])assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Cultura y patrimonio')`),'Estadios de fútbol');
// Third level filters both map/list predicate and cannot survive outside its parent.
run(`clearFilters();selectedCategories.add('Cultura y patrimonio');selectedSubcategories.set('Cultura y patrimonio',new Set(['Edificios históricos']));selectedBuildingTypes.add('Puentes');render()`);
assert.equal(run('buildingNav.hidden'),false);assert(run('data.filter(matchesExperience).length>0'));assert(run(`data.filter(matchesExperience).every(x=>buildingTypeOf(x)==='Puentes')`));
run(`selectedSubcategories.set('Cultura y patrimonio',new Set(['Museos']));refreshFilters()`);assert.equal(run('buildingNav.hidden'),true);assert.equal(run('selectedBuildingTypes.size'),0);
run('openEdit(258)');assert.equal(form.elements.buildingType.disabled,false);assert.equal(form.elements.buildingType.value,'Puentes');
form.elements.subcategory.value='Museos';form.elements.subcategory.fire('change');assert.equal(form.elements.buildingType.disabled,true);assert.equal(nodes.get('buildingTypeLabel').hidden,true);
run('openEdit(153)');assert.equal(form.elements.buildingType.disabled,true);assert.equal(nodes.get('buildingTypeLabel').hidden,true);assert.equal(form.elements.buildingType.value,'');
const local=[{id:30,name:'Visita al Kremlin de Moscú',category:'Cultura y patrimonio',subcategory:'Palacios y castillos',person:'Ana',date:'2014-10'},{id:572,name:'Kremlin de Moscú',category:'Cultura y patrimonio',subcategory:'Palacios y castillos',person:'Ana',date:'2018-03'}];ctx.local=local;assert.equal(run('refineCatalogue(local).length'),2);
local[1].date='2014-10';local[0].image='data:image/jpeg;base64,personal';local[1].detail='Mi nota';const merged=run('refineCatalogue(local)');assert.equal(merged.length,1);assert.equal(merged[0].image,'data:image/jpeg;base64,personal');assert.equal(merged[0].detail,'Mi nota');assert.equal(merged[0].mergedRecords[0].id,572);
const once=JSON.stringify(merged);ctx.merged=merged;assert.equal(JSON.stringify(run('refineCatalogue(merged)')),once);
assert.equal(run(`refineCatalogue([{id:572,name:'Kremlin de Moscú',category:'Cultura y patrimonio'}]).length`),1);
console.log('PASS: eight requested changes, 23 duplicate merges, distinct visits and local edits preserved, exclusive third-level filter/editor and idempotent migration');
