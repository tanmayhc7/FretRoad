"""Listening to a recording: tempo, time signature and chord matching on synthetic songs (no real music in the repo)."""
import os, json, wave, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=HERE+'/out/'; os.makedirs(OUT,exist_ok=True)
from playwright.sync_api import sync_playwright
URL='file://'+os.environ.get('FR_PAGE',ROOT+'/index.html')
res=[]
def check(n,c,x=''):
    res.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if (x and not c) else ''))
sr=22050
CH={'C':[0,4,7],'G':[7,11,2],'Am':[9,0,4],'F':[5,9,0],'D':[2,6,9],'A':[9,1,4]}
def song(name,bpm,bpb,chords,shift,bars_per_chord=1,lead=0.5):
    spb=60/bpm; total=lead+len(chords)*bars_per_chord*bpb*spb+1.0; y=np.zeros(int(sr*total)); rng=np.random.default_rng(3)
    nbeats=int(len(chords)*bars_per_chord*bpb)
    for b in range(nbeats):
        t0=lead+b*spb; ci=b//(bpb*bars_per_chord); acc=1.0 if b%bpb==0 else .55
        # kick
        n=int(sr*.12); t=np.arange(n)/sr; k=np.sin(2*np.pi*(120*np.exp(-t*25)+45)*t)*np.exp(-t*30)*acc*.9; s=int(t0*sr); y[s:s+n]+=k[:len(y)-s]
        # strummed triad, a little arpeggiated
        for j,pc in enumerate(CH[chords[ci]]):
            f=440*2**((((pc+shift)%12)+48-69)/12)
            for h in range(1,6):
                n=int(sr*spb*.95); t=np.arange(n)/sr; v=np.sin(2*np.pi*f*h*t)*np.exp(-(3+h)*t)/h*acc*.5; s=int((t0+j*.012)*sr); y[s:s+n]+=v[:max(0,len(y)-s)]
        # offbeat hat
        n=int(sr*.03); h=rng.standard_normal(n)*np.exp(-np.arange(n)/sr*120)*.06; s=int((t0+spb/2)*sr); y[s:s+n]+=h[:max(0,len(y)-s)]
    y=y/np.abs(y).max()*.8
    w=wave.open(OUT+name,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y*32767).astype('<i2').tobytes()); w.close()
    return [lead+i*bars_per_chord*bpb*spb for i in range(len(chords))]
PROG=['C','G','Am','F']*4
t44=song('an44.wav',100,4,PROG,0)
t34=song('an34.wav',90,3,PROG,0)
tup=song('an44up.wav',100,4,PROG,2)
def chart(ch): return "Invented Tune\n\n[Verse]\n"+"\n".join("%s\nla la la la"%c for c in ch)
save={'done':[1,2,3,4,5],'passed':[1,2,3,4,5],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4],'tour':1,'songs':[{'id':'s1','title':'Invented Tune','text':chart(PROG)}]}
def run(pg,fname):
    pg.goto(URL+'#jam-s1'); pg.wait_for_timeout(500)
    pg.evaluate("recDetach(); REC.an=null;"); pg.evaluate("(function(){var s=songsList()[0]; delete s.marks; delete s.an; persist();})()")
    pg.goto(URL+'#jam-s1'); pg.wait_for_timeout(500)
    pg.set_input_files('#jRecFile',OUT+fname)
    pg.wait_for_function("/matched|could not/.test(document.getElementById('jRecInfo').textContent)",timeout=120000)
    return pg.evaluate("({bpm:REC.an&&REC.an.bpm,bpb:REC.an&&REC.an.bpb,marks:REC.marks,capo:J.capo,info:document.getElementById('jRecInfo').textContent,saved:songsList()[0].an})")
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx=b.new_context(viewport={'width':1200,'height':900})
    ctx.add_init_script("window.__FRETROAD_TEST={}; try{ if(!localStorage.getItem('fretroad-v1')) localStorage.setItem('fretroad-v1',%s)}catch(e){}"%json.dumps(json.dumps(save)))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(300)
    o=run(pg,'an44.wav'); print(o['info'])
    check('4/4 tempo near 100',o['bpm'] and abs(o['bpm']-100)<=3,o['bpm'])
    check('4/4 detected',o['bpb']==4,o['bpb'])
    err=np.mean(np.abs(np.array(o['marks'])-np.array(t44))) if len(o['marks'])==16 else 99
    check('16 chord marks within 0.3 s on average',err<0.3,err)
    check('no capo change needed',o['capo']==0,o['capo'])
    check('analysis saved with the song',o['saved'] and o['saved']['bpm'])
    o=run(pg,'an34.wav'); print(o['info'])
    check('3/4 tempo near 90',o['bpm'] and abs(o['bpm']-90)<=3,o['bpm'])
    check('3/4 detected',o['bpb']==3,o['bpb'])
    err=np.mean(np.abs(np.array(o['marks'])-np.array(t34))) if len(o['marks'])==16 else 99
    check('3/4 marks close',err<0.35,err)
    o=run(pg,'an44up.wav'); print(o['info'])
    check('recording two semitones up suggests capo 2',o['capo']==2,o['capo'])
    check('no errors',not errs,errs)
    b.close()
print('ui_analysis:',('ALL PASS' if all(res) else 'FAILURES'))
