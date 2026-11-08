import{J as e,M as t,S as n,V as r,X as i,Y as a,at as o,et as s,f as c,it as l,k as u,l as d,n as f,ot as p,p as m,q as h,rt as g,st as _,tt as v}from"./three.module.kGeHQt35.js";import{_ as y,h as b,x}from"./album.DJ6X_OtZ.js";import{t as S}from"./config.DTnYZcwR.js";import{t as C}from"./noise.BiYsHKpx.js";var w=`// 全屏平面：PlaneGeometry(2, 2) 的顶点已经在裁剪空间里，不需要相机矩阵
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,T=`// Flowmap 更新（ping-pong）：RG = 速度（uv / s），B = 颜料浓度。
// 顺着自身速度平流 → 颜料向四周化开 → 帧率无关的衰减 → 沿光标这一帧走过的线段盖章。
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform float uAspect;  // 宽 / 高：盖章半径按视口高度计
uniform vec2 uA;        // 光标上一帧位置（uv，左下原点）
uniform vec2 uB;        // 光标这一帧位置
uniform vec2 uVel;      // 光标速度（uv / s）
uniform float uStamp;   // 盖章强度 0–1（速度 × 镜头运动减弱）
uniform float uRadius;
uniform float uInk;
uniform float uDt;
uniform vec2 uDecay;    // 每 1/60 s 的保留率（速度，颜料）
varying vec2 vUv;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float k = uDt * 60.0;
  vec2 v0 = texture2D(uPrev, vUv).rg;
  vec2 back = vUv - v0 * uDt * 0.08;
  vec4 c = texture2D(uPrev, back);
  float around =
    texture2D(uPrev, back + vec2(uTexel.x, 0.0)).b +
    texture2D(uPrev, back - vec2(uTexel.x, 0.0)).b +
    texture2D(uPrev, back + vec2(0.0, uTexel.y)).b +
    texture2D(uPrev, back - vec2(0.0, uTexel.y)).b;

  // 化开：向邻域平均靠拢
  float ink = mix(c.b, around * 0.25, clamp(0.07 * k, 0.0, 1.0));
  vec2 vel = c.rg * pow(uDecay.x, k);
  ink *= pow(uDecay.y, k);

  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  float d = segDist(p, vec2(uA.x * uAspect, uA.y), vec2(uB.x * uAspect, uB.y));
  float g = exp(-(d * d) / (uRadius * uRadius)) * uStamp;
  // 速度：盖章处直接换成光标速度（不累加，免得越推越快把颜料吹散）
  vel = clamp(mix(vel, uVel, clamp(g, 0.0, 1.0)), -2.0, 2.0);
  ink = min(ink + g * uInk * k, 1.0);

  gl_FragColor = vec4(vel, ink, 1.0);
}
`,E=`// 每帧的合成：帧画面（或纯纸面）→ 毛边 → 压暗 → 色调 / 暗角 / 纸纹 →（图册纸页）→（颜料拖尾）→（悬停晕染）。
// 毛边、去水印块、暗角、纸纹都是静态的，已由 bake.frag 预先渲染进 uStatic；平时每帧只有
// 两次贴图采样（帧画面 + uStatic）和几次混合。图册纸页、悬停晕染用 uniform 判断，没在用时整段跳过。
// 坐标：px = 屏幕 CSS 像素，左上原点（和 DOM 一致）；vUv 是 GL 的左下原点（Flowmap 用它）。
uniform vec2 uView;
uniform float uTime;

uniform sampler2D uScene;   // 帧序列播放器的两块图层画布（flipY = false：v = 0 是顶边）：相邻两帧
uniform sampler2D uScene2;
uniform float uMix;         // uScene2 的权重（滚动进度落在两帧之间的比例）
uniform vec4 uReveal;       // 开屏 09 → K0：晕染原点 xy（px）、进度、覆盖全屏所需半径（px）；w = 0 时不用，按 uMix 混合
uniform float uHasScene;    // 0 = 纸面模式（作品页 / 帧序列还没就绪）
uniform sampler2D uStatic;  // bake.frag 的结果
uniform vec3 uPaper;        // 纸色（--veil）
uniform vec4 uTint;         // 整页色调（--tint），rgb 线性 + a
uniform float uDim;         // 图册打开时压暗花园

