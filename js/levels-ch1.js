/* Chapter 1 stops, lessons and puzzle goals */
/* ---------- story + levels ---------- */
var LEVELS=[
 {id:1,stop:'Lowtide',title:'Find the A',desc:'Find every A on the neck.',goal:[9],roots:null,want:'We want an A.',unit:'A notes found',
  scope:function(){return true},
  pre:"Now the puzzle. Find every A on the neck. There are seven in the first twelve frets, counting the open string.",
  post:"Seven. They zigzag across the neck, the same note on different roads. Now a few questions, to see if it stuck.",
  chime:[57,61,64,69]},
 {id:2,stop:'Saltmarsh Junction',title:'The Fifth Above',desc:'Find the E that sits above each A.',goal:[4],roots:[9],want:'We want an E, the fifth above A.',unit:'E notes found',
  scope:function(){return true},
  pre:"Now find the fifth above every A. Your A notes are marked in gold. There are eight E notes to find.",
  post:"Look at the gold lines. From an A, the E sits one string up and two frets over. Every power chord you have played is that shape, and now you have drawn it.",
  chime:[45,52,57,64]},
 {id:3,stop:'Harbor Light',title:'Three in a Row',desc:'Spell an A major chord on three strings.',goal:[9,1,4],roots:null,want:'We want A, C♯ or E.',unit:'chord tones found',
  scope:function(s,f){return s>=1&&s<=3&&f<=3},
  out:function(s){return (s<1||s>3)?'Stay on the D, G and B strings.':'Stay inside the first three frets.'},
  pre:"Now find the chord on three strings. A, C♯ and E are your notes. Look on the D, G and B strings, inside the first three frets.",
  post:"All three sit on fret 2, in a straight line. Slide that shape along the neck and watch what happens to the chord.",
  chime:[52,57,61]}
];
var isDone=function(id){return save.done.indexOf(id)>-1};
var isPassed=function(id){return save.passed.indexOf(id)>-1};

