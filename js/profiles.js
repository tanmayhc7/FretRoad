/* Players: several profiles on one device, each with its own progress (also what the TV shows when casting).
   Registry in localStorage 'fretroad-profiles'; each save lives under profileKey(id). Switching reloads the page so every screen starts clean. */
var PROFILE_COLORS=['#e6b95f','#5fd0c0','#f2708f','#8fa8ff','#b58cf0','#7fd36b'];
function profilesStore(){ try{ localStorage.setItem('fretroad-profiles',JSON.stringify(PROFILES)); }catch(e){} }
function profileById(id){ return PROFILES.list.filter(function(p){return p.id===id})[0]||null; }
function profileActive(){ return profileById(PROFILES.active); }
function profileStreak(w){ if(!w||!w.days) return 0; function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);} var d=new Date(),n=0; if(!w.days.hasOwnProperty(ymd(d))) d.setDate(d.getDate()-1); while(w.days.hasOwnProperty(ymd(d))){n++; d.setDate(d.getDate()-1);} return n; }
/* a small public summary of a profile (never the whole save) */
function profileSummary(p){
  var raw=null; if(p.id===PROFILES.active) raw=save; else { try{ raw=JSON.parse(localStorage.getItem(profileKey(p.id))); }catch(e){} }
  raw=raw||{}; var w=raw.warm||{}, d=new Date(), tk=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  return {id:p.id,name:p.name,color:PROFILE_COLORS[p.color%PROFILE_COLORS.length],cleared:(raw.done||[]).length,total:19,passed:(raw.passed||[]).length,streak:profileStreak(w),level:w.level||'',practisedToday:!!(w.days&&w.days.hasOwnProperty(tk)),active:p.id===PROFILES.active,songs:(raw.songs||[]).length};
}
function profileSummaries(){ return PROFILES.list.map(profileSummary); }
function profileSwitch(id){ if(!profileById(id)||id===PROFILES.active) return; try{ persist(); }catch(e){} PROFILES.active=id; profilesStore(); location.hash='map'; location.reload(); }
function profileAdd(name){
  name=String(name||'').trim().slice(0,24); if(!name) return null;
  var id='p'+Date.now().toString(36)+Math.floor(Math.random()*100).toString(36); PROFILES.list.push({id:id,name:name,color:PROFILES.list.length%PROFILE_COLORS.length}); profilesStore(); return id;
}
function profileRename(id,name){ var p=profileById(id); name=String(name||'').trim().slice(0,24); if(!p||!name) return false; p.name=name; profilesStore(); return true; }
function profileRemove(id){
  if(PROFILES.list.length<2) return false; var p=profileById(id); if(!p) return false;
  try{ localStorage.removeItem(profileKey(id)); }catch(e){}
  PROFILES.list=PROFILES.list.filter(function(x){return x.id!==id}); var was=PROFILES.active===id; if(was) PROFILES.active=PROFILES.list[0].id; profilesStore();
  if(was){ location.hash='map'; location.reload(); } return true;
}
/* the Players section of Settings */
function profilesRender(){
  var host=document.getElementById('prefPlayers'); if(!host) return; host.innerHTML='';
  profileSummaries().forEach(function(s){
    var row=document.createElement('div'); row.className='plrow';
    var dot=document.createElement('i'); dot.className='pldot'; dot.style.background=s.color; row.appendChild(dot);
    var nm=document.createElement('span'); nm.className='plname'; nm.innerHTML='<b></b><small></small>'; nm.firstChild.textContent=s.name; nm.lastChild.textContent=s.cleared+' of '+s.total+' stops'+(s.streak?' · '+s.streak+'-day streak':''); row.appendChild(nm);
    function btn(t,fn,cls){ var b=document.createElement('button'); b.type='button'; b.className='btn '+(cls||'quiet'); b.textContent=t; b.addEventListener('click',fn); row.appendChild(b); return b; }
    if(s.active){ var a=document.createElement('span'); a.className='plactive'; a.textContent='Playing'; row.appendChild(a); }
    else btn('Switch',function(){ profileSwitch(s.id); },'');
    btn('Rename',function(){ var n=prompt('Name for this player',s.name); if(n&&profileRename(s.id,n)){ profilesRender(); if(window.castHello) castHello(); } });
    if(PROFILES.list.length>1){ var rm=btn('Remove',function(){ if(rm.dataset.sure){ profileRemove(s.id); profilesRender(); if(window.castHello) castHello(); } else { rm.dataset.sure='1'; rm.textContent='Really remove?'; setTimeout(function(){ if(rm.isConnected){ delete rm.dataset.sure; rm.textContent='Remove'; } },4000); } }); }
    host.appendChild(row);
  });
  var add=document.createElement('div'); add.className='pladd'; add.innerHTML='<input type="text" id="plNew" maxlength="24" placeholder="New player name" aria-label="New player name"><button type="button" class="btn" id="plAdd">Add player</button>'; host.appendChild(add);
  add.querySelector('#plAdd').addEventListener('click',function(){ var v=add.querySelector('#plNew').value; var id=profileAdd(v); if(id){ profileSwitch(id); } });
  add.querySelector('#plNew').addEventListener('keydown',function(e){ if(e.key==='Enter') add.querySelector('#plAdd').click(); });
}
