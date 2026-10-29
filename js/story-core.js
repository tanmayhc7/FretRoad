/* Storylines: the lessons, puzzles and quizzes are the same in every story.
   A story only changes the narrator, the place names, the dialogue and the look of the map.
   To add a story, copy js/stories/road.js, change the text, and add a <script> tag in index.html. */
var STORIES={}, STORY_ORDER=[];
function registerStory(s){STORIES[s.id]=s; STORY_ORDER.push(s.id)}
function storyId(){return STORIES[save.story]?save.story:'road'}
function S(){return STORIES[storyId()]}
function placeName(id){var p=S().places[id]; if(p) return p; var l=LEVELS.filter(function(x){return x.id===id})[0]; return l?l.stop:('Stop '+id)}
function clearText(id){return S().clear[id]||'Stop cleared.'}
function chapterText(c){return S().chapters[c]||{h:'Chapter '+c,sub:''}}
function mentorName(){return S().mentor}

/* look of the map, per story */
var SCENE_DEFAULT=null;
function setStops(id,cols){var g=document.getElementById(id); if(!g) return; var st=g.querySelectorAll('stop'); cols.forEach(function(c,i){if(st[i]) st[i].setAttribute('stop-color',c)})}
function getStops(id){return Array.prototype.map.call(document.getElementById(id).querySelectorAll('stop'),function(s){return s.getAttribute('stop-color')})}
function captureScene(){
  if(SCENE_DEFAULT) return;
  SCENE_DEFAULT={sky:getStops('msky'),h1:getStops('mh1'),h2:getStops('mh2'),gr:getStops('mgr'),silo:'town'};
}
var SCENE_ART={};
var SILO={
  none:function(g){},
  town:function(g){[[240,404,44,26],[300,408,30,20],[560,398,52,30],[1010,380,40,24]].forEach(function(b){ mk('rect',{x:b[0],y:b[1]-b[3],width:b[2],height:b[3]},g); mk('polygon',{points:b[0]+','+(b[1]-b[3])+' '+(b[0]+b[2]/2)+','+(b[1]-b[3]-14)+' '+(b[0]+b[2])+','+(b[1]-b[3])},g)})},
  trees:function(g){[[120,420,30],[205,430,22],[330,412,34],[520,424,26],[700,404,36],[900,416,28],[1040,398,34],[1130,412,24]].forEach(function(t){
    mk('rect',{x:t[0]-3,y:t[1]-t[2]*.9,width:6,height:t[2]*.9},g);
    mk('circle',{cx:t[0],cy:t[1]-t[2]*1.1,r:t[2]*.8},g); mk('circle',{cx:t[0]-t[2]*.5,cy:t[1]-t[2]*.8,r:t[2]*.55},g); mk('circle',{cx:t[0]+t[2]*.5,cy:t[1]-t[2]*.8,r:t[2]*.55},g)})},
  city:function(g){[[160,404,36,92],[205,404,28,60],[250,404,40,120],[470,398,34,70],[515,398,44,104],[790,392,30,64],[830,392,40,118],[1000,384,34,80],[1045,384,46,110]].forEach(function(b){
    mk('rect',{x:b[0],y:b[1]-b[3],width:b[2],height:b[3]},g);
    for(var y=b[1]-b[3]+8;y<b[1]-8;y+=14) for(var x=b[0]+6;x<b[0]+b[2]-8;x+=11){ if(((x*7+y*3)%5)<2) mk('rect',{x:x,y:y,width:4,height:6,fill:'#ffd98a',opacity:'.75'},g); }})}
};
function applyScene(sc){
  captureScene(); var D=SCENE_DEFAULT; sc=sc||{};
  setStops('msky',sc.sky||D.sky); setStops('mh1',sc.h1||D.h1); setStops('mh2',sc.h2||D.h2); setStops('mgr',sc.gr||D.gr);
  var silo=document.getElementById('silo'); silo.innerHTML=''; silo.setAttribute('fill',sc.siloFill||'#0d0b28'); (SILO[sc.silo||'town'])(silo);
  ['h1','h2','h3'].forEach(function(id){var e=document.getElementById(id); if(e) e.style.display=sc.hills===false?'none':''});
  var ab=document.getElementById('artBack'),af=document.getElementById('artFront'); ab.innerHTML=''; af.innerHTML='';
  var A=sc.art&&SCENE_ART[sc.art]; if(A){ try{A.back(ab); A.front(af);}catch(e){ if(window.console) console.error('scene art',e); } }
  var sun=document.getElementById('moon'); sun.style.opacity=sc.sunOpacity===undefined?1:sc.sunOpacity;
  document.getElementById('moonDisc').setAttribute('fill',sc.sun||'#f5eefc'); document.getElementById('moonGlowStop').setAttribute('stop-color',sc.glow||'#f6e9ff');
  document.getElementById('craters').style.display=sc.craters===false?'none':'';
  document.getElementById('mstars').style.opacity=sc.stars===undefined?1:sc.stars;
  var r=sc.road||['#3a2f70','#0d0a26','#6d6592']; var u=document.querySelectorAll('#mapsvg use');
  if(u[0]) u[0].setAttribute('stroke',r[0]); if(u[1]) u[1].setAttribute('stroke',r[1]); if(u[2]) u[2].setAttribute('stroke',r[2]);
  document.getElementById('mapsvg').setAttribute('aria-label',(S().mapLabel||'Map')+', one landmark for each stop of the chapter');
}
function applyStory(){
  var s=S();
  document.body.setAttribute('data-story',s.id);
  var m=document.querySelectorAll('.mentor'); for(var i=0;i<m.length;i++) m[i].textContent=s.mentor;
  var av=document.querySelectorAll('svg.avatar'); for(var j=0;j<av.length;j++) av[j].innerHTML=s.avatar;
  var mk2=document.getElementById('van'); if(mk2) mk2.innerHTML=s.marker;
  applyScene(s.scene);
}
function storyIntro(){return S().intro}
function storyPraise(){return S().praise}
function storyMiss(){return S().miss}

/* chooser */
function showStoryPicker(first){
  var ov=$('#storyOverlay'), host=$('#storyCards'); host.innerHTML='';
  STORY_ORDER.forEach(function(id){
    var s=STORIES[id],b=document.createElement('button'); b.className='storycard'+(id===storyId()?' on':'');
    b.innerHTML='<span class="sw" style="background:'+s.swatch+'" aria-hidden="true"></span><strong>'+s.name+'</strong><span class="bl">'+s.blurb+'</span><span class="who">With '+s.mentorLong+'</span>';
    b.addEventListener('click',function(){
      save.story=id; persist(); ov.hidden=true; applyStory(); drawMap(); updateStat();
      if(first){save.intro=true; persist(); startTalk(storyIntro());}
      else toast('Story changed to '+s.name+'. Your progress is kept.');
    });
    host.appendChild(b);
  });
  $('#storyClose').hidden=!!first;
  ov.hidden=false; var f=host.querySelector('.storycard'); if(f) f.focus();
}
