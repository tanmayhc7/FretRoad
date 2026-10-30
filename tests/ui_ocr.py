"""OCR import: rebuild 'chords over words' text from word boxes (synthetic, no engine needed), then parse it."""
import os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
# invented song; char width 10px, line height 30px. rows: (y, [(col,text,conf)])
ROWS=[(100,[(0,'Invented',90),(9,'Tune',90)]),
      (200,[(0,'[Chorug',80)]),
      (240,[(0,'em',40),(14,'c',40)]),
      (270,[(0,'Hello',95),(6,'brightDay',60),(16,'again,',90)]),
      (330,[(0,'G',90),(12,'D',90)]),
      (360,[(0,'Walking',95),(8,'home',95),(13,'slow',95)]),
      (420,[(0,'Page 1/2',90)])]
js="""(function(rows){var w=[];rows.forEach(function(r){r[1].forEach(function(c){w.push({text:c[1],x0:c[0]*10,x1:(c[0]+c[1].length)*10,y0:r[0],y1:r[0]+24,conf:c[2]})})});
 var t=ocrWordsToText(w);var ch=parseChart(t);return {t:t,ch:ch};})"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.add_init_script("window.__FRETROAD_TEST={}")
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(400)
    o=pg.evaluate("(function(){var f="+js+";return f("+__import__('json').dumps(ROWS)+")})()")
    t=o['t']; print(t)
    check('section bracket repaired',('[Chorus]' in t),t)
    check('lowercase chords capitalised','Em' in t and ' C' in t,t)
    check('glued words split','bright Day' in t,t)
    check('page footer removed','Page' not in t,t)
    check('chord column kept above word','\n' in t and t.split('\n')[3].startswith('Em'),t)
    check('no errors',not errs,errs)
    b.close()
print('ui_ocr:',('ALL PASS' if all(res) else 'FAILURES'))
