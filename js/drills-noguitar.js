/* Drills for people who do not have a guitar yet. Everything here runs on the screen: no instrument and no mic.
   They sit in the Beginner tier of Practice, open from the start, and are tagged "no guitar needed". */
(function(){
function ngOthers(list,not){return list.filter(function(x){return x!==not})}
var PARTS=[
 ['Which part of the guitar holds the tuning pegs?','The headstock',['The bridge','The body','The nut']],
 ['What do you turn to make a string higher or lower in pitch?','A tuning peg',['A fret','The bridge','The pickguard']],
 ['What is the small ridge at the top of the neck that spaces the strings?','The nut',['The bridge','A fret','The headstock']],
 ['What are the metal bars across the neck called?','Frets',['Pegs','Strings','Inlays']],
 ['Where do the strings end on the body?','At the bridge',['At the nut','At the headstock','At a fret']],
 ['Which hand presses the strings against the frets, for a right-handed player?','The left hand',['The right hand','Either hand at random','Neither, the strings are plucked only']],
 ['Which hand strums or picks, for a right-handed player?','The right hand',['The left hand','Both at once on every note','Neither']],
 ['What do the dots on the side of the neck help you do?','Find your place on the neck',['Tune the strings','Hold the pick','Change the volume']],
 ['Where does the sound of an acoustic guitar come out and fill the room?','The sound hole and the body',['The headstock','The nut','The frets']],
 ['Which strings are thicker?','The low ones, which sound lower',['The high ones, which sound lower','The high ones, which sound higher','All six are the same']],
 ['How should you sit to play comfortably?','Upright, with the body on your thigh and the neck tilted up',['Slumped, with the neck pointing at the floor','Standing on one leg','Lying flat with the guitar on your chest']]
];
QB.ngPart=function(){
  var p=PARTS[rnd(PARTS.length)];
  return {lesson:[20,0],prompt:p[0],choices:mkChoices(p[1],p[2]),explain:'The answer is: '+p[1].toLowerCase()+'. You can read the parts of the guitar again in the first lesson of Meet the Strings.'};
};
var RHYME=['Eddie','Ate','Dynamite','Good','Bye','Eddie'], LOW=['E','A','D','G','B','E'];
QB.ngWord=function(){
  var i=rnd(6),c=LOW[i];
  return {lesson:[20,2],prompt:'The rhyme goes: Eddie, Ate, Dynamite, Good, Bye, Eddie, from the thickest string to the thinnest. Which string does "'+RHYME[i]+'" stand for?',
    choices:mkChoices(c,ngOthers(['E','A','D','G','B'],c)),
    explain:'The six words stand for E, A, D, G, B and E. "'+RHYME[i]+'" is word number '+(i+1)+', so it is the '+c+' string.'};
};
QB.ngOrder=function(){
  var i=rnd(6),n=i+1,c=LOW[i], ord=['1st','2nd','3rd','4th','5th','6th'][i];
  return {lesson:[20,2],prompt:'Counting from the thickest string, which note is the '+ord+' string tuned to?',
    choices:mkChoices(c,ngOthers(['E','A','D','G','B'],c)),
    explain:'From the thickest to the thinnest the strings are E, A, D, G, B, E, so the '+ord+' string is '+c+'.'};
};
QB.ngTab=function(){
  var line=1+rnd(6),f=rnd(6),s=line-1,c=NAMES[pcOf(s,f)];
  return {lesson:[24,2],prompt:'In tab, the top line is the thinnest string. You see the number '+f+' on line '+line+' from the top'+(f===0?', which means an open string':', which means fret '+f)+'. Which note is that?',
    board:[{s:s,f:f,kind:'ghost',label:'?',reveal:{kind:'found',label:c}}],
    choices:mkChoices(c,ngOthers(NAMES.slice(),c)),
    explain:'Line '+line+' from the top is the '+SNAME[s]+' string. With '+(f===0?'no fret pressed':'fret '+f)+' it sounds '+c+'.'};
};
QB.ngTabLine=function(){
  var s=rnd(6),line=s+1;
  return {lesson:[24,2],prompt:'In tab, which line from the top is the '+SNAME[s]+' string?',
    choices:numChoices(line,'Line ',[1,2,3,4,5,6],1,6),
    explain:'Tab shows the thinnest string on the top line, so the '+SNAME[s]+' string is line '+line+' from the top.'};
};
[
 {id:'parts',name:'Parts of the Guitar',desc:'Headstock, nut, frets, bridge and how to hold it. Learn them before you own one.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['ngPart'],
  primer:['A guitar has a headstock with tuning pegs, a neck with metal frets, and a body with a bridge. The nut is the small ridge where the neck meets the headstock.','No guitar needed. These are all questions on the screen.']},
 {id:'rhyme',name:'String Names by Rhyme',desc:'Eddie Ate Dynamite, Good Bye Eddie: lock in E A D G B E.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['ngWord','ngOrder','bStrName'],
  primer:['From the thickest string to the thinnest a guitar is tuned E, A, D, G, B, E. A rhyme helps: Eddie Ate Dynamite, Good Bye Eddie.','The strings are also numbered, from the thinnest: string 1 is the high E and string 6 is the low E.']},
 {id:'boxread',name:'Read a Chord Box',desc:'Dots, circles, crosses and finger numbers on a chord chart.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['bBoxMark','bBoxDot','bBoxTab'],
  primer:['A chord box is the neck turned upright. The vertical lines are the strings, with the thickest on the left, and the horizontal lines are the frets.','A dot is a finger, and the number in it says which. A hollow circle is an open string and a cross means leave it out.']},
 {id:'tabread',name:'Read the Tab',desc:'Six lines, one per string, and the fret numbers on them.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['ngTab','ngTabLine','bBoxTab'],
  primer:['Tab has six lines, one for each string, with the thinnest string on top. A number says which fret to press, and 0 means an open string.','Numbers stacked in one column are played together, like a chord.']},
 {id:'earfirst',name:'First Ear Training',desc:'Which string is thicker, which note is higher, and are two notes the same. Headphones help.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['bEarThick','bEarDir','bEarSame'],
  primer:['Thick strings sound low and thin strings sound high. Listen for that before you try to name any note.','You need sound on, not a guitar.']},
 {id:'alphabet',name:'The Note Alphabet',desc:'A to G, sharps and flats, and the notes with nothing between them.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['bNextLetter','bNoSharp','bBetween','bFlat'],
  primer:['Music uses seven letters, A to G, then starts again at A. Between most of them there is another note, a sharp or a flat.','B and C have nothing between them, and neither do E and F.']}
].forEach(function(m){PRACTICE.push(m)});
})();
