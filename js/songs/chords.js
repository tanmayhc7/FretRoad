/* Chord symbols: parsing, notes, guitar shapes and change difficulty. Strings are listed LOW to HIGH (E A D G B e). */
var NOTE_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
var SHARP_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], FLAT_NAMES=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
var LOW_OPEN=[40,45,50,55,59,64];
var CHORD_Q={ '':[0,4,7], 'm':[0,3,7], '7':[0,4,7,10], 'm7':[0,3,7,10], 'maj7':[0,4,7,11], 'sus2':[0,2,7], 'sus4':[0,5,7], '5':[0,7], 'dim':[0,3,6], 'aug':[0,4,8],
  '6':[0,4,7,9], 'm6':[0,3,7,9], 'add9':[0,4,7,14], '9':[0,4,7,10,14], 'm9':[0,3,7,10,14], 'dim7':[0,3,6,9], 'm7b5':[0,3,6,10], '7sus4':[0,5,7,10] };
function pcFromName(s){
  var m=/^([A-Ga-g])([#b♯♭]?)$/.exec(s); if(!m) return null;
  var pc=NOTE_PC[m[1].toUpperCase()]; if(m[2]==='#'||m[2]==='♯') pc++; else if(m[2]) pc--; return (pc+12)%12;
}
function normQuality(q){
  q=q.replace(/^maj$/i,'').replace(/^M$/,'').replace(/^min$|^-$/,'m').replace(/^M7$|^Maj7$|^maj7$|^Δ7?$/,'maj7').replace(/^min7$|^-7$/,'m7').replace(/^dom7$/,'7')
    .replace(/^sus$/,'sus4').replace(/^\+$/,'aug').replace(/^°$/,'dim').replace(/^ø$/,'m7b5').replace(/^2$/,'sus2').replace(/^4$/,'sus4').replace(/^7sus$/,'7sus4').replace(/^add2$/,'add9');
  if(CHORD_Q.hasOwnProperty(q)) return q;
  return null;
}
/* parseChord('F#m7/C#') -> {sym,root,q,bass,tones} or null. */
function parseChord(sym){
  var m=/^([A-G][#b♯♭]?)([^\/]*)(?:\/([A-G][#b♯♭]?))?$/.exec(sym.trim()); if(!m) return null;
  var root=pcFromName(m[1]); if(root===null) return null;
  var q=normQuality(m[2]); if(q===null){ var base=/^(m(?!aj)|maj7|M7|dim|aug|sus[24]?)/.exec(m[2]); q=base?normQuality(base[1]):''; if(q===null) q=''; }
  var bass=m[3]?pcFromName(m[3]):null;
  return {sym:sym.trim(),root:root,q:q,bass:bass,tones:CHORD_Q[q].map(function(i){return (root+i)%12}),exact:normQuality(m[2])!==null};
}
function chordSym(c,flats){var N=flats?FLAT_NAMES:SHARP_NAMES; return N[c.root]+c.q+(c.bass!==null?'/'+N[c.bass]:'');}
function transposeChord(sym,semis,flats){var c=parseChord(sym); if(!c) return sym; c.root=(c.root+semis+120)%12; if(c.bass!==null) c.bass=(c.bass+semis+120)%12; return chordSym(c,flats);}
/* Open shapes: 6 digits low to high, x = muted */
var OPEN_SHAPES={
  'C':'x32010','Cmaj7':'x32000','C7':'x32310','Cadd9':'x32030','C6':'x32210',
  'D':'xx0232','Dm':'xx0231','D7':'xx0212','Dmaj7':'xx0222','Dsus4':'xx0233','Dsus2':'xx0230','Dm7':'xx0211','D5':'xx023x',
  'E':'022100','Em':'022000','E7':'020100','Em7':'020000','Emaj7':'021100','E5':'022xxx','Esus4':'002200','E7sus4':'020200',
  'A':'x02220','Am':'x02210','A7':'x02020','Am7':'x02010','Amaj7':'x02120','Asus4':'x02230','Asus2':'x02200','A5':'x022xx','Aadd9':'x02420','A6':'x02222',
  'G':'320003','G7':'320001','Gmaj7':'320002','G6':'320000','Gsus4':'330013','G5':'355xxx','Gadd9':'320203',
  'B7':'x21202','Bm':'x24432','Em6':'022020',
  'F':'133211','Fmaj7':'xx3210','Fm':'133111','F7':'131211'
};
/* Movable shapes as offsets from the barre fret r. */
var E_SHAPES={'':[0,2,2,1,0,0],'m':[0,2,2,0,0,0],'7':[0,2,0,1,0,0],'m7':[0,2,0,0,0,0],'maj7':[0,2,1,1,0,0],'sus4':[0,2,2,2,0,0],'sus2':[0,2,4,4,0,0],'5':[0,2,2,null,null,null],'6':[0,2,2,1,2,0],'m6':[0,2,2,0,2,0],'dim':[0,1,2,0,null,null],'7sus4':[0,2,0,2,0,0]};
var A_SHAPES={'':[null,0,2,2,2,0],'m':[null,0,2,2,1,0],'7':[null,0,2,0,2,0],'m7':[null,0,2,0,1,0],'maj7':[null,0,2,1,2,0],'sus4':[null,0,2,2,3,0],'sus2':[null,0,2,2,0,0],'5':[null,0,2,2,null,null],'6':[null,0,2,2,2,2],'m6':[null,0,2,2,1,2],'dim':[null,0,1,2,1,null],'m7b5':[null,0,1,0,1,null],'add9':[null,0,2,4,2,0],'9':[null,0,2,0,2,3],'m9':[null,0,1,0,0,0],'dim7':[null,0,1,2,1,2],'aug':[null,0,3,2,2,1],'7sus4':[null,0,2,0,3,0]};
var E_SHAPES_X={'aug':[0,3,2,1,1,0],'add9':[0,2,4,1,0,0],'9':[0,2,0,1,0,2],'m9':[0,2,0,0,0,2],'m7b5':[0,null,0,0,-1,null],'dim7':[0,1,2,0,2,null]};
function shapeFromOffsets(off,r){return off.map(function(o){return o===null?-1:r+o});}
/* chordShape(sym) -> {frets:[6], base, barre, open} ; frets -1 = muted, 0 = open. */
function chordShape(sym){
  var c=typeof sym==='string'?parseChord(sym):sym; if(!c) return null;
  var key=SHARP_NAMES[c.root]+c.q, fkey=FLAT_NAMES[c.root]+c.q;
  var s=OPEN_SHAPES[key]||OPEN_SHAPES[fkey];
  if(s) return mkShape(s.split('').map(function(ch){return ch==='x'?-1:+ch}),c);
  var cands=[];
  var re=(c.root-4+12)%12, ra=(c.root-9+12)%12;
  if(E_SHAPES[c.q]) cands.push(shapeFromOffsets(E_SHAPES[c.q],re===0?12:re));
  if(A_SHAPES[c.q]) cands.push(shapeFromOffsets(A_SHAPES[c.q],ra===0?12:ra));
  if(!cands.length&&E_SHAPES_X[c.q]) cands.push(shapeFromOffsets(E_SHAPES_X[c.q],re===0?12:re));
  if(!cands.length) return null;
  cands.sort(function(a,b){return maxFret(a)-maxFret(b)});
  return mkShape(cands[0],c);
}
function maxFret(f){return Math.max.apply(null,f)}
function mkShape(frets,c){
  var fr=frets.filter(function(x){return x>0}), lo=fr.length?Math.min.apply(null,fr):0;
  var barre=false; if(lo>0&&frets.indexOf(0)<0){var a=frets.indexOf(lo),z=frets.lastIndexOf(lo); barre=z-a>=3;}
  if(c&&c.bass!==null){ /* slash chord: mute strings below the bass note when it is in the shape, else keep */ }
  return {frets:frets,base:Math.max(1,lo>4?lo:1),barre:barre,lo:lo,open:lo===0||frets.indexOf(0)>=0};
}
function chordShapeNotes(sh){var out=[]; sh.frets.forEach(function(f,i){if(f>=0) out.push(LOW_OPEN[i]+f)}); return out;}
/* How hard is the change a -> b?  Counts fingers that must move, and finds a finger that can stay put. */
function changeInfo(a,b){
  var sa=chordShape(a), sb=chordShape(b); if(!sa||!sb) return {moves:null,anchor:null,hard:false,tip:'No shape on file for one of these chords.'};
  var moves=0, anchor=null;
  for(var i=0;i<6;i++){
    var fa=sa.frets[i], fb=sb.frets[i];
    if(fb>0){ if(fa===fb){ if(!anchor) anchor={string:i,fret:fb}; } else moves++; }
  }
  var names=['low E','A','D','G','B','high E'];
  var tip;
  if(anchor) tip='Keep your finger on the '+names[anchor.string]+' string, fret '+anchor.fret+'. It does not move.';
  else if(sa.barre||sb.barre) tip='Slide the whole shape. Let the barre finger lead.';
  else tip='No shared finger. Lift everything and land all fingers together.';
  return {moves:moves,anchor:anchor,hard:moves>=3&&!anchor,tip:tip};
}
/* All shapes we know for a chord: its open shape (if any) plus movable E-shape and A-shape barres that fit on the first 12 frets. */
function chordShapeOptions(sym){
  var c=typeof sym==='string'?parseChord(sym):sym; if(!c) return []; var out=[], key=SHARP_NAMES[c.root]+c.q, fkey=FLAT_NAMES[c.root]+c.q, s=OPEN_SHAPES[key]||OPEN_SHAPES[fkey];
  if(s) out.push({name:'Open',frets:s.split('').map(function(ch){return ch==='x'?-1:+ch})});
  var re=(c.root-4+12)%12, ra=(c.root-9+12)%12, eo=E_SHAPES[c.q]||E_SHAPES_X[c.q], ao=A_SHAPES[c.q];
  function add(name,off,r){ if(!off) return; var f=shapeFromOffsets(off,r); if(maxFret(f)>12) return; if(out.some(function(o){return o.frets.join()===f.join()})) return; out.push({name:name,frets:f}); }
  add(re===0?'E-shape (open)':'E-shape barre',eo,re); add(ra===0?'A-shape (open)':'A-shape barre',ao,ra);
  if(re>=0&&re+12<=12){} return out;
}
