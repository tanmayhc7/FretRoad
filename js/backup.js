/* Save progress to a file and load it back, so it can move between browsers and devices. */
function exportProgress(){
  var data=JSON.stringify({app:'fretroad',version:1,saved:new Date().toISOString(),progress:save},null,2);
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  a.download='fretroad-progress.json'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},2000); toast('Progress saved to a file.');
}
function importProgress(file){
  var r=new FileReader();
  r.onload=function(){
    var o; try{o=JSON.parse(r.result)}catch(e){return toast('That file is not valid JSON.')}
    var p=o&&o.app==='fretroad'?o.progress:null;
    if(!p||!Array.isArray(p.done)) return toast('That does not look like a FretRoad progress file.');
    p.passed=Array.isArray(p.passed)?p.passed:[]; p.best=p.best&&typeof p.best==='object'?p.best:{}; p.chSeen=Array.isArray(p.chSeen)?p.chSeen:[];
    save=p; save.intro=true; persist(); viewCh=-1;
    if(window.applyStory) applyStory(); drawMap(); updateStat(); toast('Progress loaded: '+save.done.length+' stops cleared.');
  };
  r.readAsText(file);
}
(function(){
  var foot=document.querySelector('#v-map .foot'); if(!foot) return;
  var s=document.createElement('button'); s.className='btn quiet'; s.id='expBtn'; s.textContent='Save progress to file'; s.addEventListener('click',exportProgress);
  var l=document.createElement('button'); l.className='btn quiet'; l.id='impBtn'; l.textContent='Load progress from file';
  var f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.id='bkFile'; f.hidden=true;
  l.addEventListener('click',function(){f.click()}); f.addEventListener('change',function(){if(f.files[0]) importProgress(f.files[0]); f.value=''});
  var rs=document.getElementById('reset'); foot.insertBefore(s,rs); foot.insertBefore(l,rs); foot.appendChild(f);
})();
