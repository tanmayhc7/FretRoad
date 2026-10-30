"""Fails if two scripts define the same top-level function or var (the later one silently wins).
Reads every name in a multi-name statement such as  var a=1,b=2,c;  not only the first."""
import re,glob,collections,os,sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
defs=collections.defaultdict(set)
def var_names(src,start):
    """names declared by the top-level `var` statement beginning at src[start:]"""
    i=start+3; depth=0; seg=''; names=[]; q=None; n=len(src)
    while i<n:
        c=src[i]
        if q:
            seg+=c
            if c=='\\': seg+=src[i+1]; i+=1
            elif c==q: q=None
        elif c in '\'"`': q=c; seg+=c
        elif c in '([{': depth+=1; seg+=c
        elif c in ')]}': depth-=1; seg+=c
        elif (c==',' or c==';') and depth==0:
            m=re.match(r'\s*([A-Za-z_$][\w$]*)',seg)
            if m: names.append(m.group(1))
            seg=''
            if c==';': break
        else: seg+=c
        i+=1
    else:
        m=re.match(r'\s*([A-Za-z_$][\w$]*)',seg)
        if m: names.append(m.group(1))
    return names
for f in glob.glob('js/**/*.js',recursive=True):
    src=open(f).read()
    for m in re.finditer(r'^function\s+(\w+)',src,re.M): defs[m.group(1)].add(f)
    for m in re.finditer(r'^var\s',src,re.M):
        for nm in var_names(src,m.start()): defs[nm].add(f)
bad={k:sorted(v) for k,v in defs.items() if len(v)>1}
print(bad or 'no duplicate globals'); sys.exit(1 if bad else 0)
