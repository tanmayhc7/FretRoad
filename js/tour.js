/* First-visit tour of the page. Skippable, and "don't show again" is remembered in save.tour. */
var TOUR_STEPS=[
 {t:'Welcome to FretRoad',b:'A free game that teaches you the guitar neck, one stop at a time. This quick tour shows where things are. It takes under a minute.'},
 {sel:'#chTabs',t:'Chapters and stops',b:'The map is split into chapters. Each stop is a short story scene, a puzzle on the fretboard and a quiz. Clear a stop to unlock the next one.'},
 {sel:'#warmBtn',t:'Daily practice',b:'One short exercise a day with a five-minute timer. A calendar tracks the days you practised and the ones you missed.'},
 {sel:'#songsBtn',t:'Your songs',b:'Import a chord chart and play along with a backing band. The mic listens and tells you how your chord changes are going.'},
 {sel:'#goSandbox',t:'Sandbox',b:'Free play on the neck. Show any scale or chord shape in any key, and click to hear it.'},
 {sel:'#metroBtn',t:'Metronome',b:'A metronome with time signatures and tap tempo, on every screen.'},
 {sel:'#storyBtn',t:'Pick a story',b:'The road trip, the jungle or the city. The lessons are identical, only the scenery and narrator change.'},
 {sel:'#prefBtn',t:'Settings',b:'Dark or light theme, left-handed mode, and saving your progress to a file. You can replay this tour from here.'}
];
var TR={i:0,on:false,el:null};
function tourBuild(){
  if(TR.el) return;
  var d=document.createElement('div'); d.id='tour'; d.hidden=true; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Tour of the page');
  d.innerHTML='<div class="tring" id="tRing"></div><div class="tcard" id="tCard"><span class="lab" id="tStep"></span><h3 id="tTitle"></h3><p id="tBody"></p><div class="tdots" id="tDots"></div>'+
    '<label class="chk"><input type="checkbox" id="tNever" checked> Don\'t show this again</label>'+
    '<div class="row"><button class="btn quiet" id="tSkip">Skip tour</button><span class="sp"></span><button class="btn" id="tBack">Back</button><button class="btn primary" id="tNext">Next</button></div></div>';
  document.body.appendChild(d); TR.el=d;
  $('#tSkip').addEventListener('click',function(){tourEnd()}); $('#tBack').addEventListener('click',function(){TR.i=Math.max(0,TR.i-1); tourShow()});
  $('#tNext').addEventListener('click',function(){ if(TR.i>=TOUR_STEPS.length-1) tourEnd(); else {TR.i++; tourShow();} });
  document.addEventListener('keydown',function(e){ if(!TR.on) return; if(e.key==='Escape') tourEnd(); else if(e.key==='ArrowRight') $('#tNext').click(); else if(e.key==='ArrowLeft') $('#tBack').click(); });
  addEventListener('resize',function(){ if(TR.on) tourShow(true); });
}
function tourStart(){
  tourBuild(); if(location.hash.slice(1)&&location.hash.slice(1)!=='map') location.hash='map';
  TR.i=0; TR.on=true; TR.el.hidden=false; $('#tNever').checked=true; $('#tNext').focus(); tourShow();
}
function tourShow(keep){
  var s=TOUR_STEPS[TR.i], ring=$('#tRing'), card=$('#tCard'), n=TOUR_STEPS.length;
  $('#tStep').textContent='Step '+(TR.i+1)+' of '+n; $('#tTitle').textContent=s.t; $('#tBody').textContent=s.b;
  $('#tBack').hidden=TR.i===0; $('#tNext').textContent=TR.i===n-1?'Finish':'Next';
  $('#tDots').innerHTML=TOUR_STEPS.map(function(_,i){return '<i class="'+(i===TR.i?'on':'')+'"></i>'}).join('');
  var el=s.sel?$(s.sel):null; if(el&&el.offsetParent===null) el=null;
  if(el&&!keep) el.scrollIntoView({block:'center',behavior:'auto'});
  var place=function(){
    if(!el){ ring.style.cssText='left:50%;top:50%;width:0;height:0'; card.style.cssText='left:50%;top:50%;transform:translate(-50%,-50%)'; return; }
    var r=el.getBoundingClientRect(), pad=8; ring.style.cssText='left:'+(r.left-pad)+'px;top:'+(r.top-pad)+'px;width:'+(r.width+pad*2)+'px;height:'+(r.height+pad*2)+'px';
    var cw=Math.min(340,innerWidth-24), left=Math.max(12,Math.min(innerWidth-cw-12,r.left+r.width/2-cw/2)), below=r.bottom+pad+14, ch=card.offsetHeight||230, top=below+ch>innerHeight-8?Math.max(8,r.top-pad-14-ch):below;
    card.style.cssText='left:'+left+'px;top:'+top+'px;width:'+cw+'px;transform:none';
  };
  place(); setTimeout(place,60);
}
function tourEnd(){
  if(!TR.on) return; TR.on=false; TR.el.hidden=true; if($('#tNever').checked){ save.tour=1; persist(); }
  window.scrollTo(0,0);
}
/* start on first visit, once any intro or story picker is closed */
(function(){
  if(window.__FRETROAD_TEST&&!window.__TOUR_TEST) return; if(save.tour) return;
  var t=setInterval(function(){
    if(save.tour){clearInterval(t); return;}
    var busy=document.querySelector('.overlay:not([hidden])'); var h=location.hash.slice(1); if(busy||(h&&h!=='map')) return;
    clearInterval(t); setTimeout(function(){ if(!save.tour&&!document.querySelector('.overlay:not([hidden])')) tourStart(); },500);
  },700);
})();
