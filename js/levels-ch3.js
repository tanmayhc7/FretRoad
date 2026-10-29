/* Chapter 3: modes. Everything is built on A so the notes line up with C major: A natural minor, Dorian, Mixolydian, Lydian, Phrygian. */
function whiteNotes(){return [0,2,4,5,7,9,11]}
LEVELS.push(
makeLevel({id:11,title:'Seven Notes, Home on A',desc:'Find the A natural minor notes between frets 5 and 8.',frets:[5,8],goal:[9,11,0,2,4,5,7],roots:[9],unit:'scale notes found',
  want:'We want a note from A, B, C, D, E, F or G (no sharps or flats).',outMsg:'Stay between frets 5 and 8.',chime:[57,60,64,69],
  pre:'Every note without a sharp or flat counts: A B C D E F G. Find all of them between frets 5 and 8.',
  post:'Sixteen notes, the same ones as C major. When you start on A, you are playing A natural minor. This idea is the whole chapter.',
  lesson:[
   {title:'One set of seven notes',text:'C major is C D E F G A B. Start the same seven notes on A and you get A B C D E F G: A natural minor. The notes did not change. Only the note you treat as home did.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0],[4,2],[4,3],[4,5],[4,7],[4,8],[4,10]].forEach(function(c,i){dOrb(b,c[0],c[1],i===0?'root':'scale')})},
    actions:[{label:'Hear A natural minor',fn:function(b){playSeq(b,[[4,0],[4,2],[4,3],[4,5],[4,7],[4,8],[4,10]],330)}}]},
   {title:'A mode is a home change',text:'Starting the same seven notes on a different note is called a mode. There are seven modes. In this chapter we start four of them on A, and each one changes only one note compared to its parent.',
    demo:function(b){showScale(b,9,'natural minor',5,8)},
    actions:[{label:'Play it from A',fn:function(b){hearScale(scaleCells(9,'natural minor',5,8),200)}}]}
  ],
  quiz:['mName','mParent','mDiff','mSpell','mEar'],
  reveal:{title:'Same notes, new home',text:'C major and A natural minor share every note. Only the home changes, and with it the mood. Press the button to hear A natural minor.',
    hear:function(){hearScale(scaleCells(9,'natural minor',5,8),190)}}}),
makeLevel({id:12,title:'The Lifted Sixth',desc:'Find the F♯ that turns A minor into A Dorian.',frets:[0,12],goal:[6],roots:[9],unit:'sixths found',
  want:'We want an F♯, the raised 6th of A Dorian.',outMsg:'Stay inside the first twelve frets.',chime:[57,63,66],
  pre:'Dorian is natural minor with one note raised: the 6th. In A that is F♯, not F. Find every F♯ in the first twelve frets.',
  post:'Six F♯ notes. Put one next to an A minor chord and you get the cool, funky Dorian sound.',
  lesson:[
   {title:'One note changes',text:'A natural minor has an F. A Dorian raises it to F♯. Everything else is identical. The raised 6th is what gives Dorian its brighter, funkier colour.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,2,'scale'],[4,3,'scale'],[4,5,'scale'],[4,7,'scale'],[4,9,'found'],[4,10,'scale']].forEach(function(c){dOrb(b,c[0],c[1],c[2],c[1]===9?'♮6':undefined)})},
    actions:[{label:'Hear A Dorian',fn:function(b){playSeq(b,[[4,0],[4,2],[4,3],[4,5],[4,7],[4,9],[4,10]],330)}},{label:'Hear A minor',fn:function(b){playSeq(b,[[4,0],[4,2],[4,3],[4,5],[4,7],[4,8],[4,10]],330)}}]},
   {title:'Where to hear it',text:'Dorian is minor with a lift. It is the sound of Santana, Daft Punk and many funk grooves. Play it over a minor chord and lean on the raised 6th.',
    demo:function(b){showScale(b,9,'dorian',5,8,{hot:[6]})},
    actions:[{label:'Play the box',fn:function(b){hearScale(scaleCells(9,'dorian',5,8),200)}}]}
  ],
  quiz:['mName','mDiff','mSpell','mDeg','mEar'],
  reveal:{title:'Dorian',text:'Minor, with a bright 6th. It works over minor 7 chords. Press the button to hear the scale across the box.',
    hear:function(){hearScale(scaleCells(9,'dorian',5,8),190)}}}),
makeLevel({id:13,title:'The Flat Seventh',desc:'Find the G that makes A major sound bluesy.',frets:[0,12],goal:[7],roots:[9],unit:'flat sevenths found',
  want:'We want a G, the ♭7 of A Mixolydian.',outMsg:'Stay inside the first twelve frets.',chime:[57,61,67],
  pre:'Mixolydian is a major scale with a lowered 7th. In A that is G, not G♯. Find every G in the first twelve frets.',
  post:'Seven Gs, including the open G string. Play A major with a G in it and you hear the sound of classic rock and the blues.',
  lesson:[
   {title:'One note drops',text:'A major has a G♯. A Mixolydian drops it to G. All the other notes match A major. The flat seventh keeps the bright major sound but takes away the sense of finishing.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,2,'scale'],[4,4,'scale'],[4,5,'scale'],[4,7,'scale'],[4,9,'scale'],[4,10,'found']].forEach(function(c){dOrb(b,c[0],c[1],c[2],c[1]===10?'♭7':undefined)})},
    actions:[{label:'Hear A Mixolydian',fn:function(b){playSeq(b,[[4,0],[4,2],[4,4],[4,5],[4,7],[4,9],[4,10]],330)}},{label:'Hear A major',fn:function(b){playSeq(b,[[4,0],[4,2],[4,4],[4,5],[4,7],[4,9],[4,11]],330)}}]},
   {title:'Where to hear it',text:'Mixolydian is the sound of rock riffs and dominant 7 chords. If a song has a major feel but ends on a flat seventh, it is Mixolydian.',
    demo:function(b){showScale(b,9,'mixolydian',4,8,{hot:[7]})},
    actions:[{label:'Play the box',fn:function(b){hearScale(scaleCells(9,'mixolydian',4,8),200)}}]}
  ],
  quiz:['mName','mDiff','mSpell','mDeg','mEar'],
  reveal:{title:'Mixolydian',text:'Major, with a flat 7th. It matches dominant 7 chords. Press the button to hear it.',
    hear:function(){hearScale(scaleCells(9,'mixolydian',4,8),190)}}}),
makeLevel({id:14,title:'The Raised Fourth',desc:'Find the D♯ that makes A major float.',frets:[0,12],goal:[3],roots:[9],unit:'raised fourths found',
  want:'We want a D♯, the ♯4 of A Lydian.',outMsg:'Stay inside the first twelve frets.',chime:[57,63,66],
  pre:'Lydian is a major scale with a raised 4th. In A that is D♯, not D. Find every D♯ in the first twelve frets.',
  post:'Six D♯ notes. The same note you used as the blue note in Chapter 2, now a floating major colour.',
  lesson:[
   {title:'One note rises',text:'A major has a D. A Lydian raises it to D♯. That one sharp makes major sound open and dreamy instead of grounded. Film composers use it a lot.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,2,'scale'],[4,4,'scale'],[4,6,'found'],[4,7,'scale'],[4,9,'scale'],[4,11,'scale']].forEach(function(c){dOrb(b,c[0],c[1],c[2],c[1]===6?'♯4':undefined)})},
    actions:[{label:'Hear A Lydian',fn:function(b){playSeq(b,[[4,0],[4,2],[4,4],[4,6],[4,7],[4,9],[4,11]],330)}},{label:'Hear A major',fn:function(b){playSeq(b,[[4,0],[4,2],[4,4],[4,5],[4,7],[4,9],[4,11]],330)}}]},
   {title:'Where to hear it',text:'Lydian is bright with no dark corners. The raised 4th leans up instead of resolving down. Think of dreamy film themes.',
    demo:function(b){showScale(b,9,'lydian',4,8,{hot:[3]})},
    actions:[{label:'Play the box',fn:function(b){hearScale(scaleCells(9,'lydian',4,8),200)}}]}
  ],
  quiz:['mName','mDiff','mSpell','mDeg','mEar'],
  reveal:{title:'Lydian',text:'Major, with a raised 4th. Press the button to hear it.',
    hear:function(){hearScale(scaleCells(9,'lydian',4,8),190)}}}),
makeLevel({id:15,title:'The Flat Second',desc:'Find the B♭ that makes A minor sound Spanish.',frets:[0,12],goal:[10],roots:[9],unit:'flat seconds found',
  want:'We want a B♭ (A♯), the ♭2 of A Phrygian.',outMsg:'Stay inside the first twelve frets.',chime:[57,58,64],
  pre:'Phrygian is natural minor with a lowered 2nd. In A that is B♭ (also written A♯), not B. Find every one in the first twelve frets.',
  post:'Six B♭ notes. One fret above the A, and the whole scale turns dark and a little Spanish.',
  lesson:[
   {title:'One note drops',text:'A natural minor has a B. A Phrygian drops it to B♭, just one fret above the root. That small step down to the root is the core of flamenco and metal riffs.',
    demo:function(b){b.clearOrbs();b.clearLinks(); [[4,0,'root'],[4,1,'found'],[4,3,'scale'],[4,5,'scale'],[4,7,'scale'],[4,8,'scale'],[4,10,'scale']].forEach(function(c){dOrb(b,c[0],c[1],c[2],c[1]===1?'♭2':undefined)})},
    actions:[{label:'Hear A Phrygian',fn:function(b){playSeq(b,[[4,0],[4,1],[4,3],[4,5],[4,7],[4,8],[4,10]],330)}},{label:'Hear A minor',fn:function(b){playSeq(b,[[4,0],[4,2],[4,3],[4,5],[4,7],[4,8],[4,10]],330)}}]},
   {title:'Where to hear it',text:'Phrygian is the darkest of the minor sounds. Play the root, then the note a fret above it, and go back down. It is a tension you can feel.',
    demo:function(b){showScale(b,9,'phrygian',0,5,{hot:[10]})},
    actions:[{label:'Play the low part',fn:function(b){hearScale(scaleCells(9,'phrygian',0,5,[5,4,3]),220)}}]}
  ],
  quiz:['mName','mDiff','mSpell','mDeg','mEar'],
  reveal:{title:'Phrygian',text:'Minor, with a ♭2. It is dark and tense. Press the button to hear it.',
    hear:function(){hearScale(scaleCells(9,'phrygian',0,5),190)}}})
);
