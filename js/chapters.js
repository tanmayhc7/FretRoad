/* Chapters: which stops belong together, which are unlocked, and the chapter tabs on the map */
var CHAPTERS=[
  {id:1,levels:[1,2,3,4,5]},
  {id:2,levels:[6,7,8,9,10]},
  {id:3,levels:[11,12,13,14,15]},
  {id:4,levels:[16,17,18,19]}
];
var viewCh=-1;
var T_CH1=[.11,.36,.6,.78,.9];
function stopT(ch,i){ if(ch.id===1) return T_CH1[i]; var n=ch.levels.length; return .13+.77*i/(n-1); }
function chapterIxOf(id){for(var i=0;i<CHAPTERS.length;i++){ if(CHAPTERS[i].levels.indexOf(id)>-1) return i; } return 0;}
function chapterDone(ix){return CHAPTERS[ix].levels.every(isPassed)}
function chapterOpen(ix){return ix===0||chapterDone(ix-1)}
function currentChapterIx(){for(var i=0;i<CHAPTERS.length;i++){ if(!chapterDone(i)) return i; } return CHAPTERS.length-1;}
var unlocked=function(id){var ix=chapterIxOf(id),ch=CHAPTERS[ix],i=ch.levels.indexOf(id); return chapterOpen(ix)&&(i===0||isPassed(ch.levels[i-1]));};
var dest=function(id){return (isDone(id)&&!isPassed(id))?'quiz-'+id:'stop-'+id};
var currentId=function(){for(var i=0;i<LEVELS.length;i++){ if(!isPassed(LEVELS[i].id)&&unlocked(LEVELS[i].id)) return LEVELS[i].id; } return null;};
function drawChapterHead(){
  var ch=CHAPTERS[viewCh], t=chapterText(ch.id);
  $('#chH').innerHTML='Chapter '+ch.id+'<br>'+t.h; $('#chSub').textContent=t.sub;
  var tabs=$('#chTabs'); tabs.innerHTML='';
  CHAPTERS.forEach(function(c,i){
    var open=chapterOpen(i),b=document.createElement('button'); b.className='chtab'+(i===viewCh?' on':'')+(chapterDone(i)?' done':''); b.disabled=!open;
    b.textContent=(chapterDone(i)?'✓ ':'')+c.id; b.setAttribute('aria-label','Chapter '+c.id+(open?'':', locked')+(chapterDone(i)?', cleared':'')); b.title=chapterText(c.id).h;
    b.addEventListener('click',function(){viewCh=i; drawMap(); showChapterIntroOnce();});
    tabs.appendChild(b);
  });
}
function showChapterIntroOnce(){
  var c=CHAPTERS[viewCh];
  if(c.id>1&&chapterOpen(viewCh)&&(save.chSeen||[]).indexOf(c.id)<0&&S().chIntro[c.id]){
    save.chSeen=(save.chSeen||[]).concat([c.id]); persist(); startTalk(S().chIntro[c.id]);
  }
}
