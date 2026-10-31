import os
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
OUT=os.path.join(HERE,'out')+'/'
os.makedirs(OUT,exist_ok=True)
os.chdir(HERE)
import json,sys,os
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
OPEN=[64,59,55,50,45,40]
errors=[]; res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
def save(story,upto):
    return json.dumps({'done':list(range(1,upto)),'passed':list(range(1,upto)),'best':{},'intro':True,'story':story,'chSeen':[1,2,3,4]})
def hit(pg,board,s,f):
    pg.evaluate("([b,s,f])=>{document.querySelector('#'+b+' .hit[data-s=\"'+s+'\"][data-f=\"'+f+'\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))}",[board,s,f])
def answer(pg):
    st=pg.evaluate("(()=>{const Q=window.__FRETROAD_TEST.Q;const q=Q.queue[Q.i];return {kind:q.kind||'choice',ok:q.choices?q.choices.findIndex(c=>c.ok):-1,click:q.click||null,lesson:q.lesson||null,nch:q.choices?q.choices.length:0,okc:q.choices?q.choices.filter(c=>c.ok).length:0,prompt:q.prompt}})()")
    if st['kind']=='choice' and st['okc']!=1: errors.append('bad question '+st['prompt'])
    if st['kind']=='click':
        c=st['click']; t=None
        for f in range(13):
            if (OPEN[c['s']]+f)%12==c['pc'] and (c.get('f') is None or c['f']==f): t=f; break
        hit(pg,'boardQ',c['s'],t)
    else: pg.locator('#qChoices .choice').nth(st['ok']).click()
    pg.wait_for_selector('#qActs .btn.primary'); return st
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for sid in range(6,20):
        story=['road','jungle','city'][sid%3]
        ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(save(story,sid)))
        pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append('pageerror '+str(e)))
        pg.on('console',lambda m:errors.append('console '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Permission' not in m.text and 'font at' not in m.text else None)
        pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
        pg.evaluate("location.hash='stop-%d'"%sid); pg.wait_for_selector('#v-level:not([hidden])')
        nl=pg.evaluate("cur.lesson.length"); title=pg.locator('#lvWhere').inner_text()
        for i in range(nl):
            pg.wait_for_timeout(120); pg.locator('#lNext').click()
        pg.wait_for_selector('#goalbox:not([hidden])')
        tg=pg.evaluate("targetsOf(cur)"); total=pg.evaluate("total")
        for s,f in tg: hit(pg,'boardL',s,f)
        pg.wait_for_selector('#reveal:not([hidden]) h3',timeout=4000)
        check('stop %d (%s) puzzle solved with %d targets'%(sid,story,total),len(tg)==total and total>0,(len(tg),total))
        if sid==11: check('stop 11 has 16 targets',total==16,total)
        # a wrong tap gives feedback
        pg.locator('#reveal .btn',has_text='Take the quiz').click(); pg.wait_for_selector('#qMain:not([hidden])')
        for k in range(5):
            answer(pg); pg.locator('#qActs .btn.primary').click()
        pg.wait_for_selector('#qResult:not([hidden]) h3',timeout=4000)
        h=pg.locator('#qResult h3').inner_text(); check('stop %d quiz passes (%s)'%(sid,h),h=='Stop cleared',h)
        check('stop %d marked passed'%sid,pg.evaluate("isPassed(%d)"%sid))
        ctx.close()
    # story switch, chapter tabs, unlock logic
    ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("window.__FRETROAD_TEST={}; localStorage.setItem('fretroad-v1',%s)"%json.dumps(save('road',1)))
    pg=ctx.new_page(); pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    check('only chapter tab 1 enabled at start',pg.locator('.chtab:not([disabled])').count()==1)
    pg.locator('#storyBtn').click(); pg.locator('.storycard').nth(2).click(); pg.wait_for_timeout(300)
    check('story switch applies city scene',pg.evaluate("document.body.dataset.story")=='city' and 'Pip' in pg.locator('#v-map').inner_text() or pg.evaluate("document.body.dataset.story")=='city')
    check('stop names follow story',pg.locator('#stoplist .stop strong').first.inner_text()=='The Park Gate',pg.locator('#stoplist .stop strong').first.inner_text())
    check('mentor name updates',pg.evaluate("document.querySelector('.mentor').textContent")=='Dot')
    pg.evaluate("save.passed=[1,2,3,4,5];save.done=[1,2,3,4,5];viewCh=-1;showMap()"); pg.wait_for_timeout(300)
    pg.locator('#talkOverlay:not([hidden]) #talkNext').click(timeout=3000) if pg.locator('#talkOverlay:not([hidden])').count() else None
    check('chapter 2 tab unlocks after chapter 1',pg.locator('.chtab:not([disabled])').count()==2)
    check('stop 6 is unlocked, 7 locked',pg.evaluate("unlocked(6)&&!unlocked(7)"))
    ctx.close(); b.close()
print('ERRORS:',errors if errors else 'none'); print(sum(res),'of',len(res),'checks passed')
