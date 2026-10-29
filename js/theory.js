/* Chord and scale theory and question generators */
/* ======== practice library: chords, scales, rhythm ======== */
var CT={
 major:{sym:'',name:'major',iv:[0,4,7],f:'1 3 5',feel:'bright and settled'},
 minor:{sym:'m',name:'minor',iv:[0,3,7],f:'1 ♭3 5',feel:'darker and more serious'},
 pow:{sym:'5',name:'power chord',iv:[0,7],f:'1 5',feel:'open and strong, neither major nor minor'},
 sus2:{sym:'sus2',name:'suspended 2nd',iv:[0,2,7],f:'1 2 5',feel:'open and unresolved'},
 sus4:{sym:'sus4',name:'suspended 4th',iv:[0,5,7],f:'1 4 5',feel:'hanging, wanting to fall back to major'},
 dom7:{sym:'7',name:'dominant 7th',iv:[0,4,7,10],f:'1 3 5 ♭7',feel:'bluesy, tense, wanting to move'},
 maj7:{sym:'maj7',name:'major 7th',iv:[0,4,7,11],f:'1 3 5 7',feel:'dreamy and smooth'},
 min7:{sym:'m7',name:'minor 7th',iv:[0,3,7,10],f:'1 ♭3 5 ♭7',feel:'mellow and relaxed'},
 dim:{sym:'dim',name:'diminished',iv:[0,3,6],f:'1 ♭3 ♭5',feel:'tense and unstable'},
 aug:{sym:'aug',name:'augmented',iv:[0,4,8],f:'1 3 ♯5',feel:'eerie, stretched upward'},
 add9:{sym:'add9',name:'add9',iv:[0,4,7,2],f:'1 3 5 9',feel:'a major chord with a shimmer on top'},
 six:{sym:'6',name:'major 6th',iv:[0,4,7,9],f:'1 3 5 6',feel:'sweet and vintage'},
 m7b5:{sym:'m7♭5',name:'half-diminished',iv:[0,3,6,10],f:'1 ♭3 ♭5 ♭7',feel:'dark and jazzy'},
 dim7:{sym:'dim7',name:'diminished 7th',iv:[0,3,6,9],f:'1 ♭3 ♭5 ♭♭7',feel:'symmetrical, dramatic'}
};
function csym(r,t){return NAMES[r]+CT[t].sym}
function cpcs(r,t){return CT[t].iv.map(function(i){return (r+i)%12})}
function noteList(pcs){return pcs.map(function(p){return NAMES[p]}).join(' · ')}
function mkChoices(correct,others){
  var set=[correct]; shuffle(others).forEach(function(o){ if(set.length<4&&set.indexOf(o)<0) set.push(o)});
  return shuffle(set).map(function(l){return {label:l,ok:l===correct}});
}
/* open-position shapes, low E string first; -1 = not played */
var SHAPES=[
 ['E','major',4,[0,2,2,1,0,0]],['Em','minor',4,[0,2,2,0,0,0]],['A','major',9,[-1,0,2,2,2,0]],['Am','minor',9,[-1,0,2,2,1,0]],
 ['D','major',2,[-1,-1,0,2,3,2]],['Dm','minor',2,[-1,-1,0,2,3,1]],['G','major',7,[3,2,0,0,0,3]],['C','major',0,[-1,3,2,0,1,0]],
 ['E7','dom7',4,[0,2,0,1,0,0]],['A7','dom7',9,[-1,0,2,0,2,0]],['D7','dom7',2,[-1,-1,0,2,1,2]],['G7','dom7',7,[3,2,0,0,0,1]],['B7','dom7',11,[-1,2,1,2,0,2]],
 ['Cmaj7','maj7',0,[-1,3,2,0,0,0]],['Am7','min7',9,[-1,0,2,0,1,0]],['Em7','min7',4,[0,2,0,0,0,0]],
 ['Dsus4','sus4',2,[-1,-1,0,2,3,3]],['Asus2','sus2',9,[-1,0,2,2,0,0]],['Dmaj7','maj7',2,[-1,-1,0,2,2,2]],['Fmaj7','maj7',5,[-1,-1,3,2,1,0]]
].map(function(a){return {sym:a[0],t:a[1],r:a[2],fr:a[3]}});
var SH_BASIC=['E','Em','A','Am','D','Dm','G','C'];
var SH_COLOR=['E7','A7','D7','G7','B7','Cmaj7','Am7','Em7','Dsus4','Asus2','Dmaj7','Fmaj7'];
function shapeBy(sym){return SHAPES.filter(function(s){return s.sym===sym})[0]}
function shapeOrbs(sh){var o=[]; sh.fr.forEach(function(f,i){var s=5-i; if(f<0) o.push({s:s,f:0,kind:'miss',label:'×'}); else o.push({s:s,f:f,kind:f===0?'ghost':'tone',label:''});}); return o;}
function shapeMidi(sh){var m=[]; sh.fr.forEach(function(f,i){ if(f>=0) m.push(OPEN[5-i]+f)}); return m;}
function shapeNotes(sh){return shapeMidi(sh).map(function(m){return NAMES[m%12]})}

/* scales */
var MAJ_DEG=[0,2,4,5,7,9,11];
var SCL={
 'major':{iv:[0,2,4,5,7,9,11],feel:'bright and settled'},
 'natural minor':{iv:[0,2,3,5,7,8,10],feel:'dark and sad'},
 'harmonic minor':{iv:[0,2,3,5,7,8,11],feel:'minor with a raised 7th, dramatic and a little Spanish'},
 'melodic minor':{iv:[0,2,3,5,7,9,11],feel:'minor with a raised 6th and 7th, smooth and jazzy'},
 'major pentatonic':{iv:[0,2,4,7,9],feel:'open and sweet, country and folk'},
 'minor pentatonic':{iv:[0,3,5,7,10],feel:'the rock and blues workhorse'},
 'blues':{iv:[0,3,5,6,7,10],feel:'minor pentatonic plus the ♭5, a gritty blue note'},
 'major blues':{iv:[0,2,3,4,7,9],feel:'major pentatonic plus a ♭3, sweet with a bend'},
 'dorian':{iv:[0,2,3,5,7,9,10],feel:'minor with a bright 6th, funky and cool'},
 'phrygian':{iv:[0,1,3,5,7,8,10],feel:'minor with a ♭2, dark and Spanish'},
 'lydian':{iv:[0,2,4,6,7,9,11],feel:'major with a ♯4, floating and dreamy'},
 'mixolydian':{iv:[0,2,4,5,7,9,10],feel:'major with a ♭7, bluesy and good for rock riffs'},
 'locrian':{iv:[0,1,3,5,6,8,10],feel:'unstable, with a ♭2 and ♭5, rarely a home key'},
 'whole tone':{iv:[0,2,4,6,8,10],f:'1 2 3 ♯4 ♯5 ♭7',feel:'all whole steps, dreamlike with no home note'},
 'diminished (whole-half)':{iv:[0,2,3,5,6,8,9,11],feel:'symmetrical and tense, a jazz staple'},
 'diminished (half-whole)':{iv:[0,1,3,4,6,7,9,10],feel:'symmetrical, played over dominant 7th chords'},
 'phrygian dominant':{iv:[0,1,4,5,7,8,10],feel:'a ♭2 with a major 3rd, flamenco and Middle Eastern colour'},
 'hungarian minor':{iv:[0,2,3,6,7,8,11],feel:'harmonic minor with a ♯4, exotic and dramatic'},
 'lydian dominant':{iv:[0,2,4,6,7,9,10],feel:'Lydian with a ♭7, bright and bluesy'}
};
var MODES=[{k:'major',n:'Ionian',off:0},{k:'dorian',n:'Dorian',off:2},{k:'phrygian',n:'Phrygian',off:4},{k:'lydian',n:'Lydian',off:5},{k:'mixolydian',n:'Mixolydian',off:7},{k:'natural minor',n:'Aeolian',off:9},{k:'locrian',n:'Locrian',off:11}];
var SP_BASIC=['major','natural minor','major pentatonic','minor pentatonic'];
var SP_MORE=['major','natural minor','major pentatonic','minor pentatonic','blues','dorian','mixolydian'];
var SP_EXOT=['harmonic minor','melodic minor','blues','major blues','whole tone','diminished (whole-half)','diminished (half-whole)','phrygian dominant','hungarian minor','lydian dominant'];
function sname(r,k){return NAMES[r]+' '+k}
function scpcs(r,k){return SCL[k].iv.map(function(i){return (r+i)%12})}
function formulaOf(k){
  var s=SCL[k]; if(s.f) return s.f;
  var iv=s.iv;
  if(iv.length===7) return iv.map(function(v,i){var d=v-MAJ_DEG[i]; return (d<0?'♭':(d>0?'♯':''))+(i+1)}).join(' ');
  return iv.map(function(v){return INTS[v]}).join(' ');
}
function stepsOf(k){
  var iv=SCL[k].iv, out=[]; for(var i=0;i<iv.length;i++){var d=(i+1<iv.length?iv[i+1]:12)-iv[i]; out.push(d===1?'H':(d===2?'W':(d===3?'1½':String(d))));}
  return out.join(' ');
}
function degLabels(k){return formulaOf(k).split(' ')}
function chroma7(r,k){return scpcs(r,k)}

var QX={}; /* generators for the extra practice modules */
QX.chordSpell=function(types){
  var t=pick(types),r=rnd(12),correct=noteList(cpcs(r,t));
  var others=types.filter(function(x){return x!==t}).concat(Object.keys(CT).filter(function(x){return x!==t}))
    .map(function(x){return noteList(cpcs(r,x))});
  return {prompt:'Which notes make '+csym(r,t)+'?',choices:mkChoices(correct,others),
    explain:csym(r,t)+' is a '+CT[t].name+' chord. Its formula is '+CT[t].f+', which gives '+correct+'.'};
};
QX.chordFormula=function(types){
  var t=pick(types),pool=types.slice();
  var others=pool.filter(function(x){return x!==t}).map(function(x){return CT[x].name+(CT[x].sym?' ('+CT[x].sym+')':'')});
  return {prompt:'Which chord has the formula '+CT[t].f+'?',choices:mkChoices(CT[t].name+(CT[t].sym?' ('+CT[t].sym+')':''),others),
    explain:'The formula '+CT[t].f+' is a '+CT[t].name+' chord. It sounds '+CT[t].feel+'.'};
};
QX.chordFromNotes=function(types){
  var t=pick(types),r=rnd(12),correct=csym(r,t);
  var others=types.filter(function(x){return x!==t}).map(function(x){return csym(r,x)});
  return {prompt:'Name this chord: '+noteList(cpcs(r,t)),choices:mkChoices(correct,others),
    explain:'Starting from '+NAMES[r]+', the notes stack as '+CT[t].f+', which is '+correct+'.'};
};
QX.open=function(poolNames){
  var sh=shapeBy(pick(poolNames));
  return {prompt:'Which chord is this shape? Hollow rings are open strings and a × means that string is not played.',
    board:shapeOrbs(sh),choices:mkChoices(sh.sym,poolNames.filter(function(x){return x!==sh.sym})),
    audio:[{label:'Hear the shape',notes:shapeMidi(sh),mode:'chord'}],
    explain:'The strings sound '+shapeNotes(sh).join(' · ')+'. Those are the notes of '+sh.sym+'.'};
};
QX.barre=function(){
  var shape=pick(['E','A']),minor=rnd(2)===1,f=1+rnd(8),fr,root;
  if(shape==='E'){fr=[f,f+2,f+2,minor?f:f+1,f,f]; root=pcOf(5,f);} else {fr=[-1,f,f+2,f+2,minor?f+1:f+2,f]; root=pcOf(4,f);}
  var sh={sym:'',fr:fr};
  var correct=NAMES[root]+(minor?'m':''),others=[NAMES[root]+(minor?'':'m'),NAMES[(root+2)%12]+(minor?'m':''),NAMES[(root+10)%12]+(minor?'m':''),NAMES[(root+7)%12]+(minor?'m':'')];
  return {prompt:'This is a movable '+shape+'-shape barre chord. Which chord is it?',board:shapeOrbs(sh),choices:mkChoices(correct,others),
    audio:[{label:'Hear the shape',notes:shapeMidi(sh),mode:'chord'}],
    explain:'The root sits on the '+(shape==='E'?'low E':'A')+' string at fret '+f+', which is '+NAMES[root]+'. '+(minor?'The third finger lifts off, so the middle note drops a fret and it is minor.':'The full shape gives a major third, so it is major.')};
};
QX.chordEar=function(types){
  var t=pick(types),r=rnd(12),base=40+((r-4+12)%12),notes=CT[t].iv.map(function(i){return base+i}); notes.push(base+12);
  var names=types.map(function(x){return CT[x].name});
  return {prompt:'Listen, then choose the chord type.',audio:[{label:'Play the chord',notes:notes,mode:'chord'},{label:'Play it note by note',notes:notes,mode:'run'}],
    choices:mkChoices(CT[t].name,names.filter(function(x){return x!==CT[t].name})),
    explain:'That was a '+CT[t].name+' chord, which sounds '+CT[t].feel+'.'};
};
var MAJ_FAM={off:[0,2,4,5,7,9,11],t:['major','minor','minor','major','major','minor','dim'],n:['I','ii','iii','IV','V','vi','vii°']};
var MIN_FAM={off:[0,2,3,5,7,8,10],t:['minor','dim','major','minor','minor','major','major'],n:['i','ii°','♭III','iv','v','♭VI','♭VII']};
var SEV_FAM={off:MAJ_FAM.off,t:['maj7','min7','min7','maj7','dom7','min7','m7b5'],n:['Imaj7','iim7','iiim7','IVmaj7','V7','vim7','viiø7']};
QX.family=function(F,which){
  var r=rnd(12),d=rnd(7),sym=function(k){return csym((r+F.off[k])%12,F.t[k])};
  var key=NAMES[r]+(F===MIN_FAM?' minor':' major');
  if(rnd(2)===0){
    var others=[0,1,2,3,4,5,6].filter(function(k){return k!==d}).map(sym);
    return {prompt:'In the key of '+key+', which chord is the '+F.n[d]+'?',choices:mkChoices(sym(d),others),
      explain:'The '+F.n[d]+' chord sits on the '+(d+1)+(['st','nd','rd'][d]||'th')+' note of the scale, which is '+NAMES[(r+F.off[d])%12]+'. Here it is '+sym(d)+'.'};
  }
  var others2=[0,1,2,3,4,5,6].filter(function(k){return k!==d}).map(function(k){return F.n[k]});
  return {prompt:'In the key of '+key+', '+sym(d)+' is which chord?',choices:mkChoices(F.n[d],others2),
    explain:sym(d)+' is built on the '+(d+1)+(['st','nd','rd'][d]||'th')+' note of '+key+', so it is the '+F.n[d]+'. Upper case is major, lower case is minor.'};
};
QX.openStrings=function(){
  var s=rnd(6),k=rnd(3);
  if(k===0) return {prompt:'What note is the open '+SNAME[s]+' string?',choices:noteChoices(pcOf(s,0)),board:[{s:s,f:0,kind:'ghost',label:'?',reveal:{kind:'found',label:NAMES[pcOf(s,0)]}}],
    explain:'The six open strings are E A D G B E, from the thick low E to the thin high E.'};
  if(k===1) return {kind:'click',prompt:'Click the open '+NAMES[pcOf(s,0)]+' string (fret 0 on the string tuned to '+NAMES[pcOf(s,0)]+').',click:{s:s,pc:pcOf(s,0),f:0},
    after:[{s:s,f:0,kind:'found',label:NAMES[pcOf(s,0)]}],explain:'The '+SNAME[s]+' string is tuned to '+NAMES[pcOf(s,0)]+'.'};
  var num=6-s;
  return {prompt:'Strings are numbered from the thinnest. Which note is string number '+(s+1)+'?',choices:noteChoices(pcOf(s,0)),
    explain:'String '+(s+1)+' is the '+SNAME[s]+' string, tuned to '+NAMES[pcOf(s,0)]+'.'};
};
QX.scaleSpell=function(pool){
  var k=pick(pool),r=rnd(12),correct=noteList(scpcs(r,k));
  var others=pool.filter(function(x){return x!==k}).concat(Object.keys(SCL).filter(function(x){return x!==k})).map(function(x){return noteList(scpcs(r,x))});
  return {prompt:'Which notes make the '+sname(r,k)+' scale?',choices:mkChoices(correct,others),
    explain:sname(r,k)+' follows the formula '+formulaOf(k)+', which gives '+correct+'. It sounds '+SCL[k].feel+'.'};
};
QX.scaleFormula=function(pool){
  var k=pick(pool);
  var others=pool.filter(function(x){return x!==k&&stepsOf(x)!==stepsOf(k)});
  return {prompt:'Which scale follows this step pattern? '+stepsOf(k)+'  (W = whole step, H = half step, 1½ = a step and a half)',
    choices:mkChoices(k,others),explain:'The pattern '+stepsOf(k)+' belongs to the '+k+' scale, which sounds '+SCL[k].feel+'.'};
};
QX.scaleMissing=function(pool){
  var k=pick(pool),r=rnd(12),pcs=scpcs(r,k),gap=1+rnd(pcs.length-1),miss=pcs[gap];
  var shown=pcs.map(function(p,i){return i===gap?'?':NAMES[p]}).join(' · ');
  var others=[1,2,3,5,6,10,11].map(function(d){return (miss+d)%12}).filter(function(p){return pcs.indexOf(p)<0});
  var set=[miss]; shuffle(others).forEach(function(p){if(set.length<4) set.push(p)});
  return {prompt:'One note is missing from '+sname(r,k)+':  '+shown,choices:shuffle(set).map(function(p){return {label:NAMES[p],ok:p===miss}}),
    explain:'The missing note is '+NAMES[miss]+', the '+degLabels(k)[gap]+' of '+sname(r,k)+'.'};
};
QX.scaleDegree=function(pool){
  var k=pick(pool),r=rnd(12),pcs=scpcs(r,k),d=1+rnd(pcs.length-1),lab=degLabels(k)[d];
  return {prompt:'In '+sname(r,k)+', which note is the '+lab+'?',choices:noteChoices(pcs[d]),
    explain:'In '+sname(r,k)+' (formula '+formulaOf(k)+'), the '+lab+' is '+NAMES[pcs[d]]+'.'};
};
QX.scaleClick=function(pool){
  var k=pick(pool),r=rnd(12),pcs=scpcs(r,k),d=1+rnd(pcs.length-1),lab=degLabels(k)[d],s=rnd(6),p=pcs[d],fr=[];
  for(var f=0;f<=FRETS;f++) if(pcOf(s,f)===p) fr.push(f);
  return {kind:'click',prompt:'In '+sname(r,k)+', click the '+lab+' on the '+SNAME[s]+' string.',click:{s:s,pc:p},
    after:fr.map(function(f){return {s:s,f:f,kind:'found',label:NAMES[p]}}),
    explain:'The '+lab+' of '+sname(r,k)+' is '+NAMES[p]+', found at '+fretWords(fr)+' on the '+SNAME[s]+' string.'};
};
QX.scaleEar=function(pool){
  var k=pick(pool),r=rnd(12),base=45+((r-9+12)%12),notes=SCL[k].iv.map(function(i){return base+i}); notes.push(base+12);
  return {prompt:'Listen to the scale, then name it.',audio:[{label:'Play the scale',notes:notes,mode:'run'}],
    choices:mkChoices(k,pool.filter(function(x){return x!==k})),
    explain:'That was the '+k+' scale: '+SCL[k].feel+'.'};
};
QX.modeName=function(){
  var m=pick(MODES),r=rnd(12),correct=NAMES[r]+' '+m.n;
  return {prompt:'Which mode is this?  '+noteList(scpcs(r,m.k)),choices:mkChoices(correct,MODES.filter(function(x){return x!==m}).map(function(x){return NAMES[r]+' '+x.n})),
    explain:'Starting on '+NAMES[r]+', that pattern is '+m.n+' ('+formulaOf(m.k)+'). It sounds '+SCL[m.k].feel+'.'};
};
QX.modeParent=function(){
  var m=pick(MODES.slice(1)),r=rnd(12),par=(r-m.off+12)%12;
  return {prompt:NAMES[r]+' '+m.n+' uses the same seven notes as which major scale?',choices:noteChoices(par,' major'),
    explain:NAMES[r]+' is the '+(MODES.indexOf(m)+1)+(['st','nd','rd'][MODES.indexOf(m)]||'th')+' note of '+NAMES[par]+' major, so '+m.n+' is '+NAMES[par]+' major played from '+NAMES[r]+'.'};
};
QX.modeDiff=function(){
  var m=pick(MODES.slice(1)),diff=[];
  SCL[m.k].iv.forEach(function(v,i){var d=v-MAJ_DEG[i]; if(d) diff.push((d<0?'♭':'♯')+(i+1))});
  return {prompt:'Compared with the major scale, which mode has '+diff.join(' and ')+'?',choices:mkChoices(m.n,MODES.filter(function(x){return x!==m}).map(function(x){return x.n})),
    explain:m.n+' is the major scale with '+diff.join(', ')+'. It sounds '+SCL[m.k].feel+'.'};
};
var SIGS=[[2,4],[3,4],[4,4],[5,4],[6,8],[7,8],[9,8],[12,8],[5,8]];
function sigStr(s){return s[0]+'/'+s[1]}
QX.timeSig=function(){
  var k=rnd(5);
  if(k===0){var n=pick([2,3,4,5]);return {prompt:'How many quarter-note beats are in a bar of '+n+'/4?',choices:numChoices(n,'',[2,3,4,5,6,7],2,8),explain:'The top number is how many beats per bar and the bottom number says which note gets one beat. In '+n+'/4 that is '+n+' quarter notes.'};}
  if(k===1) return {prompt:'Which time signature is the classic waltz feel, counted ONE two three?',choices:mkChoices('3/4',['4/4','6/8','5/4','2/4']),explain:'Waltzes are in 3/4: three beats a bar with the accent on the first.'};
  if(k===2){var e=pick([5,6,7,9,12]);return {prompt:'How many eighth notes fill one bar of '+e+'/8?',choices:numChoices(e,'',[5,6,7,8,9,12],3,13),explain:'In '+e+'/8 the bottom 8 means the counting unit is an eighth note, and there are '+e+' of them per bar.'};}
  if(k===3){var c=pick(['6/8','9/8','12/8']),g={'6/8':2,'9/8':3,'12/8':4}[c];return {prompt:'Compound time is felt in groups of three eighth notes. How many main beats does one bar of '+c+' have?',choices:numChoices(g,'',[1,2,3,4,6,9],1,12),explain:c+' is felt as '+g+' big beats, each made of three eighth notes.'};}
  var odd=pick(['7/8','5/4','5/8']),grp={'7/8':'2+2+3 or 3+2+2','5/4':'3+2 or 2+3','5/8':'3+2 or 2+3'}[odd];
  return {prompt:'Which of these is an odd meter that is usually counted in uneven groups such as '+grp+'?',choices:mkChoices(odd,['4/4','3/4','6/8','2/4','12/8'].filter(function(x){return x!==odd})),
    explain:odd+' does not divide evenly, so players count it in groups of '+grp+'.'};
};
QX.rhythmEar=function(){
  var s=pick(SIGS.slice(0,8)),bpm=88;
  var others=SIGS.slice(0,8).map(sigStr).filter(function(x){return x!==sigStr(s)});
  return {prompt:'Listen to two bars. The accented click is beat one. Which time signature is it?',audio:[{label:'Play two bars',mode:'bar',sig:s,bpm:bpm}],
    choices:mkChoices(sigStr(s),others),explain:'That was '+sigStr(s)+'. Count between the loud clicks: '+meterSpec(s[0],s[1]).count+'.'};
};
