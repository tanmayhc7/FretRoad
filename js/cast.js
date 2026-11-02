/* Chromecast sender: connects this page to the fretRoad TV app (cast/receiver.html), sends a small summary of this device's players
   and, on request, a group jam or the daily exercise. Needs a Cast Application ID (docs/CHROMECAST.md); until one is set the Cast button stays hidden.
   Nothing is sent unless a Cast session is open, and only names, counts and the chart being played are sent, never a whole save. */
var CAST={ns:'urn:x-cast:com.fretroad',ready:false,timer:0};
function castAppId(){ var u=/[?&]castid=([A-Za-z0-9]+)/.exec(location.search); if(u) return u[1]; try{ return window.FRETROAD_CAST_APP_ID||localStorage.getItem('fretroad-cast-appid')||''; }catch(e){ return ''; } }
function castSession(){ try{ return CAST.ready&&cast.framework.CastContext.getInstance().getCurrentSession(); }catch(e){ return null; } }
function castConnected(){ return !!castSession(); }
function castSend(obj){ var s=castSession(); if(!s) return false; obj.sent=Date.now(); try{ s.sendMessage(CAST.ns,obj); return true; }catch(e){ return false; } }
function castHello(){ if(!castConnected()) return; clearTimeout(CAST.timer); CAST.timer=setTimeout(function(){ castSend({t:'hello',device:castDeviceId(),players:profileSummaries()}); },300); }
function castDeviceId(){ try{ var d=localStorage.getItem('fretroad-device'); if(!d){ d='d'+Math.random().toString(36).slice(2,8); localStorage.setItem('fretroad-device',d); } return d; }catch(e){ return 'd0'; } }
/* the group jam: the TV works out the chord from the shared start time, so every player sees the same chord on the same beat */
function castJam(){
  if(!castConnected()||typeof BK==='undefined'||!BK.on||typeof J==='undefined') return;
  var startAt=Date.now()+(BK.startedAt-ac.currentTime)*1000;
  castSend({t:'jam',title:J.title,seq:J.snd.slice(),shown:J.sym.slice(),bpm:J.bpm,bpb:J.bpb,bpc:J.bpc,countIn:J.count?1:0,startAt:startAt,lefty:!!save.lefty,tuning:(typeof tuningId==='function'?tuningId():'std'),who:profileActive().name});
}
function castDaily(){
  if(!castConnected()||typeof W==='undefined'||!W.ex) return;
  castSend({t:'daily',name:W.ex.name,text:W.ex.text,tab:W.ex.tab||[],plan:W.ex.plan||[],bpm:W.ex.bpm||0,level:(typeof warmLevel==='function'&&warmLevel())||'',secs:W.ex.secs,startAt:Date.now()+3000,who:profileActive().name});
}
function castStopShow(){ castSend({t:'lobby'}); }
function castUpdateUi(){
  var on=castConnected(), b=document.getElementById('castBtn'); if(b){ b.hidden=!CAST.ready; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false'); b.title=on?'Casting to the TV. Click to stop.':'Show on the TV (Chromecast)'; }
  document.querySelectorAll('.cast-only').forEach(function(e){ e.hidden=!on; });
}
function castToggle(){
  try{ var ctx=cast.framework.CastContext.getInstance(); if(castConnected()) ctx.endCurrentSession(true); else ctx.requestSession().catch(function(){}); }catch(e){}
}
function castInit(){
  var id=castAppId(); if(!id||CAST.loading) return; CAST.loading=true;
  window.__onGCastApiAvailable=function(ok){
    if(!ok) return;
    try{
      var ctx=cast.framework.CastContext.getInstance();
      ctx.setOptions({receiverApplicationId:id,autoJoinPolicy:chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED});
      CAST.ready=true;
      ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED,function(e){
        var st=e.sessionState; if(st==='SESSION_STARTED'||st==='SESSION_RESUMED'){ castHello(); if(typeof BK!=='undefined'&&BK.on) castJam(); } castUpdateUi();
      });
      castUpdateUi();
    }catch(err){ if(window.console) console.error('cast',err); }
  };
  var s=document.createElement('script'); s.src='https://www.gstatic.com/cast/sdk/libs/sender/1.0/cast_framework.js?loadCastFramework=1'; s.async=true; document.head.appendChild(s);
}
/* keep the TV's player card current when progress changes */
(function(){ if(typeof updateStat!=='function') return; var u=updateStat; updateStat=function(){ var r=u.apply(this,arguments); if(window.castHello) castHello(); return r; }; })();
/* a jam that starts or stops while casting follows on the TV */
(function(){
  if(typeof jamStart==='function'){ var js=jamStart; jamStart=function(){ var r=js.apply(this,arguments); try{ castJam(); }catch(e){} return r; }; }
  if(typeof jamStop==='function'){ var jp=jamStop; jamStop=function(){ var r=jp.apply(this,arguments); try{ if(castConnected()) castStopShow(); }catch(e){} return r; }; }
})();
document.addEventListener('click',function(e){ var t=e.target&&e.target.closest&&e.target.closest('#castBtn'); if(t) castToggle(); });
castInit();
