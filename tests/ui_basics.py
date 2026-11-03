"""First Steps chapter (stops 20 to 25): new-player landing, optional gating, every puzzle and quiz, review links, reveal diagrams."""
import os
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
OUT=os.path.join(HERE,'out')+'/'
os.makedirs(OUT,exist_ok=True)
os.chdir(HERE)
import json,sys
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
OPEN=[64,59,55,50,45,40]
errors=[]; res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
def seed(story,passed):
    return json.dumps({'done':list(passed),'passed':list(passed),'best':{},'intro':True,'story':story,'chSeen':[1,2,3,4],'tour':1})
def hit(pg,board,s,f):
    pg.evaluate("([b,s,f])=>{document.querySelector('#'+b+' .hit[data-s=\"'+s+'\"][data-f=\"'+f+'\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))}",[board,s,f])
def qinfo(pg):
    return pg.evaluate("(()=>{const Q=window.__FRETROAD_TEST.Q;const q=Q.queue[Q.i];return {kind:q.kind||'choice',ok:q.choices?q.choices.findIndex(c=>c.ok):-1,okc:q.choices?q.choices.filter(c=>c.ok).length:0,nch:q.choices?q.choices.length:0,labels:q.choices?q.choices.map(c=>c.label):[],click:q.click||null,lesson:q.lesson||null,prompt:q.prompt,key:q.key}})()")
def answer(pg,correct=True):
    st=qinfo(pg)
    if st['kind']=='choice':
        if st['okc']!=1: errors.append('bad question (correct answers=%d): %s'%(st['okc'],st['prompt']))
        if len(set(st['labels']))!=len(st['labels']): errors.append('duplicate choices: %s %s'%(st['prompt'],st['labels']))
        if st['nch']<2: errors.append('too few choices: '+st['prompt'])
    if st['kind']=='click':
        c=st['click']; t=None
        for f in range(13):
            if (OPEN[c['s']]+f)%12==c['pc'] and (c.get('f') is None or c['f']==f): t=f; break
        if correct: hit(pg,'boardQ',c['s'],t)
        else: hit(pg,'boardQ',(c['s']+1)%6,t)
    else:
        n=st['nch']; i=st['ok'] if correct else (st['ok']+1)%n
        pg.locator('#qChoices .choice').nth(i).click()
    pg.wait_for_selector('#qActs .btn.primary'); return st
def ctxpage(b,story,passed,mobile=False):
    ctx=b.new_context(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s) }catch(e){}"%json.dumps(seed(story,passed)))
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append('pageerror '+str(e)))
    pg.on('console',lambda m:errors.append('console '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Permission' not in m.text and 'font at' not in m.text else None)
    return ctx,pg
EXPECT={20:6,21:10,22:8,23:5,24:6,25:5}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    # a brand new player lands on First Steps; chapter 1 is open too
    ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("window.__FRETROAD_TEST={}")
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append('pageerror '+str(e)))
    pg.on('console',lambda m:errors.append('console '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Permission' not in m.text and 'font at' not in m.text else None)
    pg.goto(URL); pg.wait_for_selector('#storyOverlay:not([hidden])'); pg.locator('.storycard').first.click(); pg.wait_for_selector('#talkOverlay:not([hidden])')
    intro=[]
    for _ in range(14):
        if pg.locator('#talkOverlay[hidden]').count(): break
        intro.append(pg.locator('#talkText').inner_text()); pg.locator('#talkNext').click(); pg.wait_for_timeout(60)
    check('fresh player starts on the First Steps chapter',pg.locator('#chEye').inner_text().lower().startswith('first steps'),pg.locator('#chEye').inner_text())
    check('First Steps has six stops',pg.locator('#stoplist .stop').count()==6)
    check('first stop is open, second is locked',pg.locator('#stoplist .stop').nth(0).is_enabled() and pg.locator('#stoplist .stop').nth(1).is_disabled())
    check('basics and chapter 1 tabs are both enabled, chapter 2 is locked',pg.locator('.chtab:not([disabled])').count()==2 and pg.locator('.chtab').count()==5)
    check('basics tab is labelled Basics',pg.locator('.chtab').first.inner_text().strip()=='Basics',pg.locator('.chtab').first.inner_text())
    check('chapter 1 stop 1 opens without clearing First Steps',pg.evaluate("unlocked(1)&&!unlocked(2)&&unlocked(20)&&!unlocked(21)"))
    check('dawn is untouched by First Steps',pg.evaluate("dawnValue()")==0)
    pg.locator('.chtab').nth(1).click(); pg.wait_for_timeout(200)
    check('chapter 1 tab shows five stops',pg.locator('#stoplist .stop').count()==5 and pg.locator('#chEye').inner_text().lower().startswith('chapter 1'))
    check('hero numeral is blank for First Steps',pg.evaluate("(()=>{viewCh=0;drawMap();return document.querySelector('.hero').dataset.n===''})()"))
    ctx.close()
    # a player with chapter 1 progress is not dragged back to the basics
    ctx,pg=ctxpage(b,'jordan',[1,2]); pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    check('player with progress lands on chapter 1',pg.locator('#chEye').inner_text().lower().startswith('chapter 1'),pg.locator('#chEye').inner_text())
    check('dawn for core progress still counts 2 of 19',abs(pg.evaluate("dawnValue()")-2/19)<1e-9,pg.evaluate("dawnValue()"))
    check('chapter 2 gate ignores the optional chapter',pg.evaluate("!chapterOpen(2)"))
    ctx.close()
    ctx,pg=ctxpage(b,'jordan',[1,2,3,4,5]); pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    check('chapter 2 opens after chapter 1 even if First Steps is untouched',pg.evaluate("chapterOpen(2)&&unlocked(6)&&!isPassed(20)"))
    ctx.close()
    # every stop in turn, in all three stories
    passed=[]
    for sid in range(20,26):
        story=['jordan','heer'][sid%2]
        ctx,pg=ctxpage(b,story,list(range(20,sid)))
        pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
        check('stop %d has a story place name (%s)'%(sid,story),pg.evaluate("placeName(%d)"%sid)!='Stop %d'%sid,pg.evaluate("placeName(%d)"%sid))
        check('stop %d has a clear line (%s)'%(sid,story),pg.evaluate("clearText(%d)"%sid)!='Stop cleared.')
        pg.evaluate("location.hash='stop-%d'"%sid); pg.wait_for_selector('#v-level:not([hidden])')
        where=pg.locator('#lvWhere').inner_text(); check('stop %d header reads First steps (%s)'%(sid,where),where.startswith('First steps'),where)
        nl=pg.evaluate("cur.lesson.length"); titles=[]
        for i in range(nl):
            pg.wait_for_timeout(100); titles.append(pg.locator('#lTitle').inner_text())
            for a in range(pg.locator('#lActs .btn').count()):
                pg.locator('#lActs .btn').nth(a).click(); pg.wait_for_timeout(40)
            pg.locator('#lNext').click()
        pg.wait_for_selector('#goalbox:not([hidden])')
        tg=pg.evaluate("targetsOf(cur)"); total=pg.evaluate("total")
        check('stop %d has %d targets'%(sid,EXPECT[sid]),total==EXPECT[sid] and len(tg)==total,(total,len(tg)))
        # a click outside the scope gives a hint, not a crash
        if sid==25:
            hit(pg,'boardL',5,0); check('stop 25 explains the low E string is left out','low E' in pg.locator('#fb').inner_text(),pg.locator('#fb').inner_text())
        for s,f in tg: hit(pg,'boardL',s,f)
        pg.wait_for_selector('#reveal:not([hidden]) h3',timeout=4000)
        if sid in (24,25): check('stop %d reveal shows chord diagrams'%sid,pg.locator('#reveal svg.cdia').count()==(1 if sid==24 else 2),pg.locator('#reveal svg.cdia').count())
        pg.locator('#reveal .btn',has_text='Hear it').click() if pg.locator('#reveal .btn',has_text='Hear it').count() else None
        pg.locator('#reveal .btn',has_text='Take the quiz').click(); pg.wait_for_selector('#qMain:not([hidden])')
        wherq=pg.locator('#qWhere').inner_text(); check('stop %d quiz header reads First steps'%sid,wherq.startswith('First steps'),wherq)
        # first question wrong: a review link must open the right lesson step and come back
        st=answer(pg,False)
        rv=pg.locator('#qActs .btn',has_text='Review this in the lesson')
        check('stop %d wrong answer offers a lesson review'%sid,rv.count()==1 and st['lesson'] and st['lesson'][0]==sid,st['lesson'])
        if rv.count():
            rv.click(); pg.wait_for_selector('#lessonbox:not([hidden])')
            step=pg.evaluate("lstep"); check('stop %d review lands on lesson step %d'%(sid,st['lesson'][1]),step==st['lesson'][1] and step<nl,(step,nl))
            pg.locator('#lSkip').click(); pg.wait_for_selector('#qMain:not([hidden])')
            check('stop %d review returns to the same quiz'%sid,pg.evaluate("window.__FRETROAD_TEST.Q.i")==0)
        # finish the quiz with correct answers (the missed question comes back once)
        guard=0
        while guard<12:
            guard+=1
            if pg.locator('#qActs .btn.primary').count()==0: answer(pg)
            label=pg.locator('#qActs .btn.primary').inner_text()
            pg.locator('#qActs .btn.primary').click()
            if label=='See how you did': break
            pg.wait_for_timeout(50)
            if pg.locator('#qResult:not([hidden])').count(): break
            if pg.locator('#qChoices .choice').count()==0 and pg.evaluate("window.__FRETROAD_TEST.Q.queue[window.__FRETROAD_TEST.Q.i].kind")!='click': continue
            answer(pg)
        pg.wait_for_selector('#qResult:not([hidden]) h3',timeout=4000)
        h=pg.locator('#qResult h3').inner_text()
        # one miss is allowed: four right first time still clears the stop
        check('stop %d quiz passes with one miss (%s)'%(sid,h),h=='Stop cleared',h)
        check('stop %d marked passed'%sid,pg.evaluate("isPassed(%d)"%sid))
        check('stop %d result offers %s'%(sid,'the next stop' if sid<25 else 'the sandbox'),pg.locator('#qResult .btn',has_text='Next stop' if sid<25 else 'Open the sandbox').count()==1)
        ctx.close()
    # stress the generators: thousands of questions, each with exactly one right answer and distinct labels
    ctx,pg=ctxpage(b,'jordan',[]); pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    bad=pg.evaluate("""(()=>{var out=[],keys=Object.keys(QB).filter(k=>/^b[A-Z]/.test(k));
      for(var k of keys){ for(var n=0;n<400;n++){ var q=QB[k](20); if(!q.prompt||!q.explain||!q.lesson){out.push(k+': missing field');break}
        if(q.choices){ var ok=q.choices.filter(c=>c.ok).length; if(ok!==1){out.push(k+': '+ok+' correct in '+q.prompt);break}
          var L=q.choices.map(c=>c.label); if(new Set(L).size!==L.length){out.push(k+': duplicate choices in '+q.prompt+' '+L.join('|'));break}
          if(q.choices.length<2){out.push(k+': too few choices');break} }
        else if(q.kind!=='click'){out.push(k+': no choices and not a click question');break}
        var lv=q.lesson[0]; var L2=LEVELS.filter(x=>x.id===lv)[0]; if(!L2||q.lesson[1]>=L2.lesson.length){out.push(k+': bad lesson link '+q.lesson);break} } }
      return {out:out,keys:keys.length}})()""")
    check('%d new quiz generators pass 400 draws each'%bad['keys'],not bad['out'] and bad['keys']>=25,bad['out'])
    used=pg.evaluate("[].concat(...[20,21,22,23,24,25].map(i=>LEVELS.filter(l=>l.id===i)[0].quiz)).filter(k=>!QB[k])")
    check('every quiz key in the six stops exists',not used,used)
    ctx.close()
    # small screen: the new chapter fits the phone layout
    ctx,pg=ctxpage(b,'jordan',[],mobile=True); pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    ov=pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1")
    check('phone: map has no horizontal scroll with five chapter tabs',ov)
    ctx.close(); b.close()
print('ERRORS:',errors if errors else 'none'); print(sum(res),'of',len(res),'checks passed')
sys.exit(0 if (not errors and all(res)) else 1)
