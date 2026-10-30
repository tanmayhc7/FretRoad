import os
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
OUT=os.path.join(HERE,'out')+'/'
os.makedirs(OUT,exist_ok=True)
os.chdir(HERE)
import json, sys
from playwright.sync_api import sync_playwright
OPEN=[64,59,55,50,45,40]
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
errors=[]; results=[]
def check(name,cond,extra=''):
    results.append((name,bool(cond),extra)); print(('PASS ' if cond else 'FAIL ')+name+(' '+str(extra) if (extra and not cond) else ''))
def qstate(page):
    return page.evaluate("(()=>{const Q=window.__FRETROAD_TEST.Q;const q=Q.queue[Q.i];return {i:Q.i,len:Q.queue.length,first:Q.first,mode:Q.mode,active:Q.active,kind:q.kind||'choice',ok:q.choices?q.choices.findIndex(c=>c.ok):-1,click:q.click||null,retry:!!q.retry}})()")
def hit(page,board,s,f):
    page.evaluate("([b,s,f])=>{document.querySelector('#'+b+' .hit[data-s=\"'+s+'\"][data-f=\"'+f+'\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))}",[board,s,f])
def answer(page,correct=True):
    st=qstate(page)
    if st['kind']=='click':
        c=st['click']; target=None
        for f in range(13):
            if (OPEN[c['s']]+f)%12==c['pc']: target=f; break
        if correct: hit(page,'boardQ',c['s'],target)
        else:
            ws=(c['s']+1)%6; hit(page,'boardQ',ws,target)
    else:
        n=page.locator('#qChoices .choice').count()
        idx=st['ok'] if correct else (st['ok']+1)%n
        page.locator('#qChoices .choice').nth(idx).click()
    page.wait_for_selector('#qActs .btn.primary')
def next_q(page):
    page.locator('#qActs .btn.primary').click()
def solve_puzzle(page):
    for s in range(6):
        for f in range(13):
            if page.locator('#reveal:not([hidden])').count(): return
            hit(page,'boardL',s,f)
def lessons_through(page):
    # click Next until puzzle shows
    for _ in range(6):
        if page.locator('#goalbox:not([hidden])').count(): return
        page.locator('#lNext').click()
