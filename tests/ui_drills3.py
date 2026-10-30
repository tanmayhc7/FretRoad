"""Third drill batch: generator sanity, timed sprint, finger gym, locks. Run: python3 tests/ui_drills3.py"""
import os, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
SAVE=json.dumps({'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})
INIT="window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(SAVE)
fails=[]; errs=[]
def check(n,ok):
    print(('PASS ' if ok else 'FAIL ')+n)
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script(INIT)
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    # every generator: exactly one right answer, unique labels, no undefined/NaN text
    bad=pg.evaluate("""()=>{const out=[];['triadSet','pentBox','caged','polyrhythm','melodyEar','findNote'].forEach(k=>{for(let i=0;i<400;i++){
      let q; try{q=QB[k]()}catch(e){out.push(k+' threw '+e.message);break}
      if(q.kind!=='click'){const ls=q.choices.map(c=>c.label); if(q.choices.filter(c=>c.ok).length!==1) out.push(k+' ok count '+JSON.stringify(ls)); if(new Set(ls).size!==ls.length) out.push(k+' dup '+ls); if(ls.length<3) out.push(k+' few choices '+ls);}
      const txt=JSON.stringify([q.prompt,q.explain,q.choices||'']); if(/undefined|NaN|null/.test(txt)) out.push(k+' bad text '+txt.slice(0,160));}});return out.slice(0,6)}""")
    check('generators clean (%s)'%(bad[:2],),bad==[])
    # triad grips really spell the chord
    ok=pg.evaluate("""()=>{for(let i=0;i<300;i++){const set=pick(TSETS),t=pick(['major','minor']),r=rnd(12),inv=rnd(3),f=triadFrets(set.s,r,t,inv); if(!f) return 'none '+r+t+inv; const got=f.map((x,j)=>pcOf(set.s[j],x)),want=cpcs(r,t); if(got.slice().sort().join()!==want.slice().sort().join()||got[0]!==want[inv]) return 'wrong '+r+t+inv+' '+f; if(Math.max(...f)-Math.min(...f)>4) return 'wide'} return 'ok'}""")
    check('triad grips spell the chord (%s)'%ok,ok=='ok')
    # box starts agree with the neck
    ok=pg.evaluate("""()=>{for(let r=0;r<12;r++){if(r===4) continue; for(let n=0;n<5;n++){const f=boxStart(r,n); const pc=pcOf(5,f); const want=(r+PBOX[n])%12; if(pc!==want) return r+' '+n+' fret '+f}} return 'ok'}""")
    check('pentatonic box starts land on the right notes (%s)'%ok,ok=='ok')
    ok=pg.evaluate("""()=>{for(let r=0;r<12;r++)for(const s of CAGED){const f=cfret(r,s); if((CBASE[s]+f)%12!==r) return r+s} return 'ok'}""")
    check('CAGED shape frets move the root correctly (%s)'%ok,ok=='ok')
    # sprint: quiz runs and the result shows the time
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='sprint').rounds=3")
    pg.evaluate("location.hash='practice-sprint'"); pg.locator('#qResult:not([hidden]) .acts .btn.primary').click()
    pg.wait_for_selector('#qMain:not([hidden]) #qPrompt')
    for _ in range(3):
        # answer by clicking the right cell through the app's own state
        pg.evaluate("(()=>{const q=Q.queue[Q.i]; onCellQ(q.click.s,(()=>{for(let f=0;f<=FRETS;f++) if(pcOf(q.click.s,f)===q.click.pc) return f})())})()")
        pg.locator('#qActs .btn.primary').click()
    pg.wait_for_selector('#qResult:not([hidden]) h3')
    txt=pg.locator('#qResult').inner_text()
    check('sprint result shows a time (%s)'%txt.replace('\n',' ')[:80],'Time:' in txt and 'seconds' in txt)
    check('fastest clean run saved',pg.evaluate("!!JSON.parse(localStorage.getItem('fretroad-v1')||'{}').bestTime||!!save.bestTime"))
    # finger gym: play flow with self-check
    pg.evaluate("window.__FRETROAD_TEST.PRACTICE.find(x=>x.id==='spiderwalk').rounds=2")
    pg.evaluate("location.hash='practice-spiderwalk'"); pg.locator('#pResult:not([hidden]) .acts .btn.primary').click()
    pg.wait_for_selector('#pMain:not([hidden]) #pPrompt')
    check('finger gym shows 12 chips and the pattern on the neck',pg.locator('#pSeq .chip').count()==12 and pg.locator('#boardP .orb, #boardP [class*=orb]').count()>=12)
    for _ in range(2):
        pg.get_by_role('button',name='I played it').click(); pg.wait_for_timeout(450)
    pg.wait_for_selector('#pResult:not([hidden]) h3',timeout=5000)
    check('finger gym finishes (%s)'%pg.locator('#pResult h3').inner_text(),'of 2 clean' in pg.locator('#pResult h3').inner_text())
    # locks: pentatonic boxes need stop 7
    pg.evaluate("location.hash='map'"); pg.wait_for_selector('#v-map:not([hidden])')
    check('pentatonic boxes locked until stop 7',pg.evaluate("document.querySelector('#mods .mod[data-id=pentboxes]').disabled===true"))
    check('triad string sets open after stop 4',pg.evaluate("document.querySelector('#mods .mod[data-id=triadsets]').disabled===false"))
    check('no page errors',errs==[])
    b.close()
print('ALL PASS' if not fails else 'FAILED: %s'%fails)
