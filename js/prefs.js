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
    '<div class="prefrow"><b>Daily reminder</b><div class="remind"><label class="chk"><input type="checkbox" id="remOn"> Remind me to practise</label><label>at <input type="time" id="remTime" value="18:00"></label>'+
      '<p class="jsub" id="remNote"></p><button class="btn" id="remIcs">Add a repeating event to my calendar</button></div></div>'+
    '<div class="row"><button class="btn quiet" id="prefClose">Close</button></div></div>';
  document.body.appendChild(o);
  [['dark','Dark'],['light','Light'],['auto','Match device']].forEach(function(x){
    var b=document.createElement('button'); b.className='btn'; b.dataset.v=x[0]; b.textContent=x[1];
    b.addEventListener('click',function(){save.theme=x[0]; persist(); applyPrefs(); prefsSync()}); $('#prefTheme').appendChild(b);
  });
  $('#remOn').addEventListener('change',function(){ remindSet(this.checked); });
  $('#remTime').addEventListener('change',function(){ var r=save.remind||(save.remind={on:false,time:'18:00'}); r.time=this.value||'18:00'; persist(); });
  $('#remIcs').addEventListener('click',remindIcs);
  $('#prefClose').addEventListener('click',function(){o.hidden=true});
  o.addEventListener('click',function(e){if(e.target===o) o.hidden=true});
}
function prefsSync(){ var r=save.remind||{on:false,time:'18:00'}; $('#remOn').checked=!!r.on; $('#remTime').value=r.time||'18:00'; remindNote(); var t=save.theme||'dark'; document.querySelectorAll('#prefTheme .btn').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===t); b.classList.toggle('primary',b.dataset.v===t)}); $('#prefLefty').checked=!!save.lefty; }
function openPrefs(){ prefsBuild(); prefsSync(); $('#prefOverlay').hidden=false; }
applyPrefs();
if(window.matchMedia) try{ matchMedia('(prefers-color-scheme: light)').addEventListener('change',applyPrefs) }catch(e){}

/* One setter for every left-handed switch on the page (settings, sandbox, songs, play-along). */
function setLefty(v){ save.lefty=!!v; persist(); applyPrefs(); syncLefty(); if(typeof J!=='undefined'&&J.built&&!$('#v-jam').hidden) jamShow(J.idx); }
function syncLefty(){ document.querySelectorAll('.lefty-toggle').forEach(function(c){c.checked=!!save.lefty}); var p=$('#prefLefty'); if(p) p.checked=!!save.lefty; }
document.addEventListener('change',function(e){ var t=e.target; if(t&&(t.classList.contains('lefty-toggle')||t.id==='prefLefty')) setLefty(t.checked); });
syncLefty();

/* Daily reminder. A static page has no server, so this only fires while fretRoad is open in a tab;
   the calendar event (.ics) is the reliable way to get a nudge when it is closed. */
function remindNote(){
  var n=$('#remNote'); if(!n) return; var r=save.remind||{};
  if(!('Notification' in window)) n.textContent='This browser cannot show notifications. Use the calendar event instead.';
  else if(Notification.permission==='denied') n.textContent='Notifications are blocked for this page in your browser settings. The calendar event still works.';
  else n.textContent=r.on?'You will get a notification at that time while fretRoad is open in a tab. For a nudge when it is closed, add the calendar event.':'Notifications only appear while fretRoad is open in a tab. For other times, add the calendar event.';
}
function remindSet(on){
  var r=save.remind||(save.remind={on:false,time:'18:00'});
  if(!on){ r.on=false; persist(); remindNote(); return; }
  if(!('Notification' in window)){ r.on=false; $('#remOn').checked=false; remindNote(); return; }
  var done=function(p){ r.on=(p==='granted'); $('#remOn').checked=r.on; persist(); remindNote(); if(r.on) toast('Reminder on. Keep a fretRoad tab open to receive it.'); };
  if(Notification.permission==='granted') done('granted'); else Notification.requestPermission().then(done,function(){done('denied')});
}
function remindDue(){
  var r=save.remind; if(!r||!r.on||!('Notification' in window)||Notification.permission!=='granted') return;
  var n=new Date(), hm=('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2), tk=ymd(n);
  if(hm<(r.time||'18:00')||r.last===tk) return;
  if(save.warm&&save.warm.days&&save.warm.days.hasOwnProperty(tk)) { r.last=tk; persist(); return; }
  r.last=tk; persist();
  try{ var no=new Notification('fretRoad',{body:"Today's 5-minute practice is ready.",tag:'fretroad-daily'}); no.onclick=function(){window.focus(); location.hash='warmup'; no.close();}; }catch(e){}
}
function remindIcs(){
  var r=save.remind||{time:'18:00'}, t=(r.time||'18:00').split(':'), d=new Date(), p=function(x){return ('0'+x).slice(-2)};
  var stamp=d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(t[0])+p(t[1])+'00';
  var url=/^https?:/.test(location.href)?location.href.split('#')[0]+'#warmup':'';
  var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FretRoad//Daily practice//EN','BEGIN:VEVENT','UID:fretroad-daily@fretroad','DTSTAMP:'+stamp,'DTSTART:'+stamp,'DURATION:PT5M','RRULE:FREQ=DAILY','SUMMARY:fretRoad: 5-minute practice','DESCRIPTION:One short exercise. Open fretRoad and tap Daily.'+(url?' '+url:'')]
    .concat(url?['URL:'+url]:[]).concat(['BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:fretRoad practice','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR']).join('\r\n');
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); a.download='fretroad-daily-practice.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
  toast('Calendar event downloaded. Open it to add it.');
}
setInterval(remindDue,30000); setTimeout(remindDue,3000);