uniform sampler2D uFlow;
uniform vec2 uFlowTexel;
uniform vec3 uPaint;        // 颜料色（--paint）
uniform float uPaintMode;   // 0 = 减色（日间），1 = 提亮（第 Ⅳ 章）
uniform float uPaintGain;
uniform float uWarp;

uniform vec4 uBloom[4];     // 中心 xy（px）、半径（px）、强度
uniform vec3 uBloomColor[4];
uniform float uBloomActive; // 有任何一个槽在用

uniform vec4 uSheet;        // 图册纸页矩形 x, y, w, h（px）
uniform vec4 uBleed;        // 晕染原点 xy（px）、进度、覆盖整页所需半径（px）
uniform float uBleedDir;    // 0 = 展开，1 = 收回
uniform vec3 uSheetColor;

varying vec2 vUv;

const vec3 SEPIA = vec3(0.0194, 0.0137, 0.0098); // #2A221C，线性

vec3 pigment(vec3 base, vec3 paint, float d) {
  vec3 day = base * mix(vec3(1.0), paint, d);
  vec3 night = mix(base, paint, d * 0.3); // 浅色颜料盖在夜色上很显眼，只用薄薄一层
  return mix(day, night, uPaintMode);
}

// 晕染的轮廓（图册纸页和开屏 09 → K0 共用）：离原点的归一化距离 + 低频噪声 + 一点纸纹颗粒
float bleedField(vec2 px, vec2 origin, float far, float seed, float g) {
  float d = length(px - origin) / far;
  return d + (fbm(px / 220.0 + seed) - 0.5) * 0.36 + (vnoise(px / 40.0) - 0.5) * 0.06 + g * 0.45;
}
// 进度 p 时的阈值：p = 0 时谁都盖不住，p = 1 时盖满（含噪声余量）
float bleedThreshold(float p) { return p * 1.35 - 0.12 * (1.0 - p); }

