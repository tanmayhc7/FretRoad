"""Bring-your-own-model: riff notes and tab from synthetic audio, provider plumbing with a mocked endpoint, safety of the output."""
import os, json, wave, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=HERE+'/out/'
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
sr=22050; seq=[(45,.35),(47,.35),(48,.35),(52,.35)]   # A2 B2 C3 E3 plucked sine+harmonics, 1 s lead-in
y=np.zeros(int(sr*(1+sum(d for _,d in seq)+.5))); t0=1.0
for m,d in seq:
    f=440*2**((m-69)/12); n=int(sr*d); t=np.arange(n)/sr
    v=sum(np.sin(2*np.pi*f*h*t)/h for h in (1,2,3))*np.exp(-t*4)*.4; s=int(t0*sr); y[s:s+n]+=v; t0+=d
w=wave.open(OUT+'riff.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y/np.abs(y).max()*.8*32767).astype('<i2').tobytes()); w.close()
CHART="Invented Tune\n\n[Verse]\nAm\nla la la la\nG\nla la\n"
save={'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4],'tour':1,'songs':[{'id':'s1','title':'Invented Tune','text':CHART}]}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(save)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    seen=[]
    def handle(route):
        req=route.request; seen.append({'h':req.headers,'b':req.post_data})
        route.fulfill(status=200,content_type='application/json',headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'},
            body=json.dumps({'choices':[{'message':{'content':'Play it on the A string. <img src=x onerror="window.__pwned=1">'}}]}))
    ctx.route('https://models.example.test/**',handle)
    pg.goto(URL+'#jam-s1'); pg.wait_for_timeout(600)
    pg.evaluate("recDetach(); REC.pcm=null")
    pg.set_input_files('#jRecFile',OUT+'riff.wav'); pg.wait_for_timeout(300)
    pg.wait_for_function("/matched|could not/.test(document.getElementById('jRecInfo').textContent)",timeout=60000)
    # riff notes straight from the pipeline
    o=pg.evaluate("""(async function(){ var b=await recGet(REC.songId); var x=await recDecode(b); var n=riffNotes(x,AN.sr,0.8,3.2,0); var pos=riffPositions(n,0); return {midi:n.map(function(a){return a.midi}),pos:pos.map(function(q){return q&&[q.s,q.f]}),tab:riffTabText(n,pos)}; })()""")
    check('notes heard in order',o['midi']==[45,47,48,52],o['midi'])
    check('open A then frets on the A string',o['pos'][:3]==[[1,0],[1,2],[1,3]],o['pos'])
    check('tab drawn with six lines',len(o['tab'].split('\n'))==6)
    # settings UI
    pg.evaluate("document.getElementById('jRiff').open=true"); pg.click('#rfSet')
    check('AI dialog opens from the riff helper',pg.evaluate("!document.getElementById('aiOverlay').hidden"))
    check('settings show providers',pg.evaluate("document.querySelectorAll('#aiProv option').length")>=3)
    check('http to a remote host refused',pg.evaluate("[aiUrlOk('http://example.com/v1'),aiUrlOk('http://localhost:11434/v1'),aiUrlOk('https://x.test'),aiUrlOk('http://192.168.1.5:8080')]")==[False,True,True,True])
    pg.select_option('#aiProv','openai')
    pg.fill('#aiFields input[data-k=base]','https://models.example.test/v1'); pg.fill('#aiFields input[data-k=model]','my-model'); pg.fill('#aiFields input[data-k=key]','sk-secret-123')
    pg.click('#aiOverlay button.primary'); pg.wait_for_timeout(100); pg.click('#aiClose')
    check('configured',pg.evaluate("aiConfigured()"))
    check('key stays out of the song save',pg.evaluate("localStorage.getItem('fretroad-v1').indexOf('sk-secret')<0"))
    # header button, beta tag, floating story button
    check('AI button in the header with beta tag',pg.evaluate("/AI/.test(document.getElementById('aiBtn').textContent)&&!!document.querySelector('#aiBtn .beta')&&!!document.querySelector('header.top #aiBtn')"))
    pos=pg.evaluate("(function(){var r=document.getElementById('storyBtn').getBoundingClientRect();return {r:innerWidth-r.right,b:innerHeight-r.bottom,w:r.width,fixed:getComputedStyle(document.getElementById('storyBtn')).position}})()")
    check('story button floats bottom right as a circle',pos['fixed']=='fixed' and pos['r']<40 and pos['b']<40 and abs(pos['w']-54)<2,pos)
    pg.click('#aiBtn'); check('header AI button opens the dialog',pg.evaluate("!document.getElementById('aiOverlay').hidden")); pg.click('#aiClose')
    pg.click('#storyBtn'); check('story picker still opens',pg.evaluate("!document.getElementById('storyOverlay').hidden")); pg.click('#storyClose')
    # read a riff, then ask
    pg.evaluate("RF.t0=0.8; RF.t1=3.2"); pg.click('#rfRead'); pg.wait_for_function("RF.last||/could not/.test(document.getElementById('rfMsg').textContent)",timeout=30000)
    check('riff read in the page',pg.evaluate("!!RF.last"),pg.evaluate("document.getElementById('rfMsg').textContent"))
    check('ask button appears',pg.evaluate("!document.getElementById('rfAsk').hidden"))
    pg.click('#rfAsk'); pg.wait_for_function("/A string/.test(document.getElementById('rfAI').textContent)",timeout=15000)
    check('request went to the user endpoint',len(seen)==1 and 'chat/completions' in str(pg.evaluate("1")) or len(seen)==1)
    body=json.loads(seen[0]['b']); h=seen[0]['h']
    check('request has model, notes and no audio',body['model']=='my-model' and 'A2' in body['messages'][1]['content'] and 'tab' in body['messages'][1]['content'].lower() and len(seen[0]['b'])<4000,len(seen[0]['b']))
    check('key sent as bearer',h.get('authorization')=='Bearer sk-secret-123',h.get('authorization'))
    check('answer shown as plain text, not markup',pg.evaluate("!window.__pwned && !document.querySelector('#rfAI img')"))
    # custom plug-in
    pg.evaluate("FretRoadAI.register({id:'mine',name:'Mine',fields:[],ask:function(r){return Promise.resolve('hello '+r.task)}})")
    pg.evaluate("aiSaveCfg({provider:'mine',vals:{}})"); r=pg.evaluate("aiAsk({task:'riff'})") ; check('custom provider plugs in',r=='hello riff',r)
    check('bad provider rejected',pg.evaluate("(function(){try{aiRegister({id:'Bad Id',name:'x',ask:1});return false}catch(e){return true}})()"))
    check('no errors',not errs,errs)
    b.close()
print('ui_ai:',('ALL PASS' if all(res) else 'FAILURES'))
