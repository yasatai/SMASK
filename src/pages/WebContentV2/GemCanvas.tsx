import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { prefersReduced } from "../../motion";

/**
 * Hero の 3D ジェム（trionn.com の WebGL オブジェクトのオマージュ）。
 * SMASK なので岩ではなく「ブリリアントカット風の宝石」。
 * - 常時ゆっくり自転＋マウスで傾き＋スクロールで回転が進む
 * - ファセットの輪郭線（金）を重ね、サイトの線画アイコンの言語に揃える
 * - reduced-motion では自転なし（静止した宝石を1フレームだけ描く）
 * - R3F は使わず素の three.js（依存を増やさない・寿命管理を自前で明確に）
 */
export default function GemCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* ---- renderer / scene / camera ---- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // 検証やスクリーンショットでキャンバスを読めるように保持（オブジェクト1個なのでコストは軽微）
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.25, 4.6);
    camera.lookAt(0, 0, 0);

    /* 反射環境（外部アセット不要の室内 HDR 相当） */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    /* ---- ジェム本体：クラウン（8面の台形帯＋テーブル）＋パビリオン（8面の逆錐） ---- */
    const crown = new THREE.CylinderGeometry(0.52, 1, 0.42, 8, 1);
    crown.translate(0, 0.21, 0);
    const pavilion = new THREE.ConeGeometry(1, 1.2, 8);
    pavilion.rotateX(Math.PI); // 尖りを下へ
    pavilion.translate(0, -0.6, 0);
    const gemGeo = mergeGeometries([crown.toNonIndexed(), pavilion.toNonIndexed()]);

    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transmission: 0.92,       // ガラス的な透過
      thickness: 1.3,
      ior: 2.4,                 // ダイヤモンドの屈折率
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.5,
      flatShading: true,        // ファセット感
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.scale.setScalar(1.45);

    /* ファセット輪郭線（金）— サイトの線画トーンに合わせる */
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(gemGeo, 8),
      new THREE.LineBasicMaterial({ color: 0xcfa96b, transparent: true, opacity: 0.55 })
    );
    gem.add(edges);
    scene.add(gem);

    /* ブランド色のアクセント光（金のリム＋青・赤の差し色を弱く） */
    const gold = new THREE.DirectionalLight(0xe8c88a, 1.4);
    gold.position.set(2.4, 3, 1.6);
    scene.add(gold);
    const sapphire = new THREE.PointLight(0x3a6fd8, 6, 12);
    sapphire.position.set(-3, -1, 2.5);
    scene.add(sapphire);
    const ruby = new THREE.PointLight(0xc0384a, 4, 10);
    ruby.position.set(3, -2.2, -1.5);
    scene.add(ruby);

    /* ---- 入力：マウスの傾き＋スクロール回転 ---- */
    let targetTiltX = 0;
    let targetTiltZ = 0;
    let tiltX = 0;
    let tiltZ = 0;
    let baseRotY = 0.6; // 初期角（正面すぎない見栄えの角度）
    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetTiltX = ny * 0.35;
      targetTiltZ = -nx * 0.22;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    /* ---- サイズ追従 ---- */
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    /* ---- 描画ループ ---- */
    let raf = 0;
    let disposed = false;
    const renderFrame = () => {
      tiltX += (targetTiltX - tiltX) * 0.06;
      tiltZ += (targetTiltZ - tiltZ) * 0.06;
      if (!prefersReduced) baseRotY += 0.004;
      gem.rotation.set(tiltX, baseRotY + window.scrollY * 0.0016, tiltZ);
      renderer.render(scene, camera);
    };
    const loop = () => {
      if (disposed) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    renderFrame();           // rAF が来なくても最低1フレームは描く
    if (!prefersReduced) raf = requestAnimationFrame(loop);

    /* ---- 後片付け ---- */
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      gemGeo.dispose();
      gemMat.dispose();
      (edges.geometry as THREE.BufferGeometry).dispose();
      (edges.material as THREE.Material).dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="wc2-gem" ref={hostRef} aria-hidden="true"></div>;
}
