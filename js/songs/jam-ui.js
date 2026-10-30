/* Play-along view: scrolling chart, now/next chord diagrams with finger tips, backing band, live chord check and change drills. */
var J={built:false,title:'',chart:null,sym:[],seq:[],snd:[],bpm:80,bpc:4,bpb:4,style:'band',tr:0,capo:0,idx:0,running:false,listening:false,cur:null,log:[],drill:null,raf:0,lastSample:0,count:true,solo:'',orig:null};
function leaveJam(){ if(!J.built) return; if(typeof recLeave==='function') recLeave(); if(J.running) jamStop(); if(J.listening) jamListen(false); cancelAnimationFrame(J.raf); }
function jamBuild(){
  if(J.built) return; J.built=true;
  $('#jamRoot').innerHTML=
  '<div class="jam-head"><button class="btn" id="jBack">Songs</button><div><h1 id="jTitle"></h1><p class="jsub" id="jSub"></p></div></div>'+
  '<div class="stage">'+
   '<div class="gcard now"><span class="lab">Now</span><div class="bigname" id="jNowName">&nbsp;</div><div id="jNowDia" class="dia"></div><div class="beats" id="jBeats" aria-hidden="true"></div></div>'+
   '<div class="gcard next"><span class="lab">Next <b id="jIn"></b></span><div class="bigname sm" id="jNextName">&nbsp;</div><div id="jNextDia" class="dia"></div><p class="tip" id="jTip"></p></div>'+
   '<div class="gcard feed"><span class="lab">Listening</span><div class="heard" id="jHeard">Mic is off. Tap "Listen to me" and strum along.</div><div class="log" id="jLog" aria-live="polite"></div></div>'+
  '</div>'+
  '<div class="jctl">'+
   '<button class="btn primary big" id="jGo">Start</button>'+
   '<label>Tempo <input type="range" id="jBpm" min="40" max="180" step="2"><b id="jBpmV"></b></label>'+
   '<label>Beats per chord <select id="jBpc"><option>2</option><option>3</option><option selected>4</option><option>6</option><option>8</option></select></label>'+
   '<label>Time <select id="jBpb"><option value="4">4/4</option><option value="3">3/4</option></select></label>'+
   '<label>Backing <select id="jStyle"><option value="click">Click only</option><option value="strum">Guitar strum</option><option value="band" selected>Full band</option></select></label>'+
   '<label>Volume <input type="range" id="jVol" min="0" max="1" step=".05" value=".8"></label>'+
   '<label>Capo <select id="jCapo"></select></label>'+
   '<label>Key <span class="tr"><button class="btn" id="jTrM" aria-label="Down a semitone">&minus;</button><b id="jTrV">0</b><button class="btn" id="jTrP" aria-label="Up a semitone">+</button></span></label>'+
   '<label class="chk"><input type="checkbox" id="jCount" checked> Count in</label>'+'<label class="chk"><input type="checkbox" class="lefty-toggle"> Left-handed</label>'+
   '<button class="btn" id="jMic">Listen to me</button>'+
  '</div>'+
  '<div class="chartwrap" id="jChart"></div>'+
  '<div class="gcard stats"><h3>Your chord changes</h3><p class="jsub">Time from the beat to a clean strum, averaged. Slow ones are your homework.</p><div id="jStats"></div></div>';
  var cs=$('#jCapo'); for(var i=0;i<=9;i++){var o=document.createElement('option'); o.value=i; o.textContent=i?('Capo '+i):'No capo'; cs.appendChild(o);}
  $('#jBack').addEventListener('click',function(){location.hash='songs'});
  $('#jGo').addEventListener('click',function(){J.running?jamStop():jamStart()});
  $('#jBpm').addEventListener('input',function(){J.bpm=+this.value; $('#jBpmV').textContent=J.bpm; bkSetBpm(J.bpm);});
  $('#jBpc').addEventListener('change',function(){J.bpc=+this.value; jamRestartIfRunning()});
  $('#jBpb').addEventListener('change',function(){J.bpb=+this.value; jamRestartIfRunning()});
  $('#jStyle').addEventListener('change',function(){J.style=this.value; BK.style=J.style;});
  $('#jVol').addEventListener('input',function(){BK.vol=+this.value; if(BK.out) BK.out.gain.value=BK.vol;});
  $('#jCapo').addEventListener('change',function(){J.capo=+this.value; jamRebuildSeq(); jamRestartIfRunning();});
  $('#jTrM').addEventListener('click',function(){jamTranspose(-1)}); $('#jTrP').addEventListener('click',function(){jamTranspose(1)});
  $('#jCount').addEventListener('change',function(){J.count=this.checked});
  syncLefty();
  $('#jMic').addEventListener('click',function(){jamListen(!J.listening)});
}
function jamSetSong(title,seqArr,chart,opts){
  opts=opts||{}; J.title=title; J.chart=chart; J.orig=seqArr.slice(); J.tr=0; J.capo=opts.capo||0; J.bpm=opts.bpm||80; J.bpc=opts.bpc||4; J.bpb=opts.bpb||4; J.solo=opts.solo||''; J.drill=null; J.idx=0; J.log=[];
  $('#jTitle').textContent=title; $('#jBpm').value=J.bpm; $('#jBpmV').textContent=J.bpm; $('#jBpc').value=String(J.bpc); $('#jBpb').value=String(J.bpb); $('#jCapo').value=String(J.capo); $('#jTrV').textContent='0';
  jamRebuildSeq(); renderChartDom(); jamShow(0); jamStats();
  $('#jSub').textContent=(opts.sub||'')+(J.solo?(opts.sub?' · ':'')+'Solo with: '+J.solo:'');
  $('#jLog').innerHTML=''; $('#jHeard').textContent=J.listening?'Listening. Strum when you are ready.':'Mic is off. Tap "Listen to me" and strum along.';
}
function jamRebuildSeq(){
  J.sym=J.orig.map(function(s){return J.tr?transposeChord(s,J.tr,J.useFlats):s});
  J.seq=J.drill?J.drill.pair.slice():J.sym.slice();
  J.snd=J.seq.map(function(s){return J.capo?transposeChord(s,J.capo,false):s});
}
function jamTranspose(d){ J.tr=(J.tr+d+12)%12; J.useFlats=J.orig.some(function(s){return /^[A-G]b/.test(s)}); if(J.tr>6) $('#jTrV').textContent=(J.tr-12); else $('#jTrV').textContent='+'+J.tr; if(J.tr===0) $('#jTrV').textContent='0'; jamRebuildSeq(); renderChartDom(); jamShow(J.idx); jamRestartIfRunning(); }
function renderChartDom(){
  var host=$('#jChart'); host.innerHTML=''; var n=0;
  if(!J.chart){ var seqDiv=document.createElement('div'); seqDiv.className='cl bars'; J.sym.forEach(function(s,i){var b=document.createElement('span'); b.className='seg'; b.dataset.i=i; b.innerHTML='<b class="ch">'+s+'</b><span class="ly">&nbsp;</span>'; seqDiv.appendChild(b)}); host.appendChild(seqDiv); return; }
  J.chart.sections.forEach(function(sec){
    if(sec.name){var h=document.createElement('div'); h.className='sec'; h.textContent=sec.name; host.appendChild(h);}
    sec.lines.forEach(function(l){
      var d=document.createElement('div'); d.className='cl'; if(l.blank){d.className='cl gap'; host.appendChild(d); return;}
      if(!l.chords.length){d.className='cl plain'; d.textContent=l.text; host.appendChild(d); return;}
      var first=l.chords[0].at; if(first>0&&l.text.slice(0,first).trim()){var s0=document.createElement('span'); s0.className='seg'; s0.innerHTML='<b class="ch">&nbsp;</b>'; var ly=document.createElement('span'); ly.className='ly'; ly.textContent=l.text.slice(0,first); s0.appendChild(ly); d.appendChild(s0);}
      l.chords.forEach(function(c,k){
        var end=k+1<l.chords.length?l.chords[k+1].at:l.text.length, seg=document.createElement('span'); seg.className='seg'; seg.dataset.i=n;
        var sym=J.tr?transposeChord(c.sym,J.tr,J.useFlats):c.sym; seg.innerHTML='<b class="ch"></b><span class="ly"></span>'; seg.querySelector('.ch').textContent=sym; seg.querySelector('.ly').textContent=l.text.slice(c.at,end)||' ';
        seg.addEventListener('click',function(){ if(!J.drill&&!J.running){J.idx=+seg.dataset.i; jamShow(J.idx)} }); d.appendChild(seg); n++;
      });
      host.appendChild(d);
    });
  });
}
function jamShow(i,beat,bpc){
  var len=J.seq.length; if(!len) return; i=((i%len)+len)%len; J.idx=i;
  var cur=J.seq[i], nxt=J.seq[(i+1)%len];
  $('#jNowName').textContent=cur; $('#jNowDia').innerHTML=chordDiagram(cur,{w:150});
  $('#jNextName').textContent=nxt; $('#jNextDia').innerHTML=chordDiagram(nxt,{w:112});
  var info=changeInfo(cur,nxt), same=cur===nxt;
  $('#jTip').innerHTML=same?'Same chord again. Keep it ringing.':'<b>'+(info.moves===null?'':info.moves+(info.moves===1?' finger moves. ':' fingers move. '))+(info.hard?'This one is tricky. ':'')+'</b>'+info.tip;
  var segs=document.querySelectorAll('#jChart .seg'); for(var k=0;k<segs.length;k++) segs[k].classList.toggle('now',+segs[k].dataset.i===(J.drill?-1:i)&&segs[k].dataset.i!==undefined);
  var now=document.querySelector('#jChart .seg.now'); if(now&&(J.running||(typeof recPlaying==='function'&&recPlaying()))) now.scrollIntoView({block:'center',behavior:'smooth'});
  var bd=$('#jBeats'), bp=bpc||J.bpc; if(bd.children.length!==bp){bd.innerHTML=''; for(var b=0;b<bp;b++) bd.appendChild(document.createElement('i'));}
  for(var b2=0;b2<bd.children.length;b2++) bd.children[b2].className=(beat!==undefined&&b2<=beat)?(b2===beat?'on cur':'on'):'';
  $('#jIn').textContent=(beat===undefined)?'':('in '+(bp-beat)+(bp-beat===1?' beat':' beats'));
}
function jamStart(){
  if(!J.seq.length) return; if(typeof recPause==='function') recPause(); J.cur=null; J.log=[]; $('#jLog').innerHTML='';
  var ok=bkStart({bpm:J.bpm,bpc:J.bpc,bpb:J.bpb,style:J.style,seq:J.snd,loop:true,countIn:J.count?1:0,vol:+$('#jVol').value});
  if(!ok){toast('Audio is not available in this browser.'); return;}
  J.running=true; $('#jGo').textContent='Stop'; $('#jGo').classList.remove('primary'); cancelAnimationFrame(J.raf); J.raf=requestAnimationFrame(jamTick);
}
function jamStop(){ bkStop(); J.running=false; $('#jGo').textContent='Start'; $('#jGo').classList.add('primary'); $('#jBeats').querySelectorAll('i').forEach(function(i){i.className=''}); $('#jIn').textContent=''; J.cur=null; }
function jamRestartIfRunning(){ if(J.running){jamStop(); jamStart();} else jamShow(J.idx); }
function jamListen(on){
  var btn=$('#jMic');
  if(!on){ clStop(); micStop(); J.listening=false; btn.textContent='Listen to me'; $('#jHeard').textContent='Mic is off. Tap "Listen to me" and strum along.'; return; }
  btn.textContent='Starting...';
  micStart(function(ok,msg){
    if(!ok){btn.textContent='Listen to me'; $('#jHeard').textContent=msg||'Could not start the mic.'; return;}
    clStart(); J.listening=true; btn.textContent='Stop listening'; $('#jHeard').textContent='Listening. Strum when you are ready.';
  });
}
function jamTick(){
  J.raf=requestAnimationFrame(jamTick); if(!ac) return;
  while(BK.q.length&&BK.q[0].t<=ac.currentTime){ jamEvent(BK.q.shift()); }
  if(J.listening&&J.cur&&!J.cur.count&&ac.currentTime-J.lastSample>.05){ J.lastSample=ac.currentTime; jamHear(); }
}
function jamEvent(e){
  if(e.count){ $('#jIn').textContent=''; $('#jHeard').textContent=J.listening?('Count in... '+e.left):('Count in... '+e.left); var bd=$('#jBeats'); jamShow(0,undefined); return; }
  if(e.end){jamStop(); return;}
  if(e.beat===0){ jamFinishSlot(); J.cur={slot:e.slot,idx:e.idx,sym:e.sym,start:e.t,run:0,runStart:null,done:false,prev:J.seq[(e.idx+J.seq.length-1)%J.seq.length],shown:J.seq[e.idx]}; }
  jamShow(e.idx,e.beat,e.bpc);
}
function jamHear(){
  var c=J.cur; if(!c) return; var r=clSample(c.sym); if(!r) return;
  if(r.quiet){ $('#jHeard').textContent='Waiting for a strum...'; $('#jHeard').className='heard'; c.run=0; c.runStart=null; return; }
  if(r.ok){ if(!c.runStart) c.runStart=ac.currentTime; c.run++; $('#jHeard').textContent='Hearing '+c.shown+'. Nice.'; $('#jHeard').className='heard good';
    if(c.run>=3&&!c.done){ c.done=true; c.delay=Math.max(0,c.runStart-c.start); jamRecord(c,true); } }
  else { c.run=0; c.runStart=null; $('#jHeard').textContent='Hearing '+(r.heard||'?')+(c.shown!==r.heard?'. You need '+c.shown+'.':''); $('#jHeard').className='heard bad'; }
}
function jamFinishSlot(){ var c=J.cur; if(!c||c.done||!J.listening||c.count) return; c.done=true; c.delay=null; jamRecord(c,false); }
function jamRecord(c,hit){
  if(!c.prev||c.prev===c.shown){ return; }
  var key=c.prev+'>'+c.shown; if(!save.chg) save.chg={}; var s=save.chg[key]||(save.chg[key]={n:0,sum:0,miss:0});
  s.n++; if(hit) s.sum+=c.delay; else s.miss++; persist();
  var beat=60/J.bpm, late=hit&&c.delay>beat*.6, chip=document.createElement('span'); chip.className='chip '+(hit?(late?'late':'good'):'miss');
  chip.textContent=c.prev+' → '+c.shown+' '+(hit?(c.delay<.12?'on the beat':c.delay.toFixed(1)+'s late'):'missed'); $('#jLog').insertBefore(chip,$('#jLog').firstChild); while($('#jLog').children.length>6) $('#jLog').removeChild($('#jLog').lastChild);
  jamStats();
  if(J.drill){ var good=hit&&!late; J.drill.streak=good?J.drill.streak+1:0; if(J.drill.streak>=4&&J.bpm<J.drill.target){ J.drill.streak=0; J.bpm=Math.min(J.drill.target,J.bpm+4); BK.bpm=J.bpm; $('#jBpm').value=J.bpm; $('#jBpmV').textContent=J.bpm; $('#jSub').textContent='Drill '+J.drill.pair.join(' ↔ ')+' · speeding up: '+J.bpm+' of '+J.drill.target+' bpm'; } }
}
function jamStats(){
  var el=$('#jStats'); if(!el) return; var rows=[]; var chg=save.chg||{};
  var pairs={}; J.sym.forEach(function(s,i){var n=J.sym[(i+1)%J.sym.length]; if(s!==n) pairs[s+'>'+n]=1});
  Object.keys(pairs).forEach(function(k){ var s=chg[k]; var a=k.split('>'), info=changeInfo(a[0],a[1]); rows.push({k:k,a:a,n:s?s.n:0,avg:s&&s.n-s.miss>0?s.sum/(s.n-s.miss):null,miss:s?s.miss:0,hard:info.hard,moves:info.moves}); });
  rows.sort(function(x,y){return (y.avg===null?(y.hard?9:0):y.avg+y.miss*.5)-(x.avg===null?(x.hard?9:0):x.avg+x.miss*.5)});
  if(!rows.length){el.textContent='This song has no chord changes.'; return;}
  el.innerHTML=''; rows.slice(0,8).forEach(function(r){
    var d=document.createElement('div'); d.className='srow';
    var label=r.a[0]+' → '+r.a[1], note=r.n?(r.avg===null?'no clean strums yet':'avg '+r.avg.toFixed(1)+'s'+(r.miss?', '+r.miss+' missed':'')):(r.hard?'looks hard':'not tried yet');
    d.innerHTML='<b></b><span></span>'; d.querySelector('b').textContent=label; d.querySelector('span').textContent=note+(r.moves!==null?' · '+r.moves+(r.moves===1?' finger':' fingers'):'');
    mkBtn(d,'Drill','',function(){jamDrill(r.a[0],r.a[1])}); el.appendChild(d);
  });
}
function jamDrill(a,b){
  if(J.running) jamStop(); J.drill={pair:[a,b],streak:0,target:Math.max(70,J.bpm)}; J.bpm=56; J.bpc=4; $('#jBpm').value=J.bpm; $('#jBpmV').textContent=J.bpm; $('#jBpc').value='4';
  jamRebuildSeq(); jamShow(0); $('#jSub').textContent='Drill '+a+' ↔ '+b+' · starts slow and speeds up after four clean changes.';
  var bar=$('#jChart'); if(!$('#jDrillBar')){var d=document.createElement('div'); d.id='jDrillBar'; d.className='drillbar'; bar.parentNode.insertBefore(d,bar);}
  $('#jDrillBar').innerHTML=''; var t=document.createElement('span'); t.textContent='Drilling '+a+' ↔ '+b; $('#jDrillBar').appendChild(t); mkBtn($('#jDrillBar'),'Back to the song','',function(){jamEndDrill()});
  if(!J.listening) jamListen(true); setTimeout(function(){jamStart()},400);
}
function jamEndDrill(){ if(J.running) jamStop(); J.drill=null; var d=$('#jDrillBar'); if(d) d.remove(); J.bpm=+($('#jBpm').value=J.bpm>120?100:80); $('#jBpmV').textContent=J.bpm; jamRebuildSeq(); renderChartDom(); jamShow(0); $('#jSub').textContent=''; }
function showJam(id){
  showView('jam'); jamBuild();
  var m=/^j:([a-z0-9-]+):(\d+)$/.exec(id);
  if(m){ var j=JAMS.filter(function(x){return x.id===m[1]})[0]; if(!j){location.hash='songs';return;} var key=+m[2];
    jamSetSong(j.name+' in '+KEYN(key),jamSeq(j,key),null,{bpm:j.bpm,bpc:j.bpc,solo:j.solo(key),sub:j.desc}); recOnSong(null); return; }
  var s=songsList().filter(function(x){return x.id===id})[0]; if(!s){location.hash='songs';return;}
  var ch=parseChart(s.text,s.title); jamSetSong(s.title,ch.seq,ch,{capo:ch.capo,sub:ch.keyGuess?'Key of '+ch.keyGuess:''}); recOnSong(s.id);
}
