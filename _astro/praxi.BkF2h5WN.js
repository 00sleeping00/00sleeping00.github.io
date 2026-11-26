import{g as e,n as t,p as n}from"./BaseLayout.astro_astro_type_script_index_0_lang.C42NYwK_.js";var r={strips:{order:[`P04`,`P05`,`P11`,`P38`,`P39`,`T1`,`T2`,`T3`,`T4`,`T5`,`T6`,`T7`],fw:256,fh:166,n:12},geo:{e:15,R:255,light:[-.5507440069535275,.7209739727391632,.42056815076451187],drum:{r:1,h:.42,hoop:.045,hoopR:1.014,band:[.05,.365],inner:.985},prism:{n:12,rm:.72,core:[0,.34],mirror:[.34,.96],image:.955},box:[-1.08,-1.15,1.08,.99],origin:[655,515],tex:[1102,1092],rackBox:[906,297.28,528,427.08],rollSize:[81,70],rack:{rolls:[[949,371.4],[1069,371.4],[1189,371.4],[1309,371.4],[949,479.5],[1069,479.5],[1189,479.5],[1309,479.5],[949,587.7],[1069,587.7],[1189,587.7],[1309,587.7]],labels:[[990,460.2],[1110,460.2],[1230,460.2],[1350,460.2],[990,568.4],[1110,568.4],[1230,568.4],[1350,568.4],[990,676.5],[1110,676.5],[1230,676.5],[1350,676.5]]},bg:{x0:-240,y0:-150,w:1920,h:1200},base:{plinth:[.7,-.8,-.7],step:[.52,-.7,-.65],boss:[-.65,-.5],axle:[.045,-.5,0]},proj:[232,16,530,344],lamp:[-160,-180],rackOrigin:[1170,700]}},i=`#version 300 es
precision highp float;
uniform vec2 uRes;          // 画布设备像素
uniform float uDpr, uK;     // 设备像素比；设计稿缩放
uniform vec2 uOff;          // 设计稿 (0, 0) 在窗口里的位置（CSS 像素）
uniform vec2 uOrigin;       // 筒底中心（设计稿）
uniform float uR;           // 1 R = 多少设计稿像素
uniform vec4 uBox;          // 视镜贴图覆盖的 X0, Y0, X1, Y1（R 单位）
uniform float uPhi, uVel;   // 筒转角、角速度（弧度 / 秒，算拖影）
uniform float uRow, uRowB, uMix;   // 当前纸条（图集第几行）、上一条、换条进度
uniform float uKc;          // 正中那面镜子是第几帧
uniform vec4 uProj;         // 墙上投影的框（设计稿 x, y, w, h）
uniform float uProjA;       // 投影不透明度
uniform vec2 uLampP;        // 灯的位置（设计稿）
uniform float uLit;         // 点灯进度 0–1（1 = 全亮）
uniform vec3 uL;
uniform vec3 uLacq, uShadow, uLampC;
uniform sampler2D tBack, tInside, tFront, tShade, tOuter, tStrips, tPaper, tBg;
uniform vec4 uBgBox;        // 背景图在设计稿里的 x, y, w, h
out vec4 o;

#define PI 3.14159265
#define TAU 6.2831853
const float S = 0.258819, C = 0.965926;     // sin / cos 15°
const float RI = __RI__, H = __H__, HOOP = __HOOP__, B0 = __B0__, B1 = __B1__;
const float RM = __RM__, M0 = __M0__, M1 = __M1__, IW = __IW__;
const float NF = 12.0, STEP = TAU / 12.0, HALF = PI / 12.0;
const float PICF = 0.94;
const vec3 INK = vec3(0.306, 0.259, 0.220);

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.9375; }

vec4 tex(sampler2D t, vec2 uv) { vec4 c = texture(t, uv); return vec4(c.rgb * c.a, c.a); }
void over(inout vec4 dst, vec4 src) { dst = src + dst * (1.0 - src.a); }

float tone(float lv, vec2 q) {
  float n = (fbm(q * 5.5) - 0.5) * 0.16 + (fbm(q * 14.0 + 3.1) - 0.5) * 0.06;
  float mid = 1.0 - smoothstep(0.30 + n, 0.36 + n, lv);
  float dark = 1.0 - smoothstep(0.08 + n, 0.13 + n, lv);
  float pool = 0.18 * exp(-abs(lv - (0.33 + n)) / 0.012) + 0.12 * exp(-abs(lv - (0.105 + n)) / 0.01);
  return 0.40 * mid + 0.45 * dark + pool * step(0.02, lv);
}

vec3 strip(float row, float f, vec2 uv, float bias) {
  vec2 a = vec2((mod(f, NF) + clamp(uv.x, 0.002, 0.998)) / NF, (row + clamp(uv.y, 0.004, 0.996)) / NF);
  return texture(tStrips, a, bias).rgb;
}
vec3 stripMix(float f, vec2 uv, float bias) {
  vec3 a = strip(uRow, f, uv, bias);
  if (uMix >= 1.0) return a;
  return mix(strip(uRowB, f, uv, bias), a, uMix);
}

vec4 wallPic(float a, float v, float aw) {
  float cell = a / STEP;
  float j = floor(cell), cu = fract(cell);
  float inPic = step(0.5 - PICF * 0.5, cu) * step(cu, 0.5 + PICF * 0.5);
  vec2 uv = vec2(1.0 - (cu - (0.5 - PICF * 0.5)) / PICF, 1.0 - v);
  vec3 c = stripMix(j, uv, 0.0);
  float dw = max(aw / STEP, 1e-4);
  float edge = min(abs(cu - (0.5 - PICF * 0.5)), abs(cu - (0.5 + PICF * 0.5)));
  float ink = 1.0 - smoothstep(0.6 * dw, 1.6 * dw, edge);
  c = mix(c, INK, ink * 0.6);
  return vec4(c, max(inPic, ink * 0.6));
}

// 视镜（R 单位的 X, Y；px = 一个设备像素多少 R）
vec4 scope(float X, float Y, float px, vec2 uv, float paper) {
  float sweep = clamp(abs(uVel) / 120.0, 0.0, 0.09);
  vec4 col = tex(tBack, uv);
  over(col, tex(tInside, uv));

  // 后半圈内壁的画片
  float zw = -sqrt(max(RI * RI - X * X, 0.0));
  float yw = (zw * S - Y) / C;
  if (abs(X) < RI && yw > B0 && yw < B1) {
    float a0 = atan(X, zw) - uPhi;
    float v = (yw - B0) / (B1 - B0);
    float aw = px / max(abs(zw), 0.05);
    vec4 p = vec4(0.0);
    if (sweep == 0.0) p = wallPic(mod(a0, TAU), v, aw);
    else { for (int i = 0; i < 4; i++) p += wallPic(mod(a0 + sweep * (float(i) / 3.0 - 0.5), TAU), v, aw); p *= 0.25; }
    vec3 sh = texture(tShade, uv).rgb;
    vec3 c = p.rgb * sh * (1.0 + 0.04 * paper);
    over(col, vec4(c * p.a, p.a));
  }

  // 镜柱（上线前小修）：不画 12 边形顶面了（像一块方盖压在画上）——镜面上沿之上只有一道约 6 px 的漆木压条，上面就是筒里的后壁
  vec2 q = vec2(X, Y);
  float apo = RM * cos(HALF);
  float bandY = 6.0 / uR / C;                       // 压条高（R 单位，设计稿 6 px）
  float hitK = -1.0, th = 0.0, fu = 0.0, xl = 0.0, xr = 0.0;
  for (int k = 0; k < 12; k++) {
    float t = uPhi + (float(k) + 0.5) * STEP;
    if (cos(t) <= 0.0) continue;
    float a = RM * sin(t - HALF), b = RM * sin(t + HALF);
    if (X >= a && X < b) { hitK = float(k); th = t; fu = (X - a) / (b - a); xl = a; xr = b; break; }
  }
  if (hitK >= 0.0) {
    float z = (apo - X * sin(th)) / cos(th);
    float y = (z * S - Y) / C;
    if (y > 0.0 && y < M1 + bandY) {
      vec2 fq = vec2(fu, y) + hitK * 3.7;
      float fw = xr - xl;
      float seam = min(fu, 1.0 - fu) * fw / px;
      vec3 c;
      float inkA = 0.85;
      vec3 n = vec3(sin(th), 0.0, cos(th));
      float lam = clamp(dot(n, uL), 0.0, 1.0);
      if (y >= M1) {
        // 压条：和底座受光面同一级的漆木，一层罩染 + 上下墨线
        float sh = tone(lam * 0.9 + 0.22, fq * 0.6);
        float var = 1.0 + 0.36 * (fbm(fq * 3.0) - 0.5) + 0.22 * (fbm(fq * 12.0) - 0.5);
        c = uLampC * exp(-(uLacq * var * 0.9 + uShadow * sh));
        float dTop = (M1 + bandY - y) * C / px;
        c = mix(c, INK, (1.0 - smoothstep(0.4, 1.4, dTop)) * 0.9);
        inkA = 0.7;
      } else if (y >= M0) {
        // 镜面：正中那一帧的虚像（停在轴上，宽 IW）
        float ui = X / IW + 0.5;
        float vm = (y - M0) / (M1 - M0);
        float inside = step(0.0, ui) * step(ui, 1.0);
        vec3 pic = stripMix(uKc, vec2(ui, 1.0 - vm), 0.0);
        // 两侧的镜子：同一帧的暗淡虚像（约正中的 35 %），每面镜子里各映一小幅
        float uiF = (X - 0.5 * (xl + xr)) / max(fw * 1.5, 1e-3) + 0.5;
        vec3 side = stripMix(uKc, vec2(clamp(uiF, 0.0, 1.0), 1.0 - vm), 0.5) * 0.35 + vec3(0.05, 0.045, 0.045);
        c = mix(side, pic, inside);
        c *= 0.80 + 0.20 * pow(cos(th), 2.0);
        float edgeD = min(min(fu, 1.0 - fu) * 2.2, min(vm, 1.0 - vm) * 3.0);
        float tarn = smoothstep(0.62, 0.95, fbm(fq * vec2(5.0, 7.0)) + (0.26 - edgeD) * 1.1 + (1.0 - inside) * 0.08);
        c = c * vec3(0.93, 0.90, 0.85) * (1.0 - 0.35 * tarn) + vec3(0.09, 0.075, 0.06) * tarn * 0.5;
        c *= 1.0 + 0.03 * paper;
        inkA = mix(0.85, 0.45, inside);
      } else {
        float sh = tone(lam * 0.9 + 0.05, fq * 0.6);
        float var = 1.0 + 0.36 * (fbm(fq * 3.0) - 0.5) + 0.22 * (fbm(fq * 12.0) - 0.5);
        c = uLampC * exp(-(uLacq * var + uShadow * sh));
      }
      float inkL = (1.0 - smoothstep(0.35, 1.25, seam)) * inkA;
      float dyb = min(abs(y - M0), abs(y - M1)) * C / px;
      inkL = max(inkL, (1.0 - smoothstep(0.4, 1.3, dyb)) * 0.85);
      c = mix(c, INK, inkL);
      over(col, vec4(c, 1.0));
    }
  }

  // 筒身外面（前半圈）的彩绘纸
  if (abs(X) < 1.0) {
    float zo = sqrt(1.0 - X * X);
    float yo = (zo * S - Y) / C;
    if (yo > 0.0 && yo < H) {
      float a0 = atan(X, zo) - uPhi;
      float v = clamp((yo - HOOP) / (H - 2.0 * HOOP), 0.0, 1.0);
      vec3 c = vec3(0.0);
      if (sweep == 0.0) c = texture(tOuter, vec2(fract(a0 / TAU), 1.0 - v)).rgb;
      else { for (int i = 0; i < 4; i++) c += texture(tOuter, vec2(fract((a0 + sweep * (float(i) / 3.0 - 0.5)) / TAU), 1.0 - v)).rgb; c *= 0.25; }
      c *= texture(tShade, uv).rgb * (1.0 + 0.04 * paper);
      float aa = clamp((1.0 - abs(X)) / px, 0.0, 1.0);
      over(col, vec4(c * aa, aa));
    }
  }
  over(col, tex(tFront, uv));
  return col;
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 d = (css - uOff) / uK;                         // 设计稿坐标
  float pxD = 1.0 / (uK * uDpr);                      // 一个设备像素多少设计稿像素
  float paper = texture(tPaper, gl_FragCoord.xy / 320.0).r - 0.5;
  // 背景（K4 迷宫，压暗失焦）也画在这张画布上：投影要像光一样落在树篱上（乘上去，树篱的纹理透出来）
  vec4 col = vec4(texture(tBg, (d - uBgBox.xy) / uBgBox.zw).rgb, 1.0);

  // ① 墙上的投影
  if (uProjA > 0.001) {
    vec2 pu = (d - uProj.xy) / uProj.zw;
    if (pu.x > -0.15 && pu.x < 1.15 && pu.y > -0.15 && pu.y < 1.15) {
      // 水彩晕染的软边：圆角矩形距离 + 两层噪声，边缘往里 8–14 %
      vec2 e = abs(pu - 0.5) * 2.0;
      float edgeN = (fbm(d * 0.012) - 0.5) * 0.22 + (fbm(d * 0.05 + 7.0) - 0.5) * 0.06;
      float m = 1.0 - smoothstep(0.80 + edgeN, 1.02 + edgeN, max(length(max(e - 0.55, 0.0)) / 0.45, max(e.x, e.y) * 0.86));
      float bloom = exp(-abs(max(e.x, e.y) * 0.86 - (0.84 + edgeN)) / 0.03) * 0.08;
      vec3 pic = stripMix(uKc, clamp(pu, 0.0, 1.0), 1.2);
      vec3 warm = pic * vec3(1.0, 0.86, 0.66);
      float a = uProjA * clamp(m - bloom, 0.0, 1.0) * (1.0 + 0.06 * paper);
      // 投出来的光：亮处把树篱照亮、暗处几乎不变（乘法 + 一点加光），边缘按 a 融回去
      vec3 lightOn = col.rgb * (0.55 + 2.6 * warm) + warm * 0.10;
      col.rgb = mix(col.rgb, lightOn, a);
    }
  }

  // ② 视镜
  vec2 rq = (d - uOrigin) / uR;
  if (rq.x > uBox.x && rq.x < uBox.z && rq.y > uBox.y && rq.y < uBox.w) {
    vec2 uv = (rq - uBox.xy) / (uBox.zw - uBox.xy);
    over(col, scope(rq.x, rq.y, pxD / uR, uv, paper));
  }

  // ③ 点灯：没亮到的地方是夜色（暗梅紫，约 .84），亮的前沿像水彩化开
  if (uLit < 1.0) {
    float dist = length(d - uLampP);
    float reach = uLit * 2450.0;
    float n = (fbm(d * 0.004) - 0.5) * 380.0 + (fbm(d * 0.02 + 3.0) - 0.5) * 70.0;
    float lit = 1.0 - smoothstep(-70.0, 70.0, dist + n - reach);
    float rim = exp(-abs(dist + n - reach) / 40.0) * 0.10 * step(0.001, uLit);
    float dark = (1.0 - lit) * 0.84 + rim;
    vec4 night = vec4(vec3(0.045, 0.038, 0.058) * dark, dark);
    over(col, night);
  }
  o = col;
}`;function a(e){let t=e=>e.toFixed(4);return i.replace(`__RI__`,t(e.drum.inner)).replace(`__H__`,t(e.drum.h)).replace(`__HOOP__`,t(e.drum.hoop)).replace(`__B0__`,t(e.drum.band[0])).replace(`__B1__`,t(e.drum.band[1])).replace(`__RM__`,t(e.prism.rm)).replace(`__M0__`,t(e.prism.mirror[0])).replace(`__M1__`,t(e.prism.mirror[1])).replace(`__IW__`,t(e.prism.image))}var o=r.geo,s=1440,c=900,ee=1.75,l=Math.PI*2,u=l/12,te=l,ne=.45,re=.35,ie=.62,d=.3,ae=1<<22,oe=`/selector/praxi/`,f=`praxi:intro`,p=4,m=()=>new Promise(e=>requestAnimationFrame(()=>e())),h=e=>{let t=window.__selEv;t&&t.push([e,performance.now()])},se=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`,g=e=>[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255),ce=[1,.925,.81],le=e=>g(e).map(e=>-Math.log(Math.max(e,.02))),ue=e=>g(e).map((e,t)=>-Math.log(Math.max(e/ce[t],.02))),de=()=>{try{return sessionStorage.getItem(f)===`1`}catch{return!1}},fe=()=>{try{sessionStorage.setItem(f,`1`)}catch{}};async function pe(i){let{root:l}=i,f=i.works,g=f.length,pe=l.querySelector(`.px-gl`),_=l.querySelector(`.px-rackset`),v=[...l.querySelectorAll(`.px-roll`)],me=[...l.querySelectorAll(`.px-label`)],he=[...l.querySelectorAll(`.px-cap`)];l.classList.add(`is-warm`);let y=document.createElement(`canvas`);y.style.opacity=`0`,pe.appendChild(y);let b=y.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,powerPreference:`high-performance`});if(!b)throw y.remove(),Error(`没有 WebGL2`);let x=!1,ge=b.getExtension(`KHR_parallel_shader_compile`),_e=(e,t)=>{let n=b.createShader(e);return b.shaderSource(n,t),b.compileShader(n),n},ve=_e(b.VERTEX_SHADER,se),ye=_e(b.FRAGMENT_SHADER,a(o)),S=b.createProgram();if(b.attachShader(S,ve),b.attachShader(S,ye),b.linkProgram(S),ge)for(;!b.getProgramParameter(S,ge.COMPLETION_STATUS_KHR);)await m();if(!b.getProgramParameter(S,b.LINK_STATUS)){let e=b.getShaderInfoLog(ye)||b.getProgramInfoLog(S);throw y.remove(),Error(`视镜着色器：`+e)}b.useProgram(S);let be=b.createBuffer();b.bindBuffer(b.ARRAY_BUFFER,be),b.bufferData(b.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),b.STATIC_DRAW);let xe=b.getAttribLocation(S,`aPos`);b.enableVertexAttribArray(xe),b.vertexAttribPointer(xe,2,b.FLOAT,!1,0,0);let C=new Proxy({},{get:(e,t)=>t in e?e[t]:e[t]=b.getUniformLocation(S,t)});b.pixelStorei(b.UNPACK_ALIGNMENT,1),b.uniform3fv(C.uL,o.light),b.uniform3fv(C.uLacq,ue(`#7e4636`)),b.uniform3fv(C.uShadow,le(`#7a7090`)),b.uniform3fv(C.uLampC,ce),b.uniform2f(C.uOrigin,o.origin[0],o.origin[1]),b.uniform1f(C.uR,o.R),b.uniform4f(C.uBox,o.box[0],o.box[1],o.box[2],o.box[3]),b.uniform4f(C.uProj,o.proj[0],o.proj[1],o.proj[2],o.proj[3]),b.uniform2f(C.uLampP,o.lamp[0],o.lamp[1]),b.uniform4f(C.uBgBox,o.bg.x0,o.bg.y0,o.bg.w,o.bg.h);let Se=[],w=(e,t,n,r,i=b.CLAMP_TO_EDGE,a=b.CLAMP_TO_EDGE)=>{let o=b.createTexture();return Se.push(o),b.activeTexture(b.TEXTURE0+e),b.bindTexture(b.TEXTURE_2D,o),b.texStorage2D(b.TEXTURE_2D,r,b.RGBA8,t,n),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,r>1?b.LINEAR_MIPMAP_LINEAR:b.LINEAR),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.LINEAR),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,i),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,a),{t:o,unit:e,levels:r}},T=0,Ce=async(e,t)=>{let n=[t.data,...t.mips??[]],r=t.w,i=t.h;for(let t=0;t<n.length&&t<e.levels;t++){let a=r*4,o=Math.max(1,Math.floor(ae/a));for(let s=0;s<i;s+=o){let c=Math.min(o,i-s);if(b.activeTexture(b.TEXTURE0+e.unit),b.bindTexture(b.TEXTURE_2D,e.t),b.texSubImage2D(b.TEXTURE_2D,t,0,s,r,c,b.RGBA,b.UNSIGNED_BYTE,n[t].subarray(s*a,(s+c)*a)),T+=c*a,T>=ae&&(T=0,await m(),x))throw Error(`closed`)}r=Math.max(1,r>>1),i=Math.max(1,i>>1)}},we=(e,t)=>Math.floor(Math.log2(Math.max(e,t)))+1,[E,D]=o.tex,Te=r.strips.fw*12,Ee=r.strips.fh*12,O=await Promise.all([...[[`back.webp`,!1],[`inside.webp`,!1],[`front.webp`,!1],[`shade.webp`,!1],[`outer.webp`,!1],[`strips.webp`,!0]].map(([e,t])=>n(oe+e,{premul:!1,mips:t})),n(`/paper/cold-press-soft.png`,{premul:!1}),n(oe+`bg.webp`,{premul:!1})]);if(x)throw Error(`closed`);let De=[w(0,E,D,1),w(1,E,D,1),w(2,E,D,1),w(3,E,D,1),w(4,O[4].w,O[4].h,1,b.REPEAT),w(5,Te,Ee,we(Te,Ee)),w(6,O[6].w,O[6].h,1,b.REPEAT,b.REPEAT),w(7,O[7].w,O[7].h,1)];[[`tBack`,0],[`tInside`,1],[`tFront`,2],[`tShade`,3],[`tOuter`,4],[`tStrips`,5],[`tPaper`,6],[`tBg`,7]].forEach(([e,t])=>b.uniform1i(C[e],t));for(let e=0;e<O.length;e++)await Ce(De[e],O[e]);await Promise.all([`rack.webp`,`rolls.webp`].map(e=>{let t=new Image;return t.src=oe+e,t.decode().catch(()=>{})}));let k=1,A=1,Oe=0,ke=0,Ae=()=>{k=Math.min(innerWidth/s,innerHeight/c),A=Math.min(devicePixelRatio||1,ee),Oe=(innerWidth-s*k)/2,ke=(innerHeight-c*k)/2,l.style.setProperty(`--k`,k.toFixed(4)),y.width=Math.round(innerWidth*A),y.height=Math.round(innerHeight*A),b.viewport(0,0,y.width,y.height),G()},j=Math.max(0,f.findIndex(e=>e.id===i.startAt)),M=f[j].row,N=f[j].row,P={s:.5*u,v:0},F={v:1},I={a:0},L={v:0},R=!1,z=null,B=null,V=null,H=`idle`,je=()=>(Math.round(P.s/u-.5)%12+12)%12,Me=e=>{he.forEach((t,n)=>t.classList.toggle(`is-cur`,n===e)),me.forEach((t,n)=>t.classList.toggle(`is-cur`,n===e)),v.forEach((t,n)=>{t.classList.toggle(`is-cur`,n===e),t.setAttribute(`aria-current`,n===e?`true`:`false`)})};Me(j);let U=0,W=0,G=()=>{x||(b.uniform2f(C.uRes,y.width,y.height),b.uniform1f(C.uDpr,A),b.uniform1f(C.uK,k),b.uniform2f(C.uOff,Oe,ke),b.uniform1f(C.uPhi,-P.s),b.uniform1f(C.uVel,-P.v),b.uniform1f(C.uRow,N),b.uniform1f(C.uRowB,M),b.uniform1f(C.uMix,F.v),b.uniform1f(C.uKc,je()),b.uniform1f(C.uProjA,I.a),b.uniform1f(C.uLit,L.v),b.drawArrays(b.TRIANGLES,0,3))},Ne=()=>R||P.v>.001||!!z?.isActive()||F.v<1||e.isTweening(I)||e.isTweening(L)||!!V?.isActive(),Pe=e=>{let t=Math.min(.05,W?(e-W)/1e3:1/60);W=e,z?.isActive()||(P.s+=P.v*t),G(),Ne()?U=requestAnimationFrame(Pe):(U=0,W=0)},K=()=>{!U&&!x&&(W=0,U=requestAnimationFrame(Pe))},q=(t,n)=>{e.killTweensOf(I),e.to(I,{a:t,duration:n,ease:`sine.inOut`}),K()},Fe=()=>{R||(R=!0,z?.kill(),z=null,B?.kill(),B=e.to(P,{v:te,duration:ne*(1-P.v/te),ease:`power1.in`}),q(ie,.4),K())},Ie=(t,n)=>{B?.kill();let r=Math.max(P.v,.5),i=(Math.ceil((P.s+t)/u-.5)+.5)*u,a=2*(i-P.s)/r;e.killTweensOf(P,`v`),z=e.to(P,{s:i,duration:a,ease:`power1.out`,onComplete:()=>{P.v=0,q(d,1.6),n?.()}}),e.to(P,{v:0,duration:a,ease:`none`}),K()},Le=()=>{R&&(R=!1,P.v<.001?(B?.kill(),P.v=0,q(d,1.6)):Ie(P.v*.28))},J=t=>{t===j||t<0||t>=g||(M=N,j=t,N=f[t].row,Me(t),i.onChange(f[t].id),F.v=0,e.killTweensOf(F),e.to(F,{v:1,duration:re,ease:`none`}),K())},Re=Math.hypot(1172-o.lamp[0],560-o.lamp[1])/2450,Y=e=>_.style.setProperty(`--lit`,e.toFixed(3)),X=()=>{V&&(V.kill(),V=null,e.killTweensOf(P),e.killTweensOf(L),z=null,B=null,R=!1,L.v=1,Y(1),P.v=0,P.s=(Math.round(P.s/u-.5)+.5)*u,M=N=f[j].row,F.v=1,I.a=Math.max(I.a,d),q(d,.8),l.classList.add(`is-labels`),H=`ready`,l.classList.add(`is-ready`),Be(),G(),He())},Z=e=>{V&&e.key!==`Escape`&&X()},ze=()=>{l.addEventListener(`pointerdown`,Z,!0),l.addEventListener(`keydown`,Z,!0)},Be=()=>{l.removeEventListener(`pointerdown`,Z,!0),l.removeEventListener(`keydown`,Z,!0)},Ve=t=>new Promise(n=>{ze();let r=e.timeline({onComplete:()=>{V=null,Be(),n()}});V=r;let i=f[j].row;if(t){Y(1),r.to(L,{v:1,duration:.25,ease:`sine.out`},0);let e=P.s;r.to(P,{s:e+Math.PI,duration:.8,ease:`power2.inOut`},0),r.to(I,{a:d,duration:.6,ease:`sine.inOut`},.1),r.call(()=>l.classList.add(`is-labels`),[],.45)}else{Y(.16),r.to(L,{v:1,duration:.85,ease:`sine.out`},.15),r.call(()=>{_.style.transition=`filter .4s linear`,Y(1)},[],.15+.85*Math.min(1,Re*1.15)),r.to(P,{v:te*2,duration:.35,ease:`power1.in`},.15),r.to(I,{a:ie,duration:.5,ease:`sine.inOut`},.3);for(let e=0;e<12;e++)r.call(()=>{M=N=(i+1+e)%12,F.v=1,K()},[],.35+e*.1);r.call(()=>{M=N=i,Ie(P.v*.25,()=>l.classList.add(`is-labels`))},[],1.55),r.to({},{duration:.85},1.55)}K()}),He=()=>{let e=v.find(e=>e.matches(`:hover`))??v.find(e=>e===document.activeElement);e&&H===`ready`&&(J(Number(e.dataset.i)),Fe())},Q=e=>{V&&H===`entering`&&X(),H===`ready`&&(J(Number(e.currentTarget.dataset.i)),Fe())},$=()=>{H===`ready`&&Le()},Ue=e=>{let t=Number(e.currentTarget.dataset.i);J(t),Ge(f[t])};v.forEach(e=>{e.addEventListener(`pointerenter`,Q),e.addEventListener(`pointerleave`,$),e.addEventListener(`focus`,Q),e.addEventListener(`blur`,$),e.addEventListener(`click`,Ue)});let We=e=>{if(H!==`ready`)return;let t=v.indexOf(document.activeElement),n=t>=0?t:j,r=-1;e.key===`ArrowRight`?r=(n+1)%g:e.key===`ArrowLeft`?r=(n-1+g)%g:e.key===`ArrowDown`?r=n+p<g?n+p:n:e.key===`ArrowUp`&&(r=n>=p?n-p:n),!(r<0)&&(e.preventDefault(),v[r]?.focus())};l.addEventListener(`keydown`,We);let Ge=e=>{if(H!==`ready`)return;H=`opening`,h(`open`);let n=Oe+o.origin[0]*k,r=ke+(o.origin[1]-.6*o.R)*k,i=getComputedStyle(document.documentElement).getPropertyValue(`--color-night-veil`).trim()||`#3A3448`;t(e.href,{x:n,y:r},i)};Ae(),addEventListener(`resize`,Ae),await m(),y.style.opacity=``;let Ke=matchMedia(`(prefers-reduced-motion: reduce)`).matches,qe={async enter(){if(H=`entering`,h(`enter`),await m(),await m(),l.classList.add(`is-shown`),Ke)L.v=1,I.a=d,Y(1),l.classList.add(`is-labels`),G();else{let e=de()||!!i.startAt;fe();let t=Ve(e);h(`enter:ready`),await t}H===`entering`&&(H=`ready`,l.classList.add(`is-ready`)),h(`intro:end`),He()},leave(){return H=`leaving`,V&&X(),H=`leaving`,Le(),l.classList.remove(`is-ready`),l.classList.add(`is-leaving`),h(`leave`),new Promise(e=>setTimeout(()=>{h(`leave:end`),e()},420))},select:Ge,destroy(){x=!0,cancelAnimationFrame(U),V?.kill(),Be(),z?.kill(),B?.kill(),e.killTweensOf([P,F,I,L]),removeEventListener(`resize`,Ae),l.removeEventListener(`keydown`,We),v.forEach(e=>{e.removeEventListener(`pointerenter`,Q),e.removeEventListener(`pointerleave`,$),e.removeEventListener(`focus`,Q),e.removeEventListener(`blur`,$),e.removeEventListener(`click`,Ue)}),l.classList.remove(`is-ready`,`is-leaving`,`is-shown`,`is-labels`,`is-warm`),_.style.removeProperty(`--lit`),_.style.transition=``,y.style.opacity=`0`;let t=[...Se],n=()=>{for(let e=0;e<2&&t.length;e++)b.deleteTexture(t.shift());t.length?requestAnimationFrame(n):(b.deleteBuffer(be),b.deleteProgram(S),b.deleteShader(ve),b.deleteShader(ye),b.getExtension(`WEBGL_lose_context`)?.loseContext(),y.remove())};requestAnimationFrame(n)}};return window.__px={phase:()=>H,spin:P,mix:F,proj:I,lit:L,setCur:J,startSpin:Fe,stopSpin:Le,finishIntro:X,pose:t=>{V?.kill(),V=null,e.killTweensOf([P,F,I,L]),z=null,B=null,R=!1,t.i!==void 0&&(j=t.i,Me(t.i),M=N=f[t.i].row),t.row!==void 0&&(M=N=t.row),F.v=1,P.v=t.v??0,P.s=t.s??((t.frame??10)+.5)*u,t.proj!==void 0&&(I.a=t.proj),t.lit!==void 0&&(L.v=t.lit),G()},rackLit:Y,drawNow:G,stop:()=>{cancelAnimationFrame(U),U=0},gsap:e},qe}export{pe as createSelector};