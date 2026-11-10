import{C as e,D as t,E as n,F as r,G as i,I as a,K as o,L as s,M as c,N as l,P as u,S as d,U as f,W as p,Z as m,_ as h,at as ee,b as g,c as _,d as te,et as ne,f as v,ft as y,gt as b,ht as re,j as ie,m as ae,mt as oe,n as se,ot as ce,pt as x,q as le,rt as ue,s as de,st as fe,tt as S,ut as C,w as pe}from"./three.module.D-7F9-qW.js";import{t as me}from"./client.Cy7fLNQY.js";import{a as he,c as ge,i as _e,l as ve,m as ye,o as be,s as xe,u as Se,x as w}from"./album.Duv2VSre.js";import{a as Ce,c as we,d as Te,f as Ee,i as De,l as Oe,n as ke,r as Ae,s as je,t as Me,u as Ne}from"./moon-art.CPrh4-b8.js";var Pe=class e extends s{constructor(t,n={}){super(t),this.isReflector=!0,this.type=`Reflector`,this.forceUpdate=!1,this._reflectionCameras=new WeakMap;let r=this,o=n.color===void 0?new ae(8355711):new ae(n.color),s=n.textureWidth||512,c=n.textureHeight||512,l=n.clipBias||0,u=n.shader||e.ReflectorShader,d=n.multisample===void 0?4:n.multisample,f=new i,p=new x,m=new x,h=new x,ee=new a,g=new x(0,0,-1),_=new oe,te=new x,ne=new x,v=new oe,y=new a,re=new b(s,c,{samples:d,type:pe}),ie=new S({name:u.name===void 0?`unspecified`:u.name,uniforms:C.clone(u.uniforms),fragmentShader:u.fragmentShader,vertexShader:u.vertexShader});ie.uniforms.tDiffuse.value=re.texture,ie.uniforms.color.value=o,ie.uniforms.textureMatrix.value=y,this.material=ie,this.onBeforeRender=function(e,t,n){let i=this.getReflectionCamera(n);if(m.setFromMatrixPosition(r.matrixWorld),h.setFromMatrixPosition(n.matrixWorld),ee.extractRotation(r.matrixWorld),p.set(0,0,1),p.applyMatrix4(ee),te.subVectors(m,h),te.dot(p)>0&&this.forceUpdate===!1)return;te.reflect(p).negate(),te.add(m),ee.extractRotation(n.matrixWorld),g.set(0,0,-1),g.applyMatrix4(ee),g.add(h),ne.subVectors(m,g),ne.reflect(p).negate(),ne.add(m),i.position.copy(te),i.up.set(0,1,0),i.up.applyMatrix4(ee),i.up.reflect(p),i.lookAt(ne),i.far=n.far,i.updateMatrixWorld(),i.projectionMatrix.copy(n.projectionMatrix),y.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),y.multiply(i.projectionMatrix),y.multiply(i.matrixWorldInverse),y.multiply(r.matrixWorld),f.setFromNormalAndCoplanarPoint(p,m),f.applyMatrix4(i.matrixWorldInverse),_.set(f.normal.x,f.normal.y,f.normal.z,f.constant);let a=i.projectionMatrix;i.isOrthographicCamera?(v.x=(Math.sign(_.x)+a.elements[8])/a.elements[0],v.y=(Math.sign(_.y)+a.elements[9])/a.elements[5],v.z=-n.far,v.w=1):(v.x=(Math.sign(_.x)+a.elements[8])/a.elements[0],v.y=(Math.sign(_.y)+a.elements[9])/a.elements[5],v.z=-1,v.w=(1+a.elements[10])/a.elements[14]),_.multiplyScalar(2/_.dot(v)),a.elements[2]=_.x,a.elements[6]=_.y,i.isOrthographicCamera?(a.elements[10]=_.z-l,a.elements[14]=_.w-1):(a.elements[10]=_.z+1-l,a.elements[14]=_.w),r.visible=!1;let o=e.getRenderTarget(),s=e.xr.enabled,c=e.shadowMap.autoUpdate;e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.setRenderTarget(re),e.state.buffers.depth.setMask(!0),e.autoClear===!1&&e.clear(),e.render(t,i),e.xr.enabled=s,e.shadowMap.autoUpdate=c,e.setRenderTarget(o);let u=n.viewport;u!==void 0&&e.state.viewport(u),r.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return re},this.dispose=function(){re.dispose(),r.material.dispose()},this.getReflectionCamera=function(e){let t=this._reflectionCameras.get(e);return t===void 0&&(t=e.clone(),this._reflectionCameras.set(e,t)),t}}};Pe.ReflectorShader={name:`ReflectorShader`,uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};var T=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float h11(float p){ return fract(sin(p * 91.345) * 47453.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
`,Fe=`
varying vec2 vUv; varying vec3 vW;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,Ie=`
uniform sampler2D uPaint; uniform vec2 uScale; uniform float uTime, uFlash, uVelvetK; uniform vec2 uHalo; uniform vec2 uPtr;
varying vec2 vUv; varying vec3 vW;
${T}
vec3 velvet(vec2 p){
  float fold = fbm(p * vec2(0.35, 0.22) + vec2(0.0, uTime * 0.004));
  vec3 a = vec3(0.12, 0.15, 0.27), b = vec3(0.21, 0.25, 0.41);
  vec3 col = mix(a, b, smoothstep(0.25, 0.85, fold));
  // 绒毛：很细的方向性纤维 + 顺着绒面的柔光（光从鼠标那边来）
  float nap = vn(p * vec2(140.0, 46.0)) * 0.6 + vn(p * vec2(60.0, 300.0)) * 0.4;
  col *= 0.86 + 0.2 * nap;
  float sheen = smoothstep(0.45, 0.9, fold) * (0.5 + 0.5 * dot(normalize(vec2(fold - 0.5, 0.4)), normalize(uPtr + vec2(0.0, 1.01))));
  col += vec3(0.10, 0.12, 0.20) * sheen * 0.35;
  return col;
}
void main(){
  vec2 p = vW.xy;
  vec2 pu = (vUv - 0.5) * uScale + 0.5;
  vec2 cu = clamp(pu, 0.0, 1.0);
  vec3 paint = texture2D(uPaint, cu).rgb;
  float outside = max(abs(pu.x - cu.x), abs(pu.y - cu.y));
  // 夜色化：压暗、偏靛紫、低饱和
  float l = dot(paint, vec3(0.3, 0.55, 0.15));
  vec3 night = mix(vec3(l), paint, 0.6) * vec3(0.68, 0.72, 0.98) * 0.98;
  // 画上的天空（偏紫、亮）换成丝绒；柏树、拱门、树篱（偏绿、暗）留下来当剪影
  float skyness = smoothstep(-0.01, 0.07, paint.b - paint.g) * smoothstep(0.38, 0.62, cu.y);
  // 画上的月亮去掉（换成月亮胸针）
  skyness = max(skyness, 1.0 - smoothstep(0.1, 0.3, length((cu - vec2(0.845, 0.83)) * vec2(1.78, 1.0))));
  vec3 vel = velvet(p);
  // 银河：一条斜跨夜空的薄纱，网眼 + 细碎的星尘，边缘银线锁边
  float band = (p.y - 2.2) - (p.x - 0.5) * -0.22;
  float bw = 0.75 + 0.25 * fbm(p * 0.4);
  float mw = exp(-pow(band / bw, 2.0)) * (0.6 + 0.4 * fbm(p * 0.9 + 3.0));
  float net = (0.5 + 0.5 * sin(p.x * 160.0)) * (0.5 + 0.5 * sin(p.y * 160.0));
  vec3 sky = vel + vec3(0.42, 0.46, 0.62) * mw * (0.22 + 0.12 * net);
  float dust = step(0.993, h21(floor(p * 70.0))) * mw;
  sky += vec3(0.8, 0.85, 1.0) * dust * (0.5 + 0.5 * sin(uTime * 2.0 + h21(floor(p * 70.0)) * 30.0));
  float edge = exp(-pow((abs(band) - bw) * 9.0, 2.0)) * 0.08;
  sky += vec3(0.7, 0.74, 0.86) * edge;
  // 极光一样的月光帘幕：竖向褶皱，缓缓飘动，像一层层银色的雪纺
  float fx = p.x * 0.7 + fbm(vec2(p.x * 0.25, uTime * 0.03)) * 3.0;
  float folds = pow(0.5 + 0.5 * sin(fx * 3.1 + uTime * 0.12), 3.0);
  float curtainY = smoothstep(0.9, 2.2, p.y) * (1.0 - smoothstep(3.4, 4.6, p.y));
  float strands = 0.75 + 0.25 * sin(p.x * 70.0 + fbm(p * 2.0) * 4.0);
  sky += vec3(0.55, 0.62, 0.78) * folds * curtainY * strands * 0.09 * (0.6 + 0.4 * fbm(p * 0.6 + uTime * 0.02));
  // 月晕：一圈很淡的彩虹色冰晕
  float rh = length(p - uHalo);
  float ring = exp(-pow((rh - 2.05) * 5.0, 2.0));
  sky += hue(clamp((rh - 1.85) * 1.6, 0.0, 1.0) * 0.75) * ring * 0.03 + vec3(0.25, 0.28, 0.4) * exp(-rh * 1.4) * 0.22;
  vec3 col = mix(night, sky, skyness * uVelvetK);
  // 画面本身也像绣在丝绒上：很淡的斜纹针脚 + 绒毛
  col *= 0.93 + 0.07 * (0.5 + 0.5 * sin((p.x + p.y) * 95.0)) ;
  col = mix(col, vel * 0.85, smoothstep(0.0, 0.08, outside));
  col += uFlash * vec3(0.06, 0.065, 0.09);
  gl_FragColor = vec4(col, 1.0);
}`,Le=`
attribute vec3 aP; attribute vec4 aS; attribute vec4 aC; // aS: size, kind, seed, alpha；aC: rgb + 光芒
uniform float uTime;
varying vec2 vUv; varying vec4 vS; varying vec4 vC;
void main(){
  vUv = position.xy * 2.0;
  vS = aS; vC = aC;
  vec4 mv = viewMatrix * vec4(aP, 1.0);
  float sz = aS.x * (aS.y < 0.5 ? 1.0 + 1.6 * aC.a : 1.0);
  mv.xy += position.xy * sz;
  gl_Position = projectionMatrix * mv;
}`,Re=`
uniform float uTime, uFlash; uniform vec2 uPtr;
varying vec2 vUv; varying vec4 vS; varying vec4 vC;
${T}
void main(){
  if (vS.w < 0.003) discard;
  vec2 p = vUv + vec2(1e-4, 0.0); float r = length(p); float a = atan(p.y, p.x);
  float kind = vS.y, seed = vS.z;
  vec3 col = vec3(0.0); float al = 0.0;
  if (kind < 0.5) {
    // 第 19 轮：星座主星 = 一颗亮点 + 十字星芒（绘本里画的星，不做写实切工）
    float tw = 0.7 + 0.3 * sin(uTime * 2.1 + seed * 40.0);
    float core = exp(-r * r * 60.0);
    float spikes = exp(-abs(p.x) * 30.0) * exp(-abs(p.y) * 2.8) + exp(-abs(p.y) * 30.0) * exp(-abs(p.x) * 2.8);
    col = vec3(1.0, 0.97, 0.9) * (core * 1.4 + spikes * (0.45 + vC.a) * tw) + vec3(0.75, 0.82, 1.0) * exp(-r * 6.0) * 0.35 * tw;
    col *= vC.rgb;
    al = 1.0;
  } else if (kind < 1.5) {
    // 珍珠：柔和的高光 + 虹彩边
    float d = 1.0 - smoothstep(0.42, 0.48, r);
    vec3 n = normalize(vec3(p / 0.48, sqrt(max(0.0, 1.0 - dot(p, p) / 0.23))));
    vec3 L = normalize(vec3(uPtr * 0.6 + vec2(-0.3, 0.6), 1.0));
    float dif = 0.55 + 0.45 * dot(n, L);
    float sp = pow(max(0.0, dot(reflect(-L, n), vec3(0, 0, 1))), 24.0);
    float fr = pow(1.0 - n.z, 2.0);
    col = (vec3(0.93, 0.9, 0.88) * dif + hue(fract(fr * 0.8 + seed + uTime * 0.03)) * fr * 0.35 + sp * 0.8) * d * vC.rgb;
    col += vec3(0.6, 0.62, 0.75) * exp(-r * 5.0) * 0.12;
    al = 1.0;
  } else if (kind < 2.5) {
    // 亮片：中间有孔的小圆片，随视角闪一下
    float disc = (1.0 - smoothstep(0.38, 0.45, r)) * smoothstep(0.1, 0.16, r);
    float tilt = sin(uTime * (0.4 + seed * 0.6) + seed * 31.0 + uPtr.x * 2.5 + uPtr.y * 1.7);
    float glint = pow(max(0.0, tilt), 30.0);
    float breath = 0.55 + 0.45 * sin(uTime * (0.6 + seed) + seed * 80.0);
    vec3 base = mix(vec3(0.62, 0.66, 0.8), vec3(0.95, 0.86, 0.62), step(0.82, seed));
    col = base * disc * (0.35 + 0.65 * breath) + vec3(1.0) * disc * glint * 1.6;
    float spk = (exp(-abs(p.x) * 34.0) * exp(-abs(p.y) * 4.0) + exp(-abs(p.y) * 34.0) * exp(-abs(p.x) * 4.0)) * glint;
    col += vec3(1.0, 0.98, 0.92) * spk * 1.4;
    col *= vC.rgb;
    al = 1.0;
  } else {
    // 第 19 轮：小宝石 = 一个带高光的小圆片（作品主色），细金边
    float body = 1.0 - smoothstep(0.34, 0.37, r);
    float rim = smoothstep(0.3, 0.34, r) * body;
    vec2 hl = p - vec2(-0.1, 0.12);
    col = vC.rgb * body * (0.75 + 0.25 * (0.5 - p.y)) + vec3(1.0) * exp(-dot(hl, hl) * 90.0) * 0.8 * body;
    col = mix(col, vec3(0.92, 0.76, 0.44), rim);    al = 1.0;
  }
  // 星芒、光晕都收在方片的圆里（不然辉光会把方片的直边描出来）
  col *= smoothstep(1.0, 0.72, r);
  col *= vS.w * (1.0 + uFlash * 0.6);
  gl_FragColor = vec4(col, al);
}`,ze=`
uniform float uTime; uniform vec2 uPtr; uniform float uK;
varying vec2 vUv;
${T}
void main(){
  vec2 p = vUv * 2.0 - 1.0; float r = length(p);
  if (r > 1.0) discard;
  // 第 19 轮：画出来的月亮（柔和的乳白渐变 + 很淡的月面斑纹），一道很淡、很宽的蓝光慢慢移动；没有玻璃珠的高光
  vec3 col = mix(vec3(0.95, 0.94, 0.9), vec3(0.78, 0.8, 0.9), smoothstep(0.2, 1.0, r));
  col *= 0.94 + 0.08 * fbm(p * 2.2 + 3.0) - 0.05 * smoothstep(0.55, 0.75, fbm(p * 1.4 + 11.0));
  vec2 L = vec2(sin(uTime * 0.1) * 0.5, cos(uTime * 0.07) * 0.3);
  float band = exp(-pow(dot(p - L, normalize(vec2(1.0, -0.35))) * 1.6, 2.0));
  col = mix(col, col * vec3(0.82, 0.9, 1.08) + vec3(0.04, 0.07, 0.12), band * 0.5);
  col += vec3(0.6, 0.7, 1.0) * smoothstep(0.8, 1.0, r) * 0.12;  gl_FragColor = vec4(col * uK, smoothstep(1.0, 0.985, r));
}`,Be=`
uniform sampler2D uMap; uniform float uTime, uK, uPolish; uniform vec2 uPtr; uniform vec2 uTex;
varying vec2 vUv;
void main(){
  float h = texture2D(uMap, vUv).a;
  if (h < 0.06) discard;
  float hx = texture2D(uMap, vUv + vec2(uTex.x, 0.0)).a - texture2D(uMap, vUv - vec2(uTex.x, 0.0)).a;
  float hy = texture2D(uMap, vUv + vec2(0.0, uTex.y)).a - texture2D(uMap, vUv - vec2(0.0, uTex.y)).a;
  vec3 n = normalize(vec3(-hx * 3.0, -hy * 3.0, 1.0));
  vec3 L = normalize(vec3(uPtr * 0.8 + vec2(-0.4, 0.7), 0.9));
  float dif = 0.45 + 0.55 * max(0.0, dot(n, L));
  float sp = pow(max(0.0, dot(reflect(-L, n), vec3(0, 0, 1))), mix(14.0, 60.0, uPolish));
  // 环境：上面映着夜空的蓝、下面映着池塘的银
  vec3 env = mix(vec3(0.22, 0.26, 0.42), vec3(0.55, 0.58, 0.68), 0.5 + 0.5 * n.y);
  vec3 gold = vec3(0.86, 0.68, 0.36);
  vec3 col = gold * dif * 0.75 + gold * env * 0.5 + mix(gold, vec3(1.0, 0.95, 0.8), 0.5) * sp * 1.3;
  float glint = pow(max(0.0, sin(vUv.x * 30.0 + vUv.y * 20.0 - uTime * 0.8 + uPtr.x * 6.0)), 40.0) * 0.6;
  col += vec3(1.0, 0.93, 0.75) * glint * h;
  gl_FragColor = vec4(col * uK, smoothstep(0.06, 0.35, h) * uK);
}`,Ve=`
attribute vec2 aCell; attribute vec4 aKey;
uniform vec2 uGrid; uniform vec3 uC; uniform vec2 uSize;
uniform float uTime, uWeave, uWeaveMode, uUnpick, uPart, uSway;
uniform vec2 uWeaveO;
uniform vec3 uStars[8]; uniform float uStarN;
uniform vec4 uPluck[6];
uniform vec3 uDrag;
uniform sampler2D uDirMap;
varying vec2 vUv; varying vec2 vL; varying vec2 vT; varying float vA; varying float vSpark; varying float vLift;
${T}
void main(){
  vec2 cell = aCell;
  vec2 cs = uSize / uGrid;
  // 针脚方向：海报（模糊过）亮度梯度的垂直方向 + 流场
  vec2 e = 1.5 / uGrid;
  float lx = dot(texture2D(uDirMap, cell + vec2(e.x, 0.0)).rgb - texture2D(uDirMap, cell - vec2(e.x, 0.0)).rgb, vec3(0.33));
  float ly = dot(texture2D(uDirMap, cell + vec2(0.0, e.y)).rgb - texture2D(uDirMap, cell - vec2(0.0, e.y)).rgb, vec3(0.33));
  float flow = 0.785 + (vn(cell * 5.0) - 0.5) * 1.4;
  vec2 g = vec2(lx, ly);
  float ang = length(g) > 0.02 ? atan(g.y, g.x) + 1.5708 : flow;
  ang = mix(flow, ang, 0.7);
  vec2 T = vec2(cos(ang), sin(ang));
  vec2 N = vec2(-T.y, T.x);
  vT = T;
  vec3 base = uC + vec3((cell - 0.5) * uSize, 0.0);
  float rnd = aKey.w;
  // 织：一针针出现（入场从上往下，切换从池塘里涟漪的中心往外）
  float asp = uSize.x / uSize.y;
  float keyA = 1.0 - cell.y + (vn(cell * vec2(9.0, 3.0)) - 0.5) * 0.12;
  float keyB = length((cell - uWeaveO) * vec2(asp, 1.0)) / (asp + 0.4);
  float key = mix(keyA, keyB, uWeaveMode) * 0.88 + rnd * 0.12;
  float w = clamp((uWeave * 1.18 - key) / 0.18, 0.0, 1.0);
  float ws = w * w * (3.0 - 2.0 * w);
  // 拆：从上往下、从四边往里一针针挑开，飞向星座
  float ukey = (1.0 - cell.y) * 0.55 + abs(cell.x - 0.5) * 0.25 + rnd * 0.2;
  float u = clamp((uUnpick * 1.3 - ukey) / 0.3, 0.0, 1.0);
  float lift = 0.0;
  vec3 pos = base;
  // 飘动
  pos.z += sin(uTime * 0.7 + cell.y * 4.0 + cell.x * 2.0) * 0.012 * uSway;
  pos.x += sin(uTime * 0.5 + cell.y * 6.0) * 0.004 * uSway;
  // 拨：每一列是一根弦；拨到的地方往两边传
  for (int i = 0; i < 6; i++) {
    vec4 pk = uPluck[i];
    float t = uTime - pk.y;
    if (t < 0.0 || t > 2.5 || pk.z <= 0.0) continue;
    float dx = (cell.x - pk.x) * asp;
    float env = exp(-dx * dx * 140.0) + 0.35 * exp(-abs(dx) * 9.0);
    float wave = sin(t * 38.0 - abs(dx) * 55.0) * exp(-t * 2.4) * smoothstep(0.0, 0.03, t);
    float d = pk.z * env * wave * sin(3.14159 * cell.y);
    pos.z += d * 0.11;
    pos.x += d * 0.018 * pk.w;
    lift += abs(d);
  }
  // 撩：按住拖动的那一片往两边、往前拉开（像撩起纱帘）
  vec2 dd = (cell - uDrag.xy) * vec2(asp, 1.0);
  float df = uDrag.z * exp(-dot(dd, dd) * 18.0);
  pos.x += sign(dd.x) * df * 0.22 * smoothstep(0.0, 0.25, abs(dd.x) + 0.05);
  pos.z += df * 0.32;
  pos.y += df * 0.05;
  lift += df;
  // 分开：进作品时线像纱帘一样向两边分开（中间分得最多，收成褶）
  float side = sign(cell.x - 0.5 + 1e-4);
  float pp = clamp(uPart * 1.25 - (0.5 - abs(cell.x - 0.5)) * 0.5, 0.0, 1.0);
  pp = pp * pp * (3.0 - 2.0 * pp);
  pos.x += side * pp * (0.62 - abs(cell.x - 0.5) * 0.9) * uSize.x;
  pos.z += pp * (0.25 + 0.2 * sin(cell.y * 18.0 + cell.x * 40.0));
  // 织之前：线头在针眼上方（往前、往上），拉进来
  pos += vec3(0.0, 0.18, 0.55) * (1.0 - ws) * (0.6 + 0.4 * rnd);
  // 拆：挑起来（往前拱一下）→ 飞向星座的一颗星
  int si = int(mod(aKey.z, max(1.0, uStarN)));
  vec3 star = uStars[0];
  for (int i = 0; i < 8; i++) if (i == si) star = uStars[i];
  float fly = smoothstep(0.12, 1.0, u);
  vec3 arc = mix(pos, star, fly);
  arc.z += sin(fly * 3.14159) * 0.9 + sin(u * 3.14159) * 0.15;
  arc.x += sin(fly * 3.14159) * (rnd - 0.5) * 1.2;
  pos = mix(pos, arc, step(0.0001, u));
  float scale = ws * (1.0 - 0.9 * fly);
  vSpark = sin(u * 3.14159) + (1.0 - ws) * ws * 3.0;
  vLift = lift;
  // 一针：沿 T 长 1.9 格、粗 0.62 格（相邻的针脚互相压一点）
  vec2 q = position.xy;
  vL = q * 2.0;
  vec2 off = (T * q.x * 1.9 * cs.x + N * q.y * 0.62 * cs.y) * scale;
  pos.xy += off;
  vUv = cell + (T * q.x * 1.9 + N * q.y * 0.62) / uGrid;
  vA = ws * (1.0 - pp * 0.15);
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}`,He=`
uniform sampler2D uVid, uPoster; uniform float uVidK, uTime, uK; uniform vec2 uPtr; uniform vec3 uLight;
varying vec2 vUv; varying vec2 vL; varying vec2 vT; varying float vA; varying float vSpark; varying float vLift;
${T}
void main(){
  // 针脚的形状：两头圆的一段线
  float along = vL.x, across = vL.y;
  float sh = across * across + pow(max(0.0, abs(along) - 0.72) / 0.28, 2.0);
  if (sh > 1.0 || vA < 0.01) discard;
  vec3 src = mix(texture2D(uPoster, vUv).rgb, texture2D(uVid, vUv).rgb, uVidK);
  // 丝线：圆柱的法线 + 几股纤维
  float fib = 0.8 + 0.2 * sin(across * 9.0 + along * 3.0 + vn(vUv * 900.0) * 3.0);
  vec3 T3 = normalize(vec3(vT, 0.0));
  vec3 Nc = normalize(vec3(vec2(-vT.y, vT.x) * across, sqrt(max(0.0, 1.0 - across * across))));
  vec3 L = normalize(uLight + vec3(uPtr * 0.7, 0.0));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float th = dot(T3, H);
  float kk = pow(sqrt(max(0.0, 1.0 - th * th)), 70.0);           // Kajiya-Kay 主高光
  float kk2 = pow(sqrt(max(0.0, 1.0 - pow(dot(T3, normalize(L + V * 0.6)), 2.0))), 18.0) * 0.3;
  float dif = 0.62 + 0.38 * max(0.0, dot(Nc, L));
  vec3 col = src * dif * fib * 1.04;
  vec3 silver = vec3(0.86, 0.9, 1.0);
  col += mix(silver, src * 1.3 + 0.25, 0.45) * kk * 0.42 * (0.7 + 0.3 * fib);
  col += src * kk2;
  // 薄膜干涉：线的两边在斜光下泛彩虹
  float edge = pow(abs(across), 3.0);
  col += hue(fract(edge * 0.6 + vUv.y * 2.0 + uTime * 0.05)) * edge * 0.10;
  // 拆的时候线头发亮；拨的时候弦亮一下
  col += vec3(0.9, 0.92, 1.0) * (vSpark * 0.35 + vLift * 0.6);
  gl_FragColor = vec4(col * uK, vA);
}`,Ue=`
uniform sampler2D uVid, uPoster; uniform float uVidK, uK, uFull, uPosterK;
varying vec2 vUv;
void main(){
  vec3 v = mix(texture2D(uPoster, vUv).rgb, texture2D(uVid, vUv).rgb, uVidK);
  v = mix(v, texture2D(uPoster, vUv).rgb, uPosterK);
  vec3 velvet = vec3(0.1, 0.12, 0.22);
  vec3 col = mix(velvet + v * 0.42, v, uFull);
  gl_FragColor = vec4(col, uK);
}`,We=`
attribute vec4 aA; attribute vec4 aB; // aA: 终点 xyz + 种子；aB: 模式（0 经线 / 1 游丝）、宽、相位、出现的先后
uniform vec3 uFrom; uniform float uTime, uWarp, uCamZ;
varying float vT; varying float vSeed; varying float vVis; varying float vMode;
${T}
vec3 path(float t){
  vec3 to = aA.xyz;
  if (aB.x < 0.5) {
    vec3 from = uFrom + vec3((aA.w - 0.5) * 0.5, (fract(aA.w * 7.3) - 0.5) * 0.2, 0.0);
    vec3 mid = mix(from, to, 0.55) + vec3(-0.15, -0.35, 0.25);
    vec3 a = mix(from, mid, t), b = mix(mid, to, t);
    vec3 p = mix(a, b, t);
    p.x += sin(uTime * 0.6 + aA.w * 20.0 + t * 3.0) * 0.02 * sin(t * 3.14159);
    p.z += cos(uTime * 0.45 + aA.w * 13.0) * 0.03 * sin(t * 3.14159);
    return p;
  }
  // 游丝：从挂毯边上一点往外飘出去的一根松线
  vec3 dir = normalize(vec3(cos(aA.w * 6.28), sin(aA.w * 6.28) * 0.6, 0.3));
  vec3 p = to + dir * t * (0.6 + aA.w * 0.5);
  p += vec3(sin(uTime * 0.5 + t * 4.0 + aA.w * 9.0), cos(uTime * 0.4 + t * 3.0 + aA.w * 7.0), sin(uTime * 0.3 + t * 2.0)) * 0.12 * t;
  return p;
}
void main(){
  float t = position.y + 0.5;
  vec3 p = path(t);
  vec3 q = path(min(1.0, t + 0.02)) - path(max(0.0, t - 0.02));
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vec3 tv = normalize((viewMatrix * vec4(q, 0.0)).xyz);
  vec3 side = cross(tv, vec3(0.0, 0.0, 1.0)); side = dot(side, side) > 1e-8 ? normalize(side) : vec3(1.0, 0.0, 0.0);
  mv.xyz += side * position.x * aB.y * (-mv.z / 8.0);
  vT = t; vSeed = aA.w; vMode = aB.x;
  vVis = clamp((uWarp * 1.3 - aB.w * 0.3 - t) / 0.12, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`,Ge=`
uniform float uTime, uK;
varying float vT; varying float vSeed; varying float vVis; varying float vMode;
void main(){
  if (vVis < 0.01) discard;
  float base = vMode < 0.5 ? 0.045 + 0.03 * sin(vSeed * 40.0 + uTime) : 0.1 * (1.0 - vT);
  float drop = pow(max(0.0, sin(vT * 14.0 - uTime * 1.2 + vSeed * 30.0)), 40.0);
  float glint = pow(max(0.0, sin(vT * 3.0 + uTime * 0.7 + vSeed * 10.0)), 6.0) * 0.25;
  vec3 col = vec3(0.82, 0.88, 1.0) * (base + glint) + vec3(1.0, 0.97, 0.9) * drop * 0.9;
  if (vMode < 0.5) col *= smoothstep(0.0, 0.45, vT) * 0.6;
  gl_FragColor = vec4(col * vVis * uK, 1.0);
}`,Ke=`
attribute vec3 aP; attribute vec4 aD; attribute float aOpen; // aD: 大小、种类、种子、虚化
uniform float uTime;
varying vec2 vUv; varying vec4 vD; varying float vOpen; varying vec3 vW;
void main(){
  vD = aD; vOpen = aOpen;
  vec2 q = position.xy; // -0.5..0.5
  vUv = q + 0.5;
  float sway = sin(uTime * 0.8 + aD.z * 30.0) * 0.04 * (q.y + 0.5);
  vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 p = aP + camR * (q.x + sway) * aD.x + vec3(0.0, 1.0, 0.0) * (q.y + 0.5) * aD.x;
  vW = aP;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`,qe=`
uniform sampler2D uMap; uniform float uTime, uFlash, uWaveR; uniform vec3 uWaveC; uniform float uK;
varying vec2 vUv; varying vec4 vD; varying float vOpen; varying vec3 vW;
${T}
void main(){
  float k = floor(vD.y + 0.5);
  vec2 cellO = vec2((k + vUv.x) / 4.0, 0.5 + vUv.y * 0.5);
  vec2 cellB = vec2((k + vUv.x) / 4.0, vUv.y * 0.5);
  float bias = vD.w * 4.0;
  vec4 o = texture2D(uMap, cellO, bias), b = texture2D(uMap, cellB, bias);
  float n = vn(vUv * 9.0 + vD.z * 10.0) * 0.6 + length(vUv - vec2(0.5, 0.5)) * 0.8;
  float m = smoothstep(n - 0.12, n + 0.12, vOpen * 1.4);
  vec4 c = mix(b, o, m);
  if (c.a < (vD.w > 0.5 ? 0.02 : 0.12)) discard;
  float sleep = mix(0.42, 1.0, vOpen);
  vec3 col = c.rgb * vec3(0.66, 0.72, 0.9) * sleep * mix(0.85, 0.62, vOpen);
  // 开着的花：花心一团暖光
  float core = exp(-length((vUv - vec2(0.5, 0.5)) * vec2(1.0, 1.2)) * 5.0);
  col += vec3(1.0, 0.82, 0.5) * core * vOpen * 0.32 * c.a;
  // 光波（昙花盛开时从花心往外扫）
  float wd = length(vW.xz - uWaveC.xz);
  col += vec3(1.0, 0.9, 0.7) * exp(-pow((wd - uWaveR) * 2.5, 2.0)) * 0.45 * step(0.01, uWaveR);
  col *= 1.0 + uFlash * 0.5;
  gl_FragColor = vec4(col * uK, c.a * (vD.w > 0.5 ? 0.85 : 1.0) * uK);
}`,Je=`
uniform float uOpen, uTime; uniform float uBend;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec3 p = position;
  // 花瓣往外弯：越到尖端弯得越多
  float t = uv.y;
  p.z += sin(t * 1.5708) * uBend * (0.4 + 0.6 * uOpen) * 0.25;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vN = normalize(mat3(modelMatrix) * vec3(0.0, -0.3, 1.0));
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Ye=`
uniform vec3 uGlass, uGlass2; uniform float uOpen, uTime, uGlow, uK; uniform vec2 uPtr;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
${T}
vec2 vor(vec2 p){ vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(x, y); vec2 o = vec2(h21(i + g), h21(i + g + 7.3)); float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return vec2(d1, d2 - d1); }
void main(){
  // 花瓣的轮廓：中间宽、两头尖
  float wdt = pow(sin(vUv.y * 3.14159), 0.75) * 0.5;
  float edge = wdt - abs(vUv.x - 0.5);
  if (edge < 0.0) discard;
  vec2 c = vor(vec2(vUv.x * 4.0, vUv.y * 7.0));
  float wire = 1.0 - smoothstep(0.04, 0.09, c.y);
  float rim = 1.0 - smoothstep(0.015, 0.04, edge);
  float gold = max(wire, rim);
  vec3 glass = mix(uGlass2, uGlass, vUv.y) * (0.85 + 0.25 * h21(floor(vec2(vUv.x * 4.0, vUv.y * 7.0)) + 3.0));
  float back = 0.35 + uGlow * (0.6 + 0.4 * vUv.y);
  vec3 col = glass * back;
  float irid = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  col += hue(fract(irid * 0.7 + uTime * 0.03 + vUv.y * 0.3)) * irid * 0.15;
  vec3 L = normalize(vec3(uPtr * 0.7 + vec2(-0.3, 0.6), 0.8));
  float sp = pow(max(0.0, dot(reflect(-L, normalize(vN)), normalize(vV))), 30.0);
  vec3 g = vec3(0.86, 0.68, 0.36) * (0.55 + 0.45 * max(0.0, dot(normalize(vN), L))) + sp * vec3(1.0, 0.93, 0.75) * 1.2;
  col = mix(col, g, gold);
  gl_FragColor = vec4(col * uK, mix(0.78, 1.0, gold) * uK);
}`,Xe=`
uniform float uTime, uA, uSpeed, uFlash; uniform vec3 uCol;
varying vec2 vUv; varying vec3 vW;
${T}
void main(){
  float n = fbm(vec2(vW.x * 0.35 + uTime * uSpeed, vW.y * 1.2 + vW.z * 0.3));
  float n2 = fbm(vec2(vW.x * 0.9 - uTime * uSpeed * 1.7, vW.y * 2.0 + 5.0));
  float a = smoothstep(0.35, 0.8, n * 0.7 + n2 * 0.5) * uA;
  a *= smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y)) * smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
  float weave = 0.85 + 0.15 * (0.5 + 0.5 * sin(vW.x * 220.0)) * (0.5 + 0.5 * sin(vW.y * 220.0));
  gl_FragColor = vec4(uCol * (1.0 + uFlash * 0.5), a * weave);
}`,Ze=`
varying vec2 vUv; varying vec3 vW;
void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,Qe=`
uniform float uTime, uA;
varying vec2 vUv; varying vec3 vW;
${T}
void main(){
  float across = abs(vUv.x - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.2, 1.0, across)) * smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
  a *= 0.55 + 0.45 * fbm(vec2(vUv.x * 3.0, vUv.y * 2.0 - uTime * 0.05));
  a *= 0.8 + 0.2 * sin(vUv.x * 40.0 + uTime * 0.3);
  gl_FragColor = vec4(vec3(0.62, 0.7, 0.92) * a * uA, 1.0);
}`,$e={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uTime:{value:0},uFlash:{value:0},uMoonX:{value:0},uRip:{value:[]},uK:{value:1}},vertexShader:`
uniform mat4 textureMatrix; varying vec4 vUvP; varying vec3 vW;
void main(){ vUvP = textureMatrix * vec4(position, 1.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
uniform sampler2D tDiffuse; uniform float uTime, uFlash, uMoonX, uK; uniform vec4 uRip[10];
varying vec4 vUvP; varying vec3 vW;
${T}
void main(){
  vec2 xz = vW.xz;
  vec2 disp = vec2(0.0); float ring = 0.0;
  for (int i = 0; i < 10; i++) {
    vec4 r = uRip[i];
    float t = uTime - r.z;
    if (r.w <= 0.0 || t < 0.0 || t > 7.0) continue;
    vec2 d = (xz - r.xy) * vec2(1.0, 2.2);
    float rr = length(d);
    float w = 0.0;
    for (int k = 0; k < 3; k++) { float fr = t * 0.75 - float(k) * 0.22; if (fr > 0.0) w += exp(-pow((rr - fr) * 7.0, 2.0)) * exp(-t * 0.55) * r.w / (1.0 + float(k)); }
    disp += normalize(d + 1e-4) * w * 0.05;
    ring += w;
  }
  disp += vec2(sin(xz.x * 2.7 + uTime * 0.6 + sin(xz.y * 1.7)), cos(xz.y * 5.1 - uTime * 0.5 + xz.x)) * 0.004;
  vec4 p = vUvP; p.xy += disp * p.w * 1.6;
  vec3 refl = texture2DProj(tDiffuse, p).rgb;
  float thr = 0.5 + 0.5 * sin(vW.z * 150.0 + disp.y * 900.0 + sin(vW.x * 0.6) * 2.0);
  vec3 satin = vec3(0.17, 0.19, 0.28);
  vec3 col = mix(satin, refl * 0.72 + vec3(0.02, 0.025, 0.05), 0.75);
  col *= 0.86 + 0.18 * thr;
  float glint = pow(thr, 22.0) * (0.06 + ring * 1.6);
  float path = exp(-pow((vW.x - uMoonX) / (0.45 + max(0.0, 3.0 - vW.z) * 0.12), 2.0));
  float sp = step(0.986, h21(floor(vW.xz * vec2(36.0, 80.0)) + floor(uTime * 2.5))) * path;
  col += vec3(0.85, 0.9, 1.0) * (glint * 0.7 + path * 0.035 + sp * 0.8);
  col += vec3(0.8, 0.85, 1.0) * ring * 0.08;
  col += uFlash * vec3(0.12, 0.13, 0.18);
  gl_FragColor = vec4(col * uK, 1.0);
}`},et=`
attribute vec4 aP; attribute vec4 aQ; // aP: xyz + 种子；aQ: 种类（0 萤火 / 1 花瓣 / 2 花粉）、大小、速度、-
uniform float uTime, uPx, uWhirl, uFlash; uniform vec3 uWhirlC;
varying float vKind; varying float vA; varying float vBok; varying float vRot; varying float vSeed;
void main(){
  float s = aP.w, kind = aQ.x;
  vec3 p = aP.xyz;
  if (kind < 0.5) {
    p += vec3(sin(uTime * 0.31 + s * 7.0) * 0.6, sin(uTime * 0.43 + s * 3.0) * 0.3, cos(uTime * 0.27 + s * 5.0) * 0.5);
    vA = smoothstep(0.2, 1.0, sin(uTime * (1.1 + s) + s * 20.0)) * 0.9 + 0.1;
  } else {
    float H = 4.6;
    float fall = fract(s * 13.0 + uTime * aQ.z / H);
    p.y = aP.y + 2.6 - fall * H;
    p.x += sin(uTime * 0.7 + s * 9.0 + fall * 6.0) * 0.35;
    p.z += cos(uTime * 0.5 + s * 5.0) * 0.2;
    vA = smoothstep(0.0, 0.1, fall) * (1.0 - smoothstep(0.85, 1.0, fall));
    if (p.y < -1.04) { p.y = -1.04; }
  }
  // 切换时的花瓣和光尘旋风
  vec3 d = p - uWhirlC;
  float r = length(d.xy) + 0.3;
  float ang = uWhirl * 2.2 / r;
  float c = cos(ang), sn = sin(ang);
  vec2 rot = vec2(d.x * c - d.y * sn, d.x * sn + d.y * c);
  p.xy = mix(p.xy, uWhirlC.xy + rot * (1.0 - 0.35 * uWhirl), step(0.001, uWhirl));
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  vBok = kind < 0.5 ? smoothstep(4.5, 2.2, dist) : 0.0;
  vKind = kind; vSeed = s; vRot = uTime * (0.5 + s) + s * 6.28;
  float size = aQ.y * (1.0 + vBok * 5.0);
  gl_PointSize = clamp(size * uPx / dist, 1.0, 90.0);
  vA *= 1.0 + uFlash * 0.8;
  gl_Position = projectionMatrix * mv;
}`,tt=`
varying float vKind; varying float vA; varying float vBok; varying float vRot; varying float vSeed;
void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  vec3 col; float a;
  if (vKind < 0.5) {
    float core = exp(-r * r * 9.0);
    float disc = (1.0 - smoothstep(0.75, 0.95, r)) * (0.35 + 0.65 * smoothstep(0.5, 0.92, r));
    a = mix(core, disc * 0.22, vBok);
    col = vec3(1.0, 0.82, 0.45) * a * vA;
  } else if (vKind < 1.5) {
    float c = cos(vRot), s = sin(vRot);
    vec2 q = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    a = 1.0 - smoothstep(0.8, 1.0, length(q * vec2(1.0, 2.4)));
    col = mix(vec3(0.62, 0.6, 0.72), vec3(0.72, 0.56, 0.62), step(0.6, vSeed)) * a * vA * 0.22;
  } else {
    a = exp(-r * r * 6.0);
    col = vec3(1.0, 0.86, 0.5) * a * vA * 0.8;
  }
  if (a < 0.01) discard;
  gl_FragColor = vec4(col, 1.0);
}`,nt=`
attribute vec3 aO; attribute vec4 aV; // aV: 速度 xyz + 出生时刻
uniform float uTime, uPx;
varying float vA; varying float vS;
void main(){
  float t = uTime - aV.w;
  vec3 p = aO + aV.xyz * t + vec3(0.0, -2.2, 0.0) * t * t;
  vA = (t < 0.0 || t > 1.4) ? 0.0 : (1.0 - t / 1.4);
  if (p.y < -1.05) vA *= 0.3;
  vS = fract(aO.x * 13.7 + aO.z * 7.1);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = vA > 0.0 ? clamp(0.045 * uPx / -mv.z, 1.5, 18.0) : 0.0;
  gl_Position = projectionMatrix * mv;
}`,rt=`
varying float vA; varying float vS;
void main(){
  if (vA <= 0.0) discard;
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  float a = exp(-r * r * 5.0) + (exp(-abs(p.x) * 14.0) + exp(-abs(p.y) * 14.0)) * 0.35 * (1.0 - r);
  vec3 col = mix(vec3(0.85, 0.9, 1.0), vec3(1.0, 0.85, 0.5), step(0.5, vS));
  gl_FragColor = vec4(col * a * vA, 1.0);
}`,it=`
attribute vec3 aA; attribute vec3 aB; attribute vec4 aW; // aW: 宽、透明度、色相、-
varying float vT; varying float vAl; varying float vX; varying vec3 vCol;
${T}
void main(){
  float t = position.y + 0.5;
  vec3 p = mix(aB, aA, t);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vec3 dir = normalize((viewMatrix * vec4(aA - aB, 0.0)).xyz + 1e-5);
  vec3 side = normalize(cross(dir, vec3(0.0, 0.0, 1.0)));
  mv.xyz += side * position.x * aW.x * (0.3 + 0.7 * t);
  vT = t; vAl = aW.y; vX = position.x * 2.0;
  vCol = mix(vec3(0.85, 0.9, 1.0), hue(aW.z), 0.35);
  gl_Position = projectionMatrix * mv;
}`,at=`
varying float vT; varying float vAl; varying float vX; varying vec3 vCol;
void main(){
  float a = pow(vT, 2.2) * (1.0 - vX * vX) * vAl;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * a, 1.0);
}`,ot=`
uniform vec2 uRes; uniform vec2 uLine; uniform vec2 uDir; uniform float uR;
varying vec2 vUv; varying float vShade;
void main(){
  vUv = uv;
  vec2 P = (uv - 0.5) * uRes;
  float d = dot(P - uLine, uDir);
  vec3 pos = vec3(P, 0.0);
  vShade = 0.0;
  if (d > 0.0) {
    float a = d / uR;
    vec2 base = P - uDir * d;
    if (a < 3.14159) { pos.xy = base + uDir * sin(a) * uR; pos.z = (1.0 - cos(a)) * uR; }
    else { pos.xy = base - uDir * (d - 3.14159 * uR); pos.z = 2.0 * uR; }
    vShade = clamp(a / 3.14159, 0.0, 1.0);
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,st=`
uniform sampler2D uSnap; uniform vec4 uWin; uniform vec3 uPaper; uniform float uK;
varying vec2 vUv; varying float vShade;
void main(){
  vec2 s = vec2(vUv.x, 1.0 - vUv.y);
  vec2 iu = uWin.xy + s * uWin.zw;
  vec3 front = (iu.x < 0.0 || iu.y < 0.0 || iu.x > 1.0 || iu.y > 1.0) ? uPaper : texture2D(uSnap, vec2(iu.x, 1.0 - iu.y)).rgb;
  vec3 col;
  if (gl_FrontFacing) col = front * (1.0 - 0.25 * sin(vShade * 3.14159));
  else {
    // 纸背：月光下的米色纸（有纤维），越卷越暗
    float fib = fract(sin(dot(floor(vUv * vec2(900.0, 500.0)), vec2(12.9898, 78.233))) * 43758.5453);
    // 第 19 轮：纸背是月光下的米色纸（和首页同一种纸，带一点冷光），不是灰板
    vec3 paper = vec3(0.86, 0.83, 0.76) * (0.94 + 0.06 * fib);
    paper = mix(paper, paper * vec3(0.86, 0.9, 1.05), 0.35);
    col = paper * (0.7 + 0.3 * cos(vShade * 1.5708)) * (0.9 + 0.1 * vUv.y);
  }
  gl_FragColor = vec4(col, uK);
}`,ct=`
// 第 19 轮：手影 / 飞蛾影 = 两张有向距离场插值（手指散开成翅膀），按离纸面的高度模糊（uSoft，像素）
uniform sampler2D uHand, uMoth; uniform float uMorph, uA, uSoft;
varying vec2 vUv;
void main(){
  float dh = (texture2D(uHand, vUv).r - 0.5) * 80.0;
  float dm = (texture2D(uMoth, vUv).r - 0.5) * 80.0;
  float d = mix(dh, dm, smoothstep(0.0, 1.0, uMorph));
  float a = 1.0 - smoothstep(-uSoft, uSoft, d);
  // 半影：影子芯更深一点
  a *= 0.75 + 0.25 * (1.0 - smoothstep(-uSoft * 3.0, 0.0, d));
  // 形变成飞蛾时从影子「凝结」成月光：黑影慢慢变成淡淡的银蓝色剪影（夜景上黑影看不见）
  float g = smoothstep(0.35, 1.0, uMorph);
  vec3 col = mix(vec3(0.05, 0.05, 0.11), vec3(0.78, 0.84, 1.0), g);
  gl_FragColor = vec4(col, a * uA * mix(1.0, 0.55, g));
}`,lt=`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,ut=`
uniform sampler2D tSrc; uniform float uThr; uniform vec4 uFocus; uniform float uFocusK;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb;
  // 半浮点里的 NaN / Inf 会被模糊扩散成黑方块：先洗掉
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
  c = clamp(c, 0.0, 16.0);
  float l = max(c.r, max(c.g, c.b));
  float k = clamp((l - uThr + 0.2) / 0.4, 0.0, 1.0);
  k = k * k * (l > uThr ? 1.0 : 0.6);
  // 作品画面本身别糊：挂毯里面辉光减半（线上的高光照样亮）
  vec2 inF = step(uFocus.xy, vUv) * step(vUv, uFocus.zw);
  k *= mix(1.0, uFocusK, inF.x * inF.y);
  gl_FragColor = vec4(c * k, 1.0);
}`,dt=`
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270;
  vec2 o1 = uDir * 1.3846153, o2 = uDir * 3.2307692;
  c += (texture2D(tSrc, vUv + o1).rgb + texture2D(tSrc, vUv - o1).rgb) * 0.3162162;
  c += (texture2D(tSrc, vUv + o2).rgb + texture2D(tSrc, vUv - o2).rgb) * 0.0702703;
  gl_FragColor = vec4(c, 1.0);
}`,ft=`
uniform sampler2D tScene, tBloom, tHal, tDof; uniform float uTime, uCA, uVig, uGrain, uDof, uBloomK, uFade; uniform vec2 uRes; uniform vec4 uFocus;
varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 c = vUv - 0.5; float r2 = dot(c, c);
  vec3 col;
  if (uCA > 0.0) { vec2 off = c * r2 * uCA * 0.02; col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b); }
  else col = texture2D(tScene, vUv).rgb;
  if (any(isnan(col)) || any(isinf(col))) col = vec3(0.1, 0.12, 0.22);
  if (uDof > 0.0) {
    vec2 q = max(uFocus.xy - vUv, vUv - uFocus.zw);
    float fd = length(max(q, 0.0));
    col = mix(col, texture2D(tDof, vUv).rgb, uDof * smoothstep(0.0, 0.12, fd));
  }
  vec3 b = texture2D(tBloom, vUv).rgb, h = texture2D(tHal, vUv).rgb;
  col += b * 0.9 * uBloomK + h * vec3(1.0, 0.74, 0.48) * 0.5 * uBloomK;
  col *= 1.0 - uVig * smoothstep(0.2, 0.95, length(c * vec2(1.0, 0.92)) * 1.3);
  col += (h21(vUv * uRes + fract(uTime * 7.0) * 113.0) - 0.5) * uGrain;
  gl_FragColor = vec4(col * uFade, 1.0);
}`;w.registerPlugin(ye);var pt=ye.create(`ml-smooth`,`.5,0,0,1`);ye.create(`ml-expo`,`.14,1,.34,1`);var E=e=>{let t=window.__selEv;t&&t.push([e,performance.now()])},mt=(e,t)=>fetch(e).then(t=>t.ok?t.blob():Promise.reject(Error(e))).then(e=>createImageBitmap(e,t?{resizeWidth:t,resizeQuality:`high`,imageOrientation:`flipY`}:{imageOrientation:`flipY`})),ht=(e,t=0,n=1)=>Math.min(n,Math.max(t,e)),gt=(e,t,n)=>{let r=ht((n-e)/(t-e));return r*r*(3-2*r)},_t=32,vt=8,D=.45,yt=-1.05,O=new x(3.1,2.12,-1.5),bt=.42,xt=-7,St=.6,Ct=.8,wt=.6,Tt=class{v=0;vel=0;target=0;k=120;c=18;step(e){let t=this.k*(this.target-this.v)-this.c*this.vel;this.vel+=t*e,this.v+=this.vel*e}};function Et(){let e=new URLSearchParams(location.search).get(`tier`);if(e===`mid`||e===`high`)return e;let t=navigator;return(t.hardwareConcurrency??8)<=4||(t.deviceMemory??8)<=4?`mid`:`high`}var Dt=class{ctx=null;out=null;amb=[];timer=0;on(){try{return localStorage.getItem(`garden:sound`)===`1`}catch{return!1}}ensure(){if(!this.on())return null;try{return this.ctx??=new AudioContext,this.out||(this.out=this.ctx.createGain(),this.out.gain.value=.5,this.out.connect(this.ctx.destination)),this.ctx}catch{return null}}start(){let e=this.ensure();if(!e||this.amb.length)return;let t=e.createBuffer(1,e.sampleRate*2,e.sampleRate),n=t.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=Math.random()*2-1;let r=e.createBufferSource();r.buffer=t,r.loop=!0;let i=e.createBiquadFilter();i.type=`lowpass`,i.frequency.value=420;let a=e.createGain();a.gain.value=.035,r.connect(i).connect(a).connect(this.out),r.start(),this.amb.push(r);let o=e.createBufferSource();o.buffer=t,o.loop=!0;let s=e.createBiquadFilter();s.type=`bandpass`,s.frequency.value=4600,s.Q.value=18;let c=e.createGain();c.gain.value=0;let l=e.createOscillator();l.frequency.value=7;let u=e.createGain();u.gain.value=.02,l.connect(u).connect(c.gain),l.start(),o.connect(s).connect(c).connect(this.out),o.start(),this.amb.push(o,l);let d=[76,0,79,81,0,79,76,0,74,72,0,74,76,0,72,69,0,0,71,0,72,74,0,72,71,0,69,68,0,71,69,0,0,0,0,0],f=[45,52,57,45,52,57,43,50,55,43,50,55,41,48,53,41,48,53,40,47,52,40,47,52,45,52,57,45,52,57,40,47,52,45,0,0],p=0,m=e.currentTime+.2,h=()=>{if(this.ctx)for(;m<this.ctx.currentTime+.4;){let e=d[p%d.length],t=f[p%f.length];e&&this.bell(440*2**((e-69)/12),m,.05),t&&this.bell(440*2**((t+12-69)/12),m,.022),p++,m+=.36}};this.timer=window.setInterval(h,120),h()}stop(){if(window.clearInterval(this.timer),this.amb.forEach(e=>{try{e.stop()}catch{}e.disconnect()}),this.amb=[],this.ctx){let e=this.ctx;this.ctx=null,this.out=null,setTimeout(()=>void e.close().catch(()=>{}),300)}}bell(e,t,n){let r=this.ctx,i=r.createOscillator(),a=r.createOscillator(),o=r.createGain();i.type=`sine`,i.frequency.value=e,a.type=`sine`,a.frequency.value=e*4.07;let s=r.createGain();s.gain.value=.25,o.gain.setValueAtTime(0,t),o.gain.linearRampToValueAtTime(n,t+.005),o.gain.exponentialRampToValueAtTime(1e-4,t+1.6),i.connect(o),a.connect(s).connect(o),o.connect(this.out),i.start(t),a.start(t),i.stop(t+1.7),a.stop(t+1.7)}harp(e,t){let n=this.ensure();if(!n)return;let r=[0,2,4,7,9],i=Math.floor(ht(e)*14),a=440*2**((62+Math.floor(i/5)*12+r[i%5]-69)/12),o=n.currentTime,s=n.createOscillator();s.type=`triangle`,s.frequency.value=a;let c=n.createBiquadFilter();c.type=`lowpass`,c.frequency.setValueAtTime(a*8,o),c.frequency.exponentialRampToValueAtTime(a*1.5,o+.8);let l=n.createGain();l.gain.setValueAtTime(0,o),l.gain.linearRampToValueAtTime(.07*ht(t,.3,1),o+.004),l.gain.exponentialRampToValueAtTime(1e-4,o+1.4),s.connect(c).connect(l).connect(this.out),s.start(o),s.stop(o+1.5)}ding(e=1){let t=this.ensure();t&&(this.bell(1568*e,t.currentTime,.06),this.bell(2349*e,t.currentTime+.05,.03))}bloom(){let e=this.ensure();if(!e)return;let t=e.currentTime;[659,831,988,1319].forEach((e,n)=>this.bell(e,t+n*.07,.03))}};async function k(a){let{root:C}=a,ye=a.works,k=ye.filter(e=>!e.section),Ot=ye.filter(e=>e.section===`tech`);JSON.parse(C.querySelector(`script[data-selector-strings]`)?.textContent??`{}`);let kt=C.querySelector(`.sel-stage`),At=C.querySelector(`.ml-caption`),A=Math.max(0,k.findIndex(e=>e.id===a.startAt));Ot.findIndex(e=>e.id===a.startAt);let jt=Et(),Mt=C.hidden,j=jt===`high`;w.ticker.lagSmoothing(40,16);let Nt=Number(window.__slow??0);Nt>0&&Nt<=1&&w.globalTimeline.timeScale(Nt);let Pt=()=>new Promise(e=>requestAnimationFrame(()=>e())),Ft=performance.now(),M=async()=>{performance.now()-Ft>6&&(await Pt(),Ft=performance.now())},It=new Dt;E(`b:start`);let N=document.createElement(`canvas`),P=new se({canvas:N,antialias:!1,alpha:!1,powerPreference:`high-performance`,preserveDrawingBuffer:!1}),Lt=Math.min(devicePixelRatio||1,j?1.5:1.25);if(P.setPixelRatio(Lt),P.outputColorSpace=u,P.toneMapping=0,P.autoClear=!1,P.setClearColor(`#151a30`,1),P.debug.checkShaderErrors=location.search.includes(`glcheck`),N.style.opacity=`0`,kt.appendChild(N),!(P.getContext()instanceof WebGL2RenderingContext))throw P.dispose(),N.remove(),Error(`没有 WebGL2`);let F=innerWidth,I=innerHeight;P.setSize(F,I,!1);let Rt=[],L=e=>(Rt.push(e),e),R=(e,t=!0,n=!0)=>{let r=L(new fe(e));return r.flipY=t,r.generateMipmaps=n,r.minFilter=n?l:c,r.anisotropy=4,r.needsUpdate=!0,r},zt=new ne,Bt=new p(30,F/I,1,2e4),z={uSnap:{value:null},uWin:{value:new oe(0,0,1,1)},uPaper:{value:new ae(`#3e3a4a`)},uK:{value:1},uRes:{value:new y(F,I)},uLine:{value:new y(1e5,1e5)},uDir:{value:new y(-.8,-.6)},uR:{value:90}},Vt=new s(L(new o(1,1,96,54)),L(new S({uniforms:z,vertexShader:ot,fragmentShader:st,side:2,transparent:!0,depthTest:!0})));Vt.frustumCulled=!1,zt.add(Vt);let Ht=L(new h(new Uint8Array([255,255,255,255]),1,1));Ht.needsUpdate=!0;let B={uHand:{value:Ht},uMoth:{value:Ht},uMorph:{value:0},uA:{value:0},uSoft:{value:24}};(async()=>{await Pt(),B.uHand.value=R(we(),!0,!1),await Pt(),B.uMoth.value=R(Ne(),!0,!1),await Pt(),Mt&&C.hidden&&(C.style.visibility=`hidden`,C.hidden=!1)})();let Ut=new s(L(new o(1,1)),L(new S({uniforms:B,vertexShader:lt.replace(`gl_Position = vec4(position.xy, 0.0, 1.0)`,`gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)`),fragmentShader:ct,transparent:!0,depthTest:!1})));Ut.renderOrder=10,Ut.frustumCulled=!1,zt.add(Ut);let Wt=()=>{Bt.aspect=F/I,Bt.position.set(0,0,I/2/Math.tan(r.degToRad(15))),Bt.lookAt(0,0,0),Bt.updateProjectionMatrix(),z.uRes.value.set(F,I),Vt.scale.set(1,1,1)};Wt();let Gt=null,Kt=()=>{let e=a.garden?.();if(!e)return!1;let t=ke(1280,720);try{t.getContext(`2d`).drawImage(e.image,0,0,1280,720)}catch{return!1}Gt?.dispose(),Gt=new fe(t),Gt.generateMipmaps=!1,Gt.minFilter=c,Gt.needsUpdate=!0,z.uSnap.value=Gt;let n=e.rect;return z.uWin.value.set(-n.left/n.width,-n.top/n.height,F/n.width,I/n.height),z.uPaper.value.set(`#3e3a4a`),!0};E(`b:phase1`);let V=new ne,qt=new p(_t,F/I,.1,60),Jt=new x(0,D,0);qt.layers.enable(3);let H={uTime:{value:0},uFlash:{value:0},uPtr:{value:new y}},U={x:0,y:D,w:3.75,h:2.11},Yt=e=>{let t=e*Math.tan(r.degToRad(_t/2));return{hh:t,hw:F/I*t}},Xt=()=>{let{hh:e,hw:t}=Yt(vt);U.w=Math.min(.92*t,2*e*.5*16/9),U.h=U.w*9/16,U.x=.12*t,Jt.set(U.x,D,0)};Xt();let Zt=!1,Qt=!1,W=`idle`,G,K,$t,en,tn,nn,rn,an,on,sn,cn,ln,un,dn,fn,pn=[],q,mn={const0:0,nConst:0,frame0:0,pearl0:0,lily0:0,met0:0,needle0:0},hn=[],gn,_n=[],vn=[],yn,J,bn,Y,xn,Sn=Array.from({length:10},()=>new oe(0,0,-99,0)),Cn=0,wn=Array.from({length:6},()=>new oe(0,-99,0,1)),Tn=0,En=[],Dn=[],On=[],kn={value:0},An={type:pe,depthBuffer:!1},jn=L(new b(1,1,{type:pe,samples:j?4:0,depthBuffer:!0})),Mn=[L(new b(1,1,An)),L(new b(1,1,An))],Nn=[L(new b(1,1,An)),L(new b(1,1,An))],Pn=[L(new b(1,1,An)),L(new b(1,1,An))],Fn=new ne,In=new f(-1,1,1,-1,0,1),Ln=new s(L(new o(2,2)));Ln.frustumCulled=!1,Fn.add(Ln);let Rn={tSrc:{value:null},uThr:{value:.64},uFocus:{value:new oe},uFocusK:{value:.45}},X={tSrc:{value:null},uDir:{value:new y}},Z={tScene:{value:null},tBloom:{value:null},tHal:{value:null},tDof:{value:null},uTime:H.uTime,uCA:{value:j?.45:0},uVig:{value:.28},uGrain:{value:.022},uDof:{value:0},uBloomK:{value:1},uFade:{value:1},uRes:{value:new y(F,I)},uFocus:{value:new oe}},zn=(e,t)=>L(new S({uniforms:t,vertexShader:lt,fragmentShader:e,depthTest:!1,depthWrite:!1})),Bn=zn(ut,Rn),Vn=zn(dt,X),Hn=zn(ft,Z),Un=zn(`uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tSrc, vUv); }`,{tSrc:X.tSrc}),Wn=(e,t)=>{Ln.material=e,P.setRenderTarget(t),P.render(Fn,In)},Gn=[L(new b(854,480,{depthBuffer:!1})),L(new b(854,480,{depthBuffer:!1}))],Kn=0,qn={tNew:{value:null},tOld:{value:Gn[1].texture},uK:{value:1}},Jn=zn(`uniform sampler2D tNew, tOld; uniform float uK; varying vec2 vUv; void main(){ gl_FragColor = vec4(mix(texture2D(tOld, vUv).rgb, texture2D(tNew, vUv).rgb, uK), 1.0); }`,qn),Yn=()=>{kn.value<=0||!qn.tNew.value||(qn.tOld.value=Gn[1-Kn].texture,Wn(Jn,Gn[Kn]),qn.uK.value=.2,G.uVid.value=K.uVid.value=Gn[Kn].texture,Kn=1-Kn)},Xn=()=>{let e=Math.round(F*Lt),t=Math.round(I*Lt);jn.setSize(e,t),Mn.forEach(n=>n.setSize(Math.max(1,e>>2),Math.max(1,t>>2))),Nn.forEach(n=>n.setSize(Math.max(1,e>>3),Math.max(1,t>>3))),Pn.forEach(n=>n.setSize(Math.max(1,e>>2),Math.max(1,t>>2))),Z.uRes.value.set(e,t)};Xn();let Q={x:0,y:D,z:vt,lx:0,ly:D,orbit:0,breath:1},Zn=()=>.14*Yt(vt).hw,Qn=()=>({x:U.x-Zn(),y:D,z:vt,lx:U.x-Zn(),ly:D}),$n=!0,er={x:0,y:0},tr=0,nr=()=>{let e=1+.006*Math.sin(tr*.6)*Q.breath,t=Q.x-Q.lx,n=(Q.z-0)*e,i=r.degToRad(Q.orbit);qt.position.set(Q.lx+Math.sin(i)*n+t*Math.cos(i)+er.x*.12,Q.y+er.y*.06+Math.sin(tr*.23)*.015*Q.breath,Math.cos(i)*n),qt.lookAt(Q.lx+er.x*.04,Q.ly,0),qt.aspect=F/I,qt.updateProjectionMatrix(),qt.updateMatrixWorld()};Object.assign(Q,Qn()),nr();let rr=new x,ir=e=>(rr.copy(e).project(qt),{x:(rr.x*.5+.5)*F,y:(1-(rr.y*.5+.5))*I,z:rr.z}),ar=new m,or=new y,sr=(e,t)=>(or.set(e/F*2-1,-(t/I)*2+1),ar.setFromCamera(or,qt),ar.ray),cr=new i(new x(0,0,1),0),lr=new x,ur=(e,t)=>{if(!sr(e,t).intersectPlane(cr,lr))return null;let n=(lr.x-(U.x-U.w/2))/U.w,r=(lr.y-(D-U.h/2))/U.h;return n>=0&&n<=1&&r>=0&&r<=1?{u:n,v:r}:null},dr=()=>{let e=ir(new x(U.x-U.w/2,D+U.h/2,0)),t=ir(new x(U.x+U.w/2,D-U.h/2,0));return{x:e.x,y:e.y,w:t.x-e.x,h:t.y-e.y}},fr=0,pr=0;async function mr(){let[i,...a]=await Promise.all([mt(`/keyframes/desktop/K4.webp`),...k.map(e=>mt(e.still||e.poster,1280).catch(()=>null))]);if(a.forEach((e,t)=>{On[t]=e}),Qt)return;await M();let c=R(i,!1);k.forEach((e,t)=>{Dn[t]=On[t]?R(On[t],!1):c});let l=L(new h(new Uint8Array([40,44,70,255]),1,1));l.needsUpdate=!0;{let{hh:e,hw:t}=Yt(15),n=t*2*1.04,r=e*2*1.06,i=n*2.2,a=r*1.5;en={uPaint:{value:c},uScale:{value:new y(i/n,a/r)},uTime:H.uTime,uFlash:H.uFlash,uVelvetK:{value:1},uHalo:{value:new y},uPtr:H.uPtr};let l=new s(L(new o(i,a)),L(new S({uniforms:en,vertexShader:Fe,fragmentShader:Ie,depthWrite:!1})));l.position.set(U.x-Zn(),D+(a-r)*.18,xt),l.renderOrder=-10,V.add(l);let u=U.x-Zn(),d=O.clone().sub(new x(u,D,vt)),f=-15/d.z;en.uHalo.value.set(u+d.x*f,D+d.y*f)}await M();let u=j?900:450,f=u+k.reduce((e,t)=>e+Ae(t.id).pts.length,0)+4+26+Ot.length+24+3;{let e=L(new t),r=new o(1,1);e.index=r.index,e.setAttribute(`position`,r.getAttribute(`position`));let i=new n(new Float32Array(f*3),3),a=new n(new Float32Array(f*4),4),c=new n(new Float32Array(f*4),4);i.setUsage(g),a.setUsage(g),c.setUsage(g),e.setAttribute(`aP`,i),e.setAttribute(`aS`,a),e.setAttribute(`aC`,c),e.instanceCount=f;let l=L(new S({uniforms:{uTime:H.uTime,uFlash:H.uFlash,uPtr:H.uPtr},vertexShader:Le,fragmentShader:Re,transparent:!0,depthWrite:!1,blending:2})),d=new s(e,l);d.frustumCulled=!1,d.renderOrder=20,V.add(d),q={mesh:d,P:i,Sz:a,C:c,n:f};let p=Ee(5);for(let e=0;e<u;e++){let t=0,n=0;for(let e=0;e<8;e++){t=U.x+(p()-.5)*22,n=.2+p()*5.4;let e=n-2.2+(t-.5)*.22;if(Math.abs(e)<.9||p()<.45)break}i.setXYZ(e,t,n,-5.6+p()*.8),a.setXYZ(e,.035+p()*p()*.07,2,p()),a.setW(e,.6+p()*.4),c.setXYZW(e,1,1,1,0)}mn.const0=u}await M();{let e=mn.const0,t=[],n=[];k.forEach((r,i)=>{let a=Ae(r.id),o=U.x-U.w*.48+i/Math.max(1,k.length)*U.w*.98,s=U.w*.98/Math.max(1,k.length)*.86,c=a.pts.map(([e,t])=>new x(o+e*s,D+U.h/2+.28+t*.55,-.8)),l=e;c.forEach((t,n)=>{q.P.setXYZ(e,t.x,t.y,t.z);let r=a.main.includes(n);q.Sz.setXYZW(e,r?.16:.09,r?0:2,(i*7+n)*.137%1,.3),q.C.setXYZW(e,1,1,1,0),e++}),a.links.forEach(([e,r])=>{t.push(c[e].x,c[e].y,c[e].z,c[r].x,c[r].y,c[r].z),n.push(i,i)}),hn.push({pts:c,links:a.links,main:a.main,alpha:{v:i===A?1:.28},sign:{start:l,n:c.length,raw:a.pts}})}),mn.nConst=e-mn.const0;let r=L(new _);r.setAttribute(`position`,new d(t,3)),r.setAttribute(`aW`,new d(n,1)),gn=new ie(r,L(new S({uniforms:{uA:{value:new Float32Array(16)}},transparent:!0,depthWrite:!1,blending:2,vertexShader:`attribute float aW; uniform float uA[16]; varying float vA; void main(){ int i = int(aW + 0.5); float a = 0.0; for (int k = 0; k < 16; k++) if (k == i) a = uA[k]; vA = a; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`varying float vA; void main(){ gl_FragColor = vec4(vec3(0.8, 0.68, 0.42) * vA * 0.5, 1.0); }`}))),gn.renderOrder=19,V.add(gn),mn.frame0=e,e+=4,mn.pearl0=e;for(let t=0;t<26;t++){let n=t/26*Math.PI*2;q.P.setXYZ(e,O.x+Math.cos(n)*bt*1.2,O.y+Math.sin(n)*bt*1.2,O.z+.02),q.Sz.setXYZW(e,.07,1,t*.11%1,1),q.C.setXYZW(e,1,1,1,0),e++}mn.lily0=e,e+=Ot.length,mn.met0=e,e+=24,mn.needle0=e,e+=3}await M();{on={uTime:H.uTime,uPtr:H.uPtr,uK:{value:.7}};let e=new s(L(new o(bt*2,bt*2)),L(new S({uniforms:on,vertexShader:Ze,fragmentShader:ze,transparent:!0})));e.position.copy(O),V.add(e);let t=De();sn={uMap:{value:R(t)},uTime:H.uTime,uK:{value:1},uPolish:{value:.8},uPtr:H.uPtr,uTex:{value:new y(1.5/512,1.5/512)}};let n=bt*2*1.42,r=new s(L(new o(n,n)),L(new S({uniforms:sn,vertexShader:Ze,fragmentShader:Be,transparent:!0,depthWrite:!1})));r.position.copy(O).add(new x(0,0,.01)),V.add(r);let i={uTime:H.uTime,uA:{value:j?.075:.05}},a=L(new S({uniforms:i,vertexShader:Ze,fragmentShader:Qe,transparent:!0,depthWrite:!1,blending:2,side:2}));for(let e=0;e<3;e++){let t=new s(L(new o(.7+e*.3,7)),a);t.position.set(O.x-1.6-e*.9,O.y-2.6,O.z+1.2+e*.6),t.rotation.z=-.55-e*.12,t.renderOrder=15,V.add(t)}}await M();{let e=j?.5:.35;ln=new Pe(L(new o(60,16)),{textureWidth:Math.round(F*Lt*e),textureHeight:Math.round(I*Lt*e),clipBias:.003,multisample:0,shader:$e}),ln.rotation.x=-Math.PI/2,ln.position.set(U.x,yt,-.5),ln.renderOrder=-5,an=ln.material.uniforms,an.uRip.value=Sn,an.uTime=H.uTime,an.uFlash=H.uFlash,an.uMoonX.value=O.x,V.add(ln),Rt.push(ln),ln.getReflectionCamera(qt).layers.disable(3)}await M();for(let e of[{y:-.4,z:-4.5,w:30,h:2.6,a:.16,sp:.012,layer:0},{y:-.75,z:-1.8,w:26,h:1.1,a:.2,sp:.02,layer:0},{y:-.95,z:3.4,w:16,h:1.4,a:.14,sp:.03,layer:3}]){let t={uTime:H.uTime,uA:{value:e.a},uSpeed:{value:e.sp},uFlash:H.uFlash,uCol:{value:new ae(.62,.66,.8)}},n=new s(L(new o(e.w,e.h)),L(new S({uniforms:t,vertexShader:Ze,fragmentShader:Xe,transparent:!0,depthWrite:!1})));n.position.set(U.x,e.y,e.z),n.renderOrder=25,e.layer&&n.layers.set(e.layer),V.add(n)}await M(),tn={uMap:{value:R(await je(async()=>{await Pt(),Ft=performance.now()}))},uTime:H.uTime,uFlash:H.uFlash,uWaveR:{value:0},uWaveC:{value:new x},uK:{value:1}};let p=Ee(31),m=[],ne=[],b=j?46:26;for(let e=0;e<b;e++)m.push({p:new x(U.x+(p()-.5)*16,-1.03,-2.6-p()*1.6),s:.32+p()*.3,k:Math.floor(p()*3),blur:0});let oe=j?30:16;for(let e=0;e<oe;e++){let t=e%2?1:-1;m.push({p:new x(U.x+t*(3.2+p()*2.6),-1.03-p()*.1,-.6+p()*2.6),s:.5+p()*.45,k:Math.floor(p()*3),blur:0})}let se=j?12:6;for(let e=0;e<se;e++){let t=e%2?1:-1;ne.push({p:new x(U.x+t*(1.7+p()*1.8),-1.75-p()*.3,4.3+p()*1.3),s:.9+p()*.6,k:Math.floor(p()*3),blur:.6+p()*.4})}let C=(e,r)=>{let i=L(new t),a=new o(1,1);i.index=a.index,i.setAttribute(`position`,a.getAttribute(`position`));let c=new n(new Float32Array(e.length*3),3),l=new n(new Float32Array(e.length*4),4),u=new n(new Float32Array(e.length),1);u.setUsage(g),e.forEach((e,t)=>{c.setXYZ(t,e.p.x,e.p.y,e.p.z),l.setXYZW(t,e.s,e.k,p(),e.blur);let n=new Tt;n.k=30,n.c=9,pn.push({p:e.p,open:n,hold:0,geo:u,i:t,head:e.p.clone().add(new x(0,e.s*.5,0)),burst:!1})}),i.setAttribute(`aP`,c),i.setAttribute(`aD`,l),i.setAttribute(`aOpen`,u),i.instanceCount=e.length;let d=L(new S({uniforms:tn,vertexShader:Ke,fragmentShader:qe,transparent:!0,depthWrite:!1})),f=new s(i,d);return f.frustumCulled=!1,f.renderOrder=r?40:5,r&&f.layers.set(3),V.add(f),f};C(m,!1),C(ne,!0),await M();let pe=(t,n,r,i,a,c)=>{let l=new e;l.position.copy(t);let u={uOpen:{value:0},uTime:H.uTime,uBend:{value:1},uGlass:{value:new ae(r)},uGlass2:{value:new ae(i)},uGlow:{value:0},uK:{value:1},uPtr:H.uPtr},d=L(new S({uniforms:u,vertexShader:Je,fragmentShader:Ye,transparent:!0,side:2,depthWrite:!0})),f=L(new o(.17*n,.46*n,4,10));f.translate(0,.23*n,0);let p=[];for(let t=0;t<a;t++){let n=new e;n.rotation.y=t/a*Math.PI*2+t%2*.2;let r=new s(f,d);r.userData.ring=t%2,n.add(r),l.add(n),p.push(r)}let m=new s(L(new ue(.045*n,20,14)),L(new S({uniforms:{uTime:H.uTime},vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`uniform float uTime; varying vec3 vN; varying vec3 vV; ${T}
          void main(){ vec3 n = normalize(vN); float f = pow(1.0 - max(0.0, dot(n, vV)), 2.0); vec3 L = normalize(vec3(-0.3, 0.8, 0.6));
            vec3 c = vec3(0.92, 0.88, 0.8) * (0.5 + 0.5 * max(0.0, dot(n, L))) + hue(fract(f + uTime * 0.03)) * f * 0.3 + pow(max(0.0, dot(reflect(-L, n), vV)), 30.0) * 0.8;
            gl_FragColor = vec4(c, 1.0); }`})));m.position.y=.05*n,l.add(m),V.add(l);let h=new Tt;h.k=16,h.c=6,_n.push({g:l,petals:p,u,open:h,pos:t,main:c})};if(pe(new x(U.x-U.w*.62,-1.03,1),1.25,`#eef0ff`,`#c9c4f0`,12,!0),pe(new x(U.x+U.w*.7,-1.03,.4),.8,`#f4d9ee`,`#b98fd0`,8,!1),pe(new x(U.x-U.w*1.1,-1.03,-1.4),.7,`#d9ecff`,`#8fb0d8`,8,!1),await M(),Ot.length){let e=R(Oe()),r=L(new t),i=new o(1,.62);r.index=i.index,r.setAttribute(`position`,i.getAttribute(`position`));let a=new n(new Float32Array(Ot.length*3),3),c=new n(new Float32Array(Ot.length),1);c.setUsage(g);let u=Math.min(5.6,U.w*1.45);Ot.forEach((e,t)=>{let n=U.x-u/2+(t+.5)*(u/Ot.length),r=.7+t%2*.35,i=new x(n,-1.04,r);a.setXYZ(t,i.x,i.y,i.z);let o=new Tt;o.k=40,o.c=10;let c={uVid:{value:l},uA:{value:0},uTime:H.uTime};mt(e.still||e.poster,480).then(e=>{Qt||(En[t]=R(e,!1),c.uVid.value=En[t])}).catch(()=>{});let d=new s(L(new v(.34,48)),L(new S({uniforms:c,transparent:!0,depthWrite:!1,vertexShader:Ze,fragmentShader:`uniform sampler2D uVid; uniform float uA, uTime; varying vec2 vUv;
            void main(){ vec2 p = vUv * 2.0 - 1.0; float r = length(p);
              vec2 vu = vec2(0.5 + p.x * 0.5 * 0.5625, vUv.y);
              vec3 v = texture2D(uVid, vec2(0.5 + p.x * 0.28, vUv.y)).rgb;
              float inner = 1.0 - smoothstep(0.86, 0.9, r);
              float ring = exp(-pow((r - 0.93) * 40.0, 2.0)) + exp(-pow((r - 0.98) * 60.0, 2.0)) * 0.6;
              float bead = step(0.6, fract(atan(p.y, p.x) * 6.0)) * exp(-pow((r - 0.98) * 50.0, 2.0));
              vec3 col = v * inner + vec3(0.86, 0.9, 1.0) * (ring + bead) * (0.8 + 0.2 * sin(uTime * 2.0 + r * 9.0));
              gl_FragColor = vec4(col * uA, max(inner, ring) * uA); }`})));d.position.copy(i).add(new x(0,.55,0)),d.visible=!1,d.renderOrder=30,V.add(d),vn.push({p:i,open:o,w:e,star:i.clone().add(new x(0,.12,0)),ring:d})}),r.setAttribute(`aP`,a),r.setAttribute(`aOpen`,c),r.instanceCount=Ot.length,yn=new s(r,L(new S({uniforms:{uMap:{value:e},uTime:H.uTime,uFlash:H.uFlash},transparent:!1,depthWrite:!0,vertexShader:`attribute vec3 aP; attribute float aOpen; varying vec2 vUv; varying float vO;
          void main(){ vUv = position.xy / vec2(1.0, 0.62) + 0.5; vO = aOpen;
            vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
            vec3 p = aP + camR * position.x * 0.62 + vec3(0.0, 1.0, 0.0) * (position.y + 0.31) * 0.62 - vec3(0.0, 0.08, 0.0);
            gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,fragmentShader:`uniform sampler2D uMap; uniform float uTime, uFlash; varying vec2 vUv; varying float vO;
          void main(){ vec4 a = texture2D(uMap, vec2(vUv.x * 0.5, vUv.y)), b = texture2D(uMap, vec2(0.5 + vUv.x * 0.5, vUv.y));
            vec4 c = mix(a, b, smoothstep(0.2, 0.8, vO)); if (c.a < 0.35) discard;
            vec3 col = c.rgb * vec3(0.8, 0.86, 1.0) * (0.55 + 0.5 * vO) * (1.0 + uFlash * 0.5);
            col += vec3(1.0, 0.85, 0.55) * exp(-length(vUv - vec2(0.5, 0.35)) * 6.0) * vO * 0.4;
            gl_FragColor = vec4(col, 1.0); }`}))),yn.frustumCulled=!1,yn.renderOrder=6,V.add(yn),yn.userData.O=c}await M();{let e=j?420:200,r=Math.round(e*9/16);fr=e,pr=r;let i=e*r,a=L(new t),c=new o(1,1);a.index=c.index,a.setAttribute(`position`,c.getAttribute(`position`));let u=new Float32Array(i*2),d=new Float32Array(i*4),f=Ee(1234),p=0;for(let t=0;t<r;t++){for(let n=0;n<e;n++,p++)u[p*2]=(n+.5+t%2*.5)/(e+.5),u[p*2+1]=(t+.5)/r,d[p*4]=0,d[p*4+1]=0,d[p*4+2]=Math.floor(f()*8),d[p*4+3]=f();t%24==0&&await M()}a.setAttribute(`aCell`,new n(u,2)),a.setAttribute(`aKey`,new n(d,4)),a.instanceCount=i,G={uGrid:{value:new y(e,r)},uC:{value:new x(U.x,D,0)},uSize:{value:new y(U.w,U.h)},uTime:H.uTime,uWeave:{value:0},uWeaveMode:{value:0},uWeaveO:{value:new y(.5,-.15)},uUnpick:{value:0},uPart:{value:0},uSway:{value:1},uStars:{value:Array.from({length:8},()=>new x)},uStarN:{value:1},uPluck:{value:wn},uDrag:{value:new x},uDirMap:{value:Dn[A]??l},uVid:{value:Gn[0].texture},uPoster:{value:Dn[A]??l},uVidK:kn,uK:{value:1.18},uPtr:H.uPtr,uLight:{value:new x(.45,.55,.7).normalize()}},un=new s(a,L(new S({uniforms:G,vertexShader:Ve,fragmentShader:He,transparent:!1,alphaToCoverage:j,depthWrite:!0}))),un.frustumCulled=!1,un.renderOrder=10,V.add(un),K={uVid:{value:Gn[0].texture},uPoster:{value:Dn[A]??l},uVidK:kn,uK:{value:0},uFull:{value:0},uPosterK:{value:0}},dn=new s(L(new o(1,1)),L(new S({uniforms:K,vertexShader:Ze,fragmentShader:Ue,transparent:!0,depthWrite:!1}))),dn.renderOrder=8,V.add(dn);let m=Ce(1024,Math.round(1024*(U.h+.3)/(U.w+.3)),34);cn={uMap:{value:R(m)},uTime:H.uTime,uK:{value:0},uPolish:{value:.55},uPtr:H.uPtr,uTex:{value:new y(1.5/m.width,1.5/m.height)}},fn=new s(L(new o(1,1)),L(new S({uniforms:cn,vertexShader:Ze,fragmentShader:Be,transparent:!0,depthWrite:!1}))),fn.renderOrder=12,V.add(fn),hr()}await M();{let e=j?260:130,r=e+(j?24:12),i=L(new t),a=new o(1,1,1,40);i.index=a.index,i.setAttribute(`position`,a.getAttribute(`position`));let c=new n(new Float32Array(r*4),4),l=new n(new Float32Array(r*4),4),u=Ee(88);for(let t=0;t<e;t++){let n=t/(e-1);c.setXYZW(t,U.x-U.w/2+n*U.w,D+U.h/2+.01,0,u()),l.setXYZW(t,0,.004+u()*.003,0,1-n)}for(let t=e;t<r;t++){let e=u(),n=Math.floor(u()*4),r=n<2?U.x+(e-.5)*U.w:U.x+(n===2?-.5:.5)*U.w,i=n<2?D+(n===0?.5:-.5)*U.h:D+(e-.5)*U.h;c.setXYZW(t,r,i,.02,u()),l.setXYZW(t,1,.003,0,0)}i.setAttribute(`aA`,c),i.setAttribute(`aB`,l),i.instanceCount=r,$t={uFrom:{value:O.clone().add(new x(-.1,-.252,.05))},uTime:H.uTime,uWarp:{value:0},uCamZ:{value:vt},uK:{value:1}};let d=new s(i,L(new S({uniforms:$t,vertexShader:We,fragmentShader:Ge,transparent:!0,depthWrite:!1,blending:2,side:2})));d.frustumCulled=!1,d.renderOrder=18,V.add(d)}await M();{let e=j?260:110,t=j?140:60,n=j?120:50,i=e+t+n,a=new Float32Array(i*4),o=new Float32Array(i*4),s=Ee(64);for(let n=0;n<i;n++){let r=n<e?0:n<e+t?1:2,i=r===0?-4+s()*10:-3+s()*7.5;a.set([U.x+(s()-.5)*14,r===0?-.9+s()*2.4:yt+s()*3.5,i,s()],n*4),o.set([r,r===0?.035+s()*.03:r===1?.04+s()*.025:.025,.12+s()*.18,0],n*4)}let c=L(new _);c.setAttribute(`position`,new de(new Float32Array(i*3),3)),c.setAttribute(`aP`,new de(a,4)),c.setAttribute(`aQ`,new de(o,4)),nn={uTime:H.uTime,uPx:{value:I*Lt/(2*Math.tan(r.degToRad(_t/2)))},uWhirl:{value:0},uWhirlC:{value:new x(U.x,D,.5)},uFlash:H.uFlash};let l=new le(c,L(new S({uniforms:nn,vertexShader:et,fragmentShader:tt,transparent:!0,depthWrite:!1,blending:2})));l.frustumCulled=!1,l.renderOrder=35,V.add(l)}{let e=L(new _),t=new de(new Float32Array(1260),3),n=new de(new Float32Array(1680).fill(-99),4);t.setUsage(g),n.setUsage(g),e.setAttribute(`position`,new de(new Float32Array(1260),3)),e.setAttribute(`aO`,t),e.setAttribute(`aV`,n),rn={uTime:H.uTime,uPx:nn.uPx};let r=new le(e,L(new S({uniforms:rn,vertexShader:nt,fragmentShader:rt,transparent:!0,depthWrite:!1,blending:2})));r.frustumCulled=!1,r.renderOrder=36,V.add(r),Y={pts:r,O:t,V:n,head:0,n:420}}{let e=L(new t),r=new o(1,1,1,8);e.index=r.index,e.setAttribute(`position`,r.getAttribute(`position`));let i=new n(new Float32Array(72),3),a=new n(new Float32Array(72),3),c=new n(new Float32Array(96),4);[i,a,c].forEach(e=>e.setUsage(g)),e.setAttribute(`aA`,i),e.setAttribute(`aB`,a),e.setAttribute(`aW`,c),e.instanceCount=24;let l=new s(e,L(new S({vertexShader:it,fragmentShader:at,transparent:!0,depthWrite:!1,blending:2,side:2})));l.frustumCulled=!1,l.renderOrder=34,V.add(l),xn={mesh:l,A:i,B:a,Wd:c,slots:Array.from({length:24},()=>({on:!1,p:new x,v:new x,t:0,life:0,kind:`sky`,col:new ae,gemKind:0,hue:0}))}}await M();{let[t,n]=Te(),r={uCol:{value:R(t)},uGold:{value:R(n)},uTime:H.uTime,uFlap:{value:0},uPtr:H.uPtr,uA:{value:0}},i=L(new S({uniforms:r,transparent:!0,side:2,depthWrite:!1,vertexShader:Ze,fragmentShader:`uniform sampler2D uCol, uGold; uniform float uTime, uFlap, uA; uniform vec2 uPtr; varying vec2 vUv; ${T}
          void main(){ vec4 c = texture2D(uCol, vUv); float g = texture2D(uGold, vUv).r; if (c.a < 0.1) discard;
            vec3 glass = c.rgb * (0.55 + 0.7 * (0.5 + 0.5 * sin(uFlap * 2.0)));
            glass = mix(glass, glass * hue(fract(uFlap * 0.15 + vUv.x * 0.4)) * 1.4, 0.35);
            float sp = pow(max(0.0, sin(vUv.x * 12.0 + vUv.y * 9.0 + uFlap * 3.0 + uPtr.x * 4.0)), 20.0);
            vec3 gold = vec3(0.88, 0.7, 0.38) * (0.7 + 0.5 * sp) + sp * 0.6;
            gl_FragColor = vec4(mix(glass, gold, g) * uA, mix(0.82, 1.0, g) * uA); }`})),a=.13,c=L(new o(a,a));c.translate(a/2,0,0);let l=new e,u=new s(c,i),d=new s(c,i);d.scale.x=-1;let f=new e,p=new e;f.add(u),p.add(d),l.add(f,p);let m=new s(L(new te(.009,.06,4,10)),L(new S({uniforms:{uTime:H.uTime,uA:r.uA},vertexShader:`varying vec3 vN; varying float vY; void main(){ vN = normalize(normalMatrix * normal); vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float uA; varying vec3 vN; varying float vY; void main(){ float ridge = 0.75 + 0.25 * sin(vY * 300.0); float s = pow(max(0.0, dot(normalize(vN), normalize(vec3(-0.3, 0.6, 0.8)))), 12.0);
          gl_FragColor = vec4((vec3(0.85, 0.66, 0.34) * ridge * 0.8 + s) * uA, uA); }`,transparent:!0})));l.add(m);let h=ke(64,64);{let e=h.getContext(`2d`),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,`rgba(255,240,210,0.9)`),t.addColorStop(.3,`rgba(200,210,255,0.35)`),t.addColorStop(1,`rgba(160,170,255,0)`),e.fillStyle=t,e.fillRect(0,0,64,64)}let ne=new ee(L(new ce({map:R(h),transparent:!0,depthWrite:!1,blending:2,opacity:0})));ne.scale.setScalar(.34),l.add(ne),l.renderOrder=60,V.add(l),J={g:l,wL:p,wR:f,u:r,pos:new x(U.x,D,1),vel:new x,target:new x(U.x,D,1),auto:!0,glow:ne},l.visible=!1;let v=L(new _),y=new Float32Array(210).fill(0),b=new Float32Array(70).fill(9);v.setAttribute(`position`,new de(y,3).setUsage(g)),v.setAttribute(`aAge`,new de(b,1).setUsage(g));let re=new le(v,L(new S({uniforms:{uPx:nn.uPx},vertexShader:`attribute float aAge; uniform float uPx; varying float vA; void main(){ vA = max(0.0, 1.0 - aAge / 1.2); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = vA > 0.0 ? clamp(0.03 * uPx / -mv.z * (0.5 + vA), 1.0, 10.0) : 0.0; gl_Position = projectionMatrix * mv; }`,fragmentShader:`varying float vA; void main(){ if (vA <= 0.0) discard; float r = length(gl_PointCoord * 2.0 - 1.0); gl_FragColor = vec4(vec3(0.85, 0.88, 1.0) * exp(-r * r * 5.0) * vA * 0.7, 1.0); }`,transparent:!0,depthWrite:!1,blending:2})));re.frustumCulled=!1,re.renderOrder=59,V.add(re),bn={pts:re,buf:y,age:b,head:0}}await M(),vr(A),_r();for(let e of[...V.children]){try{await P.compileAsync(e,qt,V)}catch{}await Pt()}for(let e of[Bn,Vn,Hn,Un,Jn]){Ln.material=e;try{await P.compileAsync(Fn,In)}catch{}await Pt()}try{await P.compileAsync(zt,Bt)}catch{}for(let e of Rt)e instanceof fe&&!(e instanceof re)&&e.image&&(P.initTexture(e),await Pt());ii(),await Pt(),Z.uDof.value=.01,ii(),Z.uDof.value=0,await Pt(),Jr(A,!1),await Pt(),Zt=!0,E(`b:built`)}function hr(){G.uC.value.set(U.x,D,0),G.uSize.value.set(U.w,U.h),dn.position.set(U.x,D,-.02),dn.scale.set(U.w,U.h,1),fn.position.set(U.x,D,.03),fn.scale.set(U.w+.3,U.h+.3,1)}let gr=()=>[[-1,1],[1,1],[-1,-1],[1,-1]].map(([e,t])=>new x(U.x+e*(U.w/2+.115),D+t*(U.h/2+.115),.05));function _r(){if(!q)return;let e=new ae(k[A]?.palette?.[0]??k[A]?.color??`#9a8fd0`);gr().forEach((t,n)=>{let r=mn.frame0+n;q.P.setXYZ(r,t.x,t.y,t.z),q.Sz.setXYZW(r,.11,3,n*.27,cn?.uK.value??0),q.C.setXYZW(r,e.r*1.2,e.g*1.2,e.b*1.2,.3)}),hn.forEach((e,t)=>{for(let n=0;n<e.sign.n;n++){let r=e.sign.start+n;q.Sz.setW(r,e.alpha.v*(e.main.includes(n)?1:.8)),q.C.setW(r,t===A?.4:0)}}),vn.forEach((e,t)=>{let n=mn.lily0+t,r=e.open.v;q.P.setXYZ(n,e.star.x,e.star.y+r*.42,e.star.z),q.Sz.setXYZW(n,.07+r*.05,0,t*.31,.75+r*.25),q.C.setXYZW(n,1,1,1,r*.6)}),xn?.slots.forEach((e,t)=>{let n=mn.met0+t;e.on?(q.P.setXYZ(n,e.p.x,e.p.y,e.p.z),q.Sz.setXYZW(n,e.kind===`sky`?.06:.12,e.gemKind,t*.17,1),q.C.setXYZW(n,e.col.r,e.col.g,e.col.b,.8)):q.Sz.setW(n,0)}),q.P.needsUpdate=!0,q.Sz.needsUpdate=!0,q.C.needsUpdate=!0;let t=gn.material.uniforms.uA.value;hn.forEach((e,n)=>{t[n]=e.alpha.v*(n===A?1:.35)})}function vr(e){let t=hn[e];if(!t||!G)return;let n=G.uStars.value;for(let e=0;e<8;e++)n[e].copy(t.pts[e%t.pts.length]);G.uStarN.value=Math.min(8,t.pts.length)}let yr=e=>{let t=At?.querySelector(`svg`);if(!t)return;let n=hn[e],r=(n?.sign.raw??Ae(k[e].id).pts).map(([e,t])=>[4+e*56,36-t*32]),i=n?.links??Ae(k[e].id).links;t.querySelector(`path`).setAttribute(`d`,i.map(([e,t])=>`M${r[e][0].toFixed(1)} ${r[e][1].toFixed(1)}L${r[t][0].toFixed(1)} ${r[t][1].toFixed(1)}`).join(``)),t.querySelector(`g`).innerHTML=r.map(([e,t],r)=>`<circle cx="${e.toFixed(1)}" cy="${t.toFixed(1)}" r="${(n?.main??[]).includes(r)?1.8:1.1}"/>`).join(``)},br=(e,t,n)=>{Sn[Cn].set(e,t,tr,n),Cn=(Cn+1)%Sn.length},xr=(e,t,n=1)=>{if(Y){for(let r=0;r<t;r++){let t=Y.head;Y.head=(Y.head+1)%Y.n;let r=Math.random()*Math.PI*2,i=(.4+Math.random()*1.2)*n;Y.O.setXYZ(t,e.x+(Math.random()-.5)*.05,-1.04,e.z+(Math.random()-.5)*.05),Y.V.setXYZW(t,Math.cos(r)*i*.6,1.2+Math.random()*1.6*n,Math.sin(r)*i*.35,tr)}Y.O.needsUpdate=!0,Y.V.needsUpdate=!0}},Sr=[`#ffffff`,`#9fb6ff`,`#f0c9ea`,`#c8f0e0`,`#ffe3a8`],Cr=(e,t,n,r,i)=>{let a=xn?.slots.find(e=>!e.on);a&&(a.on=!0,a.kind=r,a.t=0,a.life=n,a.onHit=i,a.p.copy(e),a.v.copy(t).sub(e).divideScalar(n),a.col.set(Sr[Math.floor(Math.random()*Sr.length)]),a.gemKind=r===`sky`?0:[0,1,3,0][Math.floor(Math.random()*4)],a.gemKind===1&&a.col.set(`#f4eee6`),a.hue=Math.random())},wr=e=>{xn&&(xn.slots.forEach((t,n)=>{if(!t.on){xn.Wd.setXYZW(n,0,0,0,0);return}t.t+=e,t.p.addScaledVector(t.v,e);let r=t.p.clone().addScaledVector(t.v,-(t.kind===`sky`?.16:.22));xn.A.setXYZ(n,t.p.x,t.p.y,t.p.z),xn.B.setXYZ(n,r.x,r.y,r.z),xn.Wd.setXYZW(n,t.kind===`sky`?.012:.03,ht(1-Math.max(0,t.t-t.life+.15)/.15)*(t.kind===`sky`?.8:1),t.hue,0),t.t>=t.life&&(t.on=!1,t.onHit?.(t.p.clone()))}),xn.A.needsUpdate=!0,xn.B.needsUpdate=!0,xn.Wd.needsUpdate=!0)},Tr=(e,t,n,r,i)=>Cr(e,t,n,r,e=>{br(e.x,e.z,i?1:.6),xr(e,i?34:18,i?1.1:.8),It.ding(.9+Math.random()*.3)}),Er=6+Math.random()*6,Dr=4+Math.random()*4,$={x:F/2,y:I/2,has:!1,down:!1,moved:!1,sx:0,sy:0,drag:!1,lastU:-1,t:performance.now()},Or=new Tt;Or.k=60,Or.c=7;let kr=new y(.5,.5),Ar=!1,jr=()=>{Ar||(Ar=!0,C.classList.add(`hint-done`))},Mr=new i(new x(0,0,1),-.75),Nr=e=>{if(e.pointerType!==`mouse`&&e.pointerType!==`pen`)return;let t=performance.now(),n=Math.max(.001,(t-$.t)/1e3);$.t=t;let r=e.clientX-$.x,i=e.clientY-$.y;if($.x=e.clientX,$.y=e.clientY,$.has=!0,$.moved=!0,H.uPtr.value.set($.x/F*2-1,-($.y/I*2-1)),W!==`ready`)return;$.down&&Math.hypot($.x-$.sx,$.y-$.sy)>6&&($.drag=!0);let a=ur($.x,$.y);if($.down&&$.drag&&a&&(kr.set(a.u,a.v),Or.target=1,jr()),a&&!$.down){let e=Math.floor(a.u*30);if($.lastU>=0&&e!==Math.floor($.lastU*30)){let t=ht(Math.hypot(r,i)/n/1600,.25,1.2);wn[Tn].set((e+.5)/30,tr,t,Math.sign(r)||1),Tn=(Tn+1)%wn.length,It.harp(a.u,t),jr()}$.lastU=a.u}else $.lastU=-1},Pr=(e,t)=>{let n=-1,r=70;return vn.forEach((i,a)=>{let o=ir(i.p.clone().add(new x(0,.15+i.open.v*.4,0))),s=Math.hypot(o.x-e,o.y-t);s<r&&(r=s,n=a)}),n},Fr=e=>{e.button===0&&e.target===N&&($.x=e.clientX,$.y=e.clientY,$.sx=$.x,$.sy=$.y,$.down=!0,$.drag=!1,W===`ready`&&N.setPointerCapture(e.pointerId))},Ir=e=>{if(!$.down)return;if($.down=!1,Or.target=0,W!==`ready`||$.drag){$.drag=!1;return}if(e.target!==N)return;if(ur($.x,$.y)){fi(k[A]);return}let t=Pr($.x,$.y);t>=0?fi(vn[t].w):(sr($.x,$.y),ar.ray.intersectPlane(new i(new x(0,0,1),1.5),lr)&&lr.y>-.45000000000000007&&Lr(lr.clone()))},Lr=e=>{let t=e.clone().add(new x(.9,.7,-.4)),n=new x(e.x-.8+Math.random()*.4,yt,.6+Math.random()*1.4);Tr(t,n,.9,`wish`,!1)},Rr=0,zr=0,Br=e=>{if(W!==`ready`)return;let t=performance.now();if(!(t<zr)&&(Rr+=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX,Math.abs(Rr)>=60)){let e=Rr>0?1:-1;Rr=0,zr=t+1e3,ui((A+e+k.length)%k.length)}},Vr=e=>{W!==`ready`||e.target instanceof HTMLInputElement||(e.key===`ArrowRight`?(e.preventDefault(),ui((A+1)%k.length)):e.key===`ArrowLeft`?(e.preventDefault(),ui((A-1+k.length)%k.length)):e.key===`Enter`&&(e.target===document.body||C.contains(e.target))&&!e.target.closest?.(`button, a`)&&(e.preventDefault(),fi(k[A])))},Hr=e=>{let t=e.target,n=t.closest(`[data-step]`);if(n&&W===`ready`){ui((A+Number(n.dataset.step)+k.length)%k.length);return}let r=t.closest(`.ml-star[data-work]`);if(r&&W===`ready`){let e=k.findIndex(e=>e.id===r.dataset.work);e>=0&&e!==A&&ui(e)}},Ur=()=>{F=innerWidth,I=innerHeight,P.setSize(F,I,!1),Xn(),Wt(),Xt(),Zt&&(hr(),_r()),(W===`ready`||W===`idle`)&&Object.assign(Q,Qn()),nn&&(nn.uPx.value=I*Lt/(2*Math.tan(r.degToRad(_t/2)))),ln?.getRenderTarget().setSize(Math.round(F*Lt*(j?.5:.35)),Math.round(I*Lt*(j?.5:.35)))},Wr=!1,Gr=e=>{if(e===Wr)return;Wr=e;let t=e?`addEventListener`:`removeEventListener`;window[t](`pointermove`,Nr),N[t](`pointerdown`,Fr),window[t](`pointerup`,Ir),window[t](`wheel`,Br,{passive:!0}),window[t](`keydown`,Vr),C[t](`click`,Hr),window[t](`resize`,Ur)},Kr=(e,t)=>{if(!At)return;let n=k[e],r=()=>{At.querySelector(`.ml-title`).textContent=n.title,At.querySelector(`.ml-cat`).textContent=n.category,At.querySelector(`.ml-sum`).textContent=n.summary,yr(e)};t?(At.classList.add(`is-swapping`),setTimeout(()=>{r(),At.classList.remove(`is-swapping`)},480)):r()},qr=()=>{let e=C.querySelector(`.sel-count-cur`);e&&(e.textContent=String(A+1).padStart(2,`0`)),C.querySelectorAll(`.ml-star[data-work]`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.work===k[A].id?`true`:`false`))};Kr(A,!1),qr();let Jr=(e,t=!0)=>{kn.value=0},Yr=performance.now(),Xr=1,Zr=new x,Qr=()=>{if(Qt)return;let e=performance.now(),t=Math.min(.05,(e-Yr)/1e3);Yr=e;let n=t*Xr;if(tr+=n,H.uTime.value=tr,!Zt){W!==`idle`&&ai();return}if(W===`idle`)return;if($n||(er.x+=(($.has?H.uPtr.value.x:0)-er.x)*(1-Math.exp(-t*2.5)),er.y+=(($.has?H.uPtr.value.y:0)-er.y)*(1-Math.exp(-t*2.5))),nr(),J.g.visible){!J.auto&&$.has&&sr($.x,$.y).intersectPlane(Mr,J.target),Zr.copy(J.target).sub(J.pos);let e=J.auto?4:18;J.vel.lerp(Zr.multiplyScalar(e),1-Math.exp(-t*10)),J.pos.addScaledVector(J.vel,t),J.g.position.copy(J.pos);let n=J.vel.length(),r=9+Math.min(14,n*6);J.u.uFlap.value+=t*r;let i=.35+Math.sin(J.u.uFlap.value)*.75;if(J.wR.rotation.y=-i,J.wL.rotation.y=i,J.g.rotation.z=ht(-J.vel.x*.12,-.5,.5),J.g.rotation.x=-.5+ht(J.vel.y*.08,-.3,.3),bn.age.forEach((e,n)=>{bn.age[n]=e+t}),n>.05||Math.random()<.15){let e=bn.head;bn.head=(bn.head+1)%bn.age.length,bn.buf.set([J.pos.x+(Math.random()-.5)*.03,J.pos.y-.01+(Math.random()-.5)*.03,J.pos.z],e*3),bn.age[e]=0}bn.pts.geometry.attributes.position.needsUpdate=!0,bn.pts.geometry.attributes.aAge.needsUpdate=!0}let r=J.g.visible?ir(J.pos):null;if(pn.forEach(e=>{let n=ir(e.head);e.hold=r&&Math.hypot(n.x-r.x,n.y-r.y)<150?3.5:Math.max(0,e.hold-t),e.open.target=+(e.hold>0),e.open.step(t);let i=ht(e.open.v,0,1.1);Math.abs(e.geo.array[e.i]-i)>.001&&(e.geo.array[e.i]=i,e.geo.needsUpdate=!0),i>.6&&!e.burst&&(e.burst=!0,ni(e.head)),i<.2&&(e.burst=!1)}),_n.forEach(e=>{if(!e.main&&r){let n=ir(e.pos);Math.hypot(n.x-r.x,n.y-r.y)<170?e.open.target=1:e.open.target===1&&Math.random()<t*.25&&(e.open.target=0)}e.open.step(n);let i=ht(e.open.v,0,1.1);e.u.uOpen.value=i,e.u.uGlow.value=i*.9,e.petals.forEach(e=>{e.parent.rotation.x=0,e.rotation.x=.12+i*(e.userData.ring?1.05:1.3)})}),yn){let e=yn.userData.O,n=-1;r&&W===`ready`&&(n=Pr(r.x,r.y)),vn.forEach((r,i)=>{r.open.target=+(i===n),r.open.step(t),e.array[i]=ht(r.open.v,0,1.1);let a=gt(.55,1,r.open.v),o=r.ring.material.uniforms.uA;o.value=a,r.ring.visible=a>.01,r.ring.position.y=r.p.y+.3+r.open.v*.4,r.ring.scale.setScalar(.4+.6*a),r.ring.lookAt(qt.position)}),e.needsUpdate=!0,n!==$r&&ei(n)}if(Or.step(t),G.uDrag.value.set(kr.x,kr.y,Math.max(0,Or.v)),Er-=n,Dr-=n,Er<0&&W===`ready`){Er=7+Math.random()*8;let e=3+Math.floor(Math.random()*3);for(let t=0;t<e;t++){let e=U.x-5+Math.random()*7,n=2.6+Math.random()*1.2;w.delayedCall(t*.18,()=>Cr(new x(e,n,-4.2),new x(e+2.2,n-1.1,-4.2),.7,`sky`))}}Dr<0&&(Dr=5+Math.random()*6,br(U.x+(Math.random()-.5)*8,-2+Math.random()*4,.35)),wr(n),ti>=0&&(ti+=n,tn.uWaveR.value=ti*3.2,ti>3&&(ti=-1,tn.uWaveR.value=0)),_r(),Yn();let i=j&&(W===`switching`||W===`diving`)?1:0;Z.uDof.value+=(i-Z.uDof.value)*(1-Math.exp(-t*(i?5:8))),ii()},$r=-1;function ei(e){if($r=e,e<0)return;let t=vn[e].ring.material.uniforms;En[e]&&(t.uVid.value=En[e])}let ti=-1;function ni(e){if(Y){for(let t=0;t<5;t++){let t=Y.head;Y.head=(Y.head+1)%Y.n,Y.O.setXYZ(t,e.x,e.y,e.z),Y.V.setXYZW(t,(Math.random()-.5)*.3,.9+Math.random()*.6,(Math.random()-.5)*.2,tr)}Y.O.needsUpdate=!0,Y.V.needsUpdate=!0}}let ri=()=>{let e=dr();return new oe(e.x/F,1-(e.y+e.h)/I,(e.x+e.w)/F,1-e.y/I)};function ii(){let e=ri();Rn.uFocus.value.copy(e),Z.uFocus.value.copy(e),P.setRenderTarget(jn),P.clear(),P.render(V,qt),Rn.tSrc.value=jn.texture,Wn(Bn,Mn[0]),X.tSrc.value=Mn[0].texture,X.uDir.value.set(1/Mn[0].width,0),Wn(Vn,Mn[1]),X.tSrc.value=Mn[1].texture,X.uDir.value.set(0,1/Mn[0].height),Wn(Vn,Mn[0]),X.tSrc.value=Mn[0].texture,Wn(Un,Nn[0]),X.tSrc.value=Nn[0].texture,X.uDir.value.set(1.6/Nn[0].width,0),Wn(Vn,Nn[1]),X.tSrc.value=Nn[1].texture,X.uDir.value.set(0,1.6/Nn[0].height),Wn(Vn,Nn[0]),Z.uDof.value>.003&&(X.tSrc.value=jn.texture,Wn(Un,Pn[0]),X.tSrc.value=Pn[0].texture,X.uDir.value.set(1.5/Pn[0].width,0),Wn(Vn,Pn[1]),X.tSrc.value=Pn[1].texture,X.uDir.value.set(0,1.5/Pn[0].height),Wn(Vn,Pn[0])),Z.tScene.value=jn.texture,Z.tBloom.value=Mn[0].texture,Z.tHal.value=Nn[0].texture,Z.tDof.value=Pn[0].texture,P.setRenderTarget(null),P.clear(),Wn(Hn,null),(Vt.visible||B.uA.value>.001)&&(P.clearDepth(),P.render(zt,Bt))}function ai(){P.setRenderTarget(null),P.clear(),P.render(zt,Bt)}w.ticker.add(Qr);let oi=[],si=e=>(oi.push(e),e),ci=null,li=null;function ui(e){if(W!==`ready`||e===A||!k[e])return;ci&&=(ci.progress(1),null),W=`switching`,E(`sw:start`);let t=A;A=e,a.onChange(k[e].id),qr(),Kr(e,!0);let n=si(w.timeline({onComplete:()=>{W=`ready`,Xr=1,E(`sw:end`)}}));n.eventCallback(`onUpdate`,()=>{Xr=n.timeScale()}),n.to(Q,{orbit:22,duration:1.2,ease:`sine.inOut`},0),n.to(Q,{orbit:0,duration:1.3,ease:`sine.inOut`},1.2),vr(t),G.uUnpick.value=0,n.to(G.uUnpick,{value:1,duration:St,ease:`power1.in`},0),n.to(K.uK,{value:0,duration:St*.8,ease:`none`},0),n.to(nn.uWhirl,{value:1,duration:.9,ease:`power2.out`},0),n.to(nn.uWhirl,{value:0,duration:1.2,ease:`power2.inOut`},1.2),n.to(hn[t].alpha,{v:1.4,duration:.35,ease:`power2.out`},St*.6),n.to(hn[t].alpha,{v:.28,duration:.5,ease:`none`},.7),It.harp(.2,.6),n.add(()=>{G.uWeave.value=0,G.uUnpick.value=0,G.uPoster.value=Dn[e],G.uDirMap.value=Dn[e],K.uPoster.value=Dn[e],vr(e),Jr(e)},St),n.fromTo(hn[e].alpha,{v:.28},{v:1.3,duration:.3,ease:`power2.out`},St);let r=1.2;n.add(()=>{let t=hn[e];t.pts.forEach((e,n)=>{let r=U.x+(n/Math.max(1,t.pts.length-1)-.5)*U.w*.55;Tr(e.clone(),new x(r,yt,.4+n%3*.35),.4+n*.025,`gem`,t.main.includes(n))})},.7999999999999999),n.add(()=>{E(`sw:impact`),w.to(n,{timeScale:.3,duration:.08,ease:`none`}),w.delayedCall(.42,()=>w.to(n,{timeScale:1,duration:.25,ease:`power1.in`})),w.fromTo(H.uFlash,{value:0},{value:1,duration:.18,ease:`power1.out`,onComplete:()=>{w.to(H.uFlash,{value:0,duration:.9,ease:`power1.inOut`})}})},r),n.add(()=>{G.uWeaveMode.value=1,G.uWeaveO.value.set(.5,-.12)},r),n.to(G.uWeave,{value:1,duration:Ct,ease:`power1.inOut`},1.25),n.to(K.uK,{value:1,duration:Ct,ease:`none`},1.4),n.to(hn[e].alpha,{v:1,duration:.6,ease:`none`},1.5),n.add(()=>di(),1.3),n.set({},{},2.15)}function di(){let e=_n.find(e=>e.main);e&&(e.open.target=1,w.delayedCall(.55,()=>{ti=0,tn.uWaveC.value.copy(e.pos),It.bloom(),pn.forEach(t=>{t.p.distanceTo(e.pos)<6&&(t.hold=Math.max(t.hold,2.5+t.p.distanceTo(e.pos)*.3))})}),w.delayedCall(4.5,()=>{Qt||(e.open.target=0)}))}function fi(e){if(W!==`ready`)return;if(!be()){location.assign(e.href);return}W=`diving`,$n=!0,E(`dive`),a.onChange(e.id),C.classList.add(`is-diving`);let t=ve(e.href),n=performance.now();if(e.section===`tech`){let r=vn.find(t=>t.w===e);if(r){let i=ir(r.ring.position),a=ir(r.ring.position.clone().add(new x(.34*r.ring.scale.x,0,0))),o=Math.max(40,Math.abs(a.x-i.x)*2*.56/.5),s=xe({x:i.x-o/2,y:i.y-o*9/32,w:o,h:o*9/16},e.still||e.poster,0);w.fromTo(s.el,{opacity:0},{opacity:1,duration:.12,ease:`none`}),w.to(Z.uFade,{value:.55,duration:.4,ease:`none`}),pi(e,s,t,n);return}}J.auto=!0,J.target.set(U.x+U.w*.08,D+U.h*.1,.25);let i=U.h/2/Math.tan(r.degToRad(_t/2)),o=Math.max(i,U.w/2/(Math.tan(r.degToRad(_t/2))*(F/I))),s=si(w.timeline());s.to(er,{x:0,y:0,duration:.3},0),s.to(Q,{x:U.x,lx:U.x,y:D,ly:D,orbit:0,breath:0,duration:.3},0),s.to(Q,{z:Math.min(i,o),duration:.8,ease:`power2.inOut`},.2),s.to(G.uPart,{value:1,duration:.65,ease:`power2.inOut`},.55),s.to(K.uFull,{value:1,duration:.5,ease:`none`},.6),s.to(K.uK,{value:1,duration:.2,ease:`none`},.5),s.to(cn.uK,{value:0,duration:.3,ease:`none`},.6),s.to($t.uK,{value:0,duration:.4,ease:`none`},.5),s.to(J.u.uA,{value:0,duration:.25,ease:`none`},.75),s.to(K.uPosterK,{value:1,duration:.2,ease:`none`},1.05),s.to(Z.uVig,{value:0,duration:.4,ease:`none`},.9),s.to(Z.uBloomK,{value:0,duration:.4,ease:`none`},.9),s.to([Z.uGrain,Z.uCA],{value:0,duration:.4,ease:`none`},.9),s.add(()=>{let r=xe(dr(),e.still||e.poster,0);w.fromTo(r.el,{opacity:0},{opacity:1,duration:.5,ease:`none`}),pi(e,r,t,n)},1.1),It.harp(.5,.8)}async function pi(e,t,n,r){let i=be();mi=!0,Gr(!1),i.prepend(N);let a=await Promise.race([n,new Promise(e=>setTimeout(()=>e(null),3500))]);if(Qt)return;let o=[],s=()=>{document.removeEventListener(`astro:after-swap`,s),o=ge(),w.set(o,{opacity:0})},c=()=>{document.removeEventListener(`astro:page-load`,c),new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))).then(()=>{if(Qt)return;let e=document.querySelector(`[data-flight]`),n=e?.getBoundingClientRect(),i=[];e&&n&&n.width>0?(e.style.visibility=`hidden`,i.push(he(t,{x:n.left,y:n.top,w:n.width,h:n.height},{duration:.7,ease:pt,padTo:0}).then()),a&&_e(t,a,.4)):i.push(w.to(t.el,{opacity:0,duration:.3,ease:`none`,delay:.3}).then()),i.push(w.to(o,{opacity:1,duration:.5,ease:`none`,delay:.25}).then()),i.push(w.to(N,{opacity:0,duration:.8,ease:`none`,delay:.1}).then()),Promise.all(i).then(()=>{w.set(o,{clearProps:`opacity`}),w.to(t.el,{opacity:0,duration:.08,ease:`none`,onComplete:()=>{e&&(e.style.visibility=``),t.el.remove(),mi=!1,E(`dive:done ${Math.round(performance.now()-r)}`),N.style.visibility=`hidden`,setTimeout(()=>`requestIdleCallback`in window?requestIdleCallback(()=>hi(),{timeout:2e3}):hi(),400)}}),e&&(e.style.visibility=``)})})};document.addEventListener(`astro:after-swap`,s),document.addEventListener(`astro:page-load`,c),Se(),me(e.href).catch(()=>location.assign(e.href))}let mi=!1;function hi(){Qt||(Qt=!0,w.ticker.remove(Qr),w.ticker.lagSmoothing(500,33),oi.forEach(e=>e.kill()),w.killTweensOf([N,Q,er,H.uFlash,kn]),Gr(!1),It.stop(),On.forEach(e=>e?.close()),Rt.forEach(e=>{try{e.dispose()}catch{}}),V.traverse(e=>{let t=e;t.geometry?.dispose?.();let n=t.material;(Array.isArray(n)?n:n?[n]:[]).forEach(e=>e.dispose())}),Gt?.dispose(),P.dispose(),P.forceContextLoss(),N.remove(),C.classList.remove(`is-ready`,`is-leaving`,`is-diving`,`hint-done`),W===`idle`&&Mt&&(C.hidden=!0),C.style.visibility=``,window.__ml&&delete window.__ml)}let gi=mr().catch(e=>{throw console.warn(`[moonloom]`,e),e}),_i=e=>{let t=new y(-F,I*.82).normalize();z.uDir.value.copy(t).multiplyScalar(-1);let n=new y(F/2,-I/2),r=new y(-F/2,I/2).clone().sub(n).dot(t)+260,i=n.clone().addScaledVector(t,e*r);z.uLine.value.copy(i),z.uR.value=70+60*Math.sin(e*Math.PI);let a=n.clone().sub(i).dot(t.clone().multiplyScalar(-1)),o=a/z.uR.value,s=n.clone().addScaledVector(t.clone().multiplyScalar(-1),-a),c=o<Math.PI?s.addScaledVector(t.clone().multiplyScalar(-1),Math.sin(o)*z.uR.value):s.addScaledVector(t,a-Math.PI*z.uR.value);return{x:c.x+F/2,y:I/2-c.y}},vi=[210/512,124/256],yi=(e,t,n,r)=>{let i=B.uMorph.value,a=Me[0]+(vi[0]-Me[0])*i,o=Me[1]+(vi[1]-Me[1])*i,s=(.5-a)*2*n,c=(.5-o)*n,l=Math.cos(r),u=Math.sin(r),d=e+s*l-c*u,f=t+s*u+c*l;Ut.position.set(d-F/2,I/2-f,0),Ut.scale.set(2*n,n,1),Ut.rotation.z=-r};function bi(e,t){E(`enter`),W=`entering`,Vt.visible=t,_i(0),w.fromTo(N,{opacity:0},{opacity:1,duration:.6,ease:`none`});let n=.16,r=_i(n);_i(0);let a={x:F+I*.5,y:r.y+I*.05,s:I*.5,r:.12,a:0,soft:10},o=()=>{yi(a.x,a.y,a.s,a.r),B.uA.value=a.a,B.uSoft.value=a.soft};o();let s=si(w.timeline({onUpdate:o}));li=s,s.to(a,{x:r.x,y:r.y,r:.06,duration:.65,ease:`power2.out`},0),s.to(a,{a:.72,duration:.35,ease:`none`},0),s.to(a,{soft:2.5,duration:.65,ease:`power1.in`},0);let c=si(w.to(a,{r:.06,duration:.7,ease:`sine.inOut`,yoyo:!0,repeat:-1,delay:.65,onUpdate:o}));gi.then(()=>{if(Qt)return;Gr(!0),Object.assign(Q,{x:U.x-1.6,y:-.10000000000000003,z:6.2,lx:U.x-.6,ly:.04999999999999999,orbit:0,breath:0}),$t.uWarp.value=0,G.uWeave.value=0,G.uWeaveMode.value=0,K.uK.value=0,cn.uK.value=0,Jr(A),It.start();let t=si(w.timeline({onComplete:()=>{$n=!1,ci=null,E(`enter:done`)}}));ci=t;let r=Math.max(0,.65-s.time());t.delay(r),t.add(()=>{c.kill()},0);let l={p:0},u=()=>{let e=_i(l.p);l.p>=n&&l.p<=.42&&(a.x=e.x,a.y=e.y),o()};t.to(l,{p:n,duration:.25,ease:`power2.inOut`,onUpdate:u},0),t.to(l,{p:1,duration:.9,ease:`power2.inOut`,onUpdate:u},.25),t.add(()=>{Vt.visible=!1},1.12),t.to(a,{soft:6,r:-.1,duration:.9,ease:`power1.inOut`,onUpdate:o},.25),t.to(B.uMorph,{value:1,duration:.4,ease:`power1.inOut`,onUpdate:o},.6),t.to(a,{s:I*.26,duration:.45,ease:`power2.inOut`,onUpdate:o},.6),t.to(a,{x:`-=60`,y:`-=50`,duration:.5,ease:`sine.out`},.62),t.add(()=>{J.g.visible=!0,J.auto=!0;let e=a.x+(vi[0]-.5)*0,t=a.y;sr(e,t).intersectPlane(new i(new x(0,0,1),-3.2),J.pos),J.target.copy(J.pos)},.98),t.to(J.u.uA,{value:1,duration:.3,ease:`none`},.98),t.to(J.glow.material,{opacity:.45,duration:.35,ease:`none`},.98),t.to(B.uA,{value:0,duration:.3,ease:`none`},1.05),[new x(U.x-2.6,-.65,3.2),new x(U.x-3.4,-.7000000000000001,.8),new x(U.x-1.6,-.75,-1.8),new x(U.x+.6,-.55,-.6),new x(O.x-.8,O.y-.5,-.6)].forEach((e,n)=>t.add(()=>{J.target.copy(e)},1+n*.4)),t.to(Q,{...Qn(),breath:1,duration:2,ease:pt},.85),t.add(()=>{W=`ready`,C.classList.add(`is-ready`),E(`enter:ready`),e()},Math.max(.3,1.15-r-s.time())),t.to($t.uWarp,{value:1,duration:.7,ease:`power1.out`},1.5),t.to(G.uWeave,{value:1,duration:1,ease:`power1.inOut`},1.9),t.to(K.uK,{value:1,duration:.9,ease:`none`},2),t.to(cn.uK,{value:1,duration:.8,ease:`none`},2.3),t.add(()=>{$.moved||J.target.set(U.x+U.w*.55,D-U.h*.3,.9)},2.9),t.add(()=>{J.auto=!1},3),t.set({},{},3.6);let d=()=>{(W===`ready`||W===`switching`)&&(J.auto=!1,window.removeEventListener(`pointermove`,d))};t.add(()=>window.addEventListener(`pointermove`,d),1.4)})}return window.__ml={renderer:P,phase:()=>W,cur:()=>k[A].id,go:e=>ui(e),built:()=>Zt,tier:jt,tap:()=>dr(),shadowTest:(e,t,n,r=0)=>(B.uMorph.value=r,B.uA.value=.7,B.uSoft.value=4,yi(e,t,n,0),Vt.visible=!0,Ut.position.toArray()),seekEnter:e=>{w.killTweensOf(N),N.style.opacity=`1`;let t=li,n=ci;return t&&(t.pause(),t.seek(Math.min(e,t.duration()),!1)),n&&e>=.65&&(n.pause(),n.seek(e-.65,!1)),{t1:t?[t.time(),t.duration(),t.paused(),t.getChildren().length]:null,tl:n?[n.time(),n.duration()]:null}},u:()=>({weave:G.uWeave.value,mode:G.uWeaveMode.value,unpick:G.uUnpick.value,part:G.uPart.value,back:K.uK.value,full:K.uFull.value,vid:kn.value,drag:G.uDrag.value.toArray()}),page:()=>({vis:Vt.visible,snap:!!z.uSnap.value,line:z.uLine.value.toArray(),win:z.uWin.value.toArray(),ts:w.globalTimeline.timeScale(),shadow:B.uA.value,morph:B.uMorph.value,soft:B.uSoft.value,pos:Ut.position.toArray(),scale:Ut.scale.toArray(),err:P.info.programs?.filter(e=>e.diagnostics?.runnable===!1).length}),lily:e=>vn[e]?ir(vn[e].p.clone().add(new x(0,.15,0))):null,pluck:e=>{wn[Tn].set(e,tr,1,1),Tn=(Tn+1)%wn.length},wish:()=>Lr(new x(U.x-1.5,2.0500000000000003,1.5)),info:()=>({...P.info.memory,programs:P.info.programs?.length??0,calls:P.info.render.calls,tris:P.info.render.triangles,stitches:fr*pr})},E(`b:done`),{enter(){return C.style.visibility=``,new Promise(e=>{bi(e,Kt())})},enterFrom(e){return C.style.visibility=``,new Promise(t=>{W=`entering`,E(`back:start2`),Vt.visible=!1,gi.then(()=>{if(Qt)return;Gr(!0);let n=Ot.findIndex(t=>t.id===e.id);if(Jr(A),n>=0&&vn[n]){Object.assign(Q,Qn(),{orbit:0,breath:1}),G.uWeave.value=1,K.uK.value=1,cn.uK.value=1,$t.uWarp.value=1,J.g.visible=!0,J.auto=!1,J.u.uA.value=1;let r=vn[n];r.open.v=r.open.target=1,nr(),r.ring.position.y=r.p.y+.7,r.ring.scale.setScalar(1);let i=ir(r.ring.position),a=ir(r.ring.position.clone().add(new x(.34,0,0))),o=Math.max(40,Math.abs(a.x-i.x)*2*.56/.5);ii(),N.style.opacity=`1`;let s=si(w.timeline({onComplete:()=>{$n=!1,W=`ready`,C.classList.add(`is-ready`),It.start(),E(`back:done`),t()}}));e.ghost&&s.to(e.ghost,{opacity:0,duration:.25,ease:`none`},.05),s.add(he(e.flight,{x:i.x-o/2,y:i.y-o*9/32,w:o,h:o*9/16},{duration:wt,ease:pt,padTo:0}),0),s.to(e.flight.el,{opacity:0,duration:.15,ease:`none`,onComplete:()=>{e.flight.el.remove(),e.ghost?.remove()}},wt),E(`back`);return}let i=U.h/2/Math.tan(r.degToRad(_t/2));Object.assign(Q,{x:U.x,y:D,z:i,lx:U.x,ly:D,orbit:0,breath:0}),G.uWeave.value=1,G.uWeaveMode.value=0,G.uPart.value=1,K.uK.value=1,K.uFull.value=1,K.uPosterK.value=1,cn.uK.value=0,$t.uWarp.value=1,$t.uK.value=0,Z.uVig.value=0,Z.uBloomK.value=0,J.g.visible=!0,J.auto=!0,J.u.uA.value=0,J.pos.set(U.x,D,.3),J.target.copy(J.pos),nr(),ii(),N.style.opacity=`1`;let a=dr(),o=si(w.timeline({onComplete:()=>{$n=!1,J.auto=!1,E(`back:done`),t()}}));e.ghost&&o.to(e.ghost,{opacity:0,duration:.25,ease:`none`},.05),o.add(he(e.flight,a,{duration:wt,ease:pt,padTo:0}),0),o.add(()=>{w.to(e.flight.el,{opacity:0,duration:.1,ease:`none`,onComplete:()=>{e.flight.el.remove(),e.ghost?.remove()}})},wt),o.to(K.uPosterK,{value:0,duration:.3,ease:`none`},wt),o.to(G.uPart,{value:0,duration:.7,ease:`power2.inOut`},.65),o.to(K.uFull,{value:0,duration:.6,ease:`none`},.7),o.to(Q,{...Qn(),breath:1,duration:.9,ease:pt},.65),o.to([cn.uK,$t.uK,J.u.uA,Z.uVig],{value:e=>[1,1,1,.28][e],duration:.5,ease:`none`},.8999999999999999),o.to(Z.uBloomK,{value:1,duration:.5,ease:`none`},.8999999999999999),o.add(()=>{W=`ready`,C.classList.add(`is-ready`),It.start()},1.05),o.set({},{},2),E(`back`)})})},leave(){return new Promise(e=>{if(Qt)return e();if(oi.forEach(e=>e.kill()),W=`leaving`,$n=!0,C.classList.remove(`is-ready`,`is-diving`),C.classList.add(`is-leaving`),It.stop(),!Zt){w.to(N,{opacity:0,duration:.25,ease:`none`,onComplete:()=>e()});return}let t=si(w.timeline({onComplete:()=>e()}));t.to(G.uUnpick,{value:1,duration:.4,ease:`power1.in`},0),t.to([K.uK,cn.uK,$t.uK],{value:0,duration:.3,ease:`none`},0),t.to(N,{opacity:0,duration:.35,ease:`none`},.25),t.set({},{},.6)})},select(e){fi(e)},destroy(){mi||hi()}}}export{k as createSelector};