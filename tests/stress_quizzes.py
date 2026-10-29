import os
from playwright.sync_api import sync_playwright
JS='''(()=>{
 const keys=new Set(); LEVELS.forEach(l=>(l.quiz||[]).forEach(k=>keys.add(k)));
 const out={bad:[],counts:{}};
 keys.forEach(k=>{ out.counts[k]=0;
  for(let i=0;i<3000;i++){ let q; try{ q=QB[k](6); }catch(e){ out.bad.push(k+' threw '+e.message); break; }
   out.counts[k]++;
   const s=JSON.stringify(q); if(/undefined|NaN|null/.test(s.replace(/"retry":null/g,''))) { out.bad.push(k+' bad text '+s.slice(0,200)); break; }
   if(q.choices){ const ls=q.choices.map(c=>c.label); const ok=q.choices.filter(c=>c.ok).length;
     if(ok!==1||new Set(ls).size!==ls.length||ls.length<2){ out.bad.push(k+' choices '+s.slice(0,260)); break; } }
   if(q.kind==='click'&&!q.click){ out.bad.push(k+' click no target'); break; }
  }});
 // semantic: bFret
 for(let i=0;i<2000;i++){ const q=QB.bFret(); const m=/play (.+) major with the (E|A) shape/.exec(q.prompt); const r=NAMES.indexOf(m[1]); const f=+q.choices.find(c=>c.ok).label.replace('Fret ',''); const root=pcOf(m[2]==='E'?5:4,f); if(root!==r){ out.bad.push('bFret wrong '+q.prompt+' '+f); break; } }
 for(let i=0;i<2000;i++){ const q=QB.bSame(); const m=/^(.+) major can be played at fret (\\d+) with the E shape/.exec(q.prompt); const r=NAMES.indexOf(m[1]); const f=+q.choices.find(c=>c.ok).label.replace('Fret ',''); if(pcOf(4,f)!==r||pcOf(5,+m[2])!==r){ out.bad.push('bSame wrong '+q.prompt+' '+f); break; } }
 for(let i=0;i<2000;i++){ const q=QB.pBoxRoot(); const m=/of (.+) minor pentatonic puts/.exec(q.prompt); const r=NAMES.indexOf(m[1]); const f=+q.choices.find(c=>c.ok).label.replace('Fret ',''); if(pcOf(5,f)!==r){ out.bad.push('pBoxRoot wrong '+q.prompt+' '+f); break; } }
 for(let i=0;i<2000;i++){ const q=QB.bMinorName(); const m=/the (E|A)-shape minor barre at fret (\\d+)/.exec(q.prompt); const root=pcOf(m[1]==='E'?5:4,+m[2]); if(q.choices.find(c=>c.ok).label!==NAMES[root]+'m'){ out.bad.push('bMinorName wrong '+q.prompt); break; } }
 for(let i=0;i<2000;i++){ const q=QB.pRel(); const m=/^(.+) (major|minor) pentatonic has the same five notes as which (major|minor)/.exec(q.prompt); const r=NAMES.indexOf(m[1]); const a=q.choices.find(c=>c.ok).label.replace(/ (major|minor) pentatonic/,''); const ra=NAMES.indexOf(a); const A=SCL[m[2]+' pentatonic'].iv.map(x=>(r+x)%12).sort().join(), B=SCL[m[3]+' pentatonic'].iv.map(x=>(ra+x)%12).sort().join(); if(A!==B){ out.bad.push('pRel wrong '+q.prompt+' '+a); break; } }
 for(let i=0;i<2000;i++){ const q=QB.bQual(); const m=/An (E|A)-shape barre chord has the (G|B) string at fret (\\d+) while the barre is at fret (\\d+)/.exec(q.prompt); const shape=m[1], third=+m[3], bf=+m[4]; const minor=shape==='E'?(third===bf):(third===bf+1); if(q.choices.find(c=>c.ok).label!==(minor?'Minor':'Major')){ out.bad.push('bQual wrong '+q.prompt); break; } }
 return out; })()'''
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'index.html')); pg.wait_for_timeout(500)
    r=pg.evaluate(JS); print('keys',len(r['counts']),'bad',r['bad'],'pageerr',errs); b.close()
