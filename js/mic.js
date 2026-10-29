/* Microphone pitch detection */
/* ======== listening: pitch from the microphone ======== */
var DSP=(function(){
  var NN=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  function yin(buf,sr){
    var n=buf.length, half=n>>1, tauMin=Math.floor(sr/1000), tauMax=Math.min(half-1,Math.floor(sr/70));
    var e=0; for(var i=0;i<n;i++) e+=buf[i]*buf[i];
    var rms=Math.sqrt(e/n);
    var d=new Float32Array(tauMax+1), cm=new Float32Array(tauMax+1), run=0;
    for(var t=1;t<=tauMax;t++){
      var s=0; for(var j=0;j<half;j++){var x=buf[j]-buf[j+t]; s+=x*x;}
      d[t]=s; run+=s; cm[t]=run>0?s*t/run:1;
    }
    var best=-1;
    for(var k=tauMin;k<=tauMax;k++){
      if(cm[k]<0.15){ while(k+1<=tauMax&&cm[k+1]<cm[k]) k++; best=k; break; }
    }
    if(best<0){ var mv=2; for(var q=tauMin;q<=tauMax;q++) if(cm[q]<mv){mv=cm[q]; best=q;} if(mv>0.3) return {f:0,clarity:1-mv,rms:rms}; }
    var a=cm[best-1]!==undefined&&best>1?cm[best-1]:cm[best], b=cm[best], c=best<tauMax?cm[best+1]:cm[best];
    var den=a+c-2*b, shift=den!==0?(a-c)/(2*den):0; if(Math.abs(shift)>1) shift=0;
    var tau=best+shift;
    return {f:sr/tau,clarity:1-cm[best],rms:rms};
  }
  function toNote(f){
    var m=69+12*Math.log2(f/440), r=Math.round(m);
    return {midi:r,pc:((r%12)+12)%12,cents:Math.round((m-r)*100),name:NN[((r%12)+12)%12]};
  }
  return {yin:yin,toNote:toNote,NN:NN};
})();

var Mic={on:false,stream:null,an:null,buf:null,gate:.012,src:null};
if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.Mic=Mic;
function micStart(cb){
  if(Mic.on) return cb(true);
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return cb(false,'This page cannot reach a microphone here. Open the standalone version, or tap "I played it" to check yourself.');
  initAudio(); if(!ac) return cb(false,'Audio is not available in this browser.');
  if(ac.state==='suspended') ac.resume();
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(st){
    Mic.stream=st; Mic.src=ac.createMediaStreamSource(st); Mic.an=ac.createAnalyser(); Mic.an.fftSize=4096; Mic.an.smoothingTimeConstant=0;
    Mic.src.connect(Mic.an); Mic.buf=new Float32Array(4096); Mic.on=true;
    var lows=[],n=0,t=setInterval(function(){
      Mic.an.getFloatTimeDomainData(Mic.buf); var e=0; for(var i=0;i<2048;i++) e+=Mic.buf[4095-i]*Mic.buf[4095-i]; lows.push(Math.sqrt(e/2048));
      if(++n>=10){clearInterval(t); lows.sort(function(a,b){return a-b}); var floor=lows[2]; Mic.gate=Math.min(.02,Math.max(.006,floor*3)); cb(true);}
    },60);
  }).catch(function(e){
    cb(false,(e&&e.name==='NotAllowedError')?'The microphone is blocked for this page. Allow it in your browser, or tap "I played it" to check yourself.':'No microphone was found. You can still tap "I played it".');
  });
}
function micStop(){
  if(Mic.stream) Mic.stream.getTracks().forEach(function(t){t.stop()});
  try{if(Mic.src) Mic.src.disconnect()}catch(e){}
  Mic.on=false; Mic.stream=null; Mic.an=null; Mic.src=null;
}
function micRead(){
  Mic.an.getFloatTimeDomainData(Mic.buf);
  var b=Mic.buf,e=0; for(var i=0;i<2048;i++) e+=b[4095-i]*b[4095-i];
  var rms=Math.sqrt(e/2048),r={rms:rms,note:null,clarity:0};
  if(rms>Mic.gate){var y=DSP.yin(b,ac.sampleRate); if(y.f>60&&y.f<1100&&y.clarity>.78){r.note=DSP.toNote(y.f); r.note.f=y.f; r.clarity=y.clarity;}}
  return r;
}

