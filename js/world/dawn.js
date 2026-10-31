/* The sky is the progress bar. The share of stops you have cleared sets --dawn (0 to 1) on the page; CSS turns it into a
   sky that moves from deep night toward first light, and the small sun on the header arc rises with it. */
function dawnValue(){ var n=(window.save&&save.passed?save.passed.length:0), t=(typeof LEVELS!=='undefined'&&LEVELS.length)||19; return Math.max(0,Math.min(1,n/t)); }
function dawnApply(){
  var v=dawnValue(); document.documentElement.style.setProperty('--dawn',v.toFixed(3));
  var sun=document.getElementById('dawnSun'),arc=document.getElementById('dawnArc'); if(!sun||!arc) return;
  var a=Math.PI*v, cx=32-28*Math.cos(a), cy=30-28*Math.sin(a); sun.setAttribute('cx',cx.toFixed(2)); sun.setAttribute('cy',cy.toFixed(2));
  arc.style.strokeDashoffset=(88*(1-v)).toFixed(1);
}
if(typeof document!=='undefined'){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',dawnApply); else dawnApply(); }
