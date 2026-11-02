/* First Steps: the very basics, before chapter 1. Strings, frets and fingers, note names, tuning, reading chord boxes and tab, first open chords.
   Stop ids 20 to 25. This chapter is optional: chapter 1 stays open without it, so existing saves are untouched. */

/* draw an open-position chord on a board; frets run low string to high in chordShape, rows run high to low on the board */
function fsOpen(b,sym,play){
  var sh=chordShape(sym); if(!sh) return;
  b.clearOrbs(); b.clearLinks();
  var cells=[];
  sh.frets.forEach(function(f,i){
    var s=5-i;
    if(f<0){ dOrb(b,s,0,'ghost','×'); return; }
    dOrb(b,s,f,f===0?'scale':'tone');
    cells.push([s,f]);
  });
  if(play) playTogether(cells);
}
function fsStrum(b,cells,count,gap){
  for(var i=0;i<count;i++) (function(i){ later(function(){ playTogether(cells); cells.forEach(function(c){b.vib(c[0])}); },i*gap); })(i);
}
var FS_EM=[[5,0],[4,2],[3,2],[2,0],[1,0],[0,0]];
var FS_AM=[[4,0],[3,2],[2,2],[1,1],[0,0]];
var FS_OPEN6=[[5,0],[4,0],[3,0],[2,0],[1,0],[0,0]];

