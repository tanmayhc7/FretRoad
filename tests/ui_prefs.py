"""Warm-up, settings (theme, left-handed)."""
import os, sys, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=HERE+'/out/'; os.makedirs(OUT,exist_ok=True)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
errors=[]; res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
SAVE=json.dumps({'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("try{if(!localStorage.getItem('fretroad-v1'))localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE))
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts' not in m.text.lower() else None)
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    pg.locator('#prefBtn').click(); pg.locator('#prefTheme [data-v=light]').click()
    check('light class set',pg.evaluate("document.documentElement.classList.contains('light')"))
    pg.locator('#prefLefty').check(); check('lefty class set',pg.evaluate("document.documentElement.classList.contains('lefty')"))
    pg.locator('#prefClose').click(); pg.screenshot(path=OUT+'shot_light_map.png')
    pg.goto(URL+'#sandbox'); pg.wait_for_selector('#boardS svg'); pg.screenshot(path=OUT+'shot_lefty_board.png')
    check('prefs persist after reload',pg.evaluate("document.documentElement.classList.contains('light')&&document.documentElement.classList.contains('lefty')"))
    pg.goto(URL+'#warmup'); pg.wait_for_selector('#v-warm:not([hidden]) .wcard')
    seen={'do':0,'q':0}
    steps=pg.evaluate("W.steps.length"); check('ten steps',steps==10,steps)
    kinds=pg.evaluate("W.steps.map(s=>s.quiz?'q':'d').join('')"); print(kinds)
    check('six exercises and four questions',kinds.count('d')==6 and kinds.count('q')==4,kinds)
    for i in range(10):
        if pg.locator('.wopt').count():
            pg.locator('.wopt').first.click(); pg.locator('.wcard .row .btn.primary').click()
        else:
            if i==0:
                pg.screenshot(path=OUT+'shot_warm.png'); pg.locator('.wcard .row .btn.primary').click(); pg.wait_for_timeout(1500)
                check('timer counts down',pg.inner_text('#wTimer')!=str(pg.evaluate("W.steps[0].secs"))+'s',pg.inner_text('#wTimer'))
            pg.locator('.wcard .row .btn.quiet').click()
    pg.wait_for_selector('.wcard:has-text("Warm-up done")')
    check('streak saved',pg.evaluate("save.warm&&save.warm.streak===1&&save.warm.total===1"))
    pg.locator('.wcard .btn:has-text("Another mix")').click(); pg.wait_for_selector('.wcard .lab:has-text("of 10")')
    check('another mix restarts',pg.evaluate("W.i===0&&W.steps.length===10"))
    pg.goto(URL+'#warmup'); k2=pg.evaluate("W.steps.map(s=>s.name||s.prompt).join('|')"); pg.goto(URL+'#warmup'); k3=pg.evaluate("W.steps.map(s=>s.name||s.prompt).join('|')")
    check('same day, same mix',k2==k3)
    b.close()
print('errors:',errors); ok=all(res) and not errors; print('ALL PASS' if ok else 'SOME FAILED'); sys.exit(0 if ok else 1)
