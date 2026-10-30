/* Bring your own model. FretRoad ships with no AI model and no AI account: this is only a plug. You choose a provider, give it
   your own endpoint and key, and requests go straight from your browser to it. Nothing passes through FretRoad.
   Add your own provider with FretRoadAI.register({id,name,fields:[{key,label,def,secret}],ask:function(req,cfg){return Promise<string>}}).
   req = {task, system, user, data}. See docs/BRING_YOUR_OWN_MODEL.md. */
var AI={providers:{},order:[],cfgKey:(typeof TESTER!=='undefined'&&TESTER)?'fretroad-tester-ai':'fretroad-ai',timeout:90000};
function aiRegister(p){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9-]{1,30}$/.test(p.id)||typeof p.name!=='string'||typeof p.ask!=='function') throw new Error('A provider needs an id (a-z, 0-9, -), a name and an ask() function.');
  p.fields=Array.isArray(p.fields)?p.fields:[]; if(!AI.providers[p.id]) AI.order.push(p.id); AI.providers[p.id]=p; return p.id;
}
window.FretRoadAI={register:aiRegister,ask:function(r){return aiAsk(r)},providers:AI.providers};
function aiCfg(){ try{ var o=JSON.parse(localStorage.getItem(AI.cfgKey)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
function aiSaveCfg(c){ try{ localStorage.setItem(AI.cfgKey,JSON.stringify(c)); }catch(e){} }
function aiValues(id){ var c=aiCfg(),p=AI.providers[id]; if(!p) return {}; var v=(c.vals&&c.vals[id])||{},o={}; p.fields.forEach(function(f){ o[f.key]=v[f.key]!==undefined?v[f.key]:(f.def||''); }); return o; }
function aiConfigured(){ var c=aiCfg(),p=AI.providers[c.provider]; if(!p) return false; var v=aiValues(c.provider); return p.fields.every(function(f){ return f.optional||!!String(v[f.key]||'').trim(); }); }
/* plain http is only for a model on your own machine or network, so a key is never sent in the clear across the internet */
function aiUrlOk(u){
  var m=/^(https?):\/\/([^\/:?#]+|\[[^\]]+\])(?::\d+)?(?:[\/?#]|$)/i.exec(String(u||'').trim()); if(!m) return false;
  if(m[1].toLowerCase()==='https') return true; var h=m[2].toLowerCase();
  return h==='localhost'||h==='[::1]'||/^127\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h)||/\.local$/.test(h);
}
function aiFetch(url,opts){
  if(!aiUrlOk(url)) return Promise.reject(new Error('Use an https address (http is only allowed for a model on this computer or your own network).'));
  var ctl=typeof AbortController!=='undefined'?new AbortController():null, to=ctl&&setTimeout(function(){ctl.abort()},AI.timeout); if(ctl) opts.signal=ctl.signal;
  return fetch(url,opts).then(function(r){ if(to) clearTimeout(to); return r.text().then(function(t){
      if(!r.ok) throw new Error('The model answered with an error ('+r.status+'): '+t.slice(0,200));
      try{ return JSON.parse(t); }catch(e){ throw new Error('The model did not answer with JSON.'); } }); })
    .catch(function(e){ if(to) clearTimeout(to); if(e&&e.name==='AbortError') throw new Error('The model took too long to answer.');
      if(e instanceof TypeError) throw new Error('Could not reach it. Check the address. A model on your computer must allow this page in its CORS settings (see docs/BRING_YOUR_OWN_MODEL.md).'); throw e; });
}
function aiAsk(req){
  var c=aiCfg(),p=AI.providers[c.provider]; if(!p) return Promise.reject(new Error('No AI model is set up yet. Open "AI settings" and plug in your own.'));
  var v=aiValues(c.provider); req=req||{};
  return Promise.resolve().then(function(){ return p.ask({task:req.task||'',system:String(req.system||''),user:String(req.user||''),data:req.data||null},v); })
    .then(function(t){ if(t&&typeof t==='object'&&typeof t.text==='string') t=t.text; if(typeof t!=='string'||!t.trim()) throw new Error('The model sent back no text.'); return t.slice(0,20000); });
}
aiRegister({id:'openai',name:'OpenAI-compatible (OpenAI, Ollama, LM Studio, OpenRouter...)',fields:[
  {key:'base',label:'Address',def:'http://localhost:11434/v1'},{key:'model',label:'Model name',def:''},{key:'key',label:'Key (leave empty for a local model)',secret:true,optional:true}],
  ask:function(r,v){ var h={'Content-Type':'application/json'}; if(v.key) h.Authorization='Bearer '+v.key;
    return aiFetch(String(v.base).replace(/\/+$/,'')+'/chat/completions',{method:'POST',headers:h,body:JSON.stringify({model:v.model,temperature:.2,messages:[{role:'system',content:r.system},{role:'user',content:r.user}]})})
      .then(function(j){ var m=j&&j.choices&&j.choices[0]&&j.choices[0].message; return m&&m.content; }); }});
aiRegister({id:'anthropic',name:'Anthropic Messages API',fields:[
  {key:'base',label:'Address',def:'https://api.anthropic.com'},{key:'model',label:'Model name',def:''},{key:'key',label:'API key',secret:true}],
  ask:function(r,v){ return aiFetch(String(v.base).replace(/\/+$/,'')+'/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':v.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:v.model,max_tokens:1500,system:r.system,messages:[{role:'user',content:r.user}]})})
      .then(function(j){ return j&&j.content&&j.content[0]&&j.content[0].text; }); }});
aiRegister({id:'json',name:'My own server (simple JSON)',fields:[
  {key:'url',label:'Address that receives the request',def:''},{key:'auth',label:'Authorization header value (optional)',secret:true,optional:true}],
  ask:function(r,v){ var h={'Content-Type':'application/json'}; if(v.auth) h.Authorization=v.auth;
    return aiFetch(v.url,{method:'POST',headers:h,body:JSON.stringify({task:r.task,system:r.system,user:r.user,data:r.data})}).then(function(j){ return typeof j==='string'?j:(j&&j.text); }); }});
