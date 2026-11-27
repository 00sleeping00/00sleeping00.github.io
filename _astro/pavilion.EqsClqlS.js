import{f as e,g as t,n,p as r,t as i}from"./BaseLayout.astro_astro_type_script_index_0_lang.DvGw-2ng.js";var a=`#version 300 es
// 第 Ⅴ 章「彩窗」6f：一扇大玫瑰窗，滚一下转一圈换一件。一遍全屏：
// 夜里的石墙（不规则的方石、风化、水渍，被窗透出的彩光照亮、远处暗）、不转的石头外框（内侧斜面 + 外圈圆线脚 + N 颗小宝石）、
// 会转的玻璃圆盘（scripts/stained-glass.py 的 sg-disc：颜色 / 距离 / 厚薄 / 种类 / 焊点；画心是作品，外圈是石窗棂和花瓣）、
// 地上的彩色光斑（跟着转）、飞蛾。
// 换片：圆盘内容转过 12 点钟那条线就变成下一件（uSweep 是这一圈已经转过的角度，带正负号），分界线上补一道铅条。
// 玻璃的真实感照 6e：厚薄浓淡、每块方向不同的吹制条纹、气泡、锤纹折射夜空、乳白玻璃、立体铅条、小焊点、光晕、灰尘。
// 坐标：CSS 像素、原点左上；角度从 12 点钟顺时针。
precision highp float;
precision highp sampler2DArray;

uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uFade;
uniform vec2 uPar;
uniform sampler2DArray uColor;
uniform sampler2DArray uData;
uniform sampler2DArray uStill;
uniform sampler2D uMoth;
uniform vec3 uDisc;               // (圆心 x, y, 玻璃半径)
uniform float uRot;               // 圆盘转角（弧度，顺时针为正）
uniform float uSweep;             // 这一圈转过的角度（带符号）；0 = 没在换片
uniform vec2 uLayers;             // (旧的层, 新的层)
uniform float uVel;               // 角速度（弧度 / 秒）
uniform float uWake;
uniform float uHot;
uniform float uGem[16];           // 每颗宝石对应的层
uniform int uGemN;
uniform float uGemCur;            // 亮着的那颗（可以是小数：换片时过渡）
uniform float uFloor;             // 地面 y
uniform vec4 uMothP;
uniform float uMothA;
uniform float uMothO;
uniform float uSpread;

out vec4 outColor;

const float DS = 1024.0;
const float RDT = 0.498;          // 圆盘半径 / 图宽
const float HEART = 0.72;
const float TAU = 6.2831853;
const float FRAME = 0.13;         // 外框宽 / 玻璃半径

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
float worley(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(hash(i + g), hash(i + g + 7.3));
    o = 0.5 + 0.45 * sin(uTime * 0.25 + 6.2831 * o);
    float d = length(g + o - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
  }
  return d2 - d1;
}
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
vec3 srgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
float angOf(vec2 d) { return mod(atan(d.x, -d.y), TAU); }

float moonAt(float t) { return 0.93 + 0.05 * sin(t * 0.21) + 0.035 * sin(t * 0.077 + 1.3); }
// 窗后的夜空：右上方月亮那一片亮，慢慢飘的云
float skyLight(vec2 p, float H) {
  vec2 mp = uDisc.xy + vec2(0.55, -0.75) * uDisc.z;
  float m = exp(-pow(length(p - mp) / (0.55 * H), 2.0));
  float cloud = fbm(p / H * vec2(2.2, 4.0) + vec2(uTime * 0.012, 0.0));
  return 0.62 + 0.85 * m + 0.22 * (cloud - 0.5);
}

// 屏幕上这一点（相对圆心 d）现在显示哪一件：转过 12 点钟那条线的是新的
float layerAt(vec2 d) {
  if (uSweep == 0.0) return uLayers.x;
  float a = angOf(d);
  bool nw = uSweep > 0.0 ? a < uSweep : a > TAU + uSweep;
  return nw ? uLayers.y : uLayers.x;
}
vec2 discUV(vec2 d, float th) {
  float c = cos(th), s = sin(th);
  vec2 dr = vec2(d.x * c + d.y * s, d.y * c - d.x * s);
  return 0.5 + dr / uDisc.z * RDT;
}
float sweepFrac() { return clamp(abs(uSweep) / TAU, 0.0, 1.0); }
vec3 avgCol(float lod) {
  vec3 a = textureLod(uColor, vec3(0.5, 0.5, uLayers.x), lod).rgb;
  vec3 b = textureLod(uColor, vec3(0.5, 0.5, uLayers.y), lod).rgb;
  return lin(mix(a, b, smoothstep(0.0, 1.0, sweepFrac())));
}

// 圆盘上的一点：d = 相对圆心（屏幕），th = 采样用的转角
vec3 glassAt(vec2 d, float th, float layer, float H, float rr) {
  vec2 uv = discUV(d, th);
  vec3 uvl = vec3(uv, layer);
  vec2 tp = uv * DS;
  float tpc = DS * RDT / uDisc.z;                     // 每 CSS 像素多少纹理像素
  float tpx = tpc / uDpr;
  vec4 dat = texture(uData, uvl);
  // 种类不能插值（透明和乳白中间会被当成石头）：取最近的那个像素
  dat.b = texelFetch(uData, ivec3(clamp(tp, vec2(0.0), vec2(DS - 1.0)), int(layer + 0.5)), 0).b;
  vec3 c = lin(texture(uColor, uvl).rgb);
  float dist = dat.r * 16.0;
  float th2 = dat.g;
  float L = moonAt(uTime - th2 * 1.6);
  vec2 p = uDisc.xy + d;

  // 石头窗棂（跟着圆盘转）：圆润的线脚，中间受光，两边暗，被两边玻璃的颜色染上一点
  if (dat.b >= 0.5 && dat.b < 0.6) {
    float x = clamp(dist / 5.5, 0.0, 1.0);
    float hg = sqrt(max(0.0, 1.0 - (1.0 - x) * (1.0 - x)));
    vec3 st = lin(vec3(0.40, 0.40, 0.43)) * (0.82 + 0.3 * (fbm(tp * 0.06) - 0.5) + 0.1 * (noise(tp * 0.8) - 0.5));
    vec3 glow = lin(textureLod(uColor, uvl, 4.5).rgb);
    return st * (0.10 + 0.38 * hg) * L + glow * (1.0 - hg) * 0.32 * L;
  }

  bool opal = dat.b >= 0.6;
  float ang = dat.b * TAU / 0.5;
  float joint = clamp((1.0 - dat.a) * 2.008, 0.0, 1.0);
  float lw = max(1.1, 0.8 * tpx);

  vec2 hn = vec2(noise(tp * 0.11 + 3.0) - noise(tp * 0.11 - 3.0), noise(tp.yx * 0.11 + 9.0) - noise(tp.yx * 0.11 - 9.0));
  vec2 q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * tp;
  float streak = fbm(vec2(q.x * 0.012, q.y * 0.30));
  float inner = smoothstep(lw, lw + 10.0, dist);
  vec3 T;
  if (!opal) {
    vec2 behind = p + hn * 14.0 + uPar * 18.0 * (0.6 + th2);
    T = pow(c, vec3(0.9 + 0.35 * th2)) * skyLight(behind, H) * L * 1.3;
    T *= (0.88 + 0.22 * streak) * mix(0.74, 1.08, inner);
  } else {
    float lum = dot(c, vec3(0.3, 0.55, 0.15));
    T = mix(c, vec3(lum) * vec3(1.02, 1.0, 0.97), 0.12) * (0.95 + 0.25 * fbm(tp * 0.025 + th2 * 9.0)) * L * 1.15;
    T *= mix(0.8, 1.04, inner);
  }
  vec2 cell = floor(tp / 13.0);
  if (hash(cell + th2 * 7.0) > 0.972) {
    vec2 cp = (cell + 0.25 + 0.5 * vec2(hash(cell + 1.3), hash(cell + 2.9))) * 13.0;
    float r0 = 0.7 + 1.1 * hash(cell + 5.1);
    float dd = length(tp - cp);
    T += vec3(0.10) * L * smoothstep(r0 + tpx, r0, dd) * smoothstep(r0 - 0.9 - tpx, r0 - 0.9, dd);
  }
  float dust = exp(-max(dist - lw, 0.0) / 3.5) * (0.4 + 0.6 * noise(tp * 0.07));
  T *= 1.0 - 0.2 * dust;

  // 醒来（只有画心）：颜色化开成原图，铅条最后化开
  float wLead = 0.0;
  if (uWake > 0.001 && rr < HEART * 0.985) {
    vec3 s = lin(texture(uStill, uvl).rgb);
    float n1 = fbm(uv * 6.0 + 3.1) * 0.8 + noise(uv * 90.0) * 0.2;
    float e = smoothstep(n1 - 0.1, n1 + 0.1, uWake * 1.25 - 0.12);
    T = mix(T, s * L * 1.3 * (0.96 + 0.08 * streak), e);
    float n2 = fbm(uv * 9.0 + 9.4);
    wLead = smoothstep(n2 - 0.08, n2 + 0.08, uWake * 1.7 - 0.55);
  }

  vec3 blur = lin(textureLod(uColor, uvl, 2.5).rgb) * skyLight(p, H) * L;
  float halo = exp(-max(dist, 0.0) / (lw * 1.6)) * (1.0 - th2 * 0.6);

  float lm = (1.0 - smoothstep(lw - 0.7 * tpx, lw + 0.7 * tpx, dist)) * (1.0 - wLead);
  float x = clamp(dist / lw, 0.0, 1.0);
  float hgt = sqrt(max(0.0, 1.0 - x * x));
  vec3 leadBase = lin(vec3(0.12, 0.115, 0.11));
  float patina = smoothstep(0.55, 0.85, noise(tp * 0.045 + 4.0));
  leadBase = mix(leadBase, lin(vec3(0.28, 0.30, 0.27)), patina * 0.3);
  vec3 leadCol = leadBase * (0.25 + 0.6 * hgt) + lin(vec3(0.62, 0.62, 0.66)) * smoothstep(0.3, 0.0, x) * 0.07 * L;
  vec3 solder = leadBase * 1.25 + lin(vec3(0.6)) * smoothstep(0.8, 1.0, joint) * 0.05 * L;
  leadCol = mix(leadCol, solder, smoothstep(0.2, 0.7, joint));
  lm = max(lm, smoothstep(0.25, 0.55, joint) * (1.0 - wLead));

  vec3 col = mix(T, leadCol, lm);
  col += blur * halo * 0.2 * (1.0 - lm * 0.65);
  return col;
}

// 不规则方石墙：每行高低不同、每块宽窄不同，边角缺损，灰缝凹进去；风化斑、水渍、凿痕、细孔
vec3 wallAt(vec2 p, float H, vec3 light, vec2 lp) {
  vec2 q = p / H;
  vec2 wob = (vec2(fbm(q * 14.0), fbm(q * 14.0 + 4.0)) - 0.5) * 0.006;
  vec2 qq = q + wob;
  float baseH = 0.072;
  float row = floor(qq.y / baseH);
  float ry = fract(qq.y / baseH);
  // 有的行窄一点：把这一行从中间分成两条矮行
  float split = step(0.72, hash(vec2(row, 1.7)));
  float sub = split * step(0.55, ry);
  float rowId = row * 2.0 + sub;
  float rh = split > 0.5 ? (sub > 0.5 ? 0.45 : 0.55) * baseH : baseH;
  float yIn = split > 0.5 ? (sub > 0.5 ? (ry - 0.55) / 0.45 : ry / 0.55) : ry;
  float bwid = (split > 0.5 ? 0.11 : 0.17);
  float xs = qq.x / bwid + hash(vec2(rowId, 9.1)) * 3.0;
  float k = floor(xs);
  float b0 = k + 0.42 * (hash(vec2(k, rowId)) - 0.5);
  float b1 = k + 1.0 + 0.42 * (hash(vec2(k + 1.0, rowId)) - 0.5);
  float id = k;
  if (xs < b0) { b1 = b0; b0 = k - 1.0 + 0.42 * (hash(vec2(k - 1.0, rowId)) - 0.5); id = k - 1.0; }
  else if (xs > b1) { b0 = b1; b1 = k + 2.0 + 0.42 * (hash(vec2(k + 2.0, rowId)) - 0.5); id = k + 1.0; }
  float jx = min(xs - b0, b1 - xs) * bwid * H;
  float jy = min(yIn, 1.0 - yIn) * rh * H;
  float j = min(jx, jy);
  float chip = (noise(p * 0.18) - 0.5) * 2.2 + (noise(p * 0.7) - 0.5) * 0.8;
  float jw = 1.6 + chip;
  float mortar = 1.0 - smoothstep(jw - 0.6, jw + 0.8, j);
  vec2 sid = vec2(id, rowId);
  float tone = hash(sid) - 0.5;
  float hue = hash(sid + 3.3) - 0.5;
  vec3 base = mix(lin(vec3(0.44, 0.45, 0.50)), lin(vec3(0.50, 0.47, 0.44)), 0.5 + hue * 0.8);
  float weather = fbm(q * vec2(6.0, 3.0) + sid * 0.37);
  float stain = smoothstep(0.45, 0.85, fbm(vec2(q.x * 26.0, q.y * 2.2) + 5.0)) * smoothstep(0.3, 0.9, noise(q * 3.0));
  float pits = smoothstep(0.78, 0.92, noise(p * 0.55 + sid)) * 0.5;
  float grain = noise(p * 1.3) - 0.5;
  vec3 stone = base * (0.9 + tone * 0.22 + (weather - 0.5) * 0.35 + grain * 0.08) * (1.0 - 0.28 * stain) * (1.0 - 0.3 * pits);
  // 高度：石面微鼓 + 风化起伏；用屏幕导数当法线，被窗那个方向的光照亮
  float hgt = smoothstep(0.0, 9.0, j) * 3.0 + weather * 6.0 + grain * 0.8 - mortar * 2.0;
  vec3 n = normalize(vec3(-dFdx(hgt), -dFdy(hgt), 1.6));
  vec3 Ld = normalize(vec3(lp - p, 0.35 * H));
  float dif = 0.55 + 0.75 * max(dot(n, Ld), 0.0);
  vec3 mortarC = lin(vec3(0.33, 0.32, 0.31)) * (0.8 + 0.3 * noise(p * 0.9));
  vec3 c = mix(stone * dif, mortarC * 0.55, mortar);
  return c * light;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 R = uRes / uDpr;
  float H = R.y;
  vec2 C = uDisc.xy;
  float RG = uDisc.z;
  vec2 d = p - C;
  float rp = length(d);
  float rr = rp / RG;
  float L0 = moonAt(uTime);

  // ── 彩光：圆窗透出来的颜色照在墙上，近亮远暗 ──
  vec3 avg = avgCol(9.0);
  vec3 tint = (avg * 0.85 + 0.15) * (0.65 + 0.35 * uHot);
  float near = exp(-max(rp - RG, 0.0) / (0.26 * H));
  vec3 moonCool = lin(vec3(0.70, 0.75, 0.92));
  vec3 light = moonCool * 0.04 + tint * (1.7 * near + 0.1 * exp(-max(rp - RG, 0.0) / (0.9 * H))) * L0;
  vec3 col = wallAt(p, H, light, C);

  // ── 地面：透视的石板，靠墙一道阴影；圆窗投下的光斑（跟着转） ──
  float fy = (p.y - uFloor) / H;
  if (fy > 0.0) {
    float z = 1.0 / (fy + 0.04);
    vec2 fp = vec2((p.x - 0.5 * R.x) / H * z * 0.5, z * 0.45);
    vec2 tf = abs(fract(fp * vec2(1.4, 1.0)) - 0.5);
    float tl = smoothstep(0.47, 0.497, max(tf.x, tf.y));
    vec3 fl = lin(vec3(0.42, 0.43, 0.47)) * (0.9 + 0.2 * (fbm(fp * 3.0) - 0.5) + 0.12 * (hash(floor(fp * vec2(1.4, 1.0))) - 0.5));
    fl *= 1.0 - tl * 0.35;
    fl *= moonCool * 0.05 + tint * 0.14 * exp(-abs(p.x - C.x) / (0.6 * H));
    fl *= mix(0.4, 1.0, smoothstep(0.0, 0.025, fy));
    // 光斑：圆窗压扁成椭圆落在地上（偏左一点，月光从右上来）
    vec2 pc = vec2(C.x - 0.12 * RG, uFloor + 0.055 * H);
    vec2 e = vec2((p.x - pc.x) / (1.05 * RG), (p.y - pc.y) / (0.045 * H + fy * 0.2 * H));
    float er = length(e);
    if (er < 1.15) {
      vec2 dd = e * RG;
      float lay = layerAt(dd);
      vec3 pcol = lin(textureLod(uColor, vec3(discUV(dd, uRot), lay), 5.0).rgb);
      if (uWake > 0.0 && er < HEART) pcol = mix(pcol, lin(textureLod(uStill, vec3(discUV(dd, uRot), lay), 5.0).rgb), uWake);
      float m = 1.0 - smoothstep(0.82, 1.08, er + (fbm(p * 0.03) - 0.5) * 0.12);
      float caust = 0.75 + 0.55 * smoothstep(0.02, 0.18, worley(p / H * vec2(28.0, 60.0)));
      fl += pcol * m * caust * moonAt(uTime - 0.6) * (0.16 + 0.12 * uHot) * (1.0 - 0.35 * er);
    }
    col = fl;
  } else {
    col *= 1.0 - 0.55 * smoothstep(-0.025, 0.0, fy);
  }

  // ── 不转的石头外框：内侧斜面（被彩光染色）+ 外圈圆线脚（高光）+ 小宝石 ──
  float fr = rr - 1.0;
  if (fr >= 0.0 && fr < FRAME + 0.03) {
    float a = angOf(d);
    vec3 st = lin(vec3(0.46, 0.46, 0.49)) * (0.85 + 0.3 * (fbm(p * 0.05) - 0.5) + 0.08 * (noise(p * 0.9) - 0.5));
    vec3 lit = moonCool * 0.07 + tint * 0.6 * L0;
    if (fr < 0.085) {
      // 斜面：越往里越暗（窗洞深处），靠玻璃那一圈被玻璃的颜色照亮；玻璃边上一道深的嵌槽
      float t = fr / 0.085;
      vec3 sc = st * lit * mix(0.55, 1.35, t);
      vec3 near2 = lin(textureLod(uColor, vec3(discUV(d * 0.96, uRot), layerAt(d)), 6.0).rgb);
      sc += near2 * L0 * 0.28 * exp(-t * 3.0) * (1.0 + 0.6 * uHot);
      sc *= 1.0 - 0.75 * exp(-pow(fr * RG / 1.6, 2.0));
      // 石块接缝（斜面上每 1/24 圈一道）
      float jn = abs(fract(a / TAU * 24.0) - 0.5) * TAU / 24.0 * rp;
      sc *= 1.0 - 0.45 * (1.0 - smoothstep(0.4, 1.4, jn));
      col = sc;
    } else if (fr < FRAME) {
      // 圆线脚：半圆截面，上方受月光、靠近窗那一侧受彩光
      float t = (fr - 0.085) / (FRAME - 0.085);
      float hg = sin(3.14159 * t);
      vec2 nrm = d / max(rp, 1.0);
      float up = max(dot(nrm, normalize(vec2(0.5, -0.85))), 0.0);
      vec3 sc = st * (lit * (0.6 + 0.8 * hg) + moonCool * 0.06 * up * hg);
      sc *= 1.0 - 0.5 * exp(-pow((fr - 0.085) * RG / 1.2, 2.0));
      col = sc;
    } else {
      col *= 1.0 - 0.55 * (1.0 - (fr - FRAME) / 0.03);   // 外框投在墙上的影子
    }
  }
  // 宝石：外框线脚上均匀 N 颗，当前作品那一颗亮
  if (abs(fr - 0.5 * (0.085 + FRAME)) < 0.08) {
      vec3 lit = moonCool * 0.07 + tint * 0.6 * L0;
      float gr = 0.016 * H;
      for (int i = 0; i < 16; i++) {
        if (i >= uGemN) break;
        float ga = (float(i) + 0.5) / float(uGemN) * TAU;
        vec2 gp = C + (1.0 + 0.5 * (0.085 + FRAME)) * RG * vec2(sin(ga), -cos(ga));
        float gd = length(p - gp);
        if (gd < gr * 1.45) {
          float on = 1.0 - smoothstep(0.0, 1.0, abs(float(i) - uGemCur));
          vec3 gcol = lin(textureLod(uColor, vec3(0.5, 0.5, uGem[i]), 4.0).rgb);
          gcol = mix(vec3(dot(gcol, vec3(0.33))), gcol, 1.6);
          float x = gd / gr;
          // 金托
          vec3 gold = lin(vec3(0.62, 0.48, 0.25)) * (0.35 + 0.65 * smoothstep(1.45, 1.15, x)) * (lit * 1.6 + 0.06);
          vec3 cab = max(gcol, 0.0) * (0.22 + 0.9 * on) * (0.55 + 0.6 * (1.0 - x * x)) + vec3(0.9) * exp(-pow(length((p - gp) / gr - vec2(0.3, -0.35)) / 0.18, 2.0)) * (0.15 + 0.5 * on);
          col = x < 1.0 ? cab : mix(col, gold, smoothstep(1.45, 1.3, x));
        }
      }
  }
  for (int i = 0; i < 16; i++) {
    if (i >= uGemN) break;
    float on = 1.0 - smoothstep(0.0, 1.0, abs(float(i) - uGemCur));
    if (on <= 0.0) continue;
    float ga = (float(i) + 0.5) / float(uGemN) * TAU;
    vec2 gp = C + (1.0 + 0.5 * (0.085 + FRAME)) * RG * vec2(sin(ga), -cos(ga));
    vec3 gcol = lin(textureLod(uColor, vec3(0.5, 0.5, uGem[i]), 4.0).rgb);
    col += gcol * on * 0.18 * exp(-length(p - gp) / (0.02 * H));
  }

  // ── 玻璃圆盘（会转）：转得快时沿圆周模糊几次采样 ──
  if (rr < 1.0) {
    float lay = layerAt(d);
    float span = abs(uVel) * 0.0045;                   // 轻微的旋转模糊（约 1/4 帧的曝光）
    int taps = int(clamp(ceil(span * rp / 1.5), 1.0, 6.0));
    vec3 g = vec3(0.0);
    for (int k = 0; k < 6; k++) {
      if (k >= taps) break;
      float o = taps > 1 ? (float(k) / float(taps - 1) - 0.5) * span : 0.0;
      g += glassAt(d, uRot + o, lay, H, rr);
    }
    g /= float(taps);
    // 换片的分界线上补一道铅条（12 点钟那条 + 圆盘原来的 12 点钟那条）
    if (uSweep != 0.0 && abs(uSweep) < TAU - 0.01) {
      float lwc = max(0.9, 1.15 * (uDisc.z / (DS * RDT)));
      for (int k = 0; k < 2; k++) {
        float al = k == 0 ? 0.0 : uSweep;
        vec2 dir = vec2(sin(al), -cos(al));
        float tt = dot(d, dir);
        float dl = tt > 0.0 ? abs(d.x * dir.y - d.y * dir.x) : 1e4;
        float m = 1.0 - smoothstep(lwc - 0.5, lwc + 0.6, dl);
        g = mix(g, lin(vec3(0.12, 0.115, 0.11)) * (0.3 + 0.5 * (1.0 - dl / max(lwc, 0.1))), m);
      }
    }
    // 加固铁条：外圈装饰环里一道同心的细铁圈（比铅条稍粗），不穿过画心
    float br = 0.865 * RG;
    float bw = 1.35;
    float ba = 1.0 - smoothstep(bw - 0.5, bw + 0.6, abs(rp - br));
    g = mix(g, lin(vec3(0.07, 0.07, 0.075)) + lin(vec3(0.4)) * 0.2 * L0 * step(rp, br), ba);
    // 转动时月光在玻璃上扫过一道反光
    float sp = smoothstep(0.6, 3.5, abs(uVel));
    if (sp > 0.0) {
      vec2 sd = normalize(vec2(0.8, 0.6));
      float pos = mix(-1.3, 1.3, fract(abs(uRot) / TAU));
      float band = exp(-pow((dot(d / RG, sd) - pos) / 0.09, 2.0));
      g += lin(vec3(0.75, 0.8, 0.95)) * band * sp * 0.22;
    }
    col = g;
  }

  // ── 飞蛾 ──
  if (uMothO > 0.001) {
    vec2 q = p - uMothP.xy;
    float ca = cos(uMothA), sa = sin(uMothA);
    q = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float sc = 246.0 / max(uMothP.z, 1.0);
    vec2 tq = q * sc;
    tq.x /= max(uMothP.w, 0.12);
    vec2 tc = (vec2(210.0, 124.0) + tq) / vec2(512.0, 256.0);
    if (all(greaterThan(tc, vec2(0.0))) && all(lessThan(tc, vec2(1.0)))) {
      float sdm = (textureLod(uMoth, tc, 0.0).r - 0.5) * 80.0 / sc;
      float fill = 1.0 - smoothstep(-0.5, 0.5, sdm);
      col = mix(col, lin(vec3(0.90, 0.91, 0.96)) * 0.75, fill * uMothO);
      vec2 edge = min(tc, 1.0 - tc);
      col += lin(vec3(0.8, 0.85, 1.0)) * exp(-max(sdm, 0.0) / 4.0) * 0.05 * uMothO * (1.0 - fill) * smoothstep(0.0, 0.08, min(edge.x, edge.y));
    }
  }

  // ── 点开：月光穿过画心，地上的光斑铺开盖满屏幕 ──
  if (uSpread > 0.0) {
    vec3 sa = lin(textureLod(uStill, vec3(0.5, 0.5, uLayers.x), 6.0).rgb);
    vec2 c0 = vec2(C.x - 0.12 * RG, uFloor + 0.05 * H);
    float dd = length((p - c0) / H * vec2(1.0, 1.4));
    float f = smoothstep(uSpread * 2.2, uSpread * 2.2 - 0.35, dd + (fbm(p / H * 5.0) - 0.5) * 0.25);
    // 画心先亮起来（光穿过）
    col += sa * 0.6 * smoothstep(0.0, 0.4, uSpread) * (1.0 - smoothstep(HEART * 0.95, HEART, rr));
    col = mix(col, sa * 1.1 + 0.05, f * smoothstep(0.0, 0.25, uSpread));
  }

  vec2 v = (p / R - vec2(0.55, 0.5)) * vec2(1.0, 1.15);
  col *= 1.0 - 0.4 * smoothstep(0.35, 0.95, length(v));
  col = 1.0 - exp(-col * 1.6);
  vec3 o = srgb(col) + (hash(p * 1.37 + fract(uTime)) - 0.5) / 255.0;
  outColor = vec4(o * uFade, uFade);
}
`,o=(e,t)=>{let n=document.createElement(`canvas`);return n.width=e,n.height=t,n};function s(e){e.fillStyle=`#fff`,e.save(),e.translate(210,124),e.scale(.82,.86),e.translate(-210,-124);for(let t of[1,-1])e.beginPath(),e.moveTo(210,120),e.bezierCurveTo(210+t*30,32,210+t*120,12,210+t*150,42),e.bezierCurveTo(210+t*140,90,210+t*80,120,210,130),e.fill(),e.beginPath(),e.moveTo(210,128),e.bezierCurveTo(210+t*60,132,210+t*118,164,210+t*104,216),e.lineTo(210+t*96,232),e.bezierCurveTo(210+t*64,228,210+t*22,194,210,138),e.fill();e.beginPath(),e.ellipse(210,134,8,40,0,0,Math.PI*2),e.fill(),e.lineWidth=2.5,e.strokeStyle=`#fff`,e.lineCap=`round`;for(let t of[1,-1])e.beginPath(),e.moveTo(210,98),e.quadraticCurveTo(210+t*14,64,210+t*30,58),e.stroke();e.restore()}function c(e,t=512,n=256){let r=o(t,n),i=r.getContext(`2d`,{willReadFrequently:!0});e(i);let a=i.getImageData(0,0,t,n).data,s=new Uint8Array(t*n);for(let e=0;e<t*n;e++)s[e]=+(a[e*4+3]>127);let c=e=>{let r=new Float32Array(t*n).fill(1e6);for(let i=0;i<t*n;i++)s[i]===e&&(r[i]=0);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let i=e*t+n,a=r[i];n>0&&(a=Math.min(a,r[i-1]+3)),e>0&&(a=Math.min(a,r[i-t]+3),n>0&&(a=Math.min(a,r[i-t-1]+4)),n<t-1&&(a=Math.min(a,r[i-t+1]+4))),r[i]=a}for(let e=n-1;e>=0;e--)for(let i=t-1;i>=0;i--){let a=e*t+i,o=r[a];i<t-1&&(o=Math.min(o,r[a+1]+3)),e<n-1&&(o=Math.min(o,r[a+t]+3),i<t-1&&(o=Math.min(o,r[a+t+1]+4)),i>0&&(o=Math.min(o,r[a+t-1]+4))),r[a]=o}return r},l=c(1),u=c(0),d=i.createImageData(t,n);for(let e=0;e<t*n;e++){let t=(s[e]?-u[e]:l[e])/3,n=Math.max(0,Math.min(255,Math.round((.5+t/80)*255)));d.data[e*4]=n,d.data[e*4+1]=n,d.data[e*4+2]=n,d.data[e*4+3]=255}return i.putImageData(d,0,0),r}var l=()=>c(s),u=4;t.registerPlugin(e);var d=1024,ee=.72,te=1.5,ne=1.6,re=.9,ie=1.2,ae=Math.PI*2,oe=e.create(`pv-spin`,`M0,0 C0.3,0 0.36,0.5 0.54,0.82 0.66,1.02 0.8,1.004 1,1`),se=[`I`,`II`,`III`,`IV`,`V`,`VI`,`VII`,`VIII`,`IX`,`X`,`XI`,`XII`,`XIII`,`XIV`,`XV`,`XVI`];function ce(e,t){let n=.36*t;return{cx:Math.max(.6*e,.4*e+n*1.13),cy:.47*t,r:n,floor:.925*t}}var f=()=>new Promise(e=>requestAnimationFrame(()=>e())),p=e=>{let t=window.__selEv;t&&t.push([e,performance.now()])},le=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;async function m(e){let{root:o}=e,s=new URLSearchParams(location.search),c=e.works,m=c,ue=Number(s.get(`pvn`)||0);ue>0&&m.length&&(m=Array.from({length:Math.min(16,ue)},(e,t)=>({...c[t%c.length],id:`${c[t%c.length].id}-${t}`})));let h=m.length,de=o.querySelector(`.sel-stage`),g=document.createElement(`canvas`);g.style.opacity=`0`,de.appendChild(g);let _=g.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,preserveDrawingBuffer:!0,powerPreference:`high-performance`});if(!_)throw g.remove(),Error(`沒有 WebGL2`);let fe=!1,pe=_.getExtension(`KHR_parallel_shader_compile`),me=(e,t)=>{let n=_.createShader(e);return _.shaderSource(n,t),_.compileShader(n),n},he=me(_.VERTEX_SHADER,le),ge=me(_.FRAGMENT_SHADER,a),v=_.createProgram();if(_.attachShader(v,he),_.attachShader(v,ge),_.linkProgram(v),pe)for(;!_.getProgramParameter(v,pe.COMPLETION_STATUS_KHR);)await f();if(!_.getProgramParameter(v,_.LINK_STATUS)){let e=_.getShaderInfoLog(ge)||_.getProgramInfoLog(v);throw g.remove(),Error(`彩窗著色器：`+e)}_.useProgram(v),_.bindBuffer(_.ARRAY_BUFFER,_.createBuffer()),_.bufferData(_.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),_.STATIC_DRAW);let _e=_.getAttribLocation(v,`aPos`);_.enableVertexAttribArray(_e),_.vertexAttribPointer(_e,2,_.FLOAT,!1,0,0);let y=new Proxy({},{get:(e,t)=>t in e?e[t]:e[t]=_.getUniformLocation(v,t)});_.pixelStorei(_.UNPACK_ALIGNMENT,1);let b=[...new Set(m.map(e=>e.dir))],x=e=>b.indexOf(m[e].dir),ve=[],ye=e=>Math.floor(Math.log2(e))+1,be=(e,t,n)=>{let r=_.createTexture();ve.push(r),_.activeTexture(_.TEXTURE0+e),_.bindTexture(_.TEXTURE_2D_ARRAY,r);let i=n?ye(d):1;return _.texStorage3D(_.TEXTURE_2D_ARRAY,i,_.RGBA8,d,d,t),_.texParameteri(_.TEXTURE_2D_ARRAY,_.TEXTURE_MIN_FILTER,n?_.LINEAR_MIPMAP_LINEAR:_.LINEAR),_.texParameteri(_.TEXTURE_2D_ARRAY,_.TEXTURE_MAG_FILTER,_.LINEAR),_.texParameteri(_.TEXTURE_2D_ARRAY,_.TEXTURE_WRAP_S,_.CLAMP_TO_EDGE),_.texParameteri(_.TEXTURE_2D_ARRAY,_.TEXTURE_WRAP_T,_.CLAMP_TO_EDGE),{t:r,unit:e,levels:i}},xe=be(0,b.length,!0),Se=be(1,b.length,!1),Ce=be(2,b.length,!0),we=_.createTexture();ve.push(we),_.activeTexture(_.TEXTURE3),_.bindTexture(_.TEXTURE_2D,we),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MIN_FILTER,_.LINEAR),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MAG_FILTER,_.LINEAR),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_S,_.CLAMP_TO_EDGE),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_T,_.CLAMP_TO_EDGE);{let e=l(),t=e.getContext(`2d`).getImageData(0,0,e.width,e.height).data;_.texImage2D(_.TEXTURE_2D,0,_.RGBA8,e.width,e.height,0,_.RGBA,_.UNSIGNED_BYTE,new Uint8Array(t.buffer))}[[`uColor`,0],[`uData`,1],[`uStill`,2],[`uMoth`,3]].forEach(([e,t])=>_.uniform1i(y[e],t));let Te=1<<23,Ee=0,De=async(e,t,n)=>{let r=[t.data,...t.mips??[]],i=t.w,a=t.h;for(let t=0;t<r.length&&t<e.levels;t++){let o=i*4,s=Math.max(1,Math.floor(Te/o));for(let c=0;c<a;c+=s){let l=Math.min(s,a-c);if(_.activeTexture(_.TEXTURE0+e.unit),_.bindTexture(_.TEXTURE_2D_ARRAY,e.t),_.texSubImage3D(_.TEXTURE_2D_ARRAY,t,0,c,n,i,l,1,_.RGBA,_.UNSIGNED_BYTE,r[t].subarray(c*o,(c+l)*o)),Ee+=l*o,Ee>=Te&&(Ee=0,await f(),fe))return}i=Math.max(1,i>>1),a=Math.max(1,a>>1)}},S=[];b.forEach((e,t)=>S.push([xe,`/works/${e}/sg-disc-color.webp`,t,!0],[Se,`/works/${e}/sg-disc-data.png`,t,!1],[Ce,`/works/${e}/sg-disc-still.webp`,t,!0]));let Oe=await Promise.all(S.map(([,e,,t])=>r(e,{premul:!1,mips:t})));for(let e=0;e<S.length;e++){if(fe)throw Error(`closed`);await De(S[e][0],Oe[e],S[e][2])}let C=o.querySelector(`.pv-windows`),ke=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);C.innerHTML=`<button type="button" class="pv-heart" data-cursor="翻閱 · Read"></button>`+m.map((e,t)=>`<button type="button" class="pv-gem" data-i="${t}" data-magnetic aria-label="${ke(e.title)}"></button>`).join(``);let w=C.querySelector(`.pv-heart`),Ae=[...C.querySelectorAll(`.pv-gem`)],je=[...o.querySelectorAll(`.pv-cap`)],Me=o.querySelector(`.pv-info`),Ne=o.querySelector(`.pv-count`),Pe=o.querySelector(`.pv-open`),T=innerWidth,E=innerHeight,D=Math.min(devicePixelRatio||1,te),O=ce(T,E),k=e=>`${e.toFixed(1)}px`,Fe=e=>{let t=(e+.5)/h*ae,n=O.r*1.1075;return{x:O.cx+Math.sin(t)*n,y:O.cy-Math.cos(t)*n}},Ie=()=>{T=innerWidth,E=innerHeight,D=Math.min(devicePixelRatio||1,te),g.width=Math.round(T*D),g.height=Math.round(E*D),_.viewport(0,0,g.width,g.height),O=ce(T,E);let e=O.r*ee;Object.assign(w.style,{left:k(O.cx-e),top:k(O.cy-e),width:k(e*2),height:k(e*2)});let t=.05*E;Ae.forEach((e,n)=>{let r=Fe(n);Object.assign(e.style,{left:k(r.x-t/2),top:k(r.y-t/2),width:k(t),height:k(t)})});let n=Math.max(32,.07*T),r=O.cx-O.r*1.13-.05*T;Object.assign(Me.style,{left:k(n),width:k(Math.max(240,Math.min(440,r-n))),top:k(O.cy)})};Ie(),addEventListener(`resize`,Ie);let A=Math.max(0,m.findIndex(t=>t.id===e.startAt)),Le=A,j={v:0},M={th:0,sweep:0,a:x(A),b:x(A),vel:0,prev:0},N={v:A},P={v:0,hot:0},Re=null,F={v:0},I={x:0,y:0,tx:0,ty:0},L={x:0,y:0,a:0,flap:1,o:0,size:30,mode:`perch`},R=`idle`,z=!1,B=null,V=!1,ze=A,H=null,Be=performance.now(),Ve=Be,U=()=>({x:O.cx,y:O.cy-O.r*1.13-.006*E}),W=()=>({x:O.cx,y:O.cy-O.r*ee-.004*E});Object.assign(L,U());let G=e=>{Le=e,je.forEach((t,n)=>t.classList.toggle(`is-cur`,n===(ue>0?e%c.length:e))),Ne.textContent=`${se[e]??e+1} / ${se[h-1]??h}`,Ae.forEach((t,n)=>t.setAttribute(`aria-current`,n===e?`true`:`false`)),Pe.setAttribute(`aria-label`,m[e].title)};G(A);let K=(e,t,n)=>{L.mode=`fly`;let r=Math.hypot(e-L.x,t-L.y);L.x=e,L.y=t,i.selFly({x:e,y:t+u},Math.min(1.3,.4+r/900),()=>{L.mode=`perch`,n?.()})},q=e=>{Re?.kill(),Re=t.to(P,{v:+!!e,hot:+!!e,duration:e?re:ie,ease:e?`sine.out`:`sine.inOut`})},J=e=>{if(e===V||R===`opening`||(V=e,z))return;q(e);let t=e?W():U();K(t.x,t.y)},Y=(n,r)=>{if(R!==`ready`&&R!==`entering`)return;if(z){B={to:n,dir:r};return}if(n===A)return;z=!0,ze=n,p(`spin`),P.v>0&&q(!1),M.a=x(A),M.b=x(n);let i=U();K(i.x+O.r*.55*r,i.y+.02*E);let a={t:0},o=!1;t.to(a,{t:1,duration:ne,ease:oe,onUpdate:()=>{M.th=r*ae*a.t,M.sweep=M.th===0?r*1e-4:M.th,!o&&Math.abs(M.th)>=Math.PI&&(o=!0,Me.classList.add(`is-swap`),setTimeout(()=>{G(n),N.v=n,Me.classList.remove(`is-swap`)},220),t.to(N,{v:n,duration:.5,ease:`sine.inOut`,overwrite:!0}),e.onChange(m[n].id))},onComplete:()=>{A=n,M.a=M.b=x(n),M.th=0,M.sweep=0,M.prev=0,z=!1,p(`spin:end`);let e=V?W():U();if(K(e.x,e.y),V&&q(!0),B){let e=B;B=null,Y(e.to,e.dir)}}})},X=e=>{z?B={to:(ze+e+h)%h,dir:e}:Y((A+e+h)%h,e)},Z=0,He=new Float32Array(16),Q=e=>{let t=(e-Be)/1e3,n=Math.max(1/240,(e-Ve)/1e3);Ve=e;let r=(M.th-M.prev)/n;M.prev=M.th,M.vel+=(r-M.vel)*.5,z||(M.vel*=.6),H!==null&&(M.vel=H),L.mode===`perch`?(L.flap=.8+.2*Math.cos(t*1.6),L.a*=.92):L.flap=.35+.65*Math.abs(Math.cos(t*13)),I.x+=(I.tx-I.x)*.06,I.y+=(I.ty-I.y)*.06,_.uniform2f(y.uRes,g.width,g.height),_.uniform1f(y.uDpr,D),_.uniform1f(y.uTime,t),_.uniform1f(y.uFade,j.v),_.uniform2f(y.uPar,I.x,I.y),_.uniform3f(y.uDisc,O.cx,O.cy,O.r),_.uniform1f(y.uRot,M.th),_.uniform1f(y.uSweep,z?M.sweep:0),_.uniform2f(y.uLayers,M.a,M.b),_.uniform1f(y.uVel,M.vel),_.uniform1f(y.uWake,P.v),_.uniform1f(y.uHot,P.hot);for(let e=0;e<16;e++)He[e]=e<h?x(e):0;_.uniform1fv(y.uGem,He),_.uniform1i(y.uGemN,h),_.uniform1f(y.uGemCur,N.v),_.uniform1f(y.uFloor,O.floor),_.uniform4f(y.uMothP,L.x,L.y,L.size,L.flap),_.uniform1f(y.uMothA,L.a),_.uniform1f(y.uMothO,0),_.uniform1f(y.uSpread,F.v),_.drawArrays(_.TRIANGLES,0,3)},Ue=e=>{Z=requestAnimationFrame(Ue),!o.hidden&&Q(e)};Q(performance.now()),await f(),g.style.opacity=``,Z=requestAnimationFrame(Ue);let We=e=>{I.tx=0,I.ty=0};o.addEventListener(`pointermove`,We),w.addEventListener(`pointerenter`,()=>J(!0)),w.addEventListener(`pointerleave`,()=>J(!1)),w.addEventListener(`focus`,()=>J(!0)),w.addEventListener(`blur`,()=>J(!1)),w.addEventListener(`click`,()=>Ye(m[A])),Pe.addEventListener(`click`,()=>Ye(m[Le])),Ae.forEach((e,t)=>e.addEventListener(`click`,()=>{t!==(z&&B?B.to:A)&&Y(t,1)}));let $=0,Ge=!1,Ke=0,qe=e=>{if(e.preventDefault(),R!==`ready`)return;let t=e.deltaMode===1?e.deltaY*40:e.deltaY,n=e.deltaMode!==0||Math.abs(t)>=50&&Number.isInteger(t);clearTimeout(Ke),Ke=window.setTimeout(()=>{Ge=!1,$=0},n?0:220),n?X(t>0?1:-1):Ge||($+=t,Math.abs($)>=60&&(Ge=!0,X($>0?1:-1),$=0))};o.addEventListener(`wheel`,qe,{passive:!1});let Je=e=>{R===`ready`&&(e.key===`ArrowRight`||e.key===`ArrowDown`?(e.preventDefault(),X(1)):(e.key===`ArrowLeft`||e.key===`ArrowUp`)&&(e.preventDefault(),X(-1)))};o.addEventListener(`keydown`,Je);let Ye=e=>{if(R!==`ready`||z)return;R=`opening`,V=!0,q(!0);let r=W();K(r.x,r.y),p(`open`),t.to(F,{v:1,duration:1.2,ease:`power2.inOut`,onComplete:()=>{n(c.find(t=>t.dir===e.dir)?.href??e.href,{x:O.cx,y:O.floor})}})},Xe={enter(){R=`entering`,p(`enter`);let n=!!e.startAt;return n&&(F.v=1),new Promise(e=>{let r=t.timeline({onComplete:()=>{R=`ready`,o.classList.add(`is-ready`),p(`enter:ready`),e()}});r.to(j,{v:1,duration:n?.4:.8,ease:`none`},0),n&&r.to(F,{v:0,duration:.9,ease:`power2.inOut`},.1),r.to(L,{o:1,duration:.6,ease:`none`},.4),i.selEnter({x:L.x,y:L.y+u},.4,.6)})},leave(){return R=`leaving`,o.classList.remove(`is-ready`),o.classList.add(`is-leaving`),i.selLeave(.5),p(`leave`),new Promise(e=>{t.to(j,{v:0,duration:.5,ease:`none`,onComplete:()=>{p(`leave:end`),e()}})})},select:Ye,destroy(){fe=!0,cancelAnimationFrame(Z),i.selLeave(0),Re?.kill(),clearTimeout(Ke),removeEventListener(`resize`,Ie),o.removeEventListener(`pointermove`,We),o.removeEventListener(`wheel`,qe),o.removeEventListener(`keydown`,Je),o.classList.remove(`is-ready`,`is-leaving`),ve.forEach(e=>_.deleteTexture(e)),_.deleteProgram(v),_.getExtension(`WEBGL_lose_context`)?.loseContext(),g.remove(),C.innerHTML=``}};return window.__pv={layout:()=>O,step:X,spinTo:Y,hoverHeart:J,moth:L,spread:F,par:I,spin:M,phase:()=>R,pose:e=>{t.globalTimeline.getChildren(!1,!0,!0).forEach(e=>e.progress(1)),j.v=1,L.o=1,L.mode=`perch`,R===`entering`&&(R=`ready`),o.classList.add(`is-ready`),e.th!==void 0&&e.to!==void 0?(z=!0,M.a=x(A),M.b=x(e.to),M.th=e.th,M.sweep=e.th,M.prev=e.th,G(Math.abs(e.th)>=Math.PI?e.to:A),N.v=Math.abs(e.th)>=Math.PI?e.to:A):(z=!1,M.a=M.b=x(A),M.th=M.sweep=M.prev=0,G(A),N.v=A),H=e.vel??0,e.wake!==void 0&&(P.v=e.wake,P.hot=e.wake),Object.assign(L,(e.wake??0)>0?W():U()),i.selPlace({x:L.x,y:L.y+u}),Q(performance.now())},release:()=>{H=null},stop:()=>cancelAnimationFrame(Z),gsap:t,drawAt:e=>Q(Be+e),settle:()=>{t.globalTimeline.getChildren(!1,!0,!0).forEach(e=>e.progress(1)),Object.assign(L,U(),{mode:`perch`,o:1}),i.selPlace({x:L.x,y:L.y+u}),j.v=1,R===`entering`&&(R=`ready`),o.classList.add(`is-ready`),Q(performance.now())},draw:()=>Q(performance.now()),snapshot:()=>g.toDataURL(`image/png`)},Xe}export{m as createSelector,ce as layoutFor};