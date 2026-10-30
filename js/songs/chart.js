/* Chord chart parsing. Understands chords over lyrics, ChordPro ([C]lyrics), bar lines (| C | G |) and [Verse]/Chorus: headings. */
var SECTION_RE=/^\s*[\[\(]?\s*(intro|verse|chorus|pre-?chorus|bridge|outro|solo|interlude|instrumental|refrain|tag|coda|hook|riff)\b[^\]\):]*[\]\)]?\s*:?\s*$/i;
var CHORD_TOKEN=/^\(?[A-G][#b♯♭]?(?:maj7|maj|min7|min|m7b5|m9|m7|m6|m|M7|dim7|dim|aug|sus2|sus4|sus|add9|add2|7sus4|6|7|9|5|\+|°|ø|-)?(?:\/[A-G][#b♯♭]?)?\)?$/;
function isChordToken(t){return CHORD_TOKEN.test(t.replace(/[,;]+$/,''));}
function isChordLine(line){
  var toks=line.replace(/[|:\-–—·•\/\\]+(?=\s|$)/g,' ').replace(/\bx\d+\b|\b\d+x\b|\(?\bx\d\)?/gi,' ').trim().split(/\s+/).filter(Boolean);
  if(!toks.length) return false;
  var chordy=toks.filter(isChordToken).length;
  return chordy>0&&chordy/toks.length>=.75;
}
function cleanChordTok(t){return t.replace(/[(),;]/g,'');}
function parseChart(text,fallbackTitle){
  var lines=String(text||'').replace(/\r/g,'').replace(/\t/g,'    ').split('\n');
  var title=fallbackTitle||'', sections=[], cur={name:'',lines:[]}, seq=[];
  function push(){ if(cur.lines.length||cur.name) sections.push(cur); }
  function addChord(sym,line,at){var c=parseChord(sym); if(!c) return; line.chords.push({sym:sym,at:at}); seq.push(sym);}
  for(var i=0;i<lines.length;i++){
    var raw=lines[i]; var ln=raw.replace(/\s+$/,'');
    var meta=/^\{\s*(title|t|subtitle|st|artist|key|capo|tempo)\s*:\s*(.*?)\s*\}$/i.exec(ln.trim());
    if(meta){ if(/^(title|t)$/i.test(meta[1])&&!title) title=meta[2]; continue; }
    var cdir=/^\{\s*(start_of_|so)?(chorus|verse|bridge|soc|sov|sob)[^}]*\}$/i.exec(ln.trim());
    if(cdir){ push(); cur={name:(cdir[2]||'').replace(/^so([cvb])$/i,function(m,x){return {c:'Chorus',v:'Verse',b:'Bridge'}[x.toLowerCase()]})||'',lines:[]}; continue; }
    if(/^\{\s*end_of/i.test(ln.trim())||/^\{\s*eo[cvb]\s*\}$/i.test(ln.trim())) continue;
    if(!ln.trim()){ if(cur.lines.length&&cur.lines[cur.lines.length-1].blank!==true) cur.lines.push({text:'',chords:[],blank:true}); continue; }
    if(SECTION_RE.test(ln)&&!isChordLine(ln)){ push(); cur={name:ln.replace(/[\[\]\(\):]/g,'').trim(),lines:[]}; continue; }
    if(/\[[A-G][^\]]*\]/.test(ln)){ /* ChordPro inline */
      var out={text:'',chords:[]}, re=/\[([^\]]+)\]/g, last=0, m;
      while((m=re.exec(ln))){ out.text+=ln.slice(last,m.index); if(parseChord(m[1])) addChord(m[1],out,out.text.length); else out.text+=m[0]; last=m.index+m[0].length; }
      out.text+=ln.slice(last); cur.lines.push(out); continue;
    }
    if(isChordLine(ln)){
      var next=lines[i+1]; var lyr=(next!==undefined&&next.trim()&&!isChordLine(next)&&!SECTION_RE.test(next)&&!/^\s*\{/.test(next))?next.replace(/\s+$/,''):null;
      var row={text:lyr||'',chords:[]}, re2=/\S+/g, mm;
      while((mm=re2.exec(ln))){ var t=cleanChordTok(mm[0]); if(isChordToken(mm[0])&&parseChord(t)) addChord(t,row,mm.index); }
      if(lyr!==null) i++;
      if(row.chords.length) cur.lines.push(row); continue;
    }
    if(!title&&!sections.length&&!cur.lines.length&&ln.trim().length<70&&!/^[-=_*#]+$/.test(ln.trim())){ title=ln.trim().replace(/^[#*\s]+|[#*\s]+$/g,''); continue; }
    if(/^\s*(capo|tuning|key|tempo|bpm)\b/i.test(ln)) continue;
    cur.lines.push({text:ln.trim(),chords:[]});
  }
  push();
  var capo=/capo\s*(?:on\s*)?(?:fret\s*)?(\d+)/i.exec(text); 
  return {title:title||'Untitled',sections:sections,seq:seq,capo:capo?+capo[1]:0,keyGuess:guessKey(seq)};
}
function guessKey(seq){
  var c=seq.length?parseChord(seq[0]):null; if(!c) return null;
  return SHARP_NAMES[c.root]+(c.q.charAt(0)==='m'&&c.q.indexOf('maj')!==0?'m':'');
}
/* Distinct chords in order of first appearance */
function uniqueChords(seq){var seen={},out=[]; seq.forEach(function(s){if(!seen[s]){seen[s]=1;out.push(s)}}); return out;}
/* Plain text back out (used to edit imported text) */
function chartToText(ch){
  var o=[]; ch.sections.forEach(function(s){ if(s.name) o.push('['+s.name+']'); s.lines.forEach(function(l){
    if(l.blank){o.push('');return;}
    if(l.chords.length){var cl='',pad=function(n){return new Array(Math.max(0,n)+1).join(' ')}; l.chords.forEach(function(c){cl+=pad(c.at-cl.length)+(cl.length&&c.at<=cl.length?' ':'')+c.sym}); o.push(cl);}
    if(l.text||!l.chords.length) o.push(l.text);
  });}); return o.join('\n');
}
