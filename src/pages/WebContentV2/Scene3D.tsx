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
 * - 液体クロームのブロブ：MeshPhysicalMaterial（metalness 1 + iridescence=薄膜の虹）に
 *   onBeforeCompile で simplex ノイズの頂点変形を注入。法線は勾配の有限差分で再計算
 * - 衛星球 2 個・粒子場・UnrealBloom の発光
 * - スクロール進行度で位置/スケール/うねり/虹の強さを振り付け（セクションごとに表情が変わる）
 * - マウスで視差、reduced-motion では時間停止（静止した彫刻として1フレーム描画）
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

/* ---- スクロール振り付け：進行度 0..1 の区間ごとにブロブの表情を変える ----
   pos はワールド座標、amp はうねり振幅、iri は虹の強さ、rough は面の荒れ */
type Key = { at: number; x: number; y: number; z: number; s: number; amp: number; iri: number; rough: number };
const KEYS: Key[] = [
  { at: 0.00, x:  1.55, y: -0.05, z: 0,    s: 1.00, amp: 0.34, iri: 1.0, rough: 0.16 }, // Hero：右に大きく
  { at: 0.16, x: -1.75, y:  0.15, z: -0.4, s: 0.62, amp: 0.22, iri: 0.7, rough: 0.22 }, // APPROACH：左へ退いて静かに
  { at: 0.36, x:  1.9,  y: -0.2,  z: -1.2, s: 0.48, amp: 0.16, iri: 0.5, rough: 0.3  }, // WORKS：右奥で小さく（作品の邪魔をしない）
  { at: 0.62, x: -1.6,  y:  0.1,  z: -0.6, s: 0.58, amp: 0.30, iri: 0.9, rough: 0.2  }, // SERVICES〜：左でうねりを取り戻す
  { at: 0.85, x:  0.0,  y:  0.05, z:  0.6, s: 1.25, amp: 0.5,  iri: 1.0, rough: 0.12 }, // CONTACT：中央で最大・虹全開
  { at: 1.00, x:  0.0,  y:  0.0,  z:  0.7, s: 1.3,  amp: 0.52, iri: 1.0, rough: 0.12 },
];
const smooth = (t: number) => t * t * (3 - 2 * t);
function sampleKeys(p: number): Key {
  if (p <= KEYS[0].at) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (p >= a.at && p <= b.at) {
      const t = smooth((p - a.at) / (b.at - a.at || 1));
      const mix = (ka: number, kb: number) => ka + (kb - ka) * t;
      return { at: p, x: mix(a.x, b.x), y: mix(a.y, b.y), z: mix(a.z, b.z),
        s: mix(a.s, b.s), amp: mix(a.amp, b.amp), iri: mix(a.iri, b.iri), rough: mix(a.rough, b.rough) };
    }
  }
  return KEYS[KEYS.length - 1];
}

export default function Scene3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* ---- renderer / composer ---- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setClearColor(0x05060a, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6)); // ブルーム込みでも軽く
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
    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: KEYS[0].amp },
    };
    const blobGeo = new THREE.IcosahedronGeometry(1.55, 5);
    const blobMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfc3c9,
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 1.35,
      iridescence: 1,          // 薄膜の虹（油膜）
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [120, 620],
    });
    blobMat.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\nuniform float uTime;\nuniform float uAmp;\n${SNOISE}`)
        /* 法線：ノイズ勾配の有限差分で再計算（変形後も反射が破綻しない） */
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

    /* ---- 衛星球（変形なしの純クローム。構図に奥行きを出す） ---- */
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

    /* ---- ライト（環境が主・輪郭の締めだけ足す） ---- */
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-3, 4, 2);
    scene.add(rim);

    /* ---- ブルーム ---- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.85, 0.78);
    composer.addPass(bloom);

    /* ---- 入力：マウス視差・スクロール進行度 ---- */
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
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    /* ---- ループ ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;
    const renderFrame = () => {
      const t = prefersReduced ? 0.8 : clock.getElapsedTime();
      uniforms.uTime.value = t;

      const k = sampleKeys(progress());
      uniforms.uAmp.value = k.amp;
      blobMat.iridescence = k.iri;
      blobMat.roughness = k.rough;

      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      blob.position.set(k.x + mx * 0.3, k.y - my * 0.25, k.z);
      blob.scale.setScalar(k.s);
      blob.rotation.y = t * 0.12 + window.scrollY * 0.0006;
      blob.rotation.x = my * 0.2;

      /* 衛星はブロブの周回軌道 */
      sat1.position.set(
        blob.position.x + Math.cos(t * 0.5) * 2.1 * k.s,
        blob.position.y + Math.sin(t * 0.7) * 0.75 * k.s,
        blob.position.z + Math.sin(t * 0.5) * 1.1
      );
      sat2.position.set(
        blob.position.x + Math.cos(t * 0.85 + 2.4) * 1.55 * k.s,
        blob.position.y + Math.sin(t * 0.6 + 1.2) * 1.05 * k.s,
        blob.position.z + Math.cos(t * 0.7) * 0.8
      );

      dust.rotation.y = t * 0.012 + mx * 0.06;
      dust.rotation.x = my * 0.04;

      camera.position.x = mx * 0.35;
      camera.position.y = -my * 0.3;
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