/* ---------- lessons (taught before each puzzle) ---------- */
function nm(s,f){return NAMES[pcOf(s,f)]}
function dOrb(b,s,f,kind,label){b.orb('d'+s+','+f,{s:s,f:f,label:(label===undefined?nm(s,f):label),kind:kind})}
function playSeq(b,cells,gap,labelFn){
  cells.forEach(function(c,i){later(function(){
    pluck(OPEN[c[0]]+c[1],0,.8); b.vib(c[0]);
    b.flash(c[0],c[1],labelFn?labelFn(c,i):nm(c[0],c[1]),'found',gap*.9);
  },i*gap)});
}
function playTogether(cells){strum(cells.map(function(c){return OPEN[c[0]]+c[1]}),.04)}
function fifthDemo(b,r,play){
  b.clearOrbs(); b.clearLinks();
  dOrb(b,4,r,'root'); dOrb(b,4,r+7,'tone'); b.link([4,r],[4,r+7],'+7 semitones');
  if(play) playTogether([[4,r],[4,r+7]]);
}
LEVELS[0].lesson=[
 {title:'Twelve notes',
  text:"Music uses only twelve notes: A, A♯, B, C, C♯, D, D♯, E, F, F♯, G, G♯. After G♯ the list starts over at A. Each fret on the guitar moves you one step along that list, and one step is called a semitone. This is the A string. Press the button to hear it climb.",
  demo:function(b){for(var f=0;f<=12;f++) dOrb(b,4,f,(f===0||f===12)?'root':'scale')},
  actions:[{label:'Hear the string climb',fn:function(b){var c=[];for(var f=0;f<=12;f++)c.push([4,f]);playSeq(b,c,230)}}]},
 {title:'Twelve frets later',
  text:"After twelve semitones the list has gone all the way around, so you land on the same note again, one octave higher. That is why fret 12 on the A string is another A. Click either A to hear how they differ.",
  demo:function(b){dOrb(b,4,0,'root'); dOrb(b,4,12,'root'); b.link([4,0],[4,12],'12 semitones = 1 octave')},
  actions:[{label:'Hear both A notes',fn:function(b){playSeq(b,[[4,0],[4,12]],700)}}]},
 {title:'Strings overlap',
  text:"The strings are tuned five semitones apart, so neighbouring strings share notes. Fret 5 on the low E string is the same A as the open A string. The one exception is between the G and B strings, which are four semitones apart.",
  demo:function(b){dOrb(b,5,5,'root'); dOrb(b,4,0,'root'); b.link([5,5],[4,0],'same note',true)},
  actions:[{label:'Hear them one after the other',fn:function(b){playSeq(b,[[5,5],[4,0]],800)}}]}
];
LEVELS[1].lesson=[
 {title:'Counting semitones',
  text:"The distance between two notes is measured in semitones, and on one string that just means counting frets. Start on the open A string and count up seven frets. You land on E. Press the button to count along.",
  demo:function(b){dOrb(b,4,0,'root'); for(var f=1;f<=6;f++) dOrb(b,4,f,'scale',String(f)); dOrb(b,4,7,'tone')},
  actions:[{label:'Count it out',fn:function(b){var c=[[4,0]];for(var f=1;f<=7;f++)c.push([4,f]);playSeq(b,c,330,function(x,i){return i===0?'A':(i===7?'E':String(i))})}}]},
 {title:'The fifth',
  text:"The note seven semitones above your starting note is called the fifth. It is the strongest partner a note can have. Play a note and its fifth together and you have a power chord.",
  demo:function(b){fifthDemo(b,0,false)},
  actions:[{label:'Play them together',fn:function(b){playTogether([[4,0],[4,7]])}},{label:'One at a time',fn:function(b){playSeq(b,[[4,0],[4,7]],700)}}]},
 {title:'From any note',
  text:"This works from every note. Seven frets above your starting note, on the same string, is its fifth. Pick a starting note and watch where the fifth lands.",
  demo:function(b){fifthDemo(b,0,false)},
  actions:[['A',0],['B',2],['C',3],['D',5]].map(function(p){return {label:'From '+p[0],fn:function(b){fifthDemo(b,p[1],true)}}})}
];
LEVELS[2].lesson=[
 {title:'Three notes make a chord',
  text:"A major chord stacks three notes: a root, a note four semitones above it, and the fifth, seven semitones above it. From A that gives A, C♯ and E. The four-semitone note is the major third, and it is what gives the chord its bright sound.",
  demo:function(b){dOrb(b,4,0,'root'); dOrb(b,4,4,'tone'); dOrb(b,4,7,'tone'); b.link([4,0],[4,4],'+4'); b.link([4,4],[4,7],'+3')},
  actions:[{label:'One at a time',fn:function(b){playSeq(b,[[4,0],[4,4],[4,7]],650)}},{label:'All together',fn:function(b){playTogether([[4,0],[4,4],[4,7]])}}]},
 {title:'The same notes, other strings',
  text:"A chord is just those three notes, wherever you find them. Here they are on the low E string. Your hand shape changes from string to string, but the chord stays the same. Next you will find them on the D, G and B strings.",
  demo:function(b){dOrb(b,5,5,'root'); dOrb(b,5,9,'tone'); dOrb(b,5,0,'scale'); dOrb(b,5,12,'scale')},
  actions:[{label:'Hear them',fn:function(b){playSeq(b,[[5,5],[5,9],[5,12]],650)}}]}
];

