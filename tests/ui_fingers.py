"""Daily finger exercises: a level question first, ten exercises per level, hammer-ons and pull-offs from intermediate up, one a day."""
import os, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
save={'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1],'tour':1}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(save)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL+'#warmup'); pg.wait_for_selector('#v-warm:not([hidden]) .lvlpick')
    check('three levels offered',pg.locator('.lvlbtn').count()==3)
    d=pg.evaluate("(()=>{var o={};Object.keys(FINGER_EX).forEach(k=>{var a=FINGER_EX[k]; o[k]={n:a.length,ids:new Set(a.map(x=>x.id)).size,ho:a.filter(x=>/hammer|pull-off|h\\d|p\\d/.test(x.text+x.tab.join(''))).length,full:a.every(x=>x.text&&x.plan&&x.plan.length===3&&x.tab&&x.name)}});return o})()")
    for k in ('beginner','intermediate','advanced'): check('%s has ten complete exercises'%k,d[k]['n']==10 and d[k]['ids']==10 and d[k]['full'],d[k])
    check('beginner list has no hammer-ons or pull-offs',d['beginner']['ho']==0,d['beginner'])
    check('intermediate and advanced use hammer-ons and pull-offs',d['intermediate']['ho']>=8 and d['advanced']['ho']>=5,d)
    for lvl in ('Beginner','Intermediate','Advanced'):
        pg.evaluate("showWarm()"); 
        if pg.locator('.lvlpick').count()==0: pg.locator('.btn:has-text("Level:")').click()
        pg.locator('.lvlbtn:has-text("%s")'%lvl).click(); pg.wait_for_selector('#v-warm .wcard')
        check('%s: exercise, tab and a 3-step plan are shown'%lvl,pg.locator('.wcard h2').inner_text() and pg.locator('.wtab').is_visible() and pg.locator('.wplan li').count()==3)
        check('%s: today is one of that level\'s ten'%lvl,pg.evaluate("FINGER_EX['%s'].some(x=>x.id===exerciseFor(new Date(),0).id)"%lvl.lower()))
    # a ten-day run gives ten different exercises, then the next cycle reshuffles
    r=pg.evaluate("(()=>{var base=Math.ceil(Math.floor(Date.UTC(2026,0,1)/864e5)/10)*10,a=[],b=[];for(var i=0;i<10;i++){a.push(exerciseFor(new Date(Date.UTC(2026,0,1)+(base+i-Math.floor(Date.UTC(2026,0,1)/864e5))*864e5+43200000),0).id);b.push(exerciseFor(new Date(Date.UTC(2026,0,1)+(base+10+i-Math.floor(Date.UTC(2026,0,1)/864e5))*864e5+43200000),0).id)}return [a,b]})()")
    check('ten days, ten different exercises',len(set(r[0]))==10 and len(set(r[1]))==10,r)
    check('the next ten days use the same ten, reordered',set(r[0])==set(r[1]) and r[0]!=r[1],r)
    pg.locator('.wcard .btn:has-text("Mark as practised")').click()
    check('logging works and the calendar names the exercise',pg.evaluate("warmFind(save.warm.days[dayKey()])!==null"))
    check('no errors',not errs,errs); b.close()
print('ui_fingers:',('ALL PASS' if all(res) else 'FAILURES'))
