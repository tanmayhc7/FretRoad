import os
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
D=os.path.join(HERE,'out')+'/'
os.makedirs(D,exist_ok=True)
import json
from playwright.sync_api import sync_playwright
import os
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
SAVE=json.dumps({'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})
INIT="window.__FRETROAD_TEST={}; Math.random=function(){return 0}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'carp.wav'])
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone']); ctx.add_init_script(INIT)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='playarp').rounds=1")
    pg.evaluate("location.hash='practice-playarp'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.wait_for_selector('#pMain:not([hidden]) #pPrompt')
    print('prompt:',pg.locator('#pPrompt').inner_text()); chips=pg.locator('#pSeq .chip').count(); print('chips',chips, pg.locator('#pSeq').inner_text().replace('\n',' '))
    pg.locator('#micBtn').click(); pg.wait_for_function("document.querySelector('#micBtn').textContent==='Mic is on'",timeout=8000)
    try:
        pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=45000); print('result:',pg.locator('#pResult h3').inner_text())
    except Exception as e: print('timeout',pg.locator('#pFb').inner_text(), pg.locator('#pSeq .chip.ok').count())
    print('errors',errs)
    b.close()
