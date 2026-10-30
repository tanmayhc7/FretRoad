/* Backing band: count-in, click, strummed guitar or a small band (drums, bass, strummed guitar) that follows a chord list.
   Scheduling is look-ahead on the audio clock; the UI reads BK.q for events that are due. */
var BK={on:false,bpm:80,bpc:4,bpb:4,style:'band',vol:.8,countIn:1,loop:true,seq:[],n:0,next:0,timer:null,q:[],out:null,noise:null,startedAt:0,slotStart:{}};
function bkInit(){
  initAudio(); if(!ac) return false;
  if(!BK.out){BK.out=ac.createGain(); BK.out.connect(master);}
  if(!BK.noise){var len=ac.sampleRate*.5,b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0); for(var i=0;i<len;i++) d[i]=Math.random()*2-1; BK.noise=b;}
  BK.out.gain.value=BK.vol; return true;
}
function bkDrum(t,kind,v){
  var g=ac.createGain(); g.connect(BK.out);
  if(kind==='kick'){var o=ac.createOscillator(); o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(42,t+.12); g.gain.setValueAtTime(.9*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); o.connect(g); o.start(t); o.stop(t+.25); return;}
  var s=ac.createBufferSource(); s.buffer=BK.noise; var f=ac.createBiquadFilter();
  if(kind==='snare'){f.type='bandpass'; f.frequency.value=1900; f.Q.value=.7; g.gain.setValueAtTime(.55*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else {f.type='highpass'; f.frequency.value=7500; g.gain.setValueAtTime(.22*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.05);}
  s.connect(f); f.connect(g); s.start(t); s.stop(t+.2);
}
function bkBass(t,midi,len,v){
  var o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter(); o.type='triangle'; o.frequency.value=440*Math.pow(2,(midi-69)/12);
  lp.type='lowpass'; lp.frequency.value=700; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.7*v,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(lp); lp.connect(g); g.connect(BK.out); o.start(t); o.stop(t+len+.05);
}
function bkStrum(t,sym,down,v){
  var sh=chordShape(sym); if(!sh) return; var notes=chordShapeNotes(sh); if(!down) notes=notes.slice().reverse();
  var c=parseChord(sym);
  notes.forEach(function(m,i){ var s=ac.createBufferSource(); s.buffer=pluckBuf(m); var g=ac.createGain(); g.gain.value=(.55*v)*(down?1-i*.03:.7+i*.02);
    var lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3400; s.connect(lp); lp.connect(g); g.connect(BK.out); s.start(t+i*.016); });
}
function bkRootMidi(sym){var c=parseChord(sym); if(!c) return 40; var pc=(c.bass!==null?c.bass:c.root); return 40+((pc-4+12)%12);}
/* eighth-note strum patterns: D down, U up, - rest */
var STRUM_PAT={4:'D-DU-UDU',3:'D-DUDU',2:'D-DU',6:'D-DUDU',8:'D-DU-UDU'};
function bkBeat(t,n){
  var spb=60/BK.bpm, ci=BK.countIn*BK.bpb, count=n<ci;
  if(count){ clickAt(t,(n%BK.bpb)===0?2:0); BK.q.push({t:t,count:true,n:n,beat:n%BK.bpb,left:ci-n}); return; }
  var m=n-ci, slot=Math.floor(m/BK.bpc), beat=m%BK.bpc, len=BK.seq.length;
  if(!BK.loop&&slot>=len){ BK.q.push({t:t,end:true}); return; }
  var idx=slot%len, sym=BK.seq[idx]; BK.q.push({t:t,slot:slot,idx:idx,beat:beat,sym:sym,next:BK.seq[(idx+1)%len],bpc:BK.bpc});
  var bar=beat%BK.bpb;
  if(BK.style==='click'){ clickAt(t,beat===0?1:0); return; }
  var pat=STRUM_PAT[BK.bpb]||'D-DU-UDU', per=BK.bpb===3?3:4, e;
  if(BK.style==='strum') clickAt(t,beat===0?-1:-1);
  for(e=0;e<2;e++){
    var step=(bar*2+e), ch=pat.charAt(step%pat.length), te=t+e*spb/2;
    if(ch==='D') bkStrum(te,sym,true,beat===0&&e===0?1:.8); else if(ch==='U') bkStrum(te,sym,false,.6);
    if(BK.style==='band'){
      bkDrum(te,'hat',e===0?1:.6);
      if(e===0){ if(BK.bpb===3){ if(bar===0) bkDrum(te,'kick',1); } else { if(bar===0||bar===2) bkDrum(te,'kick',bar===0?1:.8); if(bar===1||bar===3) bkDrum(te,'snare',.9); } }
    }
  }
  if(BK.style==='band'){ var r=bkRootMidi(sym); if(bar===0) bkBass(t,r,spb*.9,1); else if((BK.bpb===4&&bar===2)||(BK.bpb===3&&bar===2)) bkBass(t,r+(bar===2?7:0),spb*.8,.8); else if(bar===1&&BK.bpb===4) bkBass(t+spb*.5,r,spb*.4,.5); }
}
function bkSched(){
  var spb=60/BK.bpm;
  while(BK.next<ac.currentTime+.14){ bkBeat(BK.next,BK.n); BK.n++; BK.next+=spb; }
}
function bkStart(o){
  o=o||{}; for(var k in o) BK[k]=o[k];
  if(!BK.seq.length) return false; if(!bkInit()) return false; if(ac.state==='suspended') ac.resume();
  if(MT.on) metroStop(); bkStop();
  BK.on=true; BK.n=0; BK.next=ac.currentTime+.12; BK.q=[]; BK.slotStart={}; BK.startedAt=BK.next; BK.timer=setInterval(bkSched,25);
  return true;
}
function bkStop(){ if(BK.timer) clearInterval(BK.timer); BK.timer=null; BK.on=false; BK.q=[]; }
function bkSetBpm(v){ if(!BK.on){BK.bpm=v;return;} /* keep the grid continuous: change tempo from the next beat on */ BK.bpm=v; }
