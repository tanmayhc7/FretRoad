/* Finer detail for the worlds: procedural ridgelines, conifers, a textured moon with craters, turbulence clouds,
   bright stars with halos and diffraction spikes, bark and leaf shading. All seeded, so it looks the same every time. */
var WD_UID=0;
function wUid(p){return (p||'u')+(++WD_UID);}
/* midpoint-displaced ridgeline: returns the filled shape and the crest line */
function wRidge(R,x0,x1,baseY,amp,rough){
  var pts=[[x0,baseY+(R()-.5)*amp*.4],[x1,baseY+(R()-.5)*amp*.4]], a=amp;
  for(var it=0;it<8;it++){ var out=[]; for(var i=0;i<pts.length-1;i++){ var p=pts[i],q=pts[i+1]; out.push(p); out.push([(p[0]+q[0])/2,(p[1]+q[1])/2+(R()-.5)*2*a]); } out.push(pts[pts.length-1]); pts=out; a*=rough; }
  var top='M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' L');
  return {d:top+' V1300 H'+x0+'Z',top:top};
}
function wRidgeDraw(g,R,x0,x1,baseY,amp,rough,fill,rim){ var r=wRidge(R,x0,x1,baseY,amp,rough); se('path',{d:r.d,fill:fill},g); if(rim) se('path',{d:r.top,fill:'none',stroke:rim,'stroke-width':1.3,'stroke-linejoin':'round'},g); return r; }
/* ragged conifer / cypress */
function wConifer(g,R,x,y,h,fill,slim){
  var n=7+Math.floor(R()*4), w=h*(slim||.16), L=[],Rt=[];
  for(var i=0;i<=n;i++){ var t=i/n, yy=y-h+t*h*.96, ww=w*(.12+t*.88)*(.8+R()*.35); L.push([x-ww,yy+h*.03*R()]); L.push([x-ww*.45,yy-h*.012]); Rt.push([x+ww,yy+h*.03*R()]); Rt.push([x+ww*.45,yy-h*.012]); }
  var d='M'+x+' '+(y-h); L.forEach(function(p){d+=' L'+p[0].toFixed(1)+' '+p[1].toFixed(1)}); d+=' L'+(x-2)+' '+y+' L'+(x+2)+' '+y; Rt.reverse().forEach(function(p){d+=' L'+p[0].toFixed(1)+' '+p[1].toFixed(1)}); d+='Z';
  se('path',{d:d,fill:fill},g);
}
/* a moon with maria, craters, limb darkening; cut={x,y} turns it into a crescent */
function wMoon(g,d,cx,cy,r,cut){
  var u=wUid('mn'), R=wrng(cx*7+cy);
  var cp=se('clipPath',{id:u+'c'},d); se('circle',{cx:cx,cy:cy,r:r},cp);
  var gr=se('radialGradient',{id:u+'g',cx:.4,cy:.36,r:.85},d); [[0,'#fffff8'],[.6,'#ecebdf'],[1,'#b4bac8']].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1]},gr)});
  var lm=se('radialGradient',{id:u+'l',cx:.5,cy:.5,r:.5},d); [[.62,'#283250',0],[1,'#283250',.5]].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},lm)});
  var f=se('filter',{id:u+'t',x:'0%',y:'0%',width:'100%',height:'100%'},d); se('feTurbulence',{type:'fractalNoise',baseFrequency:'.026',numOctaves:5,seed:9},f); se('feColorMatrix',{values:'0 0 0 0 .3  0 0 0 0 .32  0 0 0 0 .38  1.9 0 0 0 -.62'},f);
  var bl=se('filter',{id:u+'b',x:'-30%',y:'-30%',width:'160%',height:'160%'},d); se('feGaussianBlur',{stdDeviation:r*.035},bl);
  var grp=se('g',{},g);
  if(cut){ var m=se('mask',{id:u+'m'},d); se('rect',{x:cx-r*2,y:cy-r*2,width:r*4,height:r*4,fill:'#fff'},m); se('circle',{cx:cx+cut.x,cy:cy+cut.y,r:r*.94,fill:'#000'},m); grp.setAttribute('mask','url(#'+u+'m)'); }
  var c=se('g',{'clip-path':'url(#'+u+'c)'},grp);
  se('circle',{cx:cx,cy:cy,r:r,fill:'url(#'+u+'g)'},c);
  [[-.3,-.2,.32,.2],[.1,-.36,.22,.16],[-.06,.12,.3,.2],[.32,.16,.2,.15],[-.34,.3,.15,.12],[.04,-.08,.16,.12]].forEach(function(m){ se('ellipse',{cx:cx+m[0]*r,cy:cy+m[1]*r,rx:m[2]*r,ry:m[2]*r*(.7+R()*.3),fill:'#6f7688',opacity:.34,filter:'url(#'+u+'b)',transform:'rotate('+Math.floor(R()*180)+' '+(cx+m[0]*r)+' '+(cy+m[1]*r)+')'},c); });
  se('rect',{x:cx-r,y:cy-r,width:r*2,height:r*2,filter:'url(#'+u+'t)',opacity:.6},c);
  for(var i=0;i<90;i++){ var a=R()*6.283, rr=Math.sqrt(R())*r*.92, x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr, s=r*(.012+R()*R()*.055);
    se('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:s.toFixed(2),fill:'rgba(30,36,56,.2)'},c); se('circle',{cx:(x-s*.28).toFixed(1),cy:(y-s*.28).toFixed(1),r:(s*.78).toFixed(2),fill:'rgba(255,255,255,.34)'},c); }
  se('circle',{cx:cx,cy:cy,r:r,fill:'url(#'+u+'l)'},c);
}
/* turbulence cloud bank; col is the body colour, lit the lining */
function wCloud(g,d,x,y,w,h,col,op,seed,freq){
  var u=wUid('cl'), rgb=col;
  var f=se('filter',{id:u+'f',x:'0%',y:'0%',width:'100%',height:'100%'},d); se('feTurbulence',{type:'fractalNoise',baseFrequency:freq||'.005 .016',numOctaves:5,seed:seed||3},f);
  se('feColorMatrix',{values:'0 0 0 0 '+rgb[0]+'  0 0 0 0 '+rgb[1]+'  0 0 0 0 '+rgb[2]+'  3.4 0 0 0 -1.35'},f); se('feGaussianBlur',{stdDeviation:2.2},f);
  var gg=se('radialGradient',{id:u+'g'},d); [[0,'#fff',1],[.55,'#fff',.7],[1,'#fff',0]].forEach(function(s){se('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},gg)});
  var m=se('mask',{id:u+'m',maskUnits:'userSpaceOnUse',x:x,y:y,width:w,height:h},d); se('rect',{x:x,y:y,width:w,height:h,fill:'url(#'+u+'g)'},m);
  se('rect',{x:x,y:y,width:w,height:h,filter:'url(#'+u+'f)',mask:'url(#'+u+'m)',opacity:op},g);
}
/* bright stars: soft halo plus diffraction spikes */
function wBrightStars(g,d,R,n,xmax,ymax){
  var hg=se('radialGradient',{id:'bsHalo'+(++WD_UID)},d), id='bsHalo'+WD_UID; se('stop',{offset:0,'stop-color':'#fff','stop-opacity':.9},hg); se('stop',{offset:.25,'stop-color':'#cfe0ff','stop-opacity':.28},hg); se('stop',{offset:1,'stop-color':'#9fb8ff','stop-opacity':0},hg);
  for(var i=0;i<n;i++){ var x=R()*xmax, y=R()*ymax, s=(.7+R()*1.2); var warm=R()<.25;
    se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:(14*s).toFixed(1),fill:'url(#'+id+')',opacity:warm?.7:1},g);
    se('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:(1.5*s).toFixed(1),fill:warm?'#ffe2b8':'#fff'},g);
    if(s>1.1) se('path',{d:'M'+(x-12*s)+' '+y+' H'+(x+12*s)+' M'+x+' '+(y-12*s)+' V'+(y+12*s),stroke:'rgba(255,255,255,.45)','stroke-width':.7},g); }
}
