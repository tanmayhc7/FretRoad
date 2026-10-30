"""Feedback footer and form: builds a pre-filled GitHub issue link. Run: python3 tests/ui_feedback.py"""
import os, json, urllib.parse
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
fails=[]; errs=[]
def check(n,ok):
    print(('PASS ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',JSON.stringify({done:[],passed:[],best:{},intro:true,story:'road',chSeen:[],tour:1}))}catch(e){}")
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    pg.evaluate("(()=>{window.__opened=[]; window.open=function(u){window.__opened.push(u); return null}; return 1})()")
    check('footer links to the repo',pg.locator('#fbFoot a[href*="github.com/tanmayhc7/FretRoad"]').count()==1)
    pg.locator('#fbOpen').scroll_into_view_if_needed(); pg.locator('#fbOpen').click(); pg.wait_for_selector('#fbOverlay:not([hidden])')
    pg.locator('#fbSend').click(); check('empty form does not open GitHub',pg.evaluate("window.__opened.length")==0)
    pg.locator('#fbKind').select_option('idea'); pg.locator('#fbTitle').fill('Add a drum loop & more'); pg.locator('#fbBody').fill('Line one\nLine two with ünïcode ♯')
    check('preview shows title and details',('Add a drum loop' in pg.locator('#fbPrev').inner_text()) and ('Browser:' in pg.locator('#fbPrev').inner_text()))
    pg.locator('#fbSend').click(); u=pg.evaluate("window.__opened[0]"); q=urllib.parse.urlparse(u); qs=urllib.parse.parse_qs(q.query)
    check('opens a new issue on the repo',q.netloc=='github.com' and q.path=='/tanmayhc7/FretRoad/issues/new')
    check('title, label and body pre-filled (%s)'%qs.get('labels'),qs['title']==['Add a drum loop & more'] and qs['labels']==['enhancement'] and 'ünïcode ♯' in qs['body'][0] and 'Type: An idea' in qs['body'][0])
    check('no progress data in the body','passed' not in qs['body'][0] and 'fretroad-v1' not in qs['body'][0])
    pg.locator('#fbInfo').uncheck(); pg.locator('#fbSend').click(); qs=urllib.parse.parse_qs(urllib.parse.urlparse(pg.evaluate("window.__opened[1]")).query)
    check('details can be switched off','Browser:' not in qs['body'][0])
    pg.locator('#fbBody').fill('x'*20000); pg.locator('#fbSend').click(); u=pg.evaluate("window.__opened[2]")
    check('very long text is shortened to a safe URL length (%d)'%len(u),len(u)<8000)
    pg.locator('#fbClose').click(); check('form closes',pg.locator('#fbOverlay[hidden]').count()==1)
    check('no page errors',errs==[])
    b.close()
print('ALL PASS' if not fails else 'FAILED: %s'%fails)
