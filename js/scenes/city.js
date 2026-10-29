/* New York style city scene: skyline with an Art Deco tower, a glass spire tower, a stepped crown, a suspension bridge,
   water towers, fire escapes, neon, steam stack and yellow cabs. Registered as SCENE_ART.city. */
(function(){
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  var BASE=392;
  function defs(){
    var svg=document.getElementById('mapsvg'),d=svg.querySelector('defs'); if(document.getElementById('glassG')) return;
    var g1=mk('linearGradient',{id:'glassG',x1:0,y1:0,x2:1,y2:0},d); [['0','#1b2a66'],['.5','#3c5fae'],['1','#16224f']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},g1)});
    var g2=mk('linearGradient',{id:'stoneG',x1:0,y1:0,x2:0,y2:1},d); [['0','#2a2f66'],['1','#161a45']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},g2)});
    var g3=mk('linearGradient',{id:'crownG',x1:0,y1:0,x2:0,y2:1},d); [['0','#ffe9a8'],['1','#e0a65a']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},g3)});
    var g4=mk('linearGradient',{id:'cityWater',x1:0,y1:0,x2:0,y2:1},d); [['0','#2b3a86'],['1','#0e1236']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},g4)});
    var g5=mk('linearGradient',{id:'ground',x1:0,y1:0,x2:0,y2:1},d); [['0','#1c1f4a'],['1','#0a0c26']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},g5)});
    var g6=mk('linearGradient',{id:'hazeG',x1:0,y1:0,x2:0,y2:1},d); mk('stop',{offset:0,'stop-color':'#f2a65a','stop-opacity':0},g6); mk('stop',{offset:1,'stop-color':'#f2a65a','stop-opacity':.35},g6);
  }
  function windows(g,R,x,y,w,h,density,warm){
    for(var yy=y+6;yy<y+h-6;yy+=9) for(var xx=x+4;xx<x+w-5;xx+=7){
      if(R()<density){var c=warm?(R()<.8?'#ffd98a':'#ffb870'):(R()<.7?'#bfe0ff':'#ffd98a'); mk('rect',{x:xx,y:yy,width:3.2,height:4.6,fill:c,opacity:(.55+R()*.4).toFixed(2)},g);}
    }
  }
  function tank(g,x,y){ /* rooftop wooden water tower */
    mk('rect',{x:x-9,y:y-22,width:18,height:20,rx:2,fill:'#3a2418'},g);
    mk('path',{d:'M'+(x-10)+' '+(y-22)+' L'+x+' '+(y-30)+' L'+(x+10)+' '+(y-22)+'Z',fill:'#2b1a10'},g);
    [-5,0,5].forEach(function(o){mk('line',{x1:x+o,y1:y-20,x2:x+o,y2:y-3,stroke:'#150c07','stroke-width':.8},g)});
    [-8,8].forEach(function(o){mk('line',{x1:x+o,y1:y-2,x2:x+o,y2:y+6,stroke:'#150c07','stroke-width':1.3},g)});
  }
  function block(g,R,x,w,h,kind){
    var y=BASE-h;
    mk('rect',{x:x,y:y,width:w,height:h,fill:'url(#stoneG)'},g);
    mk('rect',{x:x,y:y,width:2,height:h,fill:'rgba(255,200,140,.12)'},g);
    windows(g,R,x,y,w,h,.42,true);
    if(kind==='tank') tank(g,x+w*.3,y);
    if(kind==='tank2'){tank(g,x+w*.25,y);tank(g,x+w*.75,y);}
    if(kind==='step'){mk('rect',{x:x+w*.15,y:y-h*.12,width:w*.7,height:h*.12,fill:'url(#stoneG)'},g);mk('rect',{x:x+w*.3,y:y-h*.2,width:w*.4,height:h*.08,fill:'url(#stoneG)'},g);}
    if(kind==='ant'){mk('line',{x1:x+w/2,y1:y,x2:x+w/2,y2:y-26,stroke:'#8a90c8','stroke-width':1.2},g);mk('circle',{cx:x+w/2,cy:y-27,r:1.8,fill:'#ff6a6a'},g);}
  }
  function emp(g,R,x){ /* stepped Art Deco tower with mast */
    var tiers=[[0,120,170],[14,92,70],[28,64,52],[40,40,34],[48,26,26]],y=BASE;
    tiers.forEach(function(t,i){var w=t[1],h=t[2],tx=x+t[0];y-=h; mk('rect',{x:tx,y:y,width:w,height:h,fill:'url(#stoneG)'},g); mk('rect',{x:tx,y:y,width:2,height:h,fill:'rgba(255,220,160,.18)'},g); windows(g,R,tx,y,w,h,.5,true);});
    mk('rect',{x:x+48,y:y-12,width:24,height:12,fill:'url(#crownG)'},g); mk('rect',{x:x+54,y:y-26,width:12,height:14,fill:'url(#crownG)'},g);
    mk('line',{x1:x+60,y1:y-26,x2:x+60,y2:y-78,stroke:'#cfd3f0','stroke-width':2},g); mk('circle',{cx:x+60,cy:y-79,r:2.2,fill:'#ff5a5a'},g);
    mk('rect',{x:x+44,y:y-26,width:32,height:26,fill:'#ffd98a',opacity:.16},g);
  }
  function glass(g,R,x){ /* tapered glass tower with long spire */
    var top=BASE-330; mk('polygon',{points:x+','+BASE+' '+(x+54)+','+BASE+' '+(x+40)+','+(top+40)+' '+(x+27)+','+top+' '+(x+14)+','+(top+40),fill:'url(#glassG)'},g);
    mk('polygon',{points:(x+27)+','+top+' '+(x+40)+','+(top+40)+' '+(x+54)+','+BASE+' '+(x+27)+','+BASE,fill:'rgba(255,255,255,.08)'},g);
    for(var i=1;i<8;i++) mk('line',{x1:x+i*7,y1:BASE,x2:x+27+(i*7-27)*.25,y2:top+40,stroke:'rgba(190,220,255,.22)','stroke-width':.8},g);
    mk('line',{x1:x+27,y1:top,x2:x+27,y2:top-80,stroke:'#d8dcf5','stroke-width':1.6},g); mk('circle',{cx:x+27,cy:top-81,r:2,fill:'#ff5a5a'},g);
  }
  function crown(g,R,x){ /* terraced arched crown */
    var y=BASE-190; mk('rect',{x:x,y:y,width:64,height:190,fill:'url(#stoneG)'},g); windows(g,R,x,y,64,190,.48,true);
    for(var i=0;i<6;i++){var w=60-i*9,yy=y-i*13; mk('path',{d:'M'+(x+32-w/2)+' '+(yy)+' Q'+(x+32)+' '+(yy-22)+' '+(x+32+w/2)+' '+(yy)+'Z',fill:'#c9cfe8',opacity:.9-i*.04,stroke:'#242a66','stroke-width':.8},g);}
    mk('line',{x1:x+32,y1:y-66,x2:x+32,y2:y-96,stroke:'#d8dcf5','stroke-width':1.6},g);
  }
  function bridge(g,R){
    var deckY=372; mk('rect',{x:-10,y:deckY,width:490,height:5,fill:'#1a1d4a'},g);
    [[130],[340]].forEach(function(t){var x=t[0];
      mk('rect',{x:x-20,y:250,width:14,height:128,fill:'url(#stoneG)'},g); mk('rect',{x:x+6,y:250,width:14,height:128,fill:'url(#stoneG)'},g); mk('rect',{x:x-20,y:250,width:40,height:10,fill:'url(#stoneG)'},g); mk('rect',{x:x-20,y:300,width:40,height:8,fill:'url(#stoneG)'},g);
      mk('path',{d:'M'+(x-6)+' 378 L'+(x-6)+' 276 Q'+x+' 262 '+(x+6)+' 276 L'+(x+6)+' 378Z',fill:'#05071e'},g);
      mk('path',{d:'M'+(x-6)+' 326 L'+(x-6)+' 308 Q'+x+' 298 '+(x+6)+' 308 L'+(x+6)+' 326Z',fill:'#05071e',opacity:.0},g);
    });
    /* main cables */
    var cab={fill:'none',stroke:'#2a2f70','stroke-width':2};
    mk('path',Object.assign({d:'M130 252 Q235 390 340 252'},cab),g); mk('path',Object.assign({d:'M-10 346 Q60 300 130 252'},cab),g); mk('path',Object.assign({d:'M340 252 Q410 300 480 346'},cab),g);
    for(var i=0;i<22;i++){var x=140+i*9; var t=(x-130)/210,y=252+(1-Math.pow(2*t-1,2))*0+Math.pow(2*t-1,2)*0; var cy=252+ (1-Math.pow((x-235)/105,2))*69*0.0; var cabY=252+138*(1-Math.pow((x-235)/105,2))*0.0; var yy=252+ (1-Math.pow((x-235)/105,2))*0; 
      var curve=252+ (1-Math.pow((x-235)/105,2))*0; /* placeholder to keep arithmetic simple */
      var sag=252+ (1-Math.pow((x-235)/105,2))*0;
      var y2=252+ (Math.pow((x-235)/105,2))*(-0)+ (1-Math.pow((x-235)/105,2))*69; /* cable y */
      mk('line',{x1:x,y1:y2,x2:x,y2:deckY,stroke:'rgba(110,120,200,.45)','stroke-width':.8},g);}
    for(var s=0;s<14;s++){var a=s/13; mk('line',{x1:130,y1:254,x2:-10+a*130,y2:deckY,stroke:'rgba(110,120,200,.4)','stroke-width':.8},g); mk('line',{x1:340,y1:254,x2:480-a*120,y2:deckY,stroke:'rgba(110,120,200,.4)','stroke-width':.8},g);}
    for(var l=0;l<30;l++) mk('circle',{cx:-5+l*16.5,cy:deckY-1,r:1.3,fill:'#ffd98a',opacity:.9},g);
  }
  function cloud(g,x,y,w){mk('ellipse',{cx:x,cy:y,rx:w,ry:w*.09,fill:'#f2a65a',opacity:.18},g);mk('ellipse',{cx:x+w*.2,cy:y+4,rx:w*.7,ry:w*.07,fill:'#f2708f',opacity:.14},g)}
  SCENE_ART.city={
    back:function(g){
      defs(); var R=rng(11);
      cloud(g,260,150,200);cloud(g,720,110,260);cloud(g,1010,190,190);cloud(g,120,230,150);
      mk('rect',{x:0,y:230,width:1200,height:170,fill:'url(#hazeG)'},g);
      /* far skyline in haze */
      for(var i=0;i<34;i++){var w=26+R()*36,h=60+R()*120,x=i*37+R()*10; mk('rect',{x:x,y:BASE-h,width:w,height:h,fill:'#27307a',opacity:.55},g); windows(g,R,x,BASE-h,w,h,.18,true);}
      /* water and bridge */
      mk('rect',{x:0,y:BASE-22,width:480,height:50,fill:'url(#cityWater)'},g);
      bridge(g,R);
      for(var r=0;r<26;r++){var rx=R()*470,ry=BASE-14+R()*30; mk('line',{x1:rx,y1:ry,x2:rx+14+R()*18,y2:ry,stroke:r%3?'rgba(242,166,90,.35)':'rgba(242,112,143,.35)','stroke-width':1.2},g);}
      /* main skyline */
      block(g,R,480,44,150,'tank'); block(g,R,526,38,110,'ant'); glass(g,R,566); block(g,R,626,50,160,'tank2'); block(g,R,676,40,100,'step');
      emp(g,R,722); block(g,R,846,46,128,'tank'); block(g,R,894,40,176,'ant'); block(g,R,936,52,112,'tank2'); crown(g,R,990);
      block(g,R,1056,42,140,'tank'); block(g,R,1100,50,180,'step'); block(g,R,1152,60,120,'tank2');
      /* neon boards on a corner block */
      [['#ff5a9a',1062,300],['#4de1ff',1062,316],['#ffd54d',1062,332]].forEach(function(n){mk('rect',{x:n[1],y:n[2],width:26,height:9,rx:2,fill:n[0],opacity:.9},g);mk('rect',{x:n[1]-4,y:n[2]-4,width:34,height:17,rx:4,fill:n[0],opacity:.18},g)});
      /* ground and low brownstones with fire escapes */
      mk('rect',{x:0,y:BASE,width:1200,height:130,fill:'url(#ground)'},g);
      var bx=190; while(bx<640){var w=34+R()*14,h=52+R()*24,y=BASE+26-h;
        mk('rect',{x:bx,y:y,width:w,height:h,fill:R()<.5?'#3a2438':'#2a2a58'},g); windows(g,R,bx,y,w,h,.5,true);
        mk('rect',{x:bx-1,y:y-3,width:w+2,height:4,fill:'#171a46'},g);
        for(var e=0;e<3;e++){var ey=y+10+e*16; mk('line',{x1:bx+6,y1:ey,x2:bx+w-6,y2:ey,stroke:'#0a0c26','stroke-width':1.4},g); mk('line',{x1:bx+6,y1:ey,x2:bx+w-6,y2:ey+13,stroke:'#0a0c26','stroke-width':.9},g);}
        bx+=w+3;}
      /* street lights glow dots along the avenue */
      for(var s=0;s<16;s++){var sx=30+s*76; mk('circle',{cx:sx,cy:BASE+8,r:7,fill:'#ffd98a',opacity:.08},g); mk('circle',{cx:sx,cy:BASE+8,r:1.6,fill:'#ffe9a8',opacity:.7},g);}
    },
    front:function(g){
      var road=document.getElementById('road'),L=road.getTotalLength(),R=rng(5);
      /* steam stack with rising steam */
      var sx=820,sy=BASE+26; mk('polygon',{points:(sx-9)+','+sy+' '+(sx+9)+','+sy+' '+(sx+6)+','+(sy-34)+' '+(sx-6)+','+(sy-34),fill:'#f2f2f2'},g);
      [0,1,2].forEach(function(i){mk('polygon',{points:(sx-9+i*0)+','+(sy-i*11)+' '+(sx+9)+','+(sy-i*11)+' '+(sx+8)+','+(sy-i*11-5)+' '+(sx-8)+','+(sy-i*11-5),fill:'#ff7a2f',opacity:.95},g)});
      for(var i=0;i<6;i++) mk('circle',{cx:sx+(R()-.5)*6,cy:sy-38,r:6+R()*5,fill:'#f4f0ff',class:'steam',style:'animation-delay:'+(i*0.7).toFixed(2)+'s'},g);
      /* yellow cabs on the avenue */
      [[.24,1],[.47,-1],[.69,1]].forEach(function(c){
        var p=road.getPointAtLength(L*c[0]),x=p.x,y=p.y+13;
        var t=mk('g',{transform:'translate('+x+','+y+') scale('+c[1]*0.9+',0.9)'},g);
        mk('ellipse',{cx:0,cy:5,rx:22,ry:4,fill:'#05071e',opacity:.5},t);
        mk('path',{d:'M-22 2 V-6 Q-22 -9 -18 -9 H-11 L-6 -16 H8 L13 -9 H19 Q22 -9 22 -6 V2Z',fill:'#f7c52b'},t);
        mk('path',{d:'M-7 -9 L-4 -14 H0 V-9Z M2 -9 V-14 H7 L10 -9Z',fill:'#bfe0ff',opacity:.85},t);
        mk('rect',{x:-3,y:-19,width:8,height:3.4,rx:1,fill:'#fff3a0'},t);
        mk('circle',{cx:-12,cy:3,r:4.2,fill:'#05071e'},t); mk('circle',{cx:12,cy:3,r:4.2,fill:'#05071e'},t);
        mk('circle',{cx:21,cy:-3,r:1.8,fill:'#fff3a0'},t); mk('polygon',{points:'22,-3 52,-10 52,4',fill:'url(#beam)',opacity:.7},t);
      });
    }
  };
})();
