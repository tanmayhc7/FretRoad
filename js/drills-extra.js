/* Practice drills, third batch: triads on string sets, pentatonic boxes, CAGED, polyrhythms, melody by ear,
   a timed fretboard sprint and a finger-exercise (spider) walk. Loaded after drills-more.js. */

/* ---- triads on string sets ---- */
var TSETS=[{n:'D, G and B',s:[3,2,1]},{n:'G, B and high E',s:[2,1,0]},{n:'A, D and G',s:[4,3,2]},{n:'low E, A and D',s:[5,4,3]}];
var INVN=['root position','first inversion','second inversion'];
/* the closest fret shape (low string first) that spells the triad in this inversion on three adjacent strings */
function triadFrets(strs,r,t,inv){
  var p=cpcs(r,t), seq=[p[inv],p[(inv+1)%3],p[(inv+2)%3]], best=null;
  for(var a=0;a<=14;a++){ if(pcOf(strs[0],a)!==seq[0]) continue;
    for(var b=0;b<=14;b++){ if(pcOf(strs[1],b)!==seq[1]||Math.abs(b-a)>4) continue;
      for(var c=0;c<=14;c++){ if(pcOf(strs[2],c)!==seq[2]||Math.abs(c-b)>4) continue;
        var lo=Math.min(a,b,c),hi=Math.max(a,b,c),sc=(hi-lo)*100+hi;
        if(hi-lo<=4&&(!best||sc<best.sc)) best={f:[a,b,c],sc:sc}; } } }
  return best?best.f:null;
}
function fretStr(f){return f.join('-')}
QX.triadSet=function(){
  var set=pick(TSETS),t=pick(['major','minor']),r,inv=rnd(3),fr=null,tries=0;
  do{ r=rnd(12); fr=triadFrets(set.s,r,t,inv); tries++; }while(!fr&&tries<30);
  var correct=fretStr(fr),others=[];
  [0,1,2].forEach(function(i){ if(i!==inv){ var o=triadFrets(set.s,r,t,i); if(o&&fretStr(o)!==correct) others.push(fretStr(o)); } });
  var alt=triadFrets(set.s,r,t==='major'?'minor':'major',inv); if(alt&&fretStr(alt)!==correct) others.push(fretStr(alt));
  var cells=fr.map(function(f,i){return {s:set.s[i],f:f}});
  return {prompt:'Play '+csym(r,t)+' in '+INVN[inv]+' on the '+set.n+' strings. Which frets, lowest string first?',
    choices:mkChoices(correct,others.concat(['0-0-0','2-2-2','5-5-5']).filter(function(x){return x!==correct})),
    audio:[{label:'Hear it',notes:cells.map(function(c){return OPEN[c.s]+c.f}),mode:'chord'}],
    after:cells.map(function(c,i){return {s:c.s,f:c.f,kind:i===0?'root':'found',label:NAMES[pcOf(c.s,c.f)]}}),
    explain:csym(r,t)+' is '+noteList(cpcs(r,t))+'. In '+INVN[inv]+' the lowest note is '+NAMES[cpcs(r,t)[inv]]+', and the closest grip on these strings is frets '+correct+'. Small triads like this are the lead guitarist\'s chords.'};
};

/* ---- pentatonic boxes ---- */
var PBOX=[0,3,5,7,10];
function boxStart(r,n){ var rf=(r-4+12)%12; var f=(rf+PBOX[n])%12; return f===0?12:f; }
QX.pentBox=function(){
  var q=rnd(3),r; do{r=rnd(12)}while(r===4);
  if(q===0){
    var n=rnd(5),f=boxStart(r,n),others=[0,1,2,3,4].filter(function(i){return i!==n}).map(function(i){return 'fret '+boxStart(r,i)});
    return {prompt:'Box '+(n+1)+' of '+NAMES[r]+' minor pentatonic: which fret does your first finger take on the low E string?',
      choices:mkChoices('fret '+f,others),
      explain:'Box 1 starts on the root, which is '+NAMES[r]+' at fret '+boxStart(r,0)+' of the low E string. Each next box starts one scale note higher: '+[0,1,2,3,4].map(function(i){return 'box '+(i+1)+' at fret '+boxStart(r,i)}).join(', ')+'.'};
  }
  if(q===1){
    var m=rnd(5),fr=boxStart(r,m),o2=[1,2,3,4,5].filter(function(i){return i!==m+1}).map(function(i){return 'Box '+i});
    return {prompt:'You are playing '+NAMES[r]+' minor pentatonic with your first finger on fret '+fr+' of the low E string. Which box is that?',
      choices:mkChoices('Box '+(m+1),o2),
      explain:'The root, '+NAMES[r]+', is at fret '+boxStart(r,0)+'. Fret '+fr+' is the '+['root','♭3','4','5','♭7'][m]+' of the scale, which starts box '+(m+1)+'.'};
  }
  var maj=pick([0,2,4,5,7,9]),rel=(maj+9)%12;
  return {prompt:NAMES[maj]+' major pentatonic uses exactly the same notes and boxes as which minor pentatonic?',
    choices:mkChoices(NAMES[rel]+' minor pentatonic',[(rel+2)%12,(rel+5)%12,(rel+7)%12,(rel+10)%12].map(function(p){return NAMES[p]+' minor pentatonic'})),
    explain:'The relative minor sits three semitones below the major root: '+NAMES[maj]+' major and '+NAMES[rel]+' minor share their five notes, so you can reuse the same boxes and just aim at a different root.'};
};

/* ---- CAGED ---- */
var CAGED=['C','A','G','E','D'], CBASE={C:0,A:9,G:7,E:4,D:2};
function cfret(r,sh){ return (r-CBASE[sh]+12)%12; }
function cfretWords(f){return f===0?'open position':'fret '+f}
QX.caged=function(){
  var q=rnd(3),r=rnd(12),sh=pick(CAGED);
  if(q===0){
    var others=CAGED.filter(function(x){return x!==sh}).map(function(x){return cfretWords(cfret(r,x))}),ans=cfretWords(cfret(r,sh));
    return {prompt:'You are playing '+NAMES[r]+' major with the CAGED system. Where does the '+sh+' shape sit?',choices:mkChoices(ans,others),
      explain:'Take the open '+sh+' chord, whose root note is '+NAMES[CBASE[sh]]+', and slide it until the root becomes '+NAMES[r]+'. That is '+cfretWords(cfret(r,sh))+'. For '+NAMES[r]+' the five shapes sit at '+CAGED.map(function(x){return x+': '+cfretWords(cfret(r,x))}).join(', ')+'.'};
  }
  if(q===1){
    var nx=CAGED[(CAGED.indexOf(sh)+1)%5];
    return {prompt:'Going up the neck, the CAGED shapes follow a fixed order. Which shape comes right after the '+sh+' shape?',choices:mkChoices(nx+' shape',CAGED.filter(function(x){return x!==nx}).map(function(x){return x+' shape'})),
      explain:'The order is C, A, G, E, D, then back to C one octave up. After the '+sh+' shape comes the '+nx+' shape, no matter which chord you are playing.'};
  }
  var f=1+rnd(10),root=(CBASE[sh]+f)%12,ans2=NAMES[root];
  return {prompt:'You play the open '+sh+' chord shape as a barre chord at fret '+f+'. Which major chord sounds?',
    choices:mkChoices(ans2,[(root+2)%12,(root+10)%12,(root+7)%12,(root+5)%12].map(function(p){return NAMES[p]})),
    explain:'The '+sh+' shape has its root on '+NAMES[CBASE[sh]]+'. Moving it up '+f+' frets raises the root '+f+' semitones, to '+ans2+'.'};
};

/* ---- polyrhythms ---- */
QX.polyrhythm=function(){
  var R=pick([[3,2],[4,3],[5,4],[3,4],[5,3]]),a=R[0],b=R[1],g=function(x,y){return y?g(y,x%y):x},lcm=a*b/g(a,b),k=rnd(3);
  if(k===0) return {prompt:'You play '+a+' even notes with one hand while the other plays '+b+' even notes in the same time. Into how many equal ticks must the bar be divided so both fit?',
    choices:numChoices(lcm,'',[a+b,a*b,lcm*2,a,b,lcm+1],2,40),explain:'Both patterns must land on the same grid. The smallest grid that holds '+a+' and '+b+' is '+lcm+' ticks (their lowest common multiple).'};
  if(k===1) return {prompt:'In a '+a+' against '+b+' polyrhythm, how many times in one cycle do both parts sound at the same instant?',
    choices:numChoices(1,'',[0,2,a,b,lcm],0,6),explain:'They only meet on the first tick of the cycle, then drift apart until the cycle repeats. That one meeting point is what holds the groove together.'};
  var nm=pick([['3 against 2','hemiola'],['4 against 3','four over three'],['3 against 4','three over four']]);
  if(nm[0]==='3 against 2') return {prompt:'Three even notes played across the time of two is a classic feel. What is it often called?',
    choices:mkChoices('a hemiola',['a syncopation','a triplet fill','a pedal tone','a ritardando']),explain:'Three against two is called a hemiola. It is the lilt in a waltz that suddenly feels like 6/8, and in many Latin and folk songs.'};
  return {prompt:'Which of these polyrhythms puts the most notes in the busier hand over one cycle?',choices:mkChoices('5 against 4',['3 against 2','4 against 3','2 against 3']),
    explain:'In 5 against 4 the busier hand plays five notes per cycle. The others top out at four or fewer.'};
};

