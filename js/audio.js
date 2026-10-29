/* Plucked-string synthesiser (Web Audio) */
/* ---------- audio: plucked-string synth ---------- */
var ac=null,master=null,soundOn=true,bufs={};
function initAudio(){
  if(ac) return;
  var C=window.AudioContext||window.webkitAudioContext; if(!C) return;
  ac=new C(); master=ac.createGain(); master.gain.value=.6;
  var comp=ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
  var len=Math.floor(ac.sampleRate*1.3), ir=ac.createBuffer(2,len,ac.sampleRate);
  for(var c=0;c<2;c++){var d=ir.getChannelData(c); for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  var conv=ac.createConvolver(); conv.buffer=ir; var wg=ac.createGain(); wg.gain.value=.2;
  master.connect(conv); conv.connect(wg); wg.connect(comp);
}
function pluckBuf(m){
  if(bufs[m]) return bufs[m];
  var sr=ac.sampleRate, f=440*Math.pow(2,(m-69)/12), N=Math.max(2,Math.round(sr/f)), len=Math.floor(sr*2.6);
  var b=ac.createBuffer(1,len,sr), d=b.getChannelData(0), line=new Float32Array(N), prev=0;
  for(var i=0;i<N;i++){prev=prev*.55+(Math.random()*2-1)*.45; line[i]=prev;}
  var idx=0,mx=0;
  for(var j=0;j<len;j++){var cur=line[idx], nx=line[(idx+1)%N]; d[j]=cur; line[idx]=(cur+nx)*.5*.9968; idx=(idx+1)%N; if(Math.abs(cur)>mx) mx=Math.abs(cur);}
  if(mx>0) for(var k=0;k<len;k++) d[k]/=mx;
  bufs[m]=b; return b;
}
function pluck(m,delay,vel){
  if(!soundOn) return; initAudio(); if(!ac) return;
  if(ac.state==='suspended') ac.resume();
  var s=ac.createBufferSource(); s.buffer=pluckBuf(m);
  var g=ac.createGain(); g.gain.value=vel||.8;
  var lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3800;
  s.connect(lp); lp.connect(g); g.connect(master); s.start(ac.currentTime+(delay||0));
}
function strum(list,gap){list.forEach(function(m,i){pluck(m,i*(gap||.06),.7)})}

