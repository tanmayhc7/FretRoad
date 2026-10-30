"""Fails if two scripts define the same top-level function or var (the later one silently wins)."""
import re,glob,collections,os,sys
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
defs=collections.defaultdict(set)
for f in glob.glob('js/**/*.js',recursive=True):
    for m in re.finditer(r'^(?:function\s+(\w+)|var\s+(\w+))',open(f).read(),re.M): defs[m.group(1) or m.group(2)].add(f)
bad={k:sorted(v) for k,v in defs.items() if len(v)>1}
print(bad or 'no duplicate globals'); sys.exit(1 if bad else 0)