float sdBox(vec2 p, vec2 halfSize) {
  vec2 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uView;
  vec4 st = texture2D(uStatic, vUv);
  float m = st.r;                 // 画面可见度（毛边 × 去水印块）
  float mult = st.g * 0.6 + 0.7;  // 纸纹倍数
  float vig = st.b;               // 暗角
  float g = st.a - 0.5;           // 纸纹起伏

  // ── Flowmap：颜料浓度、水渍深边、扭动（PAINT_TRAIL / RIPPLE 开关见 src/gl/config.ts，关掉的部分编译时就去掉） ──
  vec2 wpx = px;
#if PAINT_TRAIL || RIPPLE
  vec4 flow = texture2D(uFlow, vUv);
  float ink = clamp(flow.b, 0.0, 1.0);
  vec2 grad = vec2(
    texture2D(uFlow, vUv + vec2(uFlowTexel.x, 0.0)).b - texture2D(uFlow, vUv - vec2(uFlowTexel.x, 0.0)).b,
    texture2D(uFlow, vUv + vec2(0.0, uFlowTexel.y)).b - texture2D(uFlow, vUv - vec2(0.0, uFlowTexel.y)).b
  );
#endif
#if RIPPLE
  vec2 warp = (flow.rg * 0.005 + grad * 0.004) * uWarp;
  wpx += vec2(warp.x, -warp.y) * uView;
#endif

  // ── 画面 ──
  vec3 col = uPaper;
  if (uHasScene > 0.0) {
    // 播放器的画布已经按 cover 裁成视口大小
    vec2 suv = clamp(wpx / uView, 0.0, 1.0);
    float w = uMix;
    if (uReveal.w > 0.0) {
      float th = bleedThreshold(uReveal.z);
      w = 1.0 - smoothstep(th - 0.05, th, bleedField(px, uReveal.xy, uReveal.w, 2.1, g));
    }
    vec3 scene = mix(texture2D(uScene, suv).rgb, texture2D(uScene2, suv).rgb, w);
    // 颜料在毛边处淤积，略深一点
    float pool = smoothstep(0.05, 0.35, m) * (1.0 - smoothstep(0.35, 0.9, m));
    scene *= 1.0 - 0.08 * pool;
    col = mix(uPaper, scene, m * uHasScene);
  }

  // 图册打开：花园压暗、略去饱和
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, mix(vec3(lum), col, 0.85) * 0.78, uDim);

  // 色调 + 极淡暗角（原 body::after）
  col = mix(col, col * uTint.rgb, uTint.a);
  col = mix(col, col * SEPIA, 0.14 * vig);
  col *= mult; // 纸纹

  // ── 图册纸页：从点击处晕开 ──
  if (uBleed.z > 0.0) {
    float p = uBleed.z;
    // 低频噪声决定渗开的轮廓，纸纹只在边上留一点颗粒
    float f = bleedField(px, uBleed.xy, uBleed.w, uBleedDir * 5.3, g);
    float th = bleedThreshold(p);
    float cover = 1.0 - smoothstep(th - 0.05, th, f);
    vec2 halfSize = uSheet.zw * 0.5;
    vec2 center = uSheet.xy + halfSize;
    float inRect = 1.0 - smoothstep(-0.5, 0.5, sdBox(px - center, halfSize));
    // 纸页投影（原 box-shadow: 0 30px 80px -30px）
    float sd = sdBox(px - center - vec2(0.0, 30.0), halfSize - 30.0);
    col = mix(col, col * SEPIA, 0.32 * (1.0 - smoothstep(-40.0, 45.0, sd)) * smoothstep(0.25, 1.0, p) * (1.0 - inRect));

    float a = cover * inRect;
    float rim = smoothstep(th - 0.1, th - 0.02, f) * a * (1.0 - smoothstep(0.8, 1.0, p));
    vec3 sheet = uSheetColor * (1.0 + (mult - 1.0) * 0.6); // 纸页上放作品，纸纹淡一点
    sheet = mix(sheet, sheet * SEPIA, rim * mix(0.22, 0.14, uBleedDir));
    col = mix(col, sheet, a);
  }

  float gran = clamp(0.85 + g * 3.5, 0.4, 1.2);
#if PAINT_TRAIL
  // ── 颜料拖尾：水把底下的颜色冲淡一点 → 透明颜料染色 → 水渍深边，纸纹调制出颗粒 ──
  float rim = clamp(length(grad) * 6.0, 0.0, 1.0) * smoothstep(0.0, 0.08, ink);
  float wet = smoothstep(0.02, 0.4, ink) * uPaintGain; // 薄薄一层颜料也要看得出，浓了不再加深
  col = mix(col, mix(col, uPaper, 0.5), wet * 0.1 * (1.0 - uPaintMode));
  // 透明颜料：按颜料色相过滤（饱和一点，压在同色系的画面上也看得出），夜间直接是浅色颜料
  vec3 hue = uPaint / max(max(uPaint.r, uPaint.g), max(uPaint.b, 1e-3));
  col = pigment(col, mix(hue * hue, uPaint, uPaintMode), wet * 0.6 * gran);
  col = pigment(col, uPaint, rim * 0.7 * uPaintGain * gran);
#endif

#if HOVER_BLOOM
  // ── 悬停晕染 ──
  if (uBloomActive > 0.0) for (int i = 0; i < 4; i++) {
    vec4 b = uBloom[i];
    if (b.w <= 0.001) continue;
    float bd = length(px - b.xy) / max(b.z, 1.0);
    if (bd > 1.6) continue;
    float bf = bd + (fbm(px / 55.0 + float(i) * 13.1) - 0.5) * 0.45 + g * 1.2;
    float body = 1.0 - smoothstep(0.8, 1.0, bf);
    float edge = smoothstep(0.68, 0.95, bf) * body;
    col = pigment(col, uBloomColor[i], (body * 0.22 + edge * 0.3) * b.w * gran);
  }
