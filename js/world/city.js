/* New York night world: starry sky, crescent moon, drifting cloud, hazy far skyline, a lit mid skyline,
   the Empire State Building in 3D-style tiers (lit front, dark side, light top) with a colour-changing crown,
   sweeping searchlights, a passing plane, shooting stars and near rooftops with water tanks and steam. */
(function(){
  function defs(d,R){
    function lg(id,stops,x2,y2){var g=se('linearGradient',{id:id,x1:0,y1:0,x2:x2||0,y2:y2===undefined?1:y2},d); stops.forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]===undefined?1:s[2]},g)}); return g;}
    lg('nFront',[[0,'#aab0d8'],[.5,'#6d74a8'],[1,'#3c4276']],1,0);
    lg('nSide',[[0,'#2c3260'],[1,'#12163a']],0,1);
    lg('nTop',[[0,'#d8dcf4'],[1,'#9aa0cc']],1,1);
    lg('nFar',[[0,'#3a3f86'],[1,'#1a1d56']]);
    lg('nMid',[[0,'#242964'],[1,'#0e1138']]);
    lg('nNear',[[0,'#10122f'],[1,'#05061a']]);
    lg('nBeam',[[0,'#e8f0ff',.55],[1,'#e8f0ff',0]]);
    var rg=se('radialGradient',{id:'nGlow'},d); se('stop',{offset:0,'stop-color':'#fff2c0','stop-opacity':.9},rg); se('stop',{offset:.4,'stop-color':'#ffd98a','stop-opacity':.3},rg); se('stop',{offset:1,'stop-color':'#ffd98a','stop-opacity':0},rg);
    var mg=se('radialGradient',{id:'nMoon'},d); se('stop',{offset:0,'stop-color':'#fff6dc','stop-opacity':.5},mg); se('stop',{offset:1,'stop-color':'#fff6dc','stop-opacity':0},mg);
    /* three window patterns with random lit windows */
    ['nWa','nWb','nWc'].forEach(function(id,k){
      var p=se('pattern',{id:id,width:30,height:34,patternUnits:'userSpaceOnUse'},d);
      for(var r=0;r<5;r++) for(var c=0;c<5;c++) if(R()<.5+k*.04){ var t=R(); se('rect',{x:2+c*5.8,y:2+r*6.6,width:3.4,height:4.4,fill:t<.62?'#ffd98a':(t<.82?'#ffb067':(t<.93?'#bfe0ff':'#fff6dc')),opacity:(.45+R()*.55).toFixed(2)},p); }
    });
    lg('nGlass',[[0,'#ffffff',.14],[.35,'#ffffff',0],[1,'#000020',.35]]);
  }
  function tank(g,x,y,s){var t=se('g',{transform:'translate('+x+','+y+') scale('+(s||1)+')'},g);
    se('rect',{x:-16,y:-40,width:32,height:36,rx:2,fill:'#3a2216'},t); se('path',{d:'M-18 -40 L0 -56 L18 -40Z',fill:'#241409'},t);
    [-9,0,9].forEach(function(o){se('line',{x1:o,y1:-38,x2:o,y2:-6,stroke:'#120a05','stroke-width':1.2},t)});
    [-12,12].forEach(function(o){se('line',{x1:o,y1:-4,x2:o,y2:10,stroke:'#0a0603','stroke-width':2},t)}); }
  function skyline(g,R,y0,n,wmin,wmax,hmin,hmax,fill,lit,x0,x1,beacon){
    var x=x0; while(x<x1){var w=wmin+R()*(wmax-wmin),h=hmin+R()*(hmax-hmin);
      se('rect',{x:x,y:y0-h,width:w,height:h+400,fill:fill},g);
      if(lit){ se('rect',{x:x,y:y0-h,width:w,height:h,fill:'url(#nGlass)'},g); se('rect',{x:x,y:y0-h,width:1.6,height:h,fill:'rgba(255,255,255,.12)'},g);
        if(R()<.7) se('rect',{x:x+w*.18,y:y0-h-7,width:w*.36,height:7,fill:fill},g); if(R()<.35) se('rect',{x:x+w*.6,y:y0-h-4,width:w*.2,height:4,fill:fill},g);
        for(var bnd=0;bnd<Math.floor(h/150);bnd++) se('rect',{x:x,y:y0-h+40+bnd*150,width:w,height:2.2,fill:'rgba(0,0,10,.28)'},g); }
      if(lit) se('rect',{x:x,y:y0-h,width:w,height:h,fill:'url(#'+['nWa','nWb','nWc'][Math.floor(R()*3)]+')',opacity:lit},g);
      if(R()<.25) tank(g,x+w*.3,y0-h,.9);
      if(R()<.3){se('line',{x1:x+w/2,y1:y0-h,x2:x+w/2,y2:y0-h-30-R()*30,stroke:'#8a90c8','stroke-width':1.4},g); if(beacon) se('circle',{cx:x+w/2,cy:y0-h-34,r:2.4,fill:'#ff4d4d',class:'blink','style':'animation-delay:-'+(R()*2).toFixed(1)+'s'},g);}
      x+=w+2+R()*4;}
  }
  function tier(g,cx,by,w,h,cls){var d=w*.2,x0=cx-w/2;
    se('polygon',{points:(x0+w)+','+by+' '+(x0+w+d)+','+(by-d*.5)+' '+(x0+w+d)+','+(by-h-d*.5)+' '+(x0+w)+','+(by-h),fill:'url(#nSide)'},g);
    se('polygon',{points:(x0+w)+','+by+' '+(x0+w+d)+','+(by-d*.5)+' '+(x0+w+d)+','+(by-h-d*.5)+' '+(x0+w)+','+(by-h),fill:'url(#nWc)',opacity:.45},g);
    se('rect',{x:x0,y:by-h,width:w,height:h,fill:'url(#nFront)'},g);
    se('rect',{x:x0,y:by-h,width:w,height:h,fill:'url(#nWa)',opacity:.85},g);
    for(var i=1;i<Math.floor(w/22);i++) se('rect',{x:x0+i*22-1.5,y:by-h,width:3,height:h,fill:'rgba(255,255,255,.14)'},g);
    se('polygon',{points:x0+','+(by-h)+' '+(x0+w)+','+(by-h)+' '+(x0+w+d)+','+(by-h-d*.5)+' '+(x0+d)+','+(by-h-d*.5),fill:'url(#nTop)'},g);
    se('rect',{x:x0,y:by-h,width:w,height:h,fill:'#ffd98a',opacity:0,class:cls||'wash'},g);
  }
  WORLD.city=function(cam){
    var R=wrng(77),Rs=wrng(5);
    /* sky: stars, moon, drifting cloud, shooting stars */
    wLayer(cam,1000,5,function(g,d){defs(d,R);
      for(var i=0;i<320;i++){var big=Rs()<.07; var s=se('circle',{cx:(Rs()*1700-50).toFixed(0),cy:(Rs()*620).toFixed(0),r:big?(1.6+Rs()*1.2).toFixed(1):(.5+Rs()*.9).toFixed(1),fill:Rs()<.15?'#ffd9a8':(Rs()<.2?'#bfd8ff':'#fff'),class:'tw','style':'animation-delay:-'+(Rs()*5).toFixed(1)+'s;animation-duration:'+(2+Rs()*4).toFixed(1)+'s'},g);
        if(big){se('path',{d:'M'+(+s.getAttribute('cx')-7)+' '+s.getAttribute('cy')+' h14 M'+s.getAttribute('cx')+' '+(+s.getAttribute('cy')-7)+' v14',stroke:'rgba(255,255,255,.55)','stroke-width':.8,class:'tw'},g);}}
      se('circle',{cx:260,cy:160,r:190,fill:'url(#nMoon)'},g);
      wMoon(g,d,260,160,52,{x:22,y:-12});
      for(var k=0;k<3;k++) se('line',{x1:300+k*150,y1:50+k*60,x2:200+k*150,y2:90+k*60,stroke:'#fff',class:'shoot','style':'animation-delay:'+(k*5.5+2)+'s','stroke-width':2,'stroke-linecap':'round'},g);
    });
    wLayer(cam,860,10,function(g,d){
      wCloud(g,d,300,200,900,200,[.46,.4,.78],.22,8); wCloud(g,d,-100,330,720,170,[.95,.55,.45],.16,17,'.005 .018'); wCloud(g,d,820,300,820,170,[.9,.5,.5],.14,29,'.005 .018');
      /* plane with blinking lights */
      var pl=se('g',{class:'plane'},g); se('rect',{x:0,y:200,width:16,height:3,rx:1.5,fill:'#cfd4ee'},pl); se('circle',{cx:2,cy:201,r:2,fill:'#ff4d4d',class:'blink'},pl); se('circle',{cx:14,cy:201,r:2,fill:'#fff',class:'blink','style':'animation-delay:-.5s'},pl);
    });
    /* far hazy skyline */
    wLayer(cam,640,16,function(g){
      se('rect',{x:-100,y:560,width:1800,height:400,fill:'#2a2f78',opacity:.0},g);
      skyline(g,R,780,0,34,70,90,300,'url(#nFar)',.25,-40,1640,true);
      se('rect',{x:-100,y:540,width:1800,height:360,fill:'#e07a9a',opacity:.08},g);
    });
    /* mid skyline */
    wLayer(cam,460,26,function(g){
      skyline(g,R,830,0,40,90,120,380,'url(#nMid)',.45,-40,520,true);
      skyline(g,R,830,0,40,90,120,360,'url(#nMid)',.45,1160,1660,true);
      /* searchlights */
      [[110,-14],[1500,16]].forEach(function(b,i){se('polygon',{points:(b[0]-6)+',860 '+(b[0]+6)+',860 '+(b[0]+60)+',100 '+(b[0]-60)+',100',fill:'url(#nBeam)',class:'beam','style':'animation-delay:-'+(i*4)+'s;transform-origin:'+b[0]+'px 860px'},g)});
    });
    /* Empire State Building */
    wLayer(cam,300,34,function(g){
      var cx=1030,by=900; g=se('g',{transform:'translate('+cx+',900) scale(.68) translate('+(-cx)+',-900)'},g);
      se('ellipse',{cx:cx+20,cy:150,rx:220,ry:260,fill:'url(#nGlow)',class:'crownglow',opacity:.0},g);
      /* neighbours */
      skyline(g,R,by,0,50,110,200,420,'url(#nMid)',.8,760,880,true); skyline(g,R,by,0,50,110,200,380,'url(#nMid)',.8,1200,1400,true);
      tier(g,cx,by,300,260); tier(g,cx,by-260,220,170); tier(g,cx,by-430,172,120); tier(g,cx,by-550,126,96); tier(g,cx,by-646,86,66); tier(g,cx,by-712,52,40);
      /* crown */
      se('polygon',{points:(cx-18)+','+(by-752)+' '+(cx+18)+','+(by-752)+' '+(cx+12)+','+(by-786)+' '+(cx-12)+','+(by-786),fill:'url(#nTop)'},g);
      se('polygon',{points:(cx-12)+','+(by-786)+' '+(cx+12)+','+(by-786)+' '+(cx+5)+','+(by-826)+' '+(cx-5)+','+(by-826),fill:'#c8cdee'},g);
      se('line',{x1:cx,y1:by-826,x2:cx,y2:by-905,stroke:'#d8dcf5','stroke-width':3},g);
      se('circle',{cx:cx,cy:by-908,r:16,fill:'url(#nGlow)',class:'blink'},g); se('circle',{cx:cx,cy:by-908,r:3,fill:'#ff5050',class:'blink'},g);
      se('ellipse',{cx:cx,cy:by-790,rx:70,ry:60,fill:'url(#nGlow)',class:'crownglow'},g);
    });
    /* near rooftops: water tanks, fire escape, neon, steam */
    wLayer(cam,90,56,function(g){
      se('path',{d:'M-100 900 V740 H80 V700 H260 V760 H420 V900Z',fill:'url(#nNear)'},g);
      se('path',{d:'M1180 900 V720 H1320 V670 H1500 V740 H1700 V900Z',fill:'url(#nNear)'},g);
      tank(g,150,700,1.5); tank(g,1380,670,1.7); tank(g,320,760,1.1);
      for(var f=0;f<4;f++){se('line',{x1:1200,y1:760+f*34,x2:1320,y2:760+f*34,stroke:'#02030c','stroke-width':3},g); se('line',{x1:1200,y1:760+f*34,x2:1320,y2:794+f*34,stroke:'#02030c','stroke-width':2},g);}
      [['#ff4f9a',1340,780,'OPEN'],['#4de1ff',1340,820,'BAR'],['#ffd54d',1340,860,'JAZZ']].forEach(function(n,i){se('rect',{x:n[1],y:n[2],width:70,height:26,rx:6,fill:n[0],opacity:.2},g); se('rect',{x:n[1]+3,y:n[2]+3,width:64,height:20,rx:4,fill:'none',stroke:n[0],'stroke-width':2.4,class:'neon','style':'animation-delay:-'+(i*.7)+'s'},g);});
      var sx=520; se('rect',{x:sx-12,y:760,width:24,height:60,fill:'#06071b'},g); se('rect',{x:sx-12,y:760,width:24,height:8,fill:'#ff7a2f'},g);
      for(var s=0;s<7;s++) se('circle',{cx:sx+(R()-.5)*8,cy:752,r:10+R()*8,fill:'#d8dcf2',class:'steam','style':'animation-delay:-'+(s*.9)+'s'},g);
      se('path',{d:'M0 740 Q200 800 420 740 M1180 700 Q1400 780 1620 700',stroke:'#02030c','stroke-width':2,fill:'none'},g);
    });
  };
})();
