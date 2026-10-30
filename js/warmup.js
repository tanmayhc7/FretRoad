/* Daily 5-minute warm-up: ten short steps (six timed exercises, four quick questions), shuffled by day. */
var W={steps:[],i:0,seed:0,t:0,timer:0,score:0,asked:0,seedBump:0};
function dayKey(){var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function srand(seed){var s=seed>>>0||1; return function(){s=(s*1664525+1013904223)>>>0; return s/4294967296;};}
function sshuffle(a,r){a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;} return a;}
var WARM_DO=[
 {id:'spider',name:'Spider walk',secs:45,text:function(r){return 'Slowly at 60 bpm, play frets 1-2-3-4 on the low E string, then the same on the A string, and so on up to the high E, one finger per fret. Keep your thumb behind the neck.'}},
 {id:'chrom',name:'Chromatic climb',secs:40,text:function(r){return 'On the B string, play every fret from 1 to 12 with alternate picking, then come back down. Even volume, no rushing. 70 bpm.'}},
 {id:'chg',name:'Chord change sprint',secs:50,chords:true,text:function(r){return 'Switch between the two chords every four beats. Strum once per beat and keep the rhythm going even if a change is messy.'}},
 {id:'pent',name:'Pentatonic box',secs:45,text:function(r){var k=NAMES[Math.floor(r()*12)]; return 'Play the '+k+' minor pentatonic box 1 up and down in eighth notes at 72 bpm. Say each note name out loud as you play it.'}},
 {id:'skip',name:'String skipping',secs:40,text:function(r){return 'Pick the low E, then the D, then the A, then the G, then the D, then the B. Skipping strings trains your picking hand to aim. 66 bpm.'}},
 {id:'alt',name:'Alternate picking',secs:40,text:function(r){return 'On the open G string, play eighth notes strictly down-up-down-up for the whole timer. Start at 60 bpm and add 4 bpm if it feels easy.'}},
 {id:'barre',name:'Barre hold',secs:40,text:function(r){return 'Hold an F barre chord (1st fret) for 10 seconds, rest for 5, repeat. Roll your index finger slightly onto its bony edge and keep your wrist low.'}},
 {id:'strum',name:'Strum pattern',secs:50,text:function(r){var c=['G','C','D','Em','Am'][Math.floor(r()*5)]; return 'Hold '+c+' and strum down, rest, down-up, rest, up-down-up. Count "1 and 2 and 3 and 4 and" and keep your hand moving like a pendulum. 80 bpm.'}},
 {id:'scale',name:'Major scale',secs:45,text:function(r){var k=NAMES[Math.floor(r()*12)]; return 'Play the '+k+' major scale for one octave, up and down, starting on the A string or the low E string. Name the notes as you go.'}},
 {id:'trill',name:'Hammer-ons and pull-offs',secs:40,text:function(r){return 'On the B string, hammer on from fret 5 to 7 and pull off again without picking. Then try 5 to 8. The notes should be as loud as the picked one.'}},
 {id:'stretch',name:'Finger stretch',secs:35,text:function(r){return 'On the low E string, put fingers 1 and 4 at frets 5 and 8, hold the shape, and slide the pair up one fret at a time to fret 12. Relax between slides.'}},
 {id:'arp',name:'Arpeggio picking',secs:45,text:function(r){return 'Hold Am and pick the strings in the order 5, 3, 2, 1, 2, 3 at a steady 76 bpm. Let the notes ring into each other.'}},
 {id:'ring',name:'Ring every note',secs:35,text:function(r){return 'Fret a C chord and pick each string one at a time. Every string should ring clean. If one buzzes, adjust that finger rather than pressing harder.'}},
 {id:'slide',name:'Slides',secs:35,text:function(r){return 'On the G string, slide from fret 2 to 5 and back, keeping steady pressure. Then slide from 5 to 7. Aim to land exactly on the fret.'}}
];
function warmQuiz(r){
  var kind=Math.floor(r()*6), p, s, f, ans, opts;
  var names=NAMES;
  function mc(prompt,correct,opts,exp){ opts=sshuffle(opts.filter(function(x,i,a){return a.indexOf(x)===i&&x!==correct}),r).slice(0,3); opts.push(correct); opts=sshuffle(opts,r); return {quiz:true,prompt:prompt,opts:opts,ans:opts.indexOf(correct),exp:exp}; }
  if(kind===0){ s=Math.floor(r()*6); f=1+Math.floor(r()*12); p=pcOf(s,f); return mc('Which note is on fret '+f+' of the '+SNAME[s]+' string?',names[p],[names[(p+1)%12],names[(p+11)%12],names[(p+2)%12],names[(p+7)%12]],'Fret '+f+' is '+f+' semitones above '+names[pcOf(s,0)]+'.'); }
  if(kind===1){ var iv=[[3,'minor third'],[4,'major third'],[5,'fourth'],[7,'fifth'],[12,'octave']], c=iv[Math.floor(r()*iv.length)]; return mc('How many semitones (frets) are in a '+c[1]+'?',''+c[0],['2','3','4','5','7','12'],'A '+c[1]+' is '+c[0]+' semitones.'); }
  if(kind===2){ var k=Math.floor(r()*12); return mc('What is the third note of the '+names[k]+' major scale?',names[(k+4)%12],[names[(k+3)%12],names[(k+5)%12],names[(k+2)%12],names[(k+7)%12]],'The third degree is 4 semitones above the root.'); }
  if(kind===3){ var k2=Math.floor(r()*12); return mc('Which three notes make a '+names[k2]+' major chord?',names[k2]+', '+names[(k2+4)%12]+', '+names[(k2+7)%12],[names[k2]+', '+names[(k2+3)%12]+', '+names[(k2+7)%12],names[k2]+', '+names[(k2+5)%12]+', '+names[(k2+7)%12],names[k2]+', '+names[(k2+4)%12]+', '+names[(k2+8)%12]],'A major triad is root, major third (4 semitones) and fifth (7).'); }
  if(kind===4){ s=1+Math.floor(r()*5); var o=pcOf(s,0), up=1+Math.floor(r()*11); return mc('Starting on the open '+SNAME[s]+' string ('+names[o]+'), which note is at fret '+up+'?',names[(o+up)%12],[names[(o+up+1)%12],names[(o+up+11)%12],names[(o+up+2)%12],names[(o+up+10)%12]],'Add '+up+' semitones to '+names[o]+'.'); }
  var m2=Math.floor(r()*12); return mc('What is the relative minor of '+names[m2]+' major?',names[(m2+9)%12]+' minor',[names[(m2+3)%12]+' minor',names[(m2+4)%12]+' minor',names[(m2+8)%12]+' minor',names[(m2+7)%12]+' minor'],'The relative minor sits 3 semitones below, which is 9 above.');
}
function warmBuild(bump){
  var d=dayKey(), n=0; for(var i=0;i<d.length;i++) n=(n*31+d.charCodeAt(i))>>>0; var r=srand(n+bump*7919);
  var dos=sshuffle(WARM_DO,r).slice(0,6).map(function(x){return {id:x.id,name:x.name,secs:x.secs,text:x.text(r),chords:x.chords}});
  var qs=[0,1,2,3].map(function(){return warmQuiz(r)});
  var order=[], di=0, qi=0; /* interleave: D D Q D D Q D D Q D Q... roughly ten steps */
  var pat='DDQDDQDQDQ'; pat.split('').forEach(function(c){ order.push(c==='D'?dos[di++]:qs[qi++]); });
  while(di<6) order.push(dos[di++]);
  return order.filter(Boolean).slice(0,10);
}
function showWarm(){
  showView('warm'); warmStart(false);
}
function warmStart(again){
  if(again) W.seedBump++; W.steps=warmBuild(W.seedBump); W.i=0; W.score=0; W.asked=0; warmRender();
}
function warmStop(){ clearInterval(W.timer); W.timer=0; if(typeof BK!=='undefined'&&BK.on) bkStop(); }
function warmRender(){
  warmStop(); var host=$('#warmRoot'), st=W.steps[W.i]; host.innerHTML='';
  var w=save.warm||{streak:0,total:0,last:''};
  var head=document.createElement('div'); head.className='jam-head'; head.innerHTML='<button class="btn" id="wBack">Back to the map</button><div><h1>Daily warm-up</h1><p class="jsub">Five minutes, ten steps. '+(w.streak?w.streak+(w.streak===1?' day':' days')+' in a row.':'Start a streak today.')+'</p></div>';
  host.appendChild(head); head.querySelector('#wBack').addEventListener('click',function(){warmStop(); location.hash='map'});
  var dots=document.createElement('div'); dots.className='wdots'; W.steps.forEach(function(_,i){var b=document.createElement('i'); b.className=i<W.i?'done':(i===W.i?'on':''); dots.appendChild(b)}); host.appendChild(dots);
  if(!st){ return warmDone(host); }
  var card=document.createElement('div'); card.className='gcard wcard'; host.appendChild(card);
  if(st.quiz){
    card.innerHTML='<span class="lab">Quick question '+(W.i+1)+' of '+W.steps.length+'</span><h2></h2><div class="wopts"></div><p class="wexp" hidden></p><div class="row"></div>';
    card.querySelector('h2').textContent=st.prompt; var box=card.querySelector('.wopts'), done=false;
    st.opts.forEach(function(o,i){ var b=document.createElement('button'); b.className='btn wopt'; b.textContent=o; b.addEventListener('click',function(){
      if(done) return; done=true; W.asked++; var ok=i===st.ans; if(ok) W.score++; b.classList.add(ok?'ok':'no'); box.children[st.ans].classList.add('ok');
      var e=card.querySelector('.wexp'); e.hidden=false; e.textContent=(ok?'Right. ':'Not quite. ')+st.exp; mkBtn(card.querySelector('.row'),'Next','primary',function(){W.i++; warmRender()}); }); box.appendChild(b); });
  } else {
    card.innerHTML='<span class="lab">Exercise '+(W.i+1)+' of '+W.steps.length+'</span><h2></h2><p class="wtext"></p><div class="wchords"></div><div class="wtimer" id="wTimer"></div><div class="row"></div>';
    card.querySelector('h2').textContent=st.name; card.querySelector('.wtext').textContent=st.text;
    if(st.chords){ var r=srand(W.i*13+W.seedBump+dayKey().length+W.steps.length), pairs=[['G','C'],['C','Am'],['D','G'],['Em','A'],['Am','Dm'],['E','A'],['G','Em'],['D','A']], pr=pairs[Math.floor(r()*pairs.length)]; st.pair=pr; var cc=card.querySelector('.wchords'); pr.forEach(function(c){var d=document.createElement('div'); d.innerHTML='<b>'+c+'</b>'+chordDiagram(c,{w:92}); cc.appendChild(d)}); var inf=changeInfo(pr[0],pr[1]); card.querySelector('.wtext').textContent+=' '+inf.tip; }
    var left=st.secs, tm=card.querySelector('#wTimer'); tm.textContent=left+'s';
    var row=card.querySelector('.row'), go=mkBtn(row,'Start the timer','primary',function(){
      if(W.timer){ warmStop(); go.textContent='Resume'; return; }
      go.textContent='Pause'; initAudio();
      if(st.chords&&st.pair){ bkStart({bpm:72,bpc:4,bpb:4,style:'click',seq:st.pair,loop:true,countIn:0,vol:.7}); }
      else bkStart({bpm:/\b(\d\d) bpm/.test(st.text)?+/\b(\d\d) bpm/.exec(st.text)[1]:70,bpc:4,bpb:4,style:'click',seq:['C'],loop:true,countIn:0,vol:.6});
      W.timer=setInterval(function(){ left--; tm.textContent=Math.max(0,left)+'s'; if(left<=0){ warmStop(); tm.textContent='Done'; go.hidden=true; mkBtn(row,'Next','primary',function(){W.i++; warmRender()}); } },1000);
    });
    mkBtn(row,'Skip','quiet',function(){W.i++; warmRender()});
  }
}
function warmDone(host){
  var today=dayKey(), w=save.warm||(save.warm={streak:0,total:0,last:''});
  if(w.last!==today){ var y=new Date(); y.setDate(y.getDate()-1); var yk=y.getFullYear()+'-'+('0'+(y.getMonth()+1)).slice(-2)+'-'+('0'+y.getDate()).slice(-2); w.streak=(w.last===yk)?w.streak+1:1; w.total++; w.last=today; persist(); }
  var c=document.createElement('div'); c.className='gcard wcard'; c.innerHTML='<span class="lab">Finished</span><h2>Warm-up done.</h2><p class="wtext"></p><div class="row"></div>';
  c.querySelector('.wtext').textContent=(W.asked?W.score+' of '+W.asked+' questions right. ':'')+w.streak+(w.streak===1?' day':' days')+' in a row, '+w.total+' warm-ups in total. Come back tomorrow for a new mix.';
  mkBtn(c.querySelector('.row'),'Another mix','',function(){warmStart(true)}); mkBtn(c.querySelector('.row'),'Back to the map','primary',function(){location.hash='map'}); host.appendChild(c);
}
