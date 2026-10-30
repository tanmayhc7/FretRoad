/* Chord listening: strummed audio -> 12-bin pitch-class profile -> compare with chord templates. */
var CL={an:null,buf:null,freq:null,ready:false};
function clStart(){
  if(!Mic.on||!Mic.src||!ac) return false;
  if(!CL.an){ CL.an=ac.createAnalyser(); CL.an.fftSize=8192; CL.an.smoothingTimeConstant=.35; Mic.src.connect(CL.an); CL.freq=new Float32Array(CL.an.frequencyBinCount); CL.buf=new Float32Array(CL.an.fftSize); }
  CL.ready=true; return true;
}
function clStop(){ try{ if(CL.an&&Mic.src) Mic.src.disconnect(CL.an);}catch(e){} CL.an=null; CL.ready=false; }
/* chroma from a magnitude spectrum (linear), exposed so tests can feed it synthetic spectra */
function chromaFromSpectrum(mag,sr,fftSize){
  var ch=new Array(12).fill(0), bin=sr/fftSize, lo=Math.floor(95/bin), hi=Math.min(mag.length-2,Math.floor(2200/bin)), mx=0, i;
  for(i=lo;i<=hi;i++) if(mag[i]>mx) mx=mag[i]; if(mx<=0) return {chroma:ch,total:0};
  for(i=lo+1;i<hi;i++){
    var m=mag[i]; if(m<mx*.06||m<mag[i-1]||m<mag[i+1]) continue;
    var a=mag[i-1],b=m,c=mag[i+1],d=(a-2*b+c), off=d?0.5*(a-c)/d:0, f=(i+off)*bin;
    var semi=12*Math.log2(f/440)+69, r=Math.round(semi), cents=Math.abs(semi-r)*100; if(cents>40) continue;
    ch[((r%12)+12)%12]+=Math.pow(m/mx,1.2)*(f<400?1.15:1);
  }
  var total=ch.reduce(function(x,y){return x+y},0); return {chroma:ch,total:total};
}
function clTemplate(c){var t=new Array(12).fill(0); c.tones.forEach(function(p,i){t[p%12]=Math.max(t[p%12],i===0?1.15:(i<3?1:.55))}); return t;}
function cosine(a,b){var d=0,x=0,y=0; for(var i=0;i<12;i++){d+=a[i]*b[i];x+=a[i]*a[i];y+=b[i]*b[i]} return x&&y?d/Math.sqrt(x*y):0;}
var CL_CANDS=null;
function clCands(){ if(CL_CANDS) return CL_CANDS; CL_CANDS=[]; for(var r=0;r<12;r++) ['','m','7','m7','maj7','sus4','sus2'].forEach(function(q){var c={root:r,q:q,bass:null,tones:CHORD_Q[q].map(function(i){return (r+i)%12})}; CL_CANDS.push({name:SHARP_NAMES[r]+q,t:clTemplate(c),c:c})}); return CL_CANDS; }
/* judge(chroma, expectedSym) -> {ok,score,heard,quiet} */
function clJudge(chroma,total,expected){
  if(total<1.2) return {ok:false,quiet:true,score:0,heard:null};
  var ec=parseChord(expected); if(!ec) return {ok:false,score:0,heard:null};
  var tmpl=clTemplate(ec), se=cosine(chroma,tmpl), best=null, bs=0;
  clCands().forEach(function(k){var s=cosine(chroma,k.t); if(s>bs){bs=s;best=k}});
  var ok=se>=.72&&se>=bs-.045;
  return {ok:ok,score:se,heard:best?best.name:null,heardScore:bs,quiet:false};
}
function clSample(expected){
  if(!CL.ready) return null; CL.an.getFloatFrequencyData(CL.freq); CL.an.getFloatTimeDomainData(CL.buf);
  var e=0,n=CL.buf.length; for(var i=n-2048;i<n;i++) e+=CL.buf[i]*CL.buf[i]; var rms=Math.sqrt(e/2048);
  if(rms<Math.max(.008,Mic.gate*1.2)) return {ok:false,quiet:true,score:0,heard:null,rms:rms};
  var mag=new Float32Array(CL.freq.length); for(i=0;i<mag.length;i++) mag[i]=Math.pow(10,CL.freq[i]/20);
  var c=chromaFromSpectrum(mag,ac.sampleRate,CL.an.fftSize); var j=clJudge(c.chroma,c.total,expected); j.rms=rms; return j;
}
