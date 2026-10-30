/* Riff helper panel (inside the recording card) and the "AI settings" form. */
var RF={t0:0,t1:0,last:null,busy:false};
function riffBuild(card){
  var d=document.createElement('details'); d.className='riffbox'; d.id='jRiff';
  d.innerHTML='<summary>Riff helper: work out a single-note riff from the recording</summary>'+
   '<p class="jsub">Pick a short bit (a few seconds, one note at a time works best, not chords) and I will list its notes and suggest where to play them. Optional: ask your own AI model to explain how to play it.</p>'+
   '<div class="recrow"><button class="btn" id="rfStart">Start here</button><b id="rfS">0:00</b><button class="btn" id="rfEnd">End here</button><b id="rfE">0:00</b><button class="btn" id="rfHear">Hear this bit</button><button class="btn primary" id="rfRead">Read the notes</button></div>'+
   '<p class="jsub" id="rfMsg"></p><pre class="rftab" id="rfTab" hidden></pre>'+
   '<div class="recrow"><button class="btn" id="rfAsk" hidden>Ask my AI model</button><button class="btn quiet" id="rfSet">AI settings</button></div>'+
   '<div class="rfai" id="rfAI" hidden></div><div class="rfset" id="rfSettings" hidden></div>';
  card.appendChild(d);
  $('#rfStart').addEventListener('click',function(){ RF.t0=REC.audio?REC.audio.currentTime:0; $('#rfS').textContent=recFmt(RF.t0); });
  $('#rfEnd').addEventListener('click',function(){ RF.t1=REC.audio?REC.audio.currentTime:0; $('#rfE').textContent=recFmt(RF.t1); });
  $('#rfHear').addEventListener('click',function(){ if(!REC.audio||RF.t1<=RF.t0) return; REC.audio.currentTime=RF.t0; recPlay(); var ms=(RF.t1-RF.t0)/REC.audio.playbackRate*1000; setTimeout(function(){ recPause(); },ms); });
  $('#rfRead').addEventListener('click',riffRead);
  $('#rfAsk').addEventListener('click',riffAsk); $('#rfSet').addEventListener('click',function(){ aiOpenDialog(); });
  riffRefreshAsk();
}
function riffRefreshAsk(){ var b=$('#rfAsk'); if(b) b.hidden=!(aiConfigured()&&RF.last); }
function riffRead(){
  var msg=$('#rfMsg'); if(RF.busy) return; if(!REC.audio){ msg.textContent='Add the recording first.'; return; }
  if(RF.t1-RF.t0<.4){ msg.textContent='Play the song, press "Start here" at the start of the riff and "End here" at the end (a few seconds).'; return; }
  if(RF.t1-RF.t0>20){ msg.textContent='That is a long bit. Pick 20 seconds or less.'; return; }
  RF.busy=true; msg.textContent='Listening...';
  recGet(REC.songId).then(function(b){ if(!b) throw new Error('no file'); return recDecode(b); }).then(function(x){
    var notes=riffNotes(x,AN.sr,RF.t0,RF.t1,J.bpm), pos=riffPositions(notes,J.capo), tab=riffTabText(notes,pos);
    if(!notes.length){ msg.textContent='I could not hear clear single notes there. Try a bare, solo bit of the riff, or a slower speed in your own copy.'; RF.last=null; $('#rfTab').hidden=true; return; }
    var chord=''; if(REC.marks.length){ var i=recIndexAt(REC.marks,RF.t0); if(i>=0) chord=J.snd[i]||''; }
    RF.last={notes:notes,pos:pos,tab:tab,capo:J.capo,bpm:J.bpm,chord:chord};
    msg.textContent='Heard '+notes.length+' notes: '+notes.map(function(n){return n.name}).join(' ')+'. Check them against the recording: this is a first guess.';
    var pre=$('#rfTab'); pre.textContent=tab; pre.hidden=false;
  }).catch(function(e){ msg.textContent='I could not read that bit ('+((e&&e.message)||'error')+').'; })
  .then(function(){ RF.busy=false; riffRefreshAsk(); });
}
function riffAsk(){
  var out=$('#rfAI'); if(!RF.last) return; if(!aiConfigured()){ riffSettings(true); return; }
  var req=riffPrompt(RF.last); out.hidden=false; out.textContent='Asking your model...'; $('#rfAsk').disabled=true;
  aiAsk(req).then(function(t){ out.textContent=t; }).catch(function(e){ out.textContent='Your model did not answer: '+((e&&e.message)||'error'); }).then(function(){ $('#rfAsk').disabled=false; });
}
/* the settings form lives in the AI dialog (header button) and is also reachable from the riff helper */
function riffSettings(show){ if(show) aiOpenDialog(); else $('#aiOverlay').hidden=true; }
function aiOpenDialog(){ $('#aiOverlay').hidden=false; aiSettingsInto($('#aiSettingsHost')); }
function aiSettingsInto(box){
  box.innerHTML='';
  var cfg=aiCfg(), cur=AI.providers[cfg.provider]?cfg.provider:AI.order[0];
  var p1=document.createElement('p'); p1.className='jsub'; p1.textContent='Requests go straight from this browser to the address you give. Only notes, tab, capo, tempo and chord are sent (never audio). Your key is stored only in this browser.'; box.appendChild(p1);
  var lab=document.createElement('label'); lab.className='fld'; lab.textContent='Provider '; var sel=document.createElement('select'); sel.id='aiProv'; AI.order.forEach(function(id){ var o=document.createElement('option'); o.value=id; o.textContent=AI.providers[id].name; if(id===cur) o.selected=true; sel.appendChild(o); }); lab.appendChild(sel); box.appendChild(lab);
  var fields=document.createElement('div'); fields.id='aiFields'; box.appendChild(fields);
  function draw(){ fields.innerHTML=''; var id=sel.value,v=aiValues(id); AI.providers[id].fields.forEach(function(f){ var l=document.createElement('label'); l.className='fld'; l.textContent=f.label+' '; var i=document.createElement('input'); i.type=f.secret?'password':'text'; i.value=v[f.key]||''; i.dataset.k=f.key; i.autocomplete='off'; i.spellcheck=false; l.appendChild(i); fields.appendChild(l); }); }
  sel.addEventListener('change',draw); draw();
  var row=document.createElement('div'); row.className='row'; box.appendChild(row);
  function collect(){ var c=aiCfg(); c.provider=sel.value; c.vals=c.vals||{}; var o={}; fields.querySelectorAll('input').forEach(function(i){ o[i.dataset.k]=i.value.trim(); }); c.vals[sel.value]=o; return c; }
  var note=document.createElement('p'); note.className='jsub'; note.id='aiNote'; note.textContent=aiConfigured()?'A model is set up on this device.':'No model set up yet.';
  mkBtn(row,'Save','primary',function(){ aiSaveCfg(collect()); note.textContent='Saved on this device.'; riffRefreshAsk(); });
  mkBtn(row,'Test','',function(){ aiSaveCfg(collect()); note.textContent='Asking...'; aiAsk({task:'test',system:'Reply with the single word: ready',user:'Are you there?'}).then(function(t){ note.textContent='It answered: '+t.slice(0,80); riffRefreshAsk(); }).catch(function(e){ note.textContent=(e&&e.message)||'Failed'; }); });
  mkBtn(row,'Forget my settings','quiet',function(){ try{ localStorage.removeItem(AI.cfgKey); }catch(e){} aiSettingsInto(box); riffRefreshAsk(); });
  box.appendChild(note);
}
(function(){
  $('#aiBtn').addEventListener('click',aiOpenDialog); $('#aiClose').addEventListener('click',function(){ $('#aiOverlay').hidden=true; riffRefreshAsk(); });
  $('#aiOverlay').addEventListener('click',function(e){ if(e.target===$('#aiOverlay')) $('#aiOverlay').hidden=true; });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!$('#aiOverlay').hidden) $('#aiOverlay').hidden=true; });
})();
