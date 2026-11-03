/* Valley world (Heer's story): a Kashmir lake at night. Starry sky, snow-capped peaks, a still lake with moon streaks,
   a houseboat and a shikara with warm lanterns, pines and red-leaved chinar trees, and hanging lanterns up front.
   Original art; the sky warms toward saffron dawn as the stops are cleared. */
(function(){
  function defs(d){
    function lg(id,st,x2,y2){var g=se('linearGradient',{id:id,x1:0,y1:0,x2:x2||0,y2:y2===undefined?1:y2},d); st.forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]===undefined?1:s[2]},g)})}
    lg('vP1',[[0,'#1b3a58'],[1,'#0b1c30']]); lg('vP2',[[0,'#0f2438'],[1,'#071420']]); lg('vP3',[[0,'#07121c'],[1,'#02080e']]);
    lg('vLake',[[0,'#12425a'],[.15,'#0a2a3c'],[.5,'#04141e'],[1,'#010609']]);
    var m=se('radialGradient',{id:'vMoon'},d); se('stop',{offset:0,'stop-color':'#fff2d6','stop-opacity':.65},m); se('stop',{offset:.4,'stop-color':'#ffd9a0','stop-opacity':.2},m); se('stop',{offset:1,'stop-color':'#ffd9a0','stop-opacity':0},m);
    var l=se('radialGradient',{id:'vLamp'},d); se('stop',{offset:0,'stop-color':'#ffc27a','stop-opacity':.85},l); se('stop',{offset:1,'stop-color':'#ffc27a','stop-opacity':0},l);
  }
  function chinar(g,x,y,s,leaf){ /* a broad tree with a red crown */
    var t=se('g',{transform:'translate('+x+','+y+') scale('+s+')'},g);
    se('rect',{x:-9,y:-90,width:18,height:90,fill:'#05090e'},t);
    [[0,-150,64],[-52,-120,48],[52,-120,48],[-24,-186,44],[28,-182,44]].forEach(function(c){se('circle',{cx:c[0],cy:c[1],r:c[2],fill:leaf},t)});
    [[-30,-140,5],[20,-170,4],[40,-120,5],[-10,-110,4]].forEach(function(c){se('circle',{cx:c[0],cy:c[1],r:c[2],fill:'#ff8a4a',opacity:.35},t)});
  }
  WORLD.valley=function(cam){
    var R=wrng(59);
    wLayer(cam,1000,5,function(g,d){defs(d);
      for(var i=0;i<760;i++){var big=R()<.035; se('circle',{cx:(R()*1700-50).toFixed(0),cy:(R()*600).toFixed(0),r:big?(1.5+R()).toFixed(1):(.5+R()*.8).toFixed(1),fill:R()<.14?'#ffd9a8':(R()<.3?'#cfe8ff':'#fff'),class:'tw','style':'animation-delay:-'+(R()*5).toFixed(1)+'s;animation-duration:'+(2+R()*4).toFixed(1)+'s'},g);}
      se('circle',{cx:1290,cy:210,r:420,fill:'url(#vMoon)'},g);
      wMoon(g,d,1290,210,84);
      wBrightStars(g,d,R,14,1600,500);
      for(var k=0;k<3;k++) se('line',{x1:500+k*220,y1:70+k*40,x2:400+k*220,y2:110+k*40,stroke:'#fff',class:'shoot','style':'animation-delay:'+(k*7+2)+'s','stroke-width':2,'stroke-linecap':'round'},g);
    });
    wLayer(cam,880,10,function(g){
      [[360,250,640],[1100,190,720]].forEach(function(c,i){var gr=se('g',{class:'cloud','style':'animation-delay:-'+(i*30)+'s;animation-duration:'+(140+i*30)+'s'},g);
        se('ellipse',{cx:c[0],cy:c[1],rx:c[2]/2,ry:22,fill:'#a8c8e0',opacity:.1},gr); se('ellipse',{cx:c[0]+80,cy:c[1]-10,rx:c[2]/3,ry:13,fill:'#e8f4ff',opacity:.1},gr);});
    });
    /* far snow peaks, the lake and its moon streaks */
    wLayer(cam,640,16,function(g){
      wRidgeDraw(g,R,-100,1700,520,220,.7,'url(#vP1)','rgba(230,242,255,.5)');
      wRidgeDraw(g,R,-100,1700,560,100,.6,'url(#vP2)','rgba(200,225,255,.22)');
      se('rect',{x:-100,y:580,width:1800,height:720,fill:'url(#vLake)'},g);
      for(var i=0;i<34;i++){var y=596+R()*130,w=26+R()*110; se('rect',{x:1290-w/2+(R()-.5)*60*(y-580)/60,y:y,width:w,height:2.2,fill:'#ffe8c0',opacity:.2+R()*.45,class:'tw','style':'animation-delay:-'+(R()*4).toFixed(1)+'s'},g);}
      /* houseboat with lit windows */
      var hx=930,hy=640; se('path',{d:'M'+hx+' '+hy+' h230 l-14 18 h-202Z',fill:'#05090e'},g);
      se('rect',{x:hx+14,y:hy-46,width:200,height:46,fill:'#0a1520'},g); se('path',{d:'M'+(hx+6)+' '+(hy-46)+' L'+(hx+114)+' '+(hy-78)+' L'+(hx+222)+' '+(hy-46)+'Z',fill:'#050b12'},g);
      [0,1,2,3].forEach(function(i){se('rect',{x:hx+30+i*44,y:hy-34,width:22,height:18,fill:'#ffc27a',opacity:.85,class:'lamp','style':'animation-delay:-'+(i*.9)+'s'},g)});
      se('ellipse',{cx:hx+114,cy:hy+30,rx:130,ry:10,fill:'#ffc27a',opacity:.1},g);
    });
    /* mid: pines, chinar trees and a shikara */
    wLayer(cam,430,26,function(g){
      se('path',{d:'M-100 720 Q200 650 520 690 T1100 676 T1700 706 V1300 H-100Z',fill:'url(#vP2)'},g);
      for(var i=0;i<46;i++){var x=R()*1700-50,h=36+R()*96; wConifer(g,R,x,724+R()*8,h,R()<.5?'#04090f':'#030810',.1+R()*.08);}
      chinar(g,1160,730,.5,'#3a1418'); chinar(g,1420,736,.42,'#2f1016'); chinar(g,60,730,.46,'#34121a');
      /* shikara drifting with a lantern */
      var sk=se('g',{class:'sway','style':'transform-origin:760px 740px'},g);
      se('path',{d:'M660 734 Q700 752 760 752 Q840 752 880 722 Q800 738 740 738 Q690 738 660 734Z',fill:'#06101a'},sk);
      se('path',{d:'M716 736 L722 704 H800 L810 738Z',fill:'#7a2a2a',opacity:.9},sk); se('path',{d:'M722 704 Q760 690 800 704',fill:'#c9433a'},sk);
      se('line',{x1:880,y1:722,x2:884,y2:696,stroke:'#05090e','stroke-width':3},sk);
      se('circle',{cx:884,cy:694,r:34,fill:'url(#vLamp)',class:'lamp'},sk); se('circle',{cx:884,cy:694,r:5,fill:'#ffe2a8'},sk);
      se('ellipse',{cx:780,cy:770,rx:120,ry:8,fill:'#ffc27a',opacity:.12},g);
    });
    /* near: dark shore, big chinar, hanging lanterns */
    wLayer(cam,120,56,function(g){
      se('path',{d:'M-100 900 V800 Q300 750 700 786 T1700 770 V1300Z',fill:'url(#vP3)'},g);
      chinar(g,200,830,1,'#2a0f14'); chinar(g,1500,826,.9,'#240c12');
      se('path',{d:'M-20 440 Q300 520 600 470 Q900 540 1220 460 Q1400 500 1640 450',stroke:'#050a10','stroke-width':2,fill:'none'},g);
      [[300,497],[600,470],[900,500],[1220,460],[1480,486]].forEach(function(l,i){
        se('line',{x1:l[0],y1:l[1],x2:l[0],y2:l[1]+16,stroke:'#050a10','stroke-width':2},g);
        se('circle',{cx:l[0],cy:l[1]+26,r:58,fill:'url(#vLamp)',class:'lamp','style':'animation-delay:-'+(i*1.1)+'s'},g);
        se('ellipse',{cx:l[0],cy:l[1]+26,rx:7,ry:10,fill:i%2?'#ffd98a':'#ff7a5a'},g);
        for(var m=0;m<4;m++) se('circle',{cx:l[0],cy:l[1]+26,r:1.7,fill:'#ffe9b8',class:'moth','style':'animation-delay:-'+(m*.8)+'s;animation-duration:'+(3+m*.5)+'s;transform-origin:'+l[0]+'px '+(l[1]+26)+'px'},g);
      });
    });
  };
})();
