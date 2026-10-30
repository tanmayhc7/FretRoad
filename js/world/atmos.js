/* Atmosphere for the worlds: haze bands between depth layers, soft focus on distant layers, and a few
   story-specific extras (milky way and shore lights on the road, searchlights and horizon glow in the city,
   wide soft light shafts in the jungle). Runs after a world is built; changes only how it is lit. */
var ATMOS={
  road:{fog:[[760,565,110,'#3a62c8',.08],[520,690,120,'#1a2a7a',.09],[300,805,110,'#02040f',.35]]},
  city:{fog:[[900,650,220,'#ff8a5c',.26],[540,730,170,'#9a5ad0',.20],[380,810,130,'#ffb070',.15]]},
  jungle:{fog:[[720,450,260,'#c4ecc4',.13],[470,610,230,'#9ad8b0',.11],[220,770,170,'#7bc89a',.09]]}
};
function wFog(cam,z,y,h,color,op,idx){
  return wLayer(cam,z,8+idx*6,function(g,d){
    var id='fog'+z, lg=se('linearGradient',{id:id,x1:0,y1:0,x2:0,y2:1},d);
    se('stop',{offset:0,'stop-color':color,'stop-opacity':0},lg); se('stop',{offset:.5,'stop-color':color,'stop-opacity':op},lg); se('stop',{offset:1,'stop-color':color,'stop-opacity':0},lg);
    var m=se('g',{class:idx%2?'mist':'mist2'},g); se('rect',{x:-500,y:y-h,width:2600,height:h*2,fill:'url(#'+id+')'},m);
  },'wl-fog');
}
var WL_MOVING='.lbeam,.car,.lamp,.moth,.neon,.beam,.sway,.sway2,.ray,.cloud,.mist,.mist2,.tw,.plane,.blink,.crownglow';
function wSoftFocus(){
  /* the sky layer twinkles as a whole (cheap), instead of animating hundreds of stars one by one */
  var top=WORLD_RT.layers.slice().sort(function(a,b){return b.dataset.z-a.dataset.z})[0]; if(top) top.classList.add('wl-twinkle');
  if(innerWidth<700) return;
  WORLD_RT.layers.forEach(function(d){ var z=+d.dataset.z; if(z>450&&z<850&&!/wl-fog/.test(d.className)&&!d.querySelector(WL_MOVING)) d.style.filter='blur('+Math.min(2.2,(z-430)/230).toFixed(1)+'px)'; });
}
var ATMOS_EXTRA={
  road:function(cam){
    var R=wrng(77);
    /* milky way: a soft diagonal band of dust and fine stars */
    wLayer(cam,980,4,function(g,d){
      var f=se('filter',{id:'mwb',x:'-20%',y:'-50%',width:'140%',height:'200%'},d); se('feGaussianBlur',{stdDeviation:38},f);
      var lg=se('linearGradient',{id:'mwg',x1:0,y1:0,x2:1,y2:0},d); [[0,'#8fa8ff',0],[.5,'#dbe6ff',.26],[1,'#8fa8ff',0]].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},lg)});
      se('ellipse',{cx:560,cy:250,rx:760,ry:70,fill:'url(#mwg)',transform:'rotate(-24 560 250)',filter:'url(#mwb)'},g);
      for(var i=0;i<170;i++){var t=R()*2-1, x=560+t*680*Math.cos(.42)+(R()-.5)*120, y=250+t*680*Math.sin(-.42)+(R()-.5)*90; se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:(.35+R()*.7).toFixed(2),fill:'#fff',opacity:(.25+R()*.55).toFixed(2)},g);}
    });

    /* moonlit cloud banks with a cool lining */
    wLayer(cam,930,6,function(g,d){
      wCloud(g,d,780,120,820,220,[.62,.72,.95],.2,4); wCloud(g,d,-100,230,760,190,[.5,.6,.88],.15,12); wCloud(g,d,300,40,900,160,[.55,.66,.92],.1,21,'.004 .012');
    });
    /* ripples on the sea, longer and brighter towards the viewer, with the moon's glitter path */
    wLayer(cam,600,18,function(g){
      for(var i=0;i<160;i++){ var t=R(), y=574+t*t*190, len=14+t*150*(.4+R()), x=R()*1700-50; se('rect',{x:x.toFixed(0),y:y.toFixed(1),width:len.toFixed(0),height:(.8+t*1.6).toFixed(1),rx:1,fill:'#7fa0ff',opacity:(.05+t*.16).toFixed(2)},g); }
      for(var k=0;k<70;k++){ var tt=R(), yy=572+tt*tt*200, w=10+tt*90*R(), gx=1370+(R()-.5)*(30+tt*160); se('rect',{x:(gx-w/2).toFixed(0),y:yy.toFixed(1),width:w.toFixed(0),height:(1+tt*2.2).toFixed(1),rx:1,fill:'#eef4ff',opacity:(.25+R()*.55).toFixed(2)},g); }
    });
    /* foreground grass silhouette */
    wLayer(cam,40,80,function(g){
      for(var i=0;i<210;i++){ var x=R()*1800-100, h=40+R()*110*(.4+R()), b=(R()-.5)*34; se('path',{d:'M'+x.toFixed(0)+' 940 Q'+(x+b*.4).toFixed(0)+' '+(940-h*.6).toFixed(0)+' '+(x+b).toFixed(0)+' '+(940-h).toFixed(0)+' Q'+(x+b*.5+3).toFixed(0)+' '+(940-h*.55).toFixed(0)+' '+(x+5).toFixed(0)+' 940Z',fill:i%3?'#02040c':'#030610'},g); }
    });
    /* lights of a far shore town, with their reflections */
    wLayer(cam,610,17,function(g){
      for(var i=0;i<46;i++){var x=640+R()*820, y=553+R()*8; if(x>1100&&x<1260) continue; var warm=R()<.75; se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:(1+R()*1.4).toFixed(1),fill:warm?'#ffd48a':'#ffe9c0',opacity:(.55+R()*.4).toFixed(2),class:R()<.3?'tw':''},g);
        se('rect',{x:(x-1).toFixed(0),y:(y+6).toFixed(0),width:2,height:(8+R()*18).toFixed(0),fill:'#ffd48a',opacity:.16},g);}
    });
  },
  city:function(cam){

    /* street-level bokeh and traffic streaks on the avenues */
    wLayer(cam,70,64,function(g,d){
      var bf=se('filter',{id:'cbk',x:'-50%',y:'-50%',width:'200%',height:'200%'},d); se('feGaussianBlur',{stdDeviation:5},bf);
      var R=wrng(31), cols=['#ffb36a','#ff6fa8','#6fd8ff','#ffe28a','#ff8a5c'];
      for(var i=0;i<46;i++){ var x=R()*1700-50,y=770+R()*150,r=6+R()*22; se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:r.toFixed(1),fill:cols[Math.floor(R()*cols.length)],opacity:(.1+R()*.22).toFixed(2),filter:'url(#cbk)'},g); }
      for(var k=0;k<30;k++){ var yy=868+R()*40, xx=R()*1500, ww=40+R()*220; se('rect',{x:xx.toFixed(0),y:yy.toFixed(0),width:ww.toFixed(0),height:(1.4+R()*1.8).toFixed(1),rx:1,fill:R()<.5?'#ffd6a0':'#ff5a5a',opacity:(.18+R()*.3).toFixed(2)},g); }
    });
    /* horizon glow behind the skyline and two slow searchlights */
    wLayer(cam,985,3,function(g,d){
      var rg=se('radialGradient',{id:'cGlow',cx:.5,cy:1,r:.75},d); [[0,'#ff9a5c',.55],[.45,'#d0508a',.28],[1,'#3a1a6a',0]].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},rg)});
      se('ellipse',{cx:800,cy:900,rx:1150,ry:520,fill:'url(#cGlow)'},g);
      var bg=se('linearGradient',{id:'cBeam',x1:0,y1:1,x2:0,y2:0},d); se('stop',{offset:0,'stop-color':'#d8f0ff','stop-opacity':.38},bg); se('stop',{offset:1,'stop-color':'#d8f0ff','stop-opacity':0},bg);
      [[260,-14],[1360,12]].forEach(function(b,i){ se('polygon',{points:b[0]+',900 '+(b[0]-26)+',-60 '+(b[0]+26)+',-60',fill:'url(#cBeam)',class:'beam','style':'transform-origin:'+b[0]+'px 900px;animation-duration:'+(15+i*5)+'s;animation-delay:-'+(i*6)+'s;mix-blend-mode:screen'},g); });
    });
  },
  jungle:function(cam){

    /* ground detail: dappled sun, leaf litter, moss, dew */
    wLayer(cam,110,50,function(g,d){
      var R=wrng(63);
      var sg=se('radialGradient',{id:'jSun'},d); se('stop',{offset:0,'stop-color':'#fff3b0','stop-opacity':.55},sg); se('stop',{offset:1,'stop-color':'#fff3b0','stop-opacity':0},sg);
      for(var i=0;i<26;i++){ var x=R()*1700-50,y=760+R()*150,rx=24+R()*70; se('ellipse',{cx:x.toFixed(0),cy:y.toFixed(0),rx:rx.toFixed(0),ry:(rx*.32).toFixed(0),fill:'url(#jSun)',opacity:(.5+R()*.5).toFixed(2)},g); }
      var litter=['#5a3a1c','#7a4f24','#3a2a14','#8a6a2c','#4a3a18'];
      for(var k=0;k<150;k++){ var lx=R()*1700-50,ly=800+R()*130,a=Math.floor(R()*360); se('use',{href:'#jL1',fill:litter[Math.floor(R()*5)],transform:'translate('+lx.toFixed(0)+','+ly.toFixed(0)+') rotate('+a+') scale('+(.28+R()*.4).toFixed(2)+')',opacity:(.5+R()*.4).toFixed(2)},g); }
      for(var m=0;m<9;m++){ var mx=R()*1600,my=860+R()*50; se('ellipse',{cx:mx.toFixed(0),cy:my.toFixed(0),rx:(30+R()*60).toFixed(0),ry:(8+R()*10).toFixed(0),fill:'#3d7a34',opacity:.35},g); se('ellipse',{cx:(mx-6).toFixed(0),cy:(my-3).toFixed(0),rx:(18+R()*40).toFixed(0),ry:5,fill:'#6fb04a',opacity:.28},g); }
      for(var q=0;q<40;q++){ se('circle',{cx:(R()*1600).toFixed(0),cy:(300+R()*560).toFixed(0),r:(.8+R()*1.4).toFixed(1),fill:'#fff9d0',opacity:(.3+R()*.6).toFixed(2),class:'tw'},g); }
    });
    /* wide, soft shafts of light coming through the canopy */
    wLayer(cam,690,12,function(g,d){
      var f=se('filter',{id:'jrb',x:'-20%',y:'-20%',width:'140%',height:'140%'},d); se('feGaussianBlur',{stdDeviation:16},f);
      var lg=se('linearGradient',{id:'jrg',x1:0,y1:0,x2:0,y2:1},d); se('stop',{offset:0,'stop-color':'#fff7c4','stop-opacity':.55},lg); se('stop',{offset:1,'stop-color':'#fff7c4','stop-opacity':0},lg);
      [[260,-90],[610,-60],[980,-100],[1330,-50]].forEach(function(r,i){ se('polygon',{points:r[0]+',-60 '+(r[0]+110)+',-60 '+(r[0]+r[1]*-1+170)+',900 '+(r[0]+r[1]*-1-110)+',900',fill:'url(#jrg)',filter:'url(#jrb)',class:'ray','style':'animation-delay:-'+(i*2.2)+'s;mix-blend-mode:screen'},g); });
    });
  }
};
(function(){
  var orig=setWorld;
  setWorld=function(id){
    orig(id); var a=ATMOS[id], cam=document.getElementById('wcam'); if(!a||!cam) return;
    try{ if(ATMOS_EXTRA[id]) ATMOS_EXTRA[id](cam); a.fog.forEach(function(f,i){wFog(cam,f[0],f[1],f[2],f[3],f[4],i)}); wSoftFocus(); if(typeof applyPrefs==='function'){ applyPrefs(); motionProbe(); } }catch(e){ if(window.console) console.error('atmos',e); }
  };
})();
