import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { prefersReduced } from "../../motion";

/**
 * STRENGTHS の 3D「鋼の構造体」。
 * 暗い空間に、鈍く光る鋼鉄の骨組み（4本の柱＋上下の梁）が、
 * スクロールで重さを感じさせて 1本ずつ落ちて組み上がる。着地でわずかに沈んで締まる。
 * カメラはゆっくり回り込み、立体感を出す。素材は暗くマットな鋼（眩しいクロームではない）。
 * 透過キャンバスなので背後の設計図グリッドが透ける＝世界と地続き。
 */
export default function StrengthScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;              // 暗めに抑える（重い鋼）
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.3, 9);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.5).texture;
    scene.environment = envTex;

    /* 鋼材（暗くマットな金属） */
    const steel = new THREE.MeshStandardMaterial({
      color: 0x585d66, metalness: 0.92, roughness: 0.42, envMapIntensity: 0.9,
    });

    const group = new THREE.Group();
    scene.add(group);

    /* 4本の柱（I形に見えるよう、太い箱＋左右のフランジ） */
    const H = 4.2;                          // 柱の高さ
    const SPAN = 4.8;                       // 柱間の総幅
    const N = 4;
    const pillars: { g: THREE.Group; targetY: number; delay: number }[] = [];
    const web = new THREE.BoxGeometry(0.16, H, 0.5);
    const flange = new THREE.BoxGeometry(0.5, H, 0.14);
    for (let i = 0; i < N; i++) {
      const g = new THREE.Group();
      const w = new THREE.Mesh(web, steel);
      const f1 = new THREE.Mesh(flange, steel); f1.position.z = 0.32;
      const f2 = new THREE.Mesh(flange, steel); f2.position.z = -0.32;
      g.add(w, f1, f2);
      g.position.x = -SPAN / 2 + (SPAN / (N - 1)) * i;
      group.add(g);
      pillars.push({ g, targetY: 0, delay: i * 0.12 });
    }

    /* 上下の梁（横） */
    const beamGeo = new THREE.BoxGeometry(SPAN + 0.9, 0.34, 0.5);
    const topBeam = new THREE.Mesh(beamGeo, steel);
    const botBeam = new THREE.Mesh(beamGeo, steel);
    topBeam.position.y = H / 2 + 0.1;
    botBeam.position.y = -H / 2 - 0.1;
    group.add(topBeam, botBeam);

    /* ライト（環境が主。締めのキー＋リム） */
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-4, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x88a0c0, 0.8); rim.position.set(5, 2, -4); scene.add(rim);
    scene.add(new THREE.AmbientLight(0x404652, 0.5));

    /* サイズ追従 */
    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    const lateResize = window.setTimeout(resize, 120);
    window.addEventListener("resize", resize);

    /* このシーンのスクロール進行度（セクションが画面に入る量）。0=未組立, 1=組み上がり */
    const progress = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      /* 下から入ってきて、中央〜上に来るまでで 0→1 */
      return Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.75)));
    };
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);          // ease-out-cubic（落下）
    const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

    let mx = 0, tmx = 0;
    const onMouse = (e: MouseEvent) => { tmx = e.clientX / window.innerWidth - 0.5; };
    window.addEventListener("mousemove", onMouse, { passive: true });

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__strdbg = { renderer, scene, camera, group, resize };
    }

    let raf = 0, disposed = false;
    const renderFrame = (t: number) => {
      const bw = Math.round((host.clientWidth || 1) * renderer.getPixelRatio());
      if (host.clientWidth > 0 && Math.abs(renderer.domElement.width - bw) > 2) resize();
      const time = prefersReduced ? 1 : t / 1000;

      const P = prefersReduced ? 1 : progress();

      /* 各柱：上から落ちて着地（重い）。着地の瞬間に軽く沈んで戻る（衝撃） */
      pillars.forEach(p => {
        const local = clamp01((P - p.delay) / 0.4);
        const drop = (1 - ease(local)) * 9;                       // 9 上から落ちる
        /* 着地の沈み込み（local 0.85〜1 で少し縮んで戻る） */
        const settle = local > 0.85 ? Math.sin((local - 0.85) / 0.15 * Math.PI) * 0.12 : 0;
        p.g.position.y = drop - settle;
        p.g.visible = local > 0.001;
      });
      /* 梁：柱が立ってから閉じる（上→下の順） */
      const tb = clamp01((P - 0.5) / 0.3);
      const bb = clamp01((P - 0.62) / 0.3);
      topBeam.position.y = (H / 2 + 0.1) + (1 - ease(tb)) * 4;
      botBeam.position.y = (-H / 2 - 0.1) - (1 - ease(bb)) * 4;
      topBeam.visible = tb > 0.001; botBeam.visible = bb > 0.001;

      /* カメラ：ゆっくり回り込み＋マウス視差。組み上がるほど正面に寄る */
      mx += (tmx - mx) * 0.05;
      const orbit = (prefersReduced ? 0.5 : Math.sin(time * 0.18) * 0.5 + 0.5); // 0..1 ゆらぎ
      const ang = (0.5 - P * 0.42) + (orbit - 0.5) * 0.12 + mx * 0.5;
      const rad = 9 - P * 1.6;
      camera.position.x = Math.sin(ang) * rad;
      camera.position.z = Math.cos(ang) * rad;
      camera.position.y = 0.3 + Math.sin(time * 0.12) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    const loop = (t: number) => { if (disposed) return; renderFrame(t); raf = requestAnimationFrame(loop); };
    renderFrame(0);
    if (!prefersReduced) raf = requestAnimationFrame(loop);
    if (import.meta.env.DEV) {
      Object.assign((window as unknown as Record<string, object>).__strdbg, { renderFrame });
    }

    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.clearTimeout(lateResize);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      ro.disconnect();
      web.dispose(); flange.dispose(); beamGeo.dispose(); steel.dispose();
      envTex.dispose(); pmrem.dispose(); renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="wc2-str3d" ref={hostRef} aria-hidden="true"></div>;
}
