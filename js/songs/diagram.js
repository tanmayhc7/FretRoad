/* Chord diagram as an SVG string. Strings run low to high left to right (mirrored for left-handed players). */
function chordDiagram(sym,opt){
  opt=opt||{}; var sh=chordShape(sym), W=opt.w||120, H=Math.round(W*1.22), lefty=!!save.lefty;
  if(!sh) return '<svg class="cdia" viewBox="0 0 120 146" role="img" aria-label="'+sym+', no diagram"><text x="60" y="78" text-anchor="middle" class="cd-sym">'+sym+'</text></svg>';
  var lo=sh.lo, base=lo>3?lo:1, left=24, top=34, gx=(120-left-12)/5, gy=19, rows=5, svg='';
  var xs=function(i){return left+(lefty?5-i:i)*gx}, fy=function(f){return top+(f-base+.5)*gy};
  svg+='<svg class="cdia" viewBox="0 0 120 146" role="img" aria-label="'+sym+' chord diagram, frets '+sh.frets.map(function(f){return f<0?'x':f}).join(' ')+'">';
  svg+='<text x="60" y="14" text-anchor="middle" class="cd-sym">'+sym+'</text>';
  if(base===1) svg+='<rect x="'+(left-1)+'" y="'+(top-3)+'" width="'+(5*gx+2)+'" height="4" rx="1.5" class="cd-nut"/>';
  else svg+='<text x="'+(lefty?120-10:10)+'" y="'+(top+gy*.62)+'" text-anchor="middle" class="cd-base">'+base+'</text>';
  for(var r=0;r<=rows;r++) svg+='<line x1="'+left+'" x2="'+(left+5*gx)+'" y1="'+(top+r*gy)+'" y2="'+(top+r*gy)+'" class="cd-fret"/>';
  for(var s=0;s<6;s++) svg+='<line x1="'+xs(s)+'" x2="'+xs(s)+'" y1="'+top+'" y2="'+(top+rows*gy)+'" class="cd-str"/>';
  sh.frets.forEach(function(f,i){
    if(f<0) svg+='<g class="cd-x" transform="translate('+xs(i)+',24)"><line x1="-4" y1="-4" x2="4" y2="4"/><line x1="-4" y1="4" x2="4" y2="-4"/></g>';
    else if(f===0) svg+='<circle cx="'+xs(i)+'" cy="24" r="4" class="cd-open"/>';
  });
  if(sh.barre){ var a=sh.frets.indexOf(lo),z=sh.frets.lastIndexOf(lo); var x1=Math.min(xs(a),xs(z)),x2=Math.max(xs(a),xs(z)); svg+='<rect x="'+(x1-6)+'" y="'+(fy(lo)-6)+'" width="'+(x2-x1+12)+'" height="12" rx="6" class="cd-dot"/>'; }
  sh.frets.forEach(function(f,i){ if(f>0&&f-base<rows&&!(sh.barre&&f===lo)) svg+='<circle cx="'+xs(i)+'" cy="'+fy(f)+'" r="6.4" class="cd-dot"/>'; });
  return svg+'</svg>';
}
