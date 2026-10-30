/* Reading chord sheets from pictures: scanned PDFs and photos. The OCR engine (Tesseract) gives every word with its
   position on the page. These functions rebuild "chords over lyrics" text from those positions, split words that a
   web page renderer glued together, and repair the usual OCR slips (a lowercase c for the chord C, a lost bracket).
   Pure functions: no DOM, so they can be tested without the engine. */
var OCR_SECTIONS=['intro','verse','chorus','pre-chorus','prechorus','bridge','outro','solo','interlude','instrumental','refrain','tag','coda','hook','riff'];
function ocrTsvToWords(tsv){
  var out=[],lines=String(tsv||'').split(/\r?\n/);
  lines.forEach(function(ln,i){ if(!i) return; var c=ln.split('\t'); if(c.length<12||c[0]!=='5') return;
    var t=c.slice(11).join('\t').trim(); if(!t) return; var l=+c[6],tp=+c[7],w=+c[8],h=+c[9],conf=+c[10];
    out.push({text:t,x0:l,y0:tp,x1:l+w,y1:tp+h,conf:conf}); });
  return out;
}
function ocrWordsFromResult(data){
  if(data&&data.words&&data.words.length) return data.words.map(function(w){return {text:String(w.text||'').trim(),x0:w.bbox.x0,y0:w.bbox.y0,x1:w.bbox.x1,y1:w.bbox.y1,conf:w.confidence}}).filter(function(w){return w.text});
  if(data&&data.tsv) return ocrTsvToWords(data.tsv);
  return null;
}
function ocrLooksChord(t){ return typeof isChordToken==='function'&&isChordToken(t); }
/* split "SaariRaat" or "Hai....Jaane" into fragments, giving each a share of the word's width */
function ocrSplitGlued(w){
  if(ocrLooksChord(w.text)||w.text.length<4) return [w];
  var t=w.text,cuts=[0],i;
  for(i=1;i<t.length;i++){
    var p=t.charAt(i-1),c=t.charAt(i);
    if(/[a-z]/.test(p)&&/[A-Z]/.test(c)) cuts.push(i);
    else if(/[.,;:]/.test(p)&&/[A-Za-z]/.test(c)) cuts.push(i);
  }
  if(cuts.length===1) return [w];
  var width=w.x1-w.x0,res=[]; cuts.push(t.length);
  for(i=0;i<cuts.length-1;i++){ var s=t.slice(cuts[i],cuts[i+1]); res.push({text:s,x0:w.x0+width*cuts[i]/t.length,x1:w.x0+width*cuts[i+1]/t.length,y0:w.y0,y1:w.y1,conf:w.conf}); }
  return res;
}
function ocrEdit(a,b){ var d=[],i,j; for(i=0;i<=a.length;i++){d[i]=[i];} for(j=1;j<=b.length;j++) d[0][j]=j;
  for(i=1;i<=a.length;i++) for(j=1;j<=b.length;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1)); return d[a.length][b.length]; }
