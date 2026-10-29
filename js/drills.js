/* Practice drill registry (first 27 drills) */
/* ---- register generators and modules ---- */
var T_TRI=['major','minor','pow'],T_QUAL=['major','minor','sus2','sus4','dom7','maj7','min7','dim','aug'],T_EXT=['add9','six','m7b5','dim7','aug','maj7','min7','dom7'];
var MODE_KEYS=MODES.map(function(m){return m.k});
QB.strings=function(){return QX.openStrings()};
QB.spellTri=function(){return QX.chordSpell(T_TRI)};
QB.spellQual=function(){return QX.chordSpell(T_QUAL)};
QB.formQual=function(){return QX.chordFormula(T_QUAL)};
QB.nameQual=function(){return QX.chordFromNotes(T_QUAL)};
QB.spellExt=function(){return QX.chordSpell(T_EXT)};
QB.formExt=function(){return QX.chordFormula(T_EXT)};
QB.nameExt=function(){return QX.chordFromNotes(T_EXT)};
QB.openBasic=function(){return QX.open(SH_BASIC)};
QB.openColor=function(){return QX.open(SH_COLOR)};
QB.barre=function(){return QX.barre()};
QB.earChord1=function(){return QX.chordEar(['major','minor'])};
QB.earChord2=function(){return QX.chordEar(['major','minor','dom7','maj7','min7'])};
QB.famMaj=function(){return QX.family(MAJ_FAM)};
QB.famMin=function(){return QX.family(MIN_FAM)};
QB.famSev=function(){return QX.family(SEV_FAM)};
QB.scSpell1=function(){return QX.scaleSpell(SP_BASIC)};
QB.scSpell2=function(){return QX.scaleSpell(SP_MORE)};
QB.scForm1=function(){return QX.scaleFormula(SP_MORE)};
QB.scMiss1=function(){return QX.scaleMissing(SP_MORE)};
QB.scDeg1=function(){return QX.scaleDegree(SP_MORE)};
QB.scClick1=function(){return QX.scaleClick(SP_MORE)};
QB.scEar1=function(){return QX.scaleEar(['major','natural minor'])};
QB.scEar2=function(){return QX.scaleEar(['major','natural minor','major pentatonic','minor pentatonic','blues'])};
QB.scEar3=function(){return QX.scaleEar(MODE_KEYS.concat(['harmonic minor','melodic minor']))};
QB.modeName=function(){return QX.modeName()};
QB.modeParent=function(){return QX.modeParent()};
QB.modeDiff=function(){return QX.modeDiff()};
QB.exSpell=function(){return QX.scaleSpell(SP_EXOT)};
QB.exForm=function(){return QX.scaleFormula(SP_EXOT)};
QB.exMiss=function(){return QX.scaleMissing(SP_EXOT)};
QB.exDeg=function(){return QX.scaleDegree(SP_EXOT)};
QB.timeSig=function(){return QX.timeSig()};
QB.rhythmEar=function(){return QX.rhythmEar()};

