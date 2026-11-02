/* Quiz generators for the First Steps chapter (stops 20 to 25). Each key is used in a level's quiz:[...] list.
   The lesson:[stop, step] pair on every question powers the "Review this in the lesson" button. */
(function(){
var FINGERS=['Index finger','Middle finger','Ring finger','Little finger'];
var LETTERS=['A','B','C','D','E','F','G'];
var SHARPS=['C♯','D♯','F♯','G♯','A♯'], FLATS=['D♭','E♭','G♭','A♭','B♭'];
function others(list,not){return list.filter(function(x){return x!==not})}

/* ---- stop 20: the six strings ---- */
QB.bStrName=function(){
  var s=rnd(6),n=s+1,c=NAMES[pcOf(s,0)];
  return {lesson:[20,3],prompt:'What is the name of string '+n+', counting from the thinnest?',
    board:[{s:s,f:0,kind:'ghost',label:'?',reveal:{kind:'found',label:c}}],
    choices:mkChoices(c,others(['E','A','D','G','B'],c)),
    explain:'String '+n+' is the '+SNAME[s]+' string, tuned to '+c+'. The strings are numbered 1 to 6 from the thinnest.'};
};
QB.bStrNum=function(){
  var s=rnd(6),n=s+1;
  return {lesson:[20,3],prompt:'Strings are numbered from the thinnest. Which number is the '+SNAME[s]+' string?',
    board:[{s:s,f:0,kind:'root',label:NAMES[pcOf(s,0)]}],
    choices:numChoices(n,'String ',[1,2,3,4,5,6],1,6),
    explain:'The '+SNAME[s]+' string is string '+n+'. String 1 is the thin high E and string 6 is the thick low E.'};
};
QB.bOpenClick=function(){
  var s=rnd(6),p=pcOf(s,0);
  return {lesson:[20,2],kind:'click',prompt:'Click the open '+SNAME[s]+' string, at the left end of the neck.',click:{s:s,pc:p,f:0},
    after:[{s:s,f:0,kind:'found',label:NAMES[p]}],
    explain:'The open string is the spot at the left end of the neck. The '+SNAME[s]+' string is tuned to '+NAMES[p]+'.'};
};
QB.bThick=function(){
  var a=rnd(6),b=rnd(6); while(b===a) b=rnd(6);
  var lo=Math.max(a,b),hi=Math.min(a,b);
  return {lesson:[20,4],prompt:'Which sounds lower: the '+SNAME[a]+' string or the '+SNAME[b]+' string?',
    choices:shuffle([{label:'The '+SNAME[a]+' string',ok:a===lo},{label:'The '+SNAME[b]+' string',ok:b===lo}]),
    explain:'Thicker strings sound lower. The '+SNAME[lo]+' string is thicker than the '+SNAME[hi]+' string, so it sounds lower.'};
};
QB.bEarThick=function(){
  var a=rnd(6),b=rnd(6); while(b===a) b=rnd(6);
  var first=a>b; /* the thicker string is the larger row number */
  return {lesson:[20,4],prompt:'Listen to two open strings. Which one is the thicker string?',
    audio:[{label:'Hear the two strings',notes:[OPEN[a],OPEN[b]],mode:'seq'}],
    choices:shuffle([{label:'The first one',ok:first},{label:'The second one',ok:!first}]),
    explain:'The lower note comes from the thicker string. This time that was the '+(first?'first':'second')+' string, the '+SNAME[first?a:b]+'.'};
};

/* ---- stop 21: frets and fingers ---- */
QB.bFingerFret=function(){
  var n=1+rnd(4);
  return {lesson:[21,1],prompt:'You play one finger per fret, starting with finger 1 on fret 1. Which finger plays fret '+n+'?',
    choices:FINGERS.map(function(t,i){return {label:'Finger '+(i+1)+', the '+t.toLowerCase().replace(' finger',''),ok:i+1===n}}),
    explain:'With one finger per fret, finger '+n+' plays fret '+n+'. That is the '+FINGERS[n-1].toLowerCase()+'.'};
};
QB.bFingerName=function(){
  var n=1+rnd(4);
  return {lesson:[21,1],prompt:'Fretting fingers are numbered 1 to 4. Which finger is finger '+n+'?',
    choices:FINGERS.map(function(t,i){return {label:t,ok:i+1===n}}),
    explain:'Finger 1 is the index, 2 the middle, 3 the ring and 4 the little finger. The thumb has no number.'};
};
QB.bFretPlace=function(){
  return {lesson:[21,0],prompt:'Where should your fingertip sit to play a fret cleanly?',
    choices:shuffle([{label:'Just behind the fret wire, on the headstock side',ok:true},{label:'On top of the fret wire',ok:false},{label:'In the middle of the gap between two frets',ok:false},{label:'Just past the fret wire, on the body side',ok:false}]),
    explain:'Right behind the wire, on the side nearer the headstock, the string is held firmly with the least pressure. In the middle of the gap it buzzes, and on top of the wire it sounds dull.'};
};
QB.bNoteLow=function(){
  var s=pick([5,4]),f=1+rnd(4),p=pcOf(s,f);
  return {lesson:[21,1],prompt:'Which note is on fret '+f+' of the '+SNAME[s]+' string?',
    board:[{s:s,f:f,kind:'ghost',label:'?',reveal:{kind:'found',label:NAMES[p]}}],choices:noteChoices(p),
    explain:'Fret '+f+' is '+f+' semitones above the open '+NAMES[pcOf(s,0)]+', which makes it '+NAMES[p]+'.'};
};
QB.bEarDir=function(){
  var m=45+rnd(12),d=pick([-4,-3,-2,-1,1,2,3,4]),up=d>0;
  return {lesson:[21,0],prompt:'Listen to two notes. Is the second note higher or lower than the first?',
    audio:[{label:'Hear the two notes',notes:[m,m+d],mode:'seq'}],
    choices:shuffle([{label:'Higher',ok:up},{label:'Lower',ok:!up}]),
    explain:'The second note was '+(up?'higher':'lower')+'. Pressing a higher fret raises the pitch, and a lower fret lowers it.'};
};

/* ---- stop 22: the musical alphabet ---- */
QB.bNextLetter=function(){
  var i=rnd(7),after=Math.random()<.5,c=LETTERS[(i+(after?1:6))%7];
  return {lesson:[22,0],prompt:'In the musical alphabet, which letter comes '+(after?'after ':'before ')+LETTERS[i]+'?',
    choices:mkChoices(c,others(LETTERS,c)),
    explain:'The letters run A B C D E F G and then start again at A, so '+c+' comes '+(after?'after ':'before ')+LETTERS[i]+'.'};
};
QB.bNoSharp=function(){
  var correct=pick(['E and F','B and C']),pool=['C and D','D and E','F and G','G and A','A and B'];
  return {lesson:[22,2],prompt:'Which pair of neighbouring notes has no sharp between them?',
    choices:mkChoices(correct,pool),
    explain:'E and F, and B and C, sit one fret apart with nothing in between. Every other pair of neighbouring letters is two frets apart.'};
};
QB.bBetween=function(){
  var i=pick([0,1,2,3,4]),pairs=[['C','D'],['D','E'],['F','G'],['G','A'],['A','B']],pr=pairs[i];
  return {lesson:[22,1],prompt:'Which note sits between '+pr[0]+' and '+pr[1]+'?',
    choices:mkChoices(SHARPS[i],others(SHARPS,SHARPS[i])),
    explain:'There is one fret between '+pr[0]+' and '+pr[1]+'. Named from '+pr[0]+' it is '+SHARPS[i]+', and named from '+pr[1]+' it is '+FLATS[i]+'.'};
};
QB.bFlat=function(){
  var i=rnd(5);
  return {lesson:[22,1],prompt:'What is another name for '+SHARPS[i]+'?',
    choices:mkChoices(FLATS[i],others(FLATS,FLATS[i])),
    explain:SHARPS[i]+' and '+FLATS[i]+' are the same fret. One is named from the letter below it and the other from the letter above.'};
};
QB.bNatClick=function(){
  var s=pick([5,4,3]),p=pick([0,2,4,5,7,9,11]),fr=[];
  for(var f=0;f<=FRETS;f++) if(pcOf(s,f)===p) fr.push(f);
  return {lesson:[22,0],kind:'click',prompt:'Click the note '+NAMES[p]+' on the '+SNAME[s]+' string.',click:{s:s,pc:p},
    after:fr.map(function(f){return {s:s,f:f,kind:'found',label:NAMES[p]}}),
    explain:NAMES[p]+' is at '+fretWords(fr)+' on the '+SNAME[s]+' string.'};
};

/* ---- stop 23: tuning ---- */
var TUNE=[{thick:5,thin:4,f:5},{thick:4,thin:3,f:5},{thick:3,thin:2,f:5},{thick:2,thin:1,f:4},{thick:1,thin:0,f:5}];
QB.bTuneFret=function(){
  var t=pick(TUNE),odd=t.f===4,p=pcOf(t.thin,0);
  return {lesson:[23,odd?3:2],prompt:'You are tuning the '+SNAME[t.thin]+' string by ear. Which fret of the '+SNAME[t.thick]+' string matches it?',
    board:[{s:t.thin,f:0,kind:'root',label:NAMES[p]}],after:[{s:t.thick,f:t.f,kind:'found',label:NAMES[p]}],
    choices:numChoices(t.f,'Fret ',[3,4,5,6,7],1),
    explain:'Fret '+t.f+' of the '+SNAME[t.thick]+' string is '+NAMES[p]+', the same note as the open '+SNAME[t.thin]+' string.'+(odd?' The G and B strings are tuned one semitone closer than the rest, so it is fret 4.':'')};
};
QB.bTuneDir=function(){
  var flat=Math.random()<.5;
  return {lesson:[23,0],prompt:'Your string sounds '+(flat?'flat, lower':'sharp, higher')+' than the note you want. What do you do?',
    choices:shuffle([{label:'Tighten the string, to raise the note',ok:flat},{label:'Loosen the string, to lower the note',ok:!flat},{label:'Press harder on the fret',ok:false},{label:'Leave it, it will settle',ok:false}]),
    explain:flat?'A tighter string vibrates faster and sounds higher, so a flat string needs tightening.':'A looser string vibrates more slowly and sounds lower, so a sharp string needs loosening.'};
};
QB.bTuneOdd=function(){
  return {lesson:[23,3],prompt:'Which pair of neighbouring strings needs fret 4, not fret 5, when you tune by ear?',
    choices:mkChoices('G and B',['low E and A','A and D','D and G','B and high E']),
    explain:'The G and B strings are tuned four semitones apart, while every other neighbouring pair is five. So you press fret 4 of the G string to match the open B.'};
};
QB.bSharedFret=function(){var q=QB.sharedFret(); q.lesson=[23,2]; return q;};
QB.bEarSame=function(){var q=QB.earSame(); q.lesson=[23,2]; return q;};

/* ---- stop 24: reading chord boxes, tab and the first chord ---- */
QB.bBoxMark=function(){
  var x=Math.random()<.5,sym=x?'×':'hollow ring',c=x?'Do not play that string':'Play that string open, without pressing a fret';
  var pool=['Press that string at the first fret','Use the little finger there','Play that string twice','Tune that string first'];
  if(x) pool.push('Play that string open, without pressing a fret'); else pool.push('Do not play that string');
  return {lesson:[24,1],prompt:'In a chord box, what does a '+(x?'×':'hollow ring')+' above a string mean?',
    choices:mkChoices(c,pool),
    explain:x?'A × marks a string you leave out of the chord.':'A hollow ring marks a string you play open, with no finger on it.'};
};
QB.bBoxDot=function(){
  var n=1+rnd(4);
  return {lesson:[24,1],prompt:'In a chord box, a dot has the number '+n+' inside it. Which finger goes there?',
    choices:FINGERS.map(function(t,i){return {label:t,ok:i+1===n}}),
    explain:'The number is the finger: 1 is the index, 2 the middle, 3 the ring and 4 the little finger.'};
};
QB.bBoxTab=function(){
  var k=rnd(3);
  if(k===0) return {lesson:[24,2],prompt:'In tab, which line stands for the thinnest string?',
    choices:shuffle([{label:'The top line',ok:true},{label:'The bottom line',ok:false},{label:'The middle line',ok:false},{label:'It changes from song to song',ok:false}]),
    explain:'Tab draws the thinnest string, the high E, on the top line and the thickest on the bottom.'};
  if(k===1) return {lesson:[24,2],prompt:'In tab, what does a 0 on a line mean?',
    choices:shuffle([{label:'Play that string open',ok:true},{label:'Do not play that string',ok:false},{label:'Press fret 10',ok:false},{label:'Mute that string',ok:false}]),
    explain:'The number is the fret to press, so 0 means no fret at all: an open string.'};
  return {lesson:[24,2],prompt:'In tab, several numbers stacked in one column mean what?',
    choices:shuffle([{label:'Play those notes together, as a chord',ok:true},{label:'Play them one after another, from the top',ok:false},{label:'Play only the highest one',ok:false},{label:'Hold each one for four beats',ok:false}]),
    explain:'Numbers in a column sound at the same moment. Numbers side by side are played in order, left to right.'};
};
QB.bEmNotes=function(){
  return {lesson:[24,3],prompt:'Which three notes make E minor?',
    choices:mkChoices('E, G, B',['E, G♯, B','E, A, B','E, G, A','E, F♯, B']),
    explain:'E minor is E, the note three semitones above it (G) and the note seven semitones above it (B). With G♯ instead of G it would be E major.'};
};
QB.bEmFretted=function(){
  return {lesson:[24,3],prompt:'In this E minor shape, which strings are fretted? Hollow rings are open strings.',
    board:shapeOrbs(shapeBy('Em')),
    audio:[{label:'Hear the shape',notes:shapeMidi(shapeBy('Em')),mode:'chord'}],
    choices:mkChoices('The A and D strings',['The low E and A strings','The G and B strings','The D and G strings','The B and high E strings']),
    explain:'Only the A and D strings have a finger on them, both at fret 2. The other four strings ring open.'};
};

/* ---- stop 25: open chords and changes ---- */
QB.bShapeName=function(){var q=QX.open(['E','Em','A','Am','D','G','C']); q.lesson=[25,1]; return q;};
QB.bAmSkip=function(){
  return {lesson:[25,0],prompt:'Which string do you leave out when you play A minor?',
    board:shapeOrbs(shapeBy('Am')),
    choices:mkChoices('The low E string',['The high E string','The B string','The A string','The G string']),
    explain:'A minor starts on the A string, so the low E string is left out. That is the string marked with a ×.'};
};
QB.bEarMinor=function(){var q=QB.earQuality(); q.lesson=[25,0]; return q;};
QB.bChangeTip=function(){
  if(Math.random()<.5) return {lesson:[25,2],prompt:'You are changing from Em to Am. What is the best way to do it?',
    choices:shuffle([{label:'Move both fingers down a string together and add finger 1',ok:true},{label:'Lift everything and place the fingers one at a time',ok:false},{label:'Strum faster so nobody notices the gap',ok:false},{label:'Play only the low E string until you are ready',ok:false}]),
    explain:'Em and Am share a shape. Both fingers step down one string together, and finger 1 joins on the B string.'};
  return {lesson:[25,3],prompt:'What is the best way to practise a chord change?',
    choices:shuffle([{label:'Slowly, moving all the fingers together, on a steady count',ok:true},{label:'As fast as you can, to get used to it',ok:false},{label:'One finger at a time, with no count',ok:false},{label:'Only in your head, away from the guitar',ok:false}]),
    explain:'Slow and steady wins. Speed comes by itself once your fingers know where to land.'};
};
})();
