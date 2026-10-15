"""간단한 합성 효과음 생성 (numpy만 사용, 44.1kHz mono 16bit WAV)."""
import sys, os, numpy as np, soundfile as sf
SR = 44100
rng = np.random.default_rng(7)
out = sys.argv[1]
os.makedirs(out, exist_ok=True)

def env(n, a=0.005, r=0.2, shape=3.0):
    t = np.arange(n) / SR
    att = np.clip(t / a, 0, 1)
    dec = np.exp(-t * shape / max(r, 1e-3))
    return att * dec

def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    sf.write(os.path.join(out, name + '.wav'), x.astype(np.float32), SR, subtype='PCM_16')

def lp(x, k):  # 이동평균 저역통과
    return np.convolve(x, np.ones(k) / k, mode='same')

def sweep(f0, f1, dur, kind='sin'):
    n = int(SR * dur); t = np.arange(n) / SR
    f = np.geomspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sin' else np.sign(np.sin(ph))

# whoosh: 대역 이동 노이즈
n = int(SR * 0.45); noise = rng.standard_normal(n)
w = np.zeros(n)
for k, seg in zip([40, 20, 10, 6], np.array_split(np.arange(n), 4)):
    w[seg] = lp(noise, k)[seg]
w *= np.sin(np.linspace(0, np.pi, n)) ** 2
save('whoosh', w, 0.6)

# pop: 짧은 하강 사인
p = sweep(900, 250, 0.12) * env(int(SR * 0.12), 0.002, 0.08)
save('pop', p, 0.8)

# ding: 종소리 (배음 + 긴 감쇠)
n = int(SR * 1.2); t = np.arange(n) / SR
d = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1320, 1), (2640, 0.4), (3960, 0.2), (1980, 0.25)]) * np.exp(-t * 3.5)
d *= np.clip(t / 0.003, 0, 1)
save('ding', d, 0.6)

# zap: 전기 스파크 (크래클 노이즈 + 버즈)
n = int(SR * 0.5); t = np.arange(n) / SR
crack = rng.standard_normal(n) * (rng.random(n) < 0.08)
buzz = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + rng.standard_normal(n) * 0.4
z = (crack * 2 + buzz) * env(n, 0.002, 0.35)
save('zap', z, 0.55)

# beep: 경고음 2회
n1 = int(SR * 0.14); tt = np.arange(n1) / SR
b1 = np.sign(np.sin(2 * np.pi * 1000 * tt)) * 0.5 * np.clip(tt / 0.005, 0, 1) * np.clip((0.14 - tt) / 0.01, 0, 1)
gap = np.zeros(int(SR * 0.08))
save('beep', np.concatenate([b1, gap, b1]), 0.35)

# click: 클립 '착'
n = int(SR * 0.08)
c = rng.standard_normal(n) * env(n, 0.0005, 0.02, 4) + sweep(2500, 800, 0.08) * env(n, 0.0005, 0.03)
save('click', c, 0.8)

# thud: 낮은 쿵
n = int(SR * 0.4)
th = sweep(120, 45, 0.4) * env(n, 0.003, 0.25) + lp(rng.standard_normal(n), 30) * env(n, 0.001, 0.05)
save('thud', th, 0.9)

# rise: 상승 스윕 (긴장감)
n = int(SR * 1.0)
r = sweep(200, 1400, 1.0) * np.linspace(0, 1, n) ** 2 * np.clip((1.0 - np.arange(n) / SR) / 0.05, 0, 1)
save('rise', r * 0.6 + lp(rng.standard_normal(n), 8) * np.linspace(0, 0.3, n), 0.45)

# bubble: 보글보글 (거품)
n = int(SR * 1.2); bub = np.zeros(n)
for i in range(18):
    s = int(rng.random() * (n - 4000)); f = 400 + rng.random() * 600
    seg = sweep(f, f * 1.8, 0.05) * env(int(SR * 0.05), 0.001, 0.04)
    bub[s:s + len(seg)] += seg
save('bubble', bub, 0.5)

# sparkle: 반짝 (고음 아르페지오)
parts = []
for f in [1568, 2093, 2637, 3136]:
    nn = int(SR * 0.09); tt = np.arange(nn) / SR
    parts.append(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 25))
save('sparkle', np.concatenate(parts), 0.4)

# swoosh-up: 빠른 상승 휘익 (전환)
n = int(SR * 0.3)
su = lp(rng.standard_normal(n), 6) * np.sin(np.linspace(0, np.pi, n)) + sweep(300, 2000, 0.3) * 0.2 * np.sin(np.linspace(0, np.pi, n))
save('swoosh', su, 0.5)

# hum: 기계 웅 (전자레인지/원심분리기), 2초
n = int(SR * 2.0); t = np.arange(n) / SR
hm = (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t) + 0.2 * lp(rng.standard_normal(n), 20)) * np.clip(t / 0.1, 0, 1) * np.clip((2.0 - t) / 0.1, 0, 1)
save('hum', hm, 0.35)

# scratch: 연필 쓱쓱 (짧은 노이즈 스트로크 반복), 2초
n = int(SR * 2.0); sc = np.zeros(n)
for i in range(8):
    s0 = int(i * SR * 0.25); ln = int(SR * 0.18)
    seg = (rng.standard_normal(ln) - lp(rng.standard_normal(ln), 4)) * np.sin(np.linspace(0, np.pi, ln))
    sc[s0:s0 + ln] += seg
save('scratch', sc, 0.35)

print(sorted(os.listdir(out)))