/* ---- melody by ear ---- */
QX.melodyEar=function(){
  var r=rnd(12),base=48+r,len=4,deg=[0],i;
  for(i=1;i<len;i++){ var d; do{ d=Math.max(0,Math.min(5,deg[i-1]+pick([-2,-1,-1,1,1,2]))) }while(d===deg[i-1]); deg.push(d); }
  var mid=deg.map(function(d){return base+MAJ_DEG[d]}),correct=deg.map(function(d){return d+1}).join('-'),opts=[];
  for(var t=0;t<14&&opts.length<5;t++){ var c=deg.slice(), j=1+rnd(len-1); c[j]=Math.max(0,Math.min(5,c[j]+pick([-2,-1,1,2]))); var s=c.map(function(d){return d+1}).join('-'); if(s!==correct&&opts.indexOf(s)<0) opts.push(s); }
  return {prompt:'Listen to the home note (1), then the four-note melody. Which scale degrees did you hear?',
    audio:[{label:'Hear the home note',notes:[base],mode:'run'},{label:'Play the melody',notes:mid,mode:'run'}],
    choices:mkChoices(correct,opts),
    explain:'The melody was degrees '+correct+' of the major scale. Hum the home note first, then ask how far up or down each step is from it. Steps next to each other sound close, jumps sound wide.'};
};

/* ---- find a heard melody on the neck ---- */
QX.melodyNeck=function(len,hint){
  var r=rnd(12),base=48+r,deg=[pick([0,2,4])],i;
  for(i=1;i<len;i++){ var dd; do{ dd=Math.max(0,Math.min(6,deg[i-1]+pick([-2,-1,-1,1,1,2]))) }while(dd===deg[i-1]); deg.push(dd); }
  var mid=deg.map(function(x){return base+MAJ_DEG[x]}),seq=mid.map(function(m){return m%12}),names=seq.map(function(p){return NAMES[p]});
  return {kind:'clicks',seq:seq,prompt:'Listen to the melody, then click its '+len+' notes on the neck, in order. It is in '+NAMES[r]+' major'+(hint?' and starts on '+names[0]+'.':'.'),
    audio:[{label:'Play the melody',notes:mid,mode:'run'},{label:'Play the key note',notes:[base],mode:'run'}],
    explain:'The melody was '+names.join(' – ')+'. Any octave counts. Searching by ear works: click a note, compare it with the tune, and move up or down until it matches.'};
};
QB.melodyNeck=function(){return QX.melodyNeck(3,true)};
QB.transcribe=function(){return QX.melodyNeck(5,false)};
QB.triadSet=function(){return QX.triadSet()};
QB.pentBox=function(){return QX.pentBox()};
QB.caged=function(){return QX.caged()};
QB.polyrhythm=function(){return QX.polyrhythm()};
QB.melodyEar=function(){return QX.melodyEar()};

/* ---- finger gym: the spider walk, played on the neck ---- */
var SPIDER_PAT=[{n:'1-2-3-4 climb',o:[0,1,2,3]},{n:'1-3-2-4 spider',o:[0,2,1,3]},{n:'1-4-2-3 stretch',o:[0,3,1,2]}];
function spiderItems(rounds){
  var items=[],last='';
  for(var r=0;r<rounds;r++){
    var pat,p,trio,key; do{ pat=pick(SPIDER_PAT); p=1+rnd(8); trio=r%2?[2,1,0]:[5,4,3]; key=pat.n+p+trio[0]; }while(key===last); last=key;
    var cells=[]; trio.forEach(function(s){ pat.o.forEach(function(o){ cells.push({s:s,f:p+o}); }); });
    items.push({type:'seq',title:'Finger gym: '+pat.n+', frets '+p+' to '+(p+3)+', '+(trio[0]===5?'low E, A and D':'G, B and high E'),
      cells:cells,notes:cells.map(function(c){return pcOf(c.s,c.f)}),labels:cells.map(function(c){return NAMES[pcOf(c.s,c.f)]}),midi:cells.map(function(c){return OPEN[c.s]+c.f}),pos:cells});
  }
  return items;
}

