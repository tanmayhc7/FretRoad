/* Feedback: a small form that opens a pre-filled GitHub issue (no server, no tokens, nothing sent until the person submits there). */
var FB_REPO='tanmayhc7/FretRoad';
function fbDetails(){
  return ['Page: '+(location.hash||'#map'),'Story: '+(save.story||'none'),'Browser: '+navigator.userAgent,'Screen: '+screen.width+'x'+screen.height+' @'+(window.devicePixelRatio||1)+'x, window '+innerWidth+'x'+innerHeight,
    'Mic: '+(Mic&&Mic.on?'on':'off')+', scenery motion: '+(save.motion||'auto')+(TESTER?', tester build':'')].join('\n');
}
function fbText(){
  var b=$('#fbBody').value.trim(), kind=$('#fbKind').options[$('#fbKind').selectedIndex].text;
  return (b||'(no details yet)')+'\n\n---\nType: '+kind+($('#fbInfo').checked?'\n'+fbDetails():'');
}
function fbUrl(){
  var title=($('#fbTitle').value.trim()||'Feedback'), body=fbText(), label={bug:'bug',idea:'enhancement',question:'question'}[$('#fbKind').value];
  var url='https://github.com/'+FB_REPO+'/issues/new?title='+encodeURIComponent(title)+'&labels='+label+'&body=';
  var room=7000-url.length; var enc=encodeURIComponent(body); if(enc.length>room){ enc=encodeURIComponent(body.slice(0,Math.max(200,Math.floor(room/3)))+'\n\n(shortened; paste the rest here)'); }
  return url+enc;
}
function fbSync(){ $('#fbPrev').textContent=$('#fbTitle').value.trim()+'\n\n'+fbText(); }
function fbOpen(prefill){
  $('#fbOverlay').hidden=false; if(prefill){ if(prefill.title) $('#fbTitle').value=prefill.title; if(prefill.body) $('#fbBody').value=prefill.body; if(prefill.kind) $('#fbKind').value=prefill.kind; }
  fbSync(); $('#fbTitle').focus();
}
(function(){
  ['fbKind','fbTitle','fbBody','fbInfo'].forEach(function(id){ $('#'+id).addEventListener('input',fbSync); $('#'+id).addEventListener('change',fbSync); });
  $('#fbOpen').addEventListener('click',function(){fbOpen()});
  $('#fbClose').addEventListener('click',function(){$('#fbOverlay').hidden=true});
  $('#fbOverlay').addEventListener('click',function(e){ if(e.target===$('#fbOverlay')) $('#fbOverlay').hidden=true; });
  $('#fbSend').addEventListener('click',function(){ if(!$('#fbTitle').value.trim()&&!$('#fbBody').value.trim()){ toast('Write a line or two first.'); return; } window.open(fbUrl(),'_blank','noopener'); });
  $('#fbCopy').addEventListener('click',function(){
    var t=$('#fbTitle').value.trim()+'\n\n'+fbText();
    function ok(){ toast('Copied. Paste it into an email or message.'); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){toast('Could not copy. Select the preview text instead.')}); else toast('Select the preview text and copy it.');
  });
  if(window.__FRETROAD_TEST) window.__FRETROAD_TEST.fbUrl=fbUrl;
})();
