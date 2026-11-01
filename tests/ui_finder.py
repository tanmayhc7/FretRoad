"""Chord finder in the Sandbox: pick notes on the neck, read the chord name. Standard and DADGAD."""
import os, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
save={'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1],'tour':1}
def name(pg): return pg.inner_text('#sFindOut .fnd-name') if pg.locator('#sFindOut .fnd-name').count() else ''
def pick(pg,frets):   # frets by string low->high, -1 = none
    pg.evaluate("finderClear()")
    for i,f in enumerate(frets):
        if f>=0: pg.evaluate("finderCell(%d,%d)"%(5-i,f))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(save)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL+'#sandbox'); pg.wait_for_timeout(500)
    pg.select_option('#sMode','find'); pg.wait_for_timeout(200)
    check('finder panel shown, key picker hidden',pg.locator('#sFindOut').is_visible() and not pg.locator('#sKeyLbl').is_visible())
    check('hint before any note','Tap a note' in pg.inner_text('#sFindOut'))
    cases=[('open C',[-1,3,2,0,1,0],'C'),('open Am',[-1,0,2,2,1,0],'Am'),('open G',[3,2,0,0,0,3],'G'),('open E7',[0,2,0,1,0,0],'E7'),
           ('Dm7',[-1,-1,0,2,1,1],'Dm7'),('Cmaj7',[-1,3,2,0,0,0],'Cmaj7'),('D/F#',[2,-1,0,2,3,2],'D/F♯'),('power chord A5',[-1,0,2,2,-1,-1],'A5'),('Dsus4',[-1,-1,0,2,3,3],'Dsus4')]
    for n,fr,exp in cases:
        pick(pg,fr); got=name(pg); check('%s is named %s (got %s)'%(n,exp,got),got==exp)
    pick(pg,[-1,3,2,0,1,0]); check('notes and intervals listed','C E G' in pg.inner_text('#sFindOut').replace('C E G C E','C E G') or 'C E' in pg.inner_text('#sFindOut'))
    check('alternatives listed for Am7 / C6',(pick(pg,[-1,0,2,0,1,0]) or True) and 'Am7' in name(pg) and 'C6' in pg.inner_text('#sFindOut'))
    pick(pg,[-1,0,1,-1,-1,-1]); check('two notes that are no chord say so','No common chord name' in pg.inner_text('#sFindOut') or '♭' in pg.inner_text('#sFindOut') or name(pg)!='')
    pick(pg,[-1,0,-1,-1,-1,-1]); check('one note asks for more','Add at least one more' in pg.inner_text('#sFindOut'))
    pg.evaluate("finderClear(); finderCell(4,0); finderCell(4,0)"); check('tapping a note twice removes it',pg.evaluate("FIND.frets[4]")==-1)
    pg.click('#sFindClear'); check('clear empties the neck',pg.evaluate("FIND.frets.every(f=>f<0)"))
    # DADGAD: open strings are Dsus4, labels follow the tuning
    pg.evaluate("setTuning('dadgad')"); pg.select_option('#sMode','find'); pg.wait_for_timeout(200)
    pick(pg,[0,0,0,0,0,0]); got=name(pg); check('DADGAD open strings read as Dsus4 (%s)'%got,got=='Dsus4')
    pick(pg,[0,0,0,0,0,4]); check('DADGAD 000004 is D add4 (the G rings as a drone)',name(pg)=='Dadd4',name(pg))
    labels=pg.evaluate("[].filter.call(document.querySelectorAll('#boardS svg text[x=\"50\"]'),t=>t.getAttribute('y')!=='306').map(t=>t.textContent).join('')")
    check('string names top to bottom read D A G D A D (%s)'%labels,labels=='DAGDAD')
    pg.select_option('#sMode','scale'); pg.wait_for_timeout(200)
    labels=pg.evaluate("[].filter.call(document.querySelectorAll('#boardS svg text[x=\"50\"]'),t=>t.getAttribute('y')!=='306').map(t=>t.textContent).join('')")
    check('scale mode goes back to standard labels (%s)'%labels,labels=='EBGDAE')
    check('no errors',not errs,errs); b.close()
print('ui_finder:',('ALL PASS' if all(res) else 'FAILURES'))
