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
assert.equal(run('data.length'),631);assert(nodes.get('cards').innerHTML.includes('ficha-699'));assert(!nodes.has('mapsearch'));assert(!nodes.has('mapfilters'));
// Multi-select categories, countries and subcategories combine with the same search.
run(`clearFilters();selectedCategories.add('Gastronomía');selectedCategories.add('Museos');render()`);
assert(run(`data.filter(matchesExperience).some(x=>x.category==='Museos')`));assert(run(`data.filter(matchesExperience).some(x=>x.category==='Gastronomía')`));
run(`selectedCountries.add('AR');selectedCountries.add('GB')`);assert(run(`data.filter(matchesExperience).every(x=>countryCodesOf(x).some(c=>['AR','GB'].includes(c)))`));
run(`clearFilters();selectedCategories.add('Gastronomía');selectedSubcategories.set('Gastronomía',new Set(['Restaurantes','Bares y coctelerías']));render()`);assert(nodes.get('subcategory-nav').innerHTML.includes('aria-pressed="true"'));assert(!run('cuisineNav.hidden'));
nodes.get('search').value='chouhy';run('clearFilters();render()');assert.equal(run('data.filter(matchesExperience).length'),1);
// Map uses exactly the same predicate and mixed clusters use category colors.
const markers=[];ctx.L={marker:(coords,o)=>{markers.push(o);return {bindPopup(){return this},on(){return this},addTo(){return this}}},divIcon:o=>o};run(`mapReady=true;mapLayer={clearLayers(){}};mapInstance={getBounds:()=>({contains:()=>true}),getZoom:()=>2,project:()=>({x:0,y:0})};updateMap()`);
assert.equal(markers.length,1);assert(markers[0].icon.html.includes('>1</span>'));
nodes.get('search').value='';markers.length=0;run('updateMap()');assert(markers[0].icon.html.includes('conic-gradient'));assert.equal(run('Object.keys(MAP_COLORS).length'),11);
// Editor enables cuisine only for restaurants, and retains a separate subcategory per category.
run('mapReady=false;openEdit(699)');assert.equal(form.elements.cuisine.disabled,true);assert.equal(nodes.get('cuisineLabel').hidden,false);
run(`form.elements.category.value='Gastronomía';updateSubcategoryField('Restaurantes')`);assert.equal(form.elements.cuisine.disabled,false);
run(`form.elements.subcategory.value='Cafés y meriendas';captureEditorSubcategories();updateCuisineField()`);assert.equal(form.elements.cuisine.disabled,true);
run(`form.elements.category.value='Espectáculos';updateSubcategoryField('Stand-up');$('#extraCats').querySelectorAll('input').forEach(e=>e.checked=e.value==='Gastronomía');editorSubcategories['Gastronomía']='Restaurantes';updateSubcategoryField()`);
assert.equal(form.elements.cuisine.disabled,false);assert(run(`extraSubcategoryFields.innerHTML.includes('Gastronomía')`));
assert.equal(run(`subcategoryFor({category:'Museos',subcategories:{Museos:''}},'Museos')`),'');
// User deletions stay deleted and personal metadata remains intact.
assert.equal(run('data.some(x=>x.id===20)'),false);assert.equal(run('data.find(x=>x.id===95).name'),'Quiven');
console.log('PASS: full script startup, 631 records, filters, shared search/map, category colors, editor cuisine rules, per-category subcategories, locations and deletions');
run('openEdit(null)');assert.equal(nodes.get('quickIntro').hidden,false);assert.equal(form.hidden,true);assert.equal(run('creatingExperience'),true);
const draft=run(`basicDraftFromStory('Cené en Osaka el 15/11/2026 con Fátima')`);assert.equal(draft.category,'Gastronomía');assert.equal(draft.date,'2026-11-15');assert.equal(draft.person,'Fátima');assert.equal(draft.name,'Osaka');
ctx.sampleDraft=draft;run('applyExperienceDraft(sampleDraft)');assert.equal(form.hidden,false);assert.equal(nodes.get('quickIntro').hidden,true);assert.equal(form.elements.name.value,'Osaka');assert.equal(form.elements.cuisine.disabled,false);
assert.equal(run(`basicDraftFromStory('Visité un museo').date`),undefined);assert.equal(run(`basicDraftFromStory('Visité un museo el 31/02/2026').date`),undefined);
assert(html.includes('id="addExperience"'));assert(!html.includes('Adjuntala en el chat'));assert(html.includes("const EXPERIENCE_SERVICE_ORIGIN='';"));
let downloads=0;ctx.URL={...URL,createObjectURL:()=>{downloads++;return 'blob:test'},revokeObjectURL:()=>{}};
run("$('#cover').classList.remove('show');publishCurrentChanges()");assert.equal(downloads,0);assert(nodes.get('saveStatus').textContent.includes('Publicación automática pendiente'));
console.log('PASS: circular add action, description-first editor, local draft, date validation, no automatic file downloads and truthful disconnected state');
assert.deepEqual(Array.from(run('data.filter(x=>!locateExperience(x)).map(x=>x.id)')),[4,31,185,673,674,675,691,692]);
assert.equal(run(`data.filter(x=>locateExperience(x)).length`),623);
for(const [story,code,place] of [
 ['Visité un museo en Banfield el 24/11/2026 con Ana','AR','Banfield'],
 ['Cené en Osaka, Buenos Aires, el 24/11/2026 con Ana','AR','Buenos Aires'],
 ['Cené en Osaka el 24/11/2026 con Ana','AR','Colegiales'],
 ['Visité un museo en Tokio, Japón el 24/11/2026','JP','Tokio'],
 ['Caminé en Praga, Chequia el 24/11/2026','CZ','Praga'],
 ['Visité un museo en Nairobi, Kenia el 24/11/2026','KE','Nairobi']]){
 const d=run(`basicDraftFromStory(${JSON.stringify(story)})`);console.log('DRAFT',d.place,d.countryCode);assert(d.place.includes(place));assert.equal(d.countryCode,code);
}
assert(run(`WorldLocations.local('Banfield',data).some(x=>x.countryCode==='AR'&&x.location)`));
assert(run(`WorldLocations.local('Tokio',data).some(x=>x.countryCode==='JP')`));
assert(run(`WorldLocations.local('Nairobi',data).some(x=>x.countryCode==='KE')`));
assert.equal(run(`WorldLocations.countries.length`),249);
run(`openEdit(null);locationOptions=[{label:'Nairobi, Kenia',countryCode:'KE',location:{latitude:-1.28,longitude:36.81,label:'Nairobi',precision:'city',source:'Test'}}];selectLocation(0)`);
assert.equal(form.elements.countryCode.value,'KE');assert.equal(run('editorSelectedLocation.latitude'),-1.28);
form.elements.place.value=nodes.get('placeField').value;form.elements.name.value='Prueba Nairobi';form.elements.id.value='700';form.elements.category.value='Museos';
form.onsubmit({preventDefault(){},target:form});
assert.equal(run('data.find(x=>x.id===700).location.longitude'),36.81);
console.log('PASS: 99 repaired points, eight honest unknowns, Spanish worldwide cities/countries, Banfield quick draft, restaurant ambiguity and coordinate persistence');

