/* Full-page "world" backdrops: a stack of SVG layers placed at different depths in CSS 3D.
   The pointer (or a slow automatic drift) shifts each layer by its depth, so near things move more than far things.
   A story opts in with  world:'<id>'  and a builder registered as WORLD[id](cam, api). */
var WORLD={};
var WORLD_RT={raf:0,layers:[],mx:0,my:0,tx:0,ty:0,on:false};
function wrng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var SVGNS='http://www.w3.org/2000/svg';
function se(name,attrs,parent){var e=document.createElementNS(SVGNS,name); for(var k in attrs) e.setAttribute(k,attrs[k]); if(parent) parent.appendChild(e); return e;}
/* add a depth layer. z = distance behind the screen (px), amp = parallax strength (px at full pointer swing) */
function wLayer(cam,z,amp,build,cls){
  var d=document.createElement('div'); d.className='wl '+(cls||'');
  var s=(800+z)/800; d.dataset.z=z; d.dataset.s=s; d.dataset.amp=amp;
  var svg=se('svg',{viewBox:'0 0 1600 900',preserveAspectRatio:'xMidYMax slice','aria-hidden':'true'}); d.appendChild(svg);
  var defs=se('defs',{},svg); var g=se('g',{},svg); build(g,defs,svg);
  cam.appendChild(d); WORLD_RT.layers.push(d); placeLayer(d,0,0); return d;
}
function placeLayer(d,x,y){var a=+d.dataset.amp; d.style.transform='translate3d('+(x*a).toFixed(1)+'px,'+(y*a*.6).toFixed(1)+'px,'+(-d.dataset.z)+'px) scale('+d.dataset.s+')';}
function wTick(t){
  var R=WORLD_RT; if(!R.on||R.paused){R.raf=0; return;}
  R.mx+=(R.tx-R.mx)*.06; R.my+=(R.ty-R.my)*.06;
  var drift=R.still?0:1, ax=R.mx+drift*Math.sin(t/5200)*.35, ay=R.my+drift*Math.cos(t/6800)*.25;
  for(var i=0;i<R.layers.length;i++) placeLayer(R.layers[i],ax,ay);
  if(R.still&&Math.abs(R.tx-R.mx)<.002&&Math.abs(R.ty-R.my)<.002){R.raf=0; return;}  /* calm and settled: stop drawing frames */
  R.raf=requestAnimationFrame(wTick);
}
/* Stop all scenery motion while the world is off screen (scrolled well down the page, or the tab is hidden). */
function wPause(p){ var R=WORLD_RT; if(R.paused===p) return; R.paused=p; document.body.classList.toggle('w-pause',p); if(!p&&R.on&&!R.raf) R.raf=requestAnimationFrame(wTick); }
function wCheckPause(){ wPause(document.hidden||window.scrollY>innerHeight*.7); }
window.addEventListener('scroll',wCheckPause,{passive:true}); document.addEventListener('visibilitychange',wCheckPause);
function setWorld(id){
  var R=WORLD_RT, w=document.getElementById('world'); if(!w) return;
  R.on=false; cancelAnimationFrame(R.raf); R.layers=[]; w.innerHTML=''; w.className='';
  var has=!!(id&&WORLD[id]); document.body.classList.toggle('has-world',has); document.body.setAttribute('data-world',has?id:'');
  if(!has) return;
  w.className='w-'+id; var cam=document.createElement('div'); cam.id='wcam'; w.appendChild(cam);
  try{ WORLD[id](cam); }catch(e){ if(window.console) console.error('world',e); }
  R.still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  R.on=true; R.paused=false; document.body.classList.remove('w-pause'); R.raf=requestAnimationFrame(wTick); wCheckPause();
}
window.addEventListener('pointermove',function(e){var R=WORLD_RT; R.tx=(e.clientX/innerWidth-.5)*2; R.ty=(e.clientY/innerHeight-.5)*2; if(R.on&&!R.paused&&!R.raf) R.raf=requestAnimationFrame(wTick);},{passive:true});
