/* Rhythm drills: strum a pattern, read a rhythm, comp in an odd meter, all against a click and scored on timing.
   Also the shared onset detector (a hit on the mic = a sharp rise in loudness) that Scale Runner uses for its timing score.
   Input is the microphone, or the Tap button / space bar when no mic is available. */
var ONS={prev:0,lastT:0,timer:null,cb:null};
function onsStart(){ if(ONS.timer) return; ONS.timer=setInterval(onsPoll,8); }
function onsStop(){ clearInterval(ONS.timer); ONS.timer=null; ONS.cb=null; }
function onsPoll(){
  if(!Mic.on||!Mic.an||!Mic.buf) return;
  Mic.an.getFloatTimeDomainData(Mic.buf);
  var b=Mic.buf,n=b.length,e=0,i; for(i=n-256;i<n;i++) e+=b[i]*b[i];
  var rms=Math.sqrt(e/256), now=performance.now(), thr=Math.max((Mic.gate||.008)*1.6,.012);
  if(rms>thr&&rms>ONS.prev*1.7&&now-ONS.lastT>110){ ONS.lastT=now; if(ONS.cb) ONS.cb(now); }
  ONS.prev=ONS.prev*.7+rms*.3;
}

var RH={item:null,exp:[],onsets:[],timer:null,win:[0,0],tp:0,slotMs:0,running:false,res:null};
/* ---- pattern makers ---- */
function rhItem(title,slots,o){ /* slots: [{on,label,count}] */ return {title:title,slots:slots,slotMs:o.slotMs,bars:o.bars,click:o.click,beat:o.beat,tip:o.tip,bpm:o.bpm||0,arrows:!!o.arrows,fresh:true}; }
function mkStrumItems(M0){
  var pats=shuffle(STRUM).slice(0,M0.rounds),items=[];
  for(var r=0;r<M0.rounds;r++){
    var p=pats[r%pats.length],bpm=(M0.bpm||60)+r*4;
    var slots=p.map(function(x,i){return {on:x!=='_',label:x==='_'?'–':x,count:COUNT8[i]}});
    items.push(rhItem('Strum this pattern in time at '+bpm+' bpm. Hit on the D and U, air-strum the –.',slots,{slotMs:30000/bpm,bars:M0.bars||2,
      click:p.map(function(_,i){return i===0?2:(i%2===0?0:-1)}),beat:p.map(function(_,i){return i%2===0}),bpm:bpm,arrows:true,tip:'Mute the strings with your fretting hand and strum all six. The mic hears the rhythm, not the chord. Keep the hand moving on the – slots.'}));
  }
  return items;
}
function mkReadItems(M0){
  var items=[],CELL=[[1,0],[1,0],[1,0],[1,1],[1,1],[1,1],[0,1],[0,0]];
  for(var r=0;r<M0.rounds;r++){
    var bpm=(M0.bpm||60)+r*4,sl=[],ok=false;
    while(!ok){ sl=[]; for(var b=0;b<4;b++){ var c=(b===0)?pick(CELL.slice(0,6)):pick(CELL); sl.push(c[0],c[1]); } ok=sl.reduce(function(a,x){return a+x},0)>=4; }
    var slots=sl.map(function(x,i){return {on:!!x,label:x?'●':'–',count:COUNT8[i]}});
    items.push(rhItem('Read the bar, then play it back at '+bpm+' bpm: a ● is a hit, a – is silence.',slots,{slotMs:30000/bpm,bars:M0.bars||2,
      click:sl.map(function(_,i){return i===0?2:(i%2===0?0:-1)}),beat:sl.map(function(_,i){return i%2===0}),bpm:bpm,tip:'Count out loud "1 & 2 & 3 & 4 &". Hit any open string, or clap close to the mic. Silent slots stay silent.'}));
  }
  return items;
}
var ODD=[{n:'7/8',g:[2,2,3],ms:250},{n:'5/8',g:[3,2],ms:250},{n:'5/4',g:[3,2],ms:520},{n:'9/8',g:[2,2,2,3],ms:230},{n:'7/8',g:[3,2,2],ms:250},{n:'5/8',g:[2,3],ms:250}];
function mkOddItems(M0){
  var items=[]; for(var r=0;r<M0.rounds;r++){
    var m=ODD[r%ODD.length],slots=[],click=[],starts=[]; m.g.forEach(function(g,gi){ for(var k=0;k<g;k++){ var idx=slots.length; slots.push({on:k===0,label:k===0?'●':'·',count:String(k+1)}); click.push(idx===0?2:(k===0?1:-1)); } });
    items.push(rhItem(m.n+' grouped '+m.g.join('+')+': strum on the first beat of each group.',slots,{slotMs:m.ms,bars:M0.bars||3,click:click,beat:slots.map(function(s,i){return click[i]>0}),
      tip:'The loud click is 1 of the bar, the medium click starts a new group, the quiet ticks fill in. Count each group "1 2" or "1 2 3" and play on every 1.'}));
  }
  return items;
}
/* ---- engine ---- */
function rhythmStart(M0){
  PL.items=M0.make(M0); PL.i=0; PL.done=0; PL.clean=0; PL.mistakes=0; PL.state='rhythm';
  $('#pResult').hidden=true; $('#pMain').hidden=false; onsStart(); rhythmRender();
}
function rhythmStop(){ clearInterval(RH.timer); RH.timer=null; RH.running=false; onsStop(); }
function rhSlotsHtml(it,cur,marks){
  var nx=cur<0?-1:(cur+1)%it.slots.length;
  return it.slots.map(function(s,i){var g=it.arrows?(s.label==='D'?'↓':(s.label==='U'?'↑':'–')):s.label; return '<span class="chip rh'+(s.on?' hit':' rest')+(i===cur?' on':'')+(i===nx?' nx':'')+(marks&&marks[i]?' '+marks[i]:'')+'"><small>'+s.count+'</small>'+g+'</span>'}).join('');
}
function rhythmRender(){
  var it=PL.items[PL.i]; RH.item=it; RH.running=false; RH.res=null; PL.state='rhythm';
  $('#pStep').textContent='Round '+(PL.i+1)+' of '+PL.items.length;
  var d=''; PL.items.forEach(function(_,i){d+='<i class="'+(i<PL.i?'ok':(i===PL.i?'on':''))+'"></i>'}); $('#pDots').innerHTML=d;
  $('#pPrompt').textContent=it.title; $('#pSeq').innerHTML=rhSlotsHtml(it,-1); $('#pSeq').classList.add('rhseq');
  boardP.clearOrbs(); boardP.clearLinks();
  var acts=$('#pActs'); acts.innerHTML='';
  mkBtn(acts,it.fresh?'Count me in':'Try again','primary',function(){rhythmGo()});
  if(it.bpm){ mkBtn(acts,'Slower','',function(){rhythmTempo(-6)}); mkBtn(acts,'Faster','',function(){rhythmTempo(6)}); }
  mkBtn(acts,'Hear it','',function(){rhythmHear(it)});
  mkBtn(acts,'Tap','',function(){rhythmTap()}).id='rhTap';
  if(!it.fresh) mkBtn(acts,'Next','',function(){rhythmNext()});
  mkBtn(acts,'Skip','quiet',function(){PL.mistakes++; rhythmStop2(); rhythmNext()});
  playSetFb(Mic.on?'Press "Count me in". One bar of clicks, then it listens.':'Turn on the mic, or press the Tap button or the space bar in time.');
  typeInto($('#pBubble'),it.tip);
}
function rhythmTempo(d){
  var it=RH.item; if(!it||!it.bpm||RH.running) return; var nb=Math.max(36,Math.min(120,it.bpm+d)); if(nb===it.bpm) return;
  PL.items.forEach(function(x,i){ if(i>=PL.i&&x.bpm){ x.bpm=Math.max(36,Math.min(120,x.bpm+(nb-it.bpm))); x.slotMs=30000/x.bpm; x.title=x.title.replace(/at \d+ bpm/,'at '+x.bpm+' bpm'); } });
  rhythmRender(); playSetFb('Tempo '+it.bpm+' bpm. Press "Count me in" when ready.');
}
function rhythmStop2(){ clearInterval(RH.timer); RH.timer=null; RH.running=false; }
function rhythmHear(it){
  initAudio(); if(!ac) return; var sd=it.slotMs/1000;
  PL.muteUntil=performance.now()+it.slots.length*it.slotMs+500;
  it.slots.forEach(function(s,i){ if(s.on){ pluck(52,i*sd,.8); pluck(55,i*sd+.01,.6); pluck(60,i*sd+.02,.5); } });
}
RH.tap=function(){rhythmTap()};
function rhythmTap(){ if(RH.running) rhOnset(performance.now()); else { initAudio(); pluck(52,0,.5); } }
function rhOnset(t){ if(RH.running&&t>=RH.win[0]&&t<=RH.win[1]) RH.onsets.push(t); }
function rhythmGo(){
  var it=RH.item; initAudio(); if(!ac) return; if(ac.state==='suspended') ac.resume();
  it.fresh=false; var sd=it.slotMs/1000,n=it.slots.length,start=ac.currentTime+.45,tp=start+n*sd,off=performance.now()-ac.currentTime*1000;
  RH.cin=[]; for(var ci=0;ci<n;ci++) if(it.beat[ci]) RH.cin.push((start+ci*sd)*1000+off);
  var lat=((ac.baseLatency||0)+(ac.outputLatency||0))*1000, V=MT.vol;
  /* clicks: a count-in bar on the beats, then the pattern's own click pattern */
  for(var k=0;k<n;k++) if(it.beat[k]) clickAt(start+k*sd,k===0?2:0);
  for(var b=0;b<it.bars;b++) for(var s=0;s<n;s++){ var lv=it.click[s]; if(lv!==-9) clickAt(tp+(b*n+s)*sd,lv); }
  RH.exp=[]; for(b=0;b<it.bars;b++) for(s=0;s<n;s++) if(it.slots[s].on) RH.exp.push({t:(tp+(b*n+s)*sd)*1000+off+lat,bar:b,slot:s,hit:false,d:null});
  var tpp=tp*1000+off+lat; RH.tp=tpp; RH.slotMs=it.slotMs; RH.win=[tpp-it.slotMs*.5,tpp+it.bars*n*it.slotMs+it.slotMs*.5]; RH.onsets=[]; RH.running=true; RH.res=null;
  ONS.cb=function(t){rhOnset(t)}; $('#pActs').querySelectorAll('.btn').forEach(function(x){ if(x.id!=='rhTap') x.disabled=true; });
  playSetFb('Count-in…'); clearInterval(RH.timer); RH.timer=setInterval(rhythmTick,40);
}
function rhythmTick(){
  var it=RH.item; if(!it||!RH.running) return; var now=performance.now(),n=it.slots.length,rel=now-RH.tp;
  if(rel<-it.slotMs*.5){ var cn=(RH.cin||[]).filter(function(t){return t<=now}).length; playSetFb('Count-in: '+(cn?Array.apply(null,Array(cn)).map(function(_,i){return i+1}).join('  '):'get ready')+(cn?'':'…')); $('#pSeq').innerHTML=rhSlotsHtml(it,-1); return; }
  if(now>RH.win[1]){ return rhythmFinish(); }
  var idx=Math.floor(rel/it.slotMs), bar=Math.floor(idx/n), cur=((idx%n)+n)%n, tol=Math.min(150,it.slotMs*.45), marks={};
  /* mark this bar's hits and misses once their window has closed */
  RH.exp.forEach(function(e){ if(e.bar===bar&&now>e.t+tol){ var h=RH.onsets.some(function(o){return Math.abs(o-e.t)<=tol}); marks[e.slot]=h?'ok':'miss'; } });
  $('#pSeq').innerHTML=rhSlotsHtml(it,cur,marks); playSetFb('Bar '+(Math.min(bar,it.bars-1)+1)+' of '+it.bars+'. Play it.');
}
function rhythmScore(it){
  var tol=Math.min(150,it.slotMs*.45),used={},hits=0,sum=0,bias=0;
  RH.exp.forEach(function(e){ var bi=-1,bd=1e9; RH.onsets.forEach(function(o,j){ var d=Math.abs(o-e.t); if(!used[j]&&d<=tol&&d<bd){bd=d;bi=j;} }); if(bi>-1){ used[bi]=1; e.hit=true; e.d=RH.onsets[bi]-e.t; hits++; sum+=Math.abs(e.d); bias+=e.d; } });
  var extras=RH.onsets.length-Object.keys(used).length;
  return {hits:hits,total:RH.exp.length,extras:extras,avg:hits?Math.round(sum/hits):0,bias:hits?Math.round(bias/hits):0,
    clean:hits>=Math.ceil(RH.exp.length*.85)&&extras<=Math.max(1,Math.floor(RH.exp.length*.15))};
}
function rhythmFinish(){
  clearInterval(RH.timer); RH.timer=null; RH.running=false; ONS.cb=null;
  var it=RH.item,r=rhythmScore(it); RH.res=r; PL.done++; if(r.clean) PL.clean++; else PL.mistakes++;
  var msg=r.hits+' of '+r.total+' hits in time'+(r.extras>0?', '+r.extras+' extra'+(r.extras>1?'s':''):'')+(r.hits?', off by '+r.avg+' ms on average':'')+'.';
  if(r.hits>=3&&Math.abs(r.bias)>=25) msg+=' You are playing '+(r.bias<0?'early':'late')+'; '+(r.bias<0?'wait for the click.':'anticipate the click a touch.');
  if(!Mic.on&&!r.hits) msg+=' Turn on the mic or use the Tap button.';
  playSetFb((r.clean?'Clean. ':'Not yet. ')+msg,r.clean?'good':'bad');
  var marks={}; RH.exp.filter(function(e){return e.bar===it.bars-1}).forEach(function(e){marks[e.slot]=e.hit?'ok':'miss'}); $('#pSeq').innerHTML=rhSlotsHtml(it,-1,marks);
  if(r.clean) strum([69,76],.07);
  var d=''; PL.items.forEach(function(_,i){d+='<i class="'+(i<PL.i||(i===PL.i&&r.clean)?'ok':(i===PL.i?'on':''))+'"></i>'}); $('#pDots').innerHTML=d;
  rhythmRender2(r);
}
function rhythmRender2(r){
  var acts=$('#pActs'); acts.innerHTML='';
  if(r.clean){ setTimeout(function(){ if(PL.state==='rhythm'&&RH.item&&!RH.running&&RH.res&&RH.res.clean) rhythmNext(); },1300); }
  else { mkBtn(acts,'Try again','primary',function(){var f=$('#pFb').textContent; rhythmRender(); playSetFb(f.replace(/^Not yet\. /,'Last time: '),''); RH.item.fresh=false; $('#pActs .btn.primary').textContent='Try again';}); }
  mkBtn(acts,'Hear it','',function(){rhythmHear(RH.item)});
  mkBtn(acts,r.clean?'Next':'Next pattern','',function(){rhythmNext()});
}
function rhythmNext(){
  clearInterval(RH.timer); RH.timer=null; RH.running=false; ONS.cb=null;
  var it=RH.item; if(it&&!RH.res){ PL.done++; }
  PL.i++; if(PL.i>=PL.items.length){ onsStop(); return showPlayResult(); }
  rhythmRender();
}
document.addEventListener('keydown',function(e){
  if(e.code!=='Space'||!PL.mod||PL.mod.kind!=='rhythm'||PL.state!=='rhythm') return;
  var tg=e.target&&e.target.tagName; if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA') return;
  if(!$('#v-play')||$('#v-play').hidden) return; e.preventDefault(); rhythmTap();
});

