var e=`// 第 13 轮：薄、透、一直在流动的水彩（选择页背景和作品页第 1 屏同一个函数——交接那一刻画面一样）。noise.glsl 拼在前面。
// - 薄涂：每一层颜料的不透明度上限 0.45；芯 0.15–0.30，往外由浓到淡，外缘淡到几乎是纸，只剩一条 2–4 px 的湿边（+0.08）；
//   两层重叠的地方才浓一点。纸纹一直透得过来（合成时整张再乘纸纹）。
// - 形状：多尺度噪声扭曲的距离场——不规则、带分叉、带回流水花（backrun）；没有一颗颗的小圆点。
// - 点缀色只渗在主色块的湿边里（像一滴别的颜色落在湿的边上化开），面积 ≤ 5 %。
// - 颜料只占画面 25–40 %，中轴 40 % 宽（罩子和作品名）几乎留白。
// - 一直在流动：低频 curl noise 作为恒定的弱流场推着整个颜料场（边缘 10 s 走 30–80 px），再叠一层更细、更快一点的爬行。
//   位移是有界的（流场本身在原地慢慢变化），所以几分钟后颜料的形状、浓度和刚开始差不多——永远不停、也不会越流越散、越流越淡。
//   px：CSS 像素（y 向上）；res：CSS 视口；mode：0 = A 标准、1 = B 更淡、2 = C 浓一点；t：时间（秒）；seed：每件作品不同的构图。
//   返回透色（= 颜色 / 纸色，乘到纸上就是这块颜色），thick 里返回颜料不透明度（0–1）。

vec3 srgb2lin(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 lin2srgb(vec3 c) { c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 toOklab(vec3 c) {
  vec3 l = srgb2lin(c);
  vec3 lms = mat3(0.4122214708, 0.2119034982, 0.0883024619, 0.5363325363, 0.6806995451, 0.2817188376, 0.0514459929, 0.1073969566, 0.6299787005) * l;
  lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
  return mat3(0.2104542553, 1.9779984951, 0.0259040371, 0.7936177850, -2.4285922050, 0.7827717662, -0.0040720468, 0.4505937099, -0.8086757660) * lms;
}
vec3 fromOklab(vec3 c) {
  vec3 lms = mat3(1.0, 1.0, 1.0, 0.3963377774, -0.1055613458, -0.0894841775, 0.2158037573, -0.0638541728, -1.2914855480) * c;
  lms = lms * lms * lms;
  return lin2srgb(mat3(4.0767416621, -1.2684380046, -0.0041960863, -3.3077115913, 2.6097574011, -0.7034186147, 0.2309699292, -0.3413193965, 1.7076924416) * lms);
}
/** 颜料在纸上的「透色」：OKLab 里往纸色靠 k，再除以纸色——乘回纸上就是那块颜色 */
vec3 glaze(vec3 pigment, vec3 paper, float k) {
  vec3 m = fromOklab(mix(toOklab(pigment), toOklab(paper), k));
  return clamp(m / max(paper, vec3(1e-3)), 0.0, 1.0);
}
vec3 lab2lch(vec3 c) { return vec3(c.x, length(c.yz), atan(c.z, c.y)); }
vec3 lch2lab(vec3 c) { return vec3(c.x, c.y * cos(c.z), c.y * sin(c.z)); }
/** 不发灰的混色：L 线性，色度取「线性和较大者」之间，色相走短弧 */
vec3 mixLch(vec3 a, vec3 b, float t) {
  float dh = b.z - a.z;
  dh -= 6.2831853 * floor((dh + 3.14159265) / 6.2831853);
  float c = mix(a.y, b.y, t);
  c = mix(c, max(a.y, b.y), 0.6 * 4.0 * t * (1.0 - t));
  return vec3(mix(a.x, b.x, t), c, a.z + dh * t);
}
/** 在 OKLab 里往颜料方向盖一层薄薄的透明色：色度不掉（冷色在暖纸上不穿过灰） */
vec3 glazeLab(vec3 col, vec3 pig, float a) {
  vec3 m = mix(col, pig, a);
  float want = mix(length(col.yz), length(pig.yz), pow(a, 0.7));
  float have = length(m.yz);
  if (have > 1e-4 && have < want) m.yz *= want / have;
  return m;
}

float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }

/** 低频 curl noise：标量势 ψ 的旋度（无散度：颜料只被推着走，不会被挤多、拉少） */
vec2 curl(vec2 p) {
  const float e = 0.07;
  float a = fbm(p + vec2(0.0, e)), b = fbm(p - vec2(0.0, e));
  float c = fbm(p + vec2(e, 0.0)), d = fbm(p - vec2(e, 0.0));
  return vec2(a - b, d - c) / (2.0 * e);
}

vec3 watercolor(vec2 px, vec2 res, vec3 pal0, vec3 pal1, vec3 pal2, vec3 pal3, vec3 paper, float mode, float t, float seed, out float thick) {
  vec2 uv = px / res.y;                       // 高 = 1
  float aspect = res.x / res.y;
  thick = 0.0;
  bool hasAccent = distance(pal3, pal0) > 0.004;
  // 一直在流动：两层流场（慢的大流、快一点的细爬行），位移有界
  vec2 flow = 0.07 * curl(uv * 1.1 + vec2(seed * 1.7, seed) + vec2(t * 0.058, -t * 0.045));
  flow += 0.018 * curl(uv * 3.2 + vec2(-seed, seed * 2.3) + vec2(-t * 0.14, t * 0.11));
  vec2 q = uv + flow;

  vec3 P = toOklab(paper);
  vec3 col = P;
  vec3 L0 = toOklab(pal0), L1 = toOklab(pal1), L2 = toOklab(pal2), L3 = toOklab(pal3);
  float acc = 0.0;
  int n = mode < 0.5 ? 5 : 4;
  for (int i = 0; i < 5; i++) {
    if (i >= n) break;
    float fi = float(i) + seed * 3.17;
    // 每一块颜料：放在四周，避开中轴 40 % 宽
    float ang = hash11(fi * 1.3) * 6.2832;
    vec2 c = vec2(aspect * 0.5, 0.5) + vec2(cos(ang) * aspect * 0.5, sin(ang) * 0.52) * mix(0.9, 1.2, hash11(fi * 3.7));
    float side = c.x - aspect * 0.5;
    if (abs(side) < aspect * 0.3) c.x = aspect * 0.5 + sign(side + 1e-3) * aspect * 0.3;
    // 主色两块（i = 0, 3）、浅一层两块（1, 4）、深一层一块小的（2）
    int k = i == 0 || i == 3 ? 0 : i == 1 || i == 4 ? 2 : 1;
    float size = mix(0.22, 0.36, hash11(fi * 4.3)) * (k == 1 ? 0.6 : 1.0) * (mode > 1.5 ? 1.2 : 1.0);
    // 形状：多尺度噪声扭曲（大的分叉 + 中的起伏 + 细的毛边），不是圆
    vec2 d = q - c;
    float w1 = fbm(q * 1.8 + fi * 1.9) - 0.5;
    float w2 = fbm(q * 5.0 + fi * 3.1) - 0.5;
    float w3 = fbm(q * 14.0 + fi * 5.7) - 0.5;
    float dist = length(d * vec2(1.0, 1.0 + 0.4 * hash11(fi * 5.1))) + w1 * 0.3 * size / 0.3 + w2 * 0.07 + w3 * 0.018;
    float s = dist / size;
    if (s >= 1.02) continue;
    // 由浓到淡：芯 0.15–0.30，往外淡到几乎是纸；外缘一条湿边
    float core = mix(0.15, 0.3, hash11(fi * 6.3)) * (0.75 + 0.5 * fbm(q * 3.0 + fi));
    float body = core * (1.0 - 0.8 * smoothstep(0.15, 0.95, s)) * (1.0 - smoothstep(0.965, 1.0, s));
    // 湿边：只在边上 2–4 px（size 是视口高的 0.22–0.36 → 0.012 × size ≈ 3 px）
    float wet = 0.08 * exp(-pow((s - 0.975) / 0.012, 2.0));
    // 回流水花：芯里一块花椰菜形的浅区，边上一道细的深线
    float br = fbm(q * 4.2 + fi * 7.3);
    float bloomIn = smoothstep(0.6, 0.64, br) * (1.0 - smoothstep(0.6, 0.9, s));
    float bloomEdge = exp(-pow((br - 0.6) / 0.008, 2.0)) * (1.0 - smoothstep(0.55, 0.9, s));
    float a = body * (1.0 - 0.6 * bloomIn) + wet + 0.06 * bloomEdge;
    // 颗粒（减半，只在中等浓度）
    a *= 1.0 + 0.08 * (vnoise(px / 2.6) - 0.5) * smoothstep(0.05, 0.15, a) * (1.0 - smoothstep(0.25, 0.4, a));
    if (mode > 0.5 && mode < 1.5) a *= 0.7;
    if (mode > 1.5) a *= 1.25;
    a = clamp(a, 0.0, 0.45);
    vec3 pig = k == 0 ? L0 : k == 1 ? L1 : L2;
    col = glazeLab(col, pig, a);
    acc += a;
    // 点缀：只在主色块的湿边一带，几处小小的化开
    if (hasAccent && k == 0) {
      float spot = smoothstep(0.6, 0.72, fbm(q * 3.4 + fi * 2.9 + seed)) * smoothstep(0.78, 0.95, s) * (1.0 - smoothstep(0.985, 1.02, s));
      float aa = 0.3 * spot;
      col = glazeLab(col, L3, aa);
      acc += aa;
    }
  }
  thick = clamp(acc, 0.0, 1.0);
  return clamp(fromOklab(col) / max(paper, vec3(1e-3)), 0.0, 1.2);
}
`;export{e as t};