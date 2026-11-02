/* fretRoad Cast receiver (runs on the Chromecast). Phones are the controllers: each sends its players' progress summaries and,
   when the host asks, a group jam (start time, tempo, chords) or the daily exercise. The TV works out what to show from the clock. */
var NS='urn:x-cast:com.fretroad';
var R={devices:{},senders:{},mode:'lobby',jam:null,daily:null,skew:0,raf:0};
function $(s){ return document.querySelector(s); }
function esc(t){ var d=document.createElement('div'); d.textContent=t==null?'':String(t); return d.innerHTML; }
function allPlayers(){ var out=[]; Object.keys(R.devices).forEach(function(k){ (R.devices[k]||[]).forEach(function(p){ out.push(p); }); }); return out; }
function show(mode){ R.mode=mode; ['lobby','jam','daily'].forEach(function(m){ $('#'+m).hidden=(m!==mode); }); cancelAnimationFrame(R.raf); if(mode==='jam') R.raf=requestAnimationFrame(jamFrame); if(mode==='daily') R.raf=requestAnimationFrame(dailyFrame); strip(); }
function renderLobby(){
  var ps=allPlayers(), host=$('#players'); host.innerHTML='';
  $('#lobbyLead').textContent=ps.length?'Everyone here, with their own progress. Ask the host to start a group jam or the daily exercise.':'On your phone, open fretRoad and tap TV. Your players appear here.';
  ps.forEach(function(p){
    var c=document.createElement('div'); c.className='pcard'+(p.active?' active':''); c.style.setProperty('--c',p.color||'#e6b95f');
    var pct=Math.round(100*(p.cleared||0)/(p.total||19));
    c.innerHTML='<div class="nm"><i class="dot"></i><span>'+esc(p.name)+'</span></div><div class="meta">'+esc(p.cleared)+' of '+esc(p.total||19)+' stops cleared'+(p.streak?' · '+esc(p.streak)+'-day streak':'')+(p.level?' · '+esc(p.level):'')+(p.practisedToday?' · <span class="tick">practised today</span>':'')+'</div><div class="bar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div>';
    host.appendChild(c);
  });
  strip();
}
function strip(){
  var ps=allPlayers(), s=$('#strip'); s.innerHTML=''; if(R.mode==='lobby') return;
  ps.filter(function(p){return p.active}).concat(ps.filter(function(p){return !p.active})).forEach(function(p){ var c=document.createElement('span'); c.className='chip'; c.style.setProperty('--c',p.color||'#e6b95f'); c.innerHTML='<i class="dot"></i>'+esc(p.name); s.appendChild(c); });
}
/* ---- group jam ---- */
function tvNow(){ return Date.now()+R.skew; }          /* the sender's clock, as best we can tell */
function setJam(m){
  R.jam=m; if(m.tuning&&typeof TUNINGS!=='undefined'){ save.tuning=m.tuning; applyTuning(); } save.lefty=!!m.lefty;
  $('#jamTitle').textContent=m.title||'Group jam'; $('#jamWho').textContent=m.who?'Started by '+m.who:'';
  var b=$('#jamBeats'); b.innerHTML=''; for(var i=0;i<(m.bpb||4);i++) b.appendChild(document.createElement('i'));
  R.lastChord=null; show('jam');
}
function jamState(m,t){
  var beatMs=60000/m.bpm, beats=(t-m.startAt)/beatMs, ci=(m.countIn||0)*m.bpb;
  if(beats<ci) return {count:true,n:Math.floor(beats<0?ci:ci-beats)+(beats<0?0:1),beat:Math.floor(beats)};
  var mb=beats-ci, slot=Math.floor(mb/m.bpc), len=m.seq.length, idx=((slot%len)+len)%len;
  return {count:false,idx:idx,beatInChord:Math.floor(mb%m.bpc),beatInBar:Math.floor(mb%m.bpb)};
}
function jamFrame(){
  var m=R.jam; if(!m||R.mode!=='jam') return; var st=jamState(m,tvNow()), beats=$('#jamBeats').children;
  if(st.count){ $('#jamNow').textContent=st.n>0?String(st.n):''; $('#jamStatus').textContent=t0(m)<0?'Get ready':'Count in'; setBeats(beats,((st.n===0?0:m.bpb-((st.n-1)%m.bpb)-1)+m.bpb)%m.bpb); $('#jamNowDia').innerHTML=''; $('#jamNext').textContent=m.shown[0]; $('#jamNextDia').innerHTML=chordDiagram(m.seq[0],{w:110}); }
  else {
    var key=st.idx; if(R.lastChord!==key){ R.lastChord=key; $('#jamNow').textContent=m.shown[st.idx]; $('#jamNowDia').innerHTML=chordDiagram(m.seq[st.idx],{w:150}); var n=(st.idx+1)%m.seq.length; $('#jamNext').textContent=m.shown[n]; $('#jamNextDia').innerHTML=chordDiagram(m.seq[n],{w:112}); }
    setBeats(beats,st.beatInBar); $('#jamStatus').textContent=m.bpm+' bpm · chord '+(st.idx+1)+' of '+m.seq.length;
  }
  R.raf=requestAnimationFrame(jamFrame);
}
function t0(m){ return tvNow()-m.startAt; }
function setBeats(els,on){ for(var i=0;i<els.length;i++) els[i].className=(i===on?'on':''); }
/* ---- daily exercise: a shared five-minute clock ---- */
function setDaily(m){
  R.daily=m; $('#dName').textContent=m.name; $('#dWho').textContent=(m.level?m.level+' · ':'')+(m.who?'Started by '+m.who:'');
  $('#dText').textContent=m.text||''; $('#dTab').textContent=(m.tab||[]).join('\n'); $('#dTab').hidden=!(m.tab&&m.tab.length);
  var pl=$('#dPlan'); pl.innerHTML=''; (m.plan||[]).forEach(function(x){ var li=document.createElement('li'); li.textContent=x; pl.appendChild(li); });
  show('daily');
}
function fmt(s){ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }
function dailyFrame(){
  var m=R.daily; if(!m||R.mode!=='daily') return; var el=(tvNow()-m.startAt)/1000, left=(m.secs||300)-el;
  if(el<0){ $('#dClock').textContent=String(Math.ceil(-el)); $('#dStatus').textContent='Get ready'; }
  else if(left>0){ $('#dClock').textContent=fmt(left); $('#dStatus').textContent=m.bpm?'Click at '+m.bpm+' bpm on your own device':'Go slowly'; }
  else { $('#dClock').textContent='Time'; $('#dStatus').textContent='Mark it as practised on your phone.'; }
  R.raf=requestAnimationFrame(dailyFrame);
}
/* ---- messages ---- */
function handle(senderId,d){
  if(!d||typeof d!=='object') return;
  if(typeof d.sent==='number') R.skew=d.sent-Date.now();      /* sender clock minus ours, includes a little network delay */
  R.senders[senderId]=d.device||R.senders[senderId]||senderId;
  if(d.t==='hello'&&Array.isArray(d.players)){ R.devices[R.senders[senderId]]=d.players.slice(0,12).map(function(p){ return {id:String(p.id),name:String(p.name).slice(0,24),color:/^#[0-9a-f]{6}$/i.test(p.color)?p.color:'#e6b95f',cleared:+p.cleared||0,total:+p.total||19,streak:+p.streak||0,level:String(p.level||'').slice(0,16),practisedToday:!!p.practisedToday,active:!!p.active}; }); renderLobby(); }
  else if(d.t==='jam'&&Array.isArray(d.seq)&&d.seq.length&&d.bpm>0){ setJam({title:String(d.title||'').slice(0,60),seq:d.seq.map(String),shown:(d.shown||d.seq).map(String),bpm:+d.bpm,bpb:+d.bpb||4,bpc:+d.bpc||4,countIn:+d.countIn||0,startAt:+d.startAt,lefty:!!d.lefty,tuning:d.tuning==='dadgad'?'dadgad':'std',who:String(d.who||'').slice(0,24)}); }
  else if(d.t==='daily'){ setDaily({name:String(d.name||'').slice(0,60),text:String(d.text||'').slice(0,600),tab:(d.tab||[]).slice(0,8).map(function(x){return String(x).slice(0,80)}),plan:(d.plan||[]).slice(0,5).map(function(x){return String(x).slice(0,140)}),bpm:+d.bpm||0,level:String(d.level||'').slice(0,16),secs:+d.secs||300,startAt:+d.startAt,who:String(d.who||'').slice(0,24)}); }
  else if(d.t==='lobby'){ show('lobby'); renderLobby(); }
}
function dropSender(senderId){ var dev=R.senders[senderId]; delete R.senders[senderId]; if(dev&&!Object.keys(R.senders).some(function(k){return R.senders[k]===dev})) delete R.devices[dev]; renderLobby(); }
window.fretroadReceiver={handle:handle,drop:dropSender,state:R};
(function(){
  if(typeof cast!=='undefined'&&cast.framework&&cast.framework.CastReceiverContext){
    var ctx=cast.framework.CastReceiverContext.getInstance(), opts=new cast.framework.CastReceiverOptions();
    opts.disableIdleTimeout=true; opts.customNamespaces={}; opts.customNamespaces[NS]=cast.framework.system.MessageType.JSON;
    ctx.addCustomMessageListener(NS,function(ev){ handle(ev.senderId,ev.data); });
    ctx.addEventListener(cast.framework.system.EventType.SENDER_DISCONNECTED,function(ev){ dropSender(ev.senderId); });
    ctx.start(opts);
  }
  renderLobby();
})();
