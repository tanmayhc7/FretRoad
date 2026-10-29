/* Quiz generators for chapters 2 to 4. Each key is used in a level's quiz:[...] list. */
var P_POOL=['minor pentatonic','major pentatonic'], B_POOL=['blues','minor pentatonic'];
var MODE_POOL=['natural minor','dorian','mixolydian','lydian','phrygian','major'];
function ql(id,step,gen){return qLesson(id,step,gen)}
/* chapter 2 */
QB.pSpell=ql(6,1,function(){return QX.scaleSpell(P_POOL)});
QB.pFormula=ql(7,0,function(){return QX.scaleFormula(P_POOL)});
QB.pDeg=ql(7,0,function(){return QX.scaleDegree(P_POOL)});
QB.pClick=ql(6,1,function(){return QX.scaleClick(P_POOL)});
QB.pEarMinor=ql(7,1,function(){return QX.scaleEar(['major','natural minor','minor pentatonic','blues'])});
QB.pEarMajor=ql(10,0,function(){return QX.scaleEar(['major pentatonic','minor pentatonic','major','natural minor'])});
QB.bSpell=ql(9,0,function(){return QX.scaleSpell(B_POOL)});
QB.bDeg=ql(9,0,function(){return QX.scaleDegree(['blues'])});
QB.bClick=ql(9,0,function(){return QX.scaleClick(['blues'])});
QB.bEar=ql(9,1,function(){return QX.scaleEar(['minor pentatonic','blues','natural minor'])});
QB.pBoxCount=function(){
  var q=rnd(2);
  if(q===0) return {lesson:[6,1],prompt:'A pentatonic box has two notes on each of the six strings. How many fretted notes does one box hold?',choices:numChoices(12,'',[5,6,7,10,11,13],5,14),
    explain:'Two notes on each of six strings makes 12 notes in a box.'};
  return {lesson:[6,0],prompt:'How many different note names does a pentatonic scale use?',choices:numChoices(5,'',[4,6,7,8,12],4,12),
    explain:'Penta means five. A pentatonic scale uses five different notes and repeats them across the neck.'};
};
QB.pBoxRoot=function(){
  var r; do{r=rnd(12)}while(r===4); var f=(r+8)%12;
  return {lesson:[8,0],prompt:'Box one of '+NAMES[r]+' minor pentatonic puts the root on the low E string. Which fret is that?',choices:numChoices(f,'Fret ',[1,2,3,5,6,7,8,9,10,11,12],1,12),
    explain:'The low E string is E, so '+NAMES[r]+' is '+f+' semitones above the open string. Box one starts at fret '+f+'.'};
};
QB.pDegreeOf=function(){
  var r=rnd(12),iv=pick(SCL['minor pentatonic'].iv),note=NAMES[(r+iv)%12],correct=INTL[iv];
  var others=[0,3,5,7,10,2,4,9].filter(function(x){return x!==iv}).map(function(x){return INTL[x]});
  return {lesson:[7,0],prompt:'In '+NAMES[r]+' minor pentatonic, which scale degree is '+note+'?',choices:mkChoices(correct,others),
    explain:note+' is '+iv+' semitones above '+NAMES[r]+', which is the '+correct+'.'};
};
QB.pBlue=function(){
  var r=rnd(12),blue=(r+6)%12;
  return {lesson:[9,0],prompt:'Which note do you add to '+NAMES[r]+' minor pentatonic to make the blues scale?',
    choices:mkChoices(NAMES[blue],[NAMES[(r+5)%12],NAMES[(r+7)%12],NAMES[(r+4)%12],NAMES[(r+8)%12]]),
    explain:'The blue note is the ♭5, six semitones above the root. For '+NAMES[r]+' that is '+NAMES[blue]+'.'};
};
QB.pRel=function(){
  var r=rnd(12);
  if(rnd(2)) return {lesson:[10,1],prompt:NAMES[r]+' major pentatonic has the same five notes as which minor pentatonic?',
    choices:mkChoices(NAMES[(r+9)%12]+' minor pentatonic',[NAMES[(r+3)%12],NAMES[(r+2)%12],NAMES[(r+7)%12],NAMES[(r+10)%12]].map(function(x){return x+' minor pentatonic'})),
    explain:'The relative minor is three semitones below. '+NAMES[r]+' major pentatonic and '+NAMES[(r+9)%12]+' minor pentatonic hold the same notes.'};
  return {lesson:[10,1],prompt:NAMES[r]+' minor pentatonic has the same five notes as which major pentatonic?',
    choices:mkChoices(NAMES[(r+3)%12]+' major pentatonic',[NAMES[(r+9)%12],NAMES[(r+2)%12],NAMES[(r+7)%12],NAMES[(r+10)%12]].map(function(x){return x+' major pentatonic'})),
    explain:'The relative major is three semitones above. '+NAMES[r]+' minor pentatonic and '+NAMES[(r+3)%12]+' major pentatonic hold the same notes.'};
};
/* chapter 3 */
QB.mName=ql(11,0,function(){return QX.modeName()});
QB.mParent=ql(11,0,function(){return QX.modeParent()});
QB.mDiff=ql(12,0,function(){return QX.modeDiff()});
QB.mSpell=ql(11,1,function(){return QX.scaleSpell(MODE_POOL)});
QB.mDeg=ql(12,1,function(){return QX.scaleDegree(MODE_POOL)});
QB.mEar=ql(12,1,function(){return QX.scaleEar(['natural minor','dorian','mixolydian','lydian','phrygian','major'])});
/* chapter 4 */
function shapeRootName(shape,fret){return NAMES[pcOf(shape==='E'?5:4,fret)]}
QB.barre=ql(16,0,function(){return QX.barre()});
QB.bFret=function(){
  var shape=rnd(2)?'E':'A',r=rnd(12),f=shape==='E'?(r+8)%12:(r+3)%12;
  if(f===0) f=12; if(f>12||f<1) f=12;
  return {lesson:[shape==='E'?16:17,1],prompt:'Where does the barre go to play '+NAMES[r]+' major with the '+shape+' shape?',
    choices:numChoices(f,'Fret ',[1,2,3,4,5,6,7,8,9,10,11,12],1,12),
    explain:'The '+shape+' shape finds its root on the '+(shape==='E'?'low E':'A')+' string. '+NAMES[r]+' on that string is fret '+f+'.'};
};
QB.bRootString=function(){
  var shape=rnd(2)?'E':'A',ans=shape==='E'?'The low E string':'The A string';
  return {lesson:[shape==='E'?16:17,1],prompt:'In the '+shape+'-shape barre chord, which string carries the root?',
    choices:shuffle([{label:'The low E string',ok:ans==='The low E string'},{label:'The A string',ok:ans==='The A string'},{label:'The D string',ok:false},{label:'The B string',ok:false}]),
    explain:'The E shape has its root on the low E string. The A shape has its root on the A string and leaves the low E silent.'};
};
QB.bQual=function(){
  var shape=rnd(2)?'E':'A',f=1+rnd(9),minor=rnd(2)===1,cells=barreCells(shape,f,minor);
  var fr=shape==='E'?[f,f+2,f+2,minor?f:f+1,f,f]:[null,f,f+2,f+2,minor?f+1:f+2,f];
  var gs=cells.filter(function(c){return c[0]===(shape==='E'?2:1)})[0];
  var third=cells.filter(function(c){return c[0]===(shape==='E'?2:1)})[0];
  return {lesson:[18,0],prompt:'An '+shape+'-shape barre chord has the '+(shape==='E'?'G':'B')+' string at fret '+third[1]+' while the barre is at fret '+f+'. Is the chord major or minor?',
    choices:shuffle([{label:'Major',ok:!minor},{label:'Minor',ok:minor}]),
    explain:shape==='E'?'In the E shape the major third sits one fret above the barre on the G string. At the barre fret itself it is minor.':'In the A shape the major third is two frets above the barre on the B string. One fret above is minor.'};
};
QB.bMinorName=function(){
  var shape=rnd(2)?'E':'A',f=1+rnd(9),root=pcOf(shape==='E'?5:4,f);
  return {lesson:[18,0],prompt:'What chord is the '+shape+'-shape minor barre at fret '+f+'?',
    choices:mkChoices(NAMES[root]+'m',[NAMES[root],NAMES[(root+3)%12]+'m',NAMES[(root+7)%12]+'m',NAMES[(root+9)%12]]),
    explain:'The root on the '+(shape==='E'?'low E':'A')+' string at fret '+f+' is '+NAMES[root]+', and the minor shape makes it '+NAMES[root]+'m.'};
};
QB.bSame=function(){
  var r=rnd(12),fe=(r+8)%12||12,fa=(r+3)%12||12;
  return {lesson:[19,0],prompt:NAMES[r]+' major can be played at fret '+fe+' with the E shape. Where else can you play it?',
    choices:numChoices(fa,'Fret ',[1,2,3,4,5,6,7,8,9,10,11,12].filter(function(x){return x!==fe}),1,12).map(function(c){return c}),
    explain:'With the A shape the root is on the A string. '+NAMES[r]+' on the A string is fret '+fa+'. Same chord, different shape and place.'};
};
LEVELS.forEach(function(L){ if(L.id>=6){ /* quiz lists are set in each level file */ } });
