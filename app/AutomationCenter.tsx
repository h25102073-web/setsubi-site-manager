"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import "./automation-center.css";

type Schedule={id:number;name:string;location:string;startDate:string};
type ChecklistItem={id:string;label:string;done:boolean};
type SpeechRecognitionLike={lang:string;interimResults:boolean;continuous:boolean;onresult:((event:{results:ArrayLike<{0:{transcript:string}}>})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};

const DEFAULT_CHECKS=["最新図面・承認図を確認済み","前工程が完了している","スリーブ・インサート・墨出し完了","必要材料が納入済み","職人・必要人工を確保済み","高所作業車・工具・仮設材を確保済み","他業者との干渉・作業重複なし","検査・試験・写真の条件を確認済み"];

function isoOffset(base:string,days:number){if(!base)return "";const d=new Date(base+"T00:00:00");d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function extractLocation(text:string){const m=text.match(/((?:B?\\d+|地下\\d+|RF|屋上|地上)\\s*F?|\\d+階)[^、。\\s]{0,14}/i);return m?.[0]||""}

export default function AutomationCenter({onChanged}:{onChanged?:()=>void|Promise<void>}){
 const [checks,setChecks]=useState<ChecklistItem[]>(()=>DEFAULT_CHECKS.map((label,i)=>({id:String(i+1),label,done:false})));
 const [workName,setWorkName]=useState("");const [workLocation,setWorkLocation]=useState("");const [workDate,setWorkDate]=useState("");
 const [schedules,setSchedules]=useState<Schedule[]>([]);const [scheduleId,setScheduleId]=useState("");
 const [orderLead,setOrderLead]=useState(14);const [confirmLead,setConfirmLead]=useState(7);const [coordLead,setCoordLead]=useState(3);
 const [captureText,setCaptureText]=useState("");const [captureLocation,setCaptureLocation]=useState("");const [captureDue,setCaptureDue]=useState("");const [capturePriority,setCapturePriority]=useState("高");
 const [photoName,setPhotoName]=useState("");const [photoUrl,setPhotoUrl]=useState("");const [listening,setListening]=useState(false);const [message,setMessage]=useState("");
 const recognitionRef=useRef<SpeechRecognitionLike|null>(null);
 useEffect(()=>{fetch("/api/schedules").then(r=>r.ok?r.json():{schedules:[]}).then(d=>setSchedules(d.schedules??[])).catch(()=>setSchedules([]))},[]);
 useEffect(()=>()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)},[photoUrl]);
 const doneCount=checks.filter(x=>x.done).length;const missing=checks.filter(x=>!x.done);
 const readiness=doneCount===checks.length?"施工可能":doneCount>=Math.ceil(checks.length*.75)?"要確認":"施工不可";
 const selected=schedules.find(s=>String(s.id)===scheduleId);const targetDate=selected?.startDate||workDate;
 const deadlines=useMemo(()=>[
  {label:"材料・機器の発注期限",date:isoOffset(targetDate,-orderLead),kind:"発注"},
  {label:"図面・承認・仕様の確認期限",date:isoOffset(targetDate,-confirmLead),kind:"確認"},
  {label:"他業者・建築との最終調整期限",date:isoOffset(targetDate,-coordLead),kind:"調整"}
 ],[targetDate,orderLead,confirmLead,coordLead]);
 const flash=(s:string)=>{setMessage(s);window.setTimeout(()=>setMessage(""),2200)};
 async function createTask(title:string,location:string,dueDate:string,priority="高"){const res=await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title,location,assignee:"",dueDate,priority,progress:"前",status:"未着手"})});if(!res.ok)throw new Error("task");await onChanged?.()}
 async function createMissingTodos(){if(!missing.length){flash("未確認項目はありません");return}try{for(const item of missing)await createTask("【施工前確認】"+item.label,workLocation,workDate,"高");flash(String(missing.length)+"件をToDoに追加しました")}catch{flash("ToDo追加に失敗しました")}}
 async function createDeadlineTodos(){const name=selected?.name||workName||"施工予定";const location=selected?.location||workLocation;if(!targetDate){flash("施工予定日を入力してください");return}try{for(const x of deadlines)await createTask("【"+x.kind+"期限】"+name+"："+x.label,location,x.date,"高");flash("逆算期限3件をToDoに追加しました")}catch{flash("ToDo追加に失敗しました")}}
 function startVoice(){const w=window as unknown as {SpeechRecognition?:new()=>SpeechRecognitionLike;webkitSpeechRecognition?:new()=>SpeechRecognitionLike};const Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Ctor){flash("このブラウザは音声入力に対応していません");return}const rec=new Ctor();recognitionRef.current=rec;rec.lang="ja-JP";rec.interimResults=false;rec.continuous=false;rec.onresult=e=>{const text=Array.from(e.results).map(r=>r[0].transcript).join(" ");setCaptureText(v=>v?v+" "+text:text);if(!captureLocation){const loc=extractLocation(text);if(loc)setCaptureLocation(loc)}};rec.onerror=()=>{setListening(false);flash("音声入力を取得できませんでした")};rec.onend=()=>setListening(false);setListening(true);rec.start()}
 function stopVoice(){recognitionRef.current?.stop();setListening(false)}
 function pickPhoto(file:File|null){if(photoUrl)URL.revokeObjectURL(photoUrl);if(!file){setPhotoName("");setPhotoUrl("");return}setPhotoName(file.name);setPhotoUrl(URL.createObjectURL(file))}
 async function createCapturedTodo(){const title=captureText.trim();if(!title){flash("現場メモを入力してください");return}try{const photoSuffix=photoName?"（写真あり："+photoName+"）":"";await createTask("【現場指摘】"+title+photoSuffix,captureLocation,captureDue,capturePriority);setCaptureText("");setCaptureLocation("");setCaptureDue("");setPhotoName("");if(photoUrl)URL.revokeObjectURL(photoUrl);setPhotoUrl("");flash("現場メモからToDoを作成しました")}catch{flash("ToDo追加に失敗しました")}}
 return <div className="automationPage">
  <header className="automationHero"><span>SITE AUTOMATION</span><h2>現場自動化</h2><p>施工前確認・期限逆算・現場メモをToDoへ直結し、「考えてから登録」を減らします。</p></header>
  <section className="autoCard">
   <div className="autoHead"><div><span>01</span><h3>施工開始条件の自動判定</h3></div><b className={"readyBadge "+(readiness==="施工可能"?"ok":readiness==="要確認"?"warn":"ng")}>{readiness}</b></div>
   <div className="autoGrid two"><label>作業名<input value={workName} onChange={e=>setWorkName(e.target.value)} placeholder="例：6F 衛生器具据付"/></label><label>場所<input value={workLocation} onChange={e=>setWorkLocation(e.target.value)} placeholder="例：6F 男女便所"/></label></div>
   <label className="autoField">施工予定日<input type="date" value={workDate} onChange={e=>setWorkDate(e.target.value)}/></label>
   <div className="checkProgress"><b>{doneCount}/{checks.length} 完了</b><span><i style={{width:String(Math.round(doneCount/checks.length*100))+"%"}}/></span></div>
   <div className="readyChecks">{checks.map(x=><button key={x.id} className={x.done?"done":""} onClick={()=>setChecks(v=>v.map(y=>y.id===x.id?{...y,done:!y.done}:y))}><i>{x.done?"✓":""}</i><span>{x.label}</span></button>)}</div>
   <div className="autoResult"><strong>{readiness}</strong><p>{missing.length?"未確認 "+missing.length+"件："+missing.map(x=>x.label).join(" / "):"全条件を確認済みです。施工開始条件がそろっています。"}</p></div>
   <button className="primaryAuto" onClick={createMissingTodos}>未確認項目をToDo化</button>
  </section>
  <section className="autoCard">
   <div className="autoHead"><div><span>02</span><h3>工程から発注・確認期限を逆算</h3></div><b>自動逆算</b></div>
   <label className="autoField">登録済み工程<select value={scheduleId} onChange={e=>setScheduleId(e.target.value)}><option value="">手入力の施工予定日を使う</option>{schedules.map(s=><option key={s.id} value={s.id}>{(s.startDate||"日付未設定")+"｜"+s.name+"｜"+s.location}</option>)}</select></label>
   <div className="autoGrid three"><label>発注リード日数<input type="number" min="0" value={orderLead} onChange={e=>setOrderLead(Number(e.target.value))}/></label><label>図面確認リード日数<input type="number" min="0" value={confirmLead} onChange={e=>setConfirmLead(Number(e.target.value))}/></label><label>最終調整リード日数<input type="number" min="0" value={coordLead} onChange={e=>setCoordLead(Number(e.target.value))}/></label></div>
   <div className="deadlineList">{deadlines.map(x=><div key={x.kind}><span>{x.label}</span><b>{x.date||"施工予定日を設定"}</b></div>)}</div>
   <button className="primaryAuto" onClick={createDeadlineTodos}>3つの期限をToDo登録</button>
  </section>
  <section className="autoCard">
   <div className="autoHead"><div><span>03</span><h3>写真・音声から現場ToDo生成</h3></div><b>スマホ向け</b></div>
   <div className="captureActions"><button className={listening?"listening":""} onClick={listening?stopVoice:startVoice}>{listening?"■ 音声入力を停止":"● 音声でメモ"}</button><label className="photoButton">＋ 写真を選択<input type="file" accept="image/*" capture="environment" onChange={e=>pickPhoto(e.target.files?.[0]??null)}/></label></div>
   {photoUrl&&<figure className="photoPreview"><img src={photoUrl} alt="選択した現場写真"/><figcaption>{photoName}</figcaption></figure>}
   <label className="autoField">現場メモ<textarea value={captureText} onChange={e=>setCaptureText(e.target.value)} placeholder="例：3階PS 給水管の支持が不足。配管業者へ是正依頼"/></label>
   <div className="autoGrid three"><label>場所<input value={captureLocation} onChange={e=>setCaptureLocation(e.target.value)} placeholder="例：3階PS"/></label><label>期限<input type="date" value={captureDue} onChange={e=>setCaptureDue(e.target.value)}/></label><label>優先度<select value={capturePriority} onChange={e=>setCapturePriority(e.target.value)}><option>高</option><option>中</option><option>低</option></select></label></div>
   <button className="primaryAuto" onClick={createCapturedTodo}>現場ToDoを作成</button>
   <p className="autoNote">写真は内容確認用に表示し、ToDoには写真ファイル名を記録します。音声はブラウザの日本語音声入力を利用します。</p>
  </section>
  {message&&<div className="autoToast">{message}</div>}
 </div>
}
