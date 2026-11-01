"""Players: separate progress per profile, switching, rename, remove, and old progress kept as the first player."""
import os, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
old={'done':[1,2,3],'passed':[1,2,3],'best':{},'intro':True,'story':'road','chSeen':[1],'tour':1}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(old)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('dialog',lambda d:d.accept('Ben'))
    pg.goto(URL); pg.wait_for_timeout(600)
    check('existing progress is the first player',pg.evaluate("PROFILES.active")=='p1' and pg.evaluate("save.done.length")==3)
    pg.click('#prefBtn'); pg.wait_for_selector('#prefPlayers .plrow')
    check('settings lists one player with progress','3 of 19' in pg.inner_text('#prefPlayers'))
    pg.fill('#plNew','Ana'); pg.click('#plAdd'); pg.wait_for_timeout(800)
    try:
        pg.wait_for_selector('#storyOverlay .storycard',state='visible',timeout=4000); pg.locator('#storyOverlay .storycard').first.click(); pg.wait_for_timeout(600)
    except Exception: pass
    check('adding a player switches to them with empty progress',pg.evaluate("profileActive().name")=='Ana' and pg.evaluate("save.done.length")==0)
    pg.evaluate("save.done=[1]; save.passed=[1]; persist()")
    check('second player saved under its own key',pg.evaluate("localStorage.getItem(profileKey(PROFILES.active))").count('"done":[1]')==1)
    check('first player untouched',json.loads(pg.evaluate("localStorage.getItem('fretroad-v1')"))['done']==[1,2,3])
    s=pg.evaluate("profileSummaries().map(x=>x.name+':'+x.cleared+':'+x.active)")
    check('summaries show both players',s==['Player 1:3:false','Ana:1:true'],s)
    check('summary carries no full save',set(pg.evaluate("Object.keys(profileSummaries()[0])"))<={'id','name','color','cleared','total','passed','streak','level','practisedToday','active','songs'})
    pg.evaluate("['prefOverlay','talkOverlay','storyOverlay'].forEach(i=>{var e=document.getElementById(i);e&&(e.hidden=true)})"); pg.click('#prefBtn',force=True); pg.wait_for_selector('#prefPlayers .plrow')
    pg.locator('#prefPlayers .plrow:has-text("Player 1") .btn:has-text("Switch")').click(); pg.wait_for_timeout(800)
    check('switching restores that player\'s progress',pg.evaluate("profileActive().name")=='Player 1' and pg.evaluate("save.done.length")==3)
    pg.evaluate("['storyOverlay','tourOverlay'].forEach(i=>{var e=document.getElementById(i);e&&(e.hidden=true)})"); pg.click('#prefBtn',force=True); pg.wait_for_selector('#prefPlayers .plrow')
    pg.locator('#prefPlayers .plrow:has-text("Ana") .btn:has-text("Rename")').click(); pg.wait_for_timeout(200)
    check('rename works',pg.evaluate("profileById(PROFILES.list[1].id).name")=='Ben')
    rm=pg.locator('#prefPlayers .plrow:has-text("Ben") .btn:has-text("Remove")'); rm.click()
    check('remove asks to confirm',pg.locator('#prefPlayers .btn:has-text("Really remove?")').count()==1 and pg.evaluate("PROFILES.list.length")==2)
    pg.locator('#prefPlayers .btn:has-text("Really remove?")').click(); pg.wait_for_timeout(300)
    check('removed player and their save are gone',pg.evaluate("PROFILES.list.length")==1 and pg.evaluate("Object.keys(localStorage).filter(k=>/^fretroad-v1-/.test(k)).length")==0)
    check('last player cannot be removed',pg.evaluate("profileRemove('p1')")==False)
    check('no errors',not errs,errs); b.close()
print('ui_profiles:',('ALL PASS' if all(res) else 'FAILURES'))
