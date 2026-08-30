"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import "./work-assist.css";

type WorkTab = "reverse" | "drawing" | "notes" | "qa" | "learning";
type ReverseItem = { id:string; title:string; days:number; owner:string; reason:string; priority:"高"|"中"|"低" };
type ReverseTemplate = { id:string; name:string; description:string; items:ReverseItem[] };
type FieldNote = { id:string; title:string; category:string; body:string; tags:string; favorite:boolean; createdAt:string };
type RoutePlan = { system:string; start:string; goal:string; through:string; avoid:string; priority:string; equipment:string; notes:string };

type Quiz = { q:string; options:string[]; answer:number; why:string };

const templates:ReverseTemplate[] = [
  {id:"fixture",name:"衛生器具据付",description:"床・壁仕上げ、給排水位置、器具納期を据付日から逆算",items:[
    {id:"fixture-delivery",title:"器具・水栓・付属品の納期最終確認",days:21,owner:"設備・納入業者",reason:"欠品・納期遅延を据付直前に発覚させない",priority:"高"},
    {id:"fixture-detail",title:"建築との納まり・器具位置最終確認",days:18,owner:"設備・建築",reason:"壁厚・仕上げ・器具芯・点検性を確定",priority:"高"},
    {id:"fixture-rough",title:"給排水立上げ位置・高さ確認",days:14,owner:"設備",reason:"仕上げ後の斫り・やり直しを防止",priority:"高"},
    {id:"fixture-center",title:"器具位置・芯・取付高さ確認",days:12,owner:"設備・建築",reason:"墨・仕上げ・承認図との差異を先に解消",priority:"高"},
    {id:"fixture-floor-date",title:"床仕上げ業者との施工日確定",days:10,owner:"建築・床業者",reason:"設備据付日までの養生・乾燥期間を確保",priority:"高"},
    {id:"fixture-finish",title:"床・壁仕上げ完了確認",days:3,owner:"建築",reason:"据付開始条件を満たしているか最終確認",priority:"高"},
  ]},
  {id:"delivery",name:"機器搬入",description:"搬入経路・開口・揚重・基礎・電源を搬入日から逆算",items:[
    {id:"del-approved",title:"機器承認図・外形寸法・重量確定",days:35,owner:"設備・メーカー",reason:"搬入条件と基礎条件の前提を確定",priority:"高"},
    {id:"del-route",title:"搬入経路・旋回・開口寸法確認",days:28,owner:"設備・建築",reason:"通らない・曲がれないを事前に潰す",priority:"高"},
    {id:"del-lift",title:"揚重方法・重機・作業区画調整",days:21,owner:"設備・揚重業者",reason:"重機手配と他工種調整の余裕を確保",priority:"高"},
    {id:"del-base",title:"基礎・アンカー・防振条件確認",days:14,owner:"設備・建築",reason:"搬入後すぐ据付できる状態にする",priority:"高"},
    {id:"del-opening",title:"搬入口・仮設開口の施工完了確認",days:7,owner:"建築",reason:"当日の搬入停止を防止",priority:"高"},
    {id:"del-final",title:"搬入前最終打合せ・KY項目確定",days:2,owner:"関係者",reason:"人員・時間・導線・安全条件を最終共有",priority:"中"},
  ]},
  {id:"ceiling",name:"天井施工",description:"天井閉塞前に配管・ダクト・検査・点検性を確認",items:[
    {id:"ceil-route",title:"天井内ルート・高さ・他設備干渉確定",days:21,owner:"設備・電気",reason:"閉塞直前のルート変更を防ぐ",priority:"高"},
    {id:"ceil-support",title:"吊り・支持・振れ止め施工確認",days:14,owner:"設備",reason:"天井閉塞後に施工困難な項目を先に完了",priority:"高"},
    {id:"ceil-test",title:"必要な圧力試験・通水・漏れ確認",days:10,owner:"設備",reason:"隠ぺい前に品質確認を完了",priority:"高"},
    {id:"ceil-access",title:"点検口位置・バルブ・ダンパー操作性確認",days:7,owner:"設備・建築",reason:"保守できない納まりを防止",priority:"高"},
    {id:"ceil-photo",title:"隠ぺい前写真・検査記録完了",days:3,owner:"設備",reason:"完成後に見えない部分の記録を残す",priority:"中"},
  ]},
  {id:"piping",name:"配管開始",description:"施工開始に必要な図面・スリーブ・材料・作業区画を先行確認",items:[
    {id:"pipe-drawing",title:"施工図・ルート・レベル確定",days:21,owner:"設備",reason:"職人が迷わず施工できる状態にする",priority:"高"},
    {id:"pipe-sleeve",title:"スリーブ・インサート・開口位置確認",days:14,owner:"設備・建築",reason:"躯体工程を逃さない",priority:"高"},
    {id:"pipe-clash",title:"他設備との干渉・優先順位確認",days:10,owner:"設備・電気",reason:"現場でのその場調整を減らす",priority:"高"},
    {id:"pipe-material",title:"材料・継手・支持材納入確認",days:7,owner:"設備・材料業者",reason:"施工開始時の材料待ちを防止",priority:"高"},
    {id:"pipe-zone",title:"作業区画・足場・高所作業条件確認",days:3,owner:"設備・建築",reason:"当日の作業停止を防ぐ",priority:"中"},
  ]},
  {id:"commission",name:"試運転",description:"電源・制御・配管・清掃・検査条件を試運転日から逆算",items:[
    {id:"com-power",title:"電源受電・盤・絶縁確認日確定",days:21,owner:"電気",reason:"試運転に必要な電源条件を先に固定",priority:"高"},
    {id:"com-control",title:"自動制御・中央監視との連動確認",days:14,owner:"設備・自動制御",reason:"単体運転だけで終わらせない",priority:"高"},
    {id:"com-water",title:"給排水・ドレン・エア抜き条件確認",days:10,owner:"設備",reason:"運転開始時の漏水・空運転を防止",priority:"高"},
    {id:"com-clean",title:"フラッシング・清掃・ストレーナ確認",days:7,owner:"設備",reason:"異物による機器トラブルを防止",priority:"高"},
    {id:"com-check",title:"試運転要領・立会者・測定項目確定",days:3,owner:"関係者",reason:"当日に確認項目が増えるのを防ぐ",priority:"中"},
  ]},
];

const quizzes:Quiz[] = [
  {q:"屋内横走り排水管で最初に確認すべきことは？",options:["色だけ","連続した下り勾配と逆勾配の有無","職人の人数","配管のメーカーだけ"],answer:1,why:"排水は逆勾配・たるみ・段差が重大な不具合につながるため、まず連続勾配を確認します。"},
  {q:"天井を閉じる前の設備確認で優先度が高いものは？",options:["仕上げ色","圧力試験・通水・隠ぺい部写真","作業服の色","昼食場所"],answer:1,why:"閉塞後に確認・修正しづらい品質項目を先に完了させます。"},
  {q:"機器搬入日の前倒し調整で最初に固定したい情報は？",options:["機器の外形寸法と重量","現場のBGM","名札","休憩時間"],answer:0,why:"外形・重量が搬入経路、開口、揚重、基礎の前提になるためです。"},
  {q:"区画貫通工法の採用で最終的に優先するものは？",options:["似た現場の写真","認定書と実際の壁床・管種・径・保温条件の一致","価格だけ","施工者の勘"],answer:1,why:"認定条件との一致確認が必要で、似ているだけでは採用できません。"},
  {q:"先行調整の目的として最も近いものは？",options:["TODOを増やす","問題が起きてから早く動く","必要条件を前倒しで確定し、その場対応を減らす","会議を増やす"],answer:2,why:"基準日から必要条件と期限を逆算して、突発対応そのものを減らすのが目的です。"},
];

function isoDateMinus(base:string, days:number){
  if(!base) return "";
  const d=new Date(`${base}T12:00:00`); d.setDate(d.getDate()-days);
  return d.toISOString().slice(0,10);
}
function fmt(d:string){ return d ? d.replaceAll("-","/") : "日付未設定"; }

export default function WorkAssistPage(){
  const [tab,setTab]=useState<WorkTab>("reverse");
  const [templateId,setTemplateId]=useState("fixture");
  const [targetDate,setTargetDate]=useState("");
  const [selected,setSelected]=useState<string[]>([]);
  const [todoMessage,setTodoMessage]=useState("");
  const [notes,setNotes]=useState<FieldNote[]>([]);
  const [noteForm,setNoteForm]=useState({title:"",category:"施工",body:"",tags:""});
  const [noteQuery,setNoteQuery]=useState("");
  const [route,setRoute]=useState<RoutePlan>({system:"給水",start:"",goal:"",through:"",avoid:"",priority:"高い順：冷媒・ダクト・衛生配管",equipment:"",notes:""});
  const [qa,setQa]=useState("");
  const [quizIndex,setQuizIndex]=useState(0);
  const [quizChoice,setQuizChoice]=useState<number|null>(null);
  const [score,setScore]=useState(0);

  const template=useMemo(()=>templates.find(x=>x.id===templateId)??templates[0],[templateId]);
  const reverseRows=useMemo(()=>template.items.map(x=>({...x,due:isoDateMinus(targetDate,x.days)})),[template,targetDate]);
  const filteredNotes=useMemo(()=>notes.filter(n=>`${n.title} ${n.category} ${n.body} ${n.tags}`.toLowerCase().includes(noteQuery.toLowerCase())),[notes,noteQuery]);
  const routeSummary=useMemo(()=>{
    const lines=[
      `【${route.system} ルート検討】`,
      `START：${route.start||"未設定"}`,
      `GOAL：${route.goal||"未設定"}`,
      `通してよい範囲：${route.through||"未設定"}`,
      `通してはいけない範囲：${route.avoid||"未設定"}`,
      `設備優先順位：${route.priority||"未設定"}`,
      `対象機器：${route.equipment||"未設定"}`,
      `追加条件：${route.notes||"なし"}`,
      "",
      "検討順序：①スタート・ゴールを固定 → ②禁止範囲を避ける → ③メインルートを最短で仮置き → ④分岐を機器番号ごとに追加 → ⑤他設備との高さ競合を確認 → ⑥支持・勾配・点検スペースを確認 → ⑦総合図と設備別図へ分けて仕上げる",
    ];
    return lines.join("\n");
  },[route]);

  useEffect(()=>{
    try{ const raw=localStorage.getItem("setsubi-field-notes-v1"); if(raw) setNotes(JSON.parse(raw)); }catch{}
  },[]);
  useEffect(()=>{ if(notes.length || localStorage.getItem("setsubi-field-notes-v1")) localStorage.setItem("setsubi-field-notes-v1",JSON.stringify(notes)); },[notes]);
  useEffect(()=>{ setSelected(template.items.map(x=>x.id)); },[templateId]);

  async function addSelectedToTodo(){
    if(!targetDate){ setTodoMessage("基準日を入力してください"); return; }
    const rows=reverseRows.filter(x=>selected.includes(x.id));
    if(!rows.length){ setTodoMessage("TODOへ入れる項目を選択してください"); return; }
    setTodoMessage("TODOへ登録中…");
    let ok=0;
    for(const row of rows){
      try{
        const res=await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:`【先行調整】${row.title}`,location:"",assignee:row.owner,dueDate:row.due,priority:row.priority,progress:"前",status:"未着手"})});
        if(res.ok) ok++;
      }catch{}
    }
    setTodoMessage(ok===rows.length?`${ok}件をTODOへ登録しました`:`${ok}/${rows.length}件を登録しました。未登録分は再度お試しください`);
  }

  function saveNote(e:FormEvent){
    e.preventDefault(); if(!noteForm.title.trim()||!noteForm.body.trim()) return;
    setNotes(prev=>[{id:crypto.randomUUID(),title:noteForm.title.trim(),category:noteForm.category,body:noteForm.body.trim(),tags:noteForm.tags.trim(),favorite:false,createdAt:new Date().toISOString()},...prev]);
    setNoteForm({title:"",category:"施工",body:"",tags:""});
  }

  function answerQuiz(i:number){
    if(quizChoice!==null) return;
    setQuizChoice(i); if(i===quizzes[quizIndex].answer) setScore(s=>s+1);
  }
  function nextQuiz(){ setQuizChoice(null); setQuizIndex(i=>(i+1)%quizzes.length); }

  return <main className="waShell">
    <header className="waHeader">
      <div><a href="/">← 設備管理マネージャー</a><span>FIELD WORK ASSIST</span><h1>先行検討・現場支援センター</h1><p>その場対応を減らすために、先行調整・図面検討・施工メモ・AI質問・資格学習を1か所にまとめました。</p></div>
      <div className="waPurpose"><b>目的</b><strong>問題発生後の対応から<br/>問題発生前の調整へ</strong></div>
    </header>

    <nav className="waTabs">
      <button className={tab==="reverse"?"active":""} onClick={()=>setTab("reverse")}>先行調整ナビ</button>
      <button className={tab==="drawing"?"active":""} onClick={()=>setTab("drawing")}>図面支援</button>
      <button className={tab==="notes"?"active":""} onClick={()=>setTab("notes")}>施工メモ</button>
      <button className={tab==="qa"?"active":""} onClick={()=>setTab("qa")}>AI質問連携</button>
      <button className={tab==="learning"?"active":""} onClick={()=>setTab("learning")}>1級管工事学習</button>
    </nav>

    {tab==="reverse"&&<section className="waPage">
      <div className="waTitle"><span>REVERSE SCHEDULING</span><h2>施工日から必要な調整期限を逆算</h2><p>「いつ施工するか」だけでなく、「その日までに何が決まっていなければならないか」を展開します。</p></div>
      <div className="waReverseControls">
        <label>基準イベント<select value={templateId} onChange={e=>setTemplateId(e.target.value)}>{templates.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label>施工・実施予定日<input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)}/></label>
      </div>
      <div className="waTemplateDesc"><b>{template.name}</b><span>{template.description}</span></div>
      <div className="waReverseList">{reverseRows.map(row=><article key={row.id} className={!selected.includes(row.id)?"off":""}>
        <label className="waCheck"><input type="checkbox" checked={selected.includes(row.id)} onChange={()=>setSelected(s=>s.includes(row.id)?s.filter(id=>id!==row.id):[...s,row.id])}/><i/></label>
        <div className="waDue"><small>{row.days}日前</small><strong>{fmt(row.due)}</strong></div>
        <div className="waTaskBody"><b>{row.title}</b><p>{row.reason}</p><span>担当目安：{row.owner}</span></div>
        <em className={`p${row.priority}`}>{row.priority}</em>
      </article>)}</div>
      <div className="waTodoBar"><div><b>{selected.length}件を選択</b><span>既存TODOへ「先行調整」として追加します</span></div><button onClick={addSelectedToTodo}>選択項目をTODOへ登録</button></div>
      {todoMessage&&<p className="waMessage">{todoMessage}</p>}
      <p className="waCaution">逆算日数は初期目安です。実際の現場工程・承認フロー・納期・建築工程に合わせて前倒ししてください。</p>
    </section>}

    {tab==="drawing"&&<section className="waPage">
      <div className="waTitle"><span>DRAWING ASSIST</span><h2>配管・ダクトのルート検討条件を先に固定</h2><p>AIや人に図面を渡す前に、スタート・ゴール・禁止範囲・優先順位を整理するための入力シートです。</p></div>
      <div className="waDrawingGrid">
        <div className="waFormCard">
          <label>系統<select value={route.system} onChange={e=>setRoute({...route,system:e.target.value})}><option>給水</option><option>排水</option><option>通気</option><option>冷媒</option><option>空調ドレン</option><option>ダクト</option><option>消火</option><option>蒸気</option><option>その他</option></select></label>
          <label>スタート<input value={route.start} onChange={e=>setRoute({...route,start:e.target.value})} placeholder="例：1F DPS-A"/></label>
          <label>ゴール<input value={route.goal} onChange={e=>setRoute({...route,goal:e.target.value})} placeholder="例：MPAC20-01～08"/></label>
          <label>通してよい範囲<textarea value={route.through} onChange={e=>setRoute({...route,through:e.target.value})} placeholder="廊下天井内、機械室上部など"/></label>
          <label>通してはいけない範囲<textarea value={route.avoid} onChange={e=>setRoute({...route,avoid:e.target.value})} placeholder="梁貫通不可、点検口前、電気盤上部など"/></label>
          <label>高さ・設備優先順位<input value={route.priority} onChange={e=>setRoute({...route,priority:e.target.value})}/></label>
          <label>対象機器番号<textarea value={route.equipment} onChange={e=>setRoute({...route,equipment:e.target.value})} placeholder="例：MPAC20-01,02,03…"/></label>
          <label>追加条件<textarea value={route.notes} onChange={e=>setRoute({...route,notes:e.target.value})} placeholder="勾配、管径、支持、将来点検スペース等"/></label>
        </div>
        <div className="waPlanCard"><small>AI／施工図担当へ渡す検討条件</small><pre>{routeSummary}</pre><button onClick={()=>navigator.clipboard?.writeText(routeSummary)}>条件をコピー</button></div>
      </div>
      <div className="waFlow"><b>図面化の標準フロー</b><ol><li>総合図で大まかな高さ・主ルートを決める</li><li>設備種別ごとの図面へ分解する</li><li>機器番号ごとに分岐を接続する</li><li>勾配・支持・区画貫通・点検性をチェックする</li><li>最後に総合図へ戻して干渉を再確認する</li></ol></div>
    </section>}

    {tab==="notes"&&<section className="waPage">
      <div className="waTitle"><span>FIELD KNOWLEDGE</span><h2>施工ワンポイントメモ</h2><p>現場で気づいた注意点を、次の現場で再利用できる知識として残します。</p></div>
      <form className="waNoteForm" onSubmit={saveNote}>
        <label>タイトル<input value={noteForm.title} onChange={e=>setNoteForm({...noteForm,title:e.target.value})} placeholder="例：衛生器具据付前の床仕上げ確認"/></label>
        <label>分類<select value={noteForm.category} onChange={e=>setNoteForm({...noteForm,category:e.target.value})}><option>施工</option><option>工程</option><option>納まり</option><option>品質</option><option>安全</option><option>材料</option><option>試運転</option><option>失敗・改善</option></select></label>
        <label className="wide">メモ<textarea value={noteForm.body} onChange={e=>setNoteForm({...noteForm,body:e.target.value})} placeholder="何が起きたか／次回どうするか／確認相手／確認時期まで書く"/></label>
        <label className="wide">タグ<input value={noteForm.tags} onChange={e=>setNoteForm({...noteForm,tags:e.target.value})} placeholder="例：衛生,床仕上げ,先行調整"/></label>
        <button type="submit">メモを保存</button>
      </form>
      <div className="waSearch"><input value={noteQuery} onChange={e=>setNoteQuery(e.target.value)} placeholder="メモを検索"/><span>{filteredNotes.length}件</span></div>
      <div className="waNotes">{filteredNotes.map(n=><article key={n.id}><header><span>{n.category}</span><button onClick={()=>setNotes(list=>list.map(x=>x.id===n.id?{...x,favorite:!x.favorite}:x))}>{n.favorite?"★":"☆"}</button></header><h3>{n.title}</h3><p>{n.body}</p><small>{n.tags||"タグなし"} ・ {new Date(n.createdAt).toLocaleDateString("ja-JP")}</small><button className="delete" onClick={()=>setNotes(list=>list.filter(x=>x.id!==n.id))}>削除</button></article>)}</div>
      {!filteredNotes.length&&<div className="waEmpty">まだ施工メモがありません。</div>}
    </section>}

    {tab==="qa"&&<section className="waPage">
      <div className="waTitle"><span>AI QUESTION WORKFLOW</span><h2>設備AI質問を「確認行動」までつなげる</h2><p>既存の設備AI質問を使う前に、条件を整理し、回答後に何を確認するかまで決めます。</p></div>
      <div className="waQaGrid">
        <div className="waQaCard"><b>① 質問を具体化</b><textarea value={qa} onChange={e=>setQa(e.target.value)} placeholder="例：100Aの屋内横走り排水管。VP、雑排水、天井内。勾配と施工時の注意点は？"/><a href="/?tab=equipmentAi">設備AI質問を開く →</a></div>
        <div className="waQaCard"><b>② 回答で必ず見るところ</b><ul><li>結論だけでなく適用条件</li><li>法令・標準仕様・メーカー資料のどれが根拠か</li><li>現場条件と一致しているか</li><li>数値の単位・基準点・対象管種</li><li>承認図・設計図書を優先すべき部分</li></ul></div>
        <div className="waQaCard"><b>③ 不明なら仕事を止めず「つなぐ」</b><ul><li>設計条件 → 設計担当へ</li><li>建築納まり → 建築担当へ</li><li>製品条件 → メーカーへ</li><li>施工可否 → 職長・施工要領へ</li><li>決定事項 → TODO／施工メモへ記録</li></ul></div>
      </div>
      {qa&&<div className="waQuestionReady"><small>質問テンプレート</small><p>{qa}</p><button onClick={()=>navigator.clipboard?.writeText(qa)}>質問文をコピー</button></div>}
    </section>}

    {tab==="learning"&&<section className="waPage">
      <div className="waTitle"><span>1級管工事施工管理技士</span><h2>現場知識と資格学習をつなぐ</h2><p>暗記だけでなく「現場なら何を先に確認するか」で覚えるミニ問題です。</p></div>
      <div className="waQuizStats"><span>問題 {quizIndex+1}/{quizzes.length}</span><b>正解 {score}</b></div>
      <article className="waQuiz"><h3>{quizzes[quizIndex].q}</h3><div>{quizzes[quizIndex].options.map((o,i)=><button key={o} disabled={quizChoice!==null} onClick={()=>answerQuiz(i)} className={quizChoice===null?"":i===quizzes[quizIndex].answer?"correct":i===quizChoice?"wrong":""}>{o}</button>)}</div>{quizChoice!==null&&<section><b>{quizChoice===quizzes[quizIndex].answer?"正解":"不正解"}</b><p>{quizzes[quizIndex].why}</p><button onClick={nextQuiz}>次の問題</button></section>}</article>
      <div className="waLearnCards"><article><b>工程</b><p>基準日から前提条件を逆算する。</p></article><article><b>品質</b><p>隠ぺい前・試運転前の確認を先に押さえる。</p></article><article><b>施工</b><p>勾配・支持・区画・点検性を「なぜ必要か」で覚える。</p></article></div>
    </section>}
  </main>;
}
