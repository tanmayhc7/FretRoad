/* Riff helper: turn a single-note line in a recording into notes and a first-guess tab with no AI at all, then (optionally)
   hand the notes to the person's own model for an explanation of how to play it. Only notes are sent, never the audio. */
var RIFF={tuning:[40,45,50,55,59,64],names:['E','A','D','G','B','e']};
function riffNotes(x,sr,t0,t1,bpm){
  var N=2048,H=512,a=Math.max(0,Math.floor(t0*sr)),b=Math.min(x.length,Math.floor(t1*sr)),fr=[],mx=0,i,f;
  for(f=a;f+N<=b;f+=H){ var buf=x.subarray(f,f+N),e=0; for(i=0;i<N;i++) e+=buf[i]*buf[i]; e=Math.sqrt(e/N); if(e>mx) mx=e; fr.push({buf:buf,rms:e,t:(f-a)/sr}); }
  var gate=Math.max(.008,mx*.18);
  var mid=fr.map(function(o){ if(o.rms<gate) return null; var y=DSP.yin(o.buf,sr); if(!(y.f>70&&y.f<1100&&y.clarity>.8)) return null; return Math.round(69+12*Math.log2(y.f/440)); });
  var sm=mid.map(function(m,k){ var w=[mid[k-1],m,mid[k+1]].filter(function(v){return v!=null}); if(m==null||w.length<2) return m; w.sort(function(p,q){return p-q}); return w[w.length>>1]; });
  var notes=[],cur=null,gap=0;
  sm.forEach(function(m,k){
    if(m!=null&&cur&&Math.abs(m-cur.midi)===0){ cur.end=k; gap=0; }
    else if(m==null&&cur&&gap<1){ gap++; }
    else { if(cur) notes.push(cur); cur=m!=null?{midi:m,s:k,end:k}:null; gap=0; }
  }); if(cur) notes.push(cur);
  var spb=bpm?60/bpm:0, out=[];
  notes.forEach(function(n){ var d=(n.end-n.s+1)*H/sr; if(n.end-n.s+1<2) return; var o={midi:n.midi,name:DSP.NN[((n.midi%12)+12)%12]+(Math.floor(n.midi/12)-1),start:+(fr[n.s].t).toFixed(2),dur:+d.toFixed(2)};
    if(spb){ o.beat=Math.round(o.start/spb*4)/4; } out.push(o); });
  return out;
}
/* choose a string and fret for every note, preferring small hand moves and low frets (first guess, the person decides) */
function riffPositions(notes,capo,maxFret){
  capo=capo||0; maxFret=maxFret||15; var opts=notes.map(function(n){ var o=[]; RIFF.tuning.forEach(function(open,s){ var fr=n.midi-open-capo; if(fr>=0&&fr<=maxFret) o.push({s:s,f:fr}); }); return o; });
  var cost=[],bp=[]; notes.forEach(function(n,i){ cost[i]=[];bp[i]=[]; var cs=opts[i]; cs.forEach(function(c,j){ var own=c.f*.15+(c.f>12?1:0)+(c.f===0?-.3:0);
    if(!i){ cost[i][j]=own; bp[i][j]=-1; return; } var best=1e9,bk=-1; opts[i-1].forEach(function(p,k){ var v=cost[i-1][k]+Math.abs((c.f||p.f)-(p.f))*(c.f&&p.f?1:.4)+(c.s!==p.s?.5:0); if(v<best){best=v;bk=k;} }); cost[i][j]=best+own; bp[i][j]=bk; }); });
  var res=new Array(notes.length),last=notes.length-1; if(last<0) return [];
  var bj=-1,bc=1e9; (opts[last]||[]).forEach(function(c,j){ if(cost[last][j]<bc){bc=cost[last][j];bj=j;} });
  for(var i=last;i>=0;i--){ if(bj<0){ res[i]=null; continue; } res[i]=opts[i][bj]; bj=bp[i][bj]; }
  return res;
}
function riffTabText(notes,pos){
  var lines=[5,4,3,2,1,0].map(function(s){ return RIFF.names[s]+'|'; });
  notes.forEach(function(n,i){ var p=pos[i]; var w=p?String(p.f).length:1; for(var k=0;k<6;k++){ var s=5-k; lines[k]+=(p&&p.s===s?String(p.f):new Array(w+1).join('-'))+'--'; } });
  return lines.join('\n');
}
function riffPrompt(c){
  var list=c.notes.map(function(n,i){ var p=c.pos[i]; return (i+1)+'. '+n.name+(n.beat!==undefined?' at beat '+n.beat:' at '+n.start+'s')+', '+n.dur+'s'+(p?' (string '+RIFF.names[p.s]+', fret '+p.f+')':''); }).join('\n');
  var sys='You are a patient guitar teacher. You get the notes of one short single-note riff that were detected automatically from a recording, plus a first-guess tab. Explain how to play it on an acoustic or electric guitar for an intermediate player. Be concise and concrete: where to place the hand, which fingers, picking direction, any hammer-ons, pull-offs or slides the rhythm suggests, how to practise it slowly. If a note looks like a detection mistake, say which one and what it probably should be. Plain text only, no markdown tables.';
  var usr='Tuning: standard (E A D G B e). Capo: '+(c.capo?('fret '+c.capo+' (frets below are counted from the capo)'):'none')+'.'+(c.bpm?' Tempo about '+c.bpm+' BPM.':'')+(c.chord?' The chord under it: '+c.chord+'.':'')+'\nNotes:\n'+list+'\n\nFirst-guess tab:\n'+c.tab;
  return {task:'riff',system:sys,user:usr,data:{notes:c.notes,positions:c.pos,tab:c.tab,capo:c.capo||0,bpm:c.bpm||null,chord:c.chord||null,tuning:RIFF.tuning}};
}
