/* Chapter 2: the pentatonic box, taken apart. Everything here is in A minor pentatonic (A C D E G). */
var PENT=['minor pentatonic'];
LEVELS.push(
makeLevel({id:6,title:'Five Notes, Twelve Places',desc:'Find the A minor pentatonic notes between frets 5 and 8.',frets:[5,8],goal:[9,0,2,4,7],roots:[9],unit:'box notes found',
  want:'We want A, C, D, E or G.',chime:[57,60,62,64],
  pre:'Now fill the box. The gold ghosts are the A notes. Find every A, C, D, E and G between frets 5 and 8.',
  post:'Twelve notes: two on every string. That shape is box one, and you have just built it from the five notes.',
  lesson:[
   {title:'Five notes, not seven',text:'A minor pentatonic keeps five notes of the minor scale: A, C, D, E and G. The word means five notes. Dropping two notes leaves the ones that sound good almost everywhere.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,3,'scale'],[4,5,'scale'],[4,7,'scale'],[4,10,'scale']].forEach(function(c){dOrb(b,c[0],c[1],c[2])})},
    actions:[{label:'Hear the five notes',fn:function(b){playSeq(b,[[4,0],[4,3],[4,5],[4,7],[4,10]],520)}}]},
   {title:'The box',text:'Lay those five notes across all six strings between frets 5 and 8 and you get two notes on every string. That shape is called box one. The gold notes are the As.',
    demo:function(b){showScale(b,9,'minor pentatonic',5,8)},
    actions:[{label:'Play the box upward',fn:function(b){hearScale(scaleCells(9,'minor pentatonic',5,8))}}]}
  ],
  quiz:['pSpell','pDeg','pBoxCount','pBoxRoot','pClick'],
  reveal:{title:'Box one',text:'Two notes per string, twelve in all. The low E and the high E strings hold the same two notes, an octave and a bit apart. Press the button to hear it climb.',
    hear:function(){hearScale(scaleCells(9,'minor pentatonic',5,8),230)}}}),
makeLevel({id:7,title:'What Each Note Does',desc:'Find the minor third inside the box.',frets:[5,8],goal:[0],roots:[9],unit:'minor thirds found',
  want:'We want a C, the minor third of A.',chime:[57,60,64],
  pre:'Every note in the box has a job. Find the C: it is the minor third, the note that makes the scale minor. You can find it on three strings.',
  post:'Three Cs, one on the low E, one on the G and one on the high E. They are always three frets above an A, which is the minor third.',
  lesson:[
   {title:'Names for the five notes',text:'Count in semitones from the root. A is 1. C is three above, the ♭3. D is five above, the 4. E is seven above, the 5. G is ten above, the ♭7. So the pentatonic formula is 1, ♭3, 4, 5, ♭7.',
    demo:function(b){showScale(b,9,'minor pentatonic',5,8,{intervals:true})},
    actions:[{label:'Hear it from the root',fn:function(b){hearScale(scaleCells(9,'minor pentatonic',5,8,[5,4]))}}]},
   {title:'The jobs',text:'The root is home. The 5 is the strong, stable note, like in a power chord. The ♭3 gives the minor colour. The ♭7 and the 4 add the bluesy pull. Light up the ♭3 and listen.',
    demo:function(b){showScale(b,9,'minor pentatonic',5,8,{intervals:true,hot:[0]})},
    actions:[{label:'Hear the root and ♭3',fn:function(b){playSeq(b,[[5,5],[5,8]],600)}},{label:'Hear root and 5th',fn:function(b){playSeq(b,[[5,5],[4,7]],600)}}]}
  ],
  quiz:['pDegreeOf','pFormula','pDeg','pEarMinor','pSpell'],
  reveal:{title:'The minor third',text:'A C above an A is the one note that decides the mood. Swap it for C♯ and the scale turns bright. Press the button to hear root, then ♭3.',
    hear:function(){playSeq(boardL,[[5,5],[5,8]],600)}}}),
makeLevel({id:8,title:'Box Two',desc:'Slide up and fill the next box, frets 7 to 10.',frets:[7,10],goal:[9,0,2,4,7],roots:[9],unit:'box notes found',
  want:'We want A, C, D, E or G.',chime:[60,62,64,67],
  pre:'Box two sits two frets higher: frets 7 to 10. Find all the notes of A minor pentatonic in it.',
  post:'Another twelve notes. Some were in box one too: the frets that overlap are the doorway between the boxes.',
  lesson:[
   {title:'The next box up',text:'Box one lives at frets 5 to 8. Move up and the notes you used last on each string become the first notes of the next shape. Box two covers frets 7 to 10. Box two is shown in gold, and the blue notes are box one.',
    demo:function(b){showScale(b,9,'minor pentatonic',5,10); scaleCells(9,'minor pentatonic',7,10).forEach(function(c){var pc=pcOf(c[0],c[1]); b.orb('d'+c[0]+','+c[1],{s:c[0],f:c[1],label:NAMES[pc],kind:pc===9?'root':'tone'})})},
    actions:[{label:'Play box two',fn:function(b){hearScale(scaleCells(9,'minor pentatonic',7,10))}}]},
   {title:'Shared notes',text:'The two boxes share the notes at frets 7 and 8. Those are your doorway: finish a lick in box one, slide into box two without changing the notes.',
    demo:function(b){showScale(b,9,'minor pentatonic',5,10); scaleCells(9,'minor pentatonic',7,8).forEach(function(c){dOrb(b,c[0],c[1],'found')})},
    actions:[{label:'Play the shared notes',fn:function(b){hearScale(scaleCells(9,'minor pentatonic',7,8),200)}}]}
  ],
  quiz:['pSpell','pBoxRoot','pClick','pFormula','pBoxCount'],
  reveal:{title:'Boxes link up',text:'Five boxes cover the whole neck, each starting where the last one ends. Press the button to hear box one, then box two.',
    hear:function(){hearScale(scaleCells(9,'minor pentatonic',5,8),200); setTimeout(function(){hearScale(scaleCells(9,'minor pentatonic',7,10),200)},3000)}}}),
makeLevel({id:9,title:'The Blue Note',desc:'Find the ♭5 that turns the box into the blues scale.',frets:[4,9],goal:[3],roots:[9],unit:'blue notes found',
  want:'We want a D♯, the ♭5 of A.',chime:[57,63,64],
  pre:'One extra note makes the blues. It is D♯, the ♭5 of A, sitting between the D and the E. Find it between frets 4 and 9.',
  post:'Three of them: B string fret 4, A string fret 6 and G string fret 8. Play the 4, then the ♭5, then the 5 and it slides from tension into rest.',
  lesson:[
   {title:'One note in between',text:'The blues scale is the minor pentatonic plus one passing note: the ♭5. In A that is D♯, a fret above the D and a fret below the E. On the A string, that is fret 6.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,3,'scale'],[4,5,'scale'],[4,6,'found'],[4,7,'scale'],[4,10,'scale']].forEach(function(c){dOrb(b,c[0],c[1],c[2],c[1]===6?'♭5':undefined)})},
    actions:[{label:'Hear D, ♭5, E',fn:function(b){playSeq(b,[[4,5],[4,6],[4,7]],420)}}]},
   {title:'Use it as a passing note',text:'The ♭5 is not a place to rest. Slide through it. Play 4, ♭5, 5 and you have the best-known sound in the blues.',
    demo:function(b){showScale(b,9,'blues',5,8,{hot:[3],intervals:true})},
    actions:[{label:'Play the blues scale',fn:function(b){hearScale(scaleCells(9,'blues',5,8,[5,4,3]),230)}}]}
  ],
  quiz:['bSpell','bDeg','pBlue','bClick','bEar'],
  reveal:{title:'The blue note',text:'Six notes now: 1, ♭3, 4, ♭5, 5, ♭7. The ♭5 is only ever a passing note. Press the button to hear the 4, the ♭5 and the 5.',
    hear:function(){playSeq(boardL,[[4,5],[4,6],[4,7]],420)}}}),
makeLevel({id:10,title:'The Bright Twin',desc:'The same box, three frets lower, is A major pentatonic.',frets:[2,5],goal:[9,11,1,4,6],roots:[9],unit:'box notes found',
  want:'We want A, B, C♯, E or F♯.',chime:[57,61,64,66],
  pre:'Slide the box three frets down and the sound brightens. Find the A major pentatonic notes (A B C♯ E F♯) between frets 2 and 5.',
  post:'Same shape, twelve notes again. A major pentatonic and F♯ minor pentatonic are the same five notes with a different home.',
  lesson:[
   {title:'Major pentatonic',text:'Major pentatonic is 1, 2, 3, 5, 6. In A that is A, B, C♯, E, F♯. It is the sound of country and folk: open and sweet, with no dark note in it.',
    demo:function(b){showScale(b,9,'major pentatonic',2,5,{intervals:true})},
    actions:[{label:'Hear A major pentatonic',fn:function(b){hearScale(scaleCells(9,'major pentatonic',2,5),230)}}]},
   {title:'Same shape, new home',text:'The shape at frets 2 to 5 is the same box you learned, just three frets lower. Its notes are shared by F♯ minor pentatonic. A major and F♯ minor are relatives: they hold the same notes, so one box does both jobs.',
    demo:function(b){showScale(b,6,'minor pentatonic',2,5)},
    actions:[{label:'Play it as F♯ minor',fn:function(b){hearScale(scaleCells(6,'minor pentatonic',2,5),230)}}]}
  ],
  quiz:['pRel','pSpell','pDeg','pEarMajor','pClick'],
  reveal:{title:'One box, two moods',text:'Play the box from the F♯ and it sounds minor; play it from the A and it sounds major. The notes never changed, only where you call home.',
    hear:function(){hearScale(scaleCells(6,'minor pentatonic',2,5),180)}}})
);
