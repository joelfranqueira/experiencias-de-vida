const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const nodes=new Map();
class El{
 constructor(tag='div'){this.tagName=tag;this.dataset={};this.listeners={};this.children=[];this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.style={};this.files=[];this.options=[];this.attrs={};const set=new Set();this.classList={add:(...v)=>v.forEach(x=>set.add(x)),remove:(...v)=>v.forEach(x=>set.delete(x)),contains:x=>set.has(x),toggle:(x,b)=>{if(b??!set.has(x))set.add(x);else set.delete(x)}}}
 set innerHTML(v){this._html=v;this.children=[];for(const m of v.matchAll(/<input\b[^>]*value="([^"]*)"[^>]*>/g)){const e=new El('input');e.value=m[1];e.checked=false;this.children.push(e)}for(const m of v.matchAll(/<select([^>]*)>([\s\S]*?)<\/select>/g)){const e=new El('select');for(const a of m[1].matchAll(/data-([a-z-]+)="([^"]*)"/g)){const key=a[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());e.dataset[key]=a[2]}e.innerHTML=m[2];this.children.push(e)}if(this.tagName==='select'){this.options=[...v.matchAll(/<option\b([^>]*)>(.*?)<\/option>/g)].map(m=>({value:m[1].match(/value="([^"]*)"/)?.[1]||'',selected:m[1].includes('selected')}));this.value=(this.options.find(o=>o.selected)||this.options[0]||{}).value||''}}
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

assert.equal(run('data.length'),620);
assert(!run(`cats.includes('Museos')||cats.includes('Monumentos')`));
assert(run(`cats.includes('Cultura y patrimonio')`));
assert(run(`data.every(x=>!categoriesOf(x).some(c=>['Museos','Monumentos'].includes(c)))`));
assert(run(`data.every(x=>x.category!=='Actividades y excursiones'||subcategoryOf(x)!=='Cultura y patrimonio')`));
for(const id of [59,143])assert.equal(run(`subcategoryOf(data.find(x=>x.id===${id}))`),'Parques temáticos');
assert.equal(run(`subcategoryOf(data.find(x=>x.id===64))`),'Bienestar y relax');
for(const id of [242,256,325,394,522,568])assert.equal(run(`subcategoryOf(data.find(x=>x.id===${id}))`),'Plazas y parques');
for(const id of [18,517,527])assert.equal(run(`data.find(x=>x.id===${id}).category`),'Actividades y excursiones');
run(`clearFilters();selectedCategories.add('Cultura y patrimonio');selectedSubcategories.set('Cultura y patrimonio',new Set(['Museos']));render()`);
assert(run(`data.filter(matchesExperience).length>0`));assert(run(`data.filter(matchesExperience).every(x=>subcategoryFor(x,'Cultura y patrimonio')==='Museos')`));
const fixtures=[{id:9000,name:'Museo personal',category:'Museos',subcategory:'Museos y casas museo',person:'Ana',detail:'Mi nota',image:'data:image/jpeg;base64,personal',subcategories:{Museos:'Museos y casas museo'},categories:['Museos','Viajes']},{id:9001,name:'Torre Eiffel',category:'Actividades y excursiones',subcategory:'Cultura y patrimonio'},{id:9002,name:'Disneyland París',category:'Actividades y excursiones',subcategory:'Ciudades y paseos'}];
ctx.fixtures=fixtures;run('migrateTaxonomy(fixtures)');assert.equal(fixtures[0].category,'Cultura y patrimonio');assert.equal(fixtures[0].subcategory,'Museos');assert.equal(fixtures[0].person,'Ana');assert.equal(fixtures[0].image,'data:image/jpeg;base64,personal');assert(fixtures[0].categories.includes('Viajes'));
const once=JSON.stringify(fixtures);run('migrateTaxonomy(fixtures)');assert.equal(JSON.stringify(fixtures),once);
assert.equal(run(`basicDraftFromStory('Visité un museo en Tokio').category`),'Cultura y patrimonio');
assert.equal(run(`basicDraftFromStory('Visité un museo en Tokio').subcategory`),'Museos');
console.log('PASS: taxonomy, legacy local migration, idempotency, filters, parks and all personal fields preserved for 620 records');
