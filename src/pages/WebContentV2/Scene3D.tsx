import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { prefersReduced } from "../../motion";

/**
 * ページ全面の固定 WebGL シーン（V2 の主役）。
 *
 * HERO＝PS2起動画面のオープニング再現：
 *   - 中央に青い靄（星雲）。加算合成の雲スプライトの群れ
 *   - 緑・青・赤の光点3つが、同色の光と尾（トレイル）を引きながら自由に浮遊
 *   - 黒いサイコロ状のキューブがぎりぎり見える暗さでぷかぷか漂う
 *   - スクロール＝靄の中心へのダイブ。スクロールしきると完全暗転（暗転幕はDOM側）
 *   - 次のスクロールから通常セクションが始まり、ブロブの振り付けに引き継ぐ
 *
 * 以降のセクションは従来どおり：
 *   APPROACH（左でブロブ浮上）→ WORKS（退場・光の間）→ SERVICES（8の字）
 *   → STRENGTHS（右で逆回転）→ CONTACT（中央最大化のフィナーレ）
 */

/* ---- GLSL: Ashima simplex noise（定番実装・依存なし） ---- */
const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  return snoise(p)*0.62 + snoise(p*2.35)*0.26 + snoise(p*4.9)*0.12;
}
float disp(vec3 p, float t, float amp){
  return fbm(p*1.15 + vec3(t*0.55, t*0.34, t*0.4)) * amp;
}
`;

/* ---- 柔らかい雲テクスチャを canvas で生成（外部アセット不要） ---- */
function makeCloudTexture(size = 256, blobs = 26): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const cx = cv.getContext("2d")!;
  for (let i = 0; i < blobs; i++) {
    const x = size / 2 + (Math.random() - 0.5) * size * 0.55;
    const y = size / 2 + (Math.random() - 0.5) * size * 0.55;
    const r = size * (0.09 + Math.random() * 0.2);
    const a = 0.05 + Math.random() * 0.08;
    const g = cx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
  }
  return new THREE.CanvasTexture(cv);
}
/* 光点のハロー用：中心が強い放射グラデ */
function makeGlowTexture(size = 128): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const cx = cv.getContext("2d")!;
  const g = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = g;
  cx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

/* ---- 振り付けキー ---- */
type Key = {
  at: number;
  x: number; y: number; z: number;
  s: number; amp: number; iri: number; rough: number;
  spin: number; rotX: number; lis: number;
  satR: number; satS: number;
  dust: number; bloomS: number; camZ: number;
  space: number;   // PS2空間（靄・光点・キューブ）の存在感。1=Hero、0=以降
};
const smooth = (t: number) => t * t * (3 - 2 * t);
function sampleKeys(keys: Key[], p: number): Key {
  if (p <= keys[0].at) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (p >= a.at && p <= b.at) {
      const t = smooth((p - a.at) / (b.at - a.at || 1));
      const out = { ...a };
      (Object.keys(a) as (keyof Key)[]).forEach(k => { out[k] = a[k] + (b[k] - a[k]) * t; });
      return out;
    }
  }
  return keys[keys.length - 1];
}

/* ---- 光点（緑・青・赤）の浮遊パラメータ ---- */
const ORBS = [
  { color: 0x49e07c, ax: 2.6, ay: 1.5, az: .9, fx: .21, fy: .33, fz: .27, px: 0.0, py: 1.1, pz: 2.2 },  // 緑
  { color: 0x4aa8ff, ax: 3.1, ay: 1.2, az: 1.1, fx: .17, fy: .29, fz: .23, px: 2.1, py: 3.7, pz: 0.6 },  // 青
  { color: 0xff4d5a, ax: 2.2, ay: 1.7, az: .8, fx: .25, fy: .19, fz: .31, px: 4.2, py: 0.4, pz: 3.9 },  // 赤
];
const TRAIL = 64;   // 尾の長さ（過去フレーム数）

export default function Scene3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* ---- renderer / composer ---- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setClearColor(0x020308, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020308, 0.05);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
    camera.position.set(0, 0, 7);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTex;

    /* ================= PS2空間（Hero） ================= */
    const space = new THREE.Group();
    scene.add(space);

    /* --- 青い靄（星雲）：加算合成の雲スプライト群を中心に --- */
    const cloudTex = makeCloudTexture();
    const NEB = 28;
    const nebulaMats: THREE.SpriteMaterial[] = [];
    const nebulaBase: number[] = [];
    const NEB_COLORS = [0x2a4b9b, 0x3a6fd8, 0x274b8f, 0x4b3fae, 0x2f5fc0]; // 青〜わずかに紫
    for (let i = 0; i < NEB; i++) {
      /* 加算合成は枚数分明るさが積み上がる。1枚あたりはかなり薄くしないと
         重なりで白飛びし、ブルームが全画面に流れる（実測済み）。
         枚数と大きさで「靄の量」を稼ぎ、1枚は薄いまま＝輪郭のないぼんやりした塊にする */
      const m = new THREE.SpriteMaterial({
        map: cloudTex,
        color: NEB_COLORS[i % NEB_COLORS.length],
        transparent: true,
        opacity: 0.032 + Math.random() * 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        rotation: Math.random() * Math.PI * 2,
      });
      nebulaMats.push(m);
      nebulaBase.push(m.opacity);
      const sp = new THREE.Sprite(m);
      const r = Math.random();
      sp.position.set(
        (Math.random() - 0.5) * 4.6 * (0.4 + r),
        (Math.random() - 0.5) * 3.4 * (0.4 + r),
        -4 + (Math.random() - 0.5) * 3.2
      );
      const sc = 3.4 + Math.random() * 5.4;   // 大きめ＝境界が画面外に溶けて霞む
      sp.scale.set(sc, sc * (0.7 + Math.random() * 0.5), 1);
      space.add(sp);
    }

    /* --- 光点3つ（緑・青・赤）＋同色ハロー＋尾 --- */
    const glowTex = makeGlowTexture();
    const orbMeshes: THREE.Mesh[] = [];
    const orbTrails: { line: THREE.Line; positions: Float32Array }[] = [];
    ORBS.forEach(o => {
      /* 光点は「小さく・控えめに」。強い発光はブルーム任せにせず抑える（代表指示） */
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: o.color, transparent: true, opacity: .5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      halo.scale.setScalar(0.45);
      core.add(halo);
      space.add(core);
      orbMeshes.push(core);

      /* 尾：過去位置をつないだライン。加算合成なので末尾へ黒フェード＝自然に消える */
      const positions = new Float32Array(TRAIL * 3);
      const colors = new Float32Array(TRAIL * 3);
      const c = new THREE.Color(o.color);
      for (let i = 0; i < TRAIL; i++) {
        const f = Math.pow(1 - i / TRAIL, 1.8);   // 先頭ほど明るい
        colors[i * 3] = c.r * f; colors[i * 3 + 1] = c.g * f; colors[i * 3 + 2] = c.b * f;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: .45,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      line.frustumCulled = false;
      space.add(line);
      orbTrails.push({ line, positions });
    });

    /* --- 黒いサイコロ：ぎりぎり見える暗さでぷかぷか --- */
    const CUBES = 7;
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    /* キューブは「ぎりぎり見えるかどうか」まで沈める：
       素材はほぼ黒・低反射、置き場所も靄と同じ深さ（霧とスプライトに呑まれる） */
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x05060a, roughness: 0.75, metalness: 0.12, envMapIntensity: 0.1,
    });
    const cubes: { m: THREE.Mesh; p0: THREE.Vector3; rs: THREE.Vector3; bob: number }[] = [];
    for (let i = 0; i < CUBES; i++) {
      const m = new THREE.Mesh(cubeGeo, cubeMat);
      const p0 = new THREE.Vector3(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 4.5,
        -4.5 + (Math.random() - 0.5) * 4
      );
      m.position.copy(p0);
      m.scale.setScalar(0.35 + Math.random() * 0.5);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      space.add(m);
      cubes.push({
        m, p0,
        rs: new THREE.Vector3((Math.random() - .5) * .3, (Math.random() - .5) * .3, (Math.random() - .5) * .2),
        bob: Math.random() * Math.PI * 2,
      });
    }

    /* ================= ブロブ（APPROACH以降の主役） ================= */
    const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.3 } };
    const blobGeo = new THREE.IcosahedronGeometry(1.55, 5);
    const blobMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfc3c9, metalness: 1, roughness: 0.16, envMapIntensity: 1.35,
      iridescence: 1, iridescenceIOR: 1.32, iridescenceThicknessRange: [120, 620],
    });
    blobMat.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\nuniform float uTime;\nuniform float uAmp;\n${SNOISE}`)
        .replace("#include <beginnormal_vertex>", `
          vec3 objectNormal = normalize(normal);
          {
            float e = 0.12;
            vec3 pos0 = position;
            float d0 = disp(pos0, uTime, uAmp);
            vec3 t1 = normalize(cross(objectNormal, vec3(0.0, 1.0, 0.001)));
            vec3 t2 = normalize(cross(objectNormal, t1));
            float d1 = disp(pos0 + t1 * e, uTime, uAmp);
            float d2 = disp(pos0 + t2 * e, uTime, uAmp);
            vec3 displaced  = pos0 + objectNormal * d0;
            vec3 neighbor1  = pos0 + t1 * e + objectNormal * d1;
            vec3 neighbor2  = pos0 + t2 * e + objectNormal * d2;
            objectNormal = normalize(cross(neighbor1 - displaced, neighbor2 - displaced));
          }
        `)
        .replace("#include <begin_vertex>", `
          vec3 transformed = position + normalize(position) * disp(position, uTime, uAmp);
        `);
    };
    const blob = new THREE.Mesh(blobGeo, blobMat);
    scene.add(blob);

    const satMat = new THREE.MeshPhysicalMaterial({
      color: 0xd7dade, metalness: 1, roughness: 0.05, envMapIntensity: 1.6,
      iridescence: 0.65, iridescenceIOR: 1.3,
    });
    const sat1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 48, 48), satMat);
    const sat2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 40, 40), satMat);
    scene.add(sat1, sat2);

    /* ---- 星屑（宇宙の背景。全セクション共通） ---- */
    const N = 1300;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 5 + Math.random() * 9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph) - 3;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x8fa0c4, size: 0.022, sizeAttenuation: true,
      transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const dust = new THREE.Points(pGeo, pMat);
    scene.add(dust);

    const rim = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(-3, 4, 2);
    scene.add(rim);

    /* ---- ブルーム ---- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.9, 0.72);
    composer.addPass(bloom);

    /* ---- 振り付けキー（実セクション位置から構築） ---- */
    let KEYS: Key[] = [];
    let heroLen = 1;   // Hero区間のスクロール長（px）＝ダイブの分母
    const buildKeys = () => {
      const H = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const vh = window.innerHeight;
      const topOf = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? (el as HTMLElement).getBoundingClientRect().top + window.scrollY : H;
      };
      const f = (px: number) => Math.min(1, Math.max(0, px / H));
      const heroEl = document.querySelector(".wc2-hero") as HTMLElement | null;
      heroLen = Math.max(1, (heroEl?.offsetHeight ?? vh * 3) - vh);
      const approach  = topOf(".wc2-approach-sec");
      const works     = topOf(".wc2-works-sec");
      const worksEnd  = works + ((document.querySelector(".wc2-works-sec") as HTMLElement)?.offsetHeight ?? vh);
      const services  = topOf(".wc2-services-sec");
      const strengths = topOf(".wc2-strengths-sec");
      const contact   = topOf(".wc2-contact");

      KEYS = [
        /* HERO：PS2空間。ブロブは潜伏。カメラはダイブ制御（camZはspaceで無効化される） */
        { at: 0,                        x: 0,    y: -4.2, z: -.5, s: .3,   amp: .3,  iri: .8, rough: .2,  spin: .12, rotX: 0,    lis: 0,   satR: 2.6, satS: .4,  dust: .18, bloomS: .32, camZ: 7,   space: 1 },
        { at: f(approach - vh * .9),    x: 0,    y: -4.2, z: -.5, s: .3,   amp: .3,  iri: .8, rough: .2,  spin: .2,  rotX: .2,   lis: 0,   satR: 2.2, satS: .5,  dust: .12, bloomS: .3,  camZ: 6.2, space: 1 },
        /* APPROACH：暗転明け。PS2空間は消え、ブロブが左に浮上 */
        { at: f(approach - vh * .35),   x: -1.9, y: .25,  z: -.5, s: .6,   amp: .2,  iri: .7, rough: .22, spin: .38, rotX: .38,  lis: .14, satR: 1.7, satS: .55, dust: .4,  bloomS: .42, camZ: 5.6, space: 0 },
        /* WORKS：画面下へ退場（光の間） */
        { at: f(works - vh * .3),       x: 0,    y: -3.6, z: -.8, s: .3,   amp: .15, iri: .4, rough: .3,  spin: .5,  rotX: .6,   lis: 0,   satR: 2.8, satS: .35, dust: .12, bloomS: .28, camZ: 6.2, space: 0 },
        { at: f(worksEnd - vh * .8),    x: 0,    y: -3.3, z: -.8, s: .3,   amp: .2,  iri: .5, rough: .28, spin: .5,  rotX: .45,  lis: 0,   satR: 2.4, satS: .45, dust: .18, bloomS: .3,  camZ: 6,   space: 0 },
        /* SERVICES：左から再入場、8の字浮遊 */
        { at: f(services - vh * .25),   x: -1.5, y: .05,  z: -.3, s: .62,  amp: .34, iri: .9, rough: .18, spin: .26, rotX: -.25, lis: .38, satR: .75, satS: 2.3, dust: .5,  bloomS: .5,  camZ: 5.5, space: 0 },
        /* STRENGTHS：右へスイッチして逆回転 */
        { at: f(strengths - vh * .25),  x: 1.7,  y: -.1,  z: -.6, s: .55,  amp: .26, iri: .8, rough: .2,  spin: -.3, rotX: .2,   lis: .2,  satR: 1.25, satS: 1.4, dust: .45, bloomS: .45, camZ: 5.8, space: 0 },
        /* CONTACT：フィナーレ */
        { at: f(contact - vh * .45),    x: 0,    y: .02,  z: .6,  s: 1.28, amp: .5,  iri: 1,  rough: .12, spin: .4,  rotX: 0,    lis: .08, satR: 1.1, satS: 1.8, dust: .6,  bloomS: .8,  camZ: 5.1, space: 0 },
        { at: 1,                        x: 0,    y: 0,    z: .7,  s: 1.32, amp: .54, iri: 1,  rough: .12, spin: .42, rotX: 0,    lis: .08, satR: 1.1, satS: 1.9, dust: .6,  bloomS: .85, camZ: 5,   space: 0 },
      ].sort((a, b) => a.at - b.at);
    };
    buildKeys();
    const roDoc = new ResizeObserver(buildKeys);
    roDoc.observe(document.body);

    /* ---- 入力 ---- */
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMouse = (e: MouseEvent) => {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const progress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    /* ---- サイズ ---- */
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      buildKeys();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    /* マウント直後は host のサイズが 0 のことがあり（その場合バッファが 1x1 になる）、
       環境によっては ResizeObserver も当てにならない。少し遅らせてもう一度測る */
    const lateResize = window.setTimeout(resize, 80);
    window.addEventListener("resize", resize);

    /* 開発時のみ：コンソールから切り分けるためのハンドル */
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__wc2dbg = { bloom, space, blob, dust, composer, renderer, scene, camera, nebulaMats };
    }

    /* ---- ループ ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;
    let pSmooth = 0;
    let spinAcc = 0.6;
    let lastT = 0;
    const renderFrame = () => {
      /* 自己修復：バッファと実サイズがずれていたら測り直す（1x1バッファ対策） */
      const bw = Math.round((host.clientWidth || 1) * renderer.getPixelRatio());
      if (Math.abs(renderer.domElement.width - bw) > 2) resize();

      const t = prefersReduced ? 0.8 : clock.getElapsedTime();
      const dt = Math.min(0.05, t - lastT); lastT = t;
      uniforms.uTime.value = t;

      pSmooth += (progress() - pSmooth) * 0.08;
      const k = sampleKeys(KEYS, pSmooth);
      const sp = k.space;

      /* --- Hero内のダイブ進行度（0=開始, 1=靄の中心＝暗転点） --- */
      const heroP = Math.min(1, Math.max(0, window.scrollY / heroLen));

      /* オープニングは露出そのものを落として全体を暗く（代表指示）。
         ダイブで中心に近づくにつれて少し戻す＝吸い込まれる際の増光は残す */
      renderer.toneMappingExposure = (1.1 - 0.42 * sp) + 0.18 * heroP * sp;

      /* --- PS2空間 --- */
      space.visible = sp > 0.01;
      if (space.visible) {
        /* 靄：ダイブで濃く・明るく（中心に近づく感覚） */
        nebulaMats.forEach((m, i) => {
          m.opacity = nebulaBase[i] * sp * (1 + heroP * 1.4);
          m.rotation += dt * 0.02 * (i % 2 ? 1 : -1);
        });

        /* 光点：トリガーに関係なく常に自由浮遊 */
        ORBS.forEach((o, i) => {
          const p = orbMeshes[i].position;
          p.set(
            Math.sin(t * o.fx + o.px) * o.ax,
            Math.sin(t * o.fy + o.py) * o.ay,
            -1.4 + Math.sin(t * o.fz + o.pz) * o.az   // 靄の手前〜中を漂う＝霞に少し呑まれる
          );
          /* 尾：過去位置を1つずつ後ろへ送る */
          const tr = orbTrails[i];
          tr.positions.copyWithin(3, 0, (TRAIL - 1) * 3);
          tr.positions[0] = p.x; tr.positions[1] = p.y; tr.positions[2] = p.z;
          (tr.line.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
          (tr.line.material as THREE.LineBasicMaterial).opacity = 0.22 * sp;
          (orbMeshes[i].children[0] as THREE.Sprite).material.opacity = 0.26 * sp;
          (orbMeshes[i].material as THREE.MeshBasicMaterial).color.setScalar(0.48 * sp);
        });

        /* 黒サイコロ：ぷかぷか＋ゆっくり回転 */
        cubes.forEach(cb => {
          cb.m.rotation.x += cb.rs.x * dt;
          cb.m.rotation.y += cb.rs.y * dt;
          cb.m.rotation.z += cb.rs.z * dt;
          cb.m.position.y = cb.p0.y + Math.sin(t * 0.4 + cb.bob) * 0.25;
          cb.m.position.x = cb.p0.x + Math.sin(t * 0.23 + cb.bob * 2) * 0.15;
        });
        cubeMat.opacity = 1;
      }

      /* --- ブロブ側 --- */
      uniforms.uAmp.value = k.amp;
      blobMat.iridescence = k.iri;
      blobMat.roughness = k.rough;
      pMat.opacity = k.dust;
      bloom.strength = k.bloomS;

      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      spinAcc += k.spin * dt * 4;

      const lx = Math.sin(t * 0.55) * k.lis * 1.6;
      const ly = Math.sin(t * 1.1) * k.lis;
      blob.position.set(k.x + lx + mx * 0.3, k.y + ly - my * 0.25, k.z);
      blob.scale.setScalar(k.s);
      blob.rotation.y = spinAcc;
      blob.rotation.x = k.rotX + my * 0.2 + Math.sin(t * 0.4) * 0.06;
      blob.visible = sp < 0.98;   // Hero中は完全に隠す（潜伏はしているが描かない）

      sat1.visible = sat2.visible = blob.visible;
      sat1.position.set(
        blob.position.x + Math.cos(t * 0.5 * k.satS) * 2.1 * k.satR * k.s,
        blob.position.y + Math.sin(t * 0.7 * k.satS) * 0.75 * k.satR * k.s,
        blob.position.z + Math.sin(t * 0.5 * k.satS) * 1.1
      );
      sat2.position.set(
        blob.position.x + Math.cos(t * 0.85 * k.satS + 2.4) * 1.55 * k.satR * k.s,
        blob.position.y + Math.sin(t * 0.6 * k.satS + 1.2) * 1.05 * k.satR * k.s,
        blob.position.z + Math.cos(t * 0.7 * k.satS) * 0.8
      );

      dust.rotation.y = t * 0.012 + mx * 0.06;
      dust.rotation.x = my * 0.04;

      /* --- カメラ ---
         Hero中：z=7 から靄の中心(z≈-4)の先へ、スクロールで加速しながらダイブ。
         以降：キーの camZ に戻る（spaceでブレンド） */
      const diveZ = 7 - Math.pow(heroP, 1.5) * 10.2;   // 7 → -3.2（靄を突き抜ける）
      camera.position.z = k.camZ * (1 - sp) + diveZ * sp;
      camera.position.x = mx * 0.35 + Math.sin(t * 0.06) * 0.3 * sp;
      camera.position.y = -my * 0.3 + Math.sin(t * 0.045) * 0.15 * sp;
      camera.lookAt(0, 0, camera.position.z - 6);   // 常に進行方向を見る

      composer.render();
    };
    const loop = () => {
      if (disposed) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    renderFrame();
    if (!prefersReduced) raf = requestAnimationFrame(loop);
    if (import.meta.env.DEV) {
      Object.assign((window as unknown as Record<string, object>).__wc2dbg, { renderFrame, resize });
    }

    /* ---- 後片付け ---- */
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(lateResize);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
      roDoc.disconnect();
      cloudTex.dispose(); glowTex.dispose();
      nebulaMats.forEach(m => m.dispose());
      orbMeshes.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      orbTrails.forEach(tr => { tr.line.geometry.dispose(); (tr.line.material as THREE.Material).dispose(); });
      cubeGeo.dispose(); cubeMat.dispose();
      blobGeo.dispose(); blobMat.dispose();
      sat1.geometry.dispose(); sat2.geometry.dispose(); satMat.dispose();
      pGeo.dispose(); pMat.dispose();
      envTex.dispose(); pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="wc2-scene" ref={hostRef} aria-hidden="true"></div>;
}
