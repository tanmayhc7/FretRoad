/* Listening to a recording: tempo, time signature, beats, and which chord of the chart is playing when.
   Pure signal code on mono samples (no DOM), so it can be tested with synthetic audio. Everything here is a best guess:
   it is right more often on clear strummed or band recordings than on dense, busy ones, so the UI always lets you correct it. */
var AN={sr:11025};
function anLoop(n,step,fn,prog){ return new Promise(function(res){ var i=0; (function run(){ var e=Math.min(n,i+step); for(;i<e;i++) fn(i); if(prog) prog(n?i/n:1); if(i<n) setTimeout(run,0); else res(); })(); }); }
function anHann(n){ var w=new Float32Array(n); for(var i=0;i<n;i++) w[i]=.5-.5*Math.cos(2*Math.PI*i/(n-1)); return w; }
function anFft(re,im){
  var n=re.length,i,j=0,k;
  for(i=1;i<n;i++){ var bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ var t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
  for(var len=2;len<=n;len<<=1){ var ang=-2*Math.PI/len,wr=Math.cos(ang),wi=Math.sin(ang),h=len>>1;
    for(i=0;i<n;i+=len){ var cr=1,ci=0; for(k=0;k<h;k++){ var a=i+k,b=a+h,xr=re[b]*cr-im[b]*ci,xi=re[b]*ci+im[b]*cr; re[b]=re[a]-xr; im[b]=im[a]-xi; re[a]+=xr; im[a]+=xi; var nr=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=nr; } } }
}
/* how strongly new sound starts, about 43 times a second */
function anOnsetEnv(x,sr,prog){
  var N=1024,H=256,nF=Math.max(0,Math.floor((x.length-N)/H)),win=anHann(N),re=new Float32Array(N),im=new Float32Array(N),prev=new Float32Array(N/2),env=new Float32Array(nF),kmax=Math.min(N/2-1,Math.floor(5000*N/sr));
  return anLoop(nF,150,function(f){
    var o=f*H,i,k; for(i=0;i<N;i++) re[i]=x[o+i]*win[i]; im.fill(0); anFft(re,im);
    var fl=0; for(k=2;k<=kmax;k++){ var m=Math.log(1+100*Math.sqrt(re[k]*re[k]+im[k]*im[k])/(N/4)); var d=m-prev[k]; if(d>0) fl+=d; prev[k]=m; } env[f]=fl;
  },prog).then(function(){
    var fr=sr/H,w=Math.max(3,Math.round(fr*.6)),out=new Float32Array(nF),acc=0,i; var cs=new Float64Array(nF+1); for(i=0;i<nF;i++) cs[i+1]=cs[i]+env[i];
    for(i=0;i<nF;i++){ var a=Math.max(0,i-w),b=Math.min(nF,i+w+1),mean=(cs[b]-cs[a])/(b-a); out[i]=Math.max(0,env[i]-mean); }
    var s=0; for(i=0;i<nF;i++) s+=out[i]*out[i]; s=Math.sqrt(s/Math.max(1,nF))||1; for(i=0;i<nF;i++) out[i]/=s;
    return {env:out,fr:fr};
  });
}
function anTempo(env,fr,hint){
  var n=env.length,lo=Math.floor(fr*60/200),hi=Math.ceil(fr*60/50),cache={};
  function ac(L){ if(cache[L]!==undefined) return cache[L]; var s=0,c=0; for(var t=0;t+L<n;t++){ s+=env[t]*env[t+L]; c++; } return cache[L]=c?s/c:0; }
  function sc(L){ return ac(L)+.5*ac(2*L)+.25*ac(4*L); }
  var best=-1,bl=lo,i;
  for(i=lo;i<=hi;i++){ var bpm=60*fr/i, pr=hint?Math.exp(-.5*Math.pow(Math.log(bpm/hint)/Math.LN2/.07,2)):Math.exp(-.5*Math.pow(Math.log(bpm/105)/Math.LN2/.85,2)); var v=sc(i)*pr; if(v>best){best=v;bl=i;} }
  var a=sc(bl-1),b=sc(bl),c=sc(bl+1),den=a-2*b+c, off=den<0?.5*(a-c)/den:0; if(Math.abs(off)>1) off=0;
  return 60*fr/(bl+off);
}
/* dynamic programming beat tracker: beats on strong onsets, spaced about one beat apart */
function anBeats(env,fr,bpm){
  var n=env.length,T=60*fr/bpm,C=new Float32Array(n),P=new Int32Array(n).fill(-1),t,p;
  for(t=0;t<n;t++){ var best=0,bp=-1,a=Math.max(0,t-Math.round(2*T)),b=t-Math.round(T/2);
    for(p=a;p<=b;p++){ var d=Math.log((t-p)/T), v=C[p]-100*d*d*.01*8; if(bp<0||v>best){best=v;bp=p;} }
    if(bp>=0&&best>0){ C[t]=env[t]+best; P[t]=bp; } else C[t]=env[t]; }
  var s=Math.max(0,n-Math.round(T)),bi=s; for(t=s;t<n;t++) if(C[t]>C[bi]) bi=t;
  var fs=[]; for(t=bi;t>=0;t=P[t]){ fs.push(t); if(P[t]<0) break; } fs.reverse();
  var times=fs.map(function(f){return (f*256+512)/AN.sr});
  return {frames:fs,times:times};
}
/* tempo from the beat times by a straight-line fit: far more exact than the one-lag estimate */
function anFitBpm(times){
  var n=times.length; if(n<4) return 0; var sx=0,sy=0,sxx=0,sxy=0,i; for(i=0;i<n;i++){ sx+=i; sy+=times[i]; sxx+=i*i; sxy+=i*times[i]; }
  var slope=(n*sxy-sx*sy)/(n*sxx-sx*sx); return slope>0?60/slope:0;
}
function anZ(arr){ var m=0,s=0,i; for(i=0;i<arr.length;i++) m+=arr[i]; m/=Math.max(1,arr.length); for(i=0;i<arr.length;i++) s+=(arr[i]-m)*(arr[i]-m); s=Math.sqrt(s/Math.max(1,arr.length))||1; return arr.map(function(v){return (v-m)/s}); }
/* 3 or 4 beats to a bar? the first beat of a bar is usually the heaviest: see which grouping shows the clearer pattern */
function anMeter(strength){
  var n=strength.length; if(n<12) return {bpb:4,phase:0,c3:0,c4:0};
  var z=anZ(strength);
  function contrast(m){ var sum=new Array(m).fill(0),cnt=new Array(m).fill(0),k; for(k=0;k<n;k++){ sum[k%m]+=z[k]; cnt[k%m]++; }
    var mean=sum.map(function(s,i){return s/cnt[i]}),bi=0; for(k=1;k<m;k++) if(mean[k]>mean[bi]) bi=k; var o=0; for(k=0;k<m;k++) if(k!==bi) o+=mean[k]; o/=(m-1); return {c:mean[bi]-o,phase:bi}; }
  var a=contrast(3),b=contrast(4), three=a.c>b.c*1.3&&a.c>.35;
  return three?{bpb:3,phase:a.phase,c3:a.c,c4:b.c}:{bpb:4,phase:b.phase,c3:a.c,c4:b.c};
}
/* twelve-note colour of the sound, about every 0.19 s */
function anChroma(x,sr,prog){
  var N=4096,H=2048,nF=Math.max(0,Math.floor((x.length-N)/H)),win=anHann(N),re=new Float32Array(N),im=new Float32Array(N),out=[],tm=[],lo=Math.ceil(65*N/sr),hi=Math.min(N/2-1,Math.floor(2200*N/sr)),pc=new Int8Array(hi+1);
  for(var k=lo;k<=hi;k++){ var f=k*sr/N; pc[k]=((Math.round(12*Math.log(f/440)/Math.LN2+69)%12)+12)%12; }
  return anLoop(nF,40,function(fi){
    var o=fi*H,i; for(i=0;i<N;i++) re[i]=x[o+i]*win[i]; im.fill(0); anFft(re,im);
    var c=new Float32Array(12); for(var k2=lo;k2<=hi;k2++) c[pc[k2]]+=Math.pow(Math.sqrt(re[k2]*re[k2]+im[k2]*im[k2]),.6);
    out.push(c); tm.push((o+N/2)/sr);
  },prog).then(function(){ return {chroma:out,times:tm}; });
}
function anNorm(v){ var s=0,i; for(i=0;i<v.length;i++) s+=v[i]*v[i]; s=Math.sqrt(s)||1; var r=new Float32Array(v.length); for(i=0;i<v.length;i++) r[i]=v[i]/s; return r; }
/* chroma averaged over each beat, with the song's average colour partly removed so chords stand out from the key */
function anBeatChroma(ch,beatTimes){
  var nb=beatTimes.length,out=[],mean=new Float32Array(12),i,k;
  for(i=0;i<ch.chroma.length;i++) for(k=0;k<12;k++) mean[k]+=ch.chroma[i][k]; var tot=0; for(k=0;k<12;k++) tot+=mean[k]*mean[k]; tot=Math.sqrt(tot)||1;
  var mn=anNorm(mean),cn=ch.chroma.map(anNorm);
  for(var b=0;b<nb;b++){ var t0=beatTimes[b],t1=b+1<nb?beatTimes[b+1]:t0+(beatTimes[b]-beatTimes[Math.max(0,b-1)])||t0+.5, acc=new Float32Array(12),c=0;
    for(i=0;i<ch.times.length;i++){ if(ch.times[i]>=t0-.05&&ch.times[i]<t1){ for(k=0;k<12;k++) acc[k]+=cn[i][k]; c++; } }
    if(!c){ var bi=0,bd=9e9; for(i=0;i<ch.times.length;i++){ var d=Math.abs(ch.times[i]-(t0+t1)/2); if(d<bd){bd=d;bi=i;} } if(cn.length) for(k=0;k<12;k++) acc[k]=cn[bi][k]; }
    var u=anNorm(acc),r=new Float32Array(12); for(k=0;k<12;k++) r[k]=Math.max(0,u[k]-.55*mn[k]); out.push(anNorm(r)); }
  return out;
}
/* which pitch classes a chord symbol should contain, shifted by `shift` semitones (capo / key difference) */
function anTemplate(sym,shift){
  var c=typeof parseChord==='function'?parseChord(sym):null,v=new Float32Array(12); if(!c) return null;
  var iv=(typeof CHORD_Q!=='undefined'&&CHORD_Q[c.q])||[0,4,7];
  iv.forEach(function(s,i){ v[(c.root+s+shift)%12]+=(i===0?1:(s===10||s===11?.55:.75)); });
  if(c.bass!==null&&c.bass!==undefined) v[(c.bass+shift)%12]+=.8;
  return anNorm(v);
}
/* put the chart's chords, in the order written, onto the beats: each chord lasts one or more beats */
function anAlign(bc,syms,shift,bpb,phase){
  var B=bc.length,n=syms.length; if(!n||B<n) return null;
  var tpl=syms.map(function(s){return anTemplate(s,shift)}); if(tpl.some(function(t){return !t})) return null;
  function sim(b,i){ var s=0; for(var k=0;k<12;k++) s+=bc[b][k]*tpl[i][k]; return s; }
  var TH=.4,BONUS=.12,S=n+2,NEG=-1e9,V=new Float32Array(B*S).fill(NEG),BP=new Uint8Array(B*S),b,s;
  function bon(bt){ return bpb&&((bt-phase)%bpb+bpb)%bpb===0?BONUS:0; }
  V[0]=0; V[1]=sim(0,0)-TH;
  for(b=1;b<B;b++){
    V[b*S]=V[(b-1)*S]; BP[b*S]=0;
    for(s=1;s<=n;s++){ var stay=V[(b-1)*S+s],from=V[(b-1)*S+s-1]+bon(b),sc=sim(b,s-1)-TH; if(from>stay){V[b*S+s]=from+sc;BP[b*S+s]=1;} else {V[b*S+s]=stay+sc;BP[b*S+s]=0;} }
    var ps=V[(b-1)*S+n+1],pf=V[(b-1)*S+n]; if(pf>ps){V[b*S+n+1]=pf;BP[b*S+n+1]=1;} else {V[b*S+n+1]=ps;BP[b*S+n+1]=0;}
  }
  var end=V[(B-1)*S+n]>=V[(B-1)*S+n+1]?n:n+1,score=Math.max(V[(B-1)*S+n],V[(B-1)*S+n+1]); if(score<=NEG/2) return null;
  var st=new Int16Array(B),cur=end; for(b=B-1;b>=0;b--){ st[b]=cur; if(b>0&&BP[b*S+cur]===1) cur--; }
  var first=new Array(n).fill(-1),sims=0,cnt=0; for(b=0;b<B;b++){ if(st[b]>=1&&st[b]<=n){ if(first[st[b]-1]<0) first[st[b]-1]=b; sims+=sim(b,st[b]-1); cnt++; } }
  if(first.some(function(f){return f<0})) return null;
  return {first:first,score:score,meanSim:cnt?sims/cnt:0,states:st};
}
/* try every key shift and keep the best fit; `expect` (the chart's capo) wins ties */
function anBestAlign(bc,syms,bpb,phase,expect){
  var best=null,all=[];
  for(var sh=0;sh<12;sh++){ var a=anAlign(bc,syms,sh,bpb,phase); if(a){ a.shift=sh; all.push(a); } }
  if(!all.length) return null;
  all.forEach(function(a){ if(!best||a.score>best.score) best=a; });
  var ex=all.filter(function(a){return a.shift===expect})[0]; if(ex&&ex.score>=best.score-Math.abs(best.score)*.04-.5) best=ex;
  var others=all.filter(function(a){return a!==best}).map(function(a){return a.score}).sort(function(x,y){return x-y}),med=others.length?others[others.length>>1]:0;
  best.margin=best.score-med; return best;
}
function anMedian(a){ var s=a.slice().sort(function(x,y){return x-y}); return s.length?s[s.length>>1]:0; }
/* full pass over decoded mono samples. Returns the cached analysis; call anMatch() to line up a chart */
function anAnalyze(x,sr,prog,hint){
  var P=function(a,b){return function(p){ if(prog) prog(a+(b-a)*p); }};
  return anOnsetEnv(x,sr,P(0,.45)).then(function(o){
    return anChroma(x,sr,P(.45,.95)).then(function(ch){ var an={env:o.env,fr:o.fr,ch:ch,sr:sr,dur:x.length/sr}; anRetempo(an,hint); if(prog) prog(1); return an; }); });
}
/* tempo, beats and meter from the cached onset curve; hint (a rough BPM) forces e.g. half or double time */
function anRetempo(an,hint){
  var bpm0=anTempo(an.env,an.fr,hint), bt=anBeats(an.env,an.fr,bpm0), bpm=anFitBpm(bt.times)||bpm0;
  var strength=bt.frames.map(function(f){ var m=0; for(var d=-1;d<=1;d++){ var v=an.env[f+d]||0; if(v>m) m=v; } return m; });
  an.beats=bt.times; an.bpmRaw=bpm; an.bc=anBeatChroma(an.ch,bt.times);
  var nov=an.bc.map(function(c,i){ if(!i) return 0; var s=0; for(var k=0;k<12;k++) s+=c[k]*an.bc[i-1][k]; return 1-s; }), zs=anZ(strength), zn=anZ(nov);
  var m=anMeter(zs.map(function(v,i){return v+.8*zn[i]}));
  an.bpb=m.bpb; an.phase=m.phase; an.bpm=Math.round(bpm); return an;
}
/* ---- chord naming: what chord is sounding on each beat (major, minor and dominant 7th on any root) ---- */
var AN_NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var AN_QUAL=[{q:'',iv:[0,4,7],pen:0},{q:'m',iv:[0,3,7],pen:0},{q:'7',iv:[0,4,7,10],pen:.05}];
function anVocab(){
  var out=[]; for(var r=0;r<12;r++) AN_QUAL.forEach(function(Q){ var v=new Float32Array(12); Q.iv.forEach(function(s,i){ v[(r+s)%12]+=(i===0?1:(s===10?.5:.8)); }); out.push({root:r,q:Q.q,name:AN_NOTES[r]+Q.q,t:anNorm(v),pen:Q.pen}); });
  return out;
}
/* best chord per beat, smoothed so a chord has to be clearly better to change. Returns [{name,root,q,conf}] per beat */
function anChords(bc){
  var V=anVocab(),n=V.length,B=bc.length,CH=.16,sc=[],i,b;
  for(b=0;b<B;b++){ var row=new Float32Array(n); for(i=0;i<n;i++){ var s=0; for(var k=0;k<12;k++) s+=bc[b][k]*V[i].t[k]; row[i]=s-V[i].pen; } sc.push(row); }
  if(!B) return [];
  var dp=[Array.prototype.slice.call(sc[0])],bp=[new Int16Array(n)];
  for(b=1;b<B;b++){ var prev=dp[b-1],bi=0; for(i=1;i<n;i++) if(prev[i]>prev[bi]) bi=i;
    var cur=new Array(n),bpb=new Int16Array(n); for(i=0;i<n;i++){ var stay=prev[i],sw=prev[bi]-CH; if(stay>=sw){cur[i]=stay+sc[b][i];bpb[i]=i;} else {cur[i]=sw+sc[b][i];bpb[i]=bi;} } dp.push(cur); bp.push(bpb); }
  var last=dp[B-1],e=0; for(i=1;i<n;i++) if(last[i]>last[e]) e=i;
  var path=new Array(B); for(b=B-1;b>=0;b--){ path[b]=e; e=bp[b][e]; }
  return path.map(function(ix,b){ var v=V[ix]; return {name:v.name,root:v.root,q:v.q,conf:sc[b][ix]}; });
}
/* the chord heard most over beats [a,b) */
function anHeardOver(heard,a,b){
  var votes={},best=null; for(var i=a;i<b&&i<heard.length;i++){ var h=heard[i]; votes[h.name]=(votes[h.name]||0)+Math.max(.05,h.conf); if(!best||votes[h.name]>votes[best.name]) best=h; }
  return best;
}
/* the plain triad type of a chart chord, for comparing with what was heard: m/m7/dim... count as minor */
function anChartKind(sym){ var c=typeof parseChord==='function'?parseChord(sym):null; if(!c) return null; return {root:c.root,minor:/^m(?!aj)|^dim/.test(c.q)}; }
/* line the chart up: returns {marks:[seconds per chord], shift, meanSim, bpc} or null */
function anMatch(an,syms,expect){
  var a=anBestAlign(an.bc,syms,an.bpb,an.phase,expect||0); if(!a) return null;
  var marks=a.first.map(function(b){return an.beats[b]}), dur=[]; for(var i=0;i+1<a.first.length;i++) dur.push(a.first[i+1]-a.first[i]);
  var med=anMedian(dur)||an.bpb, opts=[2,3,4,6,8], bpc=opts.reduce(function(p,c){return Math.abs(c-med)<Math.abs(p-med)?c:p},4);
  /* does what is heard on each chord's beats agree with the chord written there? */
  if(!an.heard) an.heard=anChords(an.bc);
  var agree=0,total=0,diffs=[];
  a.first.forEach(function(b,i){ var end=i+1<a.first.length?a.first[i+1]:Math.min(an.bc.length,b+bpc), h=anHeardOver(an.heard,b,Math.max(b+1,end)), k=anChartKind(syms[i]); if(!h||!k) return;
    total++; var ok=((k.root+a.shift)%12===h.root)&&(k.minor===(h.q==='m')); if(ok) agree++; else diffs.push({i:i,chart:syms[i],heard:h.name,t:marks[i]}); });
  return {marks:marks,shift:a.shift,meanSim:a.meanSim,margin:a.margin,bpc:bpc,agree:total?agree/total:0,agreeN:agree,agreeOf:total,diffs:diffs};
}
