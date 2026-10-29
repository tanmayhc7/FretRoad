/* The SVG fretboard component */
/* ---------- sky ---------- */
var cv=$('#sky'),cx=cv.getContext('2d'),stars=[],W=0,H=0;
function sizeSky(){
  var dpr=Math.min(2,window.devicePixelRatio||1); W=innerWidth; H=innerHeight;
  cv.width=W*dpr; cv.height=H*dpr; cx.setTransform(dpr,0,0,dpr,0,0);
  var n=Math.round(W*H/8500); stars=[];
  for(var i=0;i<n;i++) stars.push({x:Math.random()*W,y:Math.random()*H*.9,r:Math.random()*1.3+.2,p:Math.random()*6.28,s:.4+Math.random()*1.3});
  drawSky(0);
}
function drawSky(t){
  cx.clearRect(0,0,W,H); cx.fillStyle='#eeeaf8';
  for(var i=0;i<stars.length;i++){var s=stars[i]; cx.globalAlpha=Math.max(.1,.38+.42*Math.sin(t/900*s.s+s.p)); cx.beginPath(); cx.arc(s.x,s.y,s.r,0,6.283); cx.fill();}
  cx.globalAlpha=1;
}
var lastT=0;
function loop(t){ if(t-lastT>45){drawSky(t);lastT=t;} requestAnimationFrame(loop); }
sizeSky(); addEventListener('resize',sizeSky); if(!RM) requestAnimationFrame(loop);

