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
 * 液体クロームのブロブ＋衛星球＋粒子場＋ブルーム。
 * セクションごとに「別の動き」をする振り付けエンジン：
 *   HERO      … 右で大きく、ゆったり自転
 *   APPROACH  … 左へ退き、軸が傾いて速い自転
 *   WORKS     … 画面下へ完全退場（作品セクション＝光の間を邪魔しない）
 *   SERVICES  … 左から再入場して8の字浮遊、衛星は近く速く
 *   STRENGTHS … 右へスイッチして逆回転
 *   CONTACT   … 中央で最大化・うねり全開・ブルーム増強のフィナーレ
 * 区間の境界は実際のセクション位置（DOM）から算出し、スクロール進行度は
 * 慣性付きで補間するので、動きは常になめらか。
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

/* ---- 振り付けキー：区間ごとのパラメータ一式 ---- */
type Key = {
  at: number;       // 進行度 0..1（実セクション位置から算出）
  x: number; y: number; z: number;   // ブロブ位置
  s: number;        // スケール
  amp: number;      // うねり振幅
  iri: number;      // 薄膜イリデッセンス強度
  rough: number;    // 面の荒れ
  spin: number;     // 自転速度（負で逆回転）
  rotX: number;     // 軸の傾き
  lis: number;      // 8の字（リサージュ）浮遊の振幅
  satR: number;     // 衛星の軌道半径倍率
  satS: number;     // 衛星の速度倍率
  dust: number;     // 粒子の濃さ
  bloomS: number;   // ブルーム強度
  camZ: number;     // カメラ距離
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

export default function Scene3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* ---- renderer / composer ---- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setClearColor(0x05060a, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.055);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTex;

    /* ---- 液体クロームのブロブ ---- */
    const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.34 } };
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

    /* ---- 衛星球 ---- */
    const satMat = new THREE.MeshPhysicalMaterial({
      color: 0xd7dade, metalness: 1, roughness: 0.05, envMapIntensity: 1.6,
      iridescence: 0.65, iridescenceIOR: 1.3,
    });
    const sat1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 48, 48), satMat);
    const sat2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 40, 40), satMat);
    scene.add(sat1, sat2);

    /* ---- 粒子場 ---- */
    const N = 1300;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 4.5 + Math.random() * 6.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph) - 2;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x93a4c8, size: 0.025, sizeAttenuation: true,
      transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const dust = new THREE.Points(pGeo, pMat);
    scene.add(dust);

    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-3, 4, 2);
    scene.add(rim);

    /* ---- ブルーム ---- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.85, 0.78);
    composer.addPass(bloom);

    /* ---- 振り付けキー：実セクション位置から構築 ---- */
    let KEYS: Key[] = [];
    const buildKeys = () => {
      const H = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const vh = window.innerHeight;
      const topOf = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? (el as HTMLElement).getBoundingClientRect().top + window.scrollY : H;
      };
      const f = (px: number) => Math.min(1, Math.max(0, px / H));
      const approach  = topOf(".wc2-approach-sec");
      const works     = topOf(".wc2-works-sec");
      const worksEnd  = works + ((document.querySelector(".wc2-works-sec") as HTMLElement)?.offsetHeight ?? vh);
      const services  = topOf(".wc2-services-sec");
      const strengths = topOf(".wc2-strengths-sec");
      const contact   = topOf(".wc2-contact");

      KEYS = [
        /* HERO：右で大きく・ゆったり */
        { at: 0,                        x: 1.55, y: -.05, z: 0,   s: 1,    amp: .34, iri: 1,  rough: .16, spin: .12, rotX: 0,    lis: .06, satR: 1,   satS: 1,   dust: .55, bloomS: .5,  camZ: 6 },
        /* APPROACH：左へ退いて軸が傾き、自転が速まる */
        { at: f(approach - vh * .6),    x: -1.9, y: .25,  z: -.5, s: .6,   amp: .2,  iri: .7, rough: .22, spin: .38, rotX: .38,  lis: .14, satR: 1.7, satS: .55, dust: .4,  bloomS: .42, camZ: 5.6 },
        /* WORKS：画面下へ完全退場（光の間に主役を譲る） */
        { at: f(works - vh * .3),       x: 0,    y: -3.6, z: -.8, s: .3,   amp: .15, iri: .4, rough: .3,  spin: .5,  rotX: .6,   lis: 0,   satR: 2.8, satS: .35, dust: .12, bloomS: .28, camZ: 6.2 },
        { at: f(worksEnd - vh * .8),    x: 0,    y: -3.3, z: -.8, s: .3,   amp: .2,  iri: .5, rough: .28, spin: .5,  rotX: .45,  lis: 0,   satR: 2.4, satS: .45, dust: .18, bloomS: .3,  camZ: 6 },
        /* SERVICES：左から再入場、8の字浮遊・衛星は近く速く */
        { at: f(services - vh * .25),   x: -1.5, y: .05,  z: -.3, s: .62,  amp: .34, iri: .9, rough: .18, spin: .26, rotX: -.25, lis: .38, satR: .75, satS: 2.3, dust: .5,  bloomS: .5,  camZ: 5.5 },
        /* STRENGTHS：右へスイッチして逆回転 */
        { at: f(strengths - vh * .25),  x: 1.7,  y: -.1,  z: -.6, s: .55,  amp: .26, iri: .8, rough: .2,  spin: -.3, rotX: .2,   lis: .2,  satR: 1.25, satS: 1.4, dust: .45, bloomS: .45, camZ: 5.8 },
        /* CONTACT：中央で最大化のフィナーレ */
        { at: f(contact - vh * .45),    x: 0,    y: .02,  z: .6,  s: 1.28, amp: .5,  iri: 1,  rough: .12, spin: .4,  rotX: 0,    lis: .08, satR: 1.1, satS: 1.8, dust: .6,  bloomS: .8,  camZ: 5.1 },
        { at: 1,                        x: 0,    y: 0,    z: .7,  s: 1.32, amp: .54, iri: 1,  rough: .12, spin: .42, rotX: 0,    lis: .08, satR: 1.1, satS: 1.9, dust: .6,  bloomS: .85, camZ: 5 },
      ].sort((a, b) => a.at - b.at);
    };
    buildKeys();
    /* コンテンツ読み込みで文書の高さが変わったら境界を測り直す */
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

    /* ---- ループ ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;
    let pSmooth = 0;          // 進行度の慣性（急スクロールでも滑らかに振り付けが追う）
    let spinAcc = 0.6;        // 自転の積分（速度が変わっても角度が飛ばない）
    let lastT = 0;
    const renderFrame = () => {
      const t = prefersReduced ? 0.8 : clock.getElapsedTime();
      const dt = Math.min(0.05, t - lastT); lastT = t;
      uniforms.uTime.value = t;

      pSmooth += (progress() - pSmooth) * 0.07;
      const k = sampleKeys(KEYS, pSmooth);

      uniforms.uAmp.value = k.amp;
      blobMat.iridescence = k.iri;
      blobMat.roughness = k.rough;
      pMat.opacity = k.dust;
      bloom.strength = k.bloomS;

      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      spinAcc += k.spin * dt * 4;

      /* 8の字（リサージュ）浮遊＋マウス視差 */
      const lx = Math.sin(t * 0.55) * k.lis * 1.6;
      const ly = Math.sin(t * 1.1) * k.lis;
      blob.position.set(k.x + lx + mx * 0.3, k.y + ly - my * 0.25, k.z);
      blob.scale.setScalar(k.s);
      blob.rotation.y = spinAcc;
      blob.rotation.x = k.rotX + my * 0.2 + Math.sin(t * 0.4) * 0.06;

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

      camera.position.x = mx * 0.35;
      camera.position.y = -my * 0.3;
      camera.position.z = k.camZ;
      camera.lookAt(0, 0, 0);

      composer.render();
    };
    const loop = () => {
      if (disposed) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    renderFrame();            // rAF が凍る環境でも1フレームは必ず描く
    if (!prefersReduced) raf = requestAnimationFrame(loop);

    /* ---- 後片付け ---- */
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
      roDoc.disconnect();
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
