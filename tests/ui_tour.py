"""First-visit tour: appears, walks the steps, skip + don't-show-again is remembered; can be replayed."""
import os, sys, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=HERE+'/out/'; os.makedirs(OUT,exist_ok=True)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
errors=[]; res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
SAVE=json.dumps({'done':[],'passed':[],'best':{},'intro':True,'story':'road','chSeen':[]})
def page(b,init):
    ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script(init)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts' not in m.text.lower() else None)
    return ctx,pg
INIT="window.__FRETROAD_TEST={};window.__TOUR_TEST=true; try{if(!localStorage.getItem('fretroad-v1'))localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE)
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx,pg=page(b,INIT); pg.goto(URL); pg.wait_for_selector('#tour:not([hidden])',timeout=10000)
    check('tour opens on first visit',True); check('first step is the welcome',pg.inner_text('#tTitle')=='Welcome to Fretroad')
    pg.screenshot(path=OUT+'shot_tour1.png')
    pg.locator('#tNext').click(); pg.locator('#tNext').click(); pg.wait_for_timeout(450)
    check('step 3 spotlights Daily practice',pg.inner_text('#tTitle')=='Daily practice')
    r=pg.evaluate("(()=>{var a=document.querySelector('#tRing').getBoundingClientRect(),b=document.querySelector('#warmBtn').getBoundingClientRect();return Math.abs(a.left+a.width/2-(b.left+b.width/2))<4})()"); check('ring sits on the button',r)
    pg.screenshot(path=OUT+'shot_tour3.png')
    pg.locator('#tBack').click(); check('back works',pg.inner_text('#tTitle')=='Chapters and stops')
    for i in range(10):
        if pg.locator('#tour[hidden]').count(): break
        pg.locator('#tNext').click(); pg.wait_for_timeout(100)
    check('finish closes it',pg.locator('#tour[hidden]').count()==1)
    check('remembered after finishing',pg.evaluate("save.tour===1"))
    pg.wait_for_timeout(1500); pg.reload(); pg.wait_for_timeout(2500); check('does not return',pg.locator('#tour:not([hidden])').count()==0)
    pg.locator('#tourBtn').click(); check('can be replayed',pg.locator('#tour:not([hidden])').count()==1)
    pg.keyboard.press('Escape'); check('escape closes',pg.locator('#tour[hidden]').count()==1)
    ctx.close()
    # skip without remembering
    ctx,pg=page(b,INIT); pg.goto(URL); pg.wait_for_selector('#tour:not([hidden])',timeout=10000)
    pg.locator('#tNever').uncheck(); pg.locator('#tSkip').click(); check('skip closes',pg.locator('#tour[hidden]').count()==1)
    pg.reload(); pg.wait_for_selector('#tour:not([hidden])',timeout=10000); check('not remembered when unchecked',True)
    pg.locator('#tSkip').click(); pg.wait_for_timeout(1500); pg.reload(); pg.wait_for_timeout(2500); check('skip with box checked is remembered',pg.locator('#tour:not([hidden])').count()==0)
    ctx.close()
    # waits for the story picker on a brand new visit
    ctx,pg=page(b,"window.__FRETROAD_TEST={};window.__TOUR_TEST=true"); pg.goto(URL); pg.wait_for_timeout(2500)
    check('tour waits while the story picker is open',pg.locator('#storyOverlay:not([hidden])').count()==1 and pg.locator('#tour:not([hidden])').count()==0)
    # phone width
    m=b.new_context(viewport={'width':390,'height':844}); m.add_init_script(INIT); mp=m.new_page(); mp.goto(URL); mp.wait_for_selector('#tour:not([hidden])',timeout=10000)
    for i in range(7): mp.locator('#tNext').click(); mp.wait_for_timeout(120)
    box=mp.evaluate("(()=>{var r=document.querySelector('#tCard').getBoundingClientRect();return [r.left,r.right,r.top,r.bottom,innerWidth,innerHeight]})()")
    check('card fits on a phone',box[0]>=0 and box[1]<=box[4] and box[2]>=0 and box[3]<=box[5]+1,box); mp.screenshot(path=OUT+'shot_tour_phone.png')
    b.close()
print('errors:',errors); ok=all(res) and not errors; print('ALL PASS' if ok else 'SOME FAILED'); sys.exit(0 if ok else 1)