/* ---------- more levels ---------- */
LEVELS.push(
 {id:4,stop:'Switchback Pass',title:'The Darker Chord',desc:'Spell an A minor chord on three strings.',goal:[9,0,4],roots:null,want:'We want A, C or E.',unit:'chord tones found',
  scope:function(s,f){return s>=1&&s<=3&&f<=3},
  out:function(s){return (s<1||s>3)?'Stay on the D, G and B strings.':'Stay inside the first three frets.'},
  pre:"Same three strings, one change. A minor is A, C and E. Find them on the D, G and B strings, inside the first three frets.",
  post:"Put it next to the major chord from the last stop. The A and the E stayed where they were. The middle note slid down one fret, and the whole chord went dark.",
  chime:[52,57,60]},
 {id:5,stop:'The Long Straight',title:'Octave Shapes',desc:'Find every A above the two low As.',goal:[9],roots:null,ghosts:[[5,5],[4,0]],want:'We want an A.',unit:'A notes found',
  scope:function(s,f){return s<=3},
  out:function(){return 'Look on the four thinnest strings.'},
  pre:"The two gold A notes are the lowest A on the neck. Find every A above them on the four thinnest strings.",
  post:"Four of them, and each is the same A, higher up. Look at the lines: two strings up and two frets over, until the G and B strings get in the way.",
  chime:[45,57,69]}
);
LEVELS[3].lesson=[
 {title:'The third sets the mood',
  text:"Last stop you built A major from A, C♯ and E. The middle note decides the mood. In a major chord it sits four semitones above the root. Move it down one semitone, to three above the root, and the chord turns minor. A minor is A, C and E.",
  demo:function(b){dOrb(b,4,0,'root'); dOrb(b,4,3,'tone'); dOrb(b,4,7,'tone'); b.link([4,0],[4,3],'+3'); b.link([4,3],[4,7],'+4')},
  actions:[{label:'One at a time',fn:function(b){playSeq(b,[[4,0],[4,3],[4,7]],650)}},{label:'All together',fn:function(b){playTogether([[4,0],[4,3],[4,7]])}}]},
 {title:'Major beside minor',
  text:"Here are both thirds on the A string. Fret 3 is C, the minor third. Fret 4 is C♯, the major third. They are one fret apart and sound very different. Play each chord and listen for the shift from bright to dark.",
  demo:function(b){dOrb(b,4,0,'root'); dOrb(b,4,3,'tone'); dOrb(b,4,4,'tone'); dOrb(b,4,7,'scale')},
  actions:[{label:'Hear A major',fn:function(b){playTogether([[4,0],[4,4],[4,7]])}},{label:'Hear A minor',fn:function(b){playTogether([[4,0],[4,3],[4,7]])}}]},
 {title:'One finger moves',
  text:"On the D, G and B strings, A major sits at fret 2 on all three. To make it minor, drop the B string note down one fret, to fret 1. Nothing else moves. Press the buttons to see and hear both shapes.",
  demo:function(b){dOrb(b,3,2,'tone'); dOrb(b,2,2,'tone'); dOrb(b,1,2,'root')},
  actions:[
   {label:'Show major',fn:function(b){b.clearOrbs(); dOrb(b,3,2,'tone'); dOrb(b,2,2,'tone'); dOrb(b,1,2,'root'); playTogether([[3,2],[2,2],[1,2]])}},
   {label:'Show minor',fn:function(b){b.clearOrbs(); dOrb(b,3,2,'tone'); dOrb(b,2,2,'tone'); dOrb(b,1,1,'root'); playTogether([[3,2],[2,2],[1,1]])}}]}
];
LEVELS[4].lesson=[
 {title:'Two strings up, two frets over',
  text:"An octave is twelve semitones, but you do not have to climb twelve frets. The neck repeats its own pattern. From any note, go two strings higher and two frets over, and you land on the same note one octave up. Here it is from the A on the low E string.",
  demo:function(b){dOrb(b,5,5,'root'); dOrb(b,3,7,'tone'); b.link([5,5],[3,7],'+2 strings, +2 frets')},
  actions:[{label:'Hear the octave',fn:function(b){playSeq(b,[[5,5],[3,7]],800)}},{label:'Hear them together',fn:function(b){playTogether([[5,5],[3,7]])}}]},
 {title:'The G and B gap',
  text:"The rule has one catch. The G and B strings are tuned four semitones apart, while every other neighbouring pair is five. When an octave shape crosses between G and B it needs one more fret: three frets over, not two. Here it is from the G string.",
  demo:function(b){dOrb(b,2,2,'root'); dOrb(b,0,5,'tone'); b.link([2,2],[0,5],'+3 frets (G to B gap)')},
  actions:[{label:'Hear the octave',fn:function(b){playSeq(b,[[2,2],[0,5]],800)}},{label:'Hear them together',fn:function(b){playTogether([[2,2],[0,5]])}}]},
 {title:'Octaves in practice',
  text:"This shape sits behind a lot of riffs: the root on one string and its octave two strings up, with the string between them muted. Here is the A with the A string left silent. The cross marks the string you do not play.",
  demo:function(b){dOrb(b,5,5,'root'); dOrb(b,3,7,'tone'); dOrb(b,4,6,'ghost','×')},
  actions:[{label:'Hear the two notes',fn:function(b){playTogether([[5,5],[3,7]])}}]}
];