/* ---- Scale Runner timing: how even are the notes? ---- */
function evenness(times){
  if(times.length<6) return null; var iv=[],i; for(i=1;i<times.length;i++) iv.push(times[i]-times[i-1]);
  var s=iv.slice().sort(function(a,b){return a-b}),med=s[Math.floor(s.length/2)]; if(!(med>80)) return null;
  var ok=iv.filter(function(x){return x>=med*.5&&x<=med*2}); if(ok.length<4) return null;
  var mad=ok.reduce(function(a,x){return a+Math.abs(x-med)},0)/ok.length;
  return {pct:Math.round(mad/med*100),ms:Math.round(mad),perMin:Math.round(60000/med)};
}
function evenLabel(p){return p<=8?'tight':(p<=15?'steady':(p<=25?'a little uneven':'wobbly'))}

/* ---- registration ---- */
[
 {id:'playstrumrh',name:'Strum in Time',desc:'Play a strumming pattern against the click and get scored on timing.',needs:3,kind:'rhythm',type:'play',tier:'Intermediate',rounds:4,bars:2,bpm:60,make:mkStrumItems,
  primer:['Mute the strings with your fretting hand and strum the pattern. The app hears when each strum lands and compares it with the click.','One bar of clicks counts you in, then you play two bars. Strums on the D and U count; the – slots should be silent (keep your hand moving). If there is no mic, use the Tap button or the space bar.','Each round shows how far off the beat you were on average, and whether you rush or drag.']},
 {id:'rhythmread',name:'Rhythm Reading',desc:'Read a one-bar rhythm and play it back in time.',needs:3,kind:'rhythm',type:'play',tier:'Intermediate',rounds:6,bars:2,bpm:60,make:mkReadItems,
  primer:['Each bar is eight slots: 1 & 2 & 3 & 4 &. A ● means play, a – means stay silent. Read the bar, count it out loud, then play it with the click.','Hit any open string, or clap near the mic. The slots turn green when you land within a fraction of a beat, and red when you miss one.']},
 {id:'oddcomp',name:'Odd-Meter Comping',desc:'Strum the first beat of each group in 5/8, 7/8, 5/4 and 9/8.',needs:5,kind:'rhythm',type:'play',tier:'Advanced',rounds:6,bars:3,make:mkOddItems,
  primer:['Odd meters are counted in groups. 7/8 can be 2+2+3: the loud click is the bar, the medium click starts each group and the quiet ticks fill in. Comping means strumming on the first beat of every group.','Count "1 2, 1 2, 1 2 3" out loud and play on each 1. Then try the other grouping, 3+2+2, and feel how the same seven beats lean differently.']}
].forEach(function(m){PRACTICE.push(m)});