[
 {id:'playstrum',name:'Strum Check',desc:'Strum a whole chord at once and the app names what it hears.',needs:3,kind:'strum',type:'play',tier:'Intermediate',rounds:6,pool:['E','Em','A','Am','D','Dm','G','C'],
  primer:['Build the Chord checks one string at a time. This one listens to a normal strum, the way you would play it in a song.','Strum all the strings together, let the chord ring, and stay still for a moment. The app compares the combined sound with the chord it asked for.','Turn the mic on in a quiet room and sit about an arm\'s length from it. If it hears a different chord, check that no finger is touching a neighbouring string.']},
 {id:'melodyneck',name:'Melody on the Neck',desc:'Hear a three-note tune and find it on the fretboard.',needs:4,lv:4,rounds:8,tier:'Intermediate',pool:['melodyNeck'],
  primer:['You hear a short melody in a named key, and the first note is given. Click the notes on the neck, in order. Every click plays the note, so you can search by ear: click, compare with the tune, then move up or down.','Any octave counts. Wrong clicks are allowed, they just mean the question counts as missed.']},
 {id:'transcribe',name:'Transcribe by Ear',desc:'A five-note phrase, only the key is given. Find every note.',needs:5,lv:5,rounds:6,tier:'Advanced',pool:['transcribe'],
  primer:['The same idea with more notes and no hint about the start. Hum the key note first, then work out each step: is the next note higher or lower, near or far?','This is how songs are learned from a recording: one note at a time, checking against the neck.']},
 {id:'sprint',name:'Fretboard Sprint',desc:'Fifteen notes against the clock, with a streak counter.',needs:1,lv:1,rounds:15,tier:'Beginner',pool:['findNote'],timed:true,
  primer:['A quick-fire round of note finding. The clock starts when you begin and stops when you answer the last question.','Speed matters less than getting each note right first time. Your score and your fastest clean run are both saved on this device.']},
 {id:'spiderwalk',name:'Finger Gym',desc:'Spider and chromatic walks to build finger independence.',needs:2,kind:'spider',type:'play',tier:'Beginner',rounds:4,
  primer:['Place one finger per fret, one finger per note: index on the first fret of the pattern, pinky on the fourth. Keep the fingers close to the strings.','Start slowly with the metronome on, one note per click, and only raise the tempo when two rounds in a row are clean. Even and quiet beats fast and sloppy.']},
 {id:'melodyear',name:'Melody by Ear',desc:'Hear a four-note tune, then name its scale degrees.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['melodyEar'],
  primer:['Every melody note has a distance from the home note. Hearing "how far up is that?" is the base of playing by ear.','Play the home note first, then the melody. Say the numbers to yourself as you listen; the neck can come later.']},
 {id:'triadsets',name:'Triads on String Sets',desc:'Find major and minor triads, in every inversion, on three adjacent strings.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['triadSet'],
  primer:['Instead of six-string chords, play only three neighbouring strings. Each triad has three shapes up the neck: root position, first and second inversion, depending on which chord tone is lowest.','Frets are listed lowest string first. Hear the grip with the button, then find it on the neck.']},
 {id:'pentboxes',name:'Pentatonic Boxes',desc:'Where each of the five boxes starts, for any key.',needs:7,lv:7,rounds:10,tier:'Intermediate',pool:['pentBox'],
  primer:['The pentatonic scale has five boxes that cover the neck and link end to end. Box 1 starts at the root on the low E string, and each next box starts one scale note higher.','For minor pentatonic the starts are the root, ♭3, 4, 5 and ♭7. Major pentatonic uses the same boxes as its relative minor.']},
 {id:'caged',name:'The CAGED System',desc:'Five open shapes, movable up the neck to play any chord anywhere.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['caged'],
  primer:['The five open chords C, A, G, E and D can each be slid up the neck as a barre chord. Together they cover every position of any major chord, in that cycling order.','To place a shape for a chord, move the shape until its root note matches the chord you want.']},
 {id:'poly',name:'Polyrhythms',desc:'Three against two, four against three and how they line up.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['polyrhythm'],
  primer:['A polyrhythm plays two evenly spaced patterns in the same time, such as three notes against two. Think of the lowest common grid that both fit on.','Try it with the metronome: tap two with one hand, three with the other, and feel the point where they meet.']}
].forEach(function(m){PRACTICE.push(m)});
