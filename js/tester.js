/* Tester panel: a checklist of the features that could not be tried on a real guitar or device, links straight to each,
   a mic lab (level, hit detector, note, chord) and a report you can copy. Only active in the tester build. */
if(TESTER){ (function(){
  var NK='fretroad-tester-notes', st={}; try{ st=JSON.parse(localStorage.getItem(NK)||'{}')||{}; }catch(e){}
  function keep(){ try{localStorage.setItem(NK,JSON.stringify(st))}catch(e){} }
  var ITEMS=[
   ['Mic: rhythm',[
    ['strumrh','Strum in Time','#practice-playstrumrh','Mute the strings, strum along. Do your strums turn the slots green? Any phantom extra hits from string ring? Does early/late feedback match how it felt? If hits never register, say whether you used the mic or Tap.'],
    ['read','Rhythm Reading','#practice-rhythmread','Same as above with random bars. Do the silent slots stay silent for you?'],
    ['odd','Odd-Meter Comping','#practice-oddcomp','Strum on each group start in 7/8, 5/8, 5/4, 9/8. Are the click levels clear enough to find the groups?'],
    ['scale','Scale Runner timing score','#practice-playscale','Play a scale steadily, then a sloppy one. Does the Timing line move in the right direction?']]],
   ['Mic: notes and chords',[
    ['strumchk','Strum Check','#practice-playstrum','Strum open chords normally. Does it accept clean chords and reject muted or wrong ones? Which chords are unreliable?'],
    ['gym','Finger Gym','#practice-spiderwalk','Play the 12-note walk. Any note it fails to hear (low strings? fast notes)?'],
    ['jam','Play-along chord listening','#jam-j:folk:0','Strum along to a jam track with the mic on. Does it follow your changes? Is the timing readout believable?'],
    ['lab','Mic lab (below)','','Use the mic lab at the bottom of this panel: one pluck should flash the hit light once. Report double flashes or misses.']]],
   ['New drills: do the answers match what you know?',[
    ['neck','Melody on the Neck','#practice-melodyneck','Is the tune easy to follow? Do clicks play the note you clicked?'],
    ['transcribe','Transcribe by Ear','#practice-transcribe','Five notes, key only. Fair or too hard?'],
    ['tri','Triads on String Sets','#practice-triadsets','Check a few answers on your own guitar. Do the frets spell the chord?'],
    ['pent','Pentatonic Boxes','#practice-pentboxes','Do the box start frets match what you play?'],
    ['caged','The CAGED System','#practice-caged','Do the fret positions match your own CAGED knowledge?'],
    ['poly','Polyrhythms','#practice-poly','Anything confusing or wrong?'],
    ['sprint','Fretboard Sprint','#practice-sprint','Is the timer and fastest-run message right?'],
    ['vamps','Modal vamps','#jam-j:dorian:2','Dorian, Mixolydian, Lydian, Phrygian: do the solo hints sound right over the backing?']]],
   ['Look and feel',[
    ['world','Scenery on your devices','#map','Try all three stories. Safari: are map names sharp? Brave: do cards fill instantly when scrolling? Jungle on a slow device? Settings → Scenery motion → Calm should fix any lag.'],
    ['rem','Daily reminder','','Settings → Daily reminder. Does the notification appear? Does the .ics download open in your calendar?'],
    ['tour','First-visit tour','','Use "Take the tour". Does every step point at the right thing, on phone width too?'],
    ['import','Song import: PDF and photo','#songs','Needs internet (loads PDF.js and Tesseract). Try a chord-chart PDF and a photo. Are the chords read correctly?'],
    ['lefty','Left-handed mode','#sandbox','Settings → Left-handed. Fretboard, chord diagrams and play-along should mirror.']]]
  ];
  function el(t,c,h){var e=document.createElement(t); if(c) e.className=c; if(h!==undefined) e.innerHTML=h; return e;}
  var btn=el('button','tst-btn','Tester'); document.body.appendChild(btn);
  var ov=el('div','tst-ov'); ov.hidden=true; document.body.appendChild(ov);
  function build(){
    ov.innerHTML=''; var p=el('div','tst-panel'); ov.appendChild(p);
    p.appendChild(el('h2','','Tester build'));
    p.appendChild(el('p','tst-sub','Every stop and drill is unlocked and your real progress is untouched (this build keeps its own save). Tick what works, note what does not, then copy the report to send back.'));
    ITEMS.forEach(function(g){
      p.appendChild(el('h3','',g[0]));
      g[1].forEach(function(it){
        var r=el('div','tst-item'), s=st[it[0]]||(st[it[0]]={ok:false,note:''});
        var top=el('label','tst-top'); var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=s.ok; cb.addEventListener('change',function(){s.ok=cb.checked; keep();});
        top.appendChild(cb); top.appendChild(el('b','',it[1])); r.appendChild(top); r.appendChild(el('p','tst-how',it[3]));
        var row=el('div','tst-row');
        if(it[2]){ var go=el('button','btn',it[2]==='#map'?'Open map':'Open'); go.addEventListener('click',function(){ ov.hidden=true; location.hash=it[2].slice(1); }); row.appendChild(go); }
        if(it[0]==='rem'){ var b2=el('button','btn','Open settings'); b2.addEventListener('click',function(){ov.hidden=true; openPrefs();}); row.appendChild(b2); }
        if(it[0]==='tour'){ var b3=el('button','btn','Start tour'); b3.addEventListener('click',function(){ov.hidden=true; tourStart();}); row.appendChild(b3); }
        if(it[0]==='lefty'){ var b4=el('button','btn','Open settings'); b4.addEventListener('click',function(){ov.hidden=true; openPrefs();}); row.appendChild(b4); }
        var nt=document.createElement('input'); nt.type='text'; nt.placeholder='What happened?'; nt.value=s.note; nt.addEventListener('input',function(){s.note=nt.value; keep();}); row.appendChild(nt);
        r.appendChild(row); p.appendChild(r);
      });
    });
    p.appendChild(el('h3','','Mic lab'));
    p.appendChild(el('p','tst-how','Turn it on, pluck a string, strum a chord, clap. The light flashes on every detected hit; the readout shows the level, the note, and the closest chord.'));
    var lab=el('div','tst-lab','<div class="lvl"><i id="tlLvl"></i></div><span class="hit" id="tlHit">hit</span><span id="tlNote">–</span><span id="tlChord">–</span><span id="tlCount">0 hits</span>'); p.appendChild(lab);
    var lr=el('div','tst-row'); var mb=el('button','btn',Mic.on?'Stop mic lab':'Start mic lab'); mb.addEventListener('click',function(){ labToggle(mb); }); lr.appendChild(mb); p.appendChild(lr);
    var acts=el('div','tst-row tst-acts'); p.appendChild(acts);
    var cp=el('button','btn primary','Copy report'); cp.addEventListener('click',function(){copyReport(cp)}); acts.appendChild(cp);
    var rs=el('button','btn quiet','Reset tester progress'); rs.addEventListener('click',function(){ try{localStorage.removeItem(KEY); localStorage.removeItem(NK);}catch(e){} location.reload(); }); acts.appendChild(rs);
    var cl=el('button','btn','Close'); cl.addEventListener('click',function(){ov.hidden=true; labStop();}); acts.appendChild(cl);
  }
  var lab={timer:0,n:0};
  function labToggle(mb){ if(Mic.on){ labStop(); mb.textContent='Start mic lab'; return; } mb.disabled=true; micStart(function(ok,msg){ mb.disabled=false; if(!ok){ document.getElementById('tlNote').textContent=msg||'mic unavailable'; return; } mb.textContent='Stop mic lab'; labRun(); }); }
  function labRun(){
    lab.n=0; onsStart(); ONS.cb=function(){ lab.n++; var h=document.getElementById('tlHit'); if(h){ h.classList.add('on'); setTimeout(function(){h.classList.remove('on')},120); document.getElementById('tlCount').textContent=lab.n+' hits'; } };
    clStart(); clearInterval(lab.timer); lab.timer=setInterval(function(){
      if(!Mic.on||!document.getElementById('tlLvl')) return clearInterval(lab.timer);
      var r=micRead(); document.getElementById('tlLvl').style.width=Math.min(100,Math.round(r.rms*900))+'%'; document.getElementById('tlNote').textContent=r.note?(r.note.name+' '+(r.note.cents>0?'+':'')+r.note.cents+'c'):'–';
      var c=clSample('C'); document.getElementById('tlChord').textContent=(c&&c.heard&&!c.quiet)?c.heard:'–';
    },80);
  }
  function labStop(){ clearInterval(lab.timer); if(window.clStop) clStop(); onsStop(); if(Mic.on) micStop(); }
  function report(){
    var l=['fretRoad tester report','Device: '+navigator.userAgent,'Screen: '+screen.width+'x'+screen.height+' @'+(window.devicePixelRatio||1)+'x, window '+innerWidth+'x'+innerHeight,'Audio: '+(window.ac?('latency '+Math.round(((ac.baseLatency||0)+(ac.outputLatency||0))*1000)+' ms'):'not started yet'),'Scenery motion: '+(save.motion||'auto'),''];
    ITEMS.forEach(function(g){ g[1].forEach(function(it){ var s=st[it[0]]||{}; l.push((s.ok?'[x] ':'[ ] ')+it[1]+(s.note?': '+s.note:'')); }); });
    return l.join('\n');
  }
  function copyReport(b){
    var t=report(); function done(){ b.textContent='Copied'; setTimeout(function(){b.textContent='Copy report'},1600); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,function(){fallback(t,done)}); else fallback(t,done);
  }
  function fallback(t,done){ var ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); done();}catch(e){} document.body.removeChild(ta); }
  btn.addEventListener('click',function(){ build(); ov.hidden=false; });
  ov.addEventListener('click',function(e){ if(e.target===ov){ ov.hidden=true; labStop(); } });
  if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.testerReport=report;
})(); }
