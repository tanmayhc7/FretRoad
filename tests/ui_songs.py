"""Songs: import a chart, open the play-along, backing band schedules, chord listener on a synthetic chord."""
import os, json, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=HERE+'/out/'; os.makedirs(OUT,exist_ok=True)
import numpy as np, wave
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
errors=[]; res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
# synthetic strummed chords: 2 s of C then 2 s of G, plucked partials
sr=44100
def pluck(m,dur,seed):
    f=440*2**((m-69)/12); t=np.arange(int(sr*dur))/sr; r=np.random.default_rng(seed+m); o=np.zeros_like(t)
    for h in range(1,10):
        o+=1/h**1.1*np.sin(2*np.pi*f*h*t+r.random()*6.28)*np.exp(-(0.8+0.3*h)*t)
    return o
def chord(ms,dur,off):
    o=np.zeros(int(sr*dur))
    for i,m in enumerate(ms):
        p=pluck(m,dur,i); s=int(i*0.02*sr); o[s:]+=p[:len(o)-s]
    return o/np.abs(o).max()*0.5
wav=np.concatenate([np.zeros(int(sr*1.0)),chord([48,52,55,60,64],2.2,0),chord([43,47,50,55,59,67],2.2,0)])
w=wave.open(OUT+'cg.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((wav*32767).astype('<i2').tobytes()); w.close()
CHART="Test Song\n\n[Verse]\nC          G\nHello darkness my old friend\nAm         F\nI've come to talk with you again\n"
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+OUT+'cg.wav'])
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=['microphone'])
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{localStorage.setItem('fretroad-v1',JSON.stringify({done:[1,2,3,4,5],passed:[1,2,3,4,5],best:{},intro:true,story:'road',chSeen:[1,2,3,4]}))}catch(e){}")
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts' not in m.text.lower() else None)
    pg.goto(URL); pg.wait_for_selector('#v-map:not([hidden])')
    pg.locator('#songsBtn').click(); pg.wait_for_selector('#v-songs:not([hidden])')
    check('jam tracks listed',pg.locator('#jamList .songcard').count()==pg.evaluate('JAMS.length'),pg.locator('#jamList .songcard').count())
    pg.locator('#addSongBtn').click(); pg.fill('#impText',CHART)
    pg.wait_for_timeout(200); st=pg.inner_text('#impStat'); check('import finds chords',('4 different' in st),st)
    pg.fill('#impTitle','Test Song'); pg.locator('#impSave').click()
    check('song card appears',pg.locator('#songList .songcard').count()==1)
    pg.screenshot(path=OUT+'shot_songs.png',full_page=True)
    pg.locator('#songList .songcard .btn.primary').click(); pg.wait_for_selector('#v-jam:not([hidden])')
    check('chart renders chord segments',pg.locator('#jChart .seg').count()>=4,pg.locator('#jChart .seg').count())
    check('now diagram drawn',pg.locator('#jNowDia svg').count()==1)
    check('next chord named',pg.inner_text('#jNextName').strip()=='G',pg.inner_text('#jNextName'))
    check('tip present',len(pg.inner_text('#jTip'))>5)
    pg.select_option('#jCount','on') if False else None
    pg.fill('#jBpm','120'); pg.locator('#jBpm').dispatch_event('input')
    pg.locator('#jMic').click(); pg.wait_for_function("document.querySelector('#jMic').textContent.indexOf('Stop')>=0",timeout=8000)
    pg.locator('#jCount').uncheck(); pg.locator('#jBpc').select_option('4')
    pg.locator('#jGo').click(); pg.wait_for_timeout(1200)
    check('running shows Stop',pg.inner_text('#jGo')=='Stop')
    check('beat dots lit',pg.locator('#jBeats i.on').count()>=1)
    pg.wait_for_timeout(7000)
    idx=pg.locator('#jChart .seg.now').count(); check('a chord is highlighted',idx==1,idx)
    heard=pg.inner_text('#jHeard'); print('heard:',heard)
    chg=pg.evaluate("JSON.stringify(save.chg||{})"); print('changes:',chg)
    pg.screenshot(path=OUT+'shot_jam.png',full_page=True)
    pg.locator('#jTrP').click(); check('transpose shows +1',pg.inner_text('#jTrV')=='+1',pg.inner_text('#jTrV'))
    pg.locator('#jGo').click(); pg.locator('#home').click(); pg.wait_for_selector('#v-map:not([hidden])')
    check('leaving stops the band',pg.evaluate("!BK.on&&!J.running"))
    # ui check: unit-ish
    u=pg.evaluate("JSON.stringify([changeInfo('G','C').moves,chordShape('Bb').barre,transposeChord('C',2),parseChart('C G\\nhi there').seq])")
    print(u)
    b.close()
print('errors:',errors)
ok=all(res) and not errors; print('ALL PASS' if ok else 'SOME FAILED'); sys.exit(0 if ok else 1)
