function harness(initialStorage){
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
const storage=new Map(initialStorage||[]);const ctx={document:doc,window:{open(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Option:class{constructor(text,value){this.text=text;this.value=value}},navigator:{},fetch:async()=>({ok:true,json:async()=>[]}),console,Intl,URL,Blob,AbortController,AbortSignal,Map,Set,Date,JSON,Image:class{},FormData:class{constructor(f){this.f=f}entries(){return Object.entries(this.f.elements).filter(([k,e])=>!e.disabled).map(([k,e])=>[k,e.value])[Symbol.iterator]()}},alert:()=>{},confirm:()=>true,setTimeout:()=>0,clearTimeout:()=>{},requestAnimationFrame:f=>f()};
ctx.form=form;vm.createContext(ctx);const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
vm.runInContext(script,ctx);const run=s=>vm.runInContext(s,ctx);run('WorldLocations.setCities('+fs.readFileSync(__dirname+'/../world-cities.json','utf8')+')');

return{run,form,nodes,ctx,storage};}
const assert=require("node:assert/strict"),fs=require("node:fs"),crypto=require("node:crypto");const a=harness();const{run,form,nodes,ctx,storage}=a;
const audit=JSON.parse(fs.readFileSync(__dirname+'/../catalogue-import-2026-11-24.json'));
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const records=JSON.parse(JSON.stringify(run('data')));assert.equal(records.length,620);assert.equal(new Set(records.map(x=>x.id)).size,620);assert.equal(audit.edited.length,50);assert.equal(audit.deleted.length,5);
for(const expected of audit.expected){const x={...JSON.parse(JSON.stringify(run('SEED'))).find(x=>x.id===expected.id)};delete x.thirdLevels;assert.equal(crypto.createHash('sha256').update(JSON.stringify(stable(x))).digest('hex'),expected.inputHash,`Changed uploaded field: ${expected.id}`)}
for(const id of [63,556,603,629,662])assert(!records.some(x=>x.id===id));
for(const id of [15,472])assert.equal(run(`subcategoryFor(data.find(x=>x.id===${id}),'Cultura y patrimonio')`),'Museos');assert.equal(run(`data.find(x=>x.id===707).person`),'Ana Laura y Sebastian');assert(run(`data.find(x=>x.id===716).image.startsWith('data:image/jpeg;base64,')`));
let routes=0;for(const[c,subs]of Object.entries(JSON.parse(JSON.stringify(run('SUBCATEGORIES')))))for(const[s]of subs){assert(run(`Array.isArray(thirdOptions(${JSON.stringify(c)},${JSON.stringify(s)}))`));routes++}assert.equal(routes,55);
assert(!run(`thirdOptions('Cultura y patrimonio','Museos').includes('Puentes')`));assert(!run(`thirdOptions('Gastronomía','Bares y coctelerías').includes('Heladerías')`));
run(`clearFilters();selectedCategories.add('Actividades y excursiones');selectedSubcategories.set('Actividades y excursiones',new Set(['Aventura y excursiones']));selectedThirdLevels.set(thirdPath('Actividades y excursiones','Aventura y excursiones'),new Set(['Kayak y canotaje']));render()`);assert(run(`data.filter(matchesExperience).length>0`));assert(run(`data.filter(matchesExperience).every(x=>thirdLevelOf(x,'Actividades y excursiones','Aventura y excursiones')==='Kayak y canotaje')`));
run(`selectedSubcategories.set('Actividades y excursiones',new Set(['Playas y mar']));refreshFilters()`);assert.equal(run('selectedThirdLevels.size'),0);
run('openEdit(14)');assert(run(`thirdLevelFields.innerHTML.includes('Aventura y excursiones')`));assert(run(`thirdLevelFields.innerHTML.includes('Actividades acuáticas')`));
run('openEdit(440)');let field=run(`thirdLevelFields.querySelectorAll('select[data-third-category]')[0]`);assert(field.options.some(x=>x.value==='Chocolaterías'));assert(!field.options.some(x=>x.value==='Heladerías'));field.value='Chocolaterías';run('captureThirdLevelFields()');form.onsubmit({preventDefault(){},target:form});assert.equal(run(`data.find(x=>x.id===440).thirdLevels.Gastronomía['Cafés y meriendas']`),'Chocolaterías');
const b=harness([...storage]);assert.equal(b.run(`data.find(x=>x.id===440).thirdLevels.Gastronomía['Cafés y meriendas']`),'Chocolaterías');b.run('openEdit(440)');b.form.elements.subcategory.value='Heladerías';b.form.elements.subcategory.fire('change');assert.equal(b.run('thirdLevelFields.hidden'),true);b.form.onsubmit({preventDefault(){},target:b.form});assert.equal(b.run(`data.find(x=>x.id===440).thirdLevels.Gastronomía`),undefined);
run('openEdit(258)');assert.equal(form.elements.buildingType.disabled,false);form.elements.subcategory.value='Museos';form.elements.subcategory.fire('change');assert.equal(form.elements.buildingType.disabled,true);assert(run(`thirdLevelFields.innerHTML.includes('Museos de arquitectura')`));assert(!run(`thirdLevelFields.innerHTML.includes('Puentes')`));run('openEdit(153)');assert.equal(form.elements.cuisine.disabled,true);assert.equal(nodes.get('cuisineLabel').hidden,true);
console.log('PASS: exact 620 uploaded records, 50 edits/5 deletions/photo, 55 scoped subcategories with requested type exclusions, independent multi-category values, persistence/reload and no branch leakage');