LEVELS.push(
makeLevel({id:20,title:'Meet the Strings',desc:'Pluck all six open strings.',frets:[0,0],goal:[4,9,2,7,11],unit:'open strings found',
  want:'We want an open string.',outMsg:'Click the open strings, the spots at the left end of the neck.',chime:[40,45,50,55,59,64],
  pre:'Now pluck all six open strings. Click the spot at the left end of each string, just before the first fret.',
  post:'Six strings, five different names. The low E and the high E share a name because they sound two octaves apart: one thick and low, one thin and high.',
  lesson:[
   {title:'Parts of the guitar',text:'The strings run from the tuning pegs on the headstock, over the nut, down the neck and over the frets, to the bridge on the body. The frets are the metal bars across the neck, and the numbers under the board count them from the headstock. You will spend most of your time between the nut and the twelfth fret.',
    demo:function(b){b.clearOrbs(); b.clearLinks();},
    actions:[]},
   {title:'Holding it',text:'Sit up with the body resting on your thigh and tilt the neck up a little so you can see the frets. Your fretting hand cups the neck with the thumb behind it. Your other hand strums near the sound hole. If you are left-handed, play it the other way round and turn on the left-handed option in Settings, so every board and chord chart in fretRoad flips with you.',
    demo:function(b){b.clearOrbs(); b.clearLinks();},
    actions:[]},
   {title:'Six strings',text:'A guitar has six strings. From the thickest to the thinnest they are E, A, D, G, B and E. A rhyme helps: Eddie Ate Dynamite, Good Bye Eddie. The thickest is called the low E and the thinnest is the high E. Press the buttons to hear them.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); for(var s=0;s<6;s++) dOrb(b,s,0,(s===0||s===5)?'root':'scale')},
    actions:[{label:'Hear them low to high',fn:function(b){playSeq(b,[[5,0],[4,0],[3,0],[2,0],[1,0],[0,0]],520)}},{label:'Strum all six',fn:function(b){playTogether(FS_OPEN6)}}]},
   {title:'Numbered from the thin end',text:'Strings also have numbers, and the numbers run the other way. String 1 is the thinnest, the high E. String 6 is the thickest, the low E. Chord charts and tab use these numbers, so it is worth learning them now. Click any string to hear it.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); for(var s=0;s<6;s++) dOrb(b,s,0,'scale',String(s+1))},
    actions:[{label:'Hear string 1',fn:function(b){playSeq(b,[[0,0]],0,function(){return '1'})}},{label:'Hear string 6',fn:function(b){playSeq(b,[[5,0]],0,function(){return '6'})}}]},
   {title:'High and low',text:'High and low mean pitch, not position. The thickest string sounds lowest, and it sits closest to your chin when you hold the guitar. Tab and the board below draw the thin high E on top and the thick low E at the bottom, which feels upside down until you have seen it a few times.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,5,0,'root'); dOrb(b,0,0,'root'); b.link([5,0],[0,0],'thick = low, thin = high')},
    actions:[{label:'Thickest string',fn:function(b){playSeq(b,[[5,0]],0)}},{label:'Thinnest string',fn:function(b){playSeq(b,[[0,0]],0)}}]}
  ],
  quiz:['bStrName','bStrNum','bOpenClick','bThick','bEarThick'],
  reveal:{title:'Eddie Ate Dynamite, Good Bye Eddie',text:'E, A, D, G, B, E, from the thickest string to the thinnest. Say the rhyme as you pluck them on your own guitar. Press the button to hear all six.',
    hear:function(){playSeq(boardL,[[5,0],[4,0],[3,0],[2,0],[1,0],[0,0]],520)}}}),
makeLevel({id:21,title:'Frets and Fingers',desc:'Walk the first four frets of the two thickest strings.',frets:[0,4],strs:[5,4],goal:[4,5,6,7,8,9,10,11,0,1],unit:'notes found',
  want:'We want a note on frets 0 to 4.',outMsg:'Stay on the low E and A strings, frets 0 to 4.',chime:[40,41,43,45],
  pre:'Now walk it. On the two thickest strings, the low E and the A string, play every note from the open string up to fret 4. That is ten notes.',
  post:'Ten notes, one for each fret on each string. Fret 1 is always one step above the open string, fret 2 two steps, and so on. The fret number counts the steps, and the string decides where you start.',
  lesson:[
   {title:'What a fret does',text:'Each metal fret shortens the string a little, and a shorter string sounds higher. Press a string down just behind a fret, on the headstock side of the wire, and you play that fret. Press in the middle of the gap and the note buzzes. Press on top of the wire and it sounds dull.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); for(var f=0;f<=4;f++) dOrb(b,4,f,f===0?'root':'scale',f===0?'open':String(f))},
    actions:[{label:'Hear frets 0 to 4',fn:function(b){playSeq(b,[[4,0],[4,1],[4,2],[4,3],[4,4]],420,function(c,i){return i===0?'open':String(i)})}}]},
   {title:'Four fingers',text:'Your fretting-hand fingers have numbers. Finger 1 is the index, 2 the middle, 3 the ring and 4 the little finger. The thumb has no number, it stays behind the neck. A tidy way to start is one finger per fret: finger 1 on fret 1, finger 2 on fret 2, finger 3 on fret 3 and finger 4 on fret 4.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,5,0,'root','open'); for(var f=1;f<=4;f++) dOrb(b,5,f,'tone',String(f))},
    actions:[{label:'Hear it climb',fn:function(b){playSeq(b,[[5,0],[5,1],[5,2],[5,3],[5,4]],420,function(c,i){return i===0?'open':String(i)})}}]},
   {title:'A clean note',text:'Use the tip of the finger, not the pad, and keep it arched so it does not touch the next string. Press just hard enough to stop the buzz. If a note sounds buzzy or dull, the finger is usually too far from the fret wire, or not pressing quite hard enough.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,4,2,'tone','2')},
    actions:[{label:'Hear fret 2',fn:function(b){playSeq(b,[[4,2]],0,function(){return '2'})}}]}
  ],
  quiz:['bFingerFret','bFingerName','bFretPlace','bNoteLow','bEarDir'],
  reveal:{title:'One finger per fret',text:'Open, then fingers 1, 2, 3 and 4. On the low E string that spells E, F, F♯, G, G♯. Press the button to hear it, then try it on your own guitar.',
    hear:function(){playSeq(boardL,[[5,0],[5,1],[5,2],[5,3],[5,4]],420)}}}),
makeLevel({id:22,title:'The Musical Alphabet',desc:'Find every natural note on the low E string.',frets:[0,12],strs:[5],goal:[0,2,4,5,7,9,11],unit:'natural notes found',
  want:'We want a natural note, one with no sharp.',outMsg:'Stay on the low E string.',chime:[40,41,43,45],
  pre:'Now find every natural note on the low E string, from the open string to fret 12. There are eight, and the sharps do not count.',
  post:'Eight notes, and only two of the gaps are a single fret: E to F and B to C. Every other gap is two frets, with a sharp in the middle.',
  lesson:[
   {title:'Seven letters',text:'Notes are named with seven letters: A, B, C, D, E, F and G. After G the letters start again at A, one octave higher. These seven are the natural notes. Here they are on the low E string, starting from the open string.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); [0,1,3,5,7,8,10,12].forEach(function(f){dOrb(b,5,f,(f===0||f===12)?'root':'scale')})},
    actions:[{label:'Hear the natural notes',fn:function(b){playSeq(b,[[5,0],[5,1],[5,3],[5,5],[5,7],[5,8],[5,10],[5,12]],360)}}]},
   {title:'Notes in between',text:'Most letters sit two frets apart, and the fret between them is another note. Name it from the lower letter and it is a sharp (♯). Name it from the higher letter and it is a flat (♭). So the fret between F and G is F♯, and it is also called G♭. fretRoad writes sharps.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,5,1,'scale'); dOrb(b,5,2,'found','F♯'); dOrb(b,5,3,'scale')},
    actions:[{label:'Hear F, F♯, G',fn:function(b){playSeq(b,[[5,1],[5,2],[5,3]],520,function(c,i){return ['F','F♯','G'][i]})}}]},
   {title:'Two places with no sharp',text:'Between E and F, and between B and C, there is no note in the middle. Those pairs sit one fret apart. Every other pair of neighbouring letters has a sharp between them. Remember E F and B C and the whole neck gets easier.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,5,0,'root'); dOrb(b,5,1,'root'); dOrb(b,5,7,'tone'); dOrb(b,5,8,'tone'); b.link([5,0],[5,1],'1 fret'); b.link([5,7],[5,8],'1 fret')},
    actions:[{label:'Hear E to F',fn:function(b){playSeq(b,[[5,0],[5,1]],600)}},{label:'Hear B to C',fn:function(b){playSeq(b,[[5,7],[5,8]],600)}}]}
  ],
  quiz:['bNextLetter','bNoSharp','bBetween','bFlat','bNatClick'],
  reveal:{title:'The pattern',text:'From the open E, the natural notes are 1, 2, 2, 2, 1, 2 and 2 frets apart. The two single steps are E to F and B to C. Press the button to hear all eight.',
    hear:function(){playSeq(boardL,[[5,0],[5,1],[5,3],[5,5],[5,7],[5,8],[5,10],[5,12]],330)}}}),
makeLevel({id:23,title:'In Tune',desc:'Match each string to the one beside it.',frets:[4,5],strs:[5,4,3,2,1],goal:[9,2,7,11,4],ghosts:[[4,0],[3,0],[2,0],[1,0],[0,0]],unit:'matches found',
  want:'We want the note that matches the next open string.',outMsg:'Look at frets 4 and 5 of the five thickest strings.',chime:[45,50,55,59],
  pre:'To tune by ear you press one string and match it to the open string beside it. The ghosts show the open strings A, D, G, B and E. For each one, find the fret on the thicker string next door that plays the same note. There are five, on frets 4 and 5.',
  post:'Four of them are on fret 5 and one is on fret 4. The G and B strings are the odd pair, because they are tuned a semitone closer together than the rest.',
  lesson:[
   {title:'Pegs and pitch',text:'Each string winds around a tuning peg on the headstock. Tighten the string and the note goes up. Loosen it and the note goes down. Guitars drift out of tune with heat and playing, so tune every time you pick one up. Tune up to the note: if you overshoot, go a little below and come back up.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); for(var s=0;s<6;s++) dOrb(b,s,0,'scale')},
    actions:[{label:'Hear the six target notes',fn:function(b){playSeq(b,[[5,0],[4,0],[3,0],[2,0],[1,0],[0,0]],700)}}]},
   {title:'Use a tuner',text:'The easiest way is a tuner. fretRoad has one in Practice, called Tuner and Mic Check. Pluck one string, read the note it shows and turn the peg until the needle sits in the middle. Start with the thickest string and work up to the thinnest, then go round once more, because tightening one string can nudge the others.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); for(var s=0;s<6;s++) dOrb(b,s,0,'scale')},
    actions:[{label:'Hear the low E',fn:function(b){playSeq(b,[[5,0]],0)}},{label:'Hear the high E',fn:function(b){playSeq(b,[[0,0]],0)}}]},
   {title:'Tuning by ear',text:'No tuner? Press the low E string at fret 5. It sounds the same as the open A string. Tune the A string until the two notes blend into one steady note with no wobble. Then fret 5 of the A string matches the open D, and fret 5 of the D string matches the open G.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,5,5,'root'); dOrb(b,4,0,'root'); dOrb(b,4,5,'tone'); dOrb(b,3,0,'tone'); dOrb(b,3,5,'found'); dOrb(b,2,0,'found'); b.link([5,5],[4,0],'same note',true); b.link([4,5],[3,0],'same note',true); b.link([3,5],[2,0],'same note',true)},
    actions:[{label:'Low E fret 5, then open A',fn:function(b){playSeq(b,[[5,5],[4,0]],800)}},{label:'A fret 5, then open D',fn:function(b){playSeq(b,[[4,5],[3,0]],800)}},{label:'D fret 5, then open G',fn:function(b){playSeq(b,[[3,5],[2,0]],800)}}]},
   {title:'The odd one out',text:'The G and B strings break the pattern. Press the G string at fret 4, not 5, and it matches the open B string. Then fret 5 of the B string matches the open high E. Those two strings are tuned four semitones apart instead of five, so you need one fret less.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,2,4,'root'); dOrb(b,1,0,'root'); dOrb(b,1,5,'tone'); dOrb(b,0,0,'tone'); b.link([2,4],[1,0],'fret 4',true); b.link([1,5],[0,0],'fret 5',true)},
    actions:[{label:'G fret 4, then open B',fn:function(b){playSeq(b,[[2,4],[1,0]],800)}},{label:'B fret 5, then open high E',fn:function(b){playSeq(b,[[1,5],[0,0]],800)}}]}
  ],
  quiz:['bTuneFret','bSharedFret','bTuneDir','bTuneOdd','bEarSame'],
  reveal:{title:'The tuning map',text:'Fret 5, fret 5, fret 5, fret 4, fret 5, from the low E up. Press the button to hear each pair in turn: a fretted note, then the open string it should match.',
    hear:function(){playSeq(boardL,[[5,5],[4,0],[4,5],[3,0],[3,5],[2,0],[2,4],[1,0],[1,5],[0,0]],620)}}}),
makeLevel({id:24,title:'Your First Chord',desc:'Build an E minor chord on all six strings.',frets:[0,2],goal:[4,7,11],unit:'chord notes found',
  want:'We want E, G or B.',outMsg:'Stay inside the first two frets.',chime:[40,47,52,55,59,64],
  pre:'Now build E minor. Its notes are E, G and B. Look in the first two frets and find a note for every string. Two of them are fretted and the rest are open.',
  post:'Six strings, and only two are fretted: fret 2 of the A string and fret 2 of the D string. Everything else rings open. That is the whole chord.',
  lesson:[
   {title:'What a chord is',text:'A chord is several notes played together, usually by strumming across the strings. It is not a new kind of note. It is notes you already know sounding at once, and the mix gives it a mood. Three of your open strings are G, B and E, and together they already make an E minor chord. Press the buttons to hear it.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,2,0,'tone'); dOrb(b,1,0,'tone'); dOrb(b,0,0,'root')},
    actions:[{label:'One at a time',fn:function(b){playSeq(b,[[2,0],[1,0],[0,0]],650)}},{label:'All together',fn:function(b){playTogether([[2,0],[1,0],[0,0]])}}]},
   {title:'Reading a chord box',text:'Chord charts are drawn as a box. The neck is turned upright, so the vertical lines are the strings, with the thickest on the left, and the horizontal lines are the frets. The thick line at the top is the nut. A dot shows where a finger goes and its number says which finger. A ring above a string means play it open, and a × means leave it out.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); [[5,0],[2,0],[1,0],[0,0]].forEach(function(c){dOrb(b,c[0],c[1],'ghost','○')}); dOrb(b,4,2,'tone','2'); dOrb(b,3,2,'tone','3')},
    actions:[{label:'Hear it',fn:function(b){playTogether(FS_EM)}}]},
   {title:'Tab, the other way to read',text:'Tab has six lines, one for each string, with the thinnest string on top. A number says which fret to press, and 0 means an open string. Numbers stacked in one column are played together as a chord, and numbers in a row are played one after another. Here is E minor as tab numbers.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); FS_EM.forEach(function(c){dOrb(b,c[0],c[1],c[1]===0?'scale':'tone',String(c[1]))})},
    actions:[{label:'Strum it',fn:function(b){playTogether(FS_EM)}}]},
   {title:'E minor',text:'E minor is the friendliest first chord. Put your middle finger on fret 2 of the A string and your ring finger on fret 2 of the D string. Leave the other four strings open and strum all six, from the thick low E down to the thin high E. Press the buttons to hear it.',
    demo:function(b){fsOpen(b,'Em',false)},
    actions:[{label:'One string at a time',fn:function(b){playSeq(b,FS_EM,420)}},{label:'Strum it',fn:function(b){playTogether(FS_EM)}}]}
  ],
  quiz:['bBoxMark','bBoxDot','bBoxTab','bEmNotes','bEmFretted'],
  reveal:{title:'E minor',text:'Two fingers, six strings. Compare the box below with the shape you just built on the neck. Press the button to strum it.',
    html:function(){return '<div style="margin:4px 0 14px;max-width:150px">'+chordDiagram('Em',{w:150})+'</div>'},
    hear:function(){playTogether(FS_EM)}}}),
makeLevel({id:25,title:'Open Chords and Changes',desc:'Build A minor, then meet the rest of the open chords.',frets:[0,2],strs:[4,3,2,1,0],goal:[9,0,4],unit:'chord notes found',
  want:'We want A, C or E.',outMsg:'Stay inside the first two frets.',chime:[45,52,57,60,64],
  pre:'Now build A minor. Its notes are A, C and E. Leave the low E string out, and look in the first two frets of the other five strings.',
  post:'Five strings, with the low E left silent. It is the E minor shape moved one string over, plus one finger on the B string. Em and Am together are already enough for a slow two-chord song.',
  lesson:[
   {title:'A minor',text:'A minor uses the E minor shape, moved down one string, with one extra finger. Put finger 1 on fret 1 of the B string, finger 2 on fret 2 of the D string and finger 3 on fret 2 of the G string. Strum from the A string down, and leave the low E string out. The × on the board marks the string you skip.',
    demo:function(b){fsOpen(b,'Am',false)},
    actions:[{label:'One string at a time',fn:function(b){playSeq(b,FS_AM,420)}},{label:'Strum it',fn:function(b){playTogether(FS_AM)}}]},
   {title:'The open chord set',text:'A handful of open chords will take you a very long way: E, A, D, C and G, plus the minors Em and Am. Press a button to see one on the neck and hear it. A × means leave that string out. The name under each dot is the note that string plays.',
    demo:function(b){fsOpen(b,'Em',false)},
    actions:['Em','Am','E','A','D','C','G'].map(function(sym){return {label:sym,fn:function(b){fsOpen(b,sym,true)}}})},
   {title:'Changing chords',text:'Changing chords is the hard part, and it is hard for everyone at first. Go slowly and move all your fingers together, not one by one. Look for fingers that only need to move one string. From Em to Am, both fingers step down one string together and the first finger joins in on the B string.',
    demo:function(b){b.clearOrbs(); b.clearLinks(); dOrb(b,4,2,'tone','2'); dOrb(b,3,2,'tone','3'); dOrb(b,2,2,'found','3'); dOrb(b,1,1,'found','1'); b.link([4,2],[3,2],'down a string',true); b.link([3,2],[2,2],'down a string',true)},
    actions:[{label:'Hear Em',fn:function(b){playTogether(FS_EM)}},{label:'Hear Am',fn:function(b){playTogether(FS_AM)}},{label:'Em, then Am',fn:function(b){playTogether(FS_EM); later(function(){playTogether(FS_AM)},1400)}}]},
   {title:'Count and strum',text:'Strum downward across the strings while you count 1, 2, 3, 4 at an even pace. Give each chord four strums, then change on the next 1. Start slower than feels necessary, around 60 beats a minute. The metronome and the Strumming Patterns practice module will help you keep time.',
    demo:function(b){fsOpen(b,'Em',false)},
    actions:[{label:'Four strums on Em',fn:function(b){fsStrum(b,FS_EM,4,700)}},{label:'Em, then Am',fn:function(b){fsStrum(b,FS_EM,4,700); later(function(){fsStrum(b,FS_AM,4,700)},2800)}}]}
  ],
  quiz:['bShapeName','bShapeName','bAmSkip','bEarMinor','bChangeTip'],
  reveal:{title:'Two minor chords',text:'Em on the left, Am on the right. The shape moved over a string and gained a finger. Press the button to hear Em, then Am.',
    html:function(){return '<div style="margin:4px 0 14px;display:flex;gap:22px;flex-wrap:wrap"><div style="max-width:130px">'+chordDiagram('Em',{w:130})+'</div><div style="max-width:130px">'+chordDiagram('Am',{w:130})+'</div></div>'},
    hear:function(){playTogether(FS_EM); later(function(){playTogether(FS_AM)},1300)}}})
);
LEVELS.slice(-6).forEach(function(l){ if(l.id===25) l.out=function(s){return s===5?'Leave the low E string out. A minor starts on the A string.':'Stay inside the first two frets.'}; });
