/* Play-along practice engine */
/* ======== play-along practice ======== */
var PL={mod:null,items:[],i:0,done:0,clean:0,mistakes:0,state:'idle',stable:0,wrong:0,wrongPc:-1,quiet:false,quietSince:0,muteUntil:0,timer:null,cfg:{root:9,scale:'minor pentatonic',dir:'up'},selfCheck:false,seen:''};
if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.PL=PL;
var boardP=null;
var STR_LONG=['high E','B','G','D','A','low E'];
function playSetFb(msg,kind){var f=$('#pFb'); f.textContent=msg||''; f.className='fb'+(kind?' '+kind:'');}
function micUI(on,msg){
  $('#micBtn').textContent=on?'Mic is on':'Turn on the mic'; $('#micBtn').disabled=false; $('#micBtn').classList.toggle('primary',!on);
  $('#micState').textContent=msg||(on?'Listening. Play near the mic, one note at a time.':'Off. You can still tap "I played it" to check yourself.');
}
function showPlay(M0){
  PL.mod=M0; showView('play'); updateStat();
  if(!boardP) boardP=createBoard($('#boardP'),function(s,f){pluck(OPEN[s]+f); boardP.vib(s)});
  $('#pWhere').textContent='Practice · '+M0.tier; $('#pTitle').textContent=M0.name;
  $('#pResult').hidden=true; $('#pMain').hidden=false;
  $('#pCfg').hidden=(M0.kind!=='scale'); if(M0.kind==='scale') cfgScaleUI();
  $('#pTunerOnly').hidden=(M0.kind!=='tune'); $('#pRun').hidden=(M0.kind==='tune');
  micUI(Mic.on);
  clearInterval(PL.timer); PL.timer=setInterval(playTick,70);
  if(M0.primer){PL.state='primer'; renderPrimer(M0,$('#pMain'),$('#pResult'),startPlay);} else startPlay();
}
function renderPrimer(M0,mainEl,resEl,go){
  mainEl.hidden=true; resEl.hidden=false;
  resEl.innerHTML='<h3>Before you start</h3>'+M0.primer.map(function(t){return '<p>'+t+'</p>'}).join('')+'<div class="acts"></div>';
  var pa=resEl.querySelector('.acts');
  mkBtn(pa,'Start','primary',function(){mainEl.hidden=false; resEl.hidden=true; go()});
  mkBtn(pa,'Back to the map','',function(){location.hash='map'});
}
function leavePlay(){clearInterval(PL.timer); PL.timer=null; PL.state='idle'; if(Mic.on){micStop(); micUI(false);}}
function scaleRun(root,k,dir){
  var pcs=scpcs(root,k).concat([root]), up=pcs, down=pcs.slice(0,-1).reverse();
  if(dir==='down') return pcs.slice().reverse();
  if(dir==='both') return up.concat(down);
  return up;
}
function cfgScaleUI(){
  var k=$('#pcKey'),s=$('#pcScale');
  if(!k.options.length){
    NAMES.forEach(function(n,i){var o=document.createElement('option'); o.value=i; o.textContent=n; k.appendChild(o)});
    Object.keys(SCL).forEach(function(n){var o=document.createElement('option'); o.value=n; o.textContent=n; s.appendChild(o)});
    ['pcKey','pcScale','pcDir'].forEach(function(id){$('#'+id).addEventListener('change',function(){PL.cfg.root=+$('#pcKey').value; PL.cfg.scale=$('#pcScale').value; PL.cfg.dir=$('#pcDir').value; if(PL.state!=='primer') startPlay();})});
  }
  k.value=PL.cfg.root; s.value=PL.cfg.scale; $('#pcDir').value=PL.cfg.dir;
}
function startPlay(){
  var M0=PL.mod; PL.i=0; PL.done=0; PL.clean=0; PL.mistakes=0; PL.items=[];
  $('#pResult').hidden=true; $('#pMain').hidden=false;
  if(M0.kind==='tune'){PL.state='tuner'; $('#pStep').textContent='Tuner'; $('#pPrompt').textContent='Pluck a string'; playSetFb(''); typeInto($('#pBubble'),'Pluck one string at a time. The needle shows how far you are from the nearest note. Tune each string to E A D G B E.'); boardP.clearOrbs(); return;}
  if(M0.kind==='note'){var last=-1; for(var i=0;i<M0.rounds;i++){var p; do{p=rnd(12)}while(p===last); last=p; PL.items.push({type:'seq',title:'Play any '+NAMES[p],notes:[p],labels:[NAMES[p]],midi:[48+((p-0+12)%12)]});}}
  else if(M0.kind==='chord'){
    for(var j=0;j<M0.rounds;j++){var sh=shapeBy(pick(M0.pool)), strs=[];
      sh.fr.forEach(function(f,ix){if(f>=0) strs.push({s:5-ix,f:f})});
      PL.items.push({type:'seq',title:'Build '+sh.sym+', one string at a time',shape:sh,notes:strs.map(function(x){return pcOf(x.s,x.f)}),labels:strs.map(function(x){return STR_LONG[x.s]+' · '+NAMES[pcOf(x.s,x.f)]}),midi:shapeMidi(sh),pos:strs});}
  } else if(M0.kind==='arp'){
    var AT=['major','minor','dom7','maj7','min7'],lastA='';
    for(var a=0;a<M0.rounds;a++){var at,ar,key; do{at=pick(AT);ar=pick([0,2,4,5,7,9,11]);key=ar+at}while(key===lastA); lastA=key;
      var cp=cpcs(ar,at),up=cp.concat([cp[0]]),seq=up.concat(up.slice(0,-1).reverse()),b0=45+((ar-9+12)%12),n=cp.length;
      PL.items.push({type:'seq',title:'Play the '+csym(ar,at)+' arpeggio, up and back down',notes:seq,labels:seq.map(function(p){return NAMES[p]}),
        midi:seq.map(function(p,ix){var st=ix<=n?ix:2*n-ix; return b0+(st===n?12:CT[at].iv[st])})});}
  } else if(M0.kind==='scale'){
    var run=scaleRun(PL.cfg.root,PL.cfg.scale,PL.cfg.dir),base=45+((PL.cfg.root-9+12)%12);
    for(var r=0;r<M0.rounds;r++) PL.items.push({type:'seq',title:'Play '+sname(PL.cfg.root,PL.cfg.scale)+(PL.cfg.dir==='both'?' up and down':(PL.cfg.dir==='down'?' coming down':' going up')),scale:true,notes:run,labels:run.map(function(p){return NAMES[p]}),midi:run.map(function(p,ix){return base+((p-PL.cfg.root+12)%12)+((ix===run.length-1&&PL.cfg.dir!=='down'&&PL.cfg.dir!=='both')?12:0)})});
  }
  renderPlay();
}
function renderPlay(){
  var it=PL.items[PL.i]; it.k=0; it.bad=false; PL.stable=0; PL.wrong=0; PL.wrongPc=-1; PL.state='listen'; PL.seen='';
  $('#pStep').textContent='Round '+(PL.i+1)+' of '+PL.items.length;
  var d=''; PL.items.forEach(function(_,i){d+='<i class="'+(i<PL.i?'ok':(i===PL.i?'on':''))+'"></i>'}); $('#pDots').innerHTML=d;
  $('#pPrompt').textContent=it.title;
  drawSeq(); boardP.clearOrbs(); boardP.clearLinks();
  if(it.shape) shapeOrbs(it.shape).forEach(function(o,i){boardP.orb('sh'+i,{s:o.s,f:o.f,kind:o.kind,label:o.kind==='miss'?'×':''})});
  if(it.scale){for(var s=0;s<6;s++)for(var f=0;f<=FRETS;f++){var iv=(pcOf(s,f)-PL.cfg.root+12)%12; if(SCL[PL.cfg.scale].iv.indexOf(iv)>-1) boardP.orb('sc'+s+','+f,{s:s,f:f,kind:iv===0?'root':'scale',label:NAMES[pcOf(s,f)]});}}
  var acts=$('#pActs'); acts.innerHTML='';
  mkBtn(acts,'Hear it','',function(){playRef(it)});
  if(!it.shape&&!it.scale) mkBtn(acts,'Show on the neck','',function(){showNeck(it.notes[0])});
  mkBtn(acts,'Metronome','',function(){$('#metroBtn').click()});
  mkBtn(acts,'I played it','',function(){advanceSeq(true)});
  mkBtn(acts,'Skip','quiet',function(){PL.mistakes++; it.bad=true; nextItem()});
  playSetFb(Mic.on?'Listening…':'Turn on the mic to be checked, or tap "I played it".');
  typeInto($('#pBubble'),it.shape?'Play each string in order, lowest first. Let each note ring until it turns green. Skip any string with a ×.':(it.scale?'Play the notes in order, one at a time, up the neck however you like. Use the metronome if you want a steady pulse.':'Any string, any octave. Let the note ring for a moment.'));
}
function showNeck(pc){boardP.clearOrbs(); for(var s=0;s<6;s++)for(var f=0;f<=FRETS;f++) if(pcOf(s,f)===pc) boardP.orb('n'+s+','+f,{s:s,f:f,kind:'found',label:NAMES[pc]});}
function playRef(it){
  PL.muteUntil=performance.now()+(it.midi.length*(it.shape?.55:.5)*1000+900);
  it.midi.forEach(function(m,i){pluck(m,i*(it.shape?.5:.45),.8)});
}
function drawSeq(){
  var it=PL.items[PL.i],h='';
  it.labels.forEach(function(l,i){h+='<span class="chip'+(i<it.k?' ok':(i===it.k?' on':''))+'">'+l+'</span>'});
  $('#pSeq').innerHTML=h;
}
function advanceSeq(self){
  var it=PL.items[PL.i];
  if(self){it.k=it.notes.length;} else it.k++;
  if(it.shape&&it.pos&&!self) boardP.burst(it.pos[it.k-1].s,it.pos[it.k-1].f,'#63d8c3');
  drawSeq(); PL.stable=0; PL.wrong=0; PL.wrongPc=-1;
  if(it.k>=it.notes.length){
    PL.done++; if(!it.bad) PL.clean++; strum([69,76],.07); playSetFb('Round complete.','good'); PL.state='pause';
    setTimeout(nextItem,self?200:900);
  } else {
    var same=it.notes[it.k]===it.notes[it.k-1];
    if(same){PL.quiet=true; PL.quietSince=performance.now();}
    playSetFb('Good. Next: '+it.labels[it.k]+'.','good');
  }
}
function nextItem(){
  PL.i++; if(PL.i>=PL.items.length) return showPlayResult();
  renderPlay();
}
function showPlayResult(){
  PL.state='done'; $('#pMain').hidden=true; var rv=$('#pResult'); rv.hidden=false;
  var M0=PL.mod,total=PL.items.length,prev=save.best[M0.id],isBest=(prev===undefined||PL.clean>prev);
  if(isBest){save.best[M0.id]=PL.clean; persist();}
  rv.innerHTML='<h3>'+PL.clean+' of '+total+' clean</h3><p>'+(PL.done-PL.clean>0?(PL.done-PL.clean)+' needed a skip or a wrong note first. ':'')+(isBest?'New best score.':'Best so far: '+prev+' of '+total+'.')+'</p><div class="acts" id="pra"></div>';
  mkBtn($('#pra'),'Go again','primary',function(){startPlay()});
  mkBtn($('#pra'),'Back to the map','',function(){location.hash='map'});
}
function octName(midi){return NAMES[midi%12]+(Math.floor(midi/12)-1)}
function playTick(){
  if(!Mic.on||!Mic.an) return;
  var r=micRead(), now=performance.now();
  $('#micLevel').style.width=Math.min(100,Math.round(r.rms*900))+'%';
  var n=r.note;
  $('#tNote').textContent=n?octName(n.midi):'–';
  $('#tCents').textContent=n?((n.cents>0?'+':'')+n.cents+' cents'):'';
  $('#tNeedle').style.left=n?(50+Math.max(-50,Math.min(50,n.cents))*0.9)+'%':'50%';
  $('#tNeedle').classList.toggle('in',!!n&&Math.abs(n.cents)<=8);
  if(PL.mod&&PL.mod.kind==='tune'){
    if(n){var best=0,bd=99; [40,45,50,55,59,64].forEach(function(m,i){var d=Math.abs(n.midi-m); if(d<bd){bd=d;best=m}}); $('#tNear').textContent=bd<=1?('Closest string: '+octName(best)):'';}
    return;
  }
  if(PL.state!=='listen'||now<PL.muteUntil) return;
  var it=PL.items[PL.i]; if(!it) return;
  if(PL.quiet){ if(r.rms<Mic.gate*1.4||now-PL.quietSince>1800) PL.quiet=false; else return; }
  if(!n){PL.stable=0; return;}
  var want=it.notes[it.k];
  if(n.pc===want&&Math.abs(n.cents)<=45){ PL.stable++; PL.wrong=0; if(PL.stable>=3) advanceSeq(false); }
  else {
    PL.stable=0;
    if(it.k>0&&n.pc===it.notes[it.k-1]) return;
    if(n.pc===PL.wrongPc){PL.wrong++;} else {PL.wrongPc=n.pc; PL.wrong=1;}
    if(PL.wrong===4){it.bad=true; PL.mistakes++; playSetFb('I hear '+n.name+'. Looking for '+it.labels[it.k]+'.','bad');}
  }
}
$('#micBtn').addEventListener('click',function(){
  if(Mic.on){micStop(); micUI(false); return;}
  this.disabled=true; $('#micState').textContent='Asking for the microphone… stay quiet for a second.';
  micStart(function(ok,msg){ if(ok) micUI(true); else micUI(false,msg); });
});
$('#pBack').addEventListener('click',function(){location.hash='map'});

