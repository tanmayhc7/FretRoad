/* Play along with a real recording: add the song's mp3, tap once at each chord change to mark it, then the chart follows the
   recording and shows exactly when to switch, sweeping across the lyrics. The audio file stays on this device (IndexedDB);
   only the tap times are saved with the song. */
var REC={audio:null,url:null,songId:null,name:'',marks:[],tapping:false,raf:0,idx:-2,lag:.15,built:false,mem:{}};
/* index of the last mark at or before t, or -1 before the first one */
function recIndexAt(marks,t){ var lo=0,hi=marks.length-1,r=-1; while(lo<=hi){ var m=(lo+hi)>>1; if(marks[m]<=t){r=m;lo=m+1;} else hi=m-1; } return r; }
function recFmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60),x=Math.floor(s%60); return m+':'+(x<10?'0':'')+x; }
function recDb(){ return new Promise(function(res,rej){ try{ var r=indexedDB.open('fretroad-rec',1); r.onupgradeneeded=function(){r.result.createObjectStore('f')}; r.onsuccess=function(){res(r.result)}; r.onerror=function(){rej(r.error)}; }catch(e){rej(e)} }); }
function recPut(id,blob){ REC.mem[id]=blob; return recDb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('f','readwrite'); tx.objectStore('f').put(blob,id); tx.oncomplete=res; tx.onerror=function(){rej(tx.error)}; }); }).catch(function(){}); }
function recGet(id){ return recDb().then(function(db){ return new Promise(function(res){ var q=db.transaction('f').objectStore('f').get(id); q.onsuccess=function(){res(q.result||REC.mem[id]||null)}; q.onerror=function(){res(REC.mem[id]||null)}; }); }).catch(function(){return REC.mem[id]||null}); }
function recDelFile(id){ delete REC.mem[id]; recDb().then(function(db){ db.transaction('f','readwrite').objectStore('f').delete(id); }).catch(function(){}); }
function recSong(){ return songsList().filter(function(x){return x.id===REC.songId})[0]; }
function recSave(){ var s=recSong(); if(!s) return; s.marks=REC.marks.slice(); s.recName=REC.name; persist(); }
function recBuild(){
  if(REC.built) return; REC.built=true;
  var d=document.createElement('div'); d.className='gcard rec'; d.id='jRec'; d.hidden=true;
  d.innerHTML='<span class="lab">Play along with the recording</span><p class="jsub" id="jRecMsg"></p>'+
   '<div class="recrow" id="jRecPick"><label class="btn primary" for="jRecFile">Add the song file</label><input type="file" id="jRecFile" accept="audio/*,.mp3,.m4a,.wav,.ogg" hidden><span class="jsub">mp3, m4a, wav or ogg. It stays on this device and is never uploaded.</span></div>'+
   '<div id="jRecPlayer" hidden>'+
    '<div class="recrow"><button class="btn primary" id="jRecPlay">Play</button><input type="range" id="jRecSeek" min="0" max="1000" value="0" aria-label="Position in the song"><b id="jRecTime">0:00</b>'+
     '<label>Speed <select id="jRecRate"><option value=".5">50%</option><option value=".75">75%</option><option value="1" selected>100%</option></select></label></div>'+
    '<div class="recrow"><button class="btn" id="jRecMark">Mark the changes</button><button class="btn" id="jRecUndo" hidden>Undo last</button><button class="btn" id="jRecDone" hidden>Finish here</button>'+
     '<button class="btn quiet" id="jRecEarly" title="Move every mark a little earlier">Marks earlier</button><button class="btn quiet" id="jRecLate" title="Move every mark a little later">Marks later</button>'+
     '<button class="btn quiet" id="jRecClear">Clear marks</button><label class="btn quiet" for="jRecFile">Change file</label></div>'+
    '<button class="btn primary big" id="jRecTap" hidden>Chord changes NOW</button>'+
   '</div>';
  var ch=$('#jChart'); ch.parentNode.insertBefore(d,ch);
  $('#jRecFile').addEventListener('change',function(){ if(this.files[0]) recAttach(this.files[0],this.files[0].name,true); this.value=''; });
  $('#jRecPlay').addEventListener('click',function(){ REC.audio&&REC.audio.paused?recPlay():recPause(); });
  $('#jRecSeek').addEventListener('input',function(){ if(REC.audio&&REC.audio.duration) REC.audio.currentTime=this.value/1000*REC.audio.duration; recFrame(true); });
  $('#jRecRate').addEventListener('change',function(){ if(REC.audio) REC.audio.playbackRate=+this.value; });
  $('#jRecMark').addEventListener('click',function(){ REC.tapping?recEndTap(false):recBeginTap(); });
  $('#jRecDone').addEventListener('click',function(){ recEndTap(true); });
  $('#jRecUndo').addEventListener('click',function(){ if(REC.marks.length){ REC.marks.pop(); jamShow(REC.marks.length); recRender(); } });
  $('#jRecClear').addEventListener('click',function(){ REC.marks=[]; recSave(); REC.idx=-2; recRender(); jamShow(0); });
  $('#jRecEarly').addEventListener('click',function(){ recNudge(-.05); }); $('#jRecLate').addEventListener('click',function(){ recNudge(.05); });
  var tap=$('#jRecTap'); tap.addEventListener('pointerdown',function(e){ e.preventDefault(); recTap(); }); tap.addEventListener('click',function(e){ e.preventDefault(); });
  document.addEventListener('keydown',function(e){ if(REC.tapping&&e.code==='Space'&&!/^(INPUT|SELECT|TEXTAREA)$/.test((e.target||{}).tagName||'')){ e.preventDefault(); recTap(); } });
  $('#jChart').addEventListener('click',function(e){ var sg=e.target.closest&&e.target.closest('.seg'); if(!sg||!REC.audio||REC.tapping) return; var m=REC.marks[+sg.dataset.i]; if(m!==undefined){ REC.audio.currentTime=Math.max(0,m-.6); recFrame(true); } });
}
function recOnSong(id){
  recBuild(); recPause(); recDetach(); REC.songId=id; REC.marks=[]; REC.tapping=false; REC.idx=-2; REC.name='';
  var box=$('#jRec'); box.hidden=!id; if(!id) return;
  var s=recSong(); REC.marks=(s&&s.marks||[]).slice(); REC.name=(s&&s.recName)||'';
  $('#jRecPlayer').hidden=true; $('#jRecMsg').textContent='Add the recording, then tap along once to mark every chord change. After that the chart follows the song and shows you exactly when to switch.';
  recGet(id).then(function(b){ if(b&&REC.songId===id) recAttach(b,REC.name,false); });
  recRender();
}
function recDetach(){ if(REC.audio){ REC.audio.pause(); REC.audio.removeAttribute('src'); REC.audio=null; } if(REC.url){ URL.revokeObjectURL(REC.url); REC.url=null; } }
function recAttach(blob,name,fresh){
  recDetach(); REC.name=name||REC.name; if(fresh&&REC.songId){ recPut(REC.songId,blob); REC.marks=[]; recSave(); }
  REC.url=URL.createObjectURL(blob); var a=new Audio(); a.src=REC.url; a.preload='auto'; a.preservesPitch=true; a.webkitPreservesPitch=true; a.playbackRate=+$('#jRecRate').value; REC.audio=a;
  a.addEventListener('ended',function(){ recPause(); }); a.addEventListener('loadedmetadata',recRender);
  a.addEventListener('error',function(){ $('#jRecMsg').textContent='This browser could not play that file. Try an mp3 or m4a.'; });
  recRender();
}
function recRender(){
  var has=!!REC.audio; $('#jRecPlayer').hidden=!has; $('#jRecPick').hidden=has;
  if(!REC.songId) return; var n=REC.marks.length,tot=J.seq.length;
  var ready=n>0;
  $('#jRecMark').textContent=REC.tapping?'Stop marking':(ready?'Mark again':'Mark the changes');
  $('#jRecUndo').hidden=!REC.tapping; $('#jRecDone').hidden=!REC.tapping; $('#jRecTap').hidden=!REC.tapping;
  $('#jRecClear').hidden=!ready||REC.tapping; $('#jRecEarly').hidden=$('#jRecLate').hidden=!ready||REC.tapping;
  if(has) $('#jRecMsg').textContent=REC.tapping?('Tap each time the chord changes: '+n+' of '+tot+' marked. Space works too. Slow the speed down if it is hard to keep up.')
    :(ready?('Ready: '+n+' of '+tot+' changes marked. Press Play and follow the sweep across the lyrics. Click any chord to jump there.'+(n<tot?' The chart has more chords than you marked, so the rest will not light up.':''))
    :'Press "Mark the changes" and tap along once: the first tap is when the first chord starts, then one tap for every change.');
  $('#jRecPlay').textContent=has&&!REC.audio.paused?'Pause':'Play';
}
function recBeginTap(){
  if(!REC.audio) return; if(J.running) jamStop();
  REC.marks=[]; REC.tapping=true; REC.audio.currentTime=0; jamShow(0); recPlay(); recRender();
}
function recTap(){
  if(!REC.tapping||!REC.audio) return; var last=REC.marks.length?REC.marks[REC.marks.length-1]:-1;
  var t=Math.max(0,REC.audio.currentTime-REC.lag*REC.audio.playbackRate); if(t<=last) t=last+.05;
  REC.marks.push(t); if(REC.marks.length>=J.seq.length){ recEndTap(true); return; } jamShow(REC.marks.length); recRender();
}
function recEndTap(keep){
  REC.tapping=false; recPause(); if(keep&&REC.marks.length){ recSave(); toast('Marked '+REC.marks.length+' chord changes.'); } else if(!keep){ REC.marks=(recSong()&&recSong().marks||[]).slice(); }
  REC.idx=-2; recRender(); jamShow(0);
}
function recNudge(d){ REC.marks=REC.marks.map(function(m){return Math.max(0,m+d)}); recSave(); }
function recPlaying(){ return !!(REC.audio&&!REC.audio.paused); }
function recPlay(){
  if(!REC.audio) return; if(J.running) jamStop();
  if(typeof initAudio==='function') initAudio();
  var p=REC.audio.play(); if(p&&p.catch) p.catch(function(){ $('#jRecMsg').textContent='Tap Play again: the browser wants a tap before it plays sound.'; });
  cancelAnimationFrame(REC.raf); REC.raf=requestAnimationFrame(recTickLoop); recRender();
}
function recPause(){ if(REC.audio) REC.audio.pause(); cancelAnimationFrame(REC.raf); document.querySelectorAll('#jChart .seg.soon').forEach(function(s){s.classList.remove('soon')}); if(REC.built&&$('#jRecPlay')) recRender(); }
function recLeave(){ REC.tapping=false; recPause(); }
function recTickLoop(){ recFrame(false); if(recPlaying()) REC.raf=requestAnimationFrame(recTickLoop); }
function recFrame(force){
  var a=REC.audio; if(!a) return; var t=a.currentTime;
  $('#jRecTime').textContent=recFmt(t)+' / '+recFmt(a.duration); if(a.duration) $('#jRecSeek').value=Math.round(t/a.duration*1000);
  if(REC.tapping||!REC.marks.length) return;
  var i=recIndexAt(REC.marks,t);
  if(i!==REC.idx||force){
    if(typeof jamFinishSlot==='function'&&REC.idx>=0) jamFinishSlot();
    REC.idx=i;
    if(i>=0){ jamShow(i);
      if(J.listening&&typeof ac!=='undefined'&&ac) J.cur={slot:i,idx:i,sym:J.snd[i],start:ac.currentTime,run:0,runStart:null,done:false,prev:J.seq[(i+J.seq.length-1)%J.seq.length],shown:J.seq[i]}; }
    document.querySelectorAll('#jChart .seg.soon').forEach(function(s){s.classList.remove('soon')});
  }
  if(i<0){ var first=REC.marks[0]-t; $('#jIn').textContent=first>0?('first chord in '+first.toFixed(1)+'s'):''; return; }
  var st=REC.marks[i], en=REC.marks[i+1], now=document.querySelector('#jChart .seg.now');
  if(en===undefined){ if(now) now.style.setProperty('--p',0); $('#jIn').textContent=''; return; }
  var p=Math.min(1,Math.max(0,(t-st)/(en-st)), 1), left=(en-t)/Math.max(.25,a.playbackRate);
  if(now) now.style.setProperty('--p',p.toFixed(3));
  $('#jIn').textContent='in '+Math.max(0,left).toFixed(1)+'s';
  var nx=document.querySelector('#jChart .seg[data-i="'+(i+1)+'"]'); if(nx) nx.classList.toggle('soon',left<.9);
  if(J.listening&&J.cur&&typeof ac!=='undefined'&&ac&&ac.currentTime-J.lastSample>.05){ J.lastSample=ac.currentTime; jamHear(); }
}
