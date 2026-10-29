/* Shared constants, helpers, saved progress */
var $=function(s,r){return (r||document).querySelector(s)};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
var INTS=['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
var OPEN=[64,59,55,50,45,40];          // rows top to bottom: high E, B, G, D, A, low E
var SNAME=['high E','B','G','D','A','low E'];
var FRETS=12, X0=90, SC=2080;
var posX=function(n){return X0+SC*(1-Math.pow(2,-n/12))};
var cellX=function(f){return f===0?50:(posX(f-1)+posX(f))/2};
var rowY=function(s){return 52+s*40};
var pcOf=function(s,f){return (OPEN[s]+f)%12};

/* ---------- saved progress (per viewer, optional) ---------- */
var KEY='fretroad-v1', save={done:[],intro:false};
try{var raw=localStorage.getItem(KEY); if(raw){var o=JSON.parse(raw); if(o&&o.done) save=o;}}catch(e){}
if(!save.passed) save.passed=[];
if(!save.best) save.best={};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}

function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}
function shuffle(a){a=a.slice(); for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t;} return a}
/* ---------- toast ---------- */
var toastT=null;
function toast(msg){
  var host=$('#toastHost'); host.innerHTML=''; var d=document.createElement('div'); d.className='toast'; d.textContent=msg; host.appendChild(d);
  clearTimeout(toastT); toastT=setTimeout(function(){host.innerHTML=''},2400);
}

/* ---------- typewriter ---------- */
function typeInto(el,text,cls){
  if(el._t) clearInterval(el._t);
  el.className=cls||''; el._full=text;
  if(RM){el.textContent=text; return;}
  var i=0; el.textContent='';
  el._t=setInterval(function(){i+=2; el.textContent=text.slice(0,i); if(i>=text.length){clearInterval(el._t); el._t=null;}},18);
}
function finishType(el){if(el._t){clearInterval(el._t); el._t=null; el.textContent=el._full; return true;} return false;}

