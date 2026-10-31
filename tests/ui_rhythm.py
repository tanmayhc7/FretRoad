"""Rhythm drills (tap input), scale timing, melody on the neck. Run: python3 tests/ui_rhythm.py"""
import os, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); D=HERE+'/out/'
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
SAVE=json.dumps({'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})
INIT="window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE)
fails=[]; errs=[]
def check(n,ok):
    print(('PASS ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
def open_drill(pg,mid,patch):
    pg.evaluate("(()=>{const m=window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='%s'); Object.assign(m,%s)})()"%(mid,json.dumps(patch)))
    pg.evaluate("location.hash='practice-%s'"%mid); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.wait_for_selector('#pMain:not([hidden]) #pPrompt')
def play_round(pg,dev=0,extra=None,skip_every=None):
    pg.get_by_role('button',name='Count me in').click() if pg.get_by_role('button',name='Count me in').count() else pg.get_by_role('button',name='Try again').first.click()
    pg.wait_for_function("RH.running&&RH.exp.length>0")
    pg.evaluate("""([dev,extra,skip])=>{RH.exp.forEach((e,i)=>{ if(skip&&i%skip===0) return; setTimeout(()=>RH.tap(),Math.max(0,e.t-performance.now()+dev)) });
       if(extra) extra.forEach(x=>setTimeout(()=>RH.tap(),Math.max(0,RH.tp+x-performance.now())))}""",[dev,extra,skip_every])
    pg.wait_for_function("!RH.running&&RH.res",timeout=30000)
    return pg.evaluate("RH.res")
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'ascale.wav'])
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone']); ctx.add_init_script(INIT)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    # strum in time: on-the-beat taps are clean
    open_drill(pg,'playstrumrh',{'rounds':2,'bars':2,'bpm':170})
    check('strum drill tells the user about the practice bar beforehand','practice bar' in pg.locator('#pFb').inner_text().lower())
    pg.get_by_role('button',name='Count me in').click()
    pg.wait_for_selector('#pSeq .rhcount',timeout=8000); check('3-2-1 countdown shown big',pg.locator('#pSeq .rhcount').inner_text() in ('3','2','1'))
    pg.wait_for_function("document.querySelector('#pFb').textContent.indexOf('Practice bar')===0",timeout=8000); check('then a practice bar that is not scored','not scored' in pg.locator('#pFb').inner_text())
    check('practice bar sits before the scored window',pg.evaluate("RH.exp.length>0&&RH.exp[0].t>performance.now()"))
    pg.evaluate("rhythmStop(); RH.item.fresh=true; rhythmRender()")
    check('pattern slots drawn (8 chips with counts)',pg.locator('#pSeq .chip.rh').count()==8 and pg.locator('#pSeq small').first.inner_text()=='1')
    r=play_round(pg,dev=0); check('on-the-beat taps score clean (%s)'%r,r['clean'] and r['hits']==r['total'] and r['extras']==0)
    pg.wait_for_selector('#pDots i.ok'); 
    # round two auto-advances after a clean round; play it late and with extras -> not clean
    pg.wait_for_function("document.querySelector('#pStep').textContent.indexOf('Round 2')>-1",timeout=6000)
    r=play_round(pg,dev=230); check('taps 230 ms late are not clean (%s)'%r['hits'],not r['clean'])
    check('feedback mentions timing',('Not yet' in pg.locator('#pFb').inner_text()) )
    pg.get_by_role('button',name='Try again').first.click()
    r=play_round(pg,dev=-25,extra=[30,330]); check('slightly early + 2 extras: extras counted (%s)'%r['extras'],r['extras']>=2 and not r['clean'] or r['extras']>=2)
    pg.get_by_role('button',name='Try again').first.click()
    r=play_round(pg,dev=15); check('second try clean',r['clean'])
    pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=8000); check('result shown (%s)'%pg.locator('#pResult h3').inner_text(),'of 2 clean' in pg.locator('#pResult h3').inner_text())
    # rhythm reading: silent slots must stay silent
    open_drill(pg,'rhythmread',{'rounds':1,'bars':2,'bpm':170})
    r=play_round(pg,dev=5); check('rhythm reading clean with exact taps (%s)'%r,r['clean'])
    # odd meter: taps on group starts
    open_drill(pg,'oddcomp',{'rounds':1,'bars':2}); pg.evaluate("PL.items[0].slotMs=170")
    n=pg.evaluate("PL.items[0].slots.length"); on=pg.evaluate("PL.items[0].slots.filter(s=>s.on).length")
    r=play_round(pg,dev=0); check('odd meter %d slots, %d group starts, clean (%s)'%(n,on,r),r['clean'] and r['total']==on*2)
    # space bar works as tap
    open_drill(pg,'playstrumrh',{'rounds':1,'bars':1,'bpm':170})
    pg.get_by_role('button',name='Count me in').click(); pg.wait_for_function("RH.running")
    pg.evaluate("RH.exp.forEach(e=>setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '})),Math.max(0,e.t-performance.now())))")
    pg.wait_for_function("!RH.running&&RH.res",timeout=20000); check('space bar counts as a tap',pg.evaluate("RH.res.clean"))
    # scale runner timing from a fake guitar recording
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playscale').rounds=1")
    pg.evaluate("PL.cfg={root:9,scale:'minor pentatonic',dir:'up'}")
    pg.evaluate("location.hash='practice-playscale'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.wait_for_selector('#pMain:not([hidden]) #pPrompt'); pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    try:
        pg.wait_for_function("document.querySelector('#pFb').textContent.indexOf('Timing')>-1||!document.querySelector('#pResult').hidden",timeout=45000)
        fb=pg.locator('#pFb').inner_text(); print('   ',fb)
        check('scale runner reports timing',('Timing' in fb) or ('Average timing' in pg.locator('#pResult').inner_text()))
    except Exception as e: check('scale runner reports timing (timeout)',False)
    # melody on the neck: click the right notes by pitch class; one wrong click marks it missed
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='melodyneck').rounds=2")
    pg.evaluate("location.hash='practice-melodyneck'"); pg.locator('#qResult:not([hidden]) .acts .btn.primary').click(); pg.wait_for_selector('#qMain:not([hidden]) #qPrompt')
    check('prompt names key and first note',('major' in pg.locator('#qPrompt').inner_text()) and ('starts on' in pg.locator('#qPrompt').inner_text()))
    pg.evaluate("(()=>{const q=Q.queue[Q.i]; q.seq.forEach(pc=>{let s=2,f=0; for(let ff=0;ff<=12;ff++) if(pcOf(s,ff)===pc){f=ff;break} onCellQ(s,f)})})()")
    check('perfect melody settles correct',pg.locator('#qFb.good').count()==1 and 'Correct' in pg.locator('#qFb').inner_text())
    pg.locator('#qActs .btn.primary').click()
    pg.evaluate("(()=>{const q=Q.queue[Q.i]; const bad=(q.seq[0]+1)%12; let f=0; for(let ff=0;ff<=12;ff++) if(pcOf(2,ff)===bad){f=ff;break} onCellQ(2,f); q.seq.forEach(pc=>{let ff2=0; for(let ff=0;ff<=12;ff++) if(pcOf(2,ff)===pc){ff2=ff;break} onCellQ(2,ff2)})})()")
    check('wrong click first counts as missed',pg.locator('#qFb.bad').count()==1 and 'Not quite' in pg.locator('#qFb').inner_text())
    check('no page errors',errs==[])
    b.close()
print('ALL PASS' if not fails else 'FAILED: %s'%fails)
