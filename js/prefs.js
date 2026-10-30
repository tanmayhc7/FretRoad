/* Display preferences: theme (auto / light / dark) and left-handed mode. Stored in save.theme and save.lefty. */
function applyPrefs(){
  var t=save.theme||'dark', light=t==='light'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.classList.toggle('light',!!light);
  document.documentElement.classList.toggle('lefty',!!save.lefty);
}
function prefsBuild(){
  if($('#prefOverlay')) return;
  var o=document.createElement('div'); o.className='overlay'; o.id='prefOverlay'; o.hidden=true; o.setAttribute('role','dialog'); o.setAttribute('aria-label','Settings');
  o.innerHTML='<div class="storybox"><h2>Settings</h2>'+
    '<div class="prefrow"><b>Theme</b><div class="seg3" id="prefTheme" role="group" aria-label="Theme"></div></div>'+
    '<div class="prefrow"><b>Left-handed</b><label class="chk"><input type="checkbox" id="prefLefty"> Mirror the fretboard and chord diagrams</label></div>'+
    '<div class="row"><button class="btn quiet" id="prefClose">Close</button></div></div>';
  document.body.appendChild(o);
  [['dark','Dark'],['light','Light'],['auto','Match device']].forEach(function(x){
    var b=document.createElement('button'); b.className='btn'; b.dataset.v=x[0]; b.textContent=x[1];
    b.addEventListener('click',function(){save.theme=x[0]; persist(); applyPrefs(); prefsSync()}); $('#prefTheme').appendChild(b);
  });
  $('#prefClose').addEventListener('click',function(){o.hidden=true});
  o.addEventListener('click',function(e){if(e.target===o) o.hidden=true});
}
function prefsSync(){ var t=save.theme||'dark'; document.querySelectorAll('#prefTheme .btn').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===t); b.classList.toggle('primary',b.dataset.v===t)}); $('#prefLefty').checked=!!save.lefty; }
function openPrefs(){ prefsBuild(); prefsSync(); $('#prefOverlay').hidden=false; }
applyPrefs();
if(window.matchMedia) try{ matchMedia('(prefers-color-scheme: light)').addEventListener('change',applyPrefs) }catch(e){}

/* One setter for every left-handed switch on the page (settings, sandbox, songs, play-along). */
function setLefty(v){ save.lefty=!!v; persist(); applyPrefs(); syncLefty(); if(typeof J!=='undefined'&&J.built&&!$('#v-jam').hidden) jamShow(J.idx); }
function syncLefty(){ document.querySelectorAll('.lefty-toggle').forEach(function(c){c.checked=!!save.lefty}); var p=$('#prefLefty'); if(p) p.checked=!!save.lefty; }
document.addEventListener('change',function(e){ var t=e.target; if(t&&(t.classList.contains('lefty-toggle')||t.id==='prefLefty')) setLefty(t.checked); });
syncLefty();
