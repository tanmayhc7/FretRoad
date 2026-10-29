/* Helpers shared by the level files (chapters 2 and later) */
var INTL=['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
/* every [string,fret] holding a note of the scale, inside a fret window */
function scaleCells(root,key,lo,hi,strs){
  var out=[],iv=SCL[key].iv;
  for(var s=0;s<6;s++){ if(strs&&strs.indexOf(s)<0) continue;
    for(var f=lo;f<=hi;f++){ if(iv.indexOf((pcOf(s,f)-root+12)%12)>-1) out.push([s,f]); } }
  return out;
}
/* low string first, then ascending frets */
function cellsUp(cells){return cells.slice().sort(function(a,b){return a[0]!==b[0]?b[0]-a[0]:a[1]-b[1]})}
/* draw a scale shape: roots in brass, other notes plain; labelFn(pc) picks the label; hot = pitch classes to light up */
function showScale(b,root,key,lo,hi,o){
  o=o||{}; b.clearOrbs(); b.clearLinks();
  scaleCells(root,key,lo,hi,o.strs).forEach(function(c){
    var pc=pcOf(c[0],c[1]),iv=(pc-root+12)%12,isRoot=iv===0,hot=o.hot&&o.hot.indexOf(pc)>-1;
    b.orb('d'+c[0]+','+c[1],{s:c[0],f:c[1],label:o.intervals?INTL[iv]:NAMES[pc],kind:hot?'found':(isRoot?'root':'scale')});
  });
}
function playCells(cells,gap){ /* ascending notes, one at a time, with a flash on the board */
  var b=boardL,list=cellsUp(cells); playSeq(b,list,gap||260);
}
function hearScale(cells,gap){ var b=boardL; playSeq(b,cellsUp(cells),gap||240); }
/* build a level object from a short spec */
function makeLevel(sp){
  var lo=sp.frets[0],hi=sp.frets[1],strs=sp.strs;
  var L={id:sp.id,stop:sp.stop||('Stop '+sp.id),title:sp.title,desc:sp.desc,goal:sp.goal,roots:sp.roots||null,ghosts:sp.ghosts||null,want:sp.want,unit:sp.unit,
    scope:function(s,f){return f>=lo&&f<=hi&&(!strs||strs.indexOf(s)>-1)},
    out:function(s,f){return sp.outMsg||('Stay between frets '+lo+' and '+hi+'.')},
    pre:sp.pre,post:sp.post,chime:sp.chime,lesson:sp.lesson,quiz:sp.quiz,reveal:sp.reveal};
  return L;
}
/* wrap a quiz generator so a wrong answer links back to a lesson step */
function qLesson(id,step,gen){return function(lv){var q=gen(lv); q.lesson=[id,step]; return q;}}
