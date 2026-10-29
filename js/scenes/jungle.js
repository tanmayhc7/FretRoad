/* Jungle scene: layered, detailed vector art. Registered as SCENE_ART.jungle.
   back(g) draws behind the trail, front(g) draws over it (foreground leaves). */
(function(){
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  var GREENS=['#0f4527','#165c33','#1c6b3a','#24803f','#2e9446','#3aa352','#1a5a30','#2b7a3c'];
  function leaf(g,x,y,len,w,ang,fill,op,rib){
    var d='M0 0 C '+w+' '+(-len*.25)+' '+w+' '+(-len*.7)+' 0 '+(-len)+' C '+(-w)+' '+(-len*.7)+' '+(-w)+' '+(-len*.25)+' 0 0Z';
    var p=mk('path',{d:d,fill:fill,opacity:op===undefined?1:op,transform:'translate('+x+','+y+') rotate('+ang+')'},g);
    if(rib) mk('path',{d:'M0 0 L0 '+(-len*.92),stroke:'rgba(190,240,170,.35)','stroke-width':.8,fill:'none',transform:'translate('+x+','+y+') rotate('+ang+')'},g);
    return p;
  }
  function frond(g,x,y,len,ang,fill,R){ /* palm frond: curved stem with leaflets */
    var a=ang*Math.PI/180,cx=x+Math.sin(a)*len*.5,cy=y-Math.cos(a)*len*.5-len*.18,ex=x+Math.sin(a)*len,ey=y-Math.cos(a)*len+len*.16;
    mk('path',{d:'M'+x+' '+y+' Q'+cx+' '+cy+' '+ex+' '+ey,stroke:fill,'stroke-width':2.2,fill:'none','stroke-linecap':'round'},g);
    var n=Math.max(8,Math.round(len/9));
    for(var i=1;i<=n;i++){
      var t=i/(n+1),px=(1-t)*(1-t)*x+2*(1-t)*t*cx+t*t*ex,py=(1-t)*(1-t)*y+2*(1-t)*t*cy+t*t*ey;
      var tx=2*(1-t)*(cx-x)+2*t*(ex-cx),ty=2*(1-t)*(cy-y)+2*t*(ey-cy),base=Math.atan2(ty,tx)*180/Math.PI+90;
      var L=len*.30*(1-Math.abs(t-.45)*.9);
      leaf(g,px,py,L,L*.18,base+62,fill,.95); leaf(g,px,py,L,L*.18,base-62,fill,.95);
    }
  }
  function tree(g,R,x,base,top,wid,shade,front){
    var tw=wid, col=shade;
    /* trunk: tapered, with buttress roots */
    var d='M'+(x-tw*1.9)+' '+base+' C '+(x-tw*.9)+' '+(base-30)+' '+(x-tw*.7)+' '+(base-90)+' '+(x-tw*.5)+' '+(top+40)+' L '+(x+tw*.5)+' '+(top+40)+' C '+(x+tw*.7)+' '+(base-90)+' '+(x+tw*.9)+' '+(base-30)+' '+(x+tw*1.9)+' '+base+' Z';
    mk('path',{d:d,fill:'url(#barkG)',opacity:col},g);
    for(var i=0;i<7;i++){var bx=x+(R()-.5)*tw*1.1,y0=base-R()*30,y1=top+60+R()*(base-top-100); mk('path',{d:'M'+bx+' '+y0+' C '+(bx+(R()-.5)*5)+' '+((y0+y1)/2)+' '+(bx+(R()-.5)*5)+' '+((y0+y1)/2-20)+' '+(bx+(R()-.5)*4)+' '+y1,stroke:'rgba(10,25,12,.55)','stroke-width':1.1,fill:'none'},g);}
    /* branches */
    for(var b=0;b<4;b++){var by=top+50+b*26+R()*14,dir=b%2?1:-1,bl=60+R()*70; mk('path',{d:'M'+x+' '+(by+30)+' Q'+(x+dir*bl*.5)+' '+(by+4)+' '+(x+dir*bl)+' '+(by-16),stroke:'#2a1a0c','stroke-width':3.6-b*.5,fill:'none','stroke-linecap':'round',opacity:col},g);}
    /* canopy: clusters of leaves */
    var light=col<1,cl=light?3:5+Math.floor(R()*3);
    for(var c=0;c<cl;c++){
      var cx=x+(R()-.5)*180,cy=top+10+R()*60,r=44+R()*38;
      mk('ellipse',{cx:cx,cy:cy+8,rx:r*1.05,ry:r*.62,fill:'#07200f',opacity:.55},g);
      var nl=light?10+Math.floor(R()*6):34+Math.floor(R()*20);
      for(var l=0;l<nl;l++){
        var a=R()*Math.PI*2,rr=Math.sqrt(R())*r,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr*.55;
        var fl=GREENS[Math.floor(R()*GREENS.length)];
        leaf(g,px,py,10+R()*14,3+R()*3,R()*360,fl,.92);
      }
    }
  }
  function vines(g,R,n,x0,x1,y0){
    for(var i=0;i<n;i++){
      var x=x0+R()*(x1-x0),len=60+R()*150,sw=(R()-.5)*26;
      mk('path',{d:'M'+x+' '+y0+' C '+(x+sw)+' '+(y0+len*.4)+' '+(x-sw)+' '+(y0+len*.75)+' '+(x+sw*.5)+' '+(y0+len),stroke:'#143a20','stroke-width':1.4+R()*1.2,fill:'none',opacity:.85},g);
      for(var k=1;k<5;k++){var t=k/5;leaf(g,x+sw*(t*(1-t))*2-sw*.2*t,y0+len*t,9+R()*5,3.2,(k%2?1:-1)*(40+R()*30),GREENS[2+Math.floor(R()*4)],.95);}
    }
  }
  function ferns(g,R,x0,x1,y,n,scale){
    for(var i=0;i<n;i++){
      var x=x0+R()*(x1-x0),s=(.6+R()*.7)*scale,col=GREENS[Math.floor(R()*5)];
      for(var k=-3;k<=3;k++) frond(g,x,y,26*s+R()*10,k*18+R()*8,col,R);
    }
  }
  function defs(){
    var svg=document.getElementById('mapsvg'),d=svg.querySelector('defs');
    if(document.getElementById('barkG')) return;
    var bg=mk('linearGradient',{id:'barkG',x1:0,y1:0,x2:1,y2:0},d);
    [['0','#1c110a'],['.35','#4a301b'],['.6','#3a2514'],['1','#150c07']].forEach(function(s){mk('stop',{offset:s[0],'stop-color':s[1]},bg)});
    var rg=mk('linearGradient',{id:'rayG',x1:0,y1:0,x2:0,y2:1},d);
    mk('stop',{offset:0,'stop-color':'#ffe9a8','stop-opacity':.38},rg); mk('stop',{offset:1,'stop-color':'#ffe9a8','stop-opacity':0},rg);
    var wg=mk('linearGradient',{id:'waterG',x1:0,y1:0,x2:0,y2:1},d);
    mk('stop',{offset:0,'stop-color':'#2f8a78'},wg); mk('stop',{offset:1,'stop-color':'#0d3a38'},wg);
    var mist=mk('linearGradient',{id:'mistG',x1:0,y1:0,x2:0,y2:1},d);
    mk('stop',{offset:0,'stop-color':'#cfe9c8','stop-opacity':0},mist); mk('stop',{offset:1,'stop-color':'#cfe9c8','stop-opacity':.38},mist);
  }
  SCENE_ART.jungle={
    back:function(g){
      defs(); var R=rng(7);
      /* distant ridges in haze */
      mk('path',{d:'M0 300 C90 250 170 280 260 255 S420 240 520 270 S760 235 880 262 S1100 245 1200 270 V420 H0Z',fill:'#2c6b57',opacity:.55},g);
      mk('path',{d:'M0 330 C140 290 230 318 340 296 S560 290 680 312 S960 285 1200 318 V420 H0Z',fill:'#1d5240',opacity:.75},g);
      /* light shafts */
      [[170,60],[430,90],[690,50],[900,80],[1080,40]].forEach(function(r,i){
        mk('polygon',{points:(r[0])+',0 '+(r[0]+r[1])+',0 '+(r[0]+r[1]*1.9+40)+',430 '+(r[0]-r[1]*.5+40)+',430',fill:'url(#rayG)',opacity:.55+i%2*.2},g);});
      /* far trees */
      for(var i=0;i<16;i++){var x=20+i*75+R()*30; tree(g,R,x,380,150+R()*60,5+R()*3,.55,false);}
      mk('rect',{x:0,y:250,width:1200,height:180,fill:'url(#mistG)'},g);
      /* mid trees with canopy */
      [[90,430,40,10],[330,430,20,12],[560,420,30,11],[790,425,25,13],[1010,430,35,11],[1150,430,50,10]].forEach(function(t){tree(g,R,t[0],t[1],t[2],t[3],1,false)});
      vines(g,R,22,20,1180,60);
      /* river with the ford */
      mk('path',{d:'M-20 398 C150 388 320 410 520 396 S900 384 1220 402 V436 C900 424 700 442 480 430 S140 424 -20 438Z',fill:'url(#waterG)',opacity:.92},g);
      for(var w=0;w<26;w++){var wx=R()*1200,wy=402+R()*28; mk('path',{d:'M'+wx+' '+wy+' q 14 -3 28 0',stroke:'rgba(220,255,240,.5)','stroke-width':1.1,fill:'none'},g);}
      /* undergrowth along the bank */
      ferns(g,R,0,1200,430,26,1.1);
      for(var b=0;b<18;b++){var bx=R()*1200,by=424+R()*16; mk('ellipse',{cx:bx,cy:by,rx:24+R()*30,ry:10+R()*8,fill:GREENS[Math.floor(R()*4)],opacity:.9},g);}
      /* fireflies and drifting motes */
      for(var f=0;f<44;f++){
        var fx=40+R()*1120,fy=170+R()*300,fr=.9+R()*1.7;
        var c1=mk('circle',{cx:fx,cy:fy,r:fr*3.2,fill:'#ffe08a',opacity:.16,class:'ffly',style:'animation-delay:'+(R()*5).toFixed(2)+'s;animation-duration:'+(3+R()*3).toFixed(2)+'s'},g);
        mk('circle',{cx:fx,cy:fy,r:fr,fill:'#fff3c4',class:'ffly',style:'animation-delay:'+(R()*5).toFixed(2)+'s;animation-duration:'+(3+R()*3).toFixed(2)+'s'},g);
      }
      /* birds */
      [[300,120,1],[330,100,.8],[900,90,1.1],[930,110,.8]].forEach(function(b){mk('path',{d:'M'+b[0]+' '+b[1]+' q '+(8*b[2])+' '+(-9*b[2])+' '+(16*b[2])+' 0 q '+(8*b[2])+' '+(-9*b[2])+' '+(16*b[2])+' 0',stroke:'#0a2417','stroke-width':1.8,fill:'none','stroke-linecap':'round',opacity:.75},g)});
    },
    front:function(g){
      var R=rng(31);
      /* big foreground leaves in the corners, dark and slightly lit at the edges */
      var dark='#041b0d',mid='#0a3319';
      frond(g,-10,330,230,28,dark,R); frond(g,-10,330,200,52,mid,R); frond(g,-20,380,210,12,dark,R); frond(g,-10,270,170,60,mid,R);
      frond(g,1210,330,230,-28,dark,R); frond(g,1210,330,200,-52,mid,R); frond(g,1220,380,210,-12,dark,R); frond(g,1210,270,170,-60,mid,R);
      /* hanging leaves at the top corners */
      for(var i=0;i<14;i++){leaf(g,R()*210,-6,70+R()*70,14+R()*8,170+R()*40,i%2?dark:mid,.95); leaf(g,990+R()*210,-6,70+R()*70,14+R()*8,170+R()*40,i%2?dark:mid,.95);}
      /* grass blades on the bottom edge */
      for(var k=0;k<90;k++){var gx=R()*1200,gh=10+R()*22;mk('path',{d:'M'+gx+' 522 q '+((R()-.5)*8)+' '+(-gh*.6)+' '+((R()-.5)*14)+' '+(-gh),stroke:k%3?dark:mid,'stroke-width':1.6,fill:'none','stroke-linecap':'round'},g);}
    }
  };
})();