#endif

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`,D=`// 纸面里不随时间变化的部分，只在窗口尺寸变化 / 纸纹贴图到了时渲染一次，存进一张贴图（overlay.ts 的 bakeRT）：
//   R = 画面可见度（屏幕边缘噪声毛边 × 右下角去水印块）
//   G = 纸纹倍数（冷压纸牙口 + 低频斑驳），编码为 (倍数 − 0.7) / 0.6
//   B = 暗角强度
//   A = 纸纹起伏 g + 0.5（图册纸页、悬停晕染的颗粒用）
// 每帧的合成（paper.frag）只采样它一次，不再算噪声。
uniform vec2 uView;
uniform vec2 uSceneSize;
uniform vec4 uEdge;
uniform vec4 uMark;
uniform sampler2D uPaperTex;
uniform float uPaperTile;
uniform float uGrain;
varying vec2 vUv;

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uView;
  float g = texture2D(uPaperTex, px / uPaperTile).r - 0.93; // 纸纹起伏，约 −0.15…0.07

  // 屏幕边缘的毛边：只在边缘附近算噪声
  vec2 e = min(vUv, 1.0 - vUv) / uEdge.xy;
  float m = 1.0;
  if (min(e.x, e.y) < 1.6) {
    float jag = (fbm(px / uEdge.w) - 0.5) * uEdge.z + g * 1.5;
    m = smoothstep(0.0, 1.0, e.x + jag) * smoothstep(0.0, 1.0, e.y + jag);
  }
  // 右下角去水印的模糊块：按帧的 cover 换算到图像坐标，整块化进纸里
  float s = max(uView.x / uSceneSize.x, uView.y / uSceneSize.y);
  vec2 iuv = (px - 0.5 * (uView - uSceneSize * s)) / (uSceneSize * s);
  float cl = length((iuv - uMark.xy) / uMark.zw);
  if (cl < 1.3) {
    cl += (fbm(px / 90.0 + 3.7) - 0.5) * 0.35 + g * 2.0;
    m *= smoothstep(0.55, 1.0, cl);
  }

  // 极淡暗角（原 body::after）
  vec2 vq = (vec2(vUv.x, 1.0 - vUv.y) - vec2(0.5, 0.45)) / vec2(1.2, 0.9);
  float vig = clamp((length(vq) - 0.62) / 0.38, 0.0, 1.0);

  // 纸纹：冷压纸牙口 + 低频斑驳
  float cockle = vnoise(px / 380.0) * 0.6 + vnoise(px / 150.0 + 7.0) * 0.4;
  float mult = 1.0 + g * uGrain + (cockle - 0.5) * 0.045;

  gl_FragColor = vec4(m, clamp((mult - 0.7) / 0.6, 0.0, 1.0), vig, clamp(g + 0.5, 0.0, 1.0));
}
`,O=Array.from({length:1024},(e,t)=>{let n=t/1023;return Math.round((n<=.0031308?n*12.92:1.055*n**(1/2.4)-.055)*255)}),k=e=>O[Math.round(Math.min(Math.max(e,0),1)*1023)],A=[.0194,.0137,.0098];function j(e){let t=e.trim(),n=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);if(n){let e=n[1].length===3?[...n[1]].map(e=>e+e).join(``):n[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)).concat(1)}let r=t.match(/-?[\d.]+%?/g);if(!/^rgba?\(/.test(t)||!r||r.length<3)return null;let i=r[3]===void 0?1:r[3].endsWith(`%`)?parseFloat(r[3])/100:parseFloat(r[3]);return[parseFloat(r[0]),parseFloat(r[1]),parseFloat(r[2]),i]}var M=(t,n)=>{let r=new m;return t?r.setRGB(t[0]/255,t[1]/255,t[2]/255,e):r.setStyle(n),r},N=new Map;function P(e){let t=N.get(e);return t||(t=F(e),N.set(e,t)),t}function F(e){let t=document.createElement(`i`);t.hidden=!0,t.dataset.chapter=e,document.body.append(t);let n=getComputedStyle(t),r=j(n.getPropertyValue(`--tint`))??[111,132,102,.1],i={tint:M(r,`#6f8466`),tintA:r[3],paper:M(j(n.getPropertyValue(`--veil`)),`#efe6d2`),paint:M(j(n.getPropertyValue(`--paint`)),`#6f8466`),mode:parseFloat(n.getPropertyValue(`--paint-mode`))||0};return t.remove(),i}var I=class{canvas;hooks;renderer;scene=new a;camera=new d;mesh;flowMat;paperMat;bakeMat;bakeRT;needsBake=!0;paperReady=!1;exportTimer=0;exported=[];flowA;flowB;sceneTex=[null,null];sceneOn=!1;paperTex;running=!0;parked=!1;ticking=!1;dirty=!1;awakeUntil=0;last=performance.now()/1e3;firstFrame=!1;calls=0;frames=0;pointer={x:0,y:0,moved:!1,seen:!1};stampFrom=new l(-1,-1);stampTo=new l;motionAt=-1/0;calm=1;bleeding=!1;blooms=Array.from({length:4},()=>({x:0,y:0,color:new m,t0:-1,released:-1,alive:!1}));chapterObserver;constructor(e,a){this.canvas=e,this.hooks=a,this.renderer=new f({canvas:e,alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:`high-performance`}),this.renderer.extensions,this.renderer.info.autoReset=!1,this.applySize();let s={type:n,minFilter:u,magFilter:u,wrapS:c,wrapT:c,depthBuffer:!1,generateMipmaps:!1},[d,y]=this.flowSize();this.flowA=new _(d,y,s),this.flowB=new _(d,y,s),this.paperTex=new v().load(S.paperUrl,()=>{this.paperReady=!0,this.needsBake=!0,this.invalidate()}),this.paperTex.wrapS=this.paperTex.wrapT=h,this.paperTex.colorSpace=``,this.paperTex.generateMipmaps=!1,this.paperTex.minFilter=u,this.flowMat=new i({vertexShader:w,fragmentShader:C+T,depthTest:!1,depthWrite:!1,uniforms:{uPrev:{value:this.flowA.texture},uTexel:{value:new l(1/d,1/y)},uAspect:{value:innerWidth/innerHeight},uA:{value:new l(-1,-1)},uB:{value:new l(-1,-1)},uVel:{value:new l},uStamp:{value:0},uRadius:{value:S.radius[0]},uInk:{value:S.ink},uDt:{value:1/60},uDecay:{value:new l(S.decayVel,S.decayInk)}}}),this.bakeRT=new _(1,1,{...s,type:g}),this.bakeMat=new i({vertexShader:w,fragmentShader:C+D,depthTest:!1,depthWrite:!1,uniforms:{uView:{value:new l(innerWidth,innerHeight)},uSceneSize:{value:new l(...b)},uEdge:{value:new p(...S.edge)},uMark:{value:new p(...S.mark)},uPaperTex:{value:this.paperTex},uPaperTile:{value:S.paperTile},uGrain:{value:S.grain}}});let x=P(document.documentElement.dataset.chapter??`fountain`);this.paperMat=new i({vertexShader:w,fragmentShader:C+E,defines:{PAINT_TRAIL:0,RIPPLE:0,HOVER_BLOOM:0},depthTest:!1,depthWrite:!1,uniforms:{uView:{value:new l(innerWidth,innerHeight)},uTime:{value:0},uScene:{value:null},uScene2:{value:null},uMix:{value:0},uReveal:{value:new p},uHasScene:{value:0},uStatic:{value:this.bakeRT.texture},uPaper:{value:x.paper},uTint:{value:new p(x.tint.r,x.tint.g,x.tint.b,x.tintA)},uDim:{value:0},uFlow:{value:this.flowB.texture},uFlowTexel:{value:new l(1/d,1/y)},uPaint:{value:x.paint},uPaintMode:{value:x.mode},uPaintGain:{value:1},uWarp:{value:S.warp},uBloom:{value:Array.from({length:4},()=>new p)},uBloomColor:{value:Array.from({length:4},()=>new o)},uBloomActive:{value:0},uSheet:{value:new p},uBleed:{value:new p},uBleedDir:{value:0},uSheetColor:{value:new m}}}),this.mesh=new t(new r(2,2),this.paperMat),this.mesh.frustumCulled=!1,this.scene.add(this.mesh),this.chapterObserver=new MutationObserver(()=>this.onChapter()),this.chapterObserver.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-chapter`]}),addEventListener(`resize`,this.onResize),document.addEventListener(`visibilitychange`,this.onVisibility),e.addEventListener(`webglcontextlost`,this.onLost),e.addEventListener(`webglcontextrestored`,this.onRestored),this.precompile().then(()=>{this.compiled=!0,this.invalidate()})}compiled=!1;async precompile(){let e=this.renderer,n=async(n,r)=>{let i=new a;i.add(new t(this.mesh.geometry,n)),e.setRenderTarget(r);try{await e.compileAsync(i,this.camera)}catch{}e.setRenderTarget(null)};await Promise.all([n(this.bakeMat,this.bakeRT),n(this.paperMat,null),null])}setScene(e){this.sceneOn=e,e||(this.paperMat.uniforms.uHasScene.value=0,this.invalidate())}sceneDrawn(t){if(!this.sceneOn)return;let n=this.paperMat.uniforms;for(let[r,i]of t.layers.entries()){if(!i.width||!i.height)return;let a=this.sceneTex[r],o=a?.image;!a||o!==i||a.userData.w!==i.width||a.userData.h!==i.height?(a?.dispose(),a=new s(i),a.flipY=!1,a.colorSpace=e,a.generateMipmaps=!1,a.minFilter=a.magFilter=u,a.wrapS=a.wrapT=c,a.userData={w:i.width,h:i.height},this.sceneTex[r]=a,(r===0?n.uScene:n.uScene2).value=a,a.needsUpdate=!0):t.changed[r]&&(a.needsUpdate=!0)}n.uMix.value=t.mix,n.uHasScene.value=1,this.invalidate()}get sceneSize(){return[this.canvas.width,this.canvas.height]}setReveal(e,t={x:0,y:0},n=1){let r=this.paperMat.uniforms.uReveal.value;e===null?r.set(0,0,0,0):r.set(t.x,t.y,Math.min(Math.max(e,0),1),Math.max(n,1)),this.invalidate()}setMotion(e){}bloom(e,t,n){return()=>{}}bleed(e,t,n,r){let i=this.paperMat.uniforms,a=Math.min(Math.max(e,0),1);i.uBleed.value.set(t.x,t.y,a,Math.max(r.far,1)),i.uSheet.value.set(r.rect.left,r.rect.top,r.rect.width,r.rect.height),i.uBleedDir.value=n===`in`?0:1,i.uSheetColor.value.copy(M(j(r.color),`#efe6d2`)),i.uDim.value=Math.min(a/.7,1),this.bleeding=a>0,this.invalidate()}clearBleed(){let e=this.paperMat.uniforms;e.uBleed.value.set(0,0,0,1),e.uDim.value=0,this.bleeding=!1,this.invalidate()}info(){return{calls:this.calls,frames:this.frames,textures:this.renderer.info.memory.textures,programs:this.renderer.info.programs?.length??0,dpr:this.renderer.getPixelRatio(),size:[this.canvas.width,this.canvas.height]}}setParked(e){this.parked=e,e?this.stopTicking():this.dirty&&this.startTicking()}setRunning(e){this.running=e,e&&(this.last=performance.now()/1e3,this.invalidate())}tick=()=>{if(!this.running)return this.stopTicking();let e=performance.now()/1e3,t=Math.min(Math.max(e-this.last,1/240),1/20);this.last=e;let n=this.paperMat.uniforms,r=n.uBloom.value,i=n.uBloomColor.value,a=!1;if(this.blooms.forEach((t,n)=>{if(!t.alive){r[n].w=0;return}let o=e-t.t0,s=t.released<0?1:1-(e-t.released)/S.bloomFade;if(s<=0){t.alive=!1,r[n].w=0;return}let c=1-Math.exp(-o*S.bloomGrow);r[n].set(t.x,t.y,S.bloomRadius*(.25+.75*c),Math.min(c*1.6,1)*s),i[n].set(t.color.r,t.color.g,t.color.b),a=!0}),n.uBloomActive.value=+!!a,!this.compiled||!this.paperReady||!this.dirty&&!a&&e>this.awakeUntil)return this.stopTicking();this.dirty=!1,this.needsBake&&this.bake();let o=e-this.motionAt<S.calmDelay,s=o?S.calmMoving:1;this.calm+=(s-this.calm)*(1-Math.exp(-t*(o?10:3)));let c=this.bleeding?1-(1-S.paintInAlbum)*Math.min(n.uBleed.value.z*2,1):1;n.uFlow.value=this.flowA.texture,n.uTime.value=e,n.uWarp.value=S.warp*this.calm,n.uPaintGain.value=this.calm*c,this.mesh.material=this.paperMat,this.renderer.setRenderTarget(null),this.renderer.render(this.scene,this.camera),this.calls=this.renderer.info.render.calls,this.renderer.info.reset(),this.frames++,this.firstFrame||(this.firstFrame=!0,this.hooks.onFirstFrame())};stepFlow(e,t){let n=this.flowMat.uniforms,r=innerWidth,i=innerHeight,a=this.stampTo.set(this.pointer.x/r,1-this.pointer.y/i);this.stampFrom.x<0&&this.stampFrom.copy(a);let o=(a.x-this.stampFrom.x)*r,s=(a.y-this.stampFrom.y)*i,c=Math.hypot(o,s)/e,l=this.pointer.seen?Math.min(c/S.fullSpeed,1):0;n.uA.value.copy(this.stampFrom),n.uB.value.copy(a),n.uVel.value.set((a.x-this.stampFrom.x)/e*.5,(a.y-this.stampFrom.y)/e*.5),n.uStamp.value=this.pointer.moved?l*this.calm*t:0,n.uRadius.value=S.radius[0]+(S.radius[1]-S.radius[0])*l,n.uDt.value=e,n.uPrev.value=this.flowA.texture,this.stampFrom.copy(a),this.pointer.moved=!1,this.mesh.material=this.flowMat,this.renderer.setRenderTarget(this.flowB),this.renderer.render(this.scene,this.camera),[this.flowA,this.flowB]=[this.flowB,this.flowA]}dispose(){this.stopTicking(),clearTimeout(this.exportTimer),this.exported.forEach(e=>URL.revokeObjectURL(e)),this.chapterObserver.disconnect(),removeEventListener(`pointermove`,this.onPointer),removeEventListener(`resize`,this.onResize),document.removeEventListener(`visibilitychange`,this.onVisibility),this.canvas.removeEventListener(`webglcontextlost`,this.onLost),this.canvas.removeEventListener(`webglcontextrestored`,this.onRestored),this.flowA.dispose(),this.flowB.dispose(),this.sceneTex.forEach(e=>e?.dispose()),this.paperTex.dispose(),this.flowMat.dispose(),this.paperMat.dispose(),this.bakeMat.dispose(),this.bakeRT.dispose(),this.mesh.geometry.dispose(),this.renderer.dispose()}invalidate(){this.dirty=!0,this.startTicking()}wake(e){this.awakeUntil=Math.max(this.awakeUntil,performance.now()/1e3+e),this.startTicking()}startTicking(){this.ticking||!this.running||this.parked||(this.ticking=!0,this.last=performance.now()/1e3,x.ticker.add(this.tick))}stopTicking(){this.ticking&&(this.ticking=!1,x.ticker.remove(this.tick))}flowSize(){return[Math.max(32,Math.ceil(innerWidth/S.flowDiv)),Math.max(32,Math.ceil(innerHeight/S.flowDiv))]}onChapter(){let e=document.documentElement.dataset.chapter;if(!e)return;let t=P(e),n=this.paperMat.uniforms,r=n.uTint.value;x.to(r,{x:t.tint.r,y:t.tint.g,z:t.tint.b,w:t.tintA,duration:1.2,ease:`none`,overwrite:!0,onUpdate:()=>this.invalidate()}),x.to(n.uPaper.value,{r:t.paper.r,g:t.paper.g,b:t.paper.b,duration:1.2,ease:`none`,overwrite:!0}),x.to(n.uPaint.value,{r:t.paint.r,g:t.paint.g,b:t.paint.b,duration:.9,ease:`none`,overwrite:!0}),x.to(n.uPaintMode,{value:t.mode,duration:.9,ease:`none`,overwrite:!0})}onPointer=e=>{e.pointerType!==`touch`&&(this.pointer.x=e.clientX,this.pointer.y=e.clientY,this.pointer.seen||(this.pointer.seen=!0,this.stampFrom.set(-1,-1)),this.pointer.moved=!0,this.wake(S.idleAfter))};applySize(){let e=Math.min(devicePixelRatio||1,S.dprCap),[t,n]=y(innerWidth*e,innerHeight*e,...b);this.renderer.setPixelRatio(1),this.renderer.setSize(t,n,!1),this.needsBake=!0}bake(){let{width:e,height:t}=this.canvas;this.bakeRT.setSize(e,t),this.bakeMat.uniforms.uView.value.set(innerWidth,innerHeight),this.mesh.material=this.bakeMat,this.renderer.setRenderTarget(this.bakeRT),this.renderer.render(this.scene,this.camera),this.needsBake=!1,clearTimeout(this.exportTimer),this.exportTimer=window.setTimeout(()=>void this.exportBake(),250)}async exportBake(){let{width:e,height:t}=this.bakeRT;if(e<2||t<2)return;let n=new Uint8Array(e*t*4);await this.renderer.readRenderTargetPixelsAsync(this.bakeRT,0,0,e,t,n);try{let r=new Worker(new URL(`/_astro/bake-worker-B7JMVhzQ.js`,``+import.meta.url),{type:`module`}),i=await new Promise((i,a)=>{r.onmessage=e=>i(e.data),r.onerror=a,r.postMessage({id:0,w:e,h:t,px:n.buffer,sepia:[...A]},[n.buffer])});r.terminate();let a=[URL.createObjectURL(i.mask),URL.createObjectURL(i.paper)];this.exported.forEach(e=>URL.revokeObjectURL(e)),this.exported=a,this.hooks.onBaked(a[0],a[1]);return}catch{}if(!n.byteLength)return;let r=new ImageData(e,t),i=new ImageData(e,t),a=performance.now();for(let o=0;o<t;o++){performance.now()-a>6&&(await new Promise(e=>requestAnimationFrame(()=>e())),a=performance.now());let s=(t-1-o)*e*4,c=o*e*4;for(let t=0;t<e*4;t+=4){let e=s+t,a=c+t,o=Math.min(n[e+1]/255*.6+.7,1),l=n[e+2]/255*.14;r.data[a+3]=n[e],i.data[a]=k(o*(1-l+l*A[0])),i.data[a+1]=k(o*(1-l+l*A[1])),i.data[a+2]=k(o*(1-l+l*A[2])),i.data[a+3]=255}}let o=async n=>{let r=new OffscreenCanvas(e,t);return r.getContext(`2d`).putImageData(n,0,0),URL.createObjectURL(await r.convertToBlob({type:`image/png`}))},s=await Promise.all([o(r),o(i)]);this.exported.forEach(e=>URL.revokeObjectURL(e)),this.exported=s,this.hooks.onBaked(s[0],s[1])}flush(){this.dirty&&this.ticking&&this.tick()}onResize=()=>{this.applySize();let[e,t]=this.flowSize();this.flowA.setSize(e,t),this.flowB.setSize(e,t),this.flowMat.uniforms.uTexel.value.set(1/e,1/t),this.flowMat.uniforms.uAspect.value=innerWidth/innerHeight,this.paperMat.uniforms.uFlowTexel.value.set(1/e,1/t),this.paperMat.uniforms.uView.value.set(innerWidth,innerHeight),this.parked&&this.paperReady&&this.bake(),this.invalidate()};onVisibility=()=>this.setRunning(document.visibilityState===`visible`);onLost=e=>{e.preventDefault(),this.running=!1,this.hooks.onLost()};onRestored=()=>{this.sceneTex=[null,null],this.paperMat.uniforms.uHasScene.value=0,this.needsBake=!0,this.setRunning(document.visibilityState===`visible`),this.hooks.onRestored()}};export{I as Overlay};