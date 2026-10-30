import os
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
OUT=os.path.join(HERE,'out')+'/'
os.makedirs(OUT,exist_ok=True)
os.chdir(HERE)
import json, sys, time
from playwright.sync_api import sync_playwright
D=OUT
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
errors=[]; results=[]
def check(name,cond,extra=''):
    results.append((name,bool(cond),extra)); print(('PASS ' if cond else 'FAIL ')+name+(' '+str(extra) if (extra and not cond) else ''))
SAVE=json.dumps({'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})
INIT="window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE)
OPEN=[64,59,55,50,45,40]
def newpage(b,wav=None,mic=True):
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone'] if mic else [])
    ctx.add_init_script(INIT)
    p=ctx.new_page()
    p.on('pageerror',lambda e:errors.append('pageerror: '+str(e)))
    p.on('console',lambda m:errors.append('console.error: '+m.text) if m.type=='error' and 'fonts' not in m.text.lower() and 'ERR_' not in m.text and 'Permission' not in m.text else None)
    p.goto(URL); p.wait_for_selector('#v-map:not([hidden])'); return p
def hit(page,board,s,f):
    page.evaluate("([b,s,f])=>{document.querySelector('#'+b+' .hit[data-s=\"'+s+'\"][data-f=\"'+f+'\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))}",[board,s,f])
def qstate(page):
    return page.evaluate("(()=>{const Q=window.__FRETROAD_TEST.Q;const q=Q.queue[Q.i];return {i:Q.i,len:Q.queue.length,kind:q.kind||'choice',ok:q.choices?q.choices.findIndex(c=>c.ok):-1,click:q.click||null}})()")
def answer(page):
    st=qstate(page)
    if st['kind']=='click':
        c=st['click']; target=None
        for f in range(13):
            if (OPEN[c['s']]+f)%12==c['pc'] and (c.get('f') is None or c['f']==f): target=f; break
        hit(page,'boardQ',c['s'],target)
    else: page.locator('#qChoices .choice').nth(st['ok']).click()
    page.wait_for_selector('#qActs .btn.primary')
with sync_playwright() as p:
    plain=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg=newpage(plain,mic=False)
    tiers=pg.locator('#mods h3.tier').all_inner_texts(); check('three tiers in order',tiers==['Beginner','Intermediate','Advanced'],tiers)
    n=pg.locator('#mods .mod').count(); NP=pg.evaluate("window.__FRETROAD_TEST.PRACTICE.length"); check('%d practice cards'%NP,n==NP and NP>=42,n)
    NH=pg.evaluate("window.__FRETROAD_TEST.PRACTICE.filter(m=>m.needs>5).length"); check('all stop 1-5 drills unlocked after five stops',pg.locator('#mods .mod:disabled').count()==NH)
    pg.screenshot(path=D+'shot_map_tiers.png',full_page=True)
    # metronome
    pg.locator('#metroBtn').click(); check('metronome panel opens',pg.locator('#metro:not([hidden])').count()==1)
    pg.select_option('#mSig','6/8'); pg.fill('#mBpmN','120'); pg.locator('#mBpmN').dispatch_event('change')
    check('6/8 shows two beat dots',pg.locator('#mDots i').count()==2,pg.locator('#mDots i').count())
    pg.locator('#mGo').click(); pg.wait_for_timeout(2300); 
    ticks=pg.evaluate("window.__FRETROAD_TEST.ticks.slice()"); pg.locator('#mGo').click()
    ts=[t['t'] for t in ticks]; iv=[round(b-a,3) for a,b in zip(ts,ts[1:])]
    check('6/8 at 120: clicks every 0.5 s',len(iv)>=3 and all(abs(x-0.5)<0.005 for x in iv),iv)
    check('accent pattern 2,0,2,0',[t['level'] for t in ticks[:4]]==[2,0,2,0],[t['level'] for t in ticks[:4]])
    pg.evaluate("window.__FRETROAD_TEST.ticks.length=0")
    pg.select_option('#mSig','7/8'); pg.fill('#mBpmN','200'); pg.locator('#mBpmN').dispatch_event('change')
    pg.locator('#mGo').click(); pg.wait_for_timeout(2600); pg.locator('#mGo').click()
    t2=pg.evaluate("window.__FRETROAD_TEST.ticks.slice()")
    check('7/8 grouping 2+2+3',[t['level'] for t in t2[:7]]==[2,0,1,0,1,0,0],[t['level'] for t in t2[:7]])
    iv=[round(b['t']-a['t'],3) for a,b in zip(t2,t2[1:])]; check('200 bpm = 0.3 s',all(abs(x-0.3)<0.005 for x in iv),iv[:5])
    pg.screenshot(path=D+'shot_metronome.png')
    pg.locator('#mClose').click()
    # quiz practice modules (no mic)
    PM=pg.evaluate("window.__FRETROAD_TEST.PRACTICE.filter(m=>m.type!=='play'&&!m.kind&&!(m.needs>5)).map(m=>m.id+':'+m.rounds)")
    for mid in PM:
        mid,nq=mid.split(':'); nq=int(nq)
        pg.evaluate("location.hash='practice-%s'"%mid)
        pg.wait_for_selector('#qMain:not([hidden]), #qResult:not([hidden])')
        has_primer=pg.locator('#qResult:not([hidden]) h3',has_text='Before you start').count()
        if has_primer: pg.locator('#qResult:not([hidden]) .acts .btn.primary').click()
        pg.wait_for_selector('#qMain:not([hidden])')
        for k in range(nq):
            answer(pg)
            pg.locator('#qActs .btn.primary').click()
        pg.wait_for_selector('#qResult:not([hidden]) h3')
        check('practice %s scores %d of %d'%(mid,nq,nq),pg.locator('#qResult h3').inner_text()=='%d of %d'%(nq,nq),pg.locator('#qResult h3').inner_text())
        if mid in ('open','modes','barre','rhythm'): pg.screenshot(path=D+'shot_pr_%s.png'%mid)
    # no mic available: fallback
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(m=>m.id==='playnote').rounds=2")
    pg.evaluate("location.hash='practice-playnote'"); pg.wait_for_selector('#pResult:not([hidden])')
    pg.locator('#pResult:not([hidden]) .acts .btn.primary').click(); pg.wait_for_selector('#pMain:not([hidden]) #pPrompt')
    pg.locator('#micBtn').click(); pg.wait_for_timeout(600)
    st=pg.locator('#micState').inner_text(); check('no-mic message shown',('No microphone' in st) or ('blocked' in st) or ('cannot reach' in st),st)
    pg.screenshot(path=D+'shot_play_nomic.png')
    for _ in range(2): pg.locator('#pActs .btn',has_text='I played it').click(); pg.wait_for_timeout(500)
    pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=5000)
    check('self-check path completes a drill',pg.locator('#pResult h3').inner_text().endswith('of 2 clean'),pg.locator('#pResult h3').inner_text())
    plain.close()
    # with a fake mic
    def micbrowser(wav):
        return p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+wav])
    b=micbrowser('a2.wav'); pg=newpage(b)
    pg.evaluate("location.hash='practice-tuner'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    pg.wait_for_function("document.querySelector('#tNote').textContent==='A2'",timeout=10000)
    check('tuner hears A2',True); 
    cents=pg.locator('#tCents').inner_text(); check('tuner cents shown',cents!='',cents)
    pg.screenshot(path=D+'shot_tuner.png'); b.close()
    # chord string by string
    b=micbrowser('cshape.wav'); pg=newpage(b)
    pg.evaluate("(()=>{const m=window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playchord'); m.rounds=1; m.pool=['C']})()")
    pg.evaluate("location.hash='practice-playchord'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    chips=pg.locator('#pSeq .chip').count(); check('C shape has five strings',chips==5,chips)
    pg.screenshot(path=D+'shot_play_chord.png')
    try:
        pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=40000); res=pg.locator('#pResult h3').inner_text()
    except Exception as e: res='timeout '+pg.locator('#pFb').inner_text()+' chips='+str(pg.locator('#pSeq .chip.ok').count())
    check('chord built string by string via mic',res=='1 of 1 clean',res)
    b.close()
    # wrong note feedback
    b=micbrowser('wrong.wav'); pg=newpage(b)
    pg.evaluate("(()=>{const m=window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playchord'); m.rounds=1; m.pool=['C']})()")
    pg.evaluate("location.hash='practice-playchord'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    pg.wait_for_function("document.querySelector('#pFb').textContent.indexOf('I hear A')>-1",timeout=15000)
    check('wrong note is named',True); check('wrong note does not advance',pg.locator('#pSeq .chip.ok').count()==0)
    b.close()
    # scale runner
    b=micbrowser('ascale.wav'); pg=newpage(b)
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playscale').rounds=1")
    pg.evaluate("location.hash='practice-playscale'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.select_option('#pcKey','9'); pg.select_option('#pcScale','minor pentatonic'); pg.select_option('#pcDir','up')
    pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    check('scale chips A C D E G A',pg.locator('#pSeq .chip').all_inner_texts()==['A','C','D','E','G','A'],pg.locator('#pSeq .chip').all_inner_texts())
    pg.screenshot(path=D+'shot_play_scale.png')
    try:
        pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=40000); res=pg.locator('#pResult h3').inner_text()
    except Exception: res='timeout '+pg.locator('#pFb').inner_text()
    check('A minor pentatonic run recognised',res=='1 of 1 clean',res)
    b.close()
print('\nERRORS:',errors if errors else 'none')
fails=[r for r in results if not r[1]]
print('%d checks, %d failed'%(len(results),len(fails)))
sys.exit(1 if fails or errors else 0)
