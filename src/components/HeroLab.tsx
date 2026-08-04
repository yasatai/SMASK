import { useEffect, useState } from "react";
import {
  HERO_POS, HERO_BR, applyHero, currentPos, currentBr, switchHero,
  type HeroPos, type HeroBr,
} from "../heroLab";
import "../styles/hero-lab.css";

/**
 * トップFVの配置・改行を切り替えるUI（**検証専用・確定したら削除**）。
 * 2軸を独立して押せるようにして、組み合わせを試せるようにしている。
 */
export default function HeroLab() {
  const [pos, setPos] = useState<HeroPos>("left");
  const [br, setBr] = useState<HeroBr>("2");

  useEffect(() => {
    const p = currentPos(), b = currentBr();
    setPos(p); setBr(b);
    applyHero(p, b);
  }, []);

  const posNote = HERO_POS.find(p => p.id === pos)?.note;
  const brNote = HERO_BR.find(b => b.id === br)?.note;

  return (
    <div className="hero-lab" role="group" aria-label="FVの配置・改行の切り替え（検証用）">
      <div className="hero-lab-row">
        <span className="hero-lab-tag">配置</span>
        {HERO_POS.map(p => (
          <button key={p.id} type="button" aria-pressed={p.id === pos}
            title={p.note} onClick={() => switchHero(p.id, br)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="hero-lab-row">
        <span className="hero-lab-tag">改行</span>
        {HERO_BR.map(b => (
          <button key={b.id} type="button" aria-pressed={b.id === br}
            title={b.note} onClick={() => switchHero(pos, b.id)}>
            {b.label}
          </button>
        ))}
      </div>
      <p className="hero-lab-note">{posNote}／{brNote}</p>
    </div>
  );
}
