"""Strum Check drill: a fake microphone plays C chord strums (and, in a second run, a G chord). Run: python3 tests/ui_strum.py"""
import os, json, wave
import numpy as np
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); D=HERE+'/out/'; os.makedirs(D,exist_ok=True)
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
SR=44100
def chord_wav(path,midis,secs=24,every=2.0):
    x=np.zeros(int(SR*secs)); t=np.arange(int(SR*1.6))/SR
    for k in range(int(secs/every)):
        for j,m in enumerate(midis):
            f=440*2**((m-69)/12); s=np.zeros_like(t)
            for h,a in ((1,1),(2,.5),(3,.3),(4,.15)): s+=a*np.sin(2*np.pi*f*h*t)
            s*=np.exp(-t*1.6)*(1-np.exp(-t*60))*.12
            o=int((k*every+j*.03)*SR); x[o:o+len(s)]+=s[:len(x)-o]
    w=wave.open(path,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes()); w.close()
chord_wav(D+'strumC.wav',[48,52,55,60,64]); chord_wav(D+'strumG.wav',[43,47,50,55,59,67])
SAVE=json.dumps({'done':[1,2,3],'passed':[1,2,3],'best':{},'intro':True,'story':'road','chSeen':[1]})
fails=[]
def check(n,ok):
    print(('PASS ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
def run(wav,want,expect_ok):
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+wav])
        ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone'])
        ctx.add_init_script("window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE))
        pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
        pg.evaluate("(()=>{const m=window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playstrum'); m.rounds=1; m.pool=['%s']})()"%want)
        pg.evaluate("location.hash='practice-playstrum'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
        pg.wait_for_selector('#pMain:not([hidden]) #pPrompt')
        check('prompt names the chord',want in pg.locator('#pPrompt').inner_text())
        pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
        try:
            pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=20000 if expect_ok else 9000); done=True
        except Exception: done=False
        check('%s strum heard %s'%(want,'and accepted' if expect_ok else 'and NOT accepted'),done==expect_ok)
        if not expect_ok: check('feedback names what it hears','I hear' in pg.locator('#pFb').inner_text())
        check('no page errors',errs==[])
        b.close()
run('strumC.wav','C',True)
run('strumG.wav','C',False)
print('ALL PASS' if not fails else 'FAILED: %s'%fails)