/* ---------- fretboard ---------- */
var boardCount=0;
function createBoard(host,onCell){
  var u='b'+(boardCount++), ns='http://www.w3.org/2000/svg';
  var thick=[1.3,1.6,2,2.6,3.2,3.8], wound=[0,0,0,1,1,1];
  var h='<svg viewBox="0 0 1180 322" role="group" aria-label="Guitar fretboard, open strings and frets 1 to 12">';
  h+='<defs>'+
    '<linearGradient id="'+u+'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2519"/><stop offset=".5" stop-color="#341912"/><stop offset="1" stop-color="#25110c"/></linearGradient>'+
    '<linearGradient id="'+u+'hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#150a08"/><stop offset="1" stop-color="#2b150f"/></linearGradient>'+
    '<linearGradient id="'+u+'fr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d7440"/><stop offset=".5" stop-color="#f3dd9c"/><stop offset="1" stop-color="#8d7440"/></linearGradient>'+
    '<radialGradient id="'+u+'pe"><stop offset="0" stop-color="#fff7e6"/><stop offset="1" stop-color="#cdbfa0"/></radialGradient>'+
    '<radialGradient id="GLASS_'+u+'" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#b9fff1"/><stop offset="1" stop-color="#2fae9b"/></radialGradient>'+
    '<radialGradient id="BRASS_'+u+'" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff0be"/><stop offset="1" stop-color="#c48f2e"/></radialGradient>'+
    '<filter id="'+u+'gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.42" numOctaves="3" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .78  0 0 0 0 .46  0 0 0 0 .3  0 0 0 .55 -.16"/></filter>'+
    '<filter id="'+u+'sh" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="5"/></filter>'+
    '</defs>';
  h+='<rect x="20" y="40" width="64" height="224" rx="14" fill="url(#'+u+'hd)"/>';
  h+='<rect x="84" y="40" width="1072" height="244" rx="4" fill="#000" opacity=".45" filter="url(#'+u+'sh)"/>';
  h+='<rect x="84" y="26" width="1072" height="250" fill="url(#'+u+'w)"/>';
  h+='<rect x="84" y="26" width="1072" height="250" filter="url(#'+u+'gr)" opacity=".55"/>';
  h+='<rect x="84" y="26" width="1072" height="9" fill="#000" opacity=".25"/><rect x="84" y="267" width="1072" height="9" fill="#000" opacity=".3"/>';
  [3,5,7,9].forEach(function(f){h+='<circle cx="'+cellX(f)+'" cy="152" r="9" fill="url(#'+u+'pe)" opacity=".62"/>'});
  h+='<circle cx="'+cellX(12)+'" cy="112" r="9" fill="url(#'+u+'pe)" opacity=".62"/><circle cx="'+cellX(12)+'" cy="192" r="9" fill="url(#'+u+'pe)" opacity=".62"/>';
  h+='<rect x="82" y="26" width="9" height="250" fill="#efe6cf"/><rect x="88" y="26" width="3" height="250" fill="#b9ad8f"/>';
  for(var n=1;n<=FRETS;n++){var fx=posX(n); h+='<rect x="'+(fx-2.3)+'" y="26" width="4.6" height="250" fill="url(#'+u+'fr)"/><rect x="'+(fx+2)+'" y="26" width="2" height="250" fill="#000" opacity=".28"/>';}
  for(var s=0;s<6;s++){
    var y=rowY(s);
    h+='<g class="str" data-s="'+s+'"><line x1="62" y1="'+y+'" x2="1156" y2="'+y+'" stroke="'+(wound[s]?'#b38a4a':'#cfd7ea')+'" stroke-width="'+thick[s]+'" stroke-linecap="round"/>'+
      (wound[s]?'<line x1="62" y1="'+y+'" x2="1156" y2="'+y+'" stroke="#f1d9a2" stroke-width="'+(thick[s]*.55)+'" stroke-dasharray="1 1.7" opacity=".7"/>':'<line x1="62" y1="'+(y-thick[s]*.25)+'" x2="1156" y2="'+(y-thick[s]*.25)+'" stroke="#fff" stroke-width=".7" opacity=".55"/>')+'</g>';
  }
  for(var s2=0;s2<6;s2++){h+='<text x="50" y="'+(rowY(s2)+4.5)+'" font-family="Albert Sans,sans-serif" font-size="13" font-weight="700" fill="#a9a8cf" text-anchor="middle" opacity=".7">'+['E','B','G','D','A','E'][s2]+'</text>';}
  for(var f2=1;f2<=FRETS;f2++){var big=[3,5,7,9,12].indexOf(f2)>-1; h+='<text x="'+cellX(f2)+'" y="306" font-family="Albert Sans,sans-serif" font-size="'+(big?15:12)+'" font-weight="'+(big?700:500)+'" fill="'+(big?'#e6b95f':'#a9a8cf')+'" text-anchor="middle" opacity="'+(big?1:.7)+'">'+f2+'</text>';}
  h+='<text x="50" y="306" font-family="Albert Sans,sans-serif" font-size="12" fill="#a9a8cf" text-anchor="middle" opacity=".7">open</text>';
  h+='<g class="links"></g><g class="orbs"></g><g class="fx"></g><g class="hits">';
  for(var a=0;a<6;a++)for(var b=0;b<=FRETS;b++){
    h+='<circle class="hit" r="18" cx="'+cellX(b)+'" cy="'+rowY(a)+'" data-s="'+a+'" data-f="'+b+'" role="button" tabindex="'+((a===0&&b===0)?0:-1)+'" aria-label="'+SNAME[a]+' string, '+(b===0?'open':'fret '+b)+'"/>';
  }
  h+='</g></svg>';
  h=h.replace(/url\(#GLASS\)/g,'');
  host.innerHTML=h;
  var svg=host.querySelector('svg'),gl=svg.querySelector('.links'),go=svg.querySelector('.orbs'),gf=svg.querySelector('.fx');
  var map={};
  var css=document.createElement('style');
  css.textContent='#'+host.id+' .orb.found .core{fill:url(#GLASS_'+u+')}#'+host.id+' .orb.root .core,#'+host.id+' .orb.tone .core{fill:url(#BRASS_'+u+')}';
  host.appendChild(css);
  function el(name,attrs){var e=document.createElementNS(ns,name); for(var k in attrs) e.setAttribute(k,attrs[k]); return e;}
  svg.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.hit'); if(t) onCell(+t.dataset.s,+t.dataset.f);});
  svg.addEventListener('keydown',function(e){
    var t=e.target; if(!t.classList||!t.classList.contains('hit')) return;
    var s=+t.dataset.s,f=+t.dataset.f;
    if(e.key==='Enter'||e.key===' '){e.preventDefault(); onCell(s,f); return;}
    var d={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key]; if(!d) return;
    e.preventDefault(); var ns2=Math.max(0,Math.min(5,s+d[0])),nf=Math.max(0,Math.min(FRETS,f+d[1]));
    var nt=svg.querySelector('.hit[data-s="'+ns2+'"][data-f="'+nf+'"]'); t.tabIndex=-1; nt.tabIndex=0; nt.focus();
  });
  var api={
    orb:function(key,o){
      if(map[key]) map[key].remove();
      var g=el('g',{class:'orb '+o.kind,transform:'translate('+cellX(o.f)+','+rowY(o.s)+')'});
      var inner=el('g',{class:'pop'});
      inner.appendChild(el('circle',{class:'halo',r:23}));
      inner.appendChild(el('circle',{class:'core',r:15.5}));
      var t=el('text',{y:4.6}); t.textContent=o.label||''; inner.appendChild(t);
      g.appendChild(inner); go.appendChild(g); map[key]=g;
    },
    drop:function(key){if(map[key]){map[key].remove(); delete map[key];}},
    clearOrbs:function(){go.innerHTML=''; map={};},
    dim:function(key,on){if(map[key]) map[key].classList.toggle('dim',on)},
    flash:function(s,f,label,kind,ms){var k='fl'+s+','+f; this.orb(k,{s:s,f:f,label:label,kind:kind||'miss'}); var self=this; setTimeout(function(){self.drop(k)},ms||1100);},
    vib:function(s){var g=svg.querySelector('.str[data-s="'+s+'"]'); g.classList.remove('vib'); void g.getBoundingClientRect(); g.classList.add('vib');},
    link:function(a,b,label,straight){
      var x1=cellX(a[1]),y1=rowY(a[0]),x2=cellX(b[1]),y2=rowY(b[0]);
      var d=straight?('M'+x1+' '+y1+' L'+x2+' '+y2):('M'+x1+' '+y1+' Q'+((x1+x2)/2-6)+' '+(Math.min(y1,y2)-26)+' '+x2+' '+y2);
      var p=el('path',{class:'link',d:d,pathLength:1}); gl.appendChild(p);
      if(label){var t=el('text',{class:'linklbl',x:(x1+x2)/2+(straight?30:0),y:Math.min(y1,y2)-(straight?-((Math.abs(y2-y1))/2):30)}); t.textContent=label; gl.appendChild(t);}
    },
    clearLinks:function(){gl.innerHTML='';},
    burst:function(s,f,color){
      if(RM) return; var x=cellX(f),y=rowY(s);
      for(var i=0;i<12;i++){
        var c=el('circle',{cx:x,cy:y,r:2+Math.random()*2.4,fill:color||'#63d8c3'}); gf.appendChild(c);
        var ang=Math.random()*6.283,dist=28+Math.random()*44;
        var an=c.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px)',opacity:0}],{duration:650+Math.random()*250,easing:'cubic-bezier(.2,.7,.3,1)'});
        an.onfinish=(function(n){return function(){n.remove()}})(c);
      }
    },
    cell:function(s,f){return {x:cellX(f),y:rowY(s)}}
  };
  return api;
}

