/* Songs screen: your imported charts, the importer (paste, text/ChordPro files, PDF, photo) and jam tracks. */
var JAMS=[
  {id:'blues',name:'12-bar blues',desc:'The shuffle every guitarist learns.',key:9,bpm:84,bpc:4,chords:[[0,'7'],[0,'7'],[0,'7'],[0,'7'],[5,'7'],[5,'7'],[0,'7'],[0,'7'],[7,'7'],[5,'7'],[0,'7'],[7,'7']],solo:function(k){return KEYN(k)+' minor pentatonic, plus the blue note. Try box 1.'}},
  {id:'pop',name:'Four-chord pop',desc:'I, V, vi, IV. Half the radio.',key:7,bpm:96,bpc:4,chords:[[0,''],[7,''],[9,'m'],[5,'']],solo:function(k){return KEYN(k)+' major pentatonic is safe everywhere.'}},
  {id:'folk',name:'Folk strum',desc:'I, IV, V and home again. Great for open chords.',key:0,bpm:88,bpc:4,chords:[[0,''],[0,''],[5,''],[0,''],[7,''],[5,''],[0,''],[0,'']],solo:function(k){return KEYN(k)+' major pentatonic. Keep it simple and singable.'}},
  {id:'minor',name:'Minor groove',desc:'i, VII, VI, VII. Dark and rolling.',key:9,bpm:92,bpc:4,chords:[[0,'m'],[10,''],[8,''],[10,'']],solo:function(k){return KEYN(k)+' minor pentatonic. Bend into the fifth.'}},
  {id:'andalus',name:'Andalusian',desc:'i, VII, VI, V. Flamenco-flavoured.',key:9,bpm:100,bpc:4,chords:[[0,'m'],[10,''],[8,''],[7,'']],solo:function(k){return KEYN(k)+' minor pentatonic with the major third over the last chord.'}},
  {id:'ii-v-i',name:'ii, V, I (jazz)',desc:'The most common move in jazz. Slow and smooth.',key:0,bpm:76,bpc:4,chords:[[2,'m7'],[7,'7'],[0,'maj7'],[0,'maj7']],solo:function(k){return KEYN(k)+' major scale. Land on the third of each chord.'}},
  {id:'dorian',name:'Dorian vamp',desc:'One minor 7th chord with a visit to the IV. The funky, jazzy minor.',key:2,bpm:96,bpc:4,chords:[[0,'m7'],[0,'m7'],[0,'m7'],[5,'7']],solo:function(k){return KEYN(k)+' Dorian: same notes as '+KEYN((k+10)%12)+' major, but home is '+KEYN(k)+'. Lean on the natural 6th, '+KEYN((k+9)%12)+', for the Dorian colour.'}},
  {id:'mixo',name:'Mixolydian vamp',desc:'I and flat VII. Rock, folk and Celtic energy.',key:7,bpm:104,bpc:4,chords:[[0,''],[0,''],[10,''],[0,'']],solo:function(k){return KEYN(k)+' Mixolydian: same notes as '+KEYN((k+5)%12)+' major. The flat 7, '+KEYN((k+10)%12)+', is the sound. Try '+KEYN(k)+' major pentatonic plus that note.'}},
  {id:'lydian',name:'Lydian vamp',desc:'I and II over a major 7th. Floating and cinematic.',key:5,bpm:80,bpc:4,chords:[[0,'maj7'],[0,'maj7'],[2,''],[0,'maj7']],solo:function(k){return KEYN(k)+' Lydian: same notes as '+KEYN((k+7)%12)+' major. Hang on the raised 4th, '+KEYN((k+6)%12)+', and resolve back to '+KEYN(k)+'.'}},
  {id:'phrygian',name:'Phrygian vamp',desc:'Minor chord with a flat II above it. Metal and flamenco.',key:4,bpm:92,bpc:4,chords:[[0,'m'],[0,'m'],[1,''],[0,'m']],solo:function(k){return KEYN(k)+' Phrygian: same notes as '+KEYN((k+8)%12)+' major. The flat 2, '+KEYN((k+1)%12)+', gives the dark, Spanish sound; slide into it from '+KEYN(k)+'.'}}
];
function KEYN(pc){return SHARP_NAMES[pc]}
function jamSeq(j,key){return j.chords.map(function(c){return SHARP_NAMES[(key+c[0])%12]+c[1]})}
function newId(){return 's'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36)}
function songsList(){return save.songs||(save.songs=[])}
function showSongs(){
  showView('songs'); var list=songsList(), g=$('#songList'); g.innerHTML='';
  if(!list.length){var e=document.createElement('p'); e.className='empty'; e.textContent='No songs yet. Paste a chord chart below, or drop in a file or photo.'; g.appendChild(e);}
  list.forEach(function(s){
    var ch=parseChart(s.text,s.title), u=uniqueChords(ch.seq);
    var c=document.createElement('div'); c.className='songcard';
    c.innerHTML='<h3></h3><p class="meta"></p><div class="chips"></div><div class="acts"></div>';
    c.querySelector('h3').textContent=s.title; c.querySelector('.meta').textContent=(ch.keyGuess?'Key of '+ch.keyGuess+' · ':'')+u.length+' chords · '+ch.seq.length+' changes';
    var chips=c.querySelector('.chips'); u.slice(0,10).forEach(function(x){var i=document.createElement('i'); i.textContent=x; chips.appendChild(i)});
    var a=c.querySelector('.acts');
    mkBtn(a,'Play along','primary',function(){location.hash='jam-'+s.id});
    mkBtn(a,'Edit','',function(){openImport(s)});
    mkBtn(a,'Delete','quiet',function(){ if(c.dataset.sure){save.songs=songsList().filter(function(x){return x.id!==s.id}); if(typeof recDelFile==='function') recDelFile(s.id); persist(); showSongs();} else {c.dataset.sure='1'; this.textContent='Press again to delete'; setTimeout(function(){c.dataset.sure=''; showSongs();},3000)} });
    g.appendChild(c);
  });
  var jl=$('#jamList'); jl.innerHTML='';
  JAMS.forEach(function(j){
    var c=document.createElement('div'); c.className='songcard jam'; c.innerHTML='<h3></h3><p class="meta"></p><div class="acts"></div>';
    c.querySelector('h3').textContent=j.name; c.querySelector('.meta').textContent=j.desc;
    var a=c.querySelector('.acts'), sel=document.createElement('select'); sel.setAttribute('aria-label','Key for '+j.name);
    SHARP_NAMES.forEach(function(n,i){var o=document.createElement('option'); o.value=i; o.textContent=n+(j.chords[0][1].charAt(0)==='m'&&j.id!=='ii-v-i'?' minor':' '); if(i===j.key) o.selected=true; sel.appendChild(o)});
    a.appendChild(sel); mkBtn(a,'Jam','primary',function(){location.hash='jam-j:'+j.id+':'+sel.value});
    jl.appendChild(c);
  });
  var d=$('#warmCard'); if(d) d.hidden=true;
}
/* ---- importer ---- */
var IMP={editId:null};
function openImport(song){
  IMP.editId=song?song.id:null; $('#impTitle').value=song?song.title:''; $('#impText').value=song?song.text:''; $('#impHint').textContent=''; impPreview();
  $('#songAdd').hidden=false; $('#songAdd').scrollIntoView({behavior:'smooth',block:'start'});
}
function impPreview(){
  var t=$('#impText').value, ch=parseChart(t,$('#impTitle').value), u=uniqueChords(ch.seq), box=$('#impChips'); box.innerHTML='';
  if(!t.trim()){ $('#impStat').textContent=''; return; }
  $('#impStat').textContent=u.length?('Found '+u.length+' different chords and '+ch.seq.length+' changes'+(ch.keyGuess?', probably in '+ch.keyGuess:'')+'.'):'No chords found yet. Chords go on their own line above the words, or in [brackets] inside the lyrics.';
  u.forEach(function(x){var i=document.createElement('i'); i.textContent=x; if(!chordShape(x)) i.className='nodia'; box.appendChild(i)});
  if(!$('#impTitle').value&&ch.title&&ch.title!=='Untitled') $('#impTitle').placeholder=ch.title;
}
function impSave(){
  var text=$('#impText').value, ch=parseChart(text,$('#impTitle').value);
  if(!ch.seq.length){$('#impHint').textContent='I could not find any chords in that text.'; return;}
  var title=$('#impTitle').value.trim()||ch.title, list=songsList();
  if(IMP.editId){var s=list.filter(function(x){return x.id===IMP.editId})[0]; if(s){s.title=title; s.text=text;}}
  else list.unshift({id:newId(),title:title,text:text});
  persist(); $('#songAdd').hidden=true; $('#impText').value=''; $('#impTitle').value=''; IMP.editId=null; showSongs(); toast('Song saved.');
}
function loadScriptOnce(url){return new Promise(function(res,rej){ if(document.querySelector('script[data-src="'+url+'"]')) return res(); var s=document.createElement('script'); s.src=url; s.dataset.src=url; s.onload=res; s.onerror=function(){rej(new Error('offline'))}; document.head.appendChild(s); });}
/* group PDF text items into lines, keeping horizontal position so chords stay above their words */
function pdfItemsToText(items){
  var rows={}, ys=[]; items.forEach(function(it){var y=Math.round(it.transform[5]/3)*3; if(!rows[y]){rows[y]=[];ys.push(y)} rows[y].push(it)});
  ys.sort(function(a,b){return b-a});
  var cw=0,n=0; items.forEach(function(it){if(it.str.trim()&&it.width){cw+=it.width/it.str.length;n++}}); cw=n?cw/n:5.5;
  return ys.map(function(y){var line='',r=rows[y].sort(function(a,b){return a.transform[4]-b.transform[4]});
    r.forEach(function(it){var col=Math.round(it.transform[4]/cw); while(line.length<col) line+=' '; if(line.length&&!/\s$/.test(line)&&col<=line.length) line+=' '; line+=it.str}); return line.replace(/\s+$/,'');}).join('\n');
}
/* OCR: one worker for all pages; words come back with positions, ocr.js rebuilds chords-over-lyrics from them */
function ocrRun(sources,hint){
  return loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js').then(function(){
    return Tesseract.createWorker('eng');
  }).then(function(worker){
    var texts=[],i=0;
    return worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'}).then(function(){
      function next(){
        if(i>=sources.length) return worker.terminate().then(function(){return texts});
        hint.textContent=sources.length>1?('Reading page '+(i+1)+' of '+sources.length+'. The first page can take half a minute.'):'Reading the picture. The first time can take half a minute.';
        return worker.recognize(sources[i++],{},{tsv:true,blocks:true}).then(function(r){
          var words=ocrWordsFromResult(r.data), t=words?ocrWordsToText(words):String(r.data.text||'');
          texts.push(t); return next();
        });
      }
      return next();
    });
  });
}
/* a PDF whose pages are pictures: draw each page to a canvas and read it */
function ocrPdf(pdf,hint){
  var pages=[]; for(var p=1;p<=pdf.numPages;p++) pages.push(p);
  return pages.reduce(function(chain,p){ return chain.then(function(list){
    return pdf.getPage(p).then(function(pg){
      var v0=pg.getViewport({scale:1}), sc=Math.min(3,Math.max(1.5,1700/v0.width)), vp=pg.getViewport({scale:sc});
      var cv=document.createElement('canvas'); cv.width=Math.round(vp.width); cv.height=Math.round(vp.height);
      return pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise.then(function(){ list.push(cv); return list; });
    });
  }); },Promise.resolve([])).then(function(canvases){ return ocrRun(canvases,hint); }).then(function(texts){
    var t=texts.join('\n\n').trim(); if(t.replace(/\s/g,'').length<10) throw new Error('ocr-empty'); return t;
  });
}
function importFile(f){
  var hint=$('#impHint'), name=(f.name||'').toLowerCase();
  var done=function(text){ $('#impText').value=text; if(!$('#impTitle').value) $('#impTitle').value=f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' '); impPreview(); hint.textContent='Check the chords below and fix anything the reader got wrong, then save.'; };
  if(/\.(txt|cho|crd|pro|chordpro|md)$/.test(name)||f.type.indexOf('text')===0){ var r=new FileReader(); r.onload=function(){done(String(r.result))}; r.readAsText(f); return; }
  if(/\.pdf$/.test(name)||f.type==='application/pdf'){
    hint.textContent='Reading the PDF...';
    loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js').then(function(){
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return f.arrayBuffer().then(function(buf){return pdfjsLib.getDocument({data:buf}).promise});
    }).then(function(pdf){
      IMP.pdf=pdf;
      var jobs=[]; for(var p=1;p<=pdf.numPages;p++) jobs.push(pdf.getPage(p).then(function(pg){return pg.getTextContent()}).then(function(tc){return pdfItemsToText(tc.items)}));
      return Promise.all(jobs);
    }).then(function(pages){ var t=pages.join('\n\n'); if(t.replace(/\s/g,'').length<20){ return ocrPdf(IMP.pdf,hint).then(function(txt){ done(txt); hint.textContent='Read from the page pictures. Check every chord and where it sits over the words, then save.'; }); } else done(t); })
    .catch(function(e){hint.textContent=(e&&e.message==='ocr-empty')?'I could not find any text in that PDF. Try a clearer or larger copy, or paste the chords.':'I could not read that PDF here. If you are offline, paste the text instead.'});
    return;
  }
  if(/^image\//.test(f.type)||/\.(png|jpe?g|heic|webp)$/.test(name)){
    hint.textContent='Reading the photo. The first time can take half a minute.';
    ocrRun([f],hint).then(function(texts){ done(texts.join('\n\n')); hint.textContent='Photo read. Spacing is often off in photos, so check every chord and where it sits over the words before saving.'; })
    .catch(function(){hint.textContent='I could not read that photo here. If you are offline, type or paste the chords instead.'});
    return;
  }
  hint.textContent='I can read .txt, ChordPro, PDF and photo files.';
}
(function(){
  $('#songsBtn').addEventListener('click',function(){location.hash='songs'});
  $('#impText').addEventListener('input',impPreview); $('#impTitle').addEventListener('input',impPreview);
  $('#impSave').addEventListener('click',impSave); $('#impCancel').addEventListener('click',function(){$('#songAdd').hidden=true});
  $('#addSongBtn').addEventListener('click',function(){openImport(null)});
  $('#impFile').addEventListener('change',function(){ if(this.files[0]) importFile(this.files[0]); this.value=''; });
  var dz=$('#impDrop'); ['dragenter','dragover'].forEach(function(e){dz.addEventListener(e,function(ev){ev.preventDefault(); dz.classList.add('over')})});
  ['dragleave','drop'].forEach(function(e){dz.addEventListener(e,function(ev){ev.preventDefault(); dz.classList.remove('over')})});
  dz.addEventListener('drop',function(ev){var f=ev.dataTransfer.files[0]; if(f) importFile(f)});
  $('#songsBack').addEventListener('click',function(){location.hash='map'});
})();
