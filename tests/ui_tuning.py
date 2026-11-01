"""DADGAD: chord shapes in the tuning, the picker on Songs and in the jam, and that standard tuning is untouched."""
import os, json
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
save={'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1],'tour':1,'songs':[{'id':'s1','title':'Tune','text':'Tune\n\n[Verse]\nD\nla la\nG\nla la\nA\nla la'}]}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(save)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL+'#songs'); pg.wait_for_timeout(500)
    std=pg.evaluate("['D','G','Am','C7'].map(s=>chordShape(s).frets.join())")
    check('standard shapes unchanged',std[0]=='-1,-1,0,2,3,2' and std[1]=='3,2,0,0,0,3',std)
    pg.select_option('.tuning-select','dadgad'); pg.wait_for_timeout(300)
    check('tuning saved',pg.evaluate("save.tuning")=='dadgad')
    check('open strings follow the tuning',pg.evaluate("LOW_OPEN.join()")=='38,45,50,55,57,62')
    check('riff helper follows the tuning',pg.evaluate("RIFF.names.join('')")=='DADGAD')
    # every common chord on every root: every fretted note is in the chord, root in the bass, 4+ strings
    bad=pg.evaluate("""(()=>{var bad=[],N=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
      N.forEach(n=>['','m','7','m7','maj7','sus2','sus4','5','add9','6'].forEach(q=>{var c=parseChord(n+q),sh=chordShape(n+q); if(!sh){bad.push(n+q+' none');return;}
        var ok={}; CHORD_Q[q].forEach(s=>ok[(c.root+s)%12]=1); var snd=sh.frets.map((f,i)=>f<0?null:LOW_OPEN[i]+f).filter(x=>x!==null);
        if(snd.length<4) bad.push(n+q+' few'); if(snd[0]%12!==c.root) bad.push(n+q+' bass');
        sh.frets.forEach((f,i)=>{ if(f>0&&!ok[(LOW_OPEN[i]+f)%12]) bad.push(n+q+' offnote')}); }));
      return bad})()""")
    check('all 120 DADGAD voicings are valid',not bad,bad[:6])
    check('D major uses the F# on the G or high D string',pg.evaluate("chordShapeNotes(chordShape('D')).some(m=>m%12===6)"))
    check('diagram draws',pg.evaluate("chordDiagram('G',{w:120}).indexOf('<svg')===0"))
    check('sandbox offers several DADGAD shapes',pg.evaluate("chordShapeOptions('A').length>=2"))
    pg.goto(URL+'#jam-s1'); pg.wait_for_timeout(600)
    check('jam toolbar shows DADGAD selected',pg.evaluate("document.querySelector('#v-jam .tuning-select').value")=='dadgad')
    pg.select_option('#v-jam .tuning-select','std'); pg.wait_for_timeout(300)
    check('switching back restores standard',pg.evaluate("chordShape('D').frets.join()")=='-1,-1,0,2,3,2' and pg.evaluate("RIFF.names.join('')")=='EADGBe')
    pg.wait_for_timeout(600); pg.reload(); pg.wait_for_timeout(500)
    check('choice survives a reload',pg.evaluate("save.tuning")=='std')
    check('no errors',not errs,errs); b.close()
print('ui_tuning:',('ALL PASS' if all(res) else 'FAILURES'))
