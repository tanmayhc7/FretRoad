/* The sky is the progress bar. The share of stops you have cleared sets --dawn (0 to 1) on the page; CSS turns it into a
   sky that moves from deep night toward first light, and the small sun on the header arc rises with it. */
/* only the required chapters move the sky; the optional First Steps chapter does not, so existing players see no change */
function dawnValue(){
  var ids=[]; (window.CHAPTERS||[]).forEach(function(c){ if(!c.optional) ids=ids.concat(c.levels); });
  var t=ids.length||19, n=0; if(window.save&&save.passed){ if(ids.length) ids.forEach(function(i){ if(save.passed.indexOf(i)>-1) n++; }); else n=save.passed.length; }
  return Math.max(0,Math.min(1,n/t));
}
function dawnApply(){
  var v=dawnValue(); document.documentElement.style.setProperty('--dawn',v.toFixed(3));
  var sun=document.getElementById('dawnSun'),arc=document.getElementById('dawnArc'); if(!sun||!arc) return;
  var a=Math.PI*v, cx=32-28*Math.cos(a), cy=30-28*Math.sin(a); sun.setAttribute('cx',cx.toFixed(2)); sun.setAttribute('cy',cy.toFixed(2));
  arc.style.strokeDashoffset=(88*(1-v)).toFixed(1);
}
if(typeof document!=='undefined'){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',dawnApply); else dawnApply(); }
