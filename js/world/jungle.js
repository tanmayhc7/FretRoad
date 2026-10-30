/* Jungle world: five depth layers of trunks, canopy, vines, ferns and mist, with god rays and fireflies.
   Everything is generated from a seed, so it looks the same every time. */
(function(){
  function defs(d){
    var g=se('linearGradient',{id:'jTrunk',x1:0,y1:0,x2:1,y2:0},d);
    [['0','#1b1209'],['.28','#5b4026'],['.5','#7a5632'],['.78','#3b2915'],['1','#150e07']].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1]},g)});
    var f=se('linearGradient',{id:'jFar',x1:0,y1:0,x2:1,y2:0},d);
    [['0','#0c2a22'],['.5','#1e5a44'],['1','#0a231c']].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1]},f)});
    var ray=se('linearGradient',{id:'jRay',x1:0,y1:0,x2:0,y2:1},d); se('stop',{offset:0,'stop-color':'#f6ffc8','stop-opacity':.55},ray); se('stop',{offset:1,'stop-color':'#f6ffc8','stop-opacity':0},ray);
    var fg=se('radialGradient',{id:'jFly'},d); se('stop',{offset:0,'stop-color':'#fff6b0','stop-opacity':1},fg); se('stop',{offset:.3,'stop-color':'#ffe36a','stop-opacity':.6},fg); se('stop',{offset:1,'stop-color':'#ffd24a','stop-opacity':0},fg);
    var fl=se('linearGradient',{id:'jFloor',x1:0,y1:0,x2:0,y2:1},d); se('stop',{offset:0,'stop-color':'#0b2a1b','stop-opacity':0},fl); se('stop',{offset:1,'stop-color':'#03100a','stop-opacity':1},fl);
    /* leaf shapes (fill comes from the <use>) */
    function leaf(id,dd,rib){ var g=se('g',{id:id},d); se('path',{d:dd},g); se('path',{d:rib,fill:'none',stroke:'rgba(8,30,12,.38)','stroke-width':1.1},g); se('path',{d:dd,fill:'rgba(255,255,220,.1)',transform:'translate(-1.4,0) scale(.82)'},g); se('path',{d:dd,fill:'none',stroke:'rgba(5,24,10,.35)','stroke-width':.8},g); }
    leaf('jL1','M0 0 C8 -10 8 -30 0 -46 C-8 -30 -8 -10 0 0Z','M0 -2 L0 -42 M0 -14 L5 -22 M0 -14 L-5 -22 M0 -26 L4 -33 M0 -26 L-4 -33');
    leaf('jL2','M0 0 C16 -8 22 -26 4 -52 C-6 -30 -12 -12 0 0Z','M0 -2 Q4 -26 4 -48 M2 -14 L10 -20 M2 -14 L-4 -19 M3 -28 L10 -33 M3 -28 L-3 -32');
    leaf('jL3','M0 0 C12 -4 30 -4 52 6 C30 14 12 8 0 0Z','M2 3 L48 6 M14 3 L22 -1 M14 5 L22 10 M30 4 L38 0 M30 6 L38 11');
    /* bark: stretched noise with lighting for ridges and fissures */
    var bk=se('filter',{id:'jBark',x:'0%',y:'0%',width:'100%',height:'100%'},d);
    se('feTurbulence',{type:'fractalNoise',baseFrequency:'.05 .006',numOctaves:5,seed:4,result:'n0'},bk); se('feColorMatrix',{in:'n0',values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4.2 0 0 0 -1.5',result:'n'},bk);
    se('feDiffuseLighting',{in:'n','lighting-color':'#fff2d6',surfaceScale:5,diffuseConstant:1.15,result:'lt'},bk).appendChild((function(){return se('feDistantLight',{azimuth:200,elevation:42})})());
    se('feComposite',{in:'lt',in2:'SourceGraphic',operator:'arithmetic',k1:1.5,k2:.05,k3:0,k4:0,result:'c'},bk);
    se('feComposite',{in:'c',in2:'SourceAlpha',operator:'in'},bk);
    se('path',{id:'jBl',d:'M0 0 L0 -90 M0 -20 L-14 -34 M0 -20 L14 -34 M0 -40 L-16 -58 M0 -40 L16 -58 M0 -60 L-12 -78 M0 -60 L12 -78'},d);
  }
  var GREENS=['#0f4a2a','#176b34','#1f8a3c','#2fa84a','#52c25a','#86d86a','#b6e87a'];
  function leaves(g,R,cx,cy,rx,ry,n,pal,sc){
    for(var i=0;i<n;i++){
      var a=R()*6.283,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
      var lit=(y<cy?1:0)*.4+R()*.6; var col=pal[Math.min(pal.length-1,Math.floor(lit*pal.length))];
      var u=se('use',{href:'#jL'+(1+Math.floor(R()*3)),fill:col,transform:'translate('+x.toFixed(1)+','+y.toFixed(1)+') rotate('+Math.floor(R()*360)+') scale('+((sc||1)*(.6+R()*.9)).toFixed(2)+')',opacity:(.82+R()*.18).toFixed(2)},g);
    }
  }
  function canopy(g,R,x,y,w,h,pal,dens,sc){ /* lumpy foliage mass */
    for(var k=0;k<5;k++) leaves(g,R,x+(R()-.5)*w*.7,y+(R()-.5)*h*.6,w*.35,h*.4,Math.floor(dens/5),pal,sc);
  }
  function trunk(g,R,x,top,base,w,fill,detail){
    var flare=w*.9, p='M'+(x-w/2)+' '+top+' C'+(x-w/2+R()*6)+' '+(top+(base-top)*.5)+' '+(x-w*.5-4)+' '+(base-90)+' '+(x-w/2-flare)+' '+base+' L'+(x+w/2+flare)+' '+base+' C'+(x+w*.5+4)+' '+(base-90)+' '+(x+w/2+R()*6)+' '+(top+(base-top)*.5)+' '+(x+w/2)+' '+top+'Z';
    var tp=se('path',{d:p,fill:fill},g); if(detail) tp.setAttribute('filter','url(#jBark)');
    if(detail){
      for(var i=0;i<Math.floor(w/5);i++){var bx=x-w/2+R()*w,len=60+R()*220,by=top+R()*(base-top-len); se('path',{d:'M'+bx+' '+by+' q'+((R()-.5)*8)+' '+(len/2)+' '+((R()-.5)*6)+' '+len,stroke:'rgba(10,6,2,'+(.25+R()*.3).toFixed(2)+')','stroke-width':1+R()*2.2,fill:'none'},g);}
      for(var m=0;m<5;m++){se('ellipse',{cx:x+(R()-.5)*w*.6,cy:base-60-R()*(base-top)*.7,rx:w*(.12+R()*.2),ry:20+R()*40,fill:'#2f6d2e',opacity:.5},g);}
      /* buttress roots */
      [-1,1].forEach(function(s){se('path',{d:'M'+(x+s*w*.4)+' '+(base-150)+' Q'+(x+s*w*1.1)+' '+(base-40)+' '+(x+s*w*2)+' '+(base+6)+' L'+(x+s*w*.4)+' '+base+'Z',fill:fill,opacity:.95},g)});
    }
  }
  function vine(g,R,x,y,len,col){
    var gr=se('g',{class:'sway','style':'animation-delay:-'+(R()*6).toFixed(1)+'s;animation-duration:'+(5+R()*4).toFixed(1)+'s'},g);
    var d='M'+x+' '+y; var cx=x,cy=y; for(var i=0;i<6;i++){cx+=(R()-.5)*16;cy+=len/6; d+=' L'+cx.toFixed(1)+' '+cy.toFixed(1);}
    se('path',{d:d,stroke:col,'stroke-width':2+R()*2,fill:'none','stroke-linejoin':'round'},gr);
    for(var j=1;j<9;j++){ var ly=y+len*j/9; se('use',{href:'#jL1',fill:GREENS[2+Math.floor(R()*3)],transform:'translate('+(x+(R()-.5)*14).toFixed(1)+','+ly.toFixed(1)+') rotate('+Math.floor(150+R()*60)+') scale(.45)'},gr);}
  }
  function fern(g,R,x,y,n,sc){
    var gr=se('g',{class:'sway2','style':'animation-delay:-'+(R()*5).toFixed(1)+'s'},g);
    for(var i=0;i<n;i++){var a=-90+(i/(n-1)-.5)*140+(R()-.5)*14,len=sc*(.6+R()*.5);
      var f=se('g',{transform:'translate('+x+','+y+') rotate('+a.toFixed(0)+') scale('+(len/90).toFixed(2)+')'},gr);
      se('use',{href:'#jBl',stroke:GREENS[1+Math.floor(R()*3)],'stroke-width':2.4,fill:'none','stroke-linecap':'round'},f);
      for(var k=0;k<7;k++){ var yy=-8-k*12; [-1,1].forEach(function(s){se('use',{href:'#jL3',fill:GREENS[2+Math.floor(R()*4)],transform:'translate(0,'+yy+') rotate('+(s>0?-18:198)+') scale('+(.38-k*.03).toFixed(2)+')'},f)}); }
    }
  }
  WORLD.jungle=function(cam){
    var R=wrng(21);
    /* L0: sky glow and far, hazy trunks */
    wLayer(cam,900,6,function(g,d){defs(d);
      se('rect',{x:-200,y:-100,width:2000,height:1100,fill:'#0a3a26'},g);
      se('ellipse',{cx:800,cy:80,rx:700,ry:360,fill:'#4fae6a',opacity:.45},g);
      for(var i=0;i<22;i++){var x=-40+i*78+R()*30,w=16+R()*14; trunk(g,R,x,-20,880,w,'url(#jFar)',false);}
      for(var c=0;c<9;c++) canopy(g,R,80+c*190,40+R()*120,200,150,['#0e4630','#14583a','#1d7048'],60,.9);
    });
    /* god rays */
    wLayer(cam,780,10,function(g){
      [[180,-.18],[420,-.1],[690,-.04],[960,.06],[1230,.14],[1470,.22]].forEach(function(r,i){
        se('polygon',{points:(r[0]-30)+',-40 '+(r[0]+46)+',-40 '+(r[0]+220*r[1]*4+120)+',900 '+(r[0]+220*r[1]*4-120)+',900',fill:'url(#jRay)',class:'ray','style':'animation-delay:-'+(i*1.7)+'s'},g)});
    },'wl-screen');
    /* L1: mid-far trees */
    wLayer(cam,560,14,function(g,d){
      for(var i=0;i<12;i++){var x=40+i*140+R()*60; trunk(g,R,x,-20,900,22+R()*14,'url(#jFar)',false);
        se('rect',{x:x-60,y:200,width:120,height:700,fill:'#0b2e22',opacity:.18},g);}
      for(var c=0;c<10;c++) canopy(g,R,60+c*170,10+R()*100,220,170,['#12512f','#1a6d3a','#238a45','#3aa354'],110,1);
      for(var v=0;v<10;v++) vine(g,R,60+R()*1480,40,200+R()*240,'#1a4a2a');
    });
    /* L2: mid trees with bark */
    wLayer(cam,330,26,function(g){
      [150,470,820,1130,1470].forEach(function(x,i){ var w=46+R()*20; trunk(g,R,x+(R()-.5)*60,-30,910,w,'url(#jTrunk)',true);
        canopy(g,R,x,40+R()*60,300,200,['#145a2e','#1c7a3a','#28a049','#4cc357','#7fd868'],200,1.15);
        vine(g,R,x-60,100,260+R()*180,'#16401f'); vine(g,R,x+70,120,200+R()*160,'#16401f');
        fern(g,R,x+(R()-.5)*160,900,9,120+R()*60);});
    });
    /* mist drifting between mid and front */
    wLayer(cam,260,0,function(g){
      se('rect',{x:-200,y:420,width:2000,height:300,fill:'#9ad8b0',opacity:.07},g); se('ellipse',{cx:400,cy:640,rx:600,ry:90,fill:'#b8ecc8',opacity:.08,class:'mist'},g); se('ellipse',{cx:1200,cy:580,rx:640,ry:80,fill:'#b8ecc8',opacity:.07,class:'mist2'},g);
    });
    /* fireflies */
    wLayer(cam,200,40,function(g){
      for(var i=0;i<46;i++){var x=R()*1600,y=200+R()*650,s=6+R()*10; se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:s.toFixed(1),fill:'url(#jFly)',class:'ffly','style':'animation-delay:-'+(R()*6).toFixed(1)+'s;animation-duration:'+(3+R()*5).toFixed(1)+'s'},g);}
    },'wl-screen');
    /* L3: giant near trunks, hanging leaves, ferns */
    wLayer(cam,70,60,function(g){
      trunk(g,R,70,-40,930,170,'url(#jTrunk)',true); trunk(g,R,1540,-40,930,200,'url(#jTrunk)',true);
      trunk(g,R,300,-40,930,64,'url(#jTrunk)',true); trunk(g,R,1330,-40,930,70,'url(#jTrunk)',true);
      canopy(g,R,160,-10,360,150,['#0f4a2a','#176b34','#1f8a3c','#2fa84a','#52c25a'],160,1.9);
      canopy(g,R,1440,-10,420,160,['#0f4a2a','#176b34','#1f8a3c','#2fa84a','#52c25a'],170,1.9);
      canopy(g,R,800,-30,520,90,['#0d3f24','#146a32','#1f8a3c'],120,1.9);
      [[220,40],[460,10],[1180,20],[1380,50]].forEach(function(v,i){vine(g,R,v[0],v[1],240+R()*220,'#10341b')});
      se('rect',{x:-100,y:640,width:1800,height:300,fill:'url(#jFloor)'},g);
      fern(g,R,260,910,11,230); fern(g,R,520,920,9,170); fern(g,R,1100,920,9,190); fern(g,R,1340,910,12,240);
      fern(g,R,720,925,7,120); fern(g,R,900,925,7,130);
    });
    /* foreground leaves that frame the screen */
    wLayer(cam,-40,90,function(g){
      var pal=['#0b3a1f','#116a2e','#1f8a3c','#34a84a'];
      [[-30,-30,60],[1630,-30,120],[-20,940,-70],[1620,930,-120]].forEach(function(c,i){
        var gr=se('g',{class:'sway2','style':'animation-delay:-'+(i*1.3)+'s'},g);
        for(var k=0;k<11;k++){var a=c[2]+(k-5)*13+(R()-.5)*8; se('use',{href:'#jL2',fill:pal[k%4],transform:'translate('+c[0]+','+c[1]+') rotate('+a+') scale('+(4.4+R()*2)+')',opacity:.96},gr);} });
      se('rect',{x:-100,y:0,width:1800,height:900,fill:'none'},g);
    });
  };
})();
