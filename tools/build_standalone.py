#!/usr/bin/env python3
"""Bundle index.html, css/ and js/ into ONE self-contained html file.
Usage: python3 tools/build_standalone.py [out.html]   (default: dist/fretroad.html)
Only needed for sharing a single file; the game runs straight from index.html."""
import os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist', 'fretroad.html')
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
def css(m):
    return '<style>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</style>'
def js(m):
    return '<script>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</script>'
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', js, html)
icon = open(os.path.join(root, 'assets', 'favicon.svg'), encoding='utf-8').read().strip().replace('"', "'").replace('<', '%3C').replace('>', '%3E').replace('#', '%23')
html = html.replace('<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">', '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + icon + '">')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print('wrote', out, len(html), 'bytes')
