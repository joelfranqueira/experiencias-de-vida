/* GeoNames cities15000 (CC BY 4.0) + Open-Meteo/GeoNames geocoding.
   The online endpoint receives only the location query, never the story/person. */
const WorldLocations=(()=>{
 const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const words=s=>fold(s).replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const contains=(text,term)=>(' '+words(text)+' ').includes(' '+words(term)+' ');
 const countryNames=new Intl.DisplayNames(['es'],{type:'region'});
 const codes='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
 const countries=codes.map(code=>({code,name:countryNames.of(code)}));
 const spanish={Beijing:'Pekín',London:'Londres',Paris:'París',Rome:'Roma',Florence:'Florencia',Venice:'Venecia',Milan:'Milán',Naples:'Nápoles',Munich:'Múnich',Cologne:'Colonia',Dresden:'Dresde',Prague:'Praga',Warsaw:'Varsovia',Vienna:'Viena',Athens:'Atenas',Copenhagen:'Copenhague',Stockholm:'Estocolmo',Moscow:'Moscú','Saint Petersburg':'San Petersburgo',Istanbul:'Estambul','Abu Dhabi':'Abu Dabi',Dubai:'Dubái',Cairo:'El Cairo',Jerusalem:'Jerusalén',Tokyo:'Tokio',Seoul:'Seúl','New York City':'Nueva York','Mexico City':'Ciudad de México',Lisbon:'Lisboa',Brussels:'Bruselas',Amsterdam:'Ámsterdam',Berlin:'Berlín',Bucharest:'Bucarest',Belgrade:'Belgrado',Zurich:'Zúrich',Geneva:'Ginebra',Damascus:'Damasco',Tehran:'Teherán'};
 let cities=[],loading;
 const normalizeCity=r=>({name:spanish[r[0]]||spanish[r[5]]||r[0],latitude:r[1],longitude:r[2],countryCode:r[3],population:r[4],aliases:[r[0],r[5],spanish[r[0]]||spanish[r[5]]].filter(Boolean)});
 function setCities(rows){cities=rows.map(normalizeCity);return cities}
 async function load(){if(cities.length)return cities;if(!loading)loading=fetch('world-cities.json',{signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error('Diccionario no disponible');return r.json()}).then(setCities).catch(()=>{loading=null;return []});return loading}
 function countryName(code){return countryNames.of(code)||code}
 const labelOf=c=>[c.name,countryName(c.countryCode)].join(', ');
 function validLocation(p){return !!p&&typeof p.latitude==='number'&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&typeof p.longitude==='number'&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180}
 function catalogOptions(data){return data.filter(x=>x.place&&!/confirmar|pendiente/i.test(x.place)).map(x=>({label:x.place,countryCode:x.countryCode||'',location:validLocation(x.location)&&x.location.place===x.place?x.location:null,source:'En tu catálogo'}))}
 function local(query,data=[]){
  const q=words(query);if(q.length<2)return [];
  const options=catalogOptions(data).filter(x=>words(x.label).includes(q));
  for(const c of cities){if(c.aliases.some(n=>words(n).startsWith(q)||words(n)===q)||words(labelOf(c)).startsWith(q))options.push({label:labelOf(c),countryCode:c.countryCode,location:{...c,label:c.name,precision:'city',source:'GeoNames · cities15000'},source:'Diccionario mundial · GeoNames'})}
  for(const c of countries)if(words(c.name).startsWith(q))options.push({label:c.name,countryCode:c.code,location:null,source:'País · elegí una ciudad para ubicarla en el mapa'});
  return unique(options).slice(0,8);
 }
 function unique(options){const seen=new Set();return options.filter(x=>{const key=words(x.label);if(seen.has(key))return false;seen.add(key);return true})}
 const cache=new Map();
 async function online(query,signal){
  const key=words(query);if(cache.has(key))return cache.get(key);
  const url='https://geocoding-api.open-meteo.com/v1/search?language=es&count=8&name='+encodeURIComponent(query);
  const response=await fetch(url,{signal});if(!response.ok)throw Error('No se pudo consultar el buscador mundial');const result=await response.json();
  const options=(result.results||[]).filter(p=>validLocation(p)&&p.country_code).map(p=>{const code=p.country_code;const name=spanish[p.name]||p.name;return {label:[...new Set([name,p.admin1,countryName(code)].filter(Boolean))].join(', '),countryCode:code,location:{latitude:p.latitude,longitude:p.longitude,label:name,precision:'city',source:'Open-Meteo · GeoNames'},source:'Búsqueda mundial en español · GeoNames'}});
  cache.set(key,options);if(cache.size>100)cache.delete(cache.keys().next().value);return options;
 }
 function explicitPlace(story){return (story.match(/\b(?:en|a|al|desde|hacia)\s+(.+?)(?=\s+(?:el\s+\d|con\s|durante\s)|[.;!?\n]|$)/i)?.[1]||'').trim().slice(0,160)}
 function storyPlace(story,data=[]){
  const phrase=explicitPlace(story);if(!phrase)return null;
  // Prefer an explicitly named country, then a longer city name, then known catalog places.
  const mentioned=countries.filter(c=>contains(phrase,c.name)).map(c=>c.code);
  const candidates=cities.filter(c=>(!mentioned.length||mentioned.includes(c.countryCode))&&c.aliases.some(a=>a.length>2&&contains(phrase,a)));
  candidates.sort((a,b)=>Math.max(...b.aliases.filter(a=>contains(phrase,a)).map(a=>a.length))-Math.max(...a.aliases.filter(a=>contains(phrase,a)).map(a=>a.length))||b.population-a.population);
  if(candidates.length){const c=candidates[0];const same=candidates.filter(x=>words(x.name)===words(c.name));
   if(!mentioned.length&&same.some(x=>x.countryCode!==c.countryCode&&x.population>=c.population/4))return null;
   return {label:labelOf(c),countryCode:c.countryCode,location:{...c,label:c.name,precision:'city',source:'GeoNames · cities15000'}};
  }
  const known=catalogOptions(data).filter(x=>words(x.label)===words(phrase)||contains(phrase,x.label)).sort((a,b)=>b.label.length-a.label.length);return known[0]||null;
 }
 return {countries,countryName,load,setCities,local,online,unique,validLocation,explicitPlace,storyPlace};
})();
