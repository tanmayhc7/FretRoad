/* Tunings for chord diagrams, the backing guitar and the riff helper. Standard is the default; DADGAD is worked out
   by search, since the movable shapes in chords.js only fit standard tuning. Saved in save.tuning. */
var TUNINGS={
  std:{name:'Standard (EADGBE)',open:[40,45,50,55,59,64],names:['E','A','D','G','B','e']},
  dadgad:{name:'DADGAD',open:[38,45,50,55,57,62],names:['D','A','D','G','A','D']}
};
function tuningId(){ return save.tuning&&TUNINGS[save.tuning]?save.tuning:'std'; }
/* LOW_OPEN and the riff tuning are shared arrays: change them in place so everything that reads them follows */
function applyTuning(){
  var T=TUNINGS[tuningId()]; LOW_OPEN.splice(0,6,T.open[0],T.open[1],T.open[2],T.open[3],T.open[4],T.open[5]);
  if(typeof RIFF!=='undefined'){ RIFF.tuning.splice(0,6,T.open[0],T.open[1],T.open[2],T.open[3],T.open[4],T.open[5]); RIFF.names.splice(0,6,T.names[0],T.names[1],T.names[2],T.names[3],T.names[4],T.names[5]); }
  var tn=document.getElementById('pTunerOnly'); if(tn) tn.firstElementChild.textContent=tuningId()==='std'?'Standard tuning, low to high: E A D G B E.':'DADGAD tuning, low to high: D A D G A D.';
}
var TUNE_CACHE={};
/* every playable voicing of a chord in the current tuning, best first: {frets:[6]} (-1 muted) */
function tuneVoicings(c){
  var open=TUNINGS[tuningId()].open, key=tuningId()+'|'+c.root+'|'+c.q+'|'+(c.bass===null||c.bass===undefined?'':c.bass); if(TUNE_CACHE[key]) return TUNE_CACHE[key];
  var iv=(CHORD_Q[c.q]||[0,4,7]), inChord={}, req={}, drone={};
  iv.forEach(function(s){ inChord[(c.root+s)%12]=1; if(s!==7&&s<12) req[(c.root+s)%12]=1; });
  req[c.root]=1; if(iv.length<=2) req[(c.root+7)%12]=1;           /* power chords need their fifth */
  var colour=iv.indexOf(3)>-1||iv.indexOf(4)>-1; if(colour){ drone[(c.root+2)%12]=1; drone[(c.root+5)%12]=1; }  /* open 2nd/4th ring as DADGAD drones */
  var bassPc=(c.bass===null||c.bass===undefined)?c.root:c.bass; inChord[bassPc]=1;
  var found=[], seen={};
  function tryWindow(b){
    var opts=open.map(function(o,s){ var a=[-1]; if(inChord[o%12]||drone[o%12]) a.push(0);
      for(var f=Math.max(1,b);f<=b+3&&f<=12;f++){ var pc=(o+f)%12; if(inChord[pc]) a.push(f); } return a; });
    var fr=new Array(6);
    (function rec(s){
      if(s===6){ evalV(fr.slice(),b); return; }
      for(var i=0;i<opts[s].length;i++){ fr[s]=opts[s][i]; rec(s+1); }
    })(0);
  }
  function evalV(f,b){
    var snd=[],i; for(i=0;i<6;i++) if(f[i]>=0) snd.push(i); if(snd.length<4) return;
    for(i=snd[0];i<=snd[snd.length-1];i++) if(f[i]<0) return;     /* no muted string in the middle */
    var k=f.join(','); if(seen[k]) return;
    var have={},opens=0,fretted=0,drones=0,mx=0,mn=99; snd.forEach(function(s){ var pc=(open[s]+f[s])%12; have[pc]=1; if(f[s]===0){ opens++; if(!inChord[pc]) drones++; } else { fretted++; mx=Math.max(mx,f[s]); mn=Math.min(mn,f[s]); } });
    for(var r in req) if(!have[r]) return;
    if((open[snd[0]]+f[snd[0]])%12!==bassPc) return;               /* lowest note is the root (or the slash bass) */
    seen[k]=1; var span=fretted?mx-mn:0;
    var score=snd.length*.9+opens*.5-fretted*1-span*.8-mx*.22-drones*1.1+(snd.length===6?.3:0);
    found.push({frets:f,score:score});
  }
  for(var b=1;b<=9;b++) tryWindow(b);
  found.sort(function(a,b){ return b.score-a.score; });
  return (TUNE_CACHE[key]=found);
}
function tuneShapeFor(c){ var v=tuneVoicings(c); return v.length?mkShape(v[0].frets,c):null; }
(function(){
  var baseShape=chordShape, baseOpts=chordShapeOptions;
  chordShape=function(sym){ if(tuningId()==='std') return baseShape(sym); var c=typeof sym==='string'?parseChord(sym):sym; return c?tuneShapeFor(c):null; };
  chordShapeOptions=function(sym){
    if(tuningId()==='std') return baseOpts(sym);
    var c=typeof sym==='string'?parseChord(sym):sym; if(!c) return []; var out=[], lows={};
    tuneVoicings(c).forEach(function(v){ var lo=Math.min.apply(null,v.frets.filter(function(x){return x>0}).concat([99])); var k=lo>50?'open':String(lo); if(lows[k]||out.length>=4) return; lows[k]=1; out.push({name:lo>50?'Open':'Around fret '+lo,frets:v.frets}); });
    return out;
  };
})();
function setTuning(id){
  if(!TUNINGS[id]) id='std'; save.tuning=id; persist(); applyTuning(); syncTuning();
  if(typeof fillShapes==='function'&&document.getElementById('sShape')) try{ fillShapes(); }catch(e){}
  if(typeof showSongs==='function'&&!document.getElementById('v-songs').hidden) showSongs();
  if(typeof J!=='undefined'&&J.built&&!document.getElementById('v-jam').hidden){ if(typeof renderChartDom==='function') renderChartDom(); jamShow(J.idx); if(typeof jamRestartIfRunning==='function') jamRestartIfRunning(); }
}
function syncTuning(){ document.querySelectorAll('.tuning-select').forEach(function(s){ s.value=tuningId(); }); }
function tuningSelectHtml(){ return '<label class="chk">Tuning <select class="tuning-select" aria-label="Tuning for chord diagrams and backing">'+Object.keys(TUNINGS).map(function(k){return '<option value="'+k+'">'+TUNINGS[k].name+'</option>'}).join('')+'</select></label>'; }
document.addEventListener('change',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('tuning-select')) setTuning(t.value); });
applyTuning(); syncTuning();
