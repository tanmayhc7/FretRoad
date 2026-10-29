import numpy as np, wave, sys
sr=44100
def note(m,dur,seed=1):
    f=440*2**((m-69)/12); t=np.arange(int(sr*dur))/sr; rng=np.random.default_rng(seed+m); o=np.zeros_like(t)
    for h in range(1,13):
        fh=f*h*np.sqrt(1+0.00008*h*h)
        if fh>sr/2.2: break
        o+= (0.5 if (h==1 and m<48) else 1)/h**1.15*(0.6+0.8*rng.random())*np.sin(2*np.pi*fh*t+rng.random()*6.28)*np.exp(-(1.2+0.3*h)*t)
    o*=np.minimum(1,t/0.004)
    return o/np.abs(o).max()*0.5
def seq(notes,slot=1.0,dur=0.9):
    out=[]
    for m in notes:
        n=note(m,dur); pad=np.zeros(int(sr*slot)-len(n)); out.append(np.concatenate([n,pad]))
    return np.concatenate([np.zeros(int(sr*0.8))]+out)
def save(path,x):
    w=wave.open(path,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes()); w.close()
import os
d=os.path.join(os.path.dirname(os.path.abspath(__file__)),'out')+'/'
os.makedirs(d,exist_ok=True)
save(d+'a2.wav',seq([45,45,45]))
save(d+'cshape.wav',seq([48,52,55,60,64],slot=1.1))   # C shape low to high: C3 E3 G3 C4 E4
save(d+'ascale.wav',seq([57,60,62,64,67,69],slot=0.9,dur=0.8)) # A minor pent: A C D E G A
save(d+'wrong.wav',seq([57,57,57]))
print('wavs ok')
save(d+'carp.wav',seq([48,52,55,60,55,52,48],slot=1.0,dur=0.85))
