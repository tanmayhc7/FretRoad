/* Chord finder (Sandbox): tap notes on the neck, one per string, and it names the chord they make.
   Follows the tuning picked in Songs (standard or DADGAD). */
var FIND={frets:[-1,-1,-1,-1,-1,-1]};   /* by board row: 0 = highest string */
var FIND_X={'add4':[0,4,5,7],'madd4':[0,3,5,7],'sus2sus4':[0,2,5,7]};   /* the open-string colours DADGAD is known for */
var FIND_Q=['','m','7','m7','maj7','sus2','sus4','5','6','m6','dim','aug','add9','9','m9','dim7','m7b5','7sus4','add4','madd4','sus2sus4'];
function finderIv(q){ return FIND_X[q]||CHORD_Q[q]; }
function finderPretty(t){ return String(t).replace(/#/g,'\u266f'); }
/* string names down the left of the neck: the tuning's names while finding chords, standard otherwise (scales and shapes are drawn in standard) */
function finderLabels(finding){
  var host=document.getElementById('boardS'); if(!host) return; var names=finding?TUNINGS[tuningId()].names.map(function(n){return n.toUpperCase()}):['E','A','D','G','B','E'], rows=[5,4,3,2,1,0];
  var ts=[].filter.call(host.querySelectorAll('svg text[x="50"]'),function(t){return t.getAttribute('y')!=='306'});
  ts.forEach(function(t,i){ t.textContent=names[rows[i]]; });
}
function finderMidi(s,f){ return LOW_OPEN[5-s]+f; }
function finderPicked(){ var out=[]; for(var s=5;s>=0;s--) if(FIND.frets[s]>=0) out.push({s:s,f:FIND.frets[s],midi:finderMidi(s,FIND.frets[s])}); return out; }  /* low string first */
/* names for a set of MIDI notes, best first: [{name,root,q,bass,exact}] */
function chordNamesFor(midis){
  if(midis.length<2) return [];
  var low=Math.min.apply(null,midis), bass=low%12, set={}, n=0; midis.forEach(function(m){ if(!set[m%12]){ set[m%12]=1; n++; } });
  if(n<2) return [];
  var out=[];
  Object.keys(set).forEach(function(rk){ var r=+rk;
    FIND_Q.forEach(function(q,qi){
      var iv=finderIv(q), T={}; iv.forEach(function(i){ T[(r+i)%12]=1; });
      function same(A,B){ var ka=Object.keys(A),kb=Object.keys(B); return ka.length===kb.length&&ka.every(function(k){return B[k]}); }
      var exact=same(T,set), no5=false;
      if(!exact&&iv.length>=4&&iv.indexOf(7)>-1){ var T2={}; Object.keys(T).forEach(function(k){ if(+k!==(r+7)%12) T2[k]=1; }); if(same(T2,set)){ no5=true; } }
      if(!exact&&!no5) return;
      var name=SHARP_NAMES[r]+q+(bass!==r?'/'+SHARP_NAMES[bass]:'');
      out.push({name:name,root:r,q:q,bass:bass,exact:exact,no5:no5,rank:(exact?0:20)+(bass===r?0:10)+qi*.1});
    });
  });
  out.sort(function(a,b){ return a.rank-b.rank; });
  var seen={}; return out.filter(function(o){ if(seen[o.name]) return false; seen[o.name]=1; return true; });
}
function finderCell(s,f){
  FIND.frets[s]=(FIND.frets[s]===f)?-1:f;
  if(FIND.frets[s]>=0){ pluck(finderMidi(s,f)); if(typeof boardS!=='undefined'&&boardS) boardS.vib(s); }
  finderDraw();
}
function finderClear(){ FIND.frets=[-1,-1,-1,-1,-1,-1]; finderDraw(); }
function finderStrum(){ var m=finderPicked().map(function(x){return x.midi}); if(m.length) strum(m,.05); }
function finderDraw(){
  if(typeof boardS==='undefined'||!boardS) return;
  var picked=finderPicked(), names=chordNamesFor(picked.map(function(x){return x.midi})), top=names[0], out=$('#sFindOut');
  finderLabels(true); boardS.clearOrbs();
  picked.forEach(function(p){ var pc=p.midi%12; boardS.orb('f'+p.s+','+p.f,{s:p.s,f:p.f,label:NAMES[pc],kind:top&&pc===top.root?'root':'tone'}); });
  var notes=picked.map(function(p){return NAMES[p.midi%12]}), h='';
  if(!picked.length) h='<p class="fnd-hint">Tap a note on a string, then add more on other strings. Tap a note again to remove it.</p>';
  else if(picked.length===1) h='<p class="fnd-hint">'+notes[0]+'. Add at least one more string to make a chord.</p>';
  else if(!top){ h='<div class="fnd-name fnd-none">No common chord name</div><p class="fnd-notes">Notes, low to high: <b>'+notes.join(' ')+'</b></p><p class="fnd-hint">Try removing or moving one note. Chords here are built from stacked thirds, suspended seconds and fourths, sixths, and power chords.</p>'; }
  else {
    var ints=picked.map(function(p){ return INTS[((p.midi%12)-top.root+12)%12]; });
    h='<div class="fnd-name" aria-live="polite">'+finderPretty(top.name)+'</div>'+(top.no5?'<p class="fnd-hint">Fifth left out, which is common.</p>':'')+
      '<p class="fnd-notes">Notes, low to high: <b>'+notes.join(' ')+'</b><br>Intervals from '+SHARP_NAMES[top.root]+': <b>'+ints.join(' ')+'</b></p>'+
      (names.length>1?'<p class="fnd-alt">Also called: '+names.slice(1,5).map(function(n){return '<b>'+finderPretty(n.name)+'</b>'}).join(', ')+'</p>':'');
  }
  out.innerHTML=h;
}
document.addEventListener('DOMContentLoaded',function(){ var b=$('#sFindClear'); if(b) b.addEventListener('click',finderClear); var s=$('#sFindStrum'); if(s) s.addEventListener('click',finderStrum); });
