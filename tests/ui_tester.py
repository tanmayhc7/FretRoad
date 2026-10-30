"""Tester build: everything unlocked, separate save, checklist, mic lab, report. Run: python3 tests/ui_tester.py"""
import os, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); D=HERE+'/out/'
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')+'?tester=1'
REAL=json.dumps({'done':[1],'passed':[1],'best':{},'intro':True,'story':'road','chSeen':[1]})
fails=[]; errs=[]
def check(n,ok):
    print(('PASS ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'ascale.wav'])
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone'])
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(REAL))
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    check('tester button present',pg.locator('.tst-btn').count()==1)
    check('all drills unlocked',pg.evaluate("document.querySelectorAll('#mods .mod:disabled').length")==0)
    check('real progress untouched (1 stop)',pg.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).passed.length")==1)
    check('tester save is separate and complete',pg.evaluate("JSON.parse(localStorage.getItem('fretroad-tester')||'{}').passed?.length")==19)
    pg.locator('.tst-btn').click(); pg.wait_for_selector('.tst-panel')
    n=pg.locator('.tst-item').count(); check('checklist has %d items'%n,n>=18)
    pg.locator('.tst-item').first.locator('input[type=checkbox]').check(); pg.locator('.tst-item').first.locator('input[type=text]').fill('slots stayed grey')
    pg.locator('.tst-item .btn',has_text='Open').first.click()
    pg.wait_for_selector('#pMain:not([hidden]), #pResult:not([hidden])'); check('Open jumps to the drill',pg.evaluate("location.hash")=='#practice-playstrumrh')
    pg.locator('.tst-btn').click(); pg.wait_for_selector('.tst-panel')
    # mic lab hears the fake recording
    pg.get_by_role('button',name='Start mic lab').click(); pg.wait_for_function("document.querySelector('#tlCount').textContent!=='0 hits'",timeout=15000)
    check('mic lab counts hits (%s)'%pg.locator('#tlCount').inner_text(),True)
    pg.wait_for_function("document.querySelector('#tlNote').textContent!=='–'",timeout=15000)
    check('mic lab shows a note (%s)'%pg.locator('#tlNote').inner_text(),pg.locator('#tlNote').inner_text()!='–')
    pg.get_by_role('button',name='Stop mic lab').click()
    rep=pg.evaluate("window.__FRETROAD_TEST.testerReport()")
    check('report lists checked item and note','[x] Strum in Time: slots stayed grey' in rep and 'Device:' in rep and '[ ] Rhythm Reading' in rep)
    check('no page errors',errs==[])
    # normal build is unaffected
    pg2=ctx.new_page(); pg2.goto(URL.split('?')[0]); pg2.wait_for_selector('#v-map:not([hidden])')
    check('normal page has no tester button',pg2.locator('.tst-btn').count()==0 and pg2.evaluate("document.querySelectorAll('#mods .mod:disabled').length")>0)
    b.close()
print('ALL PASS' if not fails else 'FAILED: %s'%fails)
