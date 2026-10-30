/* Night Road world: a coastal highway at night. Starry sky, big moon with a shimmering sea reflection,
   layered ridges, a lighthouse with a sweeping beam, telephone poles with sagging wires, a diner neon sign,
   distant car headlights and drifting cloud. */
(function(){
  function defs(d){
    function lg(id,st,x2,y2){var g=se('linearGradient',{id:id,x1:0,y1:0,x2:x2||0,y2:y2===undefined?1:y2},d); st.forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]===undefined?1:s[2]},g)})}
    lg('rR1',[[0,'#2b2468'],[1,'#171346']]); lg('rR2',[[0,'#1c1850'],[1,'#0e0b30']]); lg('rR3',[[0,'#120f38'],[1,'#07061c']]);
    lg('rSea',[[0,'#2a3a86'],[1,'#0c1236']]); lg('rBeam',[[0,'#fff3c0',.7],[1,'#fff3c0',0]],1,0);
    var m=se('radialGradient',{id:'rMoon'},d); se('stop',{offset:0,'stop-color':'#fff1d8','stop-opacity':.55},m); se('stop',{offset:1,'stop-color':'#fff1d8','stop-opacity':0},m);
    var l=se('radialGradient',{id:'rLamp'},d); se('stop',{offset:0,'stop-color':'#ffe6a0','stop-opacity':.8},l); se('stop',{offset:1,'stop-color':'#ffe6a0','stop-opacity':0},l);
  }
  function pole(g,x,y,h,s){var p=se('g',{transform:'translate('+x+','+y+') scale('+s+')'},g);
    se('rect',{x:-3,y:-h,width:6,height:h,fill:'#0a0820'},p); se('rect',{x:-26,y:-h+10,width:52,height:4,fill:'#0a0820'},p); se('rect',{x:-18,y:-h+30,width:36,height:3,fill:'#0a0820'},p); }
  WORLD.road=function(cam){
    var R=wrng(41);
    wLayer(cam,1000,5,function(g,d){defs(d);
      for(var i=0;i<300;i++){var big=R()<.06; se('circle',{cx:(R()*1700-50).toFixed(0),cy:(R()*560).toFixed(0),r:big?(1.5+R()).toFixed(1):(.5+R()*.8).toFixed(1),fill:R()<.2?'#ffd9a8':'#fff',class:'tw','style':'animation-delay:-'+(R()*5).toFixed(1)+'s;animation-duration:'+(2+R()*4).toFixed(1)+'s'},g);}
      se('circle',{cx:1430,cy:250,r:240,fill:'url(#rMoon)'},g); se('circle',{cx:1430,cy:250,r:62,fill:'#fbf2e2'},g);
      [[1410,236,12],[1454,274,9],[1436,220,6]].forEach(function(c){se('circle',{cx:c[0],cy:c[1],r:c[2],fill:'#e3d6c6'},g)});
      for(var k=0;k<3;k++) se('line',{x1:600+k*200,y1:60+k*40,x2:500+k*200,y2:100+k*40,stroke:'#fff',class:'shoot','style':'animation-delay:'+(k*6+3)+'s','stroke-width':2,'stroke-linecap':'round'},g);
    });
    wLayer(cam,880,10,function(g){
      [[300,260,600],[1050,200,760]].forEach(function(c,i){var gr=se('g',{class:'cloud','style':'animation-delay:-'+(i*30)+'s;animation-duration:'+(130+i*30)+'s'},g);
        se('ellipse',{cx:c[0],cy:c[1],rx:c[2]/2,ry:24,fill:'#7a6bc0',opacity:.2},gr); se('ellipse',{cx:c[0]+80,cy:c[1]-10,rx:c[2]/3,ry:14,fill:'#f2b0c8',opacity:.15},gr);});
    });
    /* far ridges + lighthouse + sea */
    wLayer(cam,640,16,function(g){
      se('path',{d:'M-100 560 L120 470 L260 520 L440 420 L640 520 L860 450 L1040 530 L1250 440 L1450 520 L1700 470 V1300 H-100Z',fill:'url(#rR1)'},g);
      se('rect',{x:-100,y:560,width:1800,height:740,fill:'url(#rSea)'},g);
      for(var i=0;i<34;i++){var y=575+R()*120,w=30+R()*120; se('rect',{x:1180-w/2+(R()-.5)*60*(y-560)/60,y:y,width:w,height:2.2,fill:'#fff1d8',opacity:.2+R()*.4,class:'tw','style':'animation-delay:-'+(R()*4).toFixed(1)+'s'},g);}
      /* lighthouse on a headland */
      se('path',{d:'M180 600 Q260 520 360 560 Q420 580 470 600Z',fill:'#0d0a2c'},g);
      se('path',{d:'M300 560 L312 470 L328 470 L340 560Z',fill:'#e9e4f4'},g); se('rect',{x:306,y:500,width:28,height:12,fill:'#c9607e'},g); se('rect',{x:308,y:456,width:24,height:16,fill:'#ffe9a8'},g); se('path',{d:'M304 456 L320 436 L336 456Z',fill:'#2a2152'},g);
      se('polygon',{points:'320,464 1000,430 1000,500',fill:'url(#rBeam)',class:'lbeam','style':'transform-origin:320px 464px'},g);
      se('polygon',{points:'320,464 -400,430 -400,500',fill:'url(#rBeam)',class:'lbeam','style':'transform-origin:320px 464px;animation-delay:-5s'},g);
      se('circle',{cx:320,cy:464,r:26,fill:'url(#rLamp)'},g);
      /* distant headlights on the coast road */
      [0,1].forEach(function(i){var c=se('g',{class:'car','style':'animation-delay:-'+(i*13)+'s;animation-duration:'+(26+i*7)+'s'},g); se('circle',{cx:0,cy:612+i*6,r:2.4,fill:'#fff6c8'},c); se('circle',{cx:7,cy:612+i*6,r:2.4,fill:'#fff6c8'},c); se('ellipse',{cx:4,cy:614+i*6,rx:20,ry:5,fill:'#fff6c8',opacity:.15},c);});
    });
    wLayer(cam,430,26,function(g){
      se('path',{d:'M-100 700 Q200 600 520 660 T1100 640 T1700 680 V1300 H-100Z',fill:'url(#rR2)'},g);
      for(var i=0;i<26;i++){var x=R()*1600,h=30+R()*50; se('path',{d:'M'+x+' 700 q-10 -'+h+' 0 -'+(h*1.6)+' q10 '+(h*.6)+' 0 '+(h*1.6)+'Z',fill:'#0b0928'},g);}
      /* diner with neon */
      var dx=1260,dy=700; se('rect',{x:dx,y:dy-60,width:150,height:60,fill:'#0b0928'},g); se('rect',{x:dx+10,y:dy-48,width:130,height:22,fill:'#ffd98a',opacity:.8},g);
      se('rect',{x:dx+20,y:dy-130,width:110,height:34,rx:6,fill:'none',stroke:'#ff4f9a','stroke-width':3,class:'neon'},g); se('rect',{x:dx+20,y:dy-130,width:110,height:34,rx:6,fill:'#ff4f9a',opacity:.18},g);
      se('rect',{x:dx+73,y:dy-96,width:4,height:38,fill:'#0b0928'},g);
    });
    /* near: poles, wires, guardrail, lamp glow */
    wLayer(cam,120,56,function(g){
      se('path',{d:'M-100 900 V780 Q300 730 700 770 T1700 760 V1300Z',fill:'url(#rR3)'},g);
      [160,640,1120,1540].forEach(function(x,i){pole(g,x,790-i*4,300,1+i*.02)});
      se('path',{d:'M160 500 Q400 580 640 496 Q880 580 1120 492 Q1330 560 1540 488',stroke:'#07061c','stroke-width':2,fill:'none'},g);
      se('path',{d:'M160 520 Q400 600 640 516 Q880 600 1120 512 Q1330 580 1540 508',stroke:'#07061c','stroke-width':1.6,fill:'none'},g);
      [[640,520],[1120,516]].forEach(function(l,i){se('circle',{cx:l[0],cy:l[1],r:70,fill:'url(#rLamp)',class:'lamp','style':'animation-delay:-'+(i*1.3)+'s'},g);se('circle',{cx:l[0],cy:l[1],r:4,fill:'#fff3c0'},g);
        for(var m=0;m<6;m++) se('circle',{cx:l[0],cy:l[1],r:1.8,fill:'#fff3c0',class:'moth','style':'animation-delay:-'+(m*.8)+'s;animation-duration:'+(3+m*.5)+'s;transform-origin:'+l[0]+'px '+l[1]+'px'},g);});
      for(var p=0;p<30;p++) se('rect',{x:-90+p*62,y:818,width:5,height:42,fill:'#05041a'},g); se('rect',{x:-100,y:826,width:1800,height:6,fill:'#05041a'},g);
    });
  };
})();
