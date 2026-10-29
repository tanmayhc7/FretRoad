/* Practice drills, second batch */
/* ======== second batch of drills ======== */
var FLATN=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
function nm(p){return NAMES[p]}
function notIn(arr,x){return arr.filter(function(y){return y!==x})}
/* triad inversions */
QX.inversion=function(){
  var t=pick(['major','minor']),r=rnd(12),inv=1+rnd(2),pcs=cpcs(r,t),bass=pcs[inv];
  var lab=inv===1?'first inversion':'second inversion',slash=csym(r,t)+'/'+nm(bass);
  if(rnd(2)){
    return {prompt:'In '+lab+', which note of '+csym(r,t)+' is in the bass?',
      choices:mkChoices(nm(bass),notIn(pcs.map(nm),nm(bass)).concat([nm((r+2)%12),nm((r+9)%12)])),
      explain:'Root position has the root in the bass. First inversion puts the 3rd there, second inversion puts the 5th. In '+lab+' the bass is '+nm(bass)+'.'};
  }
  return {prompt:'What is '+slash+' (a slash chord)?',choices:mkChoices(lab,['root position',inv===1?'second inversion':'first inversion','a seventh chord']),
    explain:'The note after the slash is the bass note. '+nm(bass)+' is the '+(inv===1?'3rd':'5th')+' of '+csym(r,t)+', so this is '+lab+'.'};
};
/* capo and open shapes */
var CAPO_SH=['C','A','G','E','D','Am','Em','Dm'];
QX.capo=function(){
  var sh=shapeBy(pick(CAPO_SH)),n=1+rnd(7),r=(sh.r+n)%12,minor=sh.t==='minor',snd=nm(r)+(minor?'m':'');
  if(rnd(2)){
    var o=[-2,-1,1,2,5,7].map(function(d){return nm((r+d+12)%12)+(minor?'m':'')});
    return {prompt:'You put a capo on fret '+n+' and play the open '+sh.sym+' shape. Which chord actually sounds?',choices:mkChoices(snd,notIn(o,snd)),
      explain:'A capo raises every string by one semitone per fret. '+sh.sym+' moved up '+n+' fret'+(n>1?'s':'')+' becomes '+snd+'.'};
  }
  var others=[]; for(var k=1;k<=7;k++) if(k!==n) others.push('fret '+k);
  return {prompt:'You want to sound '+snd+' using the open '+sh.sym+' shape. Where does the capo go?',choices:mkChoices('fret '+n,others),
    explain:'Count the semitones from '+sh.sym+' up to '+snd+': that is '+n+', so the capo goes on fret '+n+'.'};
};
/* circle of fifths and key signatures */
var CIRCLE=['A♭','E♭','B♭','F','C','G','D','A','E','B'];
var REL={'A♭':'F','E♭':'C','B♭':'G','F':'D','C':'A','G':'E','D':'B','A':'F♯','E':'C♯','B':'G♯'};
function sigOf(i){var d=i-4; return d>0? d+(d>1?' sharps':' sharp') : (d<0? (-d)+(d<-1?' flats':' flat') : 'no sharps or flats')}
QX.keysig=function(){
  var i=rnd(CIRCLE.length),k=CIRCLE[i],q=rnd(4);
  if(q===0){
    var o=CIRCLE.map(function(_,j){return sigOf(j)}).filter(function(x){return x!==sigOf(i)});
    return {prompt:'How many sharps or flats are in the key of '+k+' major?',choices:mkChoices(sigOf(i),o),
      explain:'Going up a fifth from C adds a sharp each time (G, D, A, E, B). Going up a fourth adds a flat (F, B♭, E♭, A♭). '+k+' major has '+sigOf(i)+'.'};}
  if(q===1){
    var j=(i+1)%CIRCLE.length; if(i===CIRCLE.length-1) {i=rnd(CIRCLE.length-1); k=CIRCLE[i]; j=i+1}
    var fv=CIRCLE[j];
    return {prompt:'Which major key is a fifth above '+k+' on the circle of fifths?',choices:mkChoices(fv,notIn(CIRCLE,fv).filter(function(x){return x!==k})),
      explain:'A fifth above '+k+' is seven semitones up, which is '+fv+'. Each step clockwise round the circle adds one sharp (or removes one flat).'};}
  var rel=REL[k];
  if(q===2){
    var o3=Object.keys(REL).map(function(x){return REL[x]+' minor'});
    return {prompt:'What is the relative minor of '+k+' major?',choices:mkChoices(rel+' minor',notIn(o3,rel+' minor')),
      explain:'The relative minor starts on the 6th note of the major scale, a minor third (3 semitones) below the root. For '+k+' that is '+rel+'.'};}
  var o4=CIRCLE.map(function(x){return x+' major'});
  return {prompt:rel+' minor shares its notes with which major key?',choices:mkChoices(k+' major',notIn(o4,k+' major')),
    explain:'Relative keys use the same seven notes. '+rel+' minor and '+k+' major both have '+sigOf(i)+'.'};
};
/* tempo and note values */
QX.tempo=function(){
  var q=rnd(4);
  if(q===0){var b=pick([60,80,100,120,150]),ms=Math.round(60000/b);
    return {prompt:'At '+b+' bpm, about how long is one quarter-note beat?',
      choices:mkChoices(ms+' ms',[ms*2,Math.round(ms/2),Math.round(ms*1.5),Math.round(ms/1.5)].map(function(x){return x+' ms'})),
      explain:'One minute is 60,000 ms. 60,000 ÷ '+b+' = '+ms+' ms per beat.'};}
  if(q===1){var v=pick([['whole note',4],['half note',2],['dotted half note',3],['dotted quarter note',1.5],['quarter note',1]]);
    return {prompt:'In 4/4, how many beats does a '+v[0]+' last?',choices:mkChoices(String(v[1]),notIn(['0.5','1','1.5','2','3','4'],String(v[1]))),
      explain:'A quarter note is one beat, a half is two, a whole is four. A dot adds half of the note\'s own length, so a dotted half = 2 + 1 = 3 and a dotted quarter = 1 + 0.5 = 1.5.'};}
  if(q===2){var d=pick([['eighth',2],['sixteenth',4],['triplet eighth',3]]);
    return {prompt:'How many '+d[0]+' notes fit into one quarter-note beat?',choices:mkChoices(String(d[1]),notIn(['1','2','3','4','6'],String(d[1]))),
      explain:'Two eighths, three triplet eighths or four sixteenths each fill one quarter-note beat.'};}
  var b2=pick([60,90,120]),half=b2*2;
  return {prompt:'A song is at '+b2+' bpm. How many eighth notes is that per minute?',choices:mkChoices(String(half),[String(b2),String(half*2),String(Math.round(b2*1.5)),String(Math.round(half/3))]),
    explain:'Two eighth notes fit in each beat, so '+b2+' beats a minute is '+half+' eighths a minute.'};
};
/* strumming patterns */
var STRUM=[['D','_','D','U','_','U','D','U'],['D','_','D','_','D','U','D','U'],['D','U','D','U','D','U','D','U'],['D','_','_','U','_','U','D','_']];
var COUNT8=['1','&','2','&','3','&','4','&'];
QX.strum=function(){
  var p=pick(STRUM),q=rnd(3),show=p.map(function(x,i){return COUNT8[i]+' '+(x==='_'?'–':x)}).join('   ');
  var ups=p.filter(function(x){return x==='U'}).length,dn=p.filter(function(x){return x==='D'}).length;
  var base='D = down, U = up, – = air strum (hand moves, no hit). One bar of 4/4:\n'+show;
  if(q===0) return {prompt:base+'\nHow many down strums are in this bar?',choices:mkChoices(String(dn),notIn(['1','2','3','4','5','6'],String(dn))),
    explain:'Count the Ds: there are '+dn+'. Down strums usually land on the numbers.'};
  if(q===1) return {prompt:base+'\nHow many up strums are in this bar?',choices:mkChoices(String(ups),notIn(['0','1','2','3','4','5'],String(ups))),
    explain:'Count the Us: there are '+ups+'. Up strums fall on the "&" counts between the beats.'};
  var first=p.indexOf('U'),lab='the & after '+COUNT8[first-1];
  return {prompt:base+'\nWhere does the first up strum land?',choices:mkChoices(lab,notIn(['1','2','3','4'].map(function(x){return 'the & after '+x}),lab)),
    explain:'Up strums sit on the "&" counts. The first U here falls on '+lab+'.'};
};
/* chord-scale matching */
var CS={maj7:['Ionian (major)','Lydian'],min7:['Dorian','Aeolian (natural minor)'],dom7:['Mixolydian'],m7b5:['Locrian']};
var ALLM=['Ionian (major)','Dorian','Phrygian','Lydian','Mixolydian','Aeolian (natural minor)','Locrian'];
QX.chordScale=function(){
  if(rnd(3)===0){
    var key=rnd(12),d=(key+2)%12,v=(key+7)%12,prog=[csym(d,'min7'),csym(v,'dom7'),csym(key,'maj7')];
    var w=rnd(3),ans=['Dorian','Mixolydian','Ionian (major)'][w];
    return {prompt:'Over '+prog.join(' – ')+' (a ii–V–I in '+nm(key)+'), which mode fits the '+prog[w]+' chord?',choices:mkChoices(ans,notIn(ALLM,ans)),
      explain:'In a major key the ii chord takes Dorian, the V takes Mixolydian and the I takes Ionian. All three use the same seven notes of '+nm(key)+' major.'};
  }
  var typ=pick(['maj7','min7','dom7','m7b5']),r=rnd(12),name=csym(r,typ),ans2=CS[typ][0];
  return {prompt:'Which mode is the classic choice to play over '+name+'?',choices:mkChoices(ans2,ALLM.filter(function(x){return CS[typ].indexOf(x)<0})),
    explain:name+' is a '+CT[typ].name+'. The standard match is '+ans2+(CS[typ].length>1?' (another common one is '+CS[typ][1]+')':'')+'.'};
};
QB.inversion=function(){return QX.inversion()};
QB.capo=function(){return QX.capo()};
QB.keysig=function(){return QX.keysig()};
QB.tempoQ=function(){return QX.tempo()};
QB.strum=function(){return QX.strum()};
QB.chordScale=function(){return QX.chordScale()};
[
 {id:'tempoq',name:'Tempo and Note Values',desc:'Beats, bpm in milliseconds, dotted notes, eighths, sixteenths and triplets.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['tempoQ'],
  primer:['A tempo is how many beats fit in a minute. At 60 bpm each beat is one second; at 120 bpm it is half a second.','A quarter note gets one beat, an eighth gets half a beat, a sixteenth a quarter. A dot makes a note one and a half times as long.']},
 {id:'strum',name:'Strumming Patterns',desc:'Read a down and up pattern against the count.',needs:1,lv:1,rounds:10,tier:'Beginner',pool:['strum'],
  primer:['Strumming is a steady down-up motion. Your hand keeps moving even when it does not hit the strings.','Downs land on the numbers (1 2 3 4). Ups land on the "&" between them. A skipped strum is a rest for the strings, not for your hand.']},
 {id:'keysig',name:'Circle of Fifths',desc:'Key signatures, keys a fifth apart and relative minors.',needs:3,lv:3,rounds:10,tier:'Intermediate',pool:['keysig'],
  primer:['Move up a fifth from C and you get G, then D, A, E, B. Each step adds one sharp. Move up a fourth for flats: F, B♭, E♭, A♭.','Every major key shares its notes with a relative minor, which starts a minor third below.']},
 {id:'capo',name:'Capo and Shapes',desc:'Which chord sounds when you play an open shape with a capo.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['capo'],
  primer:['A capo clamps across the neck and raises every string by one semitone per fret. The shape in your hand stays the same, but the chord you hear moves up.','It is the quickest way to play the same open shapes in a key that suits a singer.']},
 {id:'invert',name:'Triad Inversions',desc:'Root position, first and second inversion, and slash chords.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['inversion'],
  primer:['A triad has three notes. In root position the root is lowest. Move the root up an octave and the 3rd is lowest: first inversion. Move the 3rd up too and the 5th is lowest: second inversion.','A slash chord such as C/E names the chord, then the bass note.']},
 {id:'playarp',name:'Arpeggio Runner',desc:'Play the notes of a chord one by one, up and then down.',needs:4,kind:'arp',type:'play',tier:'Intermediate',rounds:3,
  primer:['An arpeggio is a chord played one note at a time. The app names the chord, then listens for the root, third, fifth (and seventh) in order, and back down.','Any octave counts, so pick a spot on the neck where it feels comfortable.']},
 {id:'chscale',name:'Chord-Scale Matching',desc:'Which mode to play over maj7, m7, 7 and m7♭5, and over a ii–V–I.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['chordScale'],
  primer:['A mode is a scale with a specific colour. Maj7 chords pair with Ionian or Lydian, m7 with Dorian, dominant 7 with Mixolydian and m7♭5 with Locrian.','In a ii–V–I, all three chords can use the notes of the same major scale, started from different roots.']}
].forEach(function(m){PRACTICE.push(m)});
