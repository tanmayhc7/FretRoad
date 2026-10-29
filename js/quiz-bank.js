/* Quiz question generators for the stops */
/* ---------- quizzes ---------- */
var Q={mode:'stop',level:null,mod:null,lv:1,queue:[],i:0,first:0,total:0,marks:[],answered:false,active:false,resume:false,streak:0};
if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.Q=Q;
var boardQ=null;
function noteChoices(correct,suffix){
  var set=[correct];
  shuffle([1,11,2,10,7,5]).slice(0,3).forEach(function(d){set.push((correct+d)%12)});
  return shuffle(set).map(function(p){return {label:NAMES[p]+(suffix||''),ok:p===correct}});
}
function numChoices(correct,prefix,cands,min,max){
  var set=[correct];
  shuffle(cands).forEach(function(c){ if(set.length<4&&set.indexOf(c)<0&&c>=min&&(max===undefined||c<=max)) set.push(c); });
  return shuffle(set).map(function(n){return {label:(prefix||'')+n,ok:n===correct}});
}
function fretWords(fr){return fr.map(function(f){return f===0?'the open string':'fret '+f}).join(' and ')}
function chordRoot(pcs){for(var r=0;r<12;r++){ if(pcs.indexOf(r)>-1&&pcs.indexOf((r+4)%12)>-1&&pcs.indexOf((r+7)%12)>-1) return r;} return -1;}
var IV={
 12:{name:'An octave',exp:'An octave is 12 semitones. The two notes share a name, one register apart.'},
 7:{name:'A fifth',exp:'A fifth is 7 semitones, the open, strong sound of a power chord.'},
 4:{name:'A major third',exp:'A major third is 4 semitones, the bright note in a major chord.'},
 3:{name:'A minor third',exp:'A minor third is 3 semitones, the darker note in a minor chord.'},
 1:{name:'One semitone',exp:'One semitone is a single fret, the closest two notes can be.'}
};
var QB={
 noteAt:function(){
  var s=rnd(6),f=1+rnd(12),p=pcOf(s,f);
  return {lesson:[1,0],prompt:'Which note is on fret '+f+' of the '+SNAME[s]+' string?',
   board:[{s:s,f:f,kind:'ghost',label:'?',reveal:{kind:'found',label:NAMES[p]}}],
   choices:noteChoices(p),
   explain:'Fret '+f+' is '+f+' semitones above the open '+NAMES[pcOf(s,0)]+', which makes it '+NAMES[p]+'.'};
 },
 findNote:function(lv){
  var s=lv===3?1+rnd(3):rnd(6),p=rnd(12),fr=[];
  for(var f=0;f<=FRETS;f++) if(pcOf(s,f)===p) fr.push(f);
  return {lesson:[lv||1,0],kind:'click',prompt:'Click a '+NAMES[p]+' on the '+SNAME[s]+' string.',click:{s:s,pc:p},
   after:fr.map(function(f){return {s:s,f:f,kind:'found',label:NAMES[p]}}),
   explain:NAMES[p]+' is at '+fretWords(fr)+' on the '+SNAME[s]+' string.'};
 },
 sharedFret:function(){
  var s=1+rnd(5),hi=s-1,fret=(s===2)?4:5;
  return {lesson:[1,2],prompt:'Which fret on the '+SNAME[s]+' string plays the same note as the open '+SNAME[hi]+' string?',
   board:[{s:hi,f:0,kind:'root',label:NAMES[pcOf(hi,0)]}],
   after:[{s:s,f:fret,kind:'found',label:NAMES[pcOf(hi,0)]}],
   choices:numChoices(fret,'Fret ',[3,4,5,6,7],1),
   explain:'Fret '+fret+' on the '+SNAME[s]+' string is '+NAMES[pcOf(hi,0)]+', the same note as the open '+SNAME[hi]+' string.'+(s===2?' The G and B strings are only four semitones apart, so this pair is one fret closer than the rest.':'')};
 },
 semisOct:function(){
  var s=3+rnd(3),p=pcOf(s,0);
  return {lesson:[1,1],prompt:'How many frets up the '+SNAME[s]+' string is the next '+NAMES[p]+'?',
   board:[{s:s,f:0,kind:'root',label:NAMES[p]}],after:[{s:s,f:12,kind:'found',label:NAMES[p]}],
   choices:numChoices(12,'',[6,7,10,11,13,14,24],1),
   explain:'Twelve semitones carry you all the way around the twelve notes, so fret 12 is '+NAMES[p]+' again, one octave up.'};
 },
 earSame:function(){
  var s=1+rnd(5),fr=(s===2)?4:5,same=Math.random()<.5,m1=OPEN[s]+fr,m2=OPEN[s-1]+(same?0:1);
  return {lesson:[1,2],prompt:'Listen to two notes, one after the other. Are they the same note?',
   audio:[{label:'Hear the two notes',notes:[m1,m2],mode:'seq'}],
   choices:shuffle([{label:'Same note',ok:same},{label:'Different notes',ok:!same}]),
   explain:same?('Both are '+NAMES[pcOf(s-1,0)]+'. Fret '+fr+' on the '+SNAME[s]+' string is the open '+SNAME[s-1]+' string.'):'The second note was one fret higher than the first. Close, but a different note.'};
 },
 fifthOf:function(){
  var s=3+rnd(3),f=rnd(11),r=pcOf(s,f),a=(r+7)%12;
  return {lesson:[2,1],prompt:'What is the fifth above '+NAMES[r]+'?',
   board:[{s:s,f:f,kind:'root',label:NAMES[r]}],after:[{s:s-1,f:f+2,kind:'found',label:NAMES[a]}],
   choices:noteChoices(a),
   explain:'Count seven semitones up from '+NAMES[r]+' and you reach '+NAMES[a]+'. On the neck that is one string up and two frets over.'};
 },
 fifthFret:function(){
  var s=3+rnd(3),r=rnd(6),t=r+7;
  return {lesson:[2,0],prompt:'You are on fret '+r+' of the '+SNAME[s]+' string. Which fret on the same string is the fifth above?',
   board:[{s:s,f:r,kind:'root',label:NAMES[pcOf(s,r)]}],after:[{s:s,f:t,kind:'found',label:NAMES[pcOf(s,t)]}],
   choices:numChoices(t,'Fret ',[r+2,r+4,r+5,r+6,r+8,r+9],1,12),
   explain:'Seven semitones is seven frets on one string, so the fifth is on fret '+t+' ('+NAMES[pcOf(s,t)]+').'};
 },
 semisFifth:function(){
  return {lesson:[2,0],prompt:'How many semitones above a note is its fifth?',
   choices:numChoices(7,'',[3,4,5,6,8,9,12],1),
   explain:'A fifth is seven semitones, which is seven frets along one string.'};
 },
 earInterval:function(lv){
  var opts=lv>=4?[12,7,4,3]:(lv>=3?[12,7,4,1]:[12,7,1]),n=pick(opts),m=45+rnd(13);
  return {lesson:[lv,lv>=4?1:(lv>=3?0:1)],prompt:'Listen to the two notes. What is the distance between them?',
   audio:[{label:'Hear the two notes',notes:[m,m+n],mode:'seq'},{label:'Hear them together',notes:[m,m+n],mode:'tog'}],
   choices:shuffle(opts.map(function(k){return {label:IV[k].name,ok:k===n}})),
   explain:IV[n].exp};
 },
 chordTones:function(){
  var r=rnd(12),nm2=function(a,b){return NAMES[r]+', '+NAMES[(r+a)%12]+', '+NAMES[(r+b)%12]};
  return {lesson:[3,0],prompt:'Which three notes make '+NAMES[r]+' major?',
   choices:shuffle([[4,7,true],[3,7],[4,6],[5,7],[4,8]].slice(0,4).map(function(c){return {label:nm2(c[0],c[1]),ok:!!c[2]}})),
   explain:NAMES[r]+' major is the root, then 4 semitones up, then 7 semitones up: '+nm2(4,7)+'.'};
 },
 thirdOf:function(){
  var r=rnd(12),t=(r+4)%12;
  return {lesson:[3,0],prompt:'What is the major third above '+NAMES[r]+'?',
   choices:noteChoices(t),
   explain:'Count four semitones up from '+NAMES[r]+' to reach '+NAMES[t]+'. That note makes the chord sound major.'};
 },
 shapeName:function(){
  var f=rnd(13),pcs=[pcOf(3,f),pcOf(2,f),pcOf(1,f)],r=chordRoot(pcs),where=f?'fret '+f:'the open strings';
  return {lesson:[3,0],prompt:'These notes sit in a straight line on '+where+' of the D, G and B strings. Which major chord do they spell?',
   board:[3,2,1].map(function(s){return {s:s,f:f,kind:'tone',label:'',reveal:{kind:'tone',label:NAMES[pcOf(s,f)]}}}),
   choices:noteChoices(r,' major'),
   explain:'On '+where+' the D, G and B strings give '+NAMES[pcs[0]]+', '+NAMES[pcs[1]]+' and '+NAMES[pcs[2]]+'. That is '+NAMES[r]+' major.'};
 },
 minorTones:function(){
  var r=rnd(12),nm2=function(a,b){return NAMES[r]+', '+NAMES[(r+a)%12]+', '+NAMES[(r+b)%12]};
  return {lesson:[4,0],prompt:'Which three notes make '+NAMES[r]+' minor?',
   choices:shuffle([[3,7,true],[4,7],[3,6],[5,7]].map(function(c){return {label:nm2(c[0],c[1]),ok:!!c[2]}})),
   explain:NAMES[r]+' minor is the root, then 3 semitones up, then 7 semitones up: '+nm2(3,7)+'.'};
 },
 thirdMinor:function(){
  var r=rnd(12),t=(r+3)%12;
  return {lesson:[4,0],prompt:'What is the minor third above '+NAMES[r]+'?',
   choices:noteChoices(t),
   explain:'Count three semitones up from '+NAMES[r]+' to reach '+NAMES[t]+'. One fret lower than the major third, and that is the dark note.'};
 },
 earQuality:function(){
  var minor=Math.random()<.5,m=45+rnd(8),n=[m,m+(minor?3:4),m+7];
  return {lesson:[4,1],prompt:'Listen to the chord. Does it sound major or minor?',
   audio:[{label:'Hear it one note at a time',notes:n,mode:'seq'},{label:'Hear it together',notes:n,mode:'tog'}],
   choices:shuffle([{label:'Major',ok:!minor},{label:'Minor',ok:minor}]),
   explain:minor?'That was minor: the middle note sat three semitones above the root.':'That was major: the middle note sat four semitones above the root.'};
 },
 shapeNameMinor:function(){
  var f=1+rnd(11),r=pcOf(2,f),cells=[[3,f],[2,f],[1,f-1]];
  return {lesson:[4,2],prompt:'This shape sits on the D string at fret '+f+', the G string at fret '+f+' and the B string at fret '+(f-1)+'. Which minor chord is it?',
   board:cells.map(function(c){return {s:c[0],f:c[1],kind:'tone',label:'',reveal:{kind:'tone',label:NAMES[pcOf(c[0],c[1])]}}}),
   choices:noteChoices(r,' minor'),
   explain:'The notes are '+cells.map(function(c){return NAMES[pcOf(c[0],c[1])]}).join(', ')+'. With '+NAMES[r]+' as the root, the middle note is 3 semitones up, so it is '+NAMES[r]+' minor.'};
 },
 octaveFret:function(){
  var s=2+rnd(4),f=rnd(9),gap=s<=3,t=f+(gap?3:2);
  return {lesson:[5,gap?1:0],prompt:'You play fret '+f+' of the '+SNAME[s]+' string. Which fret two strings higher plays the same note an octave up?',
   board:[{s:s,f:f,kind:'root',label:NAMES[pcOf(s,f)]}],after:[{s:s-2,f:t,kind:'found',label:NAMES[pcOf(s,f)]}],
   choices:numChoices(t,'Fret ',[t-1,t+1,t-2,t+2,t+5,t-3],0,12),
   explain:gap?'The shape crosses the G and B strings, so it needs three frets over: fret '+t+'.':'Two strings up and two frets over: fret '+t+'.'};
 },
 octaveFind:function(){
  var r=rnd(6),p=pcOf(5,r);
  return {lesson:[5,0],kind:'click',prompt:'Your finger is on fret '+r+' of the low E string. Click the same note, one octave higher, on the D string.',
   board:[{s:5,f:r,kind:'root',label:NAMES[p]}],click:{s:3,pc:p},
   after:[{s:3,f:r+2,kind:'found',label:NAMES[p]}],
   explain:'Two strings up, two frets over: '+NAMES[p]+' on fret '+(r+2)+' of the D string.'};
 },
 octaveGap:function(){
  var bad=['The B string is thicker than the G string.','Fret 12 is always special on the neck.','The octave gets smaller on thinner strings.'];
  return {lesson:[5,1],prompt:'An octave shape needs three frets over, not two, when it crosses from the G string to the B string. Why?',
   choices:shuffle([{label:'The G and B strings are tuned four semitones apart, not five.',ok:true}].concat(bad.map(function(t){return {label:t,ok:false}}))),
   explain:'Every neighbouring pair of strings is tuned five semitones apart except G and B, which are four apart. The shape needs one more fret to make up the difference.'};
 },
 earOctave:function(){
  var m=45+rnd(13),isOct=Math.random()<.5,n=isOct?12:pick([5,7,9]);
  return {lesson:[5,0],prompt:'Listen to the two notes. Is the second one the same note, an octave higher?',
   audio:[{label:'Hear the two notes',notes:[m,m+n],mode:'seq'},{label:'Hear them together',notes:[m,m+n],mode:'tog'}],
   choices:shuffle([{label:'Yes, an octave up',ok:isOct},{label:'No, a different note',ok:!isOct}]),
   explain:isOct?'It was an octave: 12 semitones, the same note one register higher.':'It was '+n+' semitones up, a different note. An octave is 12.'};
 }
};
LEVELS[0].quiz=['noteAt','findNote','sharedFret','semisOct','earSame'];
LEVELS[1].quiz=['fifthOf','fifthFret','earInterval','semisFifth','noteAt'];
LEVELS[2].quiz=['chordTones','thirdOf','shapeName','earInterval','findNote'];
LEVELS[3].quiz=['minorTones','thirdMinor','earQuality','shapeNameMinor','earInterval'];
LEVELS[4].quiz=['octaveFret','octaveFind','octaveGap','earOctave','semisOct'];
var PRACTICE=[
 {id:'hunt',name:'Note Hunt',desc:'Click the note you are asked for.',needs:1,lv:1,rounds:10,pool:['findNote']},
 {id:'names',name:'Name That Fret',desc:'Name the note under the marker.',needs:1,lv:1,rounds:10,pool:['noteAt']},
 {id:'fifths',name:'Fifth Finder',desc:'Find fifths on one string and across strings.',needs:2,lv:2,rounds:10,pool:['fifthOf','fifthFret']},
 {id:'chords',name:'Chord Builder',desc:'Spell major chords and name their shapes.',needs:3,lv:3,rounds:10,pool:['chordTones','thirdOf','shapeName']},
 {id:'ear',name:'Ear Gym',desc:'Name intervals by ear.',needs:3,lv:3,rounds:10,pool:['earInterval']},
 {id:'minor',name:'Major or Minor',desc:'Spell, shape and hear minor chords.',needs:4,lv:4,rounds:10,pool:['minorTones','thirdMinor','shapeNameMinor','earQuality']},
 {id:'octaves',name:'Octave Jumps',desc:'Find octaves across the neck, on screen and by ear.',needs:5,lv:5,rounds:10,pool:['octaveFret','octaveFind','earOctave']}
];

