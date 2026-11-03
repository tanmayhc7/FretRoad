/* Delhi world (Jordan's story): a warm night skyline, from old Delhi to Prague. Temple towers, a gurudwara with a flag and a gateway arch on the left,
   Gothic spires on the right, marigold string lights, tea stall glow, sweeping stage spotlights, and a guitar leaning on a rooftop.
   Original art. The sky warms toward a saffron dawn as stops are cleared. */
(function(){
  function defs(d){
    function lg(id,st,x2,y2){var g=se('linearGradient',{id:id,x1:0,y1:0,x2:x2||0,y2:y2===undefined?1:y2},d); st.forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]===undefined?1:s[2]},g)})}
    lg('dFar',[[0,'#4a2a6a'],[1,'#2a1546']]); lg('dMid',[[0,'#2a1540'],[1,'#150a28']]); lg('dNear',[[0,'#120822'],[1,'#07030f']]);
    lg('dBeam',[[0,'#ffe2b0',.55],[1,'#ffe2b0',0]],0,1);
    var l=se('radialGradient',{id:'dLamp'},d); se('stop',{offset:0,'stop-color':'#ffb347','stop-opacity':.85},l); se('stop',{offset:1,'stop-color':'#ffb347','stop-opacity':0},l);
    var m=se('radialGradient',{id:'dMoon'},d); se('stop',{offset:0,'stop-color':'#ffe9c8','stop-opacity':.55},m); se('stop',{offset:1,'stop-color':'#ffe9c8','stop-opacity':0},m);
  }
  function shikhara(g,x,y,w,h,fill,lit){ /* a temple tower: curved, tapering, with stepped bands, a disc and a kalash on top */
    var t=se('g',{},g); se('rect',{x:x-w/2,y:y-h*.22,width:w,height:h*.22,fill:fill},t);
    se('path',{d:'M'+(x-w*.42)+' '+(y-h*.22)+' C'+(x-w*.4)+' '+(y-h*.6)+' '+(x-w*.16)+' '+(y-h*.9)+' '+x+' '+(y-h*.98)+' C'+(x+w*.16)+' '+(y-h*.9)+' '+(x+w*.4)+' '+(y-h*.6)+' '+(x+w*.42)+' '+(y-h*.22)+'Z',fill:fill},t);
    for(var i=1;i<6;i++){var yy=y-h*.22-i*h*.12,hw=w*.42*(1-i*.14); se('rect',{x:x-hw-2,y:yy,width:hw*2+4,height:2,fill:'#ffb347',opacity:.18},t);}
    se('ellipse',{cx:x,cy:y-h*.98,rx:w*.12,ry:3,fill:fill},t); se('rect',{x:x-1.5,y:y-h*1.14,width:3,height:h*.16,fill:fill},t); se('circle',{cx:x,cy:y-h*1.15,r:3,fill:fill},t);
    if(lit) se('path',{d:'M'+(x-w*.1)+' '+y+' V'+(y-h*.1)+' Q'+x+' '+(y-h*.18)+' '+(x+w*.1)+' '+(y-h*.1)+' V'+y+'Z',fill:'#ffb347',opacity:.85},t);
  }
  function gurudwara(g,x,y,w,h,fill,lit){ /* a white-washed hall with small corner pavilions, a fluted central roof, and a tall flag */
    var t=se('g',{},g); se('rect',{x:x-w/2,y:y-h*.4,width:w,height:h*.4,fill:fill},t);
    se('rect',{x:x-w*.3,y:y-h*.62,width:w*.6,height:h*.22,fill:fill},t);
    se('path',{d:'M'+(x-w*.26)+' '+(y-h*.62)+' C'+(x-w*.3)+' '+(y-h*.9)+' '+(x-w*.08)+' '+(y-h*1.0)+' '+x+' '+(y-h*1.1)+' C'+(x+w*.08)+' '+(y-h*1.0)+' '+(x+w*.3)+' '+(y-h*.9)+' '+(x+w*.26)+' '+(y-h*.62)+'Z',fill:fill},t);
    for(var k=-2;k<=2;k++) se('line',{x1:x+k*w*.05,y1:y-h*.64,x2:x+k*w*.02,y2:y-h*1.02,stroke:'#ffb347',opacity:.2,'stroke-width':1.4},t);
    se('rect',{x:x-1.5,y:y-h*1.26,width:3,height:h*.16,fill:fill},t); se('circle',{cx:x,cy:y-h*1.27,r:3.4,fill:fill},t);
    [-1,1].forEach(function(s){var cx=x+s*w*.4; se('rect',{x:cx-w*.05,y:y-h*.64,width:w*.1,height:h*.24,fill:fill},t); se('path',{d:'M'+(cx-w*.07)+' '+(y-h*.64)+' Q'+cx+' '+(y-h*.9)+' '+(cx+w*.07)+' '+(y-h*.64)+'Z',fill:fill},t);});
    var fx=x+w*.62; se('rect',{x:fx-1.5,y:y-h*1.5,width:3,height:h*1.5,fill:fill},t); se('path',{d:'M'+(fx+1.5)+' '+(y-h*1.5)+' L'+(fx+w*.16)+' '+(y-h*1.38)+' L'+(fx+1.5)+' '+(y-h*1.26)+'Z',fill:'#ff9a3d',opacity:.9,class:'sway','style':'transform-origin:'+(fx+1.5)+'px '+(y-h*1.38)+'px'},t);
    if(lit) [-1,0,1].forEach(function(k){se('path',{d:'M'+(x+k*w*.2-w*.05)+' '+y+' V'+(y-h*.2)+' Q'+(x+k*w*.2)+' '+(y-h*.3)+' '+(x+k*w*.2+w*.05)+' '+(y-h*.2)+' V'+y+'Z',fill:'#ffb347',opacity:.8,class:'lamp','style':'animation-delay:-'+((k+1)*.8)+'s'},t)});
  }
  function pole(g,x,y,h,fill){ /* a slim temple flag pole with a small pennant */
    se('rect',{x:x-1.5,y:y-h,width:3,height:h,fill:fill},g); se('path',{d:'M'+(x+1.5)+' '+(y-h)+' L'+(x+22)+' '+(y-h+9)+' L'+(x+1.5)+' '+(y-h+18)+'Z',fill:'#ff9a3d',opacity:.85},g);
  }
  function spire(g,x,y,h,w,fill){se('path',{d:'M'+(x-w/2)+' '+y+' V'+(y-h*.55)+' L'+x+' '+(y-h)+' L'+(x+w/2)+' '+(y-h*.55)+' V'+y+'Z',fill:fill},g); se('path',{d:'M'+(x-w*.9)+' '+y+' V'+(y-h*.3)+' L'+(x-w/2)+' '+(y-h*.5)+' V'+y+'Z',fill:fill},g); se('path',{d:'M'+(x+w*.9)+' '+y+' V'+(y-h*.3)+' L'+(x+w/2)+' '+(y-h*.5)+' V'+y+'Z',fill:fill},g);}
  function windows(g,R,x,y,w,h,n){for(var i=0;i<n;i++) se('rect',{x:(x+4+R()*(w-12)).toFixed(0),y:(y-h+6+R()*(h-14)).toFixed(0),width:4,height:6,fill:'#ffc27a',opacity:(.4+R()*.5).toFixed(2)},g);}
  WORLD.delhi=function(cam){
    var R=wrng(23);
    wLayer(cam,1000,5,function(g,d){defs(d);
      for(var i=0;i<520;i++){var big=R()<.03; se('circle',{cx:(R()*1700-50).toFixed(0),cy:(R()*520).toFixed(0),r:big?(1.4+R()).toFixed(1):(.5+R()*.7).toFixed(1),fill:R()<.2?'#ffd9a8':'#fff',class:'tw','style':'animation-delay:-'+(R()*5).toFixed(1)+'s;animation-duration:'+(2+R()*4).toFixed(1)+'s'},g);}
      se('circle',{cx:1180,cy:220,r:360,fill:'url(#dMoon)'},g);
      wMoon(g,d,1180,220,72);
      wBrightStars(g,d,R,10,1600,420);
    });
    wLayer(cam,880,10,function(g){
      [[340,300,560],[1060,240,640]].forEach(function(c,i){var gr=se('g',{class:'cloud','style':'animation-delay:-'+(i*30)+'s;animation-duration:'+(140+i*30)+'s'},g);
        se('ellipse',{cx:c[0],cy:c[1],rx:c[2]/2,ry:20,fill:'#e8a8c8',opacity:.12},gr); se('ellipse',{cx:c[0]+70,cy:c[1]-9,rx:c[2]/3,ry:12,fill:'#ffe0e8',opacity:.1},gr);});
    });
    /* far skyline: old Delhi on the left, Prague spires on the right */
    wLayer(cam,640,16,function(g){
      var f='url(#dFar)';
      se('rect',{x:-100,y:640,width:1800,height:300,fill:f},g);
      shikhara(g,170,640,110,200,f); shikhara(g,330,640,80,130,f); pole(g,70,640,190,f); pole(g,255,640,110,f); pole(g,430,640,150,f);
      gurudwara(g,620,640,170,110,f);
      [[900,640,60,150],[1000,640,50,200],[1080,640,70,170],[1180,640,56,230],[1280,640,60,180],[1380,640,52,210],[1470,640,66,150]].forEach(function(s){spire(g,s[0],s[1],s[3],s[2],f)});
      se('rect',{x:-100,y:660,width:1800,height:300,fill:f},g);
      for(var i=0;i<40;i++) se('rect',{x:(R()*1600).toFixed(0),y:(580+R()*70).toFixed(0),width:3,height:5,fill:'#ffc27a',opacity:(.3+R()*.5).toFixed(2),class:'tw','style':'animation-delay:-'+(R()*4).toFixed(1)+'s'},g);
    });
    /* mid: a large gurudwara with lit arches, a gateway arch, rooftops and spotlights */
    wLayer(cam,430,26,function(g){
      var f='url(#dMid)';
      se('rect',{x:-100,y:740,width:1800,height:400,fill:f},g);
      gurudwara(g,520,740,300,190,f,true);
      /* gateway arch */
      se('path',{d:'M1010 740 V610 H1130 V740 H1106 V660 Q1070 630 1034 660 V740Z',fill:f},g); se('rect',{x:1000,y:598,width:140,height:14,fill:f},g);
      for(var i=0;i<14;i++){var x=R()*1700-50,w=40+R()*70,h=44+R()*90; se('rect',{x:x,y:740-h,width:w,height:h,fill:f},g); windows(g,R,x,740,w,h,3);}
      /* spotlights sweeping from behind the skyline */
      [[300,740,-1],[1300,740,1]].forEach(function(s,i){se('polygon',{points:s[0]+','+s[1]+' '+(s[0]+s[2]*120)+',160 '+(s[0]+s[2]*260)+',200',fill:'url(#dBeam)',class:'lbeam','style':'transform-origin:'+s[0]+'px '+s[1]+'px;animation-delay:-'+(i*5)+'s'},g)});
    });
    /* near: rooftop, wires with marigold lights, tea stall glow, water tank, a guitar leaning on the wall */
    wLayer(cam,120,56,function(g){
      se('path',{d:'M-100 920 V800 H420 V780 H900 V810 H1700 V1300Z',fill:'url(#dNear)'},g);
      se('rect',{x:1240,y:660,width:110,height:90,rx:6,fill:'#07030f'},g); [1256,1290,1324].forEach(function(x){se('rect',{x:x,y:750,width:5,height:50,fill:'#07030f'},g)});
      /* the guitar: body, neck, headstock, leaning against the wall */
      var gt=se('g',{transform:'translate(1020 790) rotate(18)'},g);
      se('ellipse',{cx:0,cy:-26,rx:30,ry:26,fill:'#07030f'},gt); se('ellipse',{cx:0,cy:-64,rx:22,ry:20,fill:'#07030f'},gt); se('rect',{x:-4,y:-170,width:8,height:110,fill:'#07030f'},gt); se('rect',{x:-8,y:-190,width:16,height:24,rx:3,fill:'#07030f'},gt);
      se('circle',{cx:0,cy:-38,r:8,fill:'#ffb347',opacity:.25},gt);
      se('path',{d:'M-20 470 Q300 560 700 480 Q1100 570 1500 470 Q1620 500 1700 480',stroke:'#07030f','stroke-width':2,fill:'none'},g);
      var cols=['#ffb347','#ff6a3d','#ffd34a','#ff8a3d'];
      for(var i=0;i<18;i++){var t=i/17,x=-20+t*1720,y=470+Math.sin(t*Math.PI*3)*34+ (t*10); se('line',{x1:x,y1:y,x2:x,y2:y+10,stroke:'#07030f','stroke-width':1.5},g); se('circle',{cx:x,cy:y+16,r:5,fill:cols[i%4],class:'lamp','style':'animation-delay:-'+(i*.37).toFixed(2)+'s'},g); se('circle',{cx:x,cy:y+16,r:26,fill:'url(#dLamp)',opacity:.55},g);}
      /* tea stall */
      se('rect',{x:300,y:742,width:130,height:60,fill:'#07030f'},g); se('rect',{x:312,y:754,width:106,height:26,fill:'#ffb347',opacity:.75,class:'lamp'},g); se('path',{d:'M290 742 L365 712 L440 742Z',fill:'#0d0618'},g);
      se('circle',{cx:365,cy:766,r:70,fill:'url(#dLamp)',opacity:.5},g);
    });
  };
})();