def run_quiz(page,correct_n=5):
    page.wait_for_selector('#qPrompt')
    done=0
    while True:
        st=qstate(page)
        answer(page, correct=(done<correct_n or st['retry']))
        last=(st['i']>=st['len']-1)
        # after answering, queue may have grown; recompute
        st2=qstate(page)
        done+=1
        if st2['i']>=st2['len']-1:
            next_q(page); break
        next_q(page)
    page.wait_for_selector('#qResult:not([hidden])')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':1280,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}")
    page=ctx.new_page()
    page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)+' '+str(e.stack)[:400]))
    page.on('console',lambda m:errors.append('console.error: '+m.text) if m.type=='error' and 'fonts' not in m.text.lower() and 'ERR_' not in m.text else None)
    page.goto(URL); page.wait_for_selector('#storyOverlay:not([hidden])')
    check('story picker shows on first load',page.locator('.storycard').count()==3)
    page.locator('.storycard').first.click(); page.wait_for_selector('#talkOverlay:not([hidden])')
    check('intro overlay shows after choosing a story',True)
    for _ in range(14):
        if page.locator('#talkOverlay[hidden]').count(): break
        page.locator('#talkNext').click()
    check('intro overlay dismissed',page.locator('#talkOverlay[hidden]').count()==1)
    check('five stops on the map',page.locator('#stoplist .stop').count()==5)
    NP=page.evaluate("window.__FRETROAD_TEST.PRACTICE.length"); NL=page.evaluate("window.__FRETROAD_TEST.PRACTICE.filter(m=>m.needs>0).length")
    check('%d practice cards, %d locked at start'%(NP,NL),NP>=47 and page.locator('#mods .mod').count()==NP and page.locator('#mods .mod:disabled').count()==NL)
    check('stop 2 locked at start',page.locator('#stoplist .stop').nth(1).is_disabled())
    page.screenshot(path='out/shot_map.png')
    # stop 1
    page.evaluate("location.hash='stop-1'"); page.wait_for_selector('#lessonbox:not([hidden])')
    check('lesson shown before puzzle',page.locator('#lTitle').inner_text()=='Twelve notes')
    page.screenshot(path='out/shot_lesson.png')
    lessons_through(page); solve_puzzle(page)
    check('stop 1 puzzle solved shows quiz button',page.locator('#ra .btn.primary').inner_text()=='Take the quiz')
    page.screenshot(path='out/shot_puzzle_done.png')
    page.locator('#ra .btn.primary').click(); page.wait_for_selector('#v-quiz:not([hidden])')
    check('quiz view opens',page.locator('#qTitle').inner_text().endswith('quiz'))
    page.screenshot(path='out/shot_quiz_q1.png')
    # fail path: answer first two wrong, rest right
    n0=qstate(page)['len']
    answer(page,False); check('wrong answer queues a retry',qstate(page)['len']==n0+1)
    page.screenshot(path='out/shot_quiz_wrong.png')
    # review in lesson, then back to quiz
    rv=page.locator('#qActs .btn',has_text='Review this in the lesson'); check('review button after a miss',rv.count()==1)
    rv.click(); page.wait_for_selector('#lessonbox:not([hidden])')
    check('lesson opened from quiz shows back-to-quiz',page.locator('#lSkip').inner_text()=='Back to the quiz')
    page.locator('#lSkip').click(); page.wait_for_selector('#v-quiz:not([hidden])')
    st=qstate(page); check('quiz resumes where it was',st['i']==0 and st['len']==n0+1, st)
    # answering again isn't possible? the question is re-rendered unanswered
    answer(page,True); 
    # finish quiz with a mix: 2 wrong total -> fail
    while True:
        st=qstate(page)
        if st['i']>=st['len']-1: break
        next_q(page); st=qstate(page)
        answer(page, correct=(st['i']>=2))
    next_q(page); page.wait_for_selector('#qResult:not([hidden])')
    check('too many misses shows Almost there','Almost' in page.locator('#qResult h3').inner_text())
    check('stop 2 still locked after a failed quiz',page.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).passed.length")==0)
    page.screenshot(path='out/shot_quiz_fail.png')
    page.locator('#qResult .btn',has_text='Try again').click(); page.wait_for_selector('#qMain:not([hidden])')
    run_quiz(page)
    check('perfect run clears stop 1','Stop cleared' in page.locator('#qResult h3').inner_text())
    check('progress saved',page.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).passed")==[1])
    page.screenshot(path='out/shot_quiz_pass.png')
    page.locator('#qResult .btn.primary').click(); page.wait_for_selector('#lessonbox:not([hidden])')
    check('next stop opens on its lesson',page.locator('#lStep').inner_text().startswith('Lesson 1'))
    # stops 2-5
    for sid in range(2,6):
        if sid>2: page.evaluate("location.hash='stop-%d'"%sid); page.wait_for_selector('#lessonbox:not([hidden])')
        lessons_through(page); solve_puzzle(page)
        check('stop %d puzzle solved'%sid,page.locator('#ra .btn.primary').inner_text()=='Take the quiz')
        if sid==4: page.screenshot(path='out/shot_stop4_reveal.png')
        if sid==5: page.screenshot(path='out/shot_stop5_reveal.png')
        page.locator('#ra .btn.primary').click(); page.wait_for_selector('#v-quiz:not([hidden])')
        if sid==3: page.screenshot(path='out/shot_quiz_s3.png')
        run_quiz(page)
        check('stop %d cleared'%sid,'Stop cleared' in page.locator('#qResult h3').inner_text())
    check('all five passed',page.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).passed")==[1,2,3,4,5])
    page.screenshot(path='out/shot_quiz_final.png')
    # map after clearing
    page.evaluate("location.hash='map'"); page.wait_for_selector('#v-map:not([hidden])')
    NH=page.evaluate("window.__FRETROAD_TEST.PRACTICE.filter(m=>m.needs>5).length")
    check('practice cards for stops 1-5 unlocked (%d wait for chapter 2)'%NH,page.locator('#mods .mod:disabled').count()==NH)
    for _ in range(8):
        if page.locator('#talkOverlay[hidden]').count(): break
        page.locator('#talkNext').click(); page.wait_for_timeout(150)
    check('chapter 2 opens after chapter 1 with its own intro',page.locator('.chtab:not([disabled])').count()==2 and page.locator('#chEye').inner_text().lower().startswith('chapter 2'))
    page.locator('.chtab').first.click(); page.wait_for_timeout(200)
    check('amp shows three lights',page.locator('#stat .amp i.on').count()==3)
    page.screenshot(path='out/shot_map_done.png',full_page=True)
    # every practice module
    for mid in ['hunt','names','fifths','chords','ear','minor','octaves']:
        page.evaluate("location.hash='practice-%s'"%mid); page.wait_for_selector('#qMain:not([hidden])')
        for k in range(10):
            answer(page,True)
            if k<9: next_q(page)
        next_q(page); page.wait_for_selector('#qResult:not([hidden])')
        check('practice %s scores 10 of 10'%mid,page.locator('#qResult h3').inner_text()=='10 of 10',page.locator('#qResult h3').inner_text())
        if mid=='ear': page.screenshot(path='out/shot_practice_ear.png')
    best=page.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).best")
    check('best scores saved for all 7 drills',len(best)==7 and all(v==10 for v in best.values()),best)
    # sandbox + reset
    page.evaluate("location.hash='sandbox'"); page.wait_for_selector('#v-sand:not([hidden])')
    check('sandbox draws notes',page.locator('#boardS .orb').count()>10)
    page.evaluate("location.hash='map'"); page.wait_for_selector('#v-map:not([hidden])')
    page.locator('#reset').click(); page.locator('#reset').click()
    check('reset clears progress',page.evaluate("JSON.parse(localStorage.getItem('fretroad-v1')).passed.length")==0)
    # mobile layout
    m=b.new_context(viewport={'width':390,'height':844}); m.add_init_script("window.__FRETROAD_TEST={}")
    mp=m.new_page(); mp.on('pageerror',lambda e:errors.append('mobile pageerror: '+str(e)))
    mp.goto(URL); mp.wait_for_selector('#storyOverlay:not([hidden])')
    sw0=mp.evaluate("document.documentElement.scrollWidth"); check('mobile story picker: no horizontal page scroll',sw0<=392,sw0)
    mp.locator('.storycard').nth(1).click(); mp.wait_for_selector('#talkOverlay:not([hidden])')
    for _ in range(14):
        if mp.locator('#talkOverlay[hidden]').count(): break
        mp.locator('#talkNext').click()
    sw=mp.evaluate("document.documentElement.scrollWidth"); check('mobile map: no horizontal page scroll',sw<=392,sw)
    mp.evaluate("location.hash='stop-1'"); mp.wait_for_selector('#lessonbox:not([hidden])')
    sw=mp.evaluate("document.documentElement.scrollWidth"); check('mobile lesson: no horizontal page scroll',sw<=392,sw)
    mp.screenshot(path='out/shot_mobile_lesson.png')
    b.close()
print('\nERRORS:',errors if errors else 'none')
fails=[r for r in results if not r[1]]
print('%d checks, %d failed'%(len(results),len(fails)))
sys.exit(1 if fails or errors else 0)
