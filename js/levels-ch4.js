/* Chapter 4: two chord shapes that slide up the neck (E-shape and A-shape barre chords). */
function barreCells(shape,fret,minor){ /* [string,fret] for each sounding string */
  var f=fret, fr;
  if(shape==='E') fr=[f,f+2,f+2,minor?f:f+1,f,f];                 /* low E to high E */
  else fr=[-1,f,f+2,f+2,minor?f+1:f+2,f];
  var out=[]; fr.forEach(function(x,i){ if(x>=0) out.push([5-i,x]); }); return out;
}
function showBarre(b,shape,fret,minor,play){
  b.clearOrbs(); b.clearLinks();
  var cells=barreCells(shape,fret,minor), rootS=shape==='E'?5:4;
  cells.forEach(function(c){dOrb(b,c[0],c[1],(c[0]===rootS)?'root':'tone')});
  cells.sort(function(a,b2){return b2[0]-a[0]});
  if(play) strum(cells.map(function(c){return OPEN[c[0]]+c[1]}),.05);
  return NAMES[pcOf(rootS,fret)]+(minor?'m':'');
}
LEVELS.push(
makeLevel({id:16,title:'The E Shape Slides',desc:'Find the notes of A major in an E-shape barre chord at fret 5.',frets:[5,7],goal:[9,1,4],roots:null,unit:'chord notes found',
  want:'We want A, C♯ or E.',outMsg:'Stay between frets 5 and 7.',chime:[57,61,64,69],
  pre:'Take the open E chord and slide it up five frets and you get A major. Find A, C♯ and E between frets 5 and 7. There are six of them, one per string.',
  post:'Six notes, one on each string: frets 5, 7, 7, 6, 5, 5. That is the E-shape barre chord, and the root sits on the low E string.',
  lesson:[
   {title:'The open E, moved',text:'The open E major chord uses three open strings. Slide the whole shape up and your first finger lays across the neck like a movable nut, taking over the open strings. This is a barre. The chord is named by the note under the barre on the low E string.',
    demo:function(b){showBarre(b,'E',0,false)},
    actions:[{label:'Hear open E',fn:function(b){showBarre(b,'E',0,false,true)}},{label:'Slide to fret 5: A',fn:function(b){showBarre(b,'E',5,false,true)}}]},
   {title:'Name it by the low E',text:'The low E string note is the root. Fret 3 is G, fret 5 is A, fret 7 is B, fret 8 is C. Learn those and you can play any major chord with this shape.',
    demo:function(b){showBarre(b,'E',5,false)},
    actions:[{label:'Fret 3: G',fn:function(b){showBarre(b,'E',3,false,true)}},{label:'Fret 5: A',fn:function(b){showBarre(b,'E',5,false,true)}},{label:'Fret 7: B',fn:function(b){showBarre(b,'E',7,false,true)}},{label:'Fret 8: C',fn:function(b){showBarre(b,'E',8,false,true)}}]}
  ],
  quiz:['barre','bFret','bRootString','bQual','bSame'],
  reveal:{title:'The E-shape barre',text:'One finger lays flat across all six strings, the rest copy the open E. Press the button to hear A major, then B major, from the same shape.',
    hear:function(){showBarre(boardL,'E',5,false,true); setTimeout(function(){showBarre(boardL,'E',7,false,true)},1200)}}}),
makeLevel({id:17,title:'The A Shape Slides',desc:'Find the notes of D major in an A-shape barre chord at fret 5.',frets:[5,7],strs:[4,3,2,1,0],goal:[2,9,6],roots:null,unit:'chord notes found',
  want:'We want D, A or F♯.',outMsg:'Stay between frets 5 and 7, and skip the low E string.',chime:[62,66,69],
  pre:'The A shape has its root on the A string and does not use the low E string. At fret 5 the chord is D major. Find D, A and F♯ between frets 5 and 7, on the five thinnest strings.',
  post:'Five notes: 5, 7, 7, 7, 5. Three fingers fit under one another on fret 7, and the barre holds the ends.',
  lesson:[
   {title:'The open A, moved',text:'The open A major chord does the same trick. Slide it up and a barre takes over the open strings. The root now sits on the A string, and the low E string stays silent.',
    demo:function(b){showBarre(b,'A',0,false)},
    actions:[{label:'Hear open A',fn:function(b){showBarre(b,'A',0,false,true)}},{label:'Slide to fret 5: D',fn:function(b){showBarre(b,'A',5,false,true)}}]},
   {title:'Name it by the A string',text:'The A string note is the root. Fret 3 is C, fret 5 is D, fret 7 is E, fret 10 is G. Pair it with the E shape and you can play any major chord in two places.',
    demo:function(b){showBarre(b,'A',5,false)},
    actions:[{label:'Fret 3: C',fn:function(b){showBarre(b,'A',3,false,true)}},{label:'Fret 5: D',fn:function(b){showBarre(b,'A',5,false,true)}},{label:'Fret 7: E',fn:function(b){showBarre(b,'A',7,false,true)}},{label:'Fret 10: G',fn:function(b){showBarre(b,'A',10,false,true)}}]}
  ],
  quiz:['barre','bFret','bRootString','bQual','bSame'],
  reveal:{title:'The A-shape barre',text:'Same idea, root on the A string. Press the button to hear D major, then E major, from the same shape.',
    hear:function(){showBarre(boardL,'A',5,false,true); setTimeout(function(){showBarre(boardL,'A',7,false,true)},1200)}}}),
makeLevel({id:18,title:'One Finger Lifts',desc:'Find the notes of A minor in an E-minor-shape barre chord at fret 5.',frets:[5,7],goal:[9,0,4],roots:null,unit:'chord notes found',
  want:'We want A, C or E.',outMsg:'Stay between frets 5 and 7.',chime:[57,60,64],
  pre:'Lift one finger off the E shape and the chord turns minor. Find A, C and E between frets 5 and 7. It matches the major chord except for one string.',
  post:'Six notes: 5, 7, 7, 5, 5, 5. Only the G string moved, from fret 6 to fret 5, and the chord went from major to minor.',
  lesson:[
   {title:'One note moves',text:'In the E-shape barre, the third finger sits on the G string. Lift it and the G string plays one fret lower, so the major third (C♯) becomes the minor third (C).',
    demo:function(b){showBarre(b,'E',5,true)},
    actions:[{label:'Hear A major',fn:function(b){showBarre(b,'E',5,false,true)}},{label:'Hear A minor',fn:function(b){showBarre(b,'E',5,true,true)}}]},
   {title:'The same trick in the A shape',text:'In the A-shape barre, the major third is on the B string at fret 7 (F♯ in the chord D). Move it down to fret 6 and you have D minor.',
    demo:function(b){showBarre(b,'A',5,true)},
    actions:[{label:'Hear D major',fn:function(b){showBarre(b,'A',5,false,true)}},{label:'Hear D minor',fn:function(b){showBarre(b,'A',5,true,true)}}]}
  ],
  quiz:['barre','bFret','bQual','bMinorName','bSame'],
  reveal:{title:'Major to minor',text:'One finger moved one fret. Press the buttons to hear it switch back and forth.',
    hear:function(){showBarre(boardL,'E',5,false,true); setTimeout(function(){showBarre(boardL,'E',5,true,true)},1200)}}}),
makeLevel({id:19,title:'Two Homes for Every Chord',desc:'Find the two places a G root lives: the low E string and the A string.',frets:[0,12],strs:[5,4],goal:[7],roots:null,unit:'G roots found',
  want:'We want a G.',outMsg:'Look on the low E and the A string only.',chime:[55,59,62],
  pre:'Every major chord can be played with the E shape or the A shape. Find the G on the low E string, then the G on the A string.',
  post:'G on the low E is fret 3. G on the A string is fret 10. The same chord in two places, with different shapes.',
  lesson:[
   {title:'Two shapes, two roots',text:'The E shape finds its root on the low E string. The A shape finds its root on the A string. For any chord, find the root on both strings and you have two ways to play it.',
    demo:function(b){showBarre(b,'E',3,false)},
    actions:[{label:'G with the E shape (fret 3)',fn:function(b){showBarre(b,'E',3,false,true)}},{label:'G with the A shape (fret 10)',fn:function(b){showBarre(b,'A',10,false,true)}}]},
   {title:'Pick the closest one',text:'Both are G major. Pick whichever is closest to where your hand already is. That is how songs move around the neck without big jumps.',
    demo:function(b){b.clearOrbs();b.clearLinks(); dOrb(b,5,3,'root'); dOrb(b,4,10,'root'); b.link([5,3],[4,10],'same chord, two homes',true)},
    actions:[{label:'Hear them in turn',fn:function(b){showBarre(b,'E',3,false,true); setTimeout(function(){showBarre(b,'A',10,false,true)},1300)}}]}
  ],
  quiz:['barre','bFret','bRootString','bQual','bSame'],
  reveal:{title:'Chapter 4 done',text:'You can play any major or minor chord, anywhere. Press the button to hear G major in both places.',
    hear:function(){showBarre(boardL,'E',3,false,true); setTimeout(function(){showBarre(boardL,'A',10,false,true)},1300)}}})
);