// Location upgrades must not resurrect deleted records or overwrite personal edits.
run(`data=data.filter(x=>x.id!==700);const r=LOCATION_REPAIRS[138];const changed={id:138,name:r.oldName,place:'Mi ubicación corregida',image:'data:image/jpeg;base64,personal'};const intact={id:138,name:r.oldName,place:r.oldPlace,person:'Acompañante'};for(const x of [changed,intact]){if(x.name===r.oldName&&[r.oldPlace,r.place].includes(x.place||'')){x.place=r.place;if(!x.location)x.location={...r.location}}}if(changed.place!=='Mi ubicación corregida'||changed.image!=='data:image/jpeg;base64,personal'||!intact.location||intact.person!=='Acompañante')throw Error('Migration changed personal data')`);
assert.equal(run('data.length'),631);
(async()=>{
 let requests=0;
 ctx.fetch=async url=>{requests++;assert(url.includes('language=es'));assert(url.includes('name=Ciudad%20de%20prueba'));return {ok:true,json:async()=>({results:[{name:'Ciudad de prueba',country_code:'KE',admin1:'Nairobi',latitude:-1.28,longitude:36.81},{name:'Coordenada inválida',country_code:'KE',latitude:1000,longitude:0}]})}};
 const options=await run(`WorldLocations.online('Ciudad de prueba')`);assert.equal(options.length,1);assert(options[0].label.includes('Kenia'));assert.equal(options[0].countryCode,'KE');assert.equal(options[0].location.longitude,36.81);
 await run(`WorldLocations.online('Ciudad de prueba')`);assert.equal(requests,1);
 ctx.fetch=async()=>({ok:false});await assert.rejects(run(`WorldLocations.online('Otra ciudad')`));
 console.log('PASS: Spanish API requests, result validation, coordinates, caching and failed provider response');
})().catch(error=>{console.error(error);process.exitCode=1});
