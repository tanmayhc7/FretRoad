/* Header controls and the router */
/* chrome */
$('#snd').addEventListener('click',function(){soundOn=!soundOn; this.setAttribute('aria-pressed',soundOn); this.textContent=soundOn?'Sound on':'Sound off'; if(soundOn){initAudio();}});
$('#home').addEventListener('click',function(){location.hash='map'; route();});
$('#back').addEventListener('click',function(){location.hash='map'});
$('#back2').addEventListener('click',function(){location.hash='map'});
$('#warmBtn').addEventListener('click',function(){location.hash='warmup'});
$('#prefBtn').addEventListener('click',openPrefs);
$('#tourBtn').addEventListener('click',function(){tourStart()});
$('#goSandbox').addEventListener('click',function(){location.hash='sandbox'});
$('#replay').addEventListener('click',function(){startTalk(storyIntro(),null,S().startBtn)});
$('#storyBtn').addEventListener('click',function(){showStoryPicker(false)});
$('#storyClose').addEventListener('click',function(){$('#storyOverlay').hidden=true});
var resetArm=null;
$('#reset').addEventListener('click',function(){
  var b=this;
  if(!resetArm){b.textContent='Press again to erase progress'; resetArm=setTimeout(function(){resetArm=null; b.textContent='Reset progress'},3000); return;}
  clearTimeout(resetArm); resetArm=null; b.textContent='Reset progress'; save={done:[],passed:[],best:{},intro:true,story:save.story,chSeen:[]}; viewCh=-1; persist(); drawMap(); updateStat(); toast('Progress reset.');
});
document.addEventListener('pointerdown',function(){initAudio()},{once:true});
function route(){
  var h=location.hash.slice(1);
  if(h==='sandbox') return showSandbox();
  if(h==='songs') return showSongs();
  if(h==='warmup') return showWarm();
  var mj=/^jam-(.+)$/.exec(h); if(mj) return showJam(mj[1]);
  var m=/^stop-(\d+)$/.exec(h);
  if(m&&unlocked(+m[1])&&LEVELS.some(function(l){return l.id===+m[1]})) return showLevel(+m[1]);
  var mq=/^quiz-(\d+)$/.exec(h);
  if(mq){var qid=+mq[1]; if(LEVELS.some(function(l){return l.id===qid})&&unlocked(qid)){ if(isDone(qid)) return showQuiz(qid); location.hash='stop-'+qid; return; }}
  var mp=/^practice-([a-z]+)$/.exec(h);
  if(mp&&PRACTICE.some(function(M){return M.id===mp[1]})) return showPractice(mp[1]);
  showMap();
}
addEventListener('hashchange',route);
route();
