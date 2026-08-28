"use client";

import { useMemo, useState } from "react";
import "./procedure-videos.css";

type Guide = {
  id: string;
  title: string;
  category: string;
  aliases: string[];
  duration: string;
  videoUrl?: string;
  steps: string[];
  checks: string[];
};

const guides: Guide[] = [
  {
    id: "vent-cap",
    title: "ベンドキャップ（外壁貫通）",
    category: "ダクト",
    aliases: ["ベントキャップ", "外壁フード", "防風板付ベントキャップ"],
    duration: "24秒",
    videoUrl: "/videos/bend-cap-installation.mp4",
    steps: [
      "ダクトを外壁へ貫通する",
      "穴埋めする（外壁面より1cm下げる）",
      "一次シールを施工する（耐火シールを使用）",
      "背面にバッカーを付け、ベンドキャップを取り付ける",
      "外周へ二次シールを施工する",
    ],
    checks: ["一次・二次シールが連続している", "外壁の防水層と納まりを確認", "完了写真を全景・近景で残す"],
  },
  {
    id: "machine-base",
    title: "機械基礎",
    category: "機器据付",
    aliases: ["機器基礎", "コンクリート基礎", "設備基礎"],
    duration: "動画準備中",
    steps: [
      "機械基礎の配筋",
      "型枠を組む",
      "アンカー位置の鉄筋をよける",
      "コンクリートを打設・養生する",
      "あと施工アンカーを施工する",
      "防水を復旧する",
    ],
    checks: ["基礎芯・天端・寸法を承認図と照合", "アンカーと鉄筋の干渉を施工前に確認", "防水復旧範囲を建築と確認"],
  },
];

export default function ProcedureVideos({ openDetailBook }: { openDetailBook: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [selectedId, setSelectedId] = useState(guides[0].id);
  const categories = ["すべて", ...Array.from(new Set(guides.map((x) => x.category)))];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((x) =>
      (category === "すべて" || x.category === category) &&
      (!q || [x.title, x.category, ...x.aliases, ...x.steps].join(" ").toLowerCase().includes(q)),
    );
  }, [query, category]);
  const selected = guides.find((x) => x.id === selectedId) || filtered[0] || guides[0];

  return (
    <div className="page procedureVideoPage">
      <header className="procedureVideoTitle">
        <span>WORK PROCEDURE VIDEOS</span>
        <h2>施工手順動画</h2>
        <p>現場の施工手順を、動画と工程ごとの確認事項で確認できます。</p>
      </header>

      <section className="procedureVideoSearch">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="工法・部材・俗称で検索　例：ベンドキャップ" />
        <div>{categories.map((x) => <button key={x} className={category === x ? "active" : ""} onClick={() => setCategory(x)}>{x}</button>)}</div>
      </section>

      <div className="procedureVideoLayout">
        <aside className="procedureVideoList">
          <b>{filtered.length}件の施工手順</b>
          {filtered.map((x) => (
            <button key={x.id} className={selected.id === x.id ? "active" : ""} onClick={() => setSelectedId(x.id)}>
              <i>▶</i><span><small>{x.category}</small><strong>{x.title}</strong><em>{x.duration}</em></span>
            </button>
          ))}
          {!filtered.length && <p>該当する施工手順はありません。</p>}
        </aside>

        <article className="procedureVideoDetail">
          <div className="procedurePlayer">
            {selected.videoUrl ? <video controls playsInline src={selected.videoUrl} /> : <div><i>▶</i><b>動画は準備中です</b><span>手順と確認事項は先に確認できます</span></div>}
          </div>
          <div className="procedureVideoHeading"><div><span>{selected.category}</span><h3>{selected.title}</h3><p>別名：{selected.aliases.join("・")}</p></div><em>{selected.duration}</em></div>
          <section className="procedureSteps"><h4>施工の流れ</h4>{selected.steps.map((x, i) => <div key={x}><i>{i + 1}</i><p>{x}</p></div>)}</section>
          <section className="procedureChecks"><h4>施工前・完了時の確認</h4><ul>{selected.checks.map((x) => <li key={x}>{x}</li>)}</ul></section>
          <button className="procedureDetailButton" onClick={openDetailBook}>施工要領図集で詳しく確認</button>
          <p className="procedureNote">実施工は設計図書、特記仕様、採用製品の施工要領、監理者・メーカーの指示を優先してください。</p>
        </article>
      </div>
    </div>
  );
}
