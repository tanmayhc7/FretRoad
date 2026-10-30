"""Export progress to a file in one browser context, import it in a fresh one."""
import json,os,tempfile
from playwright.sync_api import sync_playwright
PAGE=os.environ.get('FR_PAGE','file:///tmp/fr/repo/index.html')
S=json.dumps({'done':[1,2,3],'passed':[1,2,3],'best':{'1':4},'intro':True,'story':'jungle','chSeen':[1]})
with sync_playwright() as p:
    b=p.chromium.launch(); ok=True
    c1=b.new_context(accept_downloads=True); c1.add_init_script("localStorage.getItem('fretroad-v1')||localStorage.setItem('fretroad-v1',%s)"%json.dumps(S))
    a=c1.new_page(); a.goto(PAGE); a.wait_for_selector('#v-map:not([hidden])')
    with a.expect_download() as d: a.click('#expBtn')
    path=os.path.join(tempfile.mkdtemp(),'prog.json'); d.value.save_as(path)
    data=json.load(open(path)); ok&=data['app']=='fretroad' and data['progress']['done']==[1,2,3]
    c2=b.new_context(); c2.add_init_script("localStorage.getItem('fretroad-v1')||localStorage.setItem('fretroad-v1',%s)"%json.dumps(json.dumps({'done':[],'passed':[],'best':{},'intro':True,'story':'road','chSeen':[1,2,3,4]})))
    n=c2.new_page(); n.goto(PAGE); n.wait_for_selector('#v-map:not([hidden])')
    n.set_input_files('#bkFile',path); n.wait_for_timeout(400)
    st=json.loads(n.evaluate("localStorage.getItem('fretroad-v1')"))
    ok&=st['done']==[1,2,3] and st['story']=='jungle' and n.evaluate("document.body.dataset.story")=='jungle'
    bad=os.path.join(os.path.dirname(path),'bad.json'); open(bad,'w').write('{"x":1}')
    n.set_input_files('#bkFile',bad); n.wait_for_timeout(300)
    ok&=json.loads(n.evaluate("localStorage.getItem('fretroad-v1')"))['done']==[1,2,3]
    print('PASS' if ok else 'FAIL'); b.close(); raise SystemExit(0 if ok else 1)