var TIER_OLD={hunt:'Beginner',names:'Beginner',fifths:'Beginner',chords:'Beginner',ear:'Beginner',minor:'Beginner',octaves:'Intermediate'};
PRACTICE.forEach(function(m){m.tier=TIER_OLD[m.id]||'Beginner'});
[
 {id:'tuner',name:'Tuner and Mic Check',desc:'See which note you are playing and how far off it is.',needs:0,kind:'tune',tier:'Beginner',rounds:0,
  primer:['This checks your microphone and doubles as a tuner. Everything that listens to you in Fretroad uses the same pitch detector.','Sit about an arm\'s length from the mic, pluck one string, and let it ring. The needle turns green when you are within 8 cents of the note.','Nothing is recorded or sent anywhere. The sound is analysed live in this page and thrown away.']},
 {id:'strings',name:'Open Strings',desc:'Know every open string by name and number.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['strings'],
  primer:['The six open strings are E A D G B E, from the thickest, lowest string up to the thinnest. Many players remember "Eddie Ate Dynamite, Good Bye Eddie".','String 1 is the thinnest (high E) and string 6 is the thickest (low E). It feels backwards until it does not.']},
 {id:'rhythm',name:'Time Signatures',desc:'Beats per bar, strong and weak beats, odd meters, and by ear.',needs:0,lv:1,rounds:10,tier:'Beginner',pool:['timeSig','timeSig','rhythmEar'],
  primer:['A time signature has two numbers. The top says how many pulses are in a bar, the bottom says which note gets one pulse. In 4/4 you count 1 2 3 4, with the strongest beat on 1.','Waltzes are 3/4. 6/8 feels like two rolling groups of three. Odd meters such as 7/8 are counted in uneven groups like 2+2+3.','The metronome button at the top of the page can play any of these. Try it before the ear questions.']},
 {id:'playnote',name:'Play the Note',desc:'The app names a note and listens for you to play it.',needs:1,kind:'note',type:'play',tier:'Beginner',rounds:8,
  primer:['You will be asked for a note name such as A. Play it on any string at any fret. The listener only cares about the note, not the octave.','Pluck cleanly and let it ring for about half a second. If it hears the wrong note it tells you which one it heard. Tap "Show on the neck" if you need a map.']},
 {id:'open',name:'Open Chord Shapes',desc:'Name the chord from its fingering on the neck.',needs:3,lv:3,rounds:10,tier:'Beginner',pool:['openBasic'],
  primer:['Open chords use open strings as part of the shape. Hollow rings mark open strings and a × means leave that string out.','The questions show a fingering and ask for the name. Press "Hear the shape" to compare it with what you know.']},
 {id:'spell',name:'Triad Spelling',desc:'Spell major, minor and power chords.',needs:3,lv:3,rounds:10,tier:'Beginner',pool:['spellTri'],
  primer:['A major chord is the root, a major third (4 semitones up) and a fifth (7). A minor chord drops the third to 3 semitones. A power chord is just the root and fifth.','Example: C major is C E G. C minor is C E♭ G, and C5 is C G.']},
 {id:'playchord',name:'Build the Chord',desc:'Play a chord one string at a time while the app checks every note.',needs:3,kind:'chord',type:'play',tier:'Beginner',rounds:5,pool:SH_BASIC,
  primer:['Instead of strumming, you build the chord one string at a time, lowest string first. The listener confirms each note before moving on.','That way you hear whether every finger is landing cleanly, which is the real purpose of practising chords.','Let each string ring until its chip turns green. If you hear a buzz, adjust the finger and pluck again.']},
 {id:'scales',name:'Scale Spelling',desc:'Spell major, minor and pentatonic scales in any key.',needs:2,lv:2,rounds:10,tier:'Intermediate',pool:['scSpell1','scSpell2','scMiss1','scForm1'],
  primer:['A scale is a recipe of steps. Major is whole whole half whole whole whole half (W W H W W W H), where a whole step is two frets and a half step is one.','Natural minor is W H W W H W W. Pentatonic scales keep five notes: major pentatonic is 1 2 3 5 6, minor pentatonic is 1 ♭3 4 5 ♭7.','Work out the notes by counting frets from the root, one step at a time.']},
 {id:'degrees',name:'Scale Degrees',desc:'Find the 3rd, ♭7 or any degree of a scale, by name and on the neck.',needs:3,lv:3,rounds:10,tier:'Intermediate',pool:['scDeg1','scClick1'],
  primer:['Degrees number the notes of a scale from the root. A ♭ means one fret below the major-scale note, a ♯ means one above.','In A natural minor the ♭3 is C and the ♭7 is G. The same idea carries over to every key, which is why players think in degrees.']},
 {id:'playscale',name:'Scale Runner',desc:'Pick a key and any scale, then play it note by note.',needs:2,kind:'scale',type:'play',tier:'Intermediate',rounds:2,
  primer:['Choose a key and a scale, then play its notes in order, ascending, descending or both. The board shows where every scale note lives.','Turn on the metronome and pick a slow tempo. Aim for one note per click, and nudge the tempo up when two clean runs in a row feel easy.']},
 {id:'ctypes',name:'Chord Qualities',desc:'Sus, 7th, maj7, m7, dim and aug: formulas and spellings.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['spellQual','formQual','nameQual'],
  primer:['Every chord type is a formula against the major scale. Sus2 swaps the third for a 2, sus4 for a 4. Adding a ♭7 gives a dominant 7th, a natural 7 gives major 7th.','Diminished is 1 ♭3 ♭5 and augmented is 1 3 ♯5. Learn the formulas and you can build any chord anywhere.']},
 {id:'cear',name:'Chord Ear',desc:'Hear major, minor, dominant 7th, major 7th and minor 7th.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['earChord1','earChord2','earChord2'],
  primer:['Major sounds bright and minor sounds darker. Add a ♭7 and you get a bluesy dominant 7th. A major 7th is smooth and dreamy, a minor 7th is mellow.','Play the chord twice, then once note by note, before you answer.']},
 {id:'fams',name:'Chord Families',desc:'Which chords belong to a major key, as Roman numerals.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['famMaj'],
  primer:['Stack thirds on each note of a major scale and you get seven chords: I ii iii IV V vi vii°. Upper case is major, lower case is minor, and ° is diminished.','In G major: G, Am, Bm, C, D, Em, F♯dim. Most songs live on I, IV, V and vi.']},
 {id:'barre',name:'Barre Chord Shapes',desc:'Read the E-shape and A-shape barre chords anywhere on the neck.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['barre'],
  primer:['Barre chords are open shapes moved up the neck with a finger across the strings. The root is the note on the lowest string you play.','The E-shape has its root on the low E string, the A-shape on the A string. Lift the third finger and the chord becomes minor.']},
 {id:'sear',name:'Scale Ear',desc:'Tell major from minor, pentatonic and blues by ear.',needs:4,lv:4,rounds:10,tier:'Intermediate',pool:['scEar1','scEar2','scEar2'],
  primer:['Listen to the third and the sixth. Major scales sound bright, minor scales sound sad. Pentatonics skip two notes so they sound open, and the blues scale adds one gritty note.']},
 {id:'modes',name:'The Modes',desc:'Dorian, Phrygian, Lydian, Mixolydian and friends.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['modeName','modeParent','modeDiff','scEar3'],
  primer:['A mode is the same seven notes started from a different one. D Dorian uses exactly the notes of C major but treats D as home.','Compared with major: Dorian has ♭3 ♭7, Phrygian ♭2 ♭3 ♭6 ♭7, Lydian ♯4, Mixolydian ♭7, Aeolian ♭3 ♭6 ♭7, Locrian ♭2 ♭3 ♭5 ♭6 ♭7.']},
 {id:'exotic',name:'Every Other Scale',desc:'Harmonic and melodic minor, blues, whole tone, diminished and more.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['exSpell','exForm','exMiss','exDeg'],
  primer:['Harmonic minor raises the 7th of natural minor. Melodic minor raises the 6th and 7th. The blues scale adds a ♭5 to minor pentatonic.','Whole tone is all whole steps, the two diminished scales alternate whole and half steps, and phrygian dominant is the flamenco sound.']},
 {id:'ext',name:'Extended Chords',desc:'add9, 6, m7♭5, dim7 and friends.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['spellExt','formExt','nameExt'],
  primer:['Add9 is a major chord plus the 9 (the same note as the 2). A 6th chord adds the major 6th. m7♭5 is a minor 7th with a flat fifth, and dim7 stacks minor thirds all the way.']},
 {id:'minfam',name:'Minor Key Families',desc:'Chords of a minor key, plus seventh-chord families.',needs:5,lv:5,rounds:10,tier:'Advanced',pool:['famMin','famSev'],
  primer:['A natural minor key gives i ii° ♭III iv v ♭VI ♭VII. In A minor: Am, Bdim, C, Dm, Em, F, G.','Add a seventh to each chord of a major key and you get Imaj7 iim7 iiim7 IVmaj7 V7 vim7 viiø7, the sound of jazz and soul.']},
 {id:'playcolor',name:'Colour Chords',desc:'Build 7th, sus and maj7 chords string by string.',needs:5,kind:'chord',type:'play',tier:'Advanced',rounds:5,pool:SH_COLOR,
  primer:['Same method as Build the Chord, with sevenths, suspended and major 7th shapes. Listen for the extra note that gives each chord its colour.']}
].forEach(function(m){PRACTICE.push(m)});
if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.PRACTICE=PRACTICE;