/* "[Chorug" -> "[Chorus]", "[Versd" -> "[Verse]", "[Verse1]" stays */
function ocrFixSection(ln){
  var m=/^\s*[\[\(]\s*([A-Za-z][A-Za-z\- ]{2,14}?)\s*(\d*)\s*[\]\)]?\s*$/.exec(ln); if(!m) return null;
  var name=m[1].trim().toLowerCase(),best=null,bd=9;
  OCR_SECTIONS.forEach(function(s){ var d=ocrEdit(name,s); if(d<bd){bd=d;best=s;} });
  if(!best||bd>2||bd>=Math.ceil(name.length/2)) return null;
  var pretty=best.replace(/(^|-)([a-z])/g,function(_,a,b){return a+b.toUpperCase()});
  return '['+pretty+(m[2]?' '+m[2]:'')+']';
}
function ocrChordLineFix(ln){
  var toks=ln.trim().split(/\s+/).filter(Boolean); if(!toks.length||toks.length>10) return ln;
  var ok=toks.every(function(t){ var c=t.charAt(0).toUpperCase()+t.slice(1); return ocrLooksChord(c)||ocrLooksChord(t); });
  if(!ok) return ln;
  if(toks.length<2&&!ocrLooksChord(toks[0])) return ln; /* a lone lowercase letter could be a word */
  return ln.replace(/\S+/g,function(t){ return ocrLooksChord(t)?t:t.charAt(0).toUpperCase()+t.slice(1); });
}
function ocrWordsToText(words){
  /* keep everything the engine found except short, doubtful scraps (logos and smudges) */
  var ws=(words||[]).filter(function(w){ if(!w.text) return false; var low=!(w.conf===undefined||isNaN(w.conf))&&w.conf<30;
    return !(low&&w.text.length<=3&&!ocrLooksChord(w.text.charAt(0).toUpperCase()+w.text.slice(1))); });
  if(!ws.length) return '';
  var hs=ws.map(function(w){return w.y1-w.y0}).sort(function(a,b){return a-b}), mh=hs[Math.floor(hs.length/2)]||20;
  ws.sort(function(a,b){return (a.y0+a.y1)-(b.y0+b.y1)});
  var rows=[]; ws.forEach(function(w){ var yc=(w.y0+w.y1)/2,r=rows[rows.length-1]; if(r&&Math.abs(yc-r.yc)<=mh*.6){ r.w.push(w); r.yc=(r.yc*(r.w.length-1)+yc)/r.w.length; } else rows.push({yc:yc,w:[w]}); });
  rows.forEach(function(r){ r.w.sort(function(a,b){return a.x0-b.x0}); var fr=[]; r.w.forEach(function(w){ ocrSplitGlued(w).forEach(function(f){fr.push(f)}); }); r.f=fr;
    r.chordy=fr.length>0&&fr.filter(function(f){return ocrLooksChord(f.text.charAt(0).toUpperCase()+f.text.slice(1))}).length/fr.length>=.75; });
  var cws=[]; rows.forEach(function(r){ if(!r.chordy) r.f.forEach(function(f){ if(f.text.length>=3) cws.push((f.x1-f.x0)/f.text.length); }); });
  cws.sort(function(a,b){return a-b}); var cw=cws.length?cws[Math.floor(cws.length/2)]:mh*.55; if(!(cw>2)) cw=mh*.55;
  var minX=Math.min.apply(null,ws.map(function(w){return w.x0})), pitch=[];
  for(var i=1;i<rows.length;i++) pitch.push(rows[i].yc-rows[i-1].yc); pitch.sort(function(a,b){return a-b}); var mp=pitch.length?pitch[Math.floor(pitch.length/2)]:mh*1.5;
  var out=[];
  rows.forEach(function(r,idx){
    if(idx&&r.yc-rows[idx-1].yc>mp*1.6) out.push('');
    var line=''; r.f.forEach(function(f){ var col=Math.round((f.x0-minX)/cw); while(line.length<col) line+=' '; if(line&&!/\s$/.test(line)) line+=' '; line+=f.text; });
    out.push(line.replace(/\s+$/,''));
  });
  return ocrCleanText(out.join('\n'));
}
function ocrCleanText(text){
  var res=[],skipNext=false; text.split('\n').forEach(function(ln){
    if(/^\s*page\s*\d+\s*(\/|of)\s*\d+\s*$/i.test(ln)) return;
    if(/^\s*(difficulty|tuning)\b/i.test(ln)) return; /* web page header lines */
    if(/^\s*chords\s*$/i.test(ln)){ skipNext=true; return; }
    if(skipNext){ skipNext=false; if(ln.trim().split(/\s+/).length<=7&&!/[a-z]{4,}/.test(ln)) return; } /* the row of diagram names under a CHORDS heading */
    if(/^[\s\d×x]{1,16}$/.test(ln)&&/\d/.test(ln)) return; /* finger numbers under chord diagrams */
    var sec=ocrFixSection(ln); if(sec){ res.push(sec); return; }
    res.push(ocrChordLineFix(ln));
  });
  return res.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
