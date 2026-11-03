/* Atmosphere for the worlds: haze bands between depth layers and soft focus on distant layers. Runs after a world is built; changes only how it is lit. */
var ATMOS={
  road:{fog:[[760,565,110,'#3a62c8',.08],[520,690,120,'#1a2a7a',.09],[300,805,110,'#02040f',.35]]},
  delhi:{fog:[[860,650,200,'#ff8a5c',.24],[540,730,160,'#9a5ad0',.20],[380,810,130,'#ffb070',.15]]},
  valley:{fog:[[700,560,120,'#7ab8d8',.10],[500,690,130,'#2a6a8a',.10],[300,805,110,'#02060c',.35]]}
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
var ATMOS_EXTRA={};  /* per-world extra layers go here, keyed by world id */
(function(){
  var orig=setWorld;
  setWorld=function(id){
    orig(id); var a=ATMOS[id], cam=document.getElementById('wcam'); if(!a||!cam) return;
    try{ if(ATMOS_EXTRA[id]) ATMOS_EXTRA[id](cam); a.fog.forEach(function(f,i){wFog(cam,f[0],f[1],f[2],f[3],f[4],i)}); wSoftFocus(); if(typeof applyPrefs==='function'){ applyPrefs(); motionProbe(); } }catch(e){ if(window.console) console.error('atmos',e); }
  };
})();
