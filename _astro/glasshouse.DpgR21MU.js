import{t as e}from"./client.Cy7fLNQY.js";import{a as t,c as n,f as r,i,l as a,o,s,u as c,y as l}from"./album.Bdu7M7k4.js";import{t as u}from"./noise.BiYsHKpx.js";import{t as d}from"./watercolor.BVuDx8oz.js";import{A as f,B as p,C as m,D as ee,E as te,G as ne,H as h,L as re,N as ie,O as ae,Q as oe,R as se,S as ce,T as g,V as le,W as ue,X as _,Y as v,Z as y,_ as de,a as fe,d as pe,f as me,g as he,h as ge,j as _e,l as ve,m as ye,n as be,p as xe,q as Se,r as Ce,s as we,t as Te,u as Ee,x as De,z as Oe}from"./three.module.RqudIKW6.js";var ke=`// 第 Ⅱ 章选择页的蒙版 1：Cartier 式的 GPU 流体（第 8 轮写过，第 11 轮找回来；半分辨率，速度场 + 染料场）。
// 思路同 PavelDoGreat/WebGL-Fluid-Simulation（MIT）：splat → curl / vorticity → divergence → Jacobi 压力 → 减梯度 → advect。
// 染料场 a = 洗开的量（被流体带着打旋、流动）；按 uDissipation 慢慢消散 → 约 3 s 后颜色从四周流回来。速度单位：纹素 / 秒。
varying vec2 vUv;
uniform vec2 uTexel;

#ifdef SPLAT
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec4 uColor;
uniform float uRadius;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float g = exp(-dot(p, p) / uRadius);
  gl_FragColor = texture2D(uTarget, vUv) + uColor * g;
}
#endif

#ifdef ADVECT
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform vec4 uDissipation;
uniform float uClampA;
void main() {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
  vec4 r = texture2D(uSource, coord) / (1.0 + uDissipation * uDt);
  r.a = min(r.a, uClampA);
  gl_FragColor = r;
}
#endif

#ifdef CURL
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
#endif

#ifdef VORTICITY
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
void main() {
  float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;
  vec2 v = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}
#endif

#ifdef DIVERGENCE
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vUv.x - uTexel.x < 0.0) L = -C.x;
  if (vUv.x + uTexel.x > 1.0) R = -C.x;
  if (vUv.y + uTexel.y > 1.0) T = -C.y;
  if (vUv.y - uTexel.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
#endif

#ifdef CLEAR
uniform sampler2D uSource;
uniform float uValue;
void main() { gl_FragColor = uValue * texture2D(uSource, vUv); }
#endif

#ifdef PRESSURE
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}
#endif

#ifdef GRADIENT
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(v, 0.0, 1.0);
}
#endif
`,Ae=`// 第 Ⅱ 章选择页的「湿画笔」场（第 10 轮，半分辨率，一个 ping-pong 渲染目标）：
//   R = 颜料量（阈值 0.5 以上就渗出上色版），G = 湿度（1 刚画、0.5 s 干到 0），B = 画了多久（s），A = 留下的水痕（干了以后慢慢淡掉）。
// 每帧：
//   1. 湿的地方继续往外洇：从四个方向（按纤维噪声变长短）取邻居的颜料量，减掉「走这一步的代价」（纤维越密越难走）——
//      所以前沿是纤维状的；湿度一没，洇就停。快划窄、慢划宽：笔触宽度和颜料量由 JS 按速度给。
//   2. 盖上这一帧的笔触（线段，颜料量从中线往两边降）、停着不动时的一小朵、入场时点击处的一圈。
//   3. 4 s 后开始干：颜料量每秒往下掉，边缘先低于阈值 → 从边缘往里退回线稿；A 记着最近到过的地方，留一圈很淡的水痕再消失。
// noise.glsl 拼在前面。
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uRes;      // CSS 像素
uniform vec2 uTexel;    // 1 / 渲染目标尺寸
uniform float uDt;
uniform float uSpeed;   // 洇开的速度（CSS px / s）
uniform vec4 uSeg[8];   // 笔触线段（CSS px，y 向上）
uniform vec2 uSegW[8];  // (半宽 px, 颜料量)
uniform int uCount;
uniform vec4 uDot;      // 停着不动 / 入场：(x, y, 半径, 颜料量)，半径 0 = 没有

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  vec2 px = vUv * uRes;
  vec4 s = texture2D(uPrev, vUv);
  float R = s.r, G = s.g, B = s.b, A = s.a;

  // 1. 洇：每帧走 uSpeed·dt 像素，纤维越密越费颜料
  float fib = fbm(px / 9.0) * 0.6 + vnoise(px / 3.0) * 0.4;
  float stepPx = uSpeed * uDt;
  vec2 o = stepPx / uRes;
  float best = 0.0;
  float wetN = 0.0;
  for (int i = 0; i < 4; i++) {
    float ang = float(i) * 1.5708 + fib * 1.2;
    vec2 dir = vec2(cos(ang), sin(ang));
    vec4 n = texture2D(uPrev, vUv + dir * o * (0.6 + 0.8 * fib));
    float w = smoothstep(0.02, 0.2, n.g);
    best = max(best, n.r * w);
    wetN = max(wetN, n.g * w);
  }
  float cost = stepPx * (0.0042 + 0.012 * fib);
  float grown = best - cost;
  if (grown > R) { R = grown; G = max(G, wetN * 0.985); B = min(B, 0.0); }

  // 2. 笔触
  for (int i = 0; i < 8; i++) {
    if (i >= uCount) break;
    float d = segDist(px, uSeg[i].xy, uSeg[i].zw);
    float prof = uSegW[i].y * (1.0 - smoothstep(0.0, uSegW[i].x, d));
    if (prof > 0.02) { R = max(R, prof); G = 1.0; B = 0.0; }
  }
  if (uDot.z > 0.0) {
    float d = length(px - uDot.xy);
    float prof = uDot.w * (1.0 - smoothstep(uDot.z * 0.4, uDot.z, d));
    if (prof > 0.02) { R = max(R, prof); G = 1.0; B = 0.0; }
  }

  // 3. 湿度 0.5 s 干掉（洇停住）；4 s 后颜料往下掉（从边缘退回线稿）；水痕记着、慢慢淡
  G = max(G - uDt / 0.5, 0.0);
  B += uDt;
  if (B > 4.0) R = max(R - uDt * 0.55, 0.0);
  A = max(A * exp(-uDt / 1.6), smoothstep(0.42, 0.55, R));
  gl_FragColor = vec4(R, G, B, A);
}
`,je=`// 第 11 / 12 轮：转场里共用的两个形状。noise.glsl 拼在前面。
// inkDrop：墨滴落进水里一样化开（返回覆盖 0–1，band 里返回「颜料最浓」的那一圈）。
//   px / o：CSS 像素（y 向上）；p：进度 0 → 1（1 = 铺满）；res：视口；scale：1 = 铺满整屏，< 1 = 小一号
float inkDrop(vec2 px, vec2 o, float p, vec2 res, float scale, out float band) {
  vec2 d = px - o;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float far = length(max(abs(o), abs(res - o))) * scale;
  float R = p * far * 1.18;
  // 角度用 (cos, sin) 取噪声：atan 在 ±π 处会断开，留下一道缝
  vec2 dir = vec2(cos(ang), sin(ang));
  float wob = (fbm(dir * 1.6 + vec2(4.0, p * 1.5) + o * 0.0013) - 0.5) * 0.34 * R;
  float fil = pow(fbm(dir * 6.0 + vec2(r * 0.004 - p * 1.5, 0.0)), 3.0) * 0.07 * R;
  float rr = r - wob - fil;
  float cov = 1.0 - smoothstep(R - 24.0 - R * 0.04, R, rr);
  float front = exp(-pow((rr - R * 0.93) / (14.0 + R * 0.05), 2.0));
  float rings = (0.5 + 0.5 * sin(rr * 0.05 - p * 10.0)) * cov;
  band = clamp(front * 1.1 + rings * 0.35 * (1.0 - p), 0.0, 1.0) * (1.0 - smoothstep(0.82, 1.0, p));
  if (p >= 1.0) { cov = 1.0; band = 0.0; }
  return cov;
}

// 第 12 轮：旋涡。返回「这个像素现在显示的是原画面里哪一点」（CSS 像素，y 向上）。
//   c：旋涡中心；g：缩放（< 1 = 画面往中心收拢，> 1 = 往外冲开）；th：中心处转多少弧度（往外按半径衰减）；
//   turb：湍流位移（px），t：湍流的时间（让它流动）。
vec2 swirl(vec2 px, vec2 c, float g, float th, float turb, float t) {
  vec2 d = px - c;
  float r = length(d);
  float a = th / (1.0 + r / 240.0);
  float cs = cos(a), sn = sin(a);
  d = vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y);
  vec2 n = vec2(fbm(px / 170.0 + vec2(t * 0.9, 1.3)), fbm(px / 170.0 + vec2(4.1, -t * 0.9))) - 0.5;
  return c + d / max(g, 1e-3) + n * turb;
}
/** 在视口里面（swirl 采样出界的地方算白纸） */
float inView(vec2 p, vec2 res) { vec2 q = step(vec2(0.0), p) * step(p, res); return q.x * q.y; }
/** 离视口边多远：收拢 / 涌出时画面的四边不能露成一个直边的方框，边上一圈软软地退成纸 */
/** k = 0：完全不退（退的那一段整个在视口外面）；k = 1：边上 26 % 退成纸。跨过视口边是连续的（出界的地方继续往外退） */
float edgeFadeK(vec2 p, vec2 res, float k) { vec2 d = min(p, res - p); float m = min(d.x, d.y); float r = min(res.x, res.y) * 0.26; m += (fbm(p / 90.0) - 0.5) * 0.5 * r * k; return smoothstep(-r * (1.0 - k), r * k + 1.0, m); }
float edgeFade(vec2 p, vec2 res) { vec2 d = min(p, res - p); float m = min(d.x, d.y); float r = min(res.x, res.y) * 0.26; float k = (fbm(p / 90.0) - 0.5) * 0.5 * r; return smoothstep(0.0, r, m + k); }

// 第 12 轮：「啪」地溅开。返回覆盖，band = 前沿那圈最浓的颜料，drops = 前沿外面飞出去的颜料点。
//   前沿是一圈不规则的、带尖刺的边（溅开，不是化开）。
float splash(vec2 px, vec2 o, float p, vec2 res, out float band, out float drops) {
  vec2 d = px - o;
  float r = length(d);
  vec2 dir = d / max(r, 1e-3);
  float far = length(max(abs(o), abs(res - o)));
  float R = p * far * 1.2;
  float spikes = pow(fbm(dir * 9.0 + 2.3), 2.2) * 0.32 + (fbm(dir * 2.2 + 7.1) - 0.5) * 0.22;
  float rr = r - spikes * R;
  float cov = 1.0 - smoothstep(R - 10.0 - R * 0.03, R, rr);
  band = exp(-pow((rr - R * 0.9) / (10.0 + R * 0.05), 2.0)) * (1.0 - smoothstep(0.75, 1.0, p));
  // 飞出去的点：前沿外 0–25 % 的地方，按格子撒
  drops = 0.0;
  if (p < 0.95 && r > R * 0.9 && r < R * 1.35 + 30.0) {
    vec2 cell = floor(px / 26.0);
    float h = hash12(cell + 17.0);
    if (h < 0.08) {
      vec2 cp = (cell + 0.5 + (vec2(hash12(cell + 2.7), hash12(cell + 5.3)) - 0.5) * 0.7) * 26.0;
      float s = mix(1.5, 6.0, hash12(cell + 8.9)) * (1.0 - p);
      drops = 1.0 - smoothstep(0.6, 1.0, length(px - cp) / max(s, 0.5));
    }
  }
  if (p >= 1.0) { cov = 1.0; band = 0.0; drops = 0.0; }
  return cov;
}
`,Me=`// 第 11 / 12 轮：把水彩（watercolor.glsl）画进一张半分辨率的贴图：rgb = 透色（乘到纸上），a = 颜料浓度。
// 画面几乎是静的（只有几十秒一个周期的呼吸），几帧才画一次；切换作品时新作品的那张画进另一张贴图（同一个材质，换 uniform）。
// noise.glsl、watercolor.glsl 拼在前面。
varying vec2 vUv;
uniform vec2 uRes;      // CSS 视口
uniform vec3 uPaper;    // sRGB（亮纸）
uniform vec3 uA0, uA1, uA2, uA3;
uniform float uSeedA;
uniform float uMode;
uniform float uTime;
void main() {
  float th;
  vec3 g = watercolor(vUv * uRes, uRes, uA0, uA1, uA2, uA3, uPaper, uMode, uTime, uSeedA, th);
  gl_FragColor = vec4(g, th);
}
`,Ne=`// 第 11 / 12 轮：第 Ⅱ 章选择页的背景（3D 场景最底下一块满屏四边形，玻璃罩的 transmission 也透过它）。线性色彩空间输出。
// 亮纸 × 水彩的透色（wc.frag.glsl 画好的贴图）。线稿平时完全看不见（第 12 轮）；只有蒙版（流体 / 渗色）洗开的地方露出线稿，
// 边缘是水彩洗开的样子：纤维软边，外面一圈很淡的水痕。悬停罩子：主色一圈淡淡的水彩边。底座下面一块很淡的影子。
// 切换作品（uSw）：旧颜色像被吸管吸走一样旋进罩子底部（suck），新颜色从那里涌出、往外漫开（gush）。
// 贴图都按原始 sRGB 值读（不做颜色空间转换），最后转成线性交给合成（合成再转回 sRGB）。noise.glsl、watercolor.glsl、inkdrop.glsl 拼在前面。
varying vec2 vUv;
uniform sampler2D uSketchA;
uniform sampler2D uSketchB;
uniform float uSketchMix;  // 0 = A，1 = B（切换作品时在颜色最少的那一刻换）
uniform sampler2D uWc;     // 当前作品的水彩
uniform sampler2D uWcB;    // 切换时：新作品的水彩
uniform vec4 uSw;          // (suck 0–1, gush 0–1, 中心 x, 中心 y)：gush > 0 时显示 uWcB
uniform float uSwT;        // 湍流的时间
uniform sampler2D uMask;
uniform float uMaskMode;   // 0 = 流体（染料 a），1 = 渗色（颜料 r）
uniform float uRecover;    // 进作品：洗开的地方合上（0–1）
uniform vec2 uRes;
uniform float uImgAspect;
uniform vec3 uPaper;       // 亮纸
uniform vec3 uSkPaper;     // 线稿图里的纸色（#EFE6D2）：换成亮纸，洗开处不会比四周暗一块
uniform vec3 uProduct;
uniform vec2 uHaloC;
uniform vec2 uHaloR;
uniform float uHalo;
uniform vec4 uShadow;
uniform float uShadowK;

vec2 coverUv(vec2 uv) {
  float a = uRes.x / uRes.y;
  vec2 s = a > uImgAspect ? vec2(1.0, uImgAspect / a) : vec2(a / uImgAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}
// 和合成里的 toSRGB 互为精确的反函数
vec3 toLin(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }

vec4 wcAt(sampler2D t, vec2 p, float k) {
  // 出了视口 = 白纸
  // 贴图边上夹住（ClampToEdge），出界的地方按离边多远连续地退成纸——不露直边
  return mix(vec4(1.0, 1.0, 1.0, 0.0), texture2D(t, clamp(p / uRes, 0.0, 1.0)), edgeFadeK(p, uRes, k));
}

void main() {
  vec2 px = vUv * uRes;
  vec2 cuv = coverUv(vUv);
  vec3 sk = mix(texture2D(uSketchA, cuv).rgb, texture2D(uSketchB, cuv).rgb, uSketchMix);
  sk = clamp(sk / uSkPaper, 0.0, 1.0) * uPaper;

  vec4 wc;
  if (uSw.y > 0.0) {
    // 新颜色从中心涌出：画面从一点往外长（g 小 → 大），带一点反向的旋
    float e = 1.0 - pow(1.0 - uSw.y, 3.0);
    float k = sin(3.14159 * uSw.y);
    wc = wcAt(uWcB, swirl(px, uSw.zw, mix(0.03, 1.0, e), -3.2 * pow(1.0 - uSw.y, 2.0), 50.0 * k, uSwT), clamp((1.0 - uSw.y) * 1.6, 0.0, 1.0));
  } else if (uSw.x > 0.0) {
    // 旧颜色旋进中心：画面往中心收拢（g 1 → 0.03），越来越快地转
    float e = uSw.x * uSw.x;
    float k = sin(3.14159 * uSw.x);
    wc = wcAt(uWc, swirl(px, uSw.zw, mix(1.0, 0.03, e), 4.5 * e, 50.0 * k, uSwT), min(uSw.x * 5.0, 1.0));
  } else wc = texture2D(uWc, vUv);
  vec3 colored = uPaper * wc.rgb;

  // 蒙版：洗开的量 → 纤维软边阈值
  vec4 m = texture2D(uMask, vUv);
  float amt = uMaskMode < 0.5 ? m.a : m.r;
  float fib = vnoise(px / 5.6) * 0.65 + vnoise(px / 2.8) * 0.35;
  float T = 0.5 + (fib - 0.5) * 0.12 + (fbm(px / 60.0) - 0.5) * 0.1;
  float w = smoothstep(T - 0.07, T, amt) * (1.0 - uRecover);
  // 洗开的边：外面一圈淡水痕（颜料被推到边上，略深），里面露出线稿和干净纸面
  float tide = exp(-pow((amt - (T - 0.09)) / 0.03, 2.0)) * (1.0 - w) * (1.0 - uRecover) * wc.a;
  vec3 col = mix(colored, sk, w);
  col *= mix(vec3(1.0), wc.rgb * 0.97, clamp(tide * 0.8, 0.0, 1.0));

  // 悬停罩子：主色一圈淡淡的水彩边
  vec2 hq = (px - uHaloC) / uHaloR;
  float hr = length(hq) + (fbm(px / 40.0) - 0.5) * 0.16;
  float bandH = smoothstep(0.92, 1.02, hr) * (1.0 - smoothstep(1.15, 1.3, hr));
  float rim = exp(-pow((hr - 1.27) / 0.022, 2.0));
  vec3 tint = mix(vec3(1.0), uProduct / max(max(max(uProduct.r, uProduct.g), uProduct.b), 1e-3), 0.5);
  col *= mix(vec3(1.0), tint, uHalo * (bandH * 0.4 + rim * 0.45));

  // 底座落在纸上的淡影（浅色底座，影子也很淡）
  vec2 sq = (px - uShadow.xy) / uShadow.zw;
  float sd = length(sq) + (fbm(px / 24.0) - 0.5) * 0.2;
  float sh = (1.0 - smoothstep(0.15, 1.0, sd));
  col *= mix(vec3(1.0), vec3(0.86, 0.83, 0.8), clamp(sh, 0.0, 1.0) * 0.5 * uShadowK);

  gl_FragColor = vec4(toLin(col), 1.0);
}
`,Pe=`// 第 11 / 12 轮：第 Ⅱ 章选择页的最后一道（画到屏幕，sRGB，预乘透明度）。三段转场的「高潮」都在这里画（第 12 轮）：
// - 入场（uEnt）：花园的画（K2，uGarden）当颜料——从点击处被泼开、打旋、往外冲（flow），然后被一股旋流卷向罩子中心汇成一团（gather），
//   「啪」地溅开（burst）：溅开的地方已经是这件作品的水彩和亮纸，前沿一圈浓颜料、外面飞出颜料点。画布一开始全透明（下面就是真的花园），
//   画面开始流动的地方才变成不透明，任何一帧都不会露出静止的花园条边。
// - 钟罩淡入 / 淡出：uBgOnly 是同一张背景（没有罩子，或入场时只有一圈玻璃轮廓），按 uCloche 混。
// - 进作品（uDive）：镜头往前推，整个画面透过玻璃被折射（屏幕空间：罩子的弧面把整屏拉弯、放大，边上有色散和一道高光），
//   玻璃「碎成水」（melt：折射的画面化成流动的颜料），作品的颜料从中心喷涌出来铺满全屏（gush），再退到四周（recede），露出作品页第 1 屏那张水彩。
// - 返回（uRet）：画面被吸向罩子中心再放回来（罩子在最收拢的时候出现）。
// - 出场（uDrop）：颜色往中心收拢、褪色，露出花园。
// - 整张叠 5 % 的纸纹（multiply）。noise.glsl、watercolor.glsl、inkdrop.glsl 拼在前面。
varying vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBgOnly;
uniform sampler2D uPaperTex;
uniform sampler2D uGarden;
uniform vec2 uRes;
uniform float uDpr;
uniform float uT;
uniform float uCloche;
uniform float uDrop;
uniform vec2 uDropO;
uniform vec3 uPaper;      // 亮纸
uniform vec3 uPagePaper;  // 网站别处的纸（花园四周）
uniform vec3 uP0, uP1, uP2;
uniform float uEntOn;
uniform vec3 uEnt;        // (flow, gather, burst)
uniform vec2 uEntO;
uniform vec2 uEntC;
uniform vec4 uDive;       // (lens, melt, gush, recede)
uniform vec2 uDiveC;
uniform vec2 uDiveR;
uniform float uRet;
uniform vec2 uRetC;

vec3 toSRGB(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
vec3 at(vec2 p) {
  if (uRet <= 0.0 && inView(p, uRes) < 0.5) return uPaper;
  vec2 uv = clamp(p / uRes, 0.0, 1.0);
  vec3 c = mix(toSRGB(texture2D(uBgOnly, uv).rgb), toSRGB(texture2D(uScene, uv).rgb), uCloche);
  // 返回时画面往中心收：四边软软地退成纸（不露直边）；平时 p == px，不影响
  return uRet > 0.0 ? mix(uPaper, c, edgeFadeK(p, uRes, min(uRet * 3.0, 1.0))) : c;
}
/** 浓颜料：色族里主色 / 深一层 / 浅一层按大块噪声混（OKLCH 里混，不发灰）；k 越小越浓 */
vec3 pigment(vec2 px, float k) {
  float n = fbm(px / 260.0 + uT * 0.05 + 3.7);
  vec3 a = lab2lch(toOklab(uP0)), b = lab2lch(toOklab(uP1)), c = lab2lch(toOklab(uP2));
  vec3 m = mixLch(mixLch(c, a, smoothstep(0.3, 0.55, n)), b, smoothstep(0.6, 0.85, n) * 0.8);
  return fromOklab(mix(lch2lab(m), toOklab(uPaper), k));
}
vec3 garden(vec2 p, float paperK) {
  if (inView(p, uRes) < 0.5) return mix(uPagePaper, uPaper, paperK);
  vec3 g = texture2D(uGarden, p / uRes).rgb;
  return mix(g, mix(g, uPaper, 0.6), step(0.5, paperK) * 0.0);
}

void main() {
  vec2 px = vUv * uRes;
  vec3 col;
  float gardenK = 0.0;   // 这一块是不是花园（花园自己有纸纹，不再叠）
  float alpha = 1.0;

  // 返回：画面被吸向罩子中心再放回来
  vec2 p = px;
  if (uRet > 0.0) p = swirl(px, uRetC, mix(1.0, 0.32, uRet), 2.6 * uRet, 40.0 * uRet, uT);

  if (uDive.x > 0.0 || uDive.y > 0.0) {
    // 镜头往前推：罩子的弧面（椭圆透镜）从罩子大小长到盖过整屏
    float far = length(max(abs(uDiveC), abs(uRes - uDiveC)));
    float L = uDive.x;
    vec2 E = mix(uDiveR, vec2(far * 1.45), L * L);
    float zoom = 1.0 + 0.4 * L;
    vec2 d = px - uDiveC;
    float s = length(d / E);
    float f = s < 1.0 ? (0.6 + 0.4 * s * s) : 1.0;
    vec2 q = uDiveC + d * f / zoom;
    // 玻璃碎成水：折射的画面化成流动的颜料
    float m = uDive.y;
    vec2 n = vec2(fbm(px / 150.0 + vec2(uT * 1.4, 2.0)), fbm(px / 150.0 + vec2(5.0, -uT * 1.4))) - 0.5;
    q += n * 160.0 * m;
    float disp = (s < 1.0 ? 0.014 : 0.004) * L * s;
    vec3 c0;
    c0.r = at(uDiveC + (q - uDiveC) * (1.0 + disp)).r;
    c0.g = at(q).g;
    c0.b = at(uDiveC + (q - uDiveC) * (1.0 - disp)).b;
    if (m > 0.0) {
      // 化开的模糊（沿流向的几次采样）
      vec3 acc = c0;
      for (int i = 1; i <= 4; i++) {
        float fi = float(i);
        acc += at(q + vec2(cos(fi * 2.1 + uT), sin(fi * 2.1 + uT)) * 14.0 * fi * m);
      }
      c0 = mix(c0, acc / 5.0, m);
    }
    // 玻璃的边：一道细高光 + 外面一圈很淡的暗边（透镜还在屏幕里的时候）
    float edge = (1.0 - smoothstep(0.85, 1.0, L));
    c0 += vec3(0.35) * exp(-pow((s - 1.0) / 0.008, 2.0)) * edge;
    c0 *= 1.0 - 0.1 * exp(-pow((s - 1.025) / 0.02, 2.0)) * edge;
    col = c0;
    // 颜料从中心喷涌出来铺满全屏（非常饱满）
    if (uDive.z > 0.0) {
      float band;
      float cov = inkDrop(px, uDiveC, uDive.z, uRes, 1.0, band);
      vec3 paint = pigment(px + n * 120.0, 0.12);
      paint = mix(paint, fromOklab(toOklab(paint) - vec3(0.06, 0.0, 0.0)), band);
      col = mix(col, paint, cov);
    }
    // 颜料退到四周，露出作品页第 1 屏那张水彩（没有罩子、洗开的地方都合上了）
    if (uDive.w > 0.0) {
      float band;
      float hole = inkDrop(px, uDiveC, uDive.w, uRes, 1.0, band);
      vec3 base = toSRGB(texture2D(uBgOnly, vUv).rgb);
      vec3 paint = pigment(px + n * 120.0, 0.12);
      // 退开的前沿：湿边（颜料被推到边上略深）
      vec3 edgeC = fromOklab(toOklab(paint) - vec3(0.05, 0.0, 0.0));
      col = mix(paint, base, hole);
      col = mix(col, edgeC, band * 0.6 * (1.0 - hole * 0.5));
    }
  } else {
    col = at(p);
  }

  // 入场：花园当颜料
  if (uEntOn > 0.5) {
    float a = uEnt.x, b = uEnt.y, c = uEnt.z;
    vec2 p1 = swirl(px, uEntC, mix(1.0, 0.13, pow(b, 1.2)), 7.0 * b * b, 90.0 * b, uT);
    vec2 p2 = swirl(p1, uEntO, 1.0 + 0.22 * a, 2.4 * a, 170.0 * a, uT * 1.6);
    // 收拢时四边软软地退成纸（不露直边）
    vec3 g = mix(mix(uPagePaper, uPaper, b), garden(p2, b), b > 0.0 ? edgeFade(p2, uRes) : 1.0);
    if (a > 0.0) {
      vec3 acc = g;
      for (int i = 1; i <= 4; i++) {
        float fi = float(i);
        acc += garden(p2 + vec2(cos(fi * 1.7 + uT * 2.0), sin(fi * 1.7 + uT * 2.0)) * 4.0 * fi * a, b);
      }
      g = mix(g, acc / 5.0, min(a * 1.2, 0.8));
      // 湿了以后颜色更饱和一点
      vec3 gl = toOklab(g);
      gl.yz *= 1.0 + 0.4 * a;
      g = fromOklab(gl);
    }
    float drops;
    float band;
    float cov = c > 0.0 ? splash(px, uEntC, c, uRes, band, drops) : 0.0;
    if (c <= 0.0) { band = 0.0; drops = 0.0; }
    vec3 dense = pigment(px, 0.05);
    vec3 e = mix(g, col, cov);
    e = mix(e, dense, clamp(band * 0.85 + drops * 0.9, 0.0, 1.0));
    gardenK = 1.0 - cov;
    col = e;
    // 画面还没开始流动的地方透明（下面就是真的花园）
    float disp = length(p2 - px);
    alpha = max(max(smoothstep(0.5, 6.0, disp), smoothstep(0.0, 0.45, a)), step(0.001, c));
  }

  // 纸纹 5 %
  float grain = texture2D(uPaperTex, (gl_FragCoord.xy / uDpr) / 336.0).r;
  col *= 1.0 + 0.05 * (grain / 0.93 - 1.0) * 6.0 * (1.0 - gardenK);

  if (uDrop < 1.0) {
    float band;
    float cov = inkDrop(px, uDropO, uDrop, uRes, 1.0, band);
    vec3 dense = pigment(px, 0.15);
    float thick = clamp(band + (1.0 - uDrop) * 0.55 * cov, 0.0, 1.0);
    vec3 c = mix(col, dense, thick);
    gl_FragColor = vec4(c * cov, cov);
    return;
  }
  gl_FragColor = vec4(col * alpha, alpha);
}
`;l.registerPlugin(r);var Fe=r.create(`sel-smooth`,`.5,0,0,1`),Ie=r.create(`sel-expo`,`.14,1,.34,1`),Le=.9,Re=[.78,.4],ze=[1.12,.55],Be=[1.18,.3],b=[1.42,.4],Ve=1.2,He=.4,Ue=.6,We=.5,Ge=[.4,.35],Ke=[.5,.6],qe=[.98,.5],Je=.6,Ye=.3,Xe=.8,Ze=.9,Qe=.5,$e=.6,et=1.5,tt=m.degToRad(8),nt=m.degToRad(4),rt=.45,it=[.5,.5,.5,.42],at=.8,ot=10,st=16,x=`#F8F3EA`,ct=`#EFE6D2`,lt=e=>{let t=parseInt(e.slice(1),16);return new _((t>>16&255)/255,(t>>8&255)/255,(t&255)/255)},ut=lt(x),dt=lt(ct),ft=`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,pt=`varying vec3 vN; varying vec3 vV;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,mt=`uniform vec3 uCol; uniform float uK; varying vec3 vN; varying vec3 vV;
void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.2); gl_FragColor = vec4(uCol, f * uK); }`,ht=`uniform sampler2D uMap; uniform float uK; varying vec2 vUv;
void main() { vec4 t = texture2D(uMap, vUv); if (t.a < 0.5) discard; gl_FragColor = vec4(t.rgb * uK, 1.0); }`,gt=`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,_t=e=>new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.src=e,r.decode().then(()=>t(r),()=>n(Error(`图片没载入：${e}`)))}),vt=e=>fetch(e).then(t=>t.ok?t.blob():Promise.reject(Error(`图片没载入：${e}`))).then(e=>createImageBitmap(e,{imageOrientation:`flipY`,premultiplyAlpha:`none`,colorSpaceConversion:`none`})),yt=e=>{let t=7;for(let n of e)t=(t*31+n.charCodeAt(0))%997;return t/997*9+1},bt=class{read;write;constructor(e){this.read=e(),this.write=e()}swap(){let e=this.read;this.read=this.write,this.write=e}dispose(){this.read.dispose(),this.write.dispose()}},S=null;function xt(){if(S)return S;let e=document.createElement(`canvas`);e.width=256,e.height=128;let t=e.getContext(`2d`),n=t.createImageData(256,128),r=(e,t)=>{let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)},i=(e,t)=>{let n=Math.floor(e),i=Math.floor(t),a=e-n,o=t-i,s=a*a*(3-2*a),c=o*o*(3-2*o),l=r(n,i),u=r(n+1,i),d=r(n,i+1),f=r(n+1,i+1);return l+(u-l)*s+(d-l)*c+(l-u-d+f)*s*c};for(let e=0;e<128;e++)for(let t=0;t<256;t++){let r=0,a=.5,o=1/20;for(let n=0;n<3;n++)r+=a*i(t*o,e*o),a*=.5,o*=2;let s=1-(1-Math.abs(Math.sin(t/256*9+r*7+e/128*3)))**12*.12-(r-.5)*.03,c=(e*256+t)*4;n.data[c]=238*s,n.data[c+1]=233*s,n.data[c+2]=223*s,n.data[c+3]=255}return t.putImageData(n,0,0),S=e,e}function St(){let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,0,64,64,64);return n.addColorStop(0,`rgba(0,0,0,0.32)`),n.addColorStop(.5,`rgba(0,0,0,0.14)`),n.addColorStop(1,`rgba(0,0,0,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),e}function Ct(e){let t=document.createElement(`canvas`);t.width=512,t.height=256;let n=t.getContext(`2d`),r=n.createLinearGradient(0,0,0,256);r.addColorStop(0,`#c9c2b7`),r.addColorStop(.5,`#b3aca1`),r.addColorStop(.62,`#9d968b`),r.addColorStop(1,`#8c857b`),n.fillStyle=r,n.fillRect(0,0,512,256);let i=(e,t,r,i)=>{let a=n.createRadialGradient(0,0,0,0,0,1);a.addColorStop(0,`rgba(255,255,255,1)`),a.addColorStop(.6,`rgba(255,255,255,0.95)`),a.addColorStop(1,`rgba(255,255,255,0)`),n.save(),n.translate(e+r/2,t+i/2),n.scale(r*.62,i*.62),n.fillStyle=a,n.fillRect(-1,-1,2,2),n.restore()};return i(92.16,40.96,51.2,76.8),i(337.92,56.32,30.72,56.32),n.globalAlpha=.1,n.fillStyle=e,n.fillRect(0,0,512,256),n.globalAlpha=1,t}var C=e=>{let t=window.__selEv;t&&t.push([e,performance.now()])};async function wt(r){let{root:x}=r,S=r.works,wt=x.querySelector(`.sel-stage`),w=Math.max(0,S.findIndex(e=>e.id===r.startAt)),Dt=new URLSearchParams(location.search),T={wc:0,mask:0};l.ticker.lagSmoothing(40,16);let Ot=Number(window.__slow??0);Ot>0&&Ot<=1&&l.globalTimeline.timeScale(Ot);let kt=e=>`/works/${e.dir}/sketch-1600.webp`,At=e=>e.kind===`logo`?`/works/${e.dir}/cutout.webp`:e.cover,[jt,Mt,Nt]=await Promise.all([vt(kt(S[w])),vt(At(S[w])),_t(`/paper/cold-press.png`)]),E=document.createElement(`canvas`),D=new be({canvas:E,antialias:!1,alpha:!0,premultipliedAlpha:!0,powerPreference:`high-performance`,preserveDrawingBuffer:!0});if(D.setPixelRatio(Math.min(devicePixelRatio||1,et)),D.setClearColor(0,0),D.toneMapping=0,D.debug.checkShaderErrors=!1,wt.appendChild(E),!(D.getContext()instanceof WebGL2RenderingContext))throw D.dispose(),E.remove(),Error(`没有 WebGL2`);let Pt=D.getPixelRatio(),Ft=()=>new Promise(e=>requestAnimationFrame(()=>e()));await new Promise(e=>requestAnimationFrame(()=>e()));let It=[],Lt=(e,t=!0,n=!0)=>{let r=new ne(e);return e instanceof ImageBitmap&&(r.flipY=!1),t&&(r.colorSpace=p),n||(r.generateMipmaps=!1,r.minFilter=ce),r.anisotropy=4,r.needsUpdate=!0,It.push(r),r},Rt=Lt(Nt,!1);Rt.wrapS=Rt.wrapT=Oe;let zt=new Map,Bt=new Map;zt.set(S[w].id,Lt(jt,!1,!1)),Bt.set(S[w].id,{tex:Lt(Mt),aspect:Mt.width/Mt.height});let Vt=e=>{let t=S[e],n=zt.get(t.id);return n?Promise.resolve(n):vt(kt(t)).then(e=>{if(Z)throw Error(`closed`);let n=zt.get(t.id)??Lt(e,!1,!1);return zt.set(t.id,n),n})},Ht=e=>{let t=S[e],n=Bt.get(t.id);return n?Promise.resolve(n):vt(At(t)).then(e=>{if(Z)throw Error(`closed`);let n=Bt.get(t.id)??{tex:Lt(e),aspect:e.width/e.height};return Bt.set(t.id,n),n})},O=innerWidth,k=innerHeight,Ut=new v(O,k),Wt=new v,Gt=(e,t)=>[e,t,{type:de,format:re,minFilter:ce,magFilter:ce,wrapS:pe,wrapT:pe,depthBuffer:!1}],Kt=0,qt=0,A,j,M,N,Jt,Yt,P,Xt,F,Zt,Qt=()=>{[A,j,M,N].forEach(e=>e?.dispose()),[Jt,Yt,P,Xt,F,Zt].forEach(e=>e?.dispose()),Kt=Math.max(16,Math.round(O/2)),qt=Math.max(16,Math.round(k/2)),Wt.set(1/Kt,1/qt);let e=()=>new oe(...Gt(Kt,qt));A=new bt(e),j=new bt(e),M=new bt(e),N=new bt(e),Jt=e(),Yt=e(),P=e(),Xt=e();let[t,n,r]=Gt(Math.round(O*Pt),Math.round(k*Pt));F=new oe(t,n,{...r,depthBuffer:!0,samples:4}),Zt=new oe(Math.round(t/2),Math.round(n/2),{...r,depthBuffer:!0}),pn=0};await Ft(),C(`b:seg1`);let $t=new f(-1,1,1,-1,0,1),en=new le,tn=new g(new ie(2,2));tn.frustumCulled=!1,en.add(tn);let I=(e,t)=>{tn.material=e,D.setRenderTarget(t),D.render(en,$t)},nn={value:Wt},L=(e,t)=>new h({defines:{[e]:``},vertexShader:ft,fragmentShader:ke,uniforms:{uTexel:nn,...t},depthTest:!1,depthWrite:!1}),R={splat:L(`SPLAT`,{uTarget:{value:null},uAspect:{value:1},uPoint:{value:new v},uColor:{value:new y},uRadius:{value:.001}}),advect:L(`ADVECT`,{uVelocity:{value:null},uSource:{value:null},uDt:{value:0},uDissipation:{value:new y},uClampA:{value:1.5}}),curl:L(`CURL`,{uVelocity:{value:null}}),vort:L(`VORTICITY`,{uVelocity:{value:null},uCurl:{value:null},uCurlStrength:{value:st},uDt:{value:0}}),div:L(`DIVERGENCE`,{uVelocity:{value:null}}),clear:L(`CLEAR`,{uSource:{value:null},uValue:{value:.8}}),pres:L(`PRESSURE`,{uPressure:{value:null},uDivergence:{value:null}}),grad:L(`GRADIENT`,{uPressure:{value:null},uVelocity:{value:null}})},rn=[],an=new y,on=(e,t,n)=>{let r=R.splat.uniforms;r.uTarget.value=e.read.texture,r.uAspect.value=O/k,r.uPoint.value.set(t.x/O,1-t.y/k),r.uColor.value.copy(n),r.uRadius.value=t.r,I(R.splat,e.write),e.swap()},sn=e=>{for(let e of rn.splice(0))(e.vx||e.vy)&&on(A,e,an.set(e.vx,e.vy,0,0)),e.a&&on(j,e,an.set(0,0,0,e.a));R.curl.uniforms.uVelocity.value=A.read.texture,I(R.curl,Yt),R.vort.uniforms.uVelocity.value=A.read.texture,R.vort.uniforms.uCurl.value=Yt.texture,R.vort.uniforms.uDt.value=e,I(R.vort,A.write),A.swap(),R.div.uniforms.uVelocity.value=A.read.texture,I(R.div,Jt),R.clear.uniforms.uSource.value=M.read.texture,I(R.clear,M.write),M.swap(),R.pres.uniforms.uDivergence.value=Jt.texture;for(let e=0;e<ot;e++)R.pres.uniforms.uPressure.value=M.read.texture,I(R.pres,M.write),M.swap();R.grad.uniforms.uPressure.value=M.read.texture,R.grad.uniforms.uVelocity.value=A.read.texture,I(R.grad,A.write),A.swap();let t=R.advect.uniforms;t.uDt.value=e,t.uVelocity.value=A.read.texture,t.uSource.value=A.read.texture,t.uDissipation.value.setScalar(at),t.uClampA.value=1e4,I(R.advect,A.write),A.swap(),t.uVelocity.value=A.read.texture,t.uSource.value=j.read.texture,t.uDissipation.value.set(it[0],it[1],it[2],it[3]),t.uClampA.value=1.5,I(R.advect,j.write),j.swap()},z={uPrev:{value:null},uRes:{value:Ut},uTexel:{value:Wt},uDt:{value:0},uSpeed:{value:70},uSeg:{value:Array.from({length:8},()=>new y)},uSegW:{value:Array.from({length:8},()=>new v)},uCount:{value:0},uDot:{value:new y}},cn=new h({vertexShader:ft,fragmentShader:u+Ae,uniforms:z,depthTest:!1,depthWrite:!1}),ln=[],B={x:0,y:0,r:0,amt:0},un=e=>{let t=Math.min(8,ln.length);for(let e=0;e<t;e++){let n=ln[ln.length-t+e];z.uSeg.value[e].set(n.ax,n.ay,n.bx,n.by),z.uSegW.value[e].set(n.w,n.amt)}ln.length=0,z.uCount.value=t,z.uDot.value.set(B.x,B.y,B.r,B.amt),B.r=0,z.uDt.value=e,z.uPrev.value=N.read.texture,I(cn,N.write),N.swap()},dn=e=>{let t=e.palette.map(lt);return[t[0],t[1]??t[0],t[2]??t[0],t[3]??t[0].clone()]},V={uRes:{value:Ut},uPaper:{value:ut},uA0:{value:new _},uA1:{value:new _},uA2:{value:new _},uA3:{value:new _},uSeedA:{value:0},uMode:{value:0},uTime:{value:0}},fn=new h({vertexShader:ft,fragmentShader:u+d+Me,uniforms:V,depthTest:!1,depthWrite:!1}),pn=0,mn=-1,hn=S[w],gn=null,H=(e,t)=>{let n=dn(e);V.uA0.value.copy(n[0]),V.uA1.value.copy(n[1]),V.uA2.value.copy(n[2]),V.uA3.value.copy(n[3]),V.uSeedA.value=yt(e.id),V.uTime.value=Q,I(fn,t)};await Ft(),C(`b:seg2`);let U=new le,W=new _e(28,O/k,.1,60),_n=new me(S[w].color).convertLinearToSRGB(),vn=new _(_n.r,_n.g,_n.b),G={uSketchA:{value:zt.get(S[w].id)},uSketchB:{value:zt.get(S[w].id)},uSketchMix:{value:0},uWc:{value:null},uWcB:{value:null},uSw:{value:new y(0,0,0,0)},uSwT:{value:0},uMask:{value:null},uMaskMode:{value:0},uRecover:{value:0},uRes:{value:Ut},uImgAspect:{value:jt.width/jt.height},uPaper:{value:ut},uSkPaper:{value:dt},uProduct:{value:vn},uHaloC:{value:new v},uHaloR:{value:new v(200,300)},uHalo:{value:0},uShadow:{value:new y},uShadowK:{value:0}},yn=new h({vertexShader:ft,fragmentShader:u+d+je+Ne,uniforms:G,depthTest:!1,depthWrite:!1}),bn=new g(new ie(2,2),yn);bn.frustumCulled=!1,bn.renderOrder=-10,U.add(bn);let xn=new Te(D),Sn=null,Cn=e=>{let t=new ve(Ct(e.palette[0]??e.color));t.colorSpace=p,t.mapping=303;let n=xn.fromEquirectangular(t);t.dispose(),Sn?.dispose(),Sn=n,U.environment=Sn.texture};await Ft(),C(`b:seg3`);let K=new he;U.add(K);let wn=[];wn.push(new v(1.035,.3),new v(1.02,.34),new v(1,.42));for(let e=.5;e<=1.55;e+=.15)wn.push(new v(1,e));for(let e=1;e<=24;e++){let t=e/24*Math.PI/2;wn.push(new v(Math.max(.065,Math.cos(t)),1.55+Math.sin(t)*.8))}wn.push(new v(.06,2.4));let Tn=new De(wn,120),En=new ee({color:16777215,transmission:1,thickness:.2,ior:1.5,roughness:.01,metalness:0,dispersion:.03,clearcoat:1,clearcoatRoughness:.02,specularIntensity:1,envMapIntensity:1.1,attenuationColor:new me(`#fdfefd`),attenuationDistance:40,side:1,depthWrite:!1}),Dn=new g(Tn,En);Dn.renderOrder=4;let On=En.clone();On.side=0;let kn=new g(Tn,On);kn.renderOrder=6,K.add(Dn,kn);let An=new ee({color:0,metalness:0,roughness:.02,clearcoat:1,clearcoatRoughness:.015,envMapIntensity:1.6,transparent:!0,blending:2,depthWrite:!1,side:0}),jn=new g(Tn,An);jn.scale.setScalar(1.002),jn.renderOrder=20;let Mn=new me(.2,.19,.18),Nn=new me(.3,.33,.36),Pn={uCol:{value:Mn.clone()},uK:{value:.26}},Fn=new h({vertexShader:pt,fragmentShader:mt,uniforms:Pn,transparent:!0,depthWrite:!1,side:0}),In=new g(Tn,Fn);In.scale.setScalar(1.003),In.renderOrder=21;let Ln=new g(new ue(.11,32,16),On);Ln.position.y=2.49,K.add(jn,In,Ln),await Ft(),C(`b:seg4`);let Rn=Lt(xt());Rn.wrapS=Oe,Rn.repeat.set(2,1);let zn=new ae({map:Rn,roughness:.32,metalness:0,envMapIntensity:1}),Bn=.15,Vn=[[1.33,0],[1.37,.015],[1.38,.045],[1.35,.075],[1.29,.098],[1.26,.12],[1.255,.14],[1.27,.158],[1.295,.176],[1.29,.196],[1.255,.21],[1.2,.228],[1.16,.252],[1.14,.278],[1.135,.3]].map(([e,t])=>new v(e*.92,Bn+t*.5)),Hn=new g(new De(Vn,120),zn),Un=new g(new Ee(1.0442,96),zn);Un.rotation.x=-Math.PI/2,Un.position.y=.3;let Wn=((e,t,n,r)=>{let i=new g(new Se(e,n,10,160),r);return i.rotation.x=Math.PI/2,i.position.y=t,i})(1.045,.302,.01,new ae({color:`#b8975a`,metalness:.9,roughness:.22}));K.add(Hn,Un,Wn);let Gn=new ge(`#fff8ee`,1.8);Gn.position.set(-3,4.5,5);let Kn=new ge(`#eef2f4`,.6);Kn.position.set(4,1.5,3),U.add(Gn,Kn,new Ce(`#f6f2ea`,.5));let qn=Lt(St(),!1),Jn=new g(new Ee(.62,48),new te({map:qn,transparent:!0,depthWrite:!1,color:0}));Jn.rotation.x=-Math.PI/2,Jn.scale.set(1.2,.5,1),Jn.position.y=.302,Jn.renderOrder=8,K.add(Jn),await Ft(),C(`b:seg5`);let Yn=.3,Xn=1.44,Zn=new ae({color:`#b8975a`,metalness:.9,roughness:.26,transparent:!0}),Qn=(e,t)=>{let n=new he,r=[],i=[],a={v:1},o,s,c;if(e.kind===`logo`){let a=Math.min(Xn,1.1*t.aspect);o=a/2,s=a/t.aspect/2,c=1.22;let l=new ie(o*2,s*2);i.push(l);let u=e.dir===`P19`;for(let e=2;e>=1;e--){let i=new h({vertexShader:gt,fragmentShader:ht,uniforms:{uMap:{value:t.tex},uK:{value:.62-e*.08}},transparent:!0});r.push(i);let a=new g(l,i);a.position.set(e*.0035,c-e*.005,-e*.003),a.renderOrder=10,n.add(a)}let d=new ae({map:t.tex,transparent:!0,alphaTest:.5,roughness:u?.32:.8,metalness:u?.5:0,envMapIntensity:u?1.2:.6});r.push(d);let f=new g(l,d);f.position.y=c,f.renderOrder=11,n.add(f);let p=c-Yn,m=new g(new xe(.007,.01,p,10),Zn);i.push(m.geometry),m.position.set(0,Yn+p/2,-.012),m.renderOrder=9,n.add(m)}else{o=Xn/2,s=o/t.aspect,c=.5+s;let e=new fe(o*2,s*2,.022,24,18,1),a=e.attributes.position;for(let e=0;e<a.count;e++){let t=a.getX(e)/o,n=a.getY(e)/s;a.setZ(e,a.getZ(e)+.035*Math.abs(t)**4*Math.abs(n)**2)}e.computeVertexNormals(),i.push(e);let l=new ae({color:`#efe8da`,roughness:.9,transparent:!0}),u=new ae({map:t.tex,roughness:.6,transparent:!0,envMapIntensity:.6});r.push(l,u);let d=new g(e,[l,l,l,l,u,l]);d.position.y=c,d.renderOrder=10,n.add(d);let f=new g(new fe(.14,.05,.045),Zn);i.push(f.geometry),f.position.set(0,c-s-.005,.004),f.renderOrder=12;let p=c-s-Yn,m=new g(new xe(.009,.012,p,10),Zn);i.push(m.geometry),m.position.set(0,Yn+p/2,0),m.renderOrder=9,n.add(f,m)}return K.add(n),{root:n,rect:{hx:o,hy:s,cy:c},mats:r,geos:i,fade:a,lift:{y:0}}},q=Qn(S[w],Bt.get(S[w].id)),$n=(e,t)=>{e.fade.v=t,e.mats.forEach(e=>{e.opacity=t,e.transparent=!0})},er=e=>{K.remove(e.root),e.geos.forEach(e=>e.dispose()),e.mats.forEach(e=>e.dispose())},tr=new g(new xe(1.06,1.2,2.45,24),new te({visible:!1}));tr.position.y=1.375,K.add(tr),await Ft(),C(`b:seg6`);let nr=new ye(new Uint8Array([248,243,234,255]),1,1);nr.needsUpdate=!0,It.push(nr);let J={uScene:{value:null},uBgOnly:{value:null},uPaperTex:{value:Rt},uGarden:{value:nr},uRes:{value:Ut},uDpr:{value:Pt},uT:{value:0},uCloche:{value:0},uDrop:{value:1},uDropO:{value:new v},uPaper:{value:ut},uPagePaper:{value:dt},uP0:{value:new _},uP1:{value:new _},uP2:{value:new _},uEntOn:{value:1},uEnt:{value:new _},uEntO:{value:new v},uEntC:{value:new v},uDive:{value:new y(0,0,0,0)},uDiveC:{value:new v},uDiveR:{value:new v},uRet:{value:0},uRetC:{value:new v}},rr=e=>{let t=dn(e);J.uP0.value.copy(t[0]),J.uP1.value.copy(t[1]),J.uP2.value.copy(t[2])};rr(S[w]);let ir=new h({vertexShader:ft,fragmentShader:u+d+je+Pe,uniforms:J,depthTest:!1,depthWrite:!1,blending:0}),ar=2.5392,or=10,sr={y:0},cr=0,lr=()=>{O=innerWidth,k=innerHeight,Ut.set(O,k),D.setSize(O,k,!1),D.transmissionResolutionScale=Math.max(.5,1/D.getPixelRatio()),W.aspect=O/k;let e=Math.tan(m.degToRad(W.fov/2)),t=2.45/.56;ar>.8*t*W.aspect&&(t=ar/.8/W.aspect),or=t/2/e,W.position.set(0,0,or),W.lookAt(0,0,0),W.updateProjectionMatrix(),cr=(.5-.09)*t-2.6,Qt()};lr();let ur=new _,dr=e=>(e.project(W),{x:(e.x*.5+.5)*O,y:(1-(e.y*.5+.5))*k}),Y=()=>{let e=dr(ur.set(0,1.3,0).applyMatrix4(K.matrixWorld)),t=dr(ur.set(1,1.3,0).applyMatrix4(K.matrixWorld)),n=dr(ur.set(0,2.55,0).applyMatrix4(K.matrixWorld)),r=dr(ur.set(0,Bn,0).applyMatrix4(K.matrixWorld));return{cx:e.x,cy:e.y,rx:Math.abs(t.x-e.x),ry:Math.abs(r.y-n.y)/2,my:(r.y+n.y)/2,bx:r.x,by:r.y}},fr=e=>e.kind===`logo`?`/works/${e.dir}/cutout-full.webp`:e.cover,pr=(e,t)=>{if(e.kind!==`logo`||!e.box)return t;let[n,r,i,,a,o]=e.box,s=t.w/(i-n);return{x:t.x-n*s,y:t.y-r*s,w:a*s,h:o*s}},mr=()=>{q.root.updateMatrixWorld(!0);let{hx:e,hy:t,cy:n}=q.rect,r=[[-e,n-t],[e,n-t],[e,n+t],[-e,n+t]].map(([e,t])=>dr(ur.set(e,t,.01).applyMatrix4(q.root.matrixWorld))),i=r.map(e=>e.x),a=r.map(e=>e.y);return{rect:{x:Math.min(...i),y:Math.min(...a),w:Math.max(...i)-Math.min(...i),h:Math.max(...a)-Math.min(...a)},pad:0}},X=`idle`,Z=!1,hr=!1,Q=Number(window.__washTime??0),$={x:O/2,y:k/2,lx:O/2,ly:k/2,has:!1,nx:0,ny:0,still:0},gr={x:0,y:0},_r=!1,vr=!1,yr={v:0},br={k:0},xr=new se,Sr=new v,Cr=(e,t)=>(Sr.set(e/O*2-1,-(t/k)*2+1),xr.setFromCamera(Sr,W),xr.intersectObject(tr,!1).length>0),wr=x.querySelector(`.sel-title`),Tr=x.querySelector(`.sel-cat`),Er=x.querySelector(`.sel-summary`),Dr=x.querySelector(`.sel-discover`),Or=x.querySelector(`.sel-count-cur`),kr=[...x.querySelectorAll(`.sel-tick`)],Ar=e=>{wr.textContent=e.title,Tr.textContent=e.category,Er.textContent=e.summary,Dr.href=e.href,Or.textContent=String(S.indexOf(e)+1).padStart(2,`0`),x.style.setProperty(`--color-product`,e.color)},jr=()=>kr.forEach(e=>e.setAttribute(`aria-pressed`,String(e.dataset.work===S[w].id)));Ar(S[w]),jr();let Mr=x.querySelector(`.sel-lab`),Nr=()=>`${`ABC`[T.wc]}${T.mask+1}`,Pr=()=>{V.uMode.value=T.wc,G.uMaskMode.value=T.mask,pn=0,Mr&&(Mr.querySelector(`.lab-name`).textContent=Nr(),Mr.querySelectorAll(`[data-lab]`).forEach(e=>e.setAttribute(`aria-pressed`,String(String(T[e.dataset.lab])===e.dataset.v))))},Fr=e=>{let t=e.target.closest(`[data-lab]`);t&&(T[t.dataset.lab]=Number(t.dataset.v),Pr())};Mr&&Dt.get(`lab`)===`1`&&(Mr.hidden=!1,Mr.addEventListener(`click`,Fr)),Pr();let Ir=0,Lr=async e=>{if(X!==`ready`||e===w||e<0||e>=S.length)return;let t=performance.now();if(t<Ir)return;Ir=t+1e3,vr=!0;let n=S[e],i,a;try{[i,a]=await Promise.all([Vt(e),Ht(e)])}catch{return}if(Z||X!==`ready`||(await Br(i),await Br(a.tex),Z||X!==`ready`))return;X=`switching`,C(`switch`),w=e,r.onChange(n.id),jr(),gn=n,H(n,Xt);let o=Y();G.uSw.value.set(0,0,o.bx,k-o.by+o.ry*.12);for(let e=0;e<6;e++){let t=e/6*Math.PI*2,n=o.rx*.9;rn.push({x:o.bx+Math.cos(t)*n,y:o.by-Math.sin(t)*n*.5,vx:-Math.sin(t)*900,vy:-Math.cos(t)*900,a:0,r:.004})}let s=[Tr,wr,Er,Dr];l.killTweensOf(s),l.to(s,{opacity:0,y:-10,duration:.22,ease:`none`,stagger:.025});let c=new me(n.color).convertLinearToSRGB();l.to(vn,{x:c.r,y:c.g,z:c.b,duration:$e,ease:`none`});let u=q;l.to(u.fade,{v:0,duration:He*.8,ease:`none`,onUpdate:()=>$n(u,u.fade.v)}),l.to(u.lift,{y:-.18,duration:He,ease:`power2.in`});let d=fi(l.timeline({onComplete:()=>{Z||(hn=n,gn=null,G.uSw.value.set(0,0,0,0),H(n,P),pn=6,Cn(n),X=`ready`,setTimeout(Vr,300))}}));d.fromTo(G.uSw.value,{x:.001},{x:1,duration:He,ease:`power1.in`},0),d.add(()=>{q=Qn(n,a),er(u),$n(q,0),q.lift.y=-.2,l.to(q.fade,{v:1,duration:.45,ease:`none`,onUpdate:()=>$n(q,q.fade.v)}),l.to(q.lift,{y:0,duration:.9,ease:Ie}),G.uSketchA.value=i,G.uSketchMix.value=0,rr(n),Ar(n),l.fromTo(s,{y:16,opacity:0},{y:0,opacity:1,duration:.8,ease:Ie,stagger:.05,overwrite:!0}),G.uSw.value.x=0},He),d.fromTo(G.uSw.value,{y:.001},{y:1,duration:Ue,ease:`power2.out`,immediateRender:!1},He)},Rr=e=>Lr((w+e+S.length)%S.length),zr=new WeakSet;async function Br(e){zr.has(e)||Z||(zr.add(e),C(`upload `+(e.image?.src??``).split(`/`).slice(-2).join(`/`)),D.initTexture(e),C(`uploaded`),await new Promise(e=>requestAnimationFrame(()=>e())))}let Vr=()=>{if(!Z){C(`warm`);for(let e of[1,-1]){let t=(w+e+S.length)%S.length;Promise.all([Vt(t),Ht(t)]).then(async([e,t])=>{X===`ready`&&(await Br(e),await Br(t.tex))}).catch(()=>{})}}},Hr=e=>{$.x=e.clientX,$.y=e.clientY,$.has||=($.lx=$.x,$.ly=$.y,!0),$.nx=e.clientX/O*2-1,$.ny=e.clientY/k*2-1},Ur=null,Wr=e=>{e.button===0&&X===`ready`&&(Ur={x:e.clientX,y:e.clientY})},Gr=e=>{let t=Ur;if(Ur=null,!t||X!==`ready`)return;let n=e.clientX-t.x;Math.abs(n)>80&&Math.abs(n)>Math.abs(e.clientY-t.y)&&!Cr(t.x,t.y)?Rr(n<0?1:-1):Math.hypot(n,e.clientY-t.y)<8&&Cr(e.clientX,e.clientY)&&vi(S[w])},Kr=0,qr=0,Jr=e=>{if(e.preventDefault(),X!==`ready`)return;let t=performance.now();t<qr?Kr=0:(Kr+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,Math.abs(Kr)>=60&&(Rr(Kr>0?1:-1),Kr=0,qr=t+1100))},Yr=e=>{X!==`ready`||e.altKey||e.ctrlKey||e.metaKey||(e.key===`ArrowRight`||e.key===`ArrowDown`?(e.preventDefault(),Rr(1)):e.key===`ArrowLeft`||e.key===`ArrowUp`?(e.preventDefault(),Rr(-1)):e.key===`Enter`&&!e.target.closest(`button, a`)&&(e.preventDefault(),vi(S[w])))},Xr=e=>{let t=e.target,n=t.closest(`.sel-tick`);if(n){let e=S.findIndex(e=>e.id===n.dataset.work);e>=0&&Lr(e);return}let r=t.closest(`.sel-arrow`);r?Rr(Number(r.dataset.step)):t.closest(`[data-discover]`)&&(e.preventDefault(),vi(S[w]))},Zr=0,Qr=()=>{clearTimeout(Zr),Zr=window.setTimeout(()=>{!Z&&!hr&&(lr(),H(hn,P))},120)},$r=e=>{let t=e?`addEventListener`:`removeEventListener`;E[t](`pointerdown`,Wr),window[t](`pointerup`,Gr),window[t](`pointermove`,Hr,{passive:!0}),x[t](`wheel`,Jr,{passive:!1}),x[t](`keydown`,Yr),x[t](`click`,Xr),window[t](`resize`,Qr)};$r(!0);let ei=(e,t,n,r,i,a=1)=>{let o=n-e,s=r-t,c=Math.hypot(o,s);if(c<=.5||c>=260)return;let l=Math.min(c/i/2200,1);if(T.mask===0){let n=Math.min(5,Math.ceil(c/22));for(let r=1;r<=n;r++){let c=r/n;rn.push({x:e+o*c,y:t+s*c,vx:o/2/i*.35/n*3,vy:-(s/2)/i*.35/n*3,a:(.45+.9*l)/n*a,r:.0012+.0045*l})}}else ln.push({ax:e,ay:k-t,bx:n,by:k-r,w:26-17*l,amt:a})},ti=!1,ni=()=>{if(ti||Z||X!==`ready`||vr)return;ti=!0,C(`hint`);let e=Y(),t={t:0},n=null,r=t=>({x:e.cx-e.rx*(1.95-.7*t),y:e.cy+e.ry*(.15+.4*t)-Math.sin(t*Math.PI)*e.ry*.1});fi(l.to(t,{t:1,duration:.5,ease:`power1.inOut`,onUpdate:()=>{let e=r(t.t);if(n&&T.mask===0){let t=e.x-n.x,r=e.y-n.y;rn.push({x:e.x,y:e.y,vx:t*6,vy:-r*6,a:.55,r:.0011})}else n&&ei(n.x,n.y,e.x,e.y,1/60,.8);n=e}}))},ri=()=>{let e=br.k;if(e>0){for(let e of K.children)e.visible=e===In||e===jn;Pn.uCol.value.copy(Nn),Pn.uK.value=.75*e,An.opacity=e}else K.visible=!1;D.setRenderTarget(Zt),D.render(U,W);for(let e of K.children)e.visible=!0;q.root.visible=ii,K.visible=!0,Pn.uCol.value.copy(Mn),Pn.uK.value=.26,An.opacity=1,J.uBgOnly.value=Zt.texture},ii=!0,ai=(e,t)=>{if(Z||x.hidden)return;let n=performance.now(),r=Math.min(Math.max(t,1)/1e3,1/30);Q+=r,hr&&(window.__washTime=Q),J.uT.value=Q,G.uSwT.value=Q,K.position.y=cr+sr.y,K.updateMatrixWorld(),W.updateMatrixWorld();let i=Y();if($.has&&X===`ready`){let e=Cr($.x,$.y);e!==_r&&(_r=e,l.to(yr,{v:+!!e,duration:e?.9:.6,ease:e?Ie:`none`,overwrite:!0}),E.style.cursor=e?`pointer`:``,e&&a(S[w].href));let t=Math.hypot($.x-$.lx,$.y-$.ly);!e&&t>.5?(vr=!0,ei($.lx,$.ly,$.x,$.y,r),$.still=0):!e&&t<=.5&&T.mask===1&&($.still+=r,$.still>.15&&$.still<3&&(B.x=$.x,B.y=k-$.y,B.r=8,B.amt=.9))}$.lx=$.x,$.ly=$.y,T.mask===0?sn(r):un(r),X===`switching`&&gn?G.uSw.value.y>0?H(gn,Xt):H(hn,P):(--pn<=0||Q-mn>=1/30)&&(H(hn,P),pn=1e9,mn=Q);let o=1-Math.exp(-r/rt),s=X!==`ready`&&X!==`switching`;gr.y+=((s?0:$.nx*tt)-gr.y)*o,gr.x+=((s?0:$.ny*nt)-gr.x)*o,K.rotation.set(gr.x,gr.y,0),U.environmentRotation.set(0,-gr.y*2.5,0),q.root.rotation.y=s?0:.03*Math.sin(Q*.45),q.root.position.y=q.lift.y+.012*Math.sin(Q*1.1),q.root.visible=ii,G.uWc.value=P.texture,G.uWcB.value=Xt.texture,G.uMask.value=T.mask===0?j.read.texture:N.read.texture,G.uHaloC.value.set(i.cx,k-i.my),G.uHaloR.value.set(i.rx*1.12,i.ry*1.05),G.uHalo.value=yr.v,G.uShadow.value.set(i.bx,k-i.by-2,i.rx*1.5,i.rx*.16),G.uShadowK.value=J.uCloche.value,(J.uCloche.value<1||X===`diving`)&&ri(),J.uCloche.value>0?(D.setRenderTarget(F),D.render(U,W),J.uScene.value=F.texture):J.uScene.value=Zt.texture,I(ir,null);let c=performance.now()-n;c>12&&C(`tick ${X} ${Math.round(c)}`)},oi=()=>new Promise(e=>requestAnimationFrame(()=>e())),si=new le,ci=new ie(2,2);for(let e of[...Object.values(R),cn,fn,yn,ir]){let t=new g(ci,e);t.frustumCulled=!1,si.add(t)}let li=[`logo`,`board`].filter(e=>e!==S[w].kind).map(e=>{let t=Qn({...S[w],kind:e},Bt.get(S[w].id));return K.remove(t.root),si.add(t.root),t});try{let e=xn,t=new f,n=[],r=new we,i=e=>{e&&n.push(D.compileAsync(new g(r,e),t))};e._compileMaterial=i,e.compileEquirectangularShader(),e._setSize(128);let a=e._allocateTargets();i(e._blurMaterial),i(e._ggxMaterial),await Promise.all(n),a.dispose(),r.dispose()}catch{}C(`b:pmrem`),await oi();let ui=performance.now();Cn(S[w]),C(`b:env `+Math.round(performance.now()-ui)),await oi();try{D.setRenderTarget(F),await D.compileAsync(si,W),C(`b:c1`),await D.compileAsync(U,W),C(`b:c2`),D.setRenderTarget(null),await D.compileAsync(si,W),C(`b:c3`)}catch{}D.setRenderTarget(null),C(`b:compiled`);for(let e of It)await Br(e);ui=performance.now(),H(hn,P),C(`b:wc `+Math.round(performance.now()-ui)),await oi(),K.position.y=cr,D.setRenderTarget(F),ui=performance.now(),D.render(U,W),D.setRenderTarget(null),C(`b:scene `+Math.round(performance.now()-ui)),await oi(),l.ticker.add(ai),ui=performance.now(),ai(0,16),C(`b:tick0 `+Math.round(performance.now()-ui));let di=[];function fi(e){return di.push(e),e}let pi={},mi=null,hi=()=>{mi&&(mi.dispose(),mi=null,J.uGarden.value=nr)};function gi(){if(!Z){Z=!0,l.ticker.remove(ai),l.ticker.lagSmoothing(500,33),di.forEach(e=>e.kill()),l.killTweensOf([yr,br,wr,Tr,Er,Dr,E,vn,sr,q.fade,q.lift,J.uCloche,J.uDrop,J.uRet,J.uEnt.value,J.uDive.value,G.uRecover,G.uSw.value]),clearTimeout(Zr),clearTimeout(_i),$r(!1),Mr?.removeEventListener(`click`,Fr),hi(),Tt={...D.info.memory,programs:D.info.programs?.length??0};for(let e of[U,en])e.traverse(e=>{let t=e;t.geometry?.dispose();let n=t.material;(Array.isArray(n)?n:n?[n]:[]).forEach(e=>e.dispose())});Object.values(R).forEach(e=>e.dispose()),[cn,fn,ir,yn].forEach(e=>e.dispose()),li.forEach(e=>{e.geos.forEach(e=>e.dispose()),e.mats.forEach(e=>e.dispose())}),ci.dispose(),It.forEach(e=>e.dispose()),[A,j,M,N].forEach(e=>e.dispose()),[Jt,Yt,P,Xt,F,Zt].forEach(e=>e.dispose()),Sn?.dispose(),xn.dispose(),Et={...D.info.memory},D.dispose(),D.forceContextLoss(),E.remove(),x.classList.remove(`is-ready`,`is-leaving`,`is-diving`),[wr,Tr,Er,Dr].forEach(e=>e.removeAttribute(`style`)),window.__sel?.renderer===D&&(window.__sel={lastInfo:Tt,afterInfo:Et,flight:pi})}}let _i=0;function vi(e){if(X!==`ready`)return;if(!o()){location.assign(e.href);return}X=`diving`,vr=!0,r.onChange(e.id),x.classList.add(`is-diving`);let t=a(e.href),n=performance.now();pi.t=[],l.to(yr,{v:0,duration:.25,ease:`none`,overwrite:!0});let i=Y();J.uDiveC.value.set(i.cx,k-i.my),J.uDiveR.value.set(i.rx*1.04,i.ry*1.02);let{rect:c}=mr(),u=s(pr(e,c),fr(e),0);ii=!1;let d=J.uDive.value,f=fi(l.timeline());f.fromTo(d,{x:.001},{x:1,duration:We,ease:`power2.in`},0),f.fromTo(G.uRecover,{value:0},{value:1,duration:We,ease:`none`},0),f.fromTo(d,{y:0},{y:1,duration:Ge[1],ease:`power1.in`},Ge[0]),f.fromTo(d,{z:0},{z:1,duration:Ke[1],ease:`power2.out`},Ke[0]),f.add(()=>{J.uCloche.value=0,yi(e,u,t,n)},Ke[0]+Ke[1]),f.to(u.el,{scale:1.05,duration:Ke[0]+Ke[1],ease:`power1.out`},0)}async function yi(r,a,s,u){let d=o();hr=!0,$r(!1),d.prepend(E),window.__washTime=Q,window.__washLab={wc:T.wc,line:0};let f=await Promise.race([s,new Promise(e=>setTimeout(()=>e(null),3500))]);if(Z)return;let p=[],m=()=>{document.removeEventListener(`astro:after-swap`,m),p=n(),l.set(p,{opacity:0})},ee=()=>{document.removeEventListener(`astro:page-load`,ee),Promise.race([window.__workHero?.ready??Promise.resolve(),new Promise(e=>setTimeout(e,1500))]).then(()=>new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e())))).then(()=>{if(Z)return;let e=document.querySelector(`[data-flight]`),n=e?.getBoundingClientRect(),r=[],o=J.uDive.value;r.push(l.fromTo(o,{w:0},{w:1,duration:qe[1],ease:`power1.inOut`}).then()),l.to(a.el,{scale:1,duration:Je,ease:Fe}),e&&n&&n.width>0?(e.style.visibility=`hidden`,r.push(t(a,{x:n.left,y:n.top,w:n.width,h:n.height},{duration:Je,ease:Fe,padTo:0}).then()),f&&i(a,f,Je*.75)):r.push(l.to(a.el,{opacity:0,duration:Ye,ease:`none`,delay:.3}).then());let s=l.delayedCall(qe[1]-.1,()=>{}).then(()=>Promise.all([l.to(p,{opacity:1,duration:.44999999999999996,ease:`none`,clearProps:`opacity`}).then(),l.to(E,{opacity:0,duration:Ye,delay:.05,ease:`none`}).then()]));r.push(s),Promise.all(r).then(()=>{if(e){let t=e.getBoundingClientRect();pi.flight={...a.rect},pi.target={x:t.left,y:t.top,w:t.width,h:t.height},e.style.visibility=``}pi.t.push((performance.now()-u)/1e3),a.el.remove(),hr=!1,gi()})})};document.addEventListener(`astro:after-swap`,m),document.addEventListener(`astro:page-load`,ee),c(),pi.t.push((performance.now()-u)/1e3),e(r.href).catch(()=>location.assign(r.href))}let bi=()=>{let e=r.garden?.();if(!e)return null;let t=document.createElement(`canvas`);t.width=Math.max(1,Math.round(O)),t.height=Math.max(1,Math.round(k));let n=t.getContext(`2d`),i=document.createElement(`canvas`);i.width=t.width,i.height=t.height;let a=i.getContext(`2d`),o=e.rect;try{a.drawImage(e.image,o.left,o.top,o.width,o.height)}catch{return null}a.globalCompositeOperation=`destination-in`;let s=a.createLinearGradient(o.left,0,o.right,0);s.addColorStop(0,`rgba(0,0,0,0)`),s.addColorStop(.05,`#000`),s.addColorStop(.95,`#000`),s.addColorStop(1,`rgba(0,0,0,0)`),a.fillStyle=s,a.fillRect(0,0,i.width,i.height);let c=a.createLinearGradient(0,o.top,0,o.bottom);c.addColorStop(0,`rgba(0,0,0,0)`),c.addColorStop(.07,`#000`),c.addColorStop(.91,`#000`),c.addColorStop(1,`rgba(0,0,0,0)`),a.fillStyle=c,a.fillRect(0,0,i.width,i.height),n.fillStyle=ct,n.fillRect(0,0,t.width,t.height),n.drawImage(i,0,0);let l=new ve(t);return l.colorSpace=``,l.minFilter=ce,l.generateMipmaps=!1,l};return window.__sel={renderer:D,info:()=>({...D.info.memory,programs:D.info.programs?.length??0,sim:[Kt,qt],dpr:Pt,lab:Nr()}),go:e=>Lr(e),phase:()=>X,cur:()=>S[w].id,u:J,bgU:G,wcU:V,halo:yr,setLab:e=>{Object.assign(T,e),Pr()},pieceRect:()=>mr(),cloche:()=>Y(),flight:pi},{enter(e){return new Promise(t=>{X=`entering`,J.uCloche.value=0,J.uDrop.value=1,br.k=0,sr.y=-.25,ai(0,16);let n=Y();mi=bi(),J.uGarden.value=mi??nr,J.uEntOn.value=1;let r=J.uEnt.value;r.set(0,0,0),J.uEntO.value.set(e.x,k-e.y),J.uEntC.value.set(n.cx,k-(n.my+n.ry*.05));for(let t=0;t<8;t++){let n=t/8*Math.PI*2;rn.push({x:e.x+Math.cos(n)*40,y:e.y+Math.sin(n)*40,vx:Math.cos(n)*1400,vy:-Math.sin(n)*1400,a:0,r:.006})}let i=fi(l.timeline({onComplete:()=>{Z||(J.uEntOn.value=0,hi(),X=`ready`,_i=window.setTimeout(ni,Ve*1e3),setTimeout(Vr,2500),t())}}));i.fromTo(r,{x:0},{x:1,duration:Le,ease:`power2.out`},0),i.fromTo(r,{y:0},{y:1,duration:Re[1],ease:`power2.in`},Re[0]),i.fromTo(r,{z:0},{z:1,duration:ze[1],ease:`power3.out`},ze[0]),i.fromTo(br,{k:0},{k:1,duration:Be[1],ease:`none`},Be[0]),i.to(sr,{y:0,duration:b[0]+b[1]-Be[0],ease:Ie},Be[0]),i.to(J.uCloche,{value:1,duration:b[1],ease:`none`},b[0]),i.add(()=>{br.k=0},b[0]+b[1]),i.add(()=>x.classList.add(`is-ready`),b[0])})},enterFrom(e){return new Promise(n=>{X=`entering`,J.uDrop.value=1,J.uEntOn.value=0,J.uCloche.value=0,ii=!1,ai(0,16);let r=Y();J.uRetC.value.set(r.cx,k-r.my);let{rect:a}=mr(),o=fi(l.timeline({onComplete:()=>{Z||(ii=!0,br.k=0,e.flight.el.remove(),e.ghost?.remove(),X=`ready`,setTimeout(Vr,600),n())}}));e.ghost&&o.to(e.ghost,{opacity:0,duration:.2,ease:`none`},.03),o.fromTo(J.uRet,{value:0},{value:1,duration:Ze*.5,ease:`power2.in`},0),o.to(J.uRet,{value:0,duration:Ze*.5,ease:`power2.out`},Ze*.5),o.fromTo(br,{k:0},{k:1,duration:.2,ease:`none`},Ze*.3),o.to(J.uCloche,{value:1,duration:.35,ease:`none`},Ze*.45),o.add(t(e.flight,pr(S[w],a),{duration:Xe,ease:Fe,padTo:0}),0),o.add(()=>i(e.flight,fr(S[w]),Xe*.4),0),o.add(()=>x.classList.add(`is-ready`),.6000000000000001)})},leave(){return new Promise(e=>{if(Z)return e();di.forEach(e=>e.kill()),clearTimeout(_i),X=`leaving`,J.uEntOn.value=0,x.classList.remove(`is-ready`,`is-diving`),x.classList.add(`is-leaving`),J.uDropO.value.set(O/2,k*.55);let t=fi(l.timeline({onComplete:()=>e()}));t.to(J.uCloche,{value:0,duration:Qe*.5,ease:`none`},0),t.fromTo(J.uDrop,{value:.999},{value:0,duration:Qe,ease:`power1.in`},0)})},select(e){vi(e)},destroy(){hr||gi()}}}var Tt=null,Et=null;export{wt as createSelector};