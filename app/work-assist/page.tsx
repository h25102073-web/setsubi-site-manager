"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./work-assist.css";

type Tab="reverse"|"drawing"|"notes"|"qa"|"learning";
type Item={title:string;days:number;owner:string;priority:"高"|"中"|"低"};
type Template={name:string;items:Item[]};
const templates:Record<string,Template>={
 fixture:{name:"衛生器具据付",items:[{title:"器具・水栓・付属品の納期最終確認",days:21,owner:"設備・納入業者",priority:"高"},{title:"建築との納まり・器具位置最終確認",days:18,owner:"設備・建築",priority:"高"},{title:"給排水立上げ位置・高さ確認",days:14,owner:"設備",priority:"高"},{title:"器具位置・芯・取付高さ確認",days:12,owner:"設備・建築",priority:"高"},{title:"床仕上げ業者との施工日確定",days:10,owner:"建築・床業者",priority:"高"},{title:"床・壁仕上げ完了確認",days:3,owner:"建築",priority:"高"}]},
 delivery:{name:"機器搬入",items:[{title:"機器承認図・外形寸法・重量確定",days:35,owner:"設備・メーカー",priority:"高"},{title:"搬入経路・旋回・開口寸法確認",days:28,owner:"設備・建築",priority:"高"},{title:"揚重方法・重機・作業区画調整",days:21,owner:"設備・揚重業者",priority:"高"},{title:"基礎・アンカー・防振条件確認",days:14,owner:"設備・建築",priority:"高"},{title:"搬入前最終打合せ",days:2,owner:"関係者",priority:"中"}]},
 ceiling:{name:"天井施工",items:[{title:"天井内ルート・高さ・他設備干渉確定",days:21,owner:"設備・電気",priority:"高"},{title:"吊り・支持・振れ止め施工確認",days:14,owner:"設備",priority:"高"},{title:"圧力試験・通水・漏れ確認",days:10,owner:"設備",priority:"高"},{title:"点検口・操作性確認",days:7,owner:"設備・建築",priority:"高"},{title:"隠ぺい前写真・検査記録完了",days:3,owner:"設備",priority:"中"}]},
 piping:{name:"配管開始",items:[{title:"施工図・ルート・レベル確定",days:21,owner:"設備",priority:"高"},{title:"スリーブ・インサート・開口位置確認",days:14,owner:"設備・建築",priority:"高"},{title:"他設備との干渉・優先順位確認",days:10,owner:"設備・電気",priority:"高"},{title:"材料・継手・支持材納入確認",days:7,owner:"設備・材料業者",priority:"高"},{title:"作業区画・足場・高所条件確認",days:3,owner:"設備・建築",priority:"中"}]},
 commission:{name:"試運転",items:[{title:"電源受電・盤・絶縁確認日確定",days:21,owner:"電気",priority:"高"},{title:"自動制御・中央監視との連動確認",days:14,owner:"設備・自動制御",priority:"高"},{title:"給排水・ドレン・エア抜き条件確認",days:10,owner:"設備",priority:"高"},{title:"フラッシング・清掃・ストレーナ確認",days:7,owner:"設備",priority:"高"},{title:"試運転要領・立会者・測定項目確定",days:3,owner:"関係者",priority:"中"}]}
};
const quizzes=[
 {q:"天井を閉じる前に優先する確認は？",a:["仕上げ色","圧力試験・通水・隠ぺい写真","昼食場所"],correct:1},
 {q:"機器搬入で最初に固定したい情報は？",a:["外形寸法と重量","休憩時間","作業服"],correct:0},
 {q:"先行調整の目的は？",a:["会議を増やす","その場対応を減らす","TODOを増やす"],correct:1}
];
function minusDate(base:string,days:number){if(!base)return"";const d=new Date(`${base}T12:00:00`);d.setDate(d.getDate()-days);return d.toISOString().slice(0,10)}
export default function WorkAssistPage(){
 const[tab,setTab]=useState<Tab>("reverse");const[key,setKey]=useState("fixture");const[date,setDate]=useState("");const[msg,setMsg]=useState("");
 const[note,setNote]=useState({title:"",body:""});const[notes,setNotes]=useState<{title:string;body:string}[]>([]);
 const[route,setRoute]=useState({system:"給水",start:"",goal:"",through:"",avoid:"",priority:"冷媒→ダクト→衛生"});
 const[quiz,setQuiz]=useState(0);const[choice,setChoice]=useState<number|null>(null);
 const current=templates[key];const rows=useMemo(()=>current.items.map(i=>({...i,due:minusDate(date,i.days)})),[current,date]);
 const routeText=`【${route.system} ルート検討】\nSTART：${route.start||"未設定"}\nGOAL：${route.goal||"未設定"}\n通してよい範囲：${route.through||"未設定"}\n禁止範囲：${route.avoid||"未設定"}\n優先順位：${route.priority}`;
 async function addTodos(){if(!date){setMsg("施工予定日を入力してください");return}let ok=0;for(const r of rows){const res=await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:`【先行調整】${r.title}`,location:"",assignee:r.owner,dueDate:r.due,priority:r.priority,progress:"前",status:"未着手"})});if(res.ok)ok++}setMsg(`${ok}件をTODOへ登録しました`)}
 function saveNote(e:FormEvent){e.preventDefault();if(!note.title.trim()||!note.body.trim())return;setNotes(n=>[note,...n]);setNote({title:"",body:""})}
 return <main className="waShell"><header className="waHeader"><div><a href="/">← トップへ戻る</a><span>FIELD WORK ASSIST</span><h1>先行検討・現場支援センター</h1><p>その場対応を減らすための5機能をまとめています。</p></div></header>
 <nav className="waTabs">{([['reverse','先行調整ナビ'],['drawing','図面支援'],['notes','施工メモ'],['qa','AI質問連携'],['learning','1級管工事学習']] as [Tab,string][]).map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}</nav>
 {tab==="reverse"&&<section className="waPage"><div className="waTitle"><span>REVERSE SCHEDULING</span><h2>施工日から調整期限を逆算</h2></div><div className="waReverseControls"><label>基準イベント<select value={key} onChange={e=>setKey(e.target.value)}>{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></label><label>施工予定日<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div><div className="waReverseList">{rows.map((r,i)=><article key={r.title}><div className="waDue"><small>{r.days}日前</small><strong>{r.due||"日付未設定"}</strong></div><div className="waTaskBody"><b>{r.title}</b><span>担当目安：{r.owner}</span></div><em className={`p${r.priority}`}>{r.priority}</em></article>)}</div><div className="waTodoBar"><div><b>{rows.length}件を展開</b><span>既存TODOへ登録できます</span></div><button onClick={addTodos}>全部TODOへ登録</button></div>{msg&&<p className="waMessage">{msg}</p>}</section>}
 {tab==="drawing"&&<section className="waPage"><div className="waTitle"><span>DRAWING ASSIST</span><h2>図面検討条件を整理</h2></div><div className="waDrawingGrid"><div className="waFormCard"><label>系統<select value={route.system} onChange={e=>setRoute({...route,system:e.target.value})}><option>給水</option><option>排水</option><option>冷媒</option><option>空調ドレン</option><option>ダクト</option><option>消火</option></select></label><label>START<input value={route.start} onChange={e=>setRoute({...route,start:e.target.value})}/></label><label>GOAL<input value={route.goal} onChange={e=>setRoute({...route,goal:e.target.value})}/></label><label>通してよい範囲<textarea value={route.through} onChange={e=>setRoute({...route,through:e.target.value})}/></label><label>禁止範囲<textarea value={route.avoid} onChange={e=>setRoute({...route,avoid:e.target.value})}/></label><label>優先順位<input value={route.priority} onChange={e=>setRoute({...route,priority:e.target.value})}/></label></div><div className="waPlanCard"><small>図面担当・AIへ渡す条件</small><pre>{routeText}</pre><button onClick={()=>navigator.clipboard?.writeText(routeText)}>コピー</button></div></div></section>}
 {tab==="notes"&&<section className="waPage"><div className="waTitle"><span>FIELD KNOWLEDGE</span><h2>施工ワンポイントメモ</h2></div><form className="waNoteForm" onSubmit={saveNote}><label>タイトル<input value={note.title} onChange={e=>setNote({...note,title:e.target.value})}/></label><label className="wide">メモ<textarea value={note.body} onChange={e=>setNote({...note,body:e.target.value})}/></label><button type="submit">保存</button></form><div className="waNotes">{notes.map((n,i)=><article key={`${n.title}-${i}`}><h3>{n.title}</h3><p>{n.body}</p></article>)}</div></section>}
 {tab==="qa"&&<section className="waPage"><div className="waTitle"><span>AI QUESTION</span><h2>AI質問→確認行動へ</h2><p>条件を具体化し、回答後は設計図書・承認図・メーカー資料で一致を確認します。</p></div><div className="waQaGrid"><div className="waQaCard"><b>質問前</b><ul><li>管種・口径・用途</li><li>施工場所</li><li>知りたい数値・判断</li></ul></div><div className="waQaCard"><b>回答後</b><ul><li>適用条件を見る</li><li>根拠の種類を見る</li><li>現場条件と照合</li></ul></div><div className="waQaCard"><b>不明ならつなぐ</b><ul><li>設計→設計担当</li><li>製品→メーカー</li><li>施工→職長・施工要領</li></ul></div></div><a href="/" className="waMessage">トップの「設備AI質問」から質問する</a></section>}
 {tab==="learning"&&<section className="waPage"><div className="waTitle"><span>1級管工事施工管理技士</span><h2>現場型ミニ問題</h2></div><article className="waQuiz"><h3>{quizzes[quiz].q}</h3><div>{quizzes[quiz].a.map((x,i)=><button key={x} onClick={()=>setChoice(i)} className={choice===null?"":i===quizzes[quiz].correct?"correct":i===choice?"wrong":""}>{x}</button>)}</div>{choice!==null&&<section><b>{choice===quizzes[quiz].correct?"正解":"不正解"}</b><button onClick={()=>{setChoice(null);setQuiz(q=>(q+1)%quizzes.length)}}>次の問題</button></section>}</article></section>}
 </main>;
}
