"use client";
import { useEffect, useMemo, useState } from "react";
import { comprehensiveGlossaryItems } from "./glossary-comprehensive";
import CalculatorHub from "./CalculatorHub";
import MeetingMinutesAi from "./MeetingMinutesAi";
import InstallationDetailBook from "./InstallationDetailBook";
import ProcedureVideos from "./ProcedureVideos";
import ReleaseCenter from "./ReleaseCenter";
import BillingUpgradeButton from "./BillingUpgradeButton";
import "./todo-edit.css";
import "./process-thinking.css";
import "./release-center.css";
type Task = {
  id: number;
  title: string;
  location: string;
  assignee: string;
  dueDate: string;
  priority: string;
  progress: string;
  status: string;
};
type Schedule = {
  id: number;
  name: string;
  location: string;
  unit: string;
  quantity: number;
  laborRate: number;
  factor: number;
  crew: number;
  utilization: number;
  startDate: string;
  actualQuantity: number;
  scope: string;
  scopeDetail: string;
};
type ScheduleWorkType = "配管" | "角ダクト" | "丸ダクト" | "その他";
type Material = {
  id: number;
  name: string;
  pipeType: string;
  size: string;
  quantity: number;
  unit: string;
  vendor: string;
  status: string;
  neededDate: string;
  note: string;
};
type SiteDocument={id:number;name:string;category:string;fileName:string;fileSize:number;pageCount:number;status:string;sharing:string;preview:string;textLength:number;createdAt:string};
type Penetration = {
  id: number;
  penetrationNo: string;
  floor: string;
  location: string;
  compartmentType: string;
  penetratingItem: string;
  pipeType: string;
  size: string;
  openingSize: string;
  method: string;
  approvalNo: string;
  constructionDate: string;
  inspectionDate: string;
  photoNo: string;
  status: string;
  note: string;
};
type Tab = "home" | "todo" | "schedule" | "materials" | "penetrations" | "coordination" | "meetings" | "support" | "glossary" | "documents" | "equipmentGuide" | "constructionRules" | "equipmentAi" | "calculators" | "meetingMinutes" | "detailBook" | "procedureVideos" | "releaseCenter" | "more";
type Modal = "task" | "schedule" | "material" | "penetration" | null;
const tools = [
  "設備AI質問",
  "設備計算ツール",
  "AI議事録",
  "設備施工要領図集",
  "施工手順動画",
  "必須打合せ資料",
  "建築取り合い",
  "重量・架台選定",
  "工事用語辞典",
  "発注・納期",
  "試験・検査",
  "写真管理",
  "区画貫通",
  "機器台帳",
  "設備機器の仕組み",
  "施工ルール",
  "施工計画書・資料",
  "現場設定・品質管理",
  "揚重・搬入",
  "質疑・指摘",
  "日報・出来高",
];
type ConstructionRule={category:string;title:string;value:string;basis:"法令・基準"|"標準仕様"|"メーカー基準"|"一般目安"|"承認図優先";points:string[];confirm:string;source:string;sourceUrl:string};
type KnowledgeReport={id:number;subject:string;category:string;reportType:string;detail:string;sourceUrl:string;status:string;resolution:string;createdAt:string;updatedAt:string};
type AiEvidence={kind:string;title:string;summary:string;source:string;url?:string;priority:number};
type AiTableRow={size:string;percent:string;ratio:string;basis:string};
type AiAnswer={question:string;category:string;conclusion:string;reason:string;checks:string[];evidence:AiEvidence[];confidence:"高"|"中"|"低";table?:AiTableRow[];tableNote?:string};
type OfficialSearchResult={title:string;snippet:string;url:string;source:string;kind:string};
type OfficialAnswerOverride={matchAll:string[];matchAny?:string[];conclusion:string;checks:string[];evidence:AiEvidence[];table?:AiTableRow[];tableNote?:string};
const officialAnswerOverrides:OfficialAnswerOverride[]=[
 {matchAll:["受水槽"],matchAny:["メンテナンス","点検寸法","点検スペース","離隔","周囲寸法"],conclusion:"受水槽の有効メンテナンス寸法は、一般的な計画値として上部1,000mm以上、側面・底面600mm以上を確保します。ただし、マンホールの開閉・出入り、パネル交換、弁操作、清掃作業にこれ以上の空間が必要な場合は、メーカー承認図の必要寸法を優先します。梁・配管・ダクト・盤をこの有効空間へ入れないようにしてください。",checks:["上部：水槽天端から梁・天井・配管等まで有効1,000mm以上","側面：壁・柱・他設備まで有効600mm以上","底面：水槽底面から基礎・床等まで有効600mm以上","マンホール蓋を全開でき、作業員が安全に出入りできるか確認","ボールタップ・電極・定水位弁・パネルを交換できる搬出方向を確保","所管水道事業者の基準と採用メーカー承認図が厳しい場合はそちらを優先"],evidence:[{kind:"メーカー公式",title:"水槽まわりの点検スペース",summary:"角型受水槽は六面を容易に点検できるよう、天井面100cm、壁面・底面60cm以上の空間を確保するメーカー公式説明。",source:"積水アクアシステム",url:"https://www.sekisuia.co.jp/qa/2447/",priority:2},{kind:"自治体基準",title:"受水槽方式の場合の取扱基準",summary:"受水槽の天井・底・周壁を容易に保守点検できるよう、周囲に少なくとも60cm以上の空間を求める自治体公式基準。",source:"大東市",url:"https://www.city.daito.lg.jp/reiki_int/reiki_honbun/k220RG00000743.html",priority:1}]},
 {matchAll:["排水","勾配"],matchAny:["上限","最大","急"],conclusion:"硬質塩ビ製の重力式埋設排水管では、勾配上限は管径ごとに異なります。下表は粗度係数n=0.010、上限流速1.5m/sを条件に、マニング式から算出した計画上限です。実施工では自治体の排水設備基準、設計図書、管種・実流量を優先し、上限を超える高低差は落差ます等で処理します。",checks:["管種がVP・VU等の硬質塩ビ管か確認。材質が違えば粗度係数を変更","汚水・雑排水・雨水の区分と設計流量を確認","所管自治体が定める許容流速（例0.6～1.5m/s）を確認","急勾配区間は落差ます・段差ますで分割し、ます流入部を保護","最小勾配表と上限勾配表を混同せず、施工後に管底高を実測"],table:[{size:"65A",percent:"5.4%以下",ratio:"約1/19以下",basis:"v≦1.5m/s"},{size:"75A",percent:"4.5%以下",ratio:"約1/23以下",basis:"v≦1.5m/s"},{size:"100A",percent:"3.0%以下",ratio:"約1/33以下",basis:"v≦1.5m/s"},{size:"125A",percent:"2.2%以下",ratio:"約1/46以下",basis:"v≦1.5m/s"},{size:"150A",percent:"1.7%以下",ratio:"約1/59以下",basis:"v≦1.5m/s"},{size:"200A",percent:"1.2%以下",ratio:"約1/83以下",basis:"v≦1.5m/s"},{size:"250A",percent:"0.9%以下",ratio:"約1/111以下",basis:"v≦1.5m/s"},{size:"300A",percent:"0.7%以下",ratio:"約1/142以下",basis:"v≦1.5m/s"}],tableNote:"計算条件：硬質塩ビ管相当 n=0.010、円管満流、上限流速1.5m/s。材質・充満率・自治体基準により値は変わります。",evidence:[{kind:"業界規準",title:"SHASE-S 206-2019 給排水衛生設備規準・同解説",summary:"排水通気設備の設計基準。上限流速を用いて、管径ごとの上限勾配をマニング式で算定する根拠規準。",source:"空気調和・衛生工学会",url:"https://www.shasej.org/award/koseki.html",priority:2},{kind:"自治体基準",title:"排水管の勾配及び流速",summary:"管渠内流速を原則0.6～1.5m/sに収め、管径と勾配を定める自治体公式基準の例。",source:"柳川市 排水設備技術基準",url:"https://www.city.yanagawa.fukuoka.jp/reiki_int/reiki_honbun/r203RG00001427.html",priority:1}]},
 {matchAll:["還水"],matchAny:["保温"],conclusion:"還水槽は、槽内温度・設置環境・火傷防止条件に適合する保温仕様を採用します。メーカー保温型の例では、タンク本体の外側に耐熱性のある発泡ポリスチレンを設け、アルミ製保温カバーで覆う三層構造です。保温厚は一律ではなく、30・50・100mm等から設計条件と採用タンクの承認図で決定します。",checks:["最高還水温度が保温材の連続使用温度以下か確認","必要保温厚を設計図書・熱損失条件・設置場所から決定","マンホール、液面計、ノズル、点検口を保温で塞がない","高温表面の火傷防止、結露・腐食、屋外防水を確認","現場巻きの場合は保温材・外装・継ぎ目の施工要領を承認"],evidence:[{kind:"メーカー公式",title:"ステンレスパネルタンク（保温仕様）",summary:"発泡ポリスチレンを用いた三層構造で、30・50・100mmの保温厚を用意。還水槽にも使用可能とするメーカー公式仕様。",source:"森松工業",url:"https://www.morimatsu.jp/construction/stainless/thermal-tank.html",priority:3},{kind:"メーカー公式",title:"ステンレスパネルタンクの保温",summary:"放熱・結露・火傷防止の目的と、高温の還水槽・ドレン回収タンクへの保温の必要性を説明するメーカー公式情報。",source:"ベルテクノ",url:"https://beltecno.co.jp/product/architect/panel-tank/",priority:3}]} 
];
const constructionRules:ConstructionRule[]=[
 {category:"排水・通気",title:"屋内横走り排水管の最小勾配",value:"65A以下 1/50、75・100A 1/100、125A 1/150、150A以上 1/200",basis:"標準仕様",points:["上流から下流へ連続した下り勾配を確保","逆勾配・たるみ・段差を作らない","継手、掃除口、合流部を含め施工後に実測"],confirm:"設計図書、自治体排水設備基準、採用排水システムの要領",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"空調ドレン",title:"空調ドレン管の勾配・トラップ",value:"原則1/100以上を計画目安。機器指定を優先",basis:"一般目安",points:["負圧機器は機内静圧に合う封水深を確保","二重トラップ、逆勾配、途中の山越えを避ける","天井閉塞前に通水し、満水・排水・結露を確認"],confirm:"機器承認図、メーカー施工要領、設計図書",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"蒸気・還水",title:"蒸気・還水配管の勾配",value:"蒸気主管は流れ方向へ下りを基本。数値は設計・施工要領優先",basis:"承認図優先",points:["低部・立下り前・主管末端にドリップレッグを検討","固定点、ガイド、ローラー、伸縮継手を配管応力計画で決定","ウォーターハンマを避け、暖管時に凝縮水を排出"],confirm:"設計系統図、蒸気圧力、管径、メーカー資料",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"給水・給湯",title:"給水・給湯管の施工",value:"空気・水が抜ける配管経路。必要箇所に水抜き・空気抜き",basis:"標準仕様",points:["異種金属接触、結露、凍結、ウォーターハンマを防止","弁・ストレーナ・逆止弁は流れ方向と点検空間を確保","給湯は熱伸縮、固定点、ガイド、保温外装を考慮"],confirm:"水道事業者基準、設計図書、使用圧力・温度",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"消防設備",title:"屋内消火栓箱・開閉弁",value:"開閉弁の操作部：床面から1.5m以下",basis:"法令・基準",points:["箱扉の全開と放水操作に支障のない前面空間を確保","取付けを堅固にし、表示灯を見通せる位置に設置","仕上げ面、巾木、壁下地、他設備との干渉を事前確認"],confirm:"所轄消防、設計図、認定品承認図。箱本体中心高さではなく開閉弁操作部で確認",source:"消防庁 消防用設備等の試験基準",sourceUrl:"https://www.fdma.go.jp/laws/tutatsu/items/tuchi2507/pdf/siken-kijun.pdf"},
 {category:"消防設備",title:"消火器・消火器ボックス",value:"歩行・避難を妨げず、容易に持ち出せる位置",basis:"法令・基準",points:["標識の視認性を確保","扉・家具・什器で隠れない位置","埋込箱は壁厚・補強・防火区画を建築と調整"],confirm:"消防法令、所轄消防、設計図、製品承認図",source:"総務省消防庁",sourceUrl:"https://www.fdma.go.jp/laws/"},
 {category:"衛生器具",title:"大便器・小便器・洗面器",value:"器具芯・給排水芯・取付高さは承認図と建築仕上げ基準で決定",basis:"承認図優先",points:["FL基準とタイル・壁仕上げ厚を反映して墨出し","壁掛器具・手すりは下地補強と固定強度を確認","取付後にがたつき、通水、洗浄、漏水、封水を確認"],confirm:"器具承認図、意匠図、バリアフリー条例、使用者条件",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"衛生器具",title:"バリアフリー便所の器具配置",value:"一律寸法にせず、建築・条例・採用器具図で確認",basis:"法令・基準",points:["車椅子回転・移乗・介助空間を確保","手すり、紙巻器、呼出し、洗浄ボタンを使用者側へ配置","扉軌跡と器具・手すりを干渉させない"],confirm:"建築物移動等円滑化基準、自治体条例、設計図",source:"国土交通省 バリアフリー関係",sourceUrl:"https://www.mlit.go.jp/sogoseisaku/barrierfree/"},
 {category:"ポンプ・機器",title:"ポンプ据付・吸込配管",value:"水平基礎・芯出し・吸込側の空気溜まり防止",basis:"標準仕様",points:["偏心レジューサは空気溜まりを避ける向き","配管荷重をノズルへ掛けず接続後に再芯出し","呼水・エア抜き後に起動し、空運転禁止"],confirm:"機器承認図、NPSH、設計流量・揚程、メーカー要領",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"空調機器",title:"室内機・FCU・全熱交換器",value:"構造体から独立吊り。点検・交換方向を確保",basis:"標準仕様",points:["LGSへ荷重を預けない","フィルター、ファン、電装、ドレンパンの点検口を確保","ドレン勾配・結露・防振・耐震支持を確認"],confirm:"機器重量、承認図、耐震計算、天井伏図",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"弁・付属品",title:"バルブ・ストレーナ・減圧弁の選定",value:"接続→流体→温度圧力→認証→適合製品の順で判定",basis:"承認図優先",points:["流れ方向・設置姿勢・必要差圧を確認","ストレーナ網と弁体の引抜き、ハンドル操作空間を確保","重量物・可とう継手の直近を追加支持"],confirm:"配管システム適合、弁メーカー仕様、設計条件",source:"国土交通省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {category:"支持・固定",title:"吊り金物・支持金物",value:"アカギ製品群を標準候補。管外径・保温・荷重・材質で選定",basis:"メーカー基準",points:["弁・分岐・曲がり・機器接続・可とう継手直近は追加支持","蒸気・給湯は固定、ガイド、ローラーを役割別に選定","満水・保温・地震時荷重と全ねじ・架台耐力を照合"],confirm:"アカギ耐力資料、設計図、耐震計算、アンカー許容荷重",source:"アカギ 製品ガイド",sourceUrl:"https://www.akagi-nt.co.jp/seihin_guide/seihin_guide.htm"},
 {category:"貫通・防火",title:"壁・床貫通と区画処理",value:"認定工法の適用範囲内で施工",basis:"法令・基準",points:["管種・呼び径・保温・開口・壁床厚を認定条件と照合","認定番号、施工者、施工日、写真を記録","防水区画は止水・つば・シールを建築と調整"],confirm:"設計図、認定書、所轄、区画種別",source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"}
];
type EquipmentGuide={id:string;name:string;aliases:string[];category:string;summary:string;flow:string[];connections:string[];accessories:string[];clearance:string[];building:string[];electrical:string[];checks:string[];source:string;sourceUrl:string};
type EquipmentInstallGuide={standards:string[];cautions:string[]};
const equipmentGuides:EquipmentGuide[]=[
 {id:"ahu",name:"空気調和機（AHU）",aliases:["エアハン","空調機"],category:"空調・熱源",summary:"外気と還気を混合し、フィルター・冷温水コイルなどで温湿度を調整して各室へ送風する。",flow:["外気・還気を取入れ","フィルターで除じん","冷温水コイルで冷却・加熱","加湿・送風","給気ダクトへ供給"],connections:["冷温水往・還管","加湿給水・蒸気","ドレン管（封水トラップ）","給気・還気・外気・排気ダクト","電源・制御・BMS"],accessories:["防振架台・防振継手","温度計・圧力計・バルブ・ストレーナ","コイル前後フレキ／伸縮継手","ドレンパン・トラップ","点検灯・サービスコンセント"],clearance:["フィルターを正面へ抜ける寸法","コイル引抜き長さ＋搬出経路","ファン・モーター交換空間","点検扉の全開範囲","ドレン配管の封水高さと勾配"],building:["基礎寸法・天端・防振材沈み代","床荷重・搬入開口・機器分割数","機械室床防水・排水溝・清掃排水","壁との離隔・吸音・防音扉","将来更新時の搬出経路"],electrical:["電源容量・起動方式・インバータ","ファン回転方向・インターロック","凍結防止・差圧・温湿度センサー","火報連動停止・防火ダンパ連動","BMS監視点・制御点"],checks:["コイルの空気抜き・水抜き方向","ドレン負圧に合うトラップ深さ","キャンバス継手へ荷重を掛けない","点検扉前へ配管・盤を置かない"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"fcu",name:"ファンコイルユニット（FCU）",aliases:["ファンコイル","FCU"],category:"空調・熱源",summary:"室内空気を吸込み、冷温水コイルで冷暖房して室内へ戻す小型空調機。",flow:["室内還気を吸込み","フィルター通過","冷温水コイルで熱交換","ファンで吹出し"],connections:["冷温水往・還管","ドレン管","電源・制御配線","吸込・吹出ダクト（天井形）"],accessories:["二方弁・三方弁","ストレーナ・バルブ・フレキ","エア抜き・水抜き","ドレンパン・保温","防振吊り"],clearance:["フィルター清掃空間","バルブ・ストレーナ点検口","モーター交換空間","天井点検口から両手が届く位置"],building:["天井補強と独立吊り","点検口・天井伏せ割付","ドレン勾配を確保できる天井懐","結露時の被害を避ける配置"],electrical:["電源・リモコン配線","二方弁との連動","凝縮水ポンプ警報（有る場合）","中央監視発停"],checks:["ドレン逆勾配・たるみをなくす","バルブ類を点検口へ寄せる","吊りボルトとLGSを共用しない"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"pac",name:"パッケージエアコン",aliases:["PAC","業務用エアコン","室内機・室外機"],category:"空調・熱源",summary:"冷媒を室内機と室外機の間で循環させ、室内側で冷暖房、室外側で放熱・吸熱する。",flow:["圧縮機で冷媒圧縮","室外熱交換器","膨張弁で減圧","室内熱交換器","冷媒が圧縮機へ戻る"],connections:["液管・ガス管","空調ドレン","室内外連絡配線・電源","給排気ダクト（機種による）"],accessories:["分岐管・ヘッダー","防振架台・防振ゴム","ドレンアップメカ","耐候カバー・化粧カバー","集中リモコン"],clearance:["室外機の吸込・吹出離隔","熱交換器洗浄・基板点検空間","室内機フィルター・ドレンパン点検","分岐管周囲の施工空間"],building:["室外機基礎・屋上防水納まり","防振・騒音・ショートサーキット対策","天井開口・点検口・化粧パネル割付","冷媒管貫通部の防水・防火処理"],electrical:["室外機／室内機の給電方式","連絡線の極性・シールド条件","火報・換気との連動","デマンド・中央監視"],checks:["メーカー許容配管長・高低差","分岐管の向きと前後直管","窒素置換ろう付け・気密試験","ドレン試験後に天井閉塞"],source:"日本冷凍空調工業会",sourceUrl:"https://www.jraia.or.jp/"},
 {id:"erv",name:"全熱交換器",aliases:["全熱交換型換気扇","ロスナイ","ERV"],category:"換気・排煙",summary:"排気と外気を混ぜずに熱交換エレメントを介して温度と湿度を回収し、換気による空調負荷を低減する。",flow:["外気と室内還気を取入れ","フィルターで除じん","熱交換エレメントで全熱交換","処理外気を室内へ給気","室内空気を屋外へ排気"],connections:["外気（OA）・給気（SA）ダクト","還気（RA）・排気（EA）ダクト","ドレン管（結露水が生じる機種）","電源・リモコン・制御配線"],accessories:["外気・排気ウェザーカバー／ベントキャップ","フィルター・高性能フィルター（仕様時）","防振吊り・たわみ継手","電動ダンパ・防火ダンパ","給排気グリル・消音部材"],clearance:["熱交換エレメント引抜き空間","フィルター清掃・交換空間","ファン・電装品点検空間","天井点検口から両手が届く位置"],building:["構造体からの独立吊り・耐震支持","天井点検口とLGS・照明の割付","外壁開口の防水・雨仕舞・防火処理","天井懐とダクト交差・保温厚"],electrical:["給排気ファンの電源・回転確認","強弱・ナイトパージ・バイパス制御","空調機・CO2センサーとの連動","火災時停止・防火ダンパ連動"],checks:["OA・SA・RA・EAの接続間違い防止","外気と排気のショートサーキット防止","フィルター・エレメント取付方向","風量・騒音・ドレン排水・結露確認"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"chiller",name:"冷凍機・チラー",aliases:["チラー","冷水機","ヒートポンプチラー"],category:"空調・熱源",summary:"冷媒回路で水から熱を奪い、冷水または温水を空調機やFCUへ送る熱源機器。",flow:["蒸発器で水と冷媒が熱交換","圧縮機で冷媒圧縮","凝縮器で放熱","膨張弁で減圧","冷温水を二次側へ供給"],connections:["冷温水往・還管","冷却水管（水冷式）","補給水・排水","電源・制御・通信"],accessories:["ポンプ・ストレーナ・逆止弁","膨張タンク・エアセパレータ","流量計・温度計・圧力計","防振継手・防振架台"],clearance:["熱交換器チューブ引抜き空間","圧縮機・制御盤点検空間","上部揚重・交換空間","空冷式は吸排気離隔"],building:["機器重量と基礎・床荷重","搬入開口・クレーン計画","防振基礎・騒音対策","機械室排水・漏水対策"],electrical:["受電容量・高調波・起動電流","ポンプとのフローインターロック","台数制御・BMS通信","緊急停止・漏電・接地"],checks:["最低保有水量と水質","必要流量未達で運転しない","配管荷重をノズルへ掛けない","凍結防止と冬期停止処置"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"ct",name:"冷却塔",aliases:["クーリングタワー","CT"],category:"空調・熱源",summary:"冷却水を散水し、空気との接触と水の蒸発により冷却して冷凍機へ戻す。",flow:["温まった冷却水を上部へ送る","充填材へ散水","ファンで外気を通す","蒸発潜熱で冷却","下部水槽から冷凍機へ戻す"],connections:["冷却水往・還管","補給水・オーバーフロー・ブロー","電源・制御","薬注・水処理"],accessories:["防振装置・フレキ","ストレーナ・連成計","ボールタップ・水位計","薬注装置・ブロー装置"],clearance:["吸気面・吐出面の離隔","充填材・ファン交換空間","水槽清掃と点検動線","周辺設備への飛散防止距離"],building:["屋上基礎・防水立上り","風荷重・耐震・転倒防止","騒音・白煙・飛散水の影響","搬入更新経路"],electrical:["ファン電源・インバータ","冷却水ポンプ連動","凍結防止ヒーター","水位・異常警報"],checks:["ショートサーキット防止","レジオネラ対策と水質管理","冬期凍結・停止時排水","周辺外気取入口との離隔"],source:"日本冷却塔工業会",sourceUrl:"https://www.jci-net.or.jp/"},
 {id:"fan",name:"送風機・排風機",aliases:["ファン","シロッコ","有圧扇"],category:"換気・排煙",summary:"羽根車を回して圧力差を作り、給気・排気・換気・排煙の空気を搬送する。",flow:["吸込口から空気を取入れ","羽根車で圧力を付与","吐出口からダクトへ送る"],connections:["吸込・吐出ダクト","電源・制御","ドレン（屋外形・結露部）"],accessories:["防振架台・防振吊り","キャンバス継手","たわみ継手・点検口","逆流防止ダンパ・VD"],clearance:["モーター・ベルト交換空間","軸受給油・点検空間","羽根車引抜き方向","ダクト点検口へのアクセス"],building:["基礎・吊り元・耐震支持","騒音・振動の伝達防止","外壁ガラリ・防水・雨仕舞","排気と外気取入口の離隔"],electrical:["回転方向確認","スター・インバータ・過負荷保護","ダンパ開確認との連動","火報・排煙制御との連動"],checks:["吸込直前の急曲がりを避ける","キャンバスを張り過ぎない","芯ずれ・ベルト張力・ボルト締付","試運転前に異物確認"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"smoke",name:"排煙機",aliases:["排煙ファン","SEF"],category:"換気・排煙",summary:"火災時に煙を排出し、避難・消防活動に必要な環境を確保する専用送風機。",flow:["排煙口を開放","排煙ダクトへ煙を吸引","耐熱排煙機で屋外排出"],connections:["排煙ダクト","非常電源","排煙口・防煙垂壁・制御盤"],accessories:["耐熱たわみ継手","排煙ダンパ・排煙口","防振装置（認定条件確認）","点検口"],clearance:["モーター・羽根車点検空間","ダクト接続部検査空間","屋外排出口周囲離隔"],building:["専用機械室・耐火区画条件","排煙ダクトの防火被覆","屋外排出口位置","保守搬入経路"],electrical:["非常電源","火災信号・手動起動","排煙口開放確認後の起動","運転・故障表示"],checks:["建築基準法・認定仕様を優先","一般換気との兼用条件確認","高温時性能と耐熱材","消防・建築設備検査の試験手順"],source:"国土交通省 建築設備設計基準",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
 {id:"pump",name:"ポンプ",aliases:["揚水ポンプ","循環ポンプ","加圧給水ポンプ"],category:"給排水・衛生",summary:"羽根車などで液体へ圧力を与え、給水・循環・排水などの必要な流量と揚程を確保する。",flow:["吸込管から水を取入れ","羽根車で圧力を付与","吐出管へ送水"],connections:["吸込管・吐出管","呼水・空気抜き・水抜き","電源・制御・圧力センサー"],accessories:["防振継手・防振架台","吸込側ストレーナ","吐出側逆止弁・仕切弁","圧力計・連成計","サクションディフューザ"],clearance:["モーター・軸・メカシール交換空間","ストレーナ清掃空間","上部揚重・ポンプ引抜き空間","盤の前面保守空間"],building:["基礎天端・アンカー・グラウト","床排水・漏水受け","騒音・振動対策","搬入・交換経路"],electrical:["電源・起動方式・インバータ","空転・過負荷・欠相保護","水位・圧力・流量制御","交互運転・故障時バックアップ"],checks:["偏心レジューサの向き","吸込直管とエア溜まり防止","配管荷重をポンプへ掛けない","芯出し後に配管接続・再芯出し"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"tank",name:"受水槽・高置水槽",aliases:["受水タンク","FRP水槽","高架水槽"],category:"給排水・衛生",summary:"給水を一時貯留し、需要変動や断水へ対応してポンプまたは重力で建物へ供給する。",flow:["給水本管から流入","定水位弁で水位制御","槽内に貯留","ポンプまたは重力で給水"],connections:["流入・流出管","オーバーフロー管","排水管・通気管","電極・水位計・警報"],accessories:["定水位弁・緊急遮断弁","防虫網・間接排水口","満減水警報","耐震固定・防振継手"],clearance:["六面点検空間（仕様・条例優先）","マンホール上部の開放空間","パネル交換・清掃動線","弁類操作空間"],building:["基礎水平・荷重・耐震","周囲排水・防水・点検照明","汚染源・排水管からの離隔","搬入組立・将来更新スペース"],electrical:["満水・減水・電極警報","ポンプ制御盤との連動","緊急遮断弁","監視盤表示"],checks:["オーバーフローは間接排水","吐水口空間を確保","槽内へ異物・雨水を入れない","自治体条例・水道事業者基準を確認"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"waterheater",name:"給湯器・貯湯槽",aliases:["ボイラー","湯沸器","貯湯タンク"],category:"給排水・衛生",summary:"燃焼・電気・ヒートポンプ等で水を加熱し、直接または貯湯して給湯する。",flow:["給水を取入れ","熱源で加熱","必要に応じ貯湯","給湯・返湯系統へ供給"],connections:["給水・給湯・返湯管","膨張・逃し管・排水","燃料・排気筒（燃焼式）","電源・制御"],accessories:["安全弁・減圧弁","膨張タンク","温度計・圧力計","循環ポンプ・逆止弁","混合弁"],clearance:["バーナー・ヒーター交換空間","安全弁・点検口操作空間","排気筒周囲離隔","貯湯槽清掃・更新空間"],building:["基礎・耐震固定","燃焼空気・換気・排気筒貫通","床排水・漏水対策","高温部の可燃物離隔"],electrical:["電源・接地","燃焼安全制御","温度・循環制御","ガス漏れ・CO警報連動"],checks:["逃し管へ弁を設けない","膨張水の安全な排出","レジオネラ対策・温度管理","燃料種・法令・メーカー要領"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"hydrant",name:"屋内消火栓箱",aliases:["消火栓ボックス","消火栓箱","1号消火栓","易操作性1号消火栓","2号消火栓"],category:"消防設備",summary:"火災時にホースとノズルで初期消火を行うための開閉弁・ホース・ノズル等を収納する設備。種類ごとに操作方法と認定仕様が異なる。",flow:["表示灯で位置を確認","扉を開きホース・ノズルを取り出す","開閉弁または起動装置を操作","ホースを延長","ノズルから放水"],connections:["消火栓配管・開閉弁","ホース接続口","表示灯・発信機・ベル（複合型）","ポンプ起動・監視配線"],accessories:["認定仕様の箱・扉","ホース・ノズル・開閉弁","表示灯・消火栓表示","発信機・ベル（組込仕様）"],clearance:["扉を全開できる前面空間","ホース引出し・放水操作空間","開閉弁・接続口の操作空間","点検・部品交換の前面作業空間"],building:["FL・壁仕上げからの取付基準","LGS下地・開口補強・箱固定","巾木・見切り・扉との納まり","防火区画と貫通処理"],electrical:["表示灯電源・点灯確認","発信機・ベル・火報配線","ポンプ起動信号・運転表示","非常電源・絶縁確認"],checks:["開閉弁の操作部を床面から1.5m以下","扉・ホース・ノズルを支障なく操作できる","表示灯を離れた位置から識別できる","ポンプ起動・放水圧力・放水量を系統試験"],source:"消防庁 消防用設備等の試験基準",sourceUrl:"https://www.fdma.go.jp/laws/tutatsu/items/tuchi2507/pdf/siken-kijun.pdf"},
 {id:"grease",name:"グリース阻集器",aliases:["グリストラップ","GT"],category:"給排水・衛生",summary:"厨房排水の流速を落とし、油脂を浮上、残さを沈殿させて下水への流出を抑える。",flow:["厨房排水が流入","バスケットで残さを除去","槽内で油脂を浮上分離","処理水が排水管へ流出"],connections:["流入排水管","流出排水管","通気管","清掃・排水経路"],accessories:["バスケット・仕切板","防臭ふた","かさ上げ・点検口","通気金物"],clearance:["ふた全開とバスケット引上げ空間","清掃車・運搬動線","周囲床清掃空間"],building:["床仕上げ高さとふた天端","防水・塗床・タイル納まり","床荷重・かさ上げ固定","臭気が室内へ漏れない区画"],electrical:["警報装置（設置する場合）","ヒーター（寒冷地・仕様時）"],checks:["容量計算と清掃頻度","勾配・逆流・臭気対策","厨房機器配置とふたの干渉","清掃できない位置へ埋めない"],source:"空気調和・衛生工学会",sourceUrl:"https://www.shasej.org/"},
 {id:"toilet",name:"大便器・小便器・洗面器",aliases:["衛生器具","便器","洗面"],category:"給排水・衛生",summary:"給水または洗浄水を使用し、汚水・雑排水をトラップの封水を介して排水系統へ流す。",flow:["給水・洗浄水を供給","器具を使用・洗浄","器具トラップで封水","排水枝管へ流出"],connections:["給水・洗浄管","汚水・雑排水管","電源・通信（自動水栓等）"],accessories:["止水栓・フラッシュバルブ","排水ソケット・フランジ","固定金具・バックハンガー","化粧カバー・シール材"],clearance:["使用・清掃空間","止水栓操作空間","壁掛器具の点検空間","バリアフリー寸法"],building:["器具芯・排水芯・壁仕上げ厚","壁下地補強・床補強","タイル割付・防水・シール","ライニング点検口"],electrical:["自動水栓・温水洗浄便座の電源","センサー・リモコン位置","アース・漏電保護"],checks:["仕上げ前に給排水芯と出寸法確認","排水ソケットの適用品番","器具固定後のがたつき・漏水","封水・通水・洗浄試験"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"expansion",name:"膨張タンク",aliases:["密閉形膨張タンク","開放形膨張水槽"],category:"配管付属機器",summary:"水温変化による体積膨張を吸収し、密閉配管系の圧力を安定させる。",flow:["水温上昇で水が膨張","タンク内の空気・隔膜が圧縮","系統圧力上昇を吸収","冷却時に水を系統へ戻す"],connections:["膨張管","補給水（方式による）","排水・オーバーフロー（開放形）"],accessories:["安全弁・圧力計","自動空気抜き弁","隔膜・封入圧点検口"],clearance:["隔膜・本体交換空間","封入圧測定・弁操作空間","上部吊上げ空間"],building:["床置基礎または壁・架台強度","満水重量と耐震固定","漏水時排水"],electrical:["低圧・高圧警報（必要時）","補給水装置との連動"],checks:["接続位置はポンプ基準圧力点を考慮","封入圧と初期充水圧を設定","膨張管に不用意な閉止弁を設けない","容量は系統水量・温度から計算"],source:"国土交通省 公共建築設備設計基準",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
 {id:"hex",name:"熱交換器",aliases:["プレート熱交換器","HEX"],category:"配管付属機器",summary:"一次側と二次側の流体を混ぜずに、プレートや管壁を介して熱だけを移動させる。",flow:["一次側高温流体が流入","伝熱面を介して熱移動","二次側流体を加熱・冷却","両流体が別々に流出"],connections:["一次側往・還管","二次側往・還管","ドレン・空気抜き","計装・制御弁"],accessories:["ストレーナ・バルブ","温度計・圧力計","差圧計・流量計","防振継手・安全弁"],clearance:["プレート増締め・分解空間","チューブ引抜き空間（多管式）","ストレーナ清掃空間","上部揚重空間"],building:["基礎・架台・満水重量","分解部品の仮置き空間","床排水・高温水漏えい対策"],electrical:["制御弁・温度制御","ポンプとのインターロック","高温・低温警報"],checks:["一次二次の流れ方向","設計圧力・温度・材質","汚れ係数と洗浄方法","ノズルへ配管荷重を掛けない"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
 {id:"trap",name:"蒸気トラップ・減圧弁装置",aliases:["トラップ装置","減圧ステーション"],category:"蒸気・特殊設備",summary:"トラップは蒸気を逃がさず凝縮水と空気を排出し、減圧弁は下流の蒸気圧力を設定値へ下げる。",flow:["蒸気をストレーナへ通す","減圧弁で圧力調整","機器で蒸気が凝縮","トラップがドレンを排出","還水管へ戻す"],connections:["蒸気一次・二次管","ドレン・還水管","ブロー・バイパス管","安全弁放出管"],accessories:["前後止弁・ストレーナ","圧力計・サイホン管","セパレータ・ドレンポット","逆止弁・サイトグラス"],clearance:["ストレーナ網引抜き空間","トラップ・減圧弁交換空間","ブローを安全に行う操作空間"],building:["高温部の接触防止・保温","ブロー・安全弁放出先","熱伸縮用支持・固定点","漏えい時の排水・換気"],electrical:["電動弁・警報（装置による）","凝縮水回収ポンプ連動"],checks:["トラップ容量と差圧・背圧","減圧比が大きい場合の二段減圧","配管勾配とドリップレッグ","バイパス弁の誤操作防止"],source:"国土交通省 公共建築工事標準仕様書",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
];
const equipmentInstallGuides:Record<string,EquipmentInstallGuide>={
  ahu:{standards:["水平で十分な強度のある基礎に据付け、機器重量・運転振動に合う防振方式と耐震固定を選ぶ","コイル・フィルター・ファンを引き抜ける保守空間と、点検扉の全開範囲を先に確保する","ドレンは機内静圧に合う有効封水深のトラップを設け、下り勾配と清掃口を確保する"],cautions:["配管・ダクトの重量や芯ずれを機器ノズル、キャンバス継手へ負担させない","外気取入口と排気口の短絡、雨水・雪の吸込み、凍結を確認する","試運転前に輸送固定材、機内異物、ファン回転方向、フィルター取付方向を確認する"]},
  fcu:{standards:["本体はLGSと共用せず構造体から独立して吊り、水平と防振を確保する","フィルター、ドレンパン、ファン、弁・ストレーナへ届く点検口を設ける","ドレンは連続下り勾配を確保し、必要時は通気・トラップ・ドレンアップ条件をメーカー要領で確認する"],cautions:["天井閉塞前に通水・満水・排水試験を行い、結露と漏水を確認する","フレキを無理に曲げず、配管荷重を本体へ掛けない","点検口が照明、天井下地、家具・間仕切りと干渉しないか確認する"]},
  pac:{standards:["室外機はメーカー指定の吸込・吹出・サービス離隔を確保し、ショートサーキットを防ぐ","室内機は独立吊りで水平を確保し、フィルター・電装・ドレンパンの点検口を設ける","冷媒配管長、高低差、分岐管姿勢、追加冷媒量は採用機器の設計・施工要領を優先する"],cautions:["ろう付けは窒素置換し、気密試験・真空乾燥後に冷媒を開放する","ドレン試験完了前に天井を閉じない。逆勾配、二重トラップ、エア噛みに注意する","室外機の排風を外気取入口や隣接機へ向けず、騒音・振動・ドレン凍結も確認する"]},
  erv:{standards:["本体はLGSと共用せず構造体から独立して水平に吊り、機器重量・振動・地震力に合う吊り材と振れ止めを設ける","フィルター、熱交換エレメント、ファン、電装品を引き抜ける点検口と保守空間をメーカー指定方向へ確保する","外気・排気開口は雨水を吸い込まず互いに短絡しない位置とし、外壁貫通の防水・防火・結露対策を行う"],cautions:["OA・SA・RA・EAを本体表示と施工図で照合し、逆接続や給排気の交差を防ぐ","ダクト荷重を本体へ掛けず、たわみ継手、防振、保温・防湿を連続させて結露を防止する","試運転で給排気風量、回転、異常音、バイパス切替、フィルター、ドレン排水、天井内結露を確認する"]},
  chiller:{standards:["満水・運転重量に耐える水平な基礎、防振、耐震固定と更新用搬入経路を確保する","熱交換器、圧縮機、制御盤のメーカー指定サービス空間と揚重空間を確保する","必要流量、最低保有水量、水質、凍結防止条件を設計値・メーカー要領で満たす"],cautions:["フロー確認なしで運転せず、ポンプとのインターロックを実機確認する","配管荷重・熱伸縮をノズルへ掛けず、接続後に水平・芯・防振材の沈みを再確認する","試運転前に洗浄水を十分置換し、ストレーナ差圧とエア抜きを確認する"]},
  ct:{standards:["運転重量・風荷重・地震力に対応する基礎と固定を行い、屋上防水との納まりを確認する","吸込面・吐出側はメーカー指定離隔を確保し、吐出空気の再循環を防ぐ","充填材、ファン、散水部、水槽を清掃・交換できる周囲空間と安全な点検動線を確保する"],cautions:["外気取入口、窓、隣地への飛散水・白煙・騒音影響を事前確認する","レジオネラ症防止のため水処理、ブロー、清掃、水質管理の運用計画まで引き渡す","冬期の凍結、停止時排水、ヒーター空焚き、ファン回転方向を確認する"]},
  fan:{standards:["基礎・吊り元の強度を確認し、用途・重量・回転数に合う防振と耐震支持を行う","モーター、ベルト、軸受、羽根車を点検・交換できる空間と点検口を確保する","吸込側は偏流を避け、可能な範囲で直管を確保し、たわみ継手へ張力を掛けない"],cautions:["試運転前に内部異物、手回し、ボルト、ベルト張力、回転方向、電流値を確認する","ダクト芯ずれをキャンバスで吸収させず、本体へダクト荷重を掛けない","屋外形は雨仕舞、排水、腐食対策と排気口から外気取入口への短絡を確認する"]},
  smoke:{standards:["排煙機、ダクト、たわみ継手、支持、防火被覆は設計図書・法令・認定仕様の組合せを優先する","非常電源、排煙口開放確認、手動起動、運転・故障表示を含む一連の作動を確認する","点検・交換空間、専用機械室・区画、排出口位置を建築・消防・電気と事前調整する"],cautions:["一般換気用の部材や防振材へ安易に置き換えず、耐熱性能と認定条件を確認する","試験は排煙口から排出まで系統全体で行い、ダンパ不作動や逆回転を見逃さない","防火区画貫通部や被覆を他工事が後から欠損させないよう閉塞前検査を行う"]},
  pump:{standards:["水平で剛性のある基礎に据え、アンカー・グラウト・防振方式を仕様に合わせる","吸込配管は空気溜まりを作らず、偏心レジューサの平側を上にするなどポンプへ連続して導く","モーター、軸封、ストレーナ、逆止弁を点検・交換できる空間と揚重経路を確保する"],cautions:["配管接続前後で芯出しを確認し、配管荷重や熱伸縮をポンプへ掛けない","空運転を禁止し、呼水・エア抜き・弁開閉・回転方向を確認してから起動する","キャビテーション、異常音、振動、電流、吐出圧を試運転記録に残す"]},
  tank:{standards:["満水重量・地震力に耐える水平な基礎と固定を行い、必要な六面点検空間は仕様・自治体基準を優先する","マンホール開放、内部清掃、パネル交換、弁操作ができる空間と衛生的な搬入動線を確保する","オーバーフロー・排水は適切な吐水口空間を持つ間接排水とし、防虫・汚染防止措置を行う"],cautions:["槽上部や周囲に汚染源となる排水管・油配管等を配置しない","据付後は内部清掃・消毒、水張り、漏水、水位制御、満減水警報を確認する","基礎不陸や配管荷重でパネルを変形させず、自治体・水道事業者への届出条件を確認する"]},
  waterheater:{standards:["満水重量に耐える基礎と耐震固定を行い、バーナー・ヒーター・槽内点検用の保守空間を確保する","燃焼式は給排気方式、換気、排気筒、可燃物離隔をメーカー要領と関係法令に合わせる","安全弁・逃し管・膨張吸収装置を設け、逃し管は安全に目視できる位置へ排水する"],cautions:["安全弁と本体の間や逃し管へ不用意な閉止弁を設けない","初回運転前に満水・エア抜きを確認し、空焚き、逆流、過圧を防止する","高温やけど、レジオネラ、CO、燃料漏れを考慮し、設定温度と安全装置を試験する"]},
  hydrant:{standards:["開閉弁の操作部を床面から1.5m以下とし、箱の中心高さではなく操作部で実測する","扉を全開し、ホースの取出し・延長・放水操作ができる前面空間を確保する","壁下地・開口補強へ堅固に固定し、FL、仕上げ面、巾木、防火区画との納まりを確認する"],cautions:["1号、易操作性1号、2号等の認定仕様とホース・ノズル・弁の構成を混同しない","箱だけを先に高さ決めせず、承認図の開閉弁位置と仕上げ床高さを照合する","表示灯、発信機・ベル、ポンプ起動、運転表示、放水性能を系統全体で試験する"]},
  grease:{standards:["流入負荷に合う容量を選び、ふた天端を床仕上げに合わせ、清掃時の荷重に耐える固定を行う","バスケット、仕切板、油脂、汚泥を取り出せる上部空間と搬出・洗浄動線を確保する","流入・流出方向、管底、通気、排水勾配を製品要領と排水計画に合わせる"],cautions:["ふたや点検口を厨房機器、造作、冷蔵庫の下へ隠さない","防水・塗床との取り合いを先に決め、臭気・害虫・漏水を防ぐ","油脂を下水へ流さないよう清掃頻度・記録・廃棄方法を使用者へ引き継ぐ"]},
  toilet:{standards:["器具芯、排水芯、給水出寸法、壁・床仕上げ厚を施工図と承認図で照合する","壁掛器具・手すり・洗面器は必要な下地補強と固定強度を確保する","使用・清掃・バリアフリー空間と、止水栓・センサー・電源の点検性を確保する"],cautions:["タイル・壁仕上げ前に芯と出寸法を実測し、排水ソケットの適用品番を確認する","締付け過ぎによる陶器破損、固定不足によるがたつき、シール不良に注意する","取付後に通水、洗浄、漏水、封水、センサー、温水洗浄便座の作動を確認する"]},
  expansion:{standards:["系統水量・温度・圧力から容量と封入圧を算定し、満水重量に耐える架台・固定を行う","隔膜交換、封入圧測定、安全弁・弁操作ができる点検空間を確保する","接続位置はポンプの基準圧力点と補給水位置を考慮し、設計系統図に従う"],cautions:["膨張管を不用意に閉止できる構成とせず、必要な弁には常時開表示・管理を行う","初期充水前後で封入圧を確認し、水が入った状態で空気側圧力を誤判定しない","安全弁放出先、漏水時排水、腐食、凍結を確認する"]},
  hex:{standards:["満水重量と反力に耐える水平な基礎・架台へ据え、プレート増締め・分解寸法を確保する","一次・二次の流れ方向、対向流条件、設計圧力・温度・材質を承認図と照合する","前後に弁、ストレーナ、温度・圧力計等を設け、洗浄・水抜き・エア抜きができる構成とする"],cautions:["配管荷重や熱伸縮をノズルへ掛けず、接続時に無理な引寄せをしない","急な弁操作によるウォーターハンマ、熱衝撃、凍結を避ける","試運転後に差圧・温度差・漏れを確認し、ガスケット増締めはメーカー手順で行う"]},
  trap:{standards:["蒸気主管・枝管は凝縮水が流れる勾配を確保し、必要箇所にドリップレッグとトラップを設ける","減圧弁・トラップは流れ方向、姿勢、前後直管、差圧・背圧、容量をメーカー要領で確認する","ストレーナ網、弁、トラップを安全に清掃・交換でき、ブローを安全に放出できる空間を確保する"],cautions:["減圧比が大きい場合は二段減圧、騒音、二次側安全弁容量を設計者へ確認する","バイパス弁の急開・誤操作、ウォーターハンマ、高温部のやけどを防止する","通蒸気は十分な暖管とドレン排出を行い、トラップ作動・漏れ・還水背圧を確認する"]}
};
type MeetingItem={id:string;phase:string;party:string;title:string;format:string;timing:string;points:string[];critical?:boolean};
const meetingItems:MeetingItem[]=[
  {id:"site-use",phase:"着工前",party:"元請・建築",title:"仮設計画・現場使用要望書",format:"要望一覧／区画表",timing:"着工会議前",critical:true,points:["材料置場の必要面積・使用期間・施錠・雨掛かり対策","加工場、ねじ切り場、火気使用場所、換気・排水","資材搬入口、車両待機、荷受け場所、台車動線","現場事務所、詰所、倉庫、廃材分別場所","仮設電源容量・盤位置、仮設給排水、照明、トイレ"]},
  {id:"org",phase:"着工前",party:"全業者",title:"施工体制・連絡網・責任区分表",format:"連絡網／工事区分表",timing:"着工時",critical:true,points:["各社現場代理人・職長・緊急連絡先","建築、電気、空調、衛生、消防、昇降機、厨房等の担当範囲","墨出し、開口、補強、穴埋め、塗装、電源、計装の責任区分","夜間・休日・緊急時の連絡手順"]},
  {id:"master",phase:"着工前",party:"元請・全業者",title:"総合工程・設備先行条件一覧",format:"工程表／期限一覧",timing:"着工時・毎月更新",critical:true,points:["躯体、間仕切り、天井、床、防水、塗装の開始・閉塞日","スリーブ、インサート、埋設、先行配管の締切","機器承認・製作・納入・試運転に必要なリードタイム","停電、断水、火気、騒音作業の可能日"]},
  {id:"delivery",phase:"施工前",party:"元請・建築・警備",title:"月間／週間 搬入予定表",format:"搬入カレンダー",timing:"月次・週間会議",critical:true,points:["品名、数量、車格、重量、荷姿、納入会社、連絡先","搬入日時、ゲート、荷下ろし場所、待機時間","フォーク・クレーン・揚重機の使用時間と資格者","雨天・強風・道路規制時の予備日","搬入後の仮置き場所と養生責任"]},
  {id:"lifting",phase:"施工前",party:"元請・建築・揚重",title:"重量物搬入・揚重計画書",format:"計画書／チェック表",timing:"搬入2～4週前",critical:true,points:["機器重量・重心・吊り点・外形・分割可否","搬入開口、廊下、EV、床荷重、段差、旋回寸法","クレーン能力、作業半径、アウトリガー、地耐力","玉掛け方法、合図者、立入禁止、仮置き・転倒防止","搬入口・仮設開口を閉じる日と建築復旧区分"]},
  {id:"temporary",phase:"施工前",party:"電気・元請",title:"仮設電源・試運転電源 要望書",format:"負荷一覧",timing:"使用1か月前",points:["電圧、相、容量、台数、起動電流、使用期間","仮設盤位置、ケーブル経路、接地、漏電遮断器","耐圧試験ポンプ、溶接機、工具、照明の同時使用","本設受電日と試運転可能日"]},
  {id:"shutdown",phase:"施工前",party:"施主・元請・電気",title:"停電・断水・切替作業申請",format:"作業申請／影響範囲表",timing:"指定期限・通常2～4週前",critical:true,points:["対象系統、停止範囲、停止時間、影響室・利用者","事前周知、バルブ・遮断器操作責任者、鍵管理","仮設供給、バックアップ、復旧確認、残留リスク","中止判断、緊急復旧、連絡体制"]},
  {id:"coord",phase:"躯体・下地",party:"建築・電気・他設備",title:"施工順序・取り合い確認表",format:"部位別チェック表",timing:"各工区着手前",critical:true,points:["基準墨、FL・SL、天井高、壁厚、仕上げ厚","設備・照明・感知器・スプリンクラー・点検口の優先順位","配管・ダクト・ケーブルラックの上下関係と保守空間","LGS・システム天井・塗床・防水の施工タイミング","閉塞前検査と設備側の閉塞許可"]},
  {id:"sleeve",phase:"躯体・下地",party:"建築・構造・電気",title:"開口・スリーブ・インサート確認一覧",format:"箇所別一覧表",timing:"配筋・打設前",critical:true,points:["施工階・場所・部位・用途・寸法・数量","構造可否、鉄筋離隔、補強、デッキ開口","先付け／後施工区分、コア抜き承認手順","防水つば、止水、耐火・防煙区画の条件","打設相番と打設後の位置・詰まり確認"]},
  {id:"ceiling",phase:"内装",party:"建築・電気・消防",title:"天井内作業・閉塞前確認票",format:"工区別チェック表",timing:"ボード・天井材施工前",critical:true,points:["耐圧・気密・通水・ドレン試験の完了","支持、振れ止め、保温、防露、表示、区画処理","電気配線・接地・制御配線と機器接続","点検口から弁・ダンパ・機器を保守できること","写真・検査記録完了と閉塞可否"]},
  {id:"floor",phase:"内装",party:"建築・防水・塗床",title:"床仕上げ・水使用調整表",format:"工区カレンダー",timing:"施工2週前",points:["防水・塗床の下地処理、施工日、硬化・養生日","排水口、掃除口、機器基礎、貫通部の先行完了","水張り試験の範囲・時間・排水先","施工中の断水、立入禁止、台車・重量物禁止","仕上げ後のアンカー施工と補修方法"]},
  {id:"fire",phase:"施工中",party:"元請・消防・電気",title:"火気・防火区画・消防設備調整表",format:"申請一覧／区画台帳",timing:"作業前・週次",critical:true,points:["溶接・ろう付・切断の場所、時間、監視人、消火器","感知器養生・復旧、火報停止・復旧責任者","区画種別、認定工法、施工者、検査・写真","スプリンクラー停止・充水・放水試験の調整"]},
  {id:"inspection",phase:"検査・試運転",party:"元請・電気・施主",title:"試験・検査・試運転予定表",format:"検査カレンダー／立会表",timing:"月次・2週間前",critical:true,points:["耐圧、気密、満水、通水、風量、水量、絶縁、動作試験","試験系統、判定基準、計測器、校正、記録様式","電源・水・燃料・排水・通信・BMSの供給条件","メーカー・設計・監理・施主・消防の立会要否","不具合是正、再試験、完成検査までの期限"]},
  {id:"commissioning",phase:"検査・試運転",party:"電気・制御・機器メーカー",title:"機器連動・制御確認リスト",format:"入出力／連動表",timing:"試運転前",points:["電源電圧・相・回転方向・接地・遮断器容量","発停、故障、警報、インターロック、非常停止","ポンプ・弁・ファン・ダンパ・センサーの動作","中央監視・BMSの点名、設定値、トレンド、停電復帰","責任分界点と単体試験完了条件"]},
  {id:"handover",phase:"竣工",party:"施主・元請・保守",title:"引渡し・取扱説明・鍵類確認表",format:"引渡し一覧",timing:"竣工1か月前～",critical:true,points:["取扱説明会の日時、対象者、説明担当メーカー","予備品、消耗品、工具、鍵、フィルターの数量","バルブ・機器・系統表示、緊急停止方法","保証期間、保守窓口、初期点検、季節切替","検査記録、試運転記録、完成書類の提出期限（図面を除く）"]},
  {id:"waste",phase:"全期間",party:"元請・全業者",title:"産廃・搬出・清掃ルール確認表",format:"分別・搬出表",timing:"着工時・随時",points:["分別区分、集積場所、搬出曜日、マニフェスト区分","金属くず、保温材、接着剤・シール材、冷媒容器","残材・梱包材・パレットの引取り区分","竣工清掃、天井内・機械室の残材撤去"]},
  {id:"safety",phase:"全期間",party:"元請・全業者",title:"作業間連絡・安全調整事項",format:"週間工程／KY調整",timing:"毎日・週間会議",critical:true,points:["上下作業、同一場所の競合作業、立入禁止区画","高所作業車、足場、開口、吊り荷、火気、酸欠","騒音・振動・粉じん・臭気・水使用の時間制限","通路・避難経路・防火戸・消防設備を塞がない","翌日の人員、作業場所、搬入、危険作業の共有"]},
];
type GlossaryItem={term:string;aliases:string[];category:string;meaning:string;use:string;caution:string;image:string;source:string};
const toolPhotos={
  pipe:"https://www.genbaichiba.com/img/goods/7/00697318_7.jpg",
  monkey:"https://jp.images-monotaro.com/Monotaro3/pi/highreso/mono19602504-250530-02.jpg",
  impact:"https://kunihamonet.com/upload/save_image/makita/item/TD090DWSPW.jpg",
  reamer:"https://shopping.c.yimg.jp/lib/horikku/2b205yu3oq.jpg",
  cutter:"https://image.torano-te.jp/image_optimal/tuzukiya/cabinet/0/0/5094/s21-0687.jpg?v=20260405162128",
  laser:"https://www.komeri.com/images/goods/023/424/65/2342465.jpg",
  rod:"https://image.torano-te.jp/image_optimal/tuzukiya/cabinet/0/0/7940/m40-1737.jpg?v=20260220152117"
};
const glossaryItems:GlossaryItem[]=[
  {term:"パイプレンチ",aliases:["パイレン","パイプレンチ","パイプレン"],category:"工具",meaning:"丸い鋼管を歯でつかんで回すレンチ。",use:"白ガス・黒ガスなど、ねじ込み鋼管の締付け・解体。",caution:"化粧管や薄肉管を傷つける。柄にパイプを掛けて延長しない。",image:toolPhotos.pipe,source:"https://www.genbaichiba.com/shop/g/g00697318/"},
  {term:"モンキーレンチ",aliases:["モンキー","自在スパナ","アジャスタブルレンチ"],category:"工具",meaning:"口開きを調整できるボルト・ナット用レンチ。",use:"六角部の締付け・仮締め。固定あご側へ力を掛ける。",caution:"配管を直接つかまない。口開きのガタは角をなめる原因。",image:toolPhotos.monkey,source:"https://www.monotaro.com/p/1960/2504/"},
  {term:"インパクトドライバー",aliases:["インパクト","充電インパクト","インパク"],category:"電動工具",meaning:"回転方向へ打撃を加えてねじ・ボルトを締める工具。",use:"ビス、ナット、支持金具の施工。",caution:"指定トルク管理の代用にはしない。締め過ぎ・ビット破損に注意。",image:toolPhotos.impact,source:"https://kunihamonet.com/products/detail20856.html"},
  {term:"チューブカッター",aliases:["パイプカッター","銅管カッター","チューブカッタ"],category:"工具",meaning:"刃を管の周囲に回して直角に切断する工具。",use:"銅管・薄肉金属管の切断。対象材に合う刃を選ぶ。",caution:"締め込み過多は管を変形させる。切断後は必ずバリ取り。",image:toolPhotos.cutter,source:"https://www.torano-te.jp/p/s21-0687/"},
  {term:"リーマー",aliases:["パイプリーマー","面取り器","バリ取り","バリ取り器"],category:"工具",meaning:"切断した管の内外面のバリを除去する工具。",use:"銅管・樹脂管・鋼管の切断後処理。",caution:"削り過ぎや切粉の管内残留を防ぐ。冷媒管は下向き作業。",image:toolPhotos.reamer,source:"https://store.shopping.yahoo.co.jp/horikku/2b205yu3oq.html"},
  {term:"レーザー墨出し器",aliases:["レーザー","墨出しレーザー","レベルレーザー","グリーンレーザー"],category:"測定・墨出し",meaning:"水平・垂直の基準線をレーザーで投影する測定器。",use:"機器芯、配管レベル、吊り位置、壁天井器具の墨出し。",caution:"定期校正と始業前精度確認を行い、レーザーを直視しない。",image:toolPhotos.laser,source:"https://www.komeri.com/shop/g/g2342465/"},
  {term:"全ねじボルト",aliases:["全ネジ","全ねじ","寸切り","寸切りボルト","長ねじ","吊りボルト","ズンギリ"],category:"支持金物",meaning:"軸全体にねじが切られた棒状ボルト。",use:"配管・ダクト・機器・架台の吊り支持。W3/8、W1/2、M10、M12など。",caution:"重量だけでなくアンカー、ナット、座金、座屈、偏心、地震力を一体で確認。",image:toolPhotos.rod,source:"https://www.akagi-nt.co.jp/seihin_guide/"},
  {term:"ウォーターポンププライヤー",aliases:["アンギラ","ポンプラ","ウォポン","水道プライヤー"],category:"工具",meaning:"口開きを段階調整できるプライヤー。",use:"ナット、継手、排水金物などをつかむ。",caution:"仕上げ面を傷つけやすく、本締めの専用工具ではない。",image:toolPhotos.monkey,source:"https://www.monotaro.com/"},
  {term:"ラチェットレンチ",aliases:["ラチェット","ガチャ","ガチャレンチ","シノ付き"],category:"工具",meaning:"往復動作でボルトを連続して回せるレンチ。",use:"吊り金物、フランジ、架台のナット締め。",caution:"サイズ違いと過大な延長を避け、最終締付けは指定工具で。",image:toolPhotos.monkey,source:"https://www.monotaro.com/"},
  {term:"高速切断機",aliases:["高速カッター","高速","砥石切断機"],category:"電動工具",meaning:"回転砥石で鋼材を切断する据置工具。",use:"アングル、チャンネル、全ねじ等の切断。",caution:"火花・火気養生、保護具、砥石期限・亀裂、切粉飛散を確認。",image:toolPhotos.impact,source:"https://www.makita.co.jp/product/"},
  {term:"レシプロソー",aliases:["セーバーソー","レシプロ","電動ノコ"],category:"電動工具",meaning:"刃を往復させて管・鋼材・木材を切断する工具。",use:"改修配管の撤去、狭所切断。",caution:"隠蔽配線・配管と刃先の突き抜け、切断物の落下に注意。",image:toolPhotos.impact,source:"https://www.makita.co.jp/product/"},
  {term:"あと施工アンカー",aliases:["アンカー","打込みアンカー","オールアンカー","ケミカルアンカー"],category:"支持・躯体",meaning:"硬化したコンクリートへ穿孔して設置するアンカーの総称。",use:"吊り元、機器・架台・支持金物の固定。",caution:"製品ごとに許容荷重、母材厚、へりあき、埋込み、清掃、施工資格が異なる。",image:toolPhotos.rod,source:"https://www.okabe.co.jp/products/001181.html"},
  {term:"インサート",aliases:["吊りインサート","埋込金物","先付けインサート"],category:"支持・躯体",meaning:"コンクリート打設前に埋め込む吊り・固定用金物。",use:"配管・ダクト・機器の吊り元。",caution:"配筋・デッキとの固定、位置ずれ、種類、埋込み方向を打設前検査。",image:toolPhotos.rod,source:"https://www.akagi-nt.co.jp/seihin_guide/"},
  {term:"チャンネル",aliases:["溝形鋼","Cチャン","槽鋼","軽量チャンネル"],category:"鋼材・架台",meaning:"断面がコの字形の鋼材。軽量形鋼と一般構造用形鋼は別物。",use:"配管架台、機器架台、支持材。",caution:"呼称だけで発注せず、高さ×幅×厚さ、材質、表面処理を指定。",image:toolPhotos.rod,source:"https://www.jisf.or.jp/"},
  {term:"アングル",aliases:["山形鋼","Lアングル","L鋼","山形"],category:"鋼材・架台",meaning:"断面がL字形の鋼材。",use:"小型架台、ブラケット、補強。",caution:"辺長×辺長×厚さ、材質、めっき・塗装、溶接方法を明記。",image:toolPhotos.rod,source:"https://www.jisf.or.jp/"},
  {term:"振れ止め",aliases:["耐震振れ止め","ブレース","斜材","耐震支持"],category:"耐震",meaning:"配管・ダクト・機器の地震時横揺れを抑える斜材・支持。",use:"長い吊り、主管、大型ダクト、吊り機器に設置。",caution:"取付間隔・方向・吊り長さ・設計用水平震度は特記と耐震計算を優先。",image:toolPhotos.rod,source:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
  {term:"スリーブ",aliases:["ボイド","貫通スリーブ","紙ボイド","鋼製スリーブ"],category:"建築取り合い",meaning:"壁・床・梁などに配管やダクトの貫通孔を確保する筒・型枠。",use:"躯体打設前の開口確保、止水、防火区画貫通。",caution:"構造承認、補強、離隔、防水つば、区画認定を施工前に確認。",image:toolPhotos.rod,source:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
  {term:"コア抜き",aliases:["コア","コア穿孔","ダイヤモンドコア"],category:"建築取り合い",meaning:"ダイヤモンドコアで既存コンクリートへ円形孔をあける作業。",use:"配管・ダクト・配線の後施工貫通。",caution:"構造承認、鉄筋探査、埋設物、汚泥・漏水、区画復旧を確認。",image:toolPhotos.cutter,source:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
  {term:"養生",aliases:["床養生","器具養生","マスカー","ノンスリップ養生"],category:"施工管理",meaning:"完成品や周囲を傷・汚れ・水・火花から保護すること。",use:"搬入経路、床、壁、機器、衛生器具、塗床の保護。",caution:"避難経路や消火設備を塞がず、濡れ・つまずき・可燃物を管理。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {term:"相番",aliases:["あいばん","合番","立会い作業"],category:"現場用語",meaning:"他職種の作業に合わせて設備側が立ち会い、補助・確認すること。",use:"コンクリート打設、揚重、区画閉塞、機器搬入など。",caution:"相番範囲、時間、責任分界、必要人数を事前に工程へ入れる。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {term:"逃げ墨",aliases:["返り墨","オフセット墨","控え墨"],category:"測定・墨出し",meaning:"施工で消える基準位置から一定距離離して残す基準墨。",use:"壁芯、機器芯、配管芯、床レベルの復元。",caution:"離した寸法と方向を明記し、建築基準墨との整合を確認。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/kenchiku_hyoushi.html"},
  {term:"天端",aliases:["てんば","上端","トップレベル"],category:"建築用語",meaning:"部材・基礎・床などの最上面。",use:"機器基礎天端、配管架台天端、コンクリート天端高さ。",caution:"FL・SL・GLのどの基準からの高さか必ず併記。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/kenchiku_hyoushi.html"},
  {term:"FL・SL・GL",aliases:["フロアレベル","スラブレベル","グランドレベル","基準レベル"],category:"図面用語",meaning:"FLは仕上床、SLは躯体床、GLは地盤面の基準高さ。",use:"器具、配管、スリーブ、基礎、排水勾配の高さ管理。",caution:"現場や図面で定義が違う場合があるため設計凡例を優先。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/kenchiku_hyoushi.html"},
  {term:"納まり",aliases:["おさまり","ディテール","取り合い"],category:"施工管理",meaning:"複数部材・職種が接する部分の位置、順序、仕上がり方。",use:"天井器具、壁貫通、床排水、架台、防水、点検口の調整。",caution:"平面図だけで決めず断面・詳細・施工順序と工事区分まで確認。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/gobuild_tk4_000021.html"},
  {term:"縁切り",aliases:["絶縁","電食防止","異種金属絶縁"],category:"配管・防食",meaning:"異種金属や振動・熱を直接伝えないよう材料を介して分離すること。",use:"SUS管と鋼製支持、異種管接続、防振、建築仕上げとの分離。",caution:"流体・温度・屋内外条件に合う絶縁材と連続性を確認。",image:toolPhotos.rod,source:"https://www.akagi-nt.co.jp/seihin_guide/"},
  {term:"芯出し",aliases:["センター出し","アライメント","心出し"],category:"据付",meaning:"機器や軸、配管の中心線・水平・位置を設計値へ合わせる作業。",use:"ポンプ、送風機、架台、配管、ダクトの据付。",caution:"基礎硬化、アンカー、レベル、カップリング、配管荷重を総合確認。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {term:"グラウト",aliases:["無収縮モルタル","充填モルタル","ベースグラウト"],category:"据付",meaning:"機器ベースと基礎の隙間へ充填し、荷重を均等に伝える材料。",use:"ポンプ・送風機・重量機器・鋼製架台の基礎。",caution:"材料、厚さ、型枠、空隙、養生、強度発現後の本締め時期を確認。",image:toolPhotos.rod,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {term:"先行配管",aliases:["先行逃げ","埋設先行","壁内先行","天井内先行"],category:"工程",meaning:"仕上げや他職種で作業できなくなる前に配管・スリーブ等を施工すること。",use:"床埋設、壁内、天井内、厨房、防水部、機器基礎周り。",caution:"最新版図面、閉塞日、試験、写真、変更対応を事前に確認。",image:toolPhotos.pipe,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {term:"隠蔽検査",aliases:["閉塞前検査","天井内検査","壁内検査","中間検査"],category:"検査",meaning:"天井・壁・床で見えなくなる前に施工状態を確認する検査。",use:"配管接合、支持、保温、区画処理、試験、写真の確認。",caution:"検査合格・記録完了前に建築へ閉塞許可を出さない。",image:toolPhotos.laser,source:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
];
const officialSources={
  mlit:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html",
  akagi:"https://www.akagi-nt.co.jp/seihin_guide/seihin_guide.htm",
  kitz:"https://www.kitz.co.jp/reference/",
  sekisui:"https://www.sekisui.co.jp/search/detail-0711.html",
  jfe:"https://www.jfe-steel.co.jp/products/koukan/use.php",
  onk:"https://www.onk-net.co.jp/ja/product/nicejoint-x/",
  zlok:"https://www.kuwana-metals.com/download/cad/pdf.html",
};
const glossary=(term:string,aliases:string[],category:string,meaning:string,use:string,caution:string,source:string):GlossaryItem=>({term,aliases,category,meaning,use,caution,image:"",source});
const extraGlossaryItems:GlossaryItem[]=[
  glossary("SGP",["白ガス","黒ガス","ガス管","配管用炭素鋼鋼管"],"配管材","比較的低い圧力の水・空気・蒸気・油・ガス等に用いるJIS G 3452鋼管。","白管は亜鉛めっき、黒管はめっきなし。用途と腐食条件で選ぶ。","上水道用、圧力・温度条件、白黒の混同に注意。",officialSources.jfe),
  glossary("STPG",["圧力配管用炭素鋼鋼管","圧力管","スケジュール管"],"配管材","圧力配管に使うJIS G 3454鋼管。肉厚をSchで指定する。","蒸気・高圧空気・機械室配管など。","材質記号、Sch、設計圧力温度を承認図と一致させる。",officialSources.jfe),
  glossary("VP管",["VP","硬質塩ビ管","塩ビパイプ"],"配管材","肉厚の硬質ポリ塩化ビニル管。圧力配管や排水で使われる。","給排水・空調ドレン等。継手は用途によりTS・DVを区別。","蒸気・高温流体には使用しない。",officialSources.sekisui),
  glossary("VU管",["VU","薄肉塩ビ管","排水VU"],"配管材","主に無圧排水・通気に使う薄肉の硬質塩ビ管。","排水横枝・通気・埋設排水。","ポンプ吐出など圧力の掛かる用途へ安易に使わない。",officialSources.sekisui),
  glossary("HIVP管",["HI管","HIVP","耐衝撃性塩ビ管"],"配管材","耐衝撃性を高めた硬質ポリ塩化ビニル管。","給水引込、小口径給水、条件を満たすポンプアップ管。","HI継手・指定接着剤を使用し、圧力と温度を確認。","https://www.sekisui.co.jp/search/detail-2662.html"),
  glossary("HTVP管",["HT管","耐熱塩ビ","HTVP"],"配管材","高温水向けの耐熱性硬質ポリ塩化ビニル管。","排水・工業用途など設計指定箇所。","給湯・飲料水への採用可否と温度圧力を確認。",officialSources.sekisui),
  glossary("一般配管用ステンレス鋼鋼管",["Su管","薄肉SUS","SUS管","モルコ管"],"配管材","JIS G 3448の薄肉ステンレス管。A呼びとSu呼びを区別する。","給水・給湯・冷温水等の専用継手システム。","継手メーカー、適用流体、パッキンを混用しない。",officialSources.mlit),
  glossary("ナイスジョイント",["NJ","ナイス","拡管式継手"],"継手","Su管を専用工具で拡管して接続するステンレス配管システム。","給水・給湯・冷温水等。","純正工具・継手・パッキンと施工要領を統一。",officialSources.onk),
  glossary("ZlokⅡ",["Zロック2","Zlok2","ゼットロック"],"継手","一般配管用ステンレス管用のメカニカル継手システム。","給水・給湯・空調配管等の適用範囲内。","ナイスジョイント等の別システム部品と混用しない。",officialSources.zlok),
  glossary("エルボ",["L","曲がり","ベンド","90L","45L"],"継手","配管の方向を変える継手。90度・45度などがある。","配管の曲がり部。","流体方向、圧力損失、排水勾配、溶接余長を確認。",officialSources.mlit),
  glossary("チーズ",["T","ティー","三方継手","径違いチーズ"],"継手","主管から枝管を分岐するT形継手。","同径・異径分岐。","向き、枝径、流れ、ドレン・エア溜まりを確認。",officialSources.mlit),
  glossary("レジューサ",["異径継手","レデューサ","同心","偏心"],"継手","管径を変更する継手。同心形と偏心形がある。","ポンプ吸込、機器接続、主管径変更。","偏心の平側方向を用途に合わせ、エア溜まりを防ぐ。",officialSources.mlit),
  glossary("ソケット",["カップリング","継手ソケット","ねじソケット"],"継手","同じ呼び径の管を直線接続する継手。","ねじ・接着・溶接・専用継手での直管接続。","おねじ・めねじ、TS・DV、材質を区別する。",officialSources.sekisui),
  glossary("ユニオン",["ユニオン継手","三つ組継手"],"継手","配管を回さず分解できる三分割構造の継手。","機器・弁の取外しが必要な小口径配管。","パッキン材質、流体、取付方向、締付けを確認。",officialSources.mlit),
  glossary("ニップル",["パイプニップル","両ねじニップル","長ニップル"],"継手","両端におねじを加工した短管。","ねじ込み継手・弁・機器間の接続。","長さ、白黒、材質、ねじ規格を発注時に指定。",officialSources.akagi),
  glossary("フランジ",["F","フランジ継手","5K","10K","20K"],"継手","ボルトとガスケットで着脱可能に接続する円盤状継手。","弁・機器・配管の接続。","圧力等級、材質、RF/FF、ガスケット、ボルトを一式照合。",officialSources.mlit),
  glossary("ゲート弁",["仕切弁","スルース弁","ゲートバルブ"],"バルブ","板状の弁体を上下して全開・全閉する弁。","配管系統の遮断。","中間開度での流量調整に使わない。","https://www.kitz.co.jp/product/ggc/"),
  glossary("グローブ弁",["玉形弁","ストップ弁","グローブバルブ"],"バルブ","弁体を弁座へ上下させ、遮断や流量調整を行う弁。","蒸気・温水等の遮断・調整。","流れ方向、圧力損失、弁座材質を確認。","https://www.kitz.co.jp/reference/structure/globevalve/"),
  glossary("ボール弁",["ボールバルブ","ボールコック"],"バルブ","穴の開いた球を90度回転して開閉する弁。","小口径配管の素早い全開・全閉。","シート材の温度圧力限界と禁油仕様を確認。","https://www.kitz.co.jp/reference/structure/ballvalve/"),
  glossary("バタフライ弁",["バタ弁","蝶形弁","バタフライバルブ"],"バルブ","円盤状の弁体を回転して開閉・調整する弁。","中大口径の空調・給排水配管。","弁体と相手配管の干渉、取付方向、ギヤ操作空間を確認。",officialSources.kitz),
  glossary("チャッキ弁",["逆止弁","チェック弁","ノンリターンバルブ"],"バルブ","逆流を自動的に防止する弁。","ポンプ吐出、給水、蒸気還水等。","取付姿勢、最低流速、ウォーターハンマを確認。","https://www.kitz.co.jp/reference/structure/checkvalve/"),
  glossary("ストレーナ",["こし器","Y形ストレーナ","バケットストレーナ"],"バルブ","流体中の異物をスクリーンで捕集する機器。","弁・減圧弁・ポンプ・機器の上流。","網を抜ける空間、ブロー方向、清掃頻度を確保。",officialSources.kitz),
  glossary("減圧弁",["レデューシングバルブ","PRV","蒸気減圧弁"],"バルブ","一次側圧力を設定した二次側圧力へ下げる自力式等の弁。","蒸気・給水・空気の圧力調整。","流量、減圧比、前後直管、安全弁、騒音を計算。",officialSources.mlit),
  glossary("吊りバンド",["タンバックル","提灯バンド","吊バンド"],"支持金物","配管を全ねじボルト等から吊るための帯状金具。","横引き配管の一般支持。","管種、外径、保温厚、表面処理、支持間隔を合わせる。",officialSources.akagi),
  glossary("立バンド",["立管バンド","壁バンド","立てバンド"],"支持金物","立管を壁や架台へ固定・振れ止めする金具。","立管の重量支持・横振れ防止。","重量を受ける支持と振れ止めを区別する。",officialSources.akagi),
  glossary("Uボルト",["Uバンド","U字金具","ユー ボルト"],"支持金物","架台上の管をU字形ボルトで保持する金具。","露出配管・機械室・屋外架台。","締め過ぎ、保温潰れ、熱伸縮の拘束に注意。","https://www.akagi-nt.co.jp/seihin_guide/p0109.htm"),
  glossary("ローラーバンド",["ローラー吊り","ころ支持","ローラー支持"],"支持金物","管の軸方向移動を許容するローラー付き支持金具。","蒸気・温水など熱伸縮する横引き管。","固定点・ガイド・伸縮量と組み合わせて配置。",officialSources.akagi),
  glossary("三連タンバックル",["3連タンバックル","三連吊り","チェーンターンバックル"],"支持金物","三つの可動部で管の移動へ追従させる吊り金具。","熱伸縮のある蒸気管等。","固定支持の代用にせず、荷重と変位を確認。",officialSources.akagi),
  glossary("パイプシュー",["配管シュー","シュー","サドルシュー"],"支持金物","管や保温材を架台上で支持し荷重を伝える部材。","高温管・保温管・重量配管。","シュー高さ、滑り板、溶接可否、保温切欠きを確認。",officialSources.akagi),
  glossary("スパイラルダクト",["スパイラル","丸ダクト","螺旋ダクト"],"ダクト","帯鋼をらせん状に成形した円形ダクト。","給気・還気・排気・換気。","板厚、シール、支持、継手、用途別気密を確認。",officialSources.mlit),
  glossary("共板フランジダクト",["共板","TDC","TFD","角ダクト"],"ダクト","ダクト端部を本体板から成形した角ダクト接続方式。","一般空調・換気ダクト。","圧力区分、コーナー、ガスケット、クリップ間隔を確認。",officialSources.mlit),
  glossary("アングルフランジダクト",["アングルダクト","山形鋼フランジ","Lフランジ"],"ダクト","山形鋼フランジをダクト端部へ取り付ける接続方式。","大形・高圧・排煙等の設計指定ダクト。","溶接、ボルト、ガスケット、塗装、防火仕様を確認。",officialSources.mlit),
  glossary("防火ダンパー",["FD","ファイヤーダンパー","防火ダンパ"],"ダクト","火災時に温度ヒューズ等で閉鎖し、火炎の拡大を抑えるダンパー。","防火区画を貫通するダクト等。","認定・法令、点検口、作動方向、復帰操作を確認。",officialSources.mlit),
  glossary("風量調整ダンパー",["VD","VCD","ボリュームダンパー"],"ダクト","羽根角度を変えてダクト風量を調整するダンパー。","枝ダクト・吹出口系統の風量調整。","調整ハンドルと点検口を隠さない。",officialSources.mlit),
  glossary("キャンバス継手",["たわみ継手","フレキシブルジョイント","キャンバス"],"ダクト","機器振動やわずかな芯ずれをダクトへ伝えにくくする柔軟継手。","送風機・空調機とダクトの接続部。","ダクト荷重や大きな芯ずれを負担させない。",officialSources.mlit),
  glossary("全熱交換器",["全熱","ロスナイ","ERV","熱交換換気扇"],"空調機器","給気と排気の間で温度・湿度の一部を回収する換気機器。","外気負荷低減を伴う換気。","OA・SA・RA・EAの誤接続、フィルター点検、結露を確認。",officialSources.mlit),
  glossary("ファンコイルユニット",["FCU","ファンコイル"],"空調機器","冷温水コイルとファンで室内を冷暖房する端末機器。","客室・事務室等の個別空調。","ドレン勾配、弁点検口、フィルター抜き代を確保。",officialSources.mlit),
  glossary("ドレンアップ",["ドレンポンプ","揚水ドレン","ドレンアップメカ"],"空調機器","重力排水できない室内機の凝縮水をポンプで持ち上げる機構。","天井カセット・隠ぺい形室内機。","許容揚程、立上り位置、逆流、試運転排水を確認。",officialSources.mlit),
  glossary("封水トラップ",["Pトラップ","Sトラップ","ドレントラップ","臭気止め"],"排水・衛生","水を溜めて下水臭や空気の逆流を防ぐ曲管・器具。","衛生器具・空調機ドレン・排水系統。","封水深、負圧正圧、二重トラップ、蒸発を確認。",officialSources.mlit),
  glossary("掃除口",["CO","クリーンアウト","床上掃除口"],"排水・衛生","排水管内を清掃・点検するための開口。","曲がり、立管基部、長い横主管等。","ふたを仕上げや機器で塞がず、清掃工具の作業空間を確保。",officialSources.mlit),
  glossary("通気弁",["エアアドミッタンスバルブ","ドルゴ通気弁","吸気弁"],"排水・衛生","排水時の負圧で空気を吸入し、封水破壊を抑える弁。","伸頂通気を補完する設計指定箇所。","正圧を逃がす弁ではない。点検・交換可能にする。",officialSources.mlit),
  glossary("グリース阻集器",["グリストラップ","GT","油脂分離槽"],"排水・衛生","厨房排水から油脂と残さを分離する槽。","厨房流し・調理機器排水。","容量、清掃動線、通気、防臭、ふた荷重を確認。",officialSources.mlit),
  glossary("屋内消火栓箱",["消火栓ボックス","消火栓箱","1号消火栓","2号消火栓"],"消防設備","開閉弁・ホース・ノズル等を収納し初期消火に使う箱。","廊下等の消防計画位置。","開閉弁操作部の高さ、前面空間、表示灯、ポンプ連動を確認。","https://www.fdma.go.jp/laws/tutatsu/items/tuchi2507/pdf/siken-kijun.pdf"),
  glossary("スプリンクラーヘッド",["SPヘッド","スプリンクラー","ヘッド"],"消防設備","火災の熱で感熱部が作動し散水する放水口。","天井・倉庫等の防護対象。","感度種別、設置間隔、散水障害、塗装・衝撃を避ける。","https://www.fdma.go.jp/laws/tutatsu/"),
  glossary("アラーム弁",["流水検知装置","アラームチェック弁","流水検知弁"],"消防設備","スプリンクラー配管の流水を検知して警報・ポンプ系統へ信号を出す装置。","スプリンクラー系統の区画ごと。","設置方向、排水、試験弁、圧力計、点検空間を確認。","https://www.fdma.go.jp/laws/tutatsu/"),
  glossary("トルクレンチ",["トルクレンチ","締付トルク管理","トルク管理"],"工具","設定した締付け力でボルト・ナットを締める測定工具。","フランジ、アンカー、機器、継手の規定締付け。","校正期限、単位、締付け順序を確認し緩め作業に常用しない。",officialSources.mlit),
  glossary("ハンマードリル",["振動ドリル","ロータリーハンマー","ハツリ機"],"電動工具","回転と打撃でコンクリート等を穿孔する工具。","あと施工アンカー・支持金物の穿孔。","鉄筋・埋設物探査、集じん、指定径・深さ、保護具を徹底。",officialSources.mlit),
  glossary("真空ポンプ",["冷媒真空ポンプ","真空引きポンプ","バキュームポンプ"],"冷媒工具","冷媒配管内の空気と水分を除去するポンプ。","冷媒配管の気密試験後の真空乾燥。","真空度を測定し、ポンプ停止後の保持確認を行う。",officialSources.mlit),
  glossary("フレアツール",["フレア加工機","フレアリングツール","ラッパ加工"],"冷媒工具","銅管端部を円すい状に広げる専用工具。","小口径冷媒管のフレア接続。","管径、突出し寸法、偏心、割れ、規定トルクを確認。",officialSources.mlit),
  glossary("窒素調整器",["窒素レギュレーター","窒素ゲージ","窒素減圧器"],"冷媒工具","窒素ボンベ圧を気密試験・ろう付け用圧力へ調整する器具。","窒素置換ろう付け、耐圧・気密試験。","酸素を代用しない。調整器の圧力範囲とホース耐圧を確認。",officialSources.mlit),
];
const allGlossaryItems=[...glossaryItems,...extraGlossaryItems,...comprehensiveGlossaryItems]
  .filter((item,index,items)=>items.findIndex(x=>x.term===item.term)===index);
const glossaryIcon=(category:string)=>({"工具":"🔧","電動工具":"⚙️","冷媒工具":"❄️","配管材":"▰","継手":"↪","バルブ":"◉","支持金物":"⌁","ダクト":"▱","空調機器":"❄","排水・衛生":"◌","消防設備":"⚠"}[category]||"▦");
type Coordination = {
  name: string;
  group: string;
  timing: string;
  before: string[];
  work: string[];
  after: string[];
  confirm: string[];
  stop: string;
};
const coordinationItems: Coordination[] = [
  {name:"LGS天井",group:"天井",timing:"LGS下地組み前に先行配管・吊り込み、下地組み後〜ボード張り前に位置と高さを確定",before:["天井基準墨・仕上げ高さ・ふところ寸法の確認","機器、器具、点検口、照明、感知器の割付調整","インサート・吊りボルト・振れ止めを施工"],work:["主配管・ダクトと天井内機器を先行施工","LGS組み後に器具芯・開口寸法を再確認","ボード張り前に漏水、通水、気密、写真を完了"],after:["開口位置を建築へ返却","ボード開口後に器具・制気口・化粧パネル取付","天井内検査後に閉塞許可"],confirm:["天井伏図の最新版と割付基準","天井高さ・段差・下がり天井の範囲","点検口の位置・寸法・誰が施工するか","機器重量に対する補強と吊り元","ボード開口・補強・開口塞ぎの工事区分","天井内の防火区画・防煙垂壁・耐震クリアランス"],stop:"天井伏図未承認、点検口位置未確定、吊り元強度不明のまま吊り込まない。"},
  {name:"システム天井",group:"天井",timing:"グリッド割付決定後に位置確定。天井材・Tバー施工前に天井内設備を完了",before:["基準グリッド、モジュール、天井高さを承認","照明・空調・スプリンクラー・感知器の配置統合","設備荷重を天井グリッドから独立支持"],work:["天井内配管・ダクト・機器を先行","Tバー施工前に吊り位置と器具芯を建築へ返却","天井材を外さず保守できる点検動線を確保"],after:["Tバー施工後にグリッド芯を実測","天井パネルに合わせ器具・吹出口を取付","汚損・傷を防ぐ最終養生"],confirm:["メーカーとシステム天井の型式・モジュール","設備プレート・専用パネルの手配区分と納期","設備器具の独立吊り・落下防止方法","Tバー補強と開口加工の可否","壁際端数パネルと器具寄せ寸法","点検時のパネル脱着範囲"],stop:"グリッド割付確定前に器具芯を決めない。設備をTバーへ直接荷重させない。"},
  {name:"在来天井・直天井",group:"天井",timing:"躯体墨確認後にインサート・配管。仕上げ塗装前に器具位置を確定",before:["躯体レベルと仕上げ厚を確認","露出配管の通り・色・支持金物を承認","あと施工アンカーの使用可否確認"],work:["配管・支持を施工し通りを整える","塗装範囲と設備先付け／後付けを調整","試験と隠蔽前写真を実施"],after:["塗装完了後に器具・化粧部品を取付","傷・汚れを補修確認"],confirm:["露出仕上げ範囲と塗装色","アンカー位置・穿孔深さ・鉄筋探査","設備貫通部の化粧方法","結露水・ドレンの見え掛かり処理"],stop:"構造体への穿孔承認前、塗装区分未確定のまま施工しない。"},
  {name:"塗床",group:"床",timing:"配管・機器基礎・排水口を先行完了し、漏水試験後に塗床。器具据付は塗床硬化後",before:["床排水勾配・排水口高さ・巾木納まりを確認","床貫通、アンカー、基礎、配管を完了","漏水・通水試験と施工写真を完了"],work:["塗床前に設備開口を養生・封止","塗床施工中は立入・火気・水使用を停止","硬化条件と養生期間を共有"],after:["完全硬化後に機器・衛生器具を据付","アンカー穿孔部を指定材で防水処理","排水口周囲の膜厚・立上りを検査"],confirm:["塗床材の種類、厚さ、施工日、歩行／重歩行可能日","設備基礎と塗床の先後・立上り範囲","排水金物のつば形状と仕上げ高さ","アンカー後施工の可否と補修方法","水張り試験の範囲と合格記録","設備作業による傷の補修責任区分"],stop:"試験未完了、床貫通未完了、塗床硬化前は器具据付・台車搬入・水使用禁止。"},
  {name:"防水床・タイル床",group:"床",timing:"スリーブ・排水金物を防水前に固定。防水試験合格後、仕上げ完了後に器具据付",before:["床排水・掃除口・スリーブの位置と高さ確定","防水層と排水金物つばの納まり承認","配管固定と貫通部下地を完了"],work:["防水施工前の設備検査を受ける","防水層を傷つけないよう養生","水張り試験中は設備側も漏れを確認"],after:["タイル仕上げ高さを実測して器具接続","アンカーは防水指定工法で施工","器具周囲シールと排水勾配を確認"],confirm:["防水仕様・立上り高さ・水張り時間","排水金物と防水の責任施工区分","タイル割付と器具芯・排水芯","床貫通部の防水納まり","後施工アンカー禁止範囲","浴槽・便器・架台下の仕上げ範囲"],stop:"防水後の無断穿孔禁止。水張り試験合格前に防水を隠さない。"},
  {name:"OAフロア・二重床",group:"床",timing:"床下配管は支持脚割付前に施工。パネル敷設前に試験・清掃・写真を完了",before:["床高さ、支持脚グリッド、耐荷重を確認","配管ルートと床コンセントを統合調整","漏水時の排水・検知方法を確認"],work:["支持脚と干渉しない低いルートで施工","継手・弁・掃除口を点検可能位置へ配置","パネル閉塞前検査を実施"],after:["開口パネルと器具位置を実測","パネル脱着性と保守スペース確認"],confirm:["OA床メーカー・高さ・脚ピッチ","パネル開口と補強の施工区分","重量機器の独立基礎・補強","床下区画貫通と防火処理","水配管を床下に通す可否","予備パネルと将来保守動線"],stop:"支持脚割付未入手、漏水対策未承認のまま床下配管を進めない。"},
  {name:"LGS壁・ボード壁",group:"壁",timing:"片面ボード張り後〜反対面閉塞前に壁内配管・器具下地・試験を完了",before:["壁芯・仕上げ厚・建具位置を確認","器具高さと給排水芯を承認","補強板・スタッド補強を建築へ依頼"],work:["スタッドを避けて壁内配管","防火・遮音壁の開口補強と充填を施工","閉塞前に通水・写真・寸法記録"],after:["仕上げ面から芯と出寸法を確認","器具取付後にシール・補修"],confirm:["壁種・耐火／遮音性能・ボード枚数","器具下地の材質・寸法・耐荷重","壁開口と補強の施工区分","ライニング内点検口の位置","配管出寸法と仕上げ厚","建具・手すり・家具との干渉"],stop:"器具下地未施工、壁性能不明、反対面閉塞後は壁内施工を開始しない。"},
  {name:"コンクリート壁・床貫通",group:"躯体",timing:"施工図承認後、配筋前にスリーブ。コンクリート打設前に位置・固定を検査",before:["構造図と設備スリーブ図を照合","梁・柱・耐震壁の貫通可否を構造確認","スリーブ径・間隔・補強筋を確定"],work:["配筋後に芯、高さ、垂直、固定を全数確認","打設中の監視担当と予備材を手配","打設後すぐに詰まり・ずれを確認"],after:["実測位置を記録し施工図へ反映","ずれ・閉塞は無断斫りせず是正承認"],confirm:["構造設計者承認済みスリーブ図","補強筋・開口補強の施工区分","型枠基準墨と打設日程","防水つば・止水材の仕様","区画種別と認定工法の必要開口","打設中の設備立会い時間"],stop:"構造承認なしの梁・柱・耐震壁貫通、打設後の無断コア抜き・斫りは禁止。"},
  {name:"機器基礎・架台",group:"機器",timing:"機器承認図確定後に基礎図を建築へ返却。基礎強度・寸法確認後に搬入据付",before:["機器外形、重量、重心、アンカー、保守寸法を確定","基礎寸法・高さ・防振・排水を調整","搬入経路と揚重計画を承認"],work:["基礎の芯・天端・水平・アンカーを受入検査","据付後にレベル・芯・締付を記録","振れ止め・耐震支持を施工"],after:["グラウト・シール・基礎仕上げを完了","配管荷重を機器へ掛けず接続","試運転前に保守空間を再確認"],confirm:["機器承認図の最終版と納入重量","基礎・架台・アンカーの工事区分","コンクリート強度と据付可能日","防振材の沈み代と基礎高さ","ドレン・排水溝・防水納まり","更新搬出入・扉開放・フィルター交換空間"],stop:"承認図未確定、基礎強度未確認、搬入経路未承認では搬入据付しない。"},
  {name:"外壁・屋上防水",group:"外部",timing:"防水施工前にスリーブ・架台・配管支持基礎を完了。防水完了後は指定工法以外の穿孔禁止",before:["貫通位置、雨仕舞、防水立上りを承認","支持架台・防水つば・ドレンを先行","外壁材割付とベントキャップ位置を調整"],work:["防水前検査と写真を実施","防水端部・貫通部を責任施工で納める","外壁閉塞前にダクト・スリーブを検査"],after:["散水／水張り試験を確認","シール材・端部押え・保護カバーを検査"],confirm:["防水・外壁メーカーの標準納まり","貫通部シールの責任施工者","架台基礎と防水立上り高さ","外壁開口補強と下地位置","結露・雨水侵入時の排水経路","将来更新時の防水復旧方法"],stop:"防水・外壁完了後の無断穿孔禁止。雨仕舞詳細未承認で貫通材を固定しない。"},
  {name:"防火区画・防煙区画",group:"区画",timing:"壁・床の区画仕様確定後に認定工法を選定。閉塞前に施工・表示・写真・検査",before:["区画線、壁床仕様、貫通物と開口寸法を確認","適用範囲内の認定工法・材料を手配","施工スペースと増し張り順序を調整"],work:["認定書どおりに充填・支持・離隔を施工","施工前中後の写真とロットを記録","片側が閉じる前に相互検査"],after:["認定表示・貫通番号を取付","天井内・シャフト閉塞前に全数検査"],confirm:["最新版の防火区画図・防煙区画図","壁床の構成・厚さ・中空寸法","認定番号と適用管種・管径・保温材","開口補強・増し張り・塞ぎの工事区分","区画壁の先行／後施工順序","検査者・写真要領・表示ルール"],stop:"区画仕様不明、認定範囲外、写真未撮影のまま閉塞しない。"},
];
type Preset={name:string;category:string;unit:string;rate:string;crew:string;range:string;scope:string};
const presets:Preset[] = [
  {name:"冷媒管施工",category:"配管・ダクト",unit:"m",rate:"0.080",crew:"2",range:"0.05～0.15",scope:"管加工・接合・支持。保温、試験、足場は条件確認。"},
  {name:"SGP配管施工",category:"配管・ダクト",unit:"m",rate:"0.100",crew:"2",range:"0.08～0.40",scope:"小口径の一般部目安。管径・接合・場所で大きく変動。"},
  {name:"VP配管施工",category:"配管・ダクト",unit:"m",rate:"0.060",crew:"2",range:"0.04～0.15",scope:"屋内一般部の加工・接着・支持。土工は別。"},
  {name:"角ダクト施工",category:"配管・ダクト",unit:"m2",rate:"0.090",crew:"3",range:"0.06～0.18",scope:"搬入済みダクトの組立・吊込み。足場・保温別。"},
  {name:"丸ダクト施工",category:"配管・ダクト",unit:"m",rate:"0.070",crew:"2",range:"0.05～0.15",scope:"スパイラルダクトの吊込み・接続。大径は補正。"},
  {name:"配管保温",category:"配管・ダクト",unit:"m",rate:"0.050",crew:"2",range:"0.03～0.15",scope:"直管部中心。曲がり・弁・屋外ラッキング別補正。"},
  {name:"ダクト保温",category:"配管・ダクト",unit:"m2",rate:"0.070",crew:"2",range:"0.05～0.14",scope:"平面部中心。チャンバー・曲がり・狭所は補正。"},
  {name:"室内機・壁掛形",category:"空調機器",unit:"台",rate:"1.000",crew:"2",range:"0.8～1.2",scope:"本体取付まで。冷媒・ドレン・電気・試運転は別。"},
  {name:"室内機・天井カセット形",category:"空調機器",unit:"台",rate:"1.800",crew:"3",range:"1.5～2.2",scope:"墨出し・吊り金物・本体吊込み・レベル調整。配管・配線別。"},
  {name:"室内機・天井吊形",category:"空調機器",unit:"台",rate:"2.200",crew:"3",range:"1.8～2.8",scope:"吊り金物・本体据付。高所・化粧カバー・配管別。"},
  {name:"室内機・天井埋込ダクト形",category:"空調機器",unit:"台",rate:"2.700",crew:"3",range:"2.0～3.5",scope:"本体吊込みまで。チャンバー・ダクト・点検口・配管別。"},
  {name:"室内機・床置形",category:"空調機器",unit:"台",rate:"1.800",crew:"2",range:"1.5～2.5",scope:"搬入済み本体の据付・固定。基礎・配管・電気別。"},
  {name:"ファンコイル・天井形",category:"空調機器",unit:"台",rate:"1.800",crew:"3",range:"1.4～2.5",scope:"吊込み・固定まで。配管・ドレン・ダクト・電気別。"},
  {name:"ファンコイル・床置形",category:"空調機器",unit:"台",rate:"1.300",crew:"2",range:"1.0～2.0",scope:"据付・固定まで。配管・電気別。"},
  {name:"室外機・小型（～20kW程度）",category:"空調機器",unit:"台",rate:"2.500",crew:"3",range:"2.0～3.5",scope:"搬入済み・基礎完成後の据付。揚重・防振・配管別。"},
  {name:"室外機・中型（20～50kW程度）",category:"空調機器",unit:"台",rate:"4.500",crew:"4",range:"3.0～6.0",scope:"据付・芯出し。100kg以上の搬入揚重、防振基礎は別。"},
  {name:"室外機・大型（50kW超）",category:"空調機器",unit:"台",rate:"7.000",crew:"5",range:"5.0～10.0以上",scope:"据付・芯出し目安。揚重計画、基礎、防振、連結は別途積上げ。"},
  {name:"空調機・小型AHU",category:"空調機器",unit:"台",rate:"5.000",crew:"4",range:"4.0～8.0",scope:"一体搬入品の据付。分割搬入・組立・試運転は別。"},
  {name:"空調機・大型AHU／分割形",category:"空調機器",unit:"台",rate:"12.000",crew:"5",range:"8.0～25.0以上",scope:"仮目安。重量・分割数・組立・搬入経路から個別積上げ必須。"},
  {name:"換気扇・天井埋込形",category:"送風・換気機器",unit:"台",rate:"0.800",crew:"2",range:"0.5～1.2",scope:"本体吊込み・固定。ダクト・電気・点検口別。"},
  {name:"有圧換気扇・壁付",category:"送風・換気機器",unit:"台",rate:"1.200",crew:"2",range:"0.8～2.0",scope:"本体・枠取付。開口補強・フード・電気別。"},
  {name:"送風機・小型（～100kg）",category:"送風・換気機器",unit:"台",rate:"2.500",crew:"3",range:"1.5～4.0",scope:"搬入済み機器の据付・芯出し。基礎・防振・ダクト別。"},
  {name:"送風機・大型（100kg超）",category:"送風・換気機器",unit:"台",rate:"6.000",crew:"4",range:"4.0～12.0以上",scope:"揚重・搬入は別途。重量、駆動方式、防振で個別積上げ。"},
  {name:"大便器・洋風（床置）",category:"衛生器具",unit:"台",rate:"1.200",crew:"2",range:"0.9～1.6",scope:"器具据付・固定・給排水接続・通水確認。下地・電気別。"},
  {name:"大便器・壁掛／ライニング",category:"衛生器具",unit:"台",rate:"2.000",crew:"2",range:"1.5～3.0",scope:"器具取付・接続。フレーム・ライニング下地は条件確認。"},
  {name:"小便器",category:"衛生器具",unit:"台",rate:"1.000",crew:"2",range:"0.8～1.5",scope:"器具取付・給排水接続・通水確認。電気別。"},
  {name:"洗面器・手洗器",category:"衛生器具",unit:"台",rate:"1.000",crew:"2",range:"0.7～1.5",scope:"器具・水栓・排水金具の取付接続。カウンター別。"},
  {name:"洗面カウンター一体形",category:"衛生器具",unit:"台",rate:"2.000",crew:"2",range:"1.5～3.0",scope:"カウンター搬入据付・器具接続。下地補強・加工量で補正。"},
  {name:"掃除流し",category:"衛生器具",unit:"台",rate:"1.200",crew:"2",range:"0.9～1.8",scope:"据付・水栓・排水接続。床壁下地別。"},
  {name:"流し台・シンク",category:"衛生器具",unit:"台",rate:"1.500",crew:"2",range:"1.0～2.5",scope:"搬入据付・水栓排水接続。家具工事・加工別。"},
  {name:"シャワーユニット",category:"衛生器具",unit:"台",rate:"2.500",crew:"2",range:"1.5～4.0",scope:"器具類取付・接続。防水・建築下地・電気別。"},
  {name:"浴槽",category:"衛生器具",unit:"台",rate:"3.000",crew:"3",range:"2.0～5.0",scope:"搬入据付・排水接続。防水・囲い・重量物揚重別。"},
  {name:"水栓・混合栓単体",category:"衛生器具",unit:"個",rate:"0.350",crew:"1",range:"0.2～0.6",scope:"器具取付・接続・漏水確認。改修撤去は補正。"},
  {name:"紙巻器・鏡・手すり等",category:"衛生器具",unit:"個",rate:"0.300",crew:"1",range:"0.15～0.6",scope:"位置出し・固定。下地補強・コア抜き別。"},
  {name:"電気温水器・小型",category:"給排水機器",unit:"台",rate:"1.800",crew:"2",range:"1.2～3.0",scope:"搬入据付・固定。配管・電気・排水処理は別または条件補正。"},
  {name:"給排水ポンプ・小型",category:"給排水機器",unit:"台",rate:"2.000",crew:"2",range:"1.5～3.5",scope:"基礎完成・搬入済みから据付芯出し。配管・電気別。"},
  {name:"ポンプユニット・中型",category:"給排水機器",unit:"台",rate:"4.000",crew:"3",range:"3.0～7.0",scope:"据付芯出し。搬入揚重、防振、配管、電気、試運転別。"},
  {name:"膨張タンク・小型",category:"給排水機器",unit:"台",rate:"1.500",crew:"2",range:"1.0～2.5",scope:"搬入済みタンクの据付固定。架台・配管別。"},
  {name:"受水槽・一体形小型",category:"給排水機器",unit:"台",rate:"5.000",crew:"4",range:"3.0～8.0",scope:"基礎上据付。搬入揚重・配管・電極・保温別。"},
  {name:"FRPパネルタンク・組立",category:"給排水機器",unit:"台",rate:"15.000",crew:"4",range:"10～30以上",scope:"容量・パネル数・現場条件によるためメーカー工数で再設定必須。"},
  {name:"貯湯槽・熱交換器",category:"熱源・重量機器",unit:"台",rate:"6.000",crew:"4",range:"4.0～12.0以上",scope:"搬入済みから据付芯出し。重量物揚重・基礎・配管・保温別。"},
  {name:"ボイラー・小型",category:"熱源・重量機器",unit:"台",rate:"8.000",crew:"4",range:"5.0～15.0",scope:"据付目安。煙道・燃料・給水・蒸気・電気・試運転別。"},
  {name:"重量機器（100～500kg）",category:"熱源・重量機器",unit:"台",rate:"5.000",crew:"4",range:"3.0～8.0",scope:"搬入経路確保済みの据付。揚重機・養生・架台別。"},
  {name:"重量機器（500kg超）",category:"熱源・重量機器",unit:"台",rate:"10.000",crew:"5",range:"8.0～30.0以上",scope:"参考値のみ。重量・重心・搬入揚重計画から個別積上げ必須。"},
  {name:"屋内消火栓箱",category:"消防機器",unit:"台",rate:"2.000",crew:"2",range:"1.5～3.0",scope:"箱・弁・ホース等の据付。配管・建築開口補強別。"},
  {name:"消火ポンプユニット",category:"消防機器",unit:"台",rate:"6.000",crew:"4",range:"4.0～12.0以上",scope:"据付芯出し。揚重・基礎・配管・電気・試運転別。"},
  {name:"耐圧試験",category:"試験",unit:"系統",rate:"1.500",crew:"2",range:"1.0～3.0",scope:"系統規模、充水・排水、立会い、記録で補正。"},
];
type ScopeOption={id:string;label:string;short:string;factor:number;note:string};
const pipeScopes:ScopeOption[]=[
  {id:"delivery",label:"荷下ろし・場内小運搬",short:"搬入・小運搬",factor:.15,note:"車上渡し後の荷下ろし、施工階・施工場所付近までの小運搬。揚重機費は別。"},
  {id:"layout",label:"墨出し・ルート確認",short:"墨出し",factor:.10,note:"基準墨から配管芯、吊り位置、レベル、勾配を出す。"},
  {id:"anchor",label:"アンカー・インサート",short:"アンカー",factor:.20,note:"あと施工アンカーの墨出し・探査・穿孔・清掃・打込み。先付けインサートは打設相番を別確認。"},
  {id:"support",label:"支持金物・吊りボルト",short:"支持金物",factor:.25,note:"全ねじ、吊りバンド、横架材等の組立・取付。耐震振れ止めは別項目。"},
  {id:"fabrication",label:"配管加工・継手接合",short:"加工・接合",factor:.45,note:"採寸、切断、ねじ・溶接・接着・ろう付等の接合。接合方式・口径で補正。"},
  {id:"hanging",label:"配管吊り込み・レベル調整",short:"吊り込み",factor:.30,note:"吊り込み、芯・レベル・勾配調整、支持金物への固定。"},
  {id:"seismic",label:"耐震振れ止め",short:"耐震支持",factor:.25,note:"斜材・固定支持等。耐震計算、重量、吊り長さ、支持間隔で個別補正。"},
  {id:"testing",label:"耐圧・気密・通水試験",short:"試験",factor:.18,note:"加圧、保持、点検、排水、記録。系統分け、立会い、手直しは条件補正。"},
  {id:"insulation",label:"保温・外装",short:"保温",factor:.35,note:"直管中心の保温。弁・継手・屋外ラッキングは追加補正。"},
  {id:"firestop",label:"スリーブ・区画貫通処理",short:"区画処理",factor:.20,note:"開口調整、認定材施工、表示・写真。コア抜き・構造補強は別。"},
];
const equipmentScopes:ScopeOption[]=[
  {id:"delivery",label:"荷下ろし・場内小運搬",short:"搬入・小運搬",factor:.20,note:"車上渡し後、据付場所付近まで。クレーン・フォーク・揚重計画は別積上げ。"},
  {id:"layout",label:"墨出し・位置確認",short:"墨出し",factor:.08,note:"機器芯、基礎芯、天端、保守空間を確認。"},
  {id:"anchor",label:"アンカー・架台固定",short:"アンカー",factor:.18,note:"探査・穿孔・清掃・アンカー施工。基礎・構造耐力は別確認。"},
  {id:"install",label:"本体吊り込み・据付",short:"本体据付",factor:1.00,note:"搬入済み機器の吊り込み、据付、固定、レベル・芯調整。"},
  {id:"seismic",label:"耐震固定・振れ止め",short:"耐震固定",factor:.22,note:"耐震ストッパー、ブレース等。耐震計算・防振との納まりを確認。"},
  {id:"connection",label:"配管・ダクト接続",short:"接続",factor:.35,note:"機器直近の配管・ダクト接続。数量・口径・フレキ等で補正。"},
  {id:"testing",label:"試運転・調整・記録",short:"試運転",factor:.20,note:"単体確認、漏れ・回転方向・測定・記録。メーカー調整は別確認。"},
  {id:"insulation",label:"保温・結露処理",short:"保温",factor:.18,note:"機器接続部・ドレン等の保温復旧。広範囲の保温は別積上げ。"},
];
type Rule = {
  purpose: string;
  pipe: string;
  category: string;
  product: string;
  grade: "推奨" | "条件付" | "要確認";
  note: string;
  maker?: string;
  url?: string;
  linkLabel?: "公式製品ページ" | "公式カタログ一覧" | "公的仕様書";
  linkMatch?: "製品一致" | "製品群一致" | "採用例" | "資料一覧";
  assembly?: { label: string; value: string }[];
  gasket?: string;
};
const rules: Rule[] = [
  {
    purpose: "蒸気",
    pipe: "SGP黒ガス",
    category: "吊り・支持",
    product: "ローラーバンド／ローラー支持",
    grade: "推奨",
    note: "熱伸縮を逃がす箇所に使用。固定点・ガイド・伸縮量は施工図と仕様書で確認。",
  },
  {
    purpose: "蒸気",
    pipe: "SGP黒ガス",
    category: "バルブ",
    product: "鋳鋼製またはダクタイル製グローブ弁・ゲート弁",
    grade: "要確認",
    note: "圧力・温度・口径・フランジ規格に合う蒸気用を選定。ドレン系統は用途を分ける。",
  },
  {
    purpose: "蒸気",
    pipe: "SGP黒ガス",
    category: "継手",
    product: "黒ねじ込み継手／溶接継手／フランジ",
    grade: "条件付",
    note: "口径、圧力、温度、接合方式によって選択。シール材も蒸気温度対応品を確認。",
  },
  {
    purpose: "冷温水",
    pipe: "SGP白ガス",
    category: "吊り・支持",
    product: "吊りバンド・立バンド・Uボルト",
    grade: "推奨",
    note: "保温厚、支持間隔、防振、結露対策を確認。保温配管は木台または断熱支持材を検討。",
  },
  {
    purpose: "冷温水",
    pipe: "SUS",
    category: "吊り・支持",
    product: "SUS用被覆バンド／絶縁支持金具",
    grade: "推奨",
    note: "異種金属との直接接触を避ける。被覆材の使用温度と屋内外条件を確認。",
  },
  {
    purpose: "給水",
    pipe: "SUS",
    category: "バルブ",
    product: "ステンレス製ボール弁・ゲート弁",
    grade: "推奨",
    note: "接続方式、使用圧力、水質、認証の要否を確認。",
  },
  {
    purpose: "給水",
    pipe: "ナイスジョイント",
    category: "継手",
    product: "オーエヌ工業 ナイスジョイントX（拡管式管継手）のエルボ・チー・ソケット等",
    grade: "推奨",
    note: "正しいメーカーはオーエヌ工業。SAS認定範囲、指定管・専用工具・挿入長・施工手順に従う。異種管接続は専用品を確認。",
  },
  {
    purpose: "給水",
    pipe: "ZlokⅡ",
    category: "継手",
    product: "桑名金属工業 ZlokⅡ（屋内ステンレス配管用メカニカル継手）のエルボ・チーズ・ソケット等",
    grade: "条件付",
    note: "一般配管用ステンレス鋼鋼管向けの専用システム。使用流体・圧力・管規格・専用工具・施工手順を最新版カタログで照合。蒸気用としては選定しません。",
  },
  {
    purpose: "排水",
    pipe: "VP",
    category: "継手",
    product: "DV継手／TS継手",
    grade: "条件付",
    note: "排水用途はDV、圧力配管はTSなど用途と設計指定を確認。接着剤は管・継手対応品。",
  },
  {
    purpose: "排水",
    pipe: "VU",
    category: "継手",
    product: "VU用継手",
    grade: "推奨",
    note: "無圧排水用途。勾配、支持、埋設条件を確認。",
  },
  {
    purpose: "排水",
    pipe: "耐火二層管",
    category: "継手",
    product: "認定工法の専用継手・目地処理材",
    grade: "推奨",
    note: "区画貫通部は認定番号、適用管径、壁床仕様、充填方法を必ず照合。",
  },
  {
    purpose: "冷媒",
    pipe: "冷媒銅管",
    category: "継手",
    product: "冷媒用銅管継手／ろう付接合",
    grade: "推奨",
    note: "冷媒種、設計圧力、肉厚、窒素置換、ろう材をメーカー仕様で確認。",
  },
  {
    purpose: "消火",
    pipe: "SGP白ガス",
    category: "バルブ",
    product: "消防設備用認定・規格適合バルブ",
    grade: "要確認",
    note: "設備種別、設計圧力、所轄・仕様書、認定表示に適合する製品を選定。",
  },
  {
    purpose: "共通",
    pipe: "SGP黒ガス → SUS",
    category: "異種管変換",
    product: "絶縁フランジ接合／絶縁ユニオン／メーカー指定異種管継手",
    grade: "条件付",
    note: "黒鋼とSUSの直接接触による異種金属接触腐食を抑える絶縁措置が必要。ねじ・フランジ・溶接、流体、圧力温度、口径で決定。",
  },
  {
    purpose: "共通",
    pipe: "SGP白ガス → SUS",
    category: "異種管変換",
    product: "絶縁フランジ接合／絶縁ユニオン／メーカー指定異種管継手",
    grade: "条件付",
    note: "絶縁材・ボルトスリーブ等を含む接続仕様を確認。水質と使用環境も考慮。",
  },
  {
    purpose: "共通",
    pipe: "SUS → VP",
    category: "異種管変換",
    product: "ねじ込み形またはフランジ形の異種管接続継手",
    grade: "条件付",
    note: "金属側接続、樹脂側の圧力区分、温度、荷重を確認。樹脂管へ無理な応力をかけない。",
  },
  {
    purpose: "共通",
    pipe: "銅管 → SUS",
    category: "異種管変換",
    product: "絶縁形異種管継手／メーカー指定変換継手",
    grade: "条件付",
    note: "流体、水質、ろう付可否、電食対策を確認。",
  },
];

const purposeOptions = ["蒸気", "蒸気還水", "冷温水", "冷却水", "給水", "給湯", "排水", "ポンプアップ", "空調ドレン", "通気", "冷媒", "消火", "圧縮空気", "ガス", "薬液"];
const pipeOptions = ["SGP黒ガス", "SGP白ガス", "STPG", "塩ビライニング鋼管（VA・VB・VD）", "PE粉体ライニング鋼管（PA・PB・PD）", "SUS（厚肉）", "SUS（一般配管用薄肉）", "ナイスジョイント", "ZlokⅡ", "VP", "VU", "HIVP", "水道用PE二層管", "水道配水用PE（JWWA K144）", "建物給水用高性能PE（エスロハイパーAW）", "金属強化PE（スーパーエスロメタックス）", "空調ドレン用結露防止管", "HTVP", "耐火二層管", "冷媒銅管", "銅管", "架橋ポリエチレン管", "ポリブテン管", "ダクタイル鋳鉄管", "鉛管（既設調査・更新用）", "SGP黒ガス → SUS", "SGP白ガス → SUS", "SUS → VP", "銅管 → SUS"];
const purposePipeOptions:Record<string,string[]>={
  "蒸気":["SGP黒ガス","STPG","SUS（厚肉）","SGP黒ガス → SUS"],
  "蒸気還水":["SGP黒ガス","STPG","SUS（厚肉）","SGP黒ガス → SUS"],
  "冷温水":["SGP黒ガス","SGP白ガス","STPG","SUS（厚肉）","SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ","VP","SGP黒ガス → SUS","SGP白ガス → SUS","SUS → VP"],
  "冷却水":["SGP黒ガス","SGP白ガス","STPG","SUS（厚肉）","SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ","VP","SGP黒ガス → SUS","SGP白ガス → SUS","SUS → VP"],
  "給水":["塩ビライニング鋼管（VA・VB・VD）","PE粉体ライニング鋼管（PA・PB・PD）","SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ","HIVP","水道用PE二層管","水道配水用PE（JWWA K144）","建物給水用高性能PE（エスロハイパーAW）","金属強化PE（スーパーエスロメタックス）","銅管","架橋ポリエチレン管","ポリブテン管","ダクタイル鋳鉄管","SGP白ガス → SUS","銅管 → SUS"],
  "給湯":["SUS（厚肉）","SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ","金属強化PE（スーパーエスロメタックス）","銅管","架橋ポリエチレン管","ポリブテン管","銅管 → SUS"],
  "排水":["VP","VU","耐火二層管","SUS（厚肉）","SUS → VP"],
  "ポンプアップ":["HIVP","VP","SUS（厚肉）"],
  "空調ドレン":["VP","VU","空調ドレン用結露防止管","耐火二層管","SUS → VP"],
  "通気":["VP","VU","耐火二層管"],
  "冷媒":["冷媒銅管"],
  "消火":["SGP黒ガス","SGP白ガス","STPG"],
  "圧縮空気":["SGP黒ガス","STPG","SUS（厚肉）","SUS（一般配管用薄肉）","銅管","SGP黒ガス → SUS"],
  "ガス":["SGP黒ガス","STPG"],
  "薬液":["SUS（厚肉）","SUS（一般配管用薄肉）","VP","HTVP"],
};
const pipeOptionsForPurpose=(purpose:string)=>purpose==="すべて"?pipeOptions:(purposePipeOptions[purpose]||[]);
const conversionPipeOptions = pipeOptions.filter((x)=>!x.includes("→"));
const categoryOptions = ["管", "継手", "異種管変換", "バルブ", "逆止弁", "ストレーナ", "スチームトラップ", "伸縮継手・付属品", "計器・ドレン", "フランジ", "ガスケット・パッキン", "吊り・支持", "保温", "接合材", "スリーブ・区画処理"];
type SuARow={su:string;suOd:string;sameOdA:string;aOd:string;adapter:string;note:string};
const suATable:SuARow[]=[
  {su:"13Su",suOd:"15.88",sameOdA:"なし",aOd:"—",adapter:"15A",note:"アダプタ内部で径が変わる。直管同士の外径は同じではない。"},
  {su:"20Su",suOd:"22.22",sameOdA:"なし（15Aが近い）",aOd:"15A＝21.7",adapter:"15A／20A",note:"採用継手により15A・20Aの両設定がある。"},
  {su:"25Su",suOd:"28.58",sameOdA:"なし（20Aが近い）",aOd:"20A＝27.2",adapter:"25A",note:"25A鋼管の外径34.0mmとは一致しない。"},
  {su:"30Su",suOd:"34.00",sameOdA:"25A",aOd:"34.0",adapter:"25A／32A",note:"同外径は25A。フランジ・ねじ側32Aの製品設定もある。"},
  {su:"40Su",suOd:"42.70",sameOdA:"32A",aOd:"42.7",adapter:"32A／40A",note:"同外径は32A。呼び40同士では外径が違う。"},
  {su:"50Su",suOd:"48.60",sameOdA:"40A",aOd:"48.6",adapter:"40A／50Aほか",note:"同外径は40A。異径フランジ製品は複数のA呼びがある。"},
  {su:"60Su",suOd:"60.50",sameOdA:"50A",aOd:"60.5",adapter:"50A／65Aほか",note:"同外径は50A。流量・接続相手でA側口径を決める。"},
  {su:"75Su",suOd:"76.30",sameOdA:"65A",aOd:"76.3",adapter:"65A",note:"グルーブ・フランジの規格と圧力クラスも確認。"},
  {su:"80Su",suOd:"89.10",sameOdA:"80A",aOd:"89.1",adapter:"80A",note:"外径は一致するが肉厚・管規格・接合方式は別。"},
  {su:"100Su",suOd:"114.30",sameOdA:"100A",aOd:"114.3",adapter:"100A",note:"大口径はフランジ、ハウジング等の適用表を優先。"},
  {su:"125Su",suOd:"139.80",sameOdA:"125A",aOd:"139.8",adapter:"125A",note:"継手シリーズの製作範囲を確認。"},
  {su:"150Su",suOd:"165.20",sameOdA:"150A",aOd:"165.2",adapter:"150A",note:"継手シリーズの製作範囲を確認。"},
  {su:"200Su",suOd:"216.30",sameOdA:"200A",aOd:"216.3",adapter:"200A",note:"重量・支持・フランジ接合条件を個別確認。"},
  {su:"250Su",suOd:"267.40",sameOdA:"250A",aOd:"267.4",adapter:"250A",note:"製作管・継手メーカーの寸法表を優先。"},
  {su:"300Su",suOd:"318.50",sameOdA:"300A",aOd:"318.5",adapter:"300A",note:"製作管・継手メーカーの寸法表を優先。"},
];
type WaterPipeProfile={pipe:string;zone:string;standard:string;joint:string;note:string;maker:string;url:string;status:"標準候補"|"条件付"|"既設のみ"};
const waterPipeProfiles:WaterPipeProfile[]=[
  {pipe:"HIVP",zone:"屋外埋設・引込・小口径",standard:"水道用耐衝撃性硬質ポリ塩化ビニル管",joint:"HI継手＋HI用接着剤／金属接続はSUSインサート付給水栓・バルブソケット",note:"凍結、温度、紫外線、土被り、伸縮、給水装置指定を確認。",maker:"積水化学 HIパイプ・継手",url:"https://www.sekisui.co.jp/search/detail-2662.html",status:"標準候補"},
  {pipe:"VP",zone:"屋内・ピット・埋設（設計指定）",standard:"硬質ポリ塩化ビニル管 JIS K 6741",joint:"TS継手＋VP用接着剤",note:"衝撃・温度条件ではHIVP等を検討。自治体・特記仕様の採用範囲を優先。",maker:"クボタケミックス 塩ビ管",url:"https://www.kubota-chemix.co.jp/product/",status:"条件付"},
  {pipe:"塩ビライニング鋼管（VA・VB・VD）",zone:"屋内・屋外・埋設（被覆区分で選択）",standard:"水道用硬質塩化ビニルライニング鋼管",joint:"JWWA K150等の管端防食形ねじ込み継手／フランジ",note:"VA・VB・VDは外面仕様と使用場所が異なる。切断・ねじ加工後の管端防食を必須確認。",maker:"JFEスチール ライニング鋼管",url:"https://www.jfe-steel.co.jp/products/koukan/",status:"標準候補"},
  {pipe:"PE粉体ライニング鋼管（PA・PB・PD）",zone:"屋内・屋外・埋設（被覆区分で選択）",standard:"水道用ポリエチレン粉体ライニング鋼管",joint:"管端防食形ねじ込み継手／フランジ",note:"PA・PB・PDの外面被覆と使用区分、管端コア、埋設部防食を確認。",maker:"JFEスチール ライニング鋼管",url:"https://www.jfe-steel.co.jp/products/koukan/",status:"標準候補"},
  {pipe:"SUS（一般配管用薄肉）",zone:"屋内横引き・立管・ピット",standard:"JIS G 3448 一般配管用ステンレス鋼鋼管",joint:"採用メーカーのプレス・拡管・ワンタッチ継手",note:"継手システム、シール材、水質、圧力、異種金属絶縁を確認。",maker:"ベンカン SUパイプ",url:"https://www.benkan.co.jp/product/sup",status:"標準候補"},
  {pipe:"ナイスジョイント",zone:"屋内横引き・立管・ピット",standard:"JIS G 3448 Su管＋拡管式継手",joint:"ナイスジョイントX純正継手・おす／めす／フランジアダプタ",note:"専用拡管工具、パッキン、施工要領、認定範囲を確認。",maker:"オーエヌ工業 ナイスジョイントX",url:"https://www.onk-net.co.jp/ja/product/nicejoint-x/",status:"標準候補"},
  {pipe:"ZlokⅡ",zone:"屋内横引き・立管・ピット",standard:"JIS G 3448 Su管＋メカニカル継手",joint:"ZlokⅡ純正継手・変換アダプタ",note:"適用流体・圧力・専用工具と最新製品表を確認。",maker:"桑名金属工業 ZlokⅡ",url:"https://www.kuwana-metals.com/download/cad/pdf.html",status:"標準候補"},
  {pipe:"SUS（厚肉）",zone:"機械室・高圧・特殊条件",standard:"JIS G 3459 配管用ステンレス鋼鋼管",joint:"溶接・ねじ・フランジ／適用可能な専用継手",note:"Sch、溶接施工、酸洗・不動態化、圧力クラスを設計指定。",maker:"ベンカン ステンレス配管",url:"https://www.benkan.co.jp/product",status:"条件付"},
  {pipe:"銅管",zone:"屋内小口径・既設接続",standard:"JIS H 3300 建築配管用銅管等",joint:"ろう付・はんだ付・メカニカル継手・フレア（用途指定）",note:"水質、青水、異種金属接触、ろう材、火気、管厚を確認。",maker:"日本銅センター",url:"https://www.jcda.or.jp/",status:"条件付"},
  {pipe:"架橋ポリエチレン管",zone:"住戸内・器具枝管・ヘッダー",standard:"JIS K 6769等／メーカー給水システム",joint:"ワンタッチ・プレス・締付式のメーカー専用継手",note:"さや管、隠蔽、更新性、曲げ半径、温度圧力、継手点検性を確認。",maker:"架橋ポリエチレン管工業会",url:"https://www.jxpa.gr.jp/",status:"標準候補"},
  {pipe:"ポリブテン管",zone:"住戸内・器具枝管・ヘッダー",standard:"JIS K 6778等／メーカー給水システム",joint:"ワンタッチ・プレス・熱融着等のメーカー専用継手",note:"他社システム混用不可。温度圧力、固定、隠蔽条件を確認。",maker:"ポリブテンパイプ工業会",url:"https://www.jpbpa.gr.jp/",status:"標準候補"},
  {pipe:"水道用PE二層管",zone:"給水引込・屋外埋設",standard:"JIS K 6762 水道用ポリエチレン二層管等",joint:"金属インサート式・冷間継手等の認証専用品",note:"水道事業者の指定材料、口径、止水栓・メーター接続、土被りを最優先。",maker:"給水装置指定材料・採用メーカー",url:"https://www.jwwa.or.jp/syuppan/jwwakikaku.html",status:"標準候補"},
  {pipe:"水道配水用PE（JWWA K144）",zone:"構内配水・水道本管・大口径埋設",standard:"JWWA K 144管／K 145継手",joint:"EF継手・バット融着・フランジ短管・変換継手",note:"施工資格、融着管理、スクレープ、クランプ、冷却時間、トレーサビリティを記録。",maker:"積水化学 エスロハイパーJW",url:"https://www.sekisui.co.jp/search/detail-2663.html",status:"標準候補"},
  {pipe:"建物給水用高性能PE（エスロハイパーAW）",zone:"敷地内埋設・ピット・立管・機械室",standard:"PWA 001/002/005/006等",joint:"EF継手・EFスクリュージョイント・フランジ短管・ソフトシール弁",note:"呼び20～200。EF融着管理、支持、防火区画、機器・メーター接続を確認。",maker:"積水化学 エスロハイパーAW",url:"https://www.sekisui.co.jp/search/detail-3041.html",status:"標準候補"},
  {pipe:"金属強化PE（スーパーエスロメタックス）",zone:"屋内枝管・機器接続・給水給湯",standard:"金属強化ポリエチレン管 メーカーシステム",joint:"メタキュット／メタッチ専用継手・おす／めすアダプタ",note:"呼び10～50。曲げ半径、面仕上げ、専用工具、温度圧力範囲を確認。",maker:"積水化学 スーパーエスロメタックス",url:"https://www.sekisui.co.jp/search/detail-2556.html",status:"標準候補"},
  {pipe:"ダクタイル鋳鉄管",zone:"構内配水・水道本管・大口径埋設",standard:"水道用ダクタイル鋳鉄管・耐震継手",joint:"GX・NS形等の耐震継手／フランジ／異種管継手",note:"水道事業者、管種、継手形式、離脱防止、切管、防食、基礎を確認。",maker:"クボタ ダクタイル鉄管",url:"https://www.kubota.co.jp/product/iron-pipe/",status:"標準候補"},
  {pipe:"SGP白ガス",zone:"既設調査・限定用途",standard:"配管用炭素鋼鋼管（亜鉛めっき）",joint:"ねじ込み継手",note:"新設飲料給水では設計・水道事業者指定を確認。腐食・赤水・更新計画を検討。",maker:"JFEスチール 鋼管",url:"https://www.jfe-steel.co.jp/products/koukan/",status:"条件付"},
  {pipe:"鉛管（既設調査・更新用）",zone:"既設給水管の調査・撤去更新",standard:"既設管のみ",joint:"原則更新。切替は水道事業者承認の専用継手",note:"新設候補ではありません。残存箇所を特定し、飲用影響・撤去・更新方法を水道事業者と協議。",maker:"水道事業者",url:"https://www.jwwa.or.jp/",status:"既設のみ"},
];

const catalogRefs: Record<string, Pick<Rule, "maker" | "url" | "linkLabel" | "linkMatch">> = {
  metalValve: { maker: "KITZ", url: "https://www.kitz.co.jp/product/", linkLabel:"公式カタログ一覧", linkMatch:"製品群一致" },
  stainless: { maker: "ベンカン", url: "https://www.benkan.co.jp/product", linkLabel:"公式カタログ一覧", linkMatch:"製品群一致" },
  support: { maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/p01.htm", linkLabel:"公式カタログ一覧", linkMatch:"製品群一致" },
  resinValve: { maker: "旭有機材", url: "https://www.asahi-yukizai.co.jp/product_ppm_catalog/", linkLabel:"公式カタログ一覧", linkMatch:"製品群一致" },
  pvc: { maker: "クボタケミックス", url: "https://www.kubota-chemix.co.jp/product/", linkLabel:"公式カタログ一覧", linkMatch:"製品群一致" },
  hivp: { maker: "積水化学 エスロンHI", url: "https://www.sekisui.co.jp/search/detail-2662.html", linkLabel:"公式製品ページ", linkMatch:"製品群一致" },
  acDrain: { maker: "積水化学 エスロンACドレン", url: "https://www.sekisui.co.jp/business/lifeline/", linkLabel:"公式製品ページ", linkMatch:"製品群一致" },
  niceJoint: { maker: "オーエヌ工業 ナイスジョイントX", url: "https://www.onk-net.co.jp/ja/product/nicejoint-x/", linkLabel:"公式製品ページ", linkMatch:"採用例" },
  zlok2: { maker: "桑名金属工業 ZlokⅡ", url: "https://www.kuwana-metals.com/download/cad/pdf.html", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
  steelPipe: { maker: "JFEスチール 鋼管", url: "https://www.jfe-steel.co.jp/products/koukan/", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
  steelFitting: { maker: "管本体：JFEスチール／継手：ベンカン機工", url: "https://www.benkan-kikoh.com/product/", linkLabel:"継手公式カタログ一覧", linkMatch:"採用例" },
  copper: { maker: "日本銅センター 銅管資料", url: "https://www.jcda.or.jp/", linkLabel:"公式カタログ一覧", linkMatch:"資料一覧" },
  pex: { maker: "架橋ポリエチレン管工業会", url: "https://www.jxpa.gr.jp/", linkLabel:"公式カタログ一覧", linkMatch:"資料一覧" },
  pb: { maker: "ポリブテンパイプ工業会", url: "https://www.jpbpa.gr.jp/", linkLabel:"公式カタログ一覧", linkMatch:"資料一覧" },
  gasket: { maker: "ニチアス ガスケット", url: "https://www.nichias.co.jp/products/industrial/gasket/", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
  insulation: { maker: "ニチアス 保温材", url: "https://www.nichias.co.jp/products/industrial/thermal-insulation/", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
  welding: { maker: "神戸製鋼 溶接材料", url: "https://www.kobelco-welding.jp/products/", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
  firestop: { maker: "因幡電工 防火区画貫通材", url: "https://www.inaba-denko.com/ja/product/firestop/", linkLabel:"公式カタログ一覧", linkMatch:"採用例" },
};

function relevantCatalogRef(s:{pipe:string;category:string}):Pick<Rule,"maker"|"url"|"linkLabel"|"linkMatch">|Record<string,never>{
  const resin=["VP","VU","HIVP","HTVP","空調ドレン用結露防止管"].includes(s.pipe);
  const steel=["SGP黒ガス","SGP白ガス","STPG"].includes(s.pipe);
  const copper=["銅管","冷媒銅管"].includes(s.pipe);
  if(s.category==="吊り・支持")return catalogRefs.support;
  if(s.pipe==="ナイスジョイント"&&["管","継手","異種管変換"].includes(s.category))return catalogRefs.niceJoint;
  if(s.pipe==="ZlokⅡ"&&["管","継手","異種管変換"].includes(s.category))return catalogRefs.zlok2;
  if(s.pipe==="空調ドレン用結露防止管")return catalogRefs.acDrain;
  if(s.pipe==="HIVP"&&["管","継手","接合材"].includes(s.category))return catalogRefs.hivp;
  if(steel&&s.category==="管")return catalogRefs.steelPipe;
  if(steel&&["継手","フランジ"].includes(s.category))return catalogRefs.steelFitting;
  if(resin&&["管","継手","接合材"].includes(s.category))return catalogRefs.pvc;
  if(resin&&["バルブ","逆止弁","ストレーナ"].includes(s.category))return catalogRefs.resinValve;
  if(s.pipe.startsWith("SUS")&&["管","継手","フランジ"].includes(s.category))return catalogRefs.stainless;
  if(copper&&["管","継手","接合材"].includes(s.category))return catalogRefs.copper;
  if(s.pipe==="架橋ポリエチレン管"&&["管","継手","接合材"].includes(s.category))return catalogRefs.pex;
  if(s.pipe==="ポリブテン管"&&["管","継手","接合材"].includes(s.category))return catalogRefs.pb;
  if(["バルブ","逆止弁","ストレーナ"].includes(s.category))return catalogRefs.metalValve;
  if(s.category==="ガスケット・パッキン")return catalogRefs.gasket;
  if(s.category==="保温")return catalogRefs.insulation;
  if(s.category==="スリーブ・区画処理")return catalogRefs.firestop;
  if(s.category==="接合材"&&["SGP黒ガス","SGP白ガス","STPG","SUS（厚肉）","SUS（一般配管用薄肉）"].includes(s.pipe))return catalogRefs.welding;
  return {};
}

type SupportPitchRow = {
  family: string;
  size: string;
  horizontal: string;
  field: string;
  vertical: string;
  basis: "標準仕様" | "メーカー確認" | "計画目安";
  note: string;
  source: string;
  sourceUrl: string;
};
const supportPitchRows: SupportPitchRow[] = [
  {family:"SGP黒ガス・白ガス／STPG",size:"20A以下",horizontal:"1.8m以下",field:"1.5m",vertical:"各階1か所以上",basis:"標準仕様",note:"弁・曲がり・分岐・端部は近傍で追加支持。蒸気は固定・ガイド・自由支持を別途計画。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SGP黒ガス・白ガス／STPG",size:"25～40A",horizontal:"2.0m以下",field:"1.8m",vertical:"各階1か所以上",basis:"標準仕様",note:"保温・内容物・弁類の集中荷重を含めて吊り材を選定。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SGP黒ガス・白ガス／STPG",size:"50～80A",horizontal:"3.0m以下",field:"2.5m",vertical:"各階1か所以上",basis:"標準仕様",note:"横引き分岐と重量弁の前後は独立支持を検討。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SGP黒ガス・白ガス／STPG",size:"100～150A",horizontal:"4.0m以下",field:"3.0m",vertical:"各階1か所以上",basis:"標準仕様",note:"耐震支持間隔とは別。吊り長さと横架材のたわみも確認。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SGP黒ガス・白ガス／STPG",size:"200A以上",horizontal:"5.0m以下",field:"4.0m",vertical:"各階1か所以上",basis:"標準仕様",note:"重量支持は構造計算・架台計算を優先。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SUS厚肉管",size:"20A以下",horizontal:"1.8m以下",field:"1.5m",vertical:"各階1か所以上",basis:"標準仕様",note:"鋼製支持材との接触部は樹脂被覆・絶縁材を使用。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SUS厚肉管",size:"25～40A",horizontal:"2.0m以下",field:"1.8m",vertical:"各階1か所以上",basis:"標準仕様",note:"管Sch・流体重量・保温重量で再計算。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SUS厚肉管",size:"50～80A",horizontal:"3.0m以下",field:"2.5m",vertical:"各階1か所以上",basis:"標準仕様",note:"異種金属接触腐食を防止。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SUS厚肉管",size:"100A以上",horizontal:"4.0m以下を基本",field:"3.0m",vertical:"各階1か所以上",basis:"計画目安",note:"大口径・薄肉・高温は配管応力とたわみ計算を優先。",source:"公共仕様を基にした施工計画値",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"SUS一般配管用薄肉管（MOLCO等）",size:"13～20Su",horizontal:"1.0m以下",field:"0.9m",vertical:"各階1か所以上",basis:"メーカー確認",note:"継手直近・弁類は追加支持。採用する継手メーカーの施工要領を優先。",source:"ベンカン MOLCO 公式製品・技術資料",sourceUrl:"https://www.benkan.co.jp/product/molco"},
  {family:"SUS一般配管用薄肉管（MOLCO等）",size:"25～60Su",horizontal:"2.0m以下",field:"1.5m",vertical:"各階1か所以上",basis:"メーカー確認",note:"管端・分岐・弁の荷重を継手に負担させない。",source:"ベンカン MOLCO 公式製品・技術資料",sourceUrl:"https://www.benkan.co.jp/product/molco"},
  {family:"SUS一般配管用薄肉管（MOLCO等）",size:"75～100Su",horizontal:"2.5m以下",field:"2.0m",vertical:"各階1か所以上",basis:"メーカー確認",note:"製品シリーズと施工要領の支持間隔を採用前に照合。",source:"ベンカン MOLCO 公式製品・技術資料",sourceUrl:"https://www.benkan.co.jp/product/molco"},
  {family:"ナイスジョイントX",size:"13～20Su",horizontal:"1.0m以下（計画例）",field:"0.9m",vertical:"各階1か所以上",basis:"メーカー確認",note:"オーエヌ工業の最新版施工要領を優先し、継手・弁類近傍を追加支持。",source:"オーエヌ工業 ナイスジョイントX",sourceUrl:"https://www.onk-net.co.jp/ja/product/nicejoint-x/"},
  {family:"ナイスジョイントX",size:"25～60Su",horizontal:"2.0m以下（計画例）",field:"1.5m",vertical:"各階1か所以上",basis:"メーカー確認",note:"管端・分岐・弁の荷重を継手へ負担させない。",source:"オーエヌ工業 ナイスジョイントX",sourceUrl:"https://www.onk-net.co.jp/ja/product/nicejoint-x/"},
  {family:"ナイスジョイントX",size:"75～100Su",horizontal:"2.5m以下（計画例）",field:"2.0m",vertical:"各階1か所以上",basis:"メーカー確認",note:"大口径は製品シリーズと施工要領の支持条件を採用前に照合。",source:"オーエヌ工業 ナイスジョイントX",sourceUrl:"https://www.onk-net.co.jp/ja/product/nicejoint-x/"},
  {family:"VP／HIVP／HTVP",size:"20A以下",horizontal:"1.0m以下",field:"0.8m",vertical:"1.5m以下",basis:"計画目安",note:"温度上昇・満水・保温でたわみが増える。HTVPは使用温度別にメーカー確認。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VP／HIVP／HTVP",size:"25～40A",horizontal:"1.2m以下",field:"1.0m",vertical:"1.5m以下",basis:"計画目安",note:"接着部硬化前に荷重を掛けない。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VP／HIVP／HTVP",size:"50～80A",horizontal:"1.5m以下",field:"1.2m",vertical:"2.0m以下",basis:"計画目安",note:"弁・伸縮継手・立上り下部は独立支持。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VP／HIVP／HTVP",size:"100A以上",horizontal:"2.0m以下",field:"1.5m",vertical:"各階1か所以上",basis:"計画目安",note:"流体温度と支持方法による許容スパンをメーカー資料で確認。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VU",size:"40～75A",horizontal:"1.0m以下",field:"0.8m",vertical:"1.5m以下",basis:"計画目安",note:"無圧排水用。勾配保持を優先し継手部のだれを防止。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VU",size:"100～150A",horizontal:"1.5m以下",field:"1.2m",vertical:"2.0m以下",basis:"計画目安",note:"満水試験時の荷重を考慮。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"VU",size:"200A以上",horizontal:"2.0m以下",field:"1.5m",vertical:"各階1か所以上",basis:"計画目安",note:"大口径排水は勾配・たわみを計算し架台支持を検討。",source:"クボタケミックス 公式製品・技術資料",sourceUrl:"https://www.kubota-chemix.co.jp/product/"},
  {family:"耐火二層管",size:"40～75A",horizontal:"1.0m以下",field:"0.8m",vertical:"1.5m以下",basis:"メーカー確認",note:"被覆を潰さない専用バンドを使用。認定工法とメーカー施工要領を最優先。",source:"国交省 標準仕様・採用メーカー施工要領",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"耐火二層管",size:"100～150A",horizontal:"1.5m以下",field:"1.2m",vertical:"各階1か所以上",basis:"メーカー確認",note:"継手・区画貫通前後の支持位置は認定範囲を照合。",source:"国交省 標準仕様・採用メーカー施工要領",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"銅管（給水・給湯）",size:"20A以下",horizontal:"1.0m以下",field:"0.9m",vertical:"各階1か所以上",basis:"標準仕様",note:"鋼製支持材とは絶縁。給湯は熱伸縮を拘束しない。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"銅管（給水・給湯）",size:"25～40A",horizontal:"1.5m以下",field:"1.2m",vertical:"各階1か所以上",basis:"標準仕様",note:"弁類・水栓・機器接続部は別支持。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"銅管（給水・給湯）",size:"50A以上",horizontal:"2.0m以下",field:"1.5m",vertical:"各階1か所以上",basis:"標準仕様",note:"管肉厚・流体重量・温度で確認。",source:"国交省 公共建築工事標準仕様書（機械設備工事編）",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"冷媒銅管",size:"外径9.52mm以下",horizontal:"1.0m以下",field:"0.8m",vertical:"1.5m以下",basis:"計画目安",note:"液管・ガス管を保温材ごと支持し、保温潰れ・結露を防止。機器メーカー施工要領を優先。",source:"国交省標準仕様・空調機メーカー施工要領",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"冷媒銅管",size:"外径12.7～25.4mm",horizontal:"1.5m以下",field:"1.2m",vertical:"2.0m以下",basis:"計画目安",note:"分岐管は水平・垂直方向と前後直管をメーカー指定どおり保持。",source:"国交省標準仕様・空調機メーカー施工要領",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"冷媒銅管",size:"外径28.58mm以上",horizontal:"2.0m以下",field:"1.5m",vertical:"各階1か所以上",basis:"計画目安",note:"大径ガス管は自重・油戻り・振動を考慮し機器直近に防振支持。",source:"国交省標準仕様・空調機メーカー施工要領",sourceUrl:"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"},
  {family:"架橋ポリエチレン管",size:"10～25A",horizontal:"1.0m以下",field:"0.8m",vertical:"1.0m以下",basis:"メーカー確認",note:"さや管・転がし配管・露出配管で支持方法が異なる。採用システムの施工要領を優先。",source:"採用メーカー施工要領",sourceUrl:"https://www.jxpa.gr.jp/"},
  {family:"架橋ポリエチレン管",size:"32A以上",horizontal:"0.8m以下",field:"0.6m",vertical:"1.0m以下",basis:"メーカー確認",note:"温水・露出は熱伸縮とたわみを考慮して短くする。",source:"採用メーカー施工要領",sourceUrl:"https://www.jxpa.gr.jp/"},
  {family:"ポリブテン管",size:"10～25A",horizontal:"1.0m以下",field:"0.8m",vertical:"1.0m以下",basis:"メーカー確認",note:"樹脂クリップ・専用支持材を使用し、温水時の伸縮を逃がす。",source:"ポリブテンパイプ工業会・採用メーカー施工要領",sourceUrl:"https://www.jpbpa.gr.jp/"},
  {family:"ポリブテン管",size:"32A以上",horizontal:"0.8m以下",field:"0.6m",vertical:"1.0m以下",basis:"メーカー確認",note:"ヘッダー方式・先分岐方式と露出条件で再確認。",source:"ポリブテンパイプ工業会・採用メーカー施工要領",sourceUrl:"https://www.jpbpa.gr.jp/"},
];

type MaterialSearch = { purpose:string; pipe:string; targetPipe:string; category:string; conversionMethod:string };

function conversionSide(pipe:string, side:"A"|"B", flange=false) {
  const thread=side==="A"?"おねじアダプタ":"めねじアダプタ";
  if(pipe==="ナイスジョイント") return `オーエヌ工業の${side}側専用${flange?"フランジアダプタ":thread}（ナイスジョイントX適用表から選定）`;
  if(pipe==="ZlokⅡ") return `桑名金属工業の${side}側専用${flange?"フランジアダプタ":thread}（ZlokⅡ適用表から選定）`;
  if(["SUS（一般配管用薄肉）"].includes(pipe)) return `${side}側の採用メーカー純正${flange?"フランジアダプタ":thread}`;
  if(pipe.startsWith("SUS")) return flange?`${side}側SUS製差込み／突合せ溶接フランジ`:`${side}側SUS製${thread}`;
  if(["SGP黒ガス","SGP白ガス","STPG"].includes(pipe)) return flange?`${side}側鋼製差込み／突合せ溶接フランジ`:`${side}側鋼製${thread}`;
  if(["VP","VU","HIVP","HTVP"].includes(pipe)) return flange?`${side}側樹脂製メーカー指定フランジアダプタ`:`${side}側樹脂製${thread}（温度・締付応力を確認）`;
  if(pipe==="水道用PE二層管")return `${side}側水道用PE認証メカニカル継手／${thread}`;
  if(["水道配水用PE（JWWA K144）","建物給水用高性能PE（エスロハイパーAW）"].includes(pipe))return flange?`${side}側EFフランジ短管（上水形／JIS形を照合）`:`${side}側EFスクリュージョイント${thread}`;
  if(pipe==="金属強化PE（スーパーエスロメタックス）")return `${side}側メタキュット／メタッチ専用${thread}`;
  if(["架橋ポリエチレン管","ポリブテン管"].includes(pipe))return `${side}側採用メーカー専用${thread}`;
  if(["塩ビライニング鋼管（VA・VB・VD）","PE粉体ライニング鋼管（PA・PB・PD）"].includes(pipe))return flange?`${side}側管端防食形フランジ`:`${side}側管端防食形${thread}`;
  if(pipe==="ダクタイル鋳鉄管")return `${side}側GX／NS形等の異種管継手または上水形フランジ短管`;
  if(["銅管","冷媒銅管"].includes(pipe)) return flange?`${side}側銅管ろう付フランジアダプタ`:`${side}側銅管ろう付${thread}`;
  return `${side}側メーカー専用変換アダプタ`;
}

function gasketFor(purpose:string, a:string, b:string) {
  const resin=[a,b].some((x)=>["VP","VU","HIVP","HTVP","水道用PE二層管","水道配水用PE（JWWA K144）","建物給水用高性能PE（エスロハイパーAW）","金属強化PE（スーパーエスロメタックス）","架橋ポリエチレン管","ポリブテン管"].includes(x));
  if(purpose==="蒸気"||purpose==="蒸気還水") return "膨張黒鉛系うず巻形ガスケット、または蒸気対応ジョイントシート。圧力・温度・フランジ座・内外輪材質をメーカー適用表で決定";
  if(purpose==="薬液") return "薬液名・濃度・温度に対する耐薬品表で選定。材質未確定のままEPDM/PTFE等を決めない";
  if(purpose==="冷媒") return "原則は機器・継手メーカー指定。フランジ接続時のみ冷媒・油・圧力温度に適合する純正ガスケット";
  if(resin) return "樹脂フランジメーカー指定の全面形ガスケット（EPDM等）。流体・温度・締付トルクを適用表で確認";
  return "流体対応ノンアスベストジョイントシート等。圧力・温度・RF/FF・呼び径をメーカー適用表で決定";
}

function dedicatedConversion(a:string,b:string):{product:string;assembly:{label:string;value:string}[];note:string;url:string;maker:string}|null {
  const pair=[a,b];
  if(a===b) return {product:`${a} 同一管種の径違い継手`,assembly:[{label:"A側 配管",value:a},{label:"A側 接合",value:"メーカー指定受口"},{label:"径変換",value:"専用レジューサ／径違いソケット"},{label:"B側 接合",value:"メーカー指定受口"},{label:"B側 配管",value:b}],note:"異種管変換ではありません。同一システムの径違い継手を使用し、異なるメーカーの部品を混用しません。",url:a==="ZlokⅡ"?"https://www.kuwana-metals.com/download/cad/pdf.html":a==="ナイスジョイント"?"https://www.onk-net.co.jp/ja/product/nicejoint-x/download/scs14/":"https://www.kubota-chemix.co.jp/product/",maker:"採用管・継手メーカー"};
  const acIndex=pair.indexOf("空調ドレン用結露防止管");
  const other=acIndex===0?b:a;
  const orient=(values:{ac:string;center:string;other:string})=>acIndex===0
    ? [{label:"A側 配管",value:a},{label:"A側 受口",value:values.ac},{label:"専用変換継手",value:values.center},{label:"B側 受口",value:values.other},{label:"B側 配管",value:b}]
    : [{label:"A側 配管",value:a},{label:"A側 受口",value:values.other},{label:"専用変換継手",value:values.center},{label:"B側 受口",value:values.ac},{label:"B側 配管",value:b}];
  if(acIndex>=0&&other==="VP") return {product:"積水 エスロンACドレン→VP 専用両受変換アダプター",assembly:orient({ac:"ACドレン管用受口",center:"ACVP 両受変換アダプター（VPパイプへ直接接続）",other:"VP管用受口"}),note:"ねじ・フランジ・TS/DV継手を挟まず、両受変換アダプターでACドレン管とVP管を直接接着接合します。例：ACVP25、ACVP30。必要口径に製品設定があるか、AC側・VP側の受口寸法を最新版カタログで確認。",url:"https://www.eslontimes.com/search/parts/detail/ACVP25/",maker:"積水化学 エスロンACドレン"};
  if(acIndex>=0&&["VU","HIVP","HTVP"].includes(other)) return {product:`積水 エスロンACドレン→${other} 塩ビ継手接続アダプター構成`,assembly:orient({ac:"ACドレン管用受口",center:"ACドレン用アダプター（塩ビ継手へ変換）",other:`${other}に適合するDV／TS／HI／HT専用継手受口`}),note:`VP直結用の両受変換アダプターと混同しません。ACドレン用アダプターの塩ビ継手側へ、${other}専用継手を組み合わせます。接着剤・温度・圧力・排水用途とメーカー施工要領を照合。`,url:"https://www.eslontimes.com/product/build/37/",maker:"積水化学 エスロンACドレン"};
  if(acIndex>=0&&other==="耐火二層管") return {product:"積水 エスロンACドレン→耐火二層管（内管接続＋認定区画処理）",assembly:orient({ac:"ACドレン管用受口",center:"ACドレン用塩ビ変換アダプター＋採用耐火二層管の専用接続継手",other:"耐火二層管内管・外層端部処理"}),note:"外層を剥がして一般塩ビ継手だけで済ませず、採用する耐火二層管メーカーの接続要領と区画認定を優先します。接続部の防露連続性も復旧。",url:"https://www.eslontimes.com/product/build/37/",maker:"積水化学 エスロンACドレン"};
  if(acIndex>=0) return {product:`エスロンACドレン→${other}（標準直結専用品なし・接続計画確認）`,assembly:orient({ac:"ACドレン管用受口",center:"ACドレン用アダプター→塩ビ短管等で標準端部化",other:`${other}側メーカーの専用変換端部`}),note:"ACドレン管へ金属ねじ・フランジを直接設ける構成ではありません。まず積水のアダプターで塩ビ標準端部へ変換し、相手側の適用継手へ接続します。支持・防露・排水勾配を別確認。",url:"https://www.eslontimes.com/product/build/37/",maker:"積水化学 エスロンACドレン"};
  const vpVu=pair.every(x=>["VP","VU"].includes(x));
  if(vpVu) return {product:"VP・VU 排水用接着接合（同呼び外径を継手仕様で切替）",assembly:[{label:"A側 配管",value:a},{label:"A側 接合",value:"用途に適合するTS／DV受口"},{label:"切替部",value:"同呼び用ソケットまたは継手（圧力・排水区分で選択）"},{label:"B側 接合",value:"用途に適合するTS／DV受口"},{label:"B側 配管",value:b}],note:"VPとVUは同一呼びの外径が共通でも肉厚・用途が異なります。圧力配管はTS、無圧排水はDVを基本に、設計指定と継手メーカー適用表で決定。",url:"https://www.kubota-chemix.co.jp/product/",maker:"クボタケミックス 塩ビ管・継手"};
  const susCopper=pair.some(x=>["SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ"].includes(x))&&pair.some(x=>x==="銅管");
  if(susCopper) return {product:"銅管→一般配管用SUS 専用変換ソケット",assembly:[{label:"A側 配管",value:a},{label:"A側 接合",value:a==="銅管"?"建築配管用銅管差込口":"SUS薄肉管差込口"},{label:"専用変換継手",value:"銅管・SUS用専用変換ソケット（例：ベンカンCS）"},{label:"B側 接合",value:b==="銅管"?"建築配管用銅管差込口":"SUS薄肉管差込口"},{label:"B側 配管",value:b}],note:"ねじ・フランジを介さず直接変換できる専用品があります。適用サイズは15A×13Su、20A×20Su、25A×25Su、32A×30Su、40A×40Su等。採用システムと工具を統一。",url:"https://www.benkan.co.jp/product/cs",maker:"ベンカン CS変換ソケット"};
  const proprietary=pair.filter(x=>["ナイスジョイント","ZlokⅡ"].includes(x));
  if(proprietary.length===2||proprietary.length===1&&pair.includes("SUS（一般配管用薄肉）")) return {product:"一般配管用SUS直管を介したシステム切替",assembly:[{label:"A側",value:`${a}のメーカー指定継手`},{label:"共通適用管",value:"JIS G 3448 一般配管用ステンレス鋼鋼管"},{label:"切替区間",value:"継手同士を直結せず、必要直管長を確保"},{label:"B側",value:`${b}のメーカー指定継手`},{label:"確認",value:"両メーカーの挿入長・加工余長・支持"}],note:"ナイスジョイントXとZlokⅡの継手部品を混用しません。双方が適用するSu直管上で工法を切り替え、各継手の専用工具・施工要領を守ります。",url:"https://www.kuwana-metals.com/download/cad/pdf.html",maker:"オーエヌ工業／桑名金属工業"};
  const hiPex=pair.includes("HIVP")&&pair.includes("架橋ポリエチレン管");
  if(hiPex) return {product:"積水 エスロンHIVP管用PEX変換アダプター",assembly:[{label:"A側 配管",value:a},{label:"A側 接合",value:a==="HIVP"?"HIVP接着受口":"PEX専用接続口"},{label:"専用変換継手",value:"HIVP→PEX ダイレクト変換アダプター"},{label:"B側 接合",value:b==="HIVP"?"HIVP接着受口":"PEX専用接続口"},{label:"B側 配管",value:b}],note:"ねじ継手を2個組み合わせず、メーカーのダイレクト変換アダプターを優先します。サイズ13・16・20の適用管と施工工具を確認。",url:"https://www.sekisui.co.jp/search/detail-3146.html",maker:"積水化学 エスロンHIVP変換アダプター"};
  return null;
}

function buildConversion(s:MaterialSearch):Rule[] {
  let a=s.pipe, b=s.targetPipe;
  if(a.includes("→")){const pair=a.split("→").map((x)=>x.trim());a=pair[0];b=pair[1]==="SUS"?"SUS（厚肉）":pair[1];}
  const dedicated=dedicatedConversion(a,b);
  if(dedicated)return [{purpose:s.purpose,pipe:`${a} → ${b}`,category:"異種管変換",product:dedicated.product,grade:"条件付",note:dedicated.note,assembly:dedicated.assembly,gasket:"接着・専用変換継手のためフランジガスケット不要。使用する接着剤、シール、パッキンは各専用継手の施工要領に従う。",maker:dedicated.maker,url:dedicated.url,linkLabel:"公式製品ページ",linkMatch:"製品一致"}];
  const flange=s.conversionMethod==="フランジ";
  const proprietary=["ナイスジョイント","ZlokⅡ"].includes(a)||["ナイスジョイント","ZlokⅡ"].includes(b);
  const metallic=(x:string)=>["SGP黒ガス","SGP白ガス","STPG","塩ビライニング鋼管（VA・VB・VD）","PE粉体ライニング鋼管（PA・PB・PD）","SUS（厚肉）","SUS（一般配管用薄肉）","ナイスジョイント","ZlokⅡ","銅管","冷媒銅管","ダクタイル鋳鉄管"].includes(x);
  const needsIsolation=metallic(a)&&metallic(b)&&((a.startsWith("SGP")||a==="STPG"||a.includes("銅"))!== (b.startsWith("SGP")||b==="STPG"||b.includes("銅")));
  const center=flange
    ? `${needsIsolation?"絶縁形":""}JISフランジ接続（両側の呼び径・圧力クラス・座面を一致）`
    : `${needsIsolation?"絶縁対策を含む":""}Rおねじ＋Rcめねじの直接接続（同径・同一ねじ規格）。両側めねじの場合は適合ニップルを追加`;
  const gasket=flange?gasketFor(s.purpose,a,b):"フランジを使用しないためガスケット不要（ねじシール材・絶縁部材は別途選定）";
  return [{purpose:s.purpose,pipe:`${a} → ${b}`,category:"異種管変換",product:`${a}から${b}への変換一式`,grade:a===b?"要確認":"条件付",
    note:`片側だけでなく接続一式で選定します。${!flange?"ねじ接続は、おねじとめねじを対で選びます。両側がおねじ、または異なる呼び径・ねじ規格の直結は不可です。":""}${proprietary?" ナイスジョイントXとZlokⅡの専用継手本体同士は混用せず、各メーカー純正アダプタの標準ねじ・フランジ部で切り替えてください。":""} 型番は口径・圧力・温度・管規格確定後にメーカー適用表で決定。`,
    assembly:[{label:"A側 配管",value:a},{label:"A側 継手",value:conversionSide(a,"A",flange)},{label:"接続部",value:center},{label:"B側 継手",value:conversionSide(b,"B",flange)},{label:"B側 配管",value:b}],
    gasket,
    ...(a==="ZlokⅡ"||b==="ZlokⅡ"?catalogRefs.zlok2:a==="ナイスジョイント"||b==="ナイスジョイント"?catalogRefs.niceJoint:catalogRefs.gasket)
  }];
}

function waterProfileMaterials(s:MaterialSearch,profile:WaterPipeProfile):Rule[]{
  const grade=profile.status==="標準候補"?"推奨" as const:"要確認" as const;
  const base={purpose:"給水",pipe:profile.pipe,grade,maker:profile.maker,url:profile.url,linkLabel:"公式製品ページ" as const,linkMatch:"製品群一致" as const};
  const rows:Record<string,[string,string]>={
    "管":[`${profile.pipe}｜${profile.standard}`,`${profile.zone}での採用候補。${profile.note}`],
    "継手":[profile.joint,`${profile.standard}に適合する同一メーカー／認証システムを使用。${profile.note}`],
    "バルブ":["給水用認証・仕様適合バルブ＋管種専用接続端部",`青銅・SUS・樹脂製等から圧力、口径、水質、設置場所で選定。${profile.joint}との接続部を別途確認。`],
    "逆止弁":["給水用逆止弁／チャッキ弁＋管種専用接続端部","給水方式、ポンプ、ウォータハンマ、設置姿勢、認証、点検スペースを確認。"],
    "ストレーナ":["給水用Y形ストレーナ＋管種専用接続端部","メッシュ、圧力損失、清掃スペース、機器上流の設置条件を確認。"],
    "フランジ":["管種専用フランジ短管／フランジアダプタ","JIS10K・上水形等の規格、呼び径、座面、ボルト、パッキンを相手側と一致。"],
    "ガスケット・パッキン":["給水適合ガスケット（管・フランジメーカー指定）","飲料水適合、材質、RF/FF、呼び径、締付トルクを確認。樹脂フランジは専用全面形を優先。"],
    "吊り・支持":[`${profile.pipe}対応の吊り・立管・固定支持`,"満水重量、支持ピッチ、伸縮、集中荷重、防振、異種金属絶縁、樹脂管の変形を確認。"],
    "保温":["給水管防露保温＋防湿層・外装","結露条件、保温厚、継手・弁・支持部の防湿連続性、屋外防水を確認。"],
    "接合材":["管種・継手メーカー指定の接着剤／シール材／融着工具・記録材",`${profile.joint}の施工要領を優先し、異なる管システムの材料・工具を混用しない。`],
    "スリーブ・区画処理":["管種・保温仕様に適合する認定区画貫通材","樹脂管・金属管、管径、保温厚、壁床構造、開口寸法、認定番号を完全一致させる。"]
  };
  const categories=s.category==="すべて"?["管","継手","バルブ","フランジ","吊り・支持","保温","接合材","スリーブ・区画処理"]:[s.category];
  return categories.filter(c=>rows[c]).map(c=>({...base,category:c,product:rows[c][0],note:rows[c][1]}));
}

function selectMaterials(s: MaterialSearch): Rule[] {
  if(s.purpose!=="すべて"&&s.pipe!=="すべて"&&!pipeOptionsForPurpose(s.purpose).includes(s.pipe)) return [];
  if(s.category==="異種管変換"&&s.pipe!=="すべて") return buildConversion(s);
  if(s.purpose==="給水"){
    const profiles=s.pipe==="すべて"?waterPipeProfiles:waterPipeProfiles.filter(x=>x.pipe===s.pipe);
    if(profiles.length)return profiles.flatMap(p=>waterProfileMaterials(s,p));
  }
  if(s.purpose==="ポンプアップ"&&s.pipe==="HIVP"){
    const base={purpose:s.purpose,pipe:s.pipe,grade:"条件付" as const};
    const rows:Record<string,[string,string]>= {
      "管":["積水化学 エスロンHIパイプ","ポンプ吐出圧力、全揚程、ウォーターハンマ、流体温度、口径、屋内外条件に対してHIVPの許容圧力を確認。自然流下排水用のVUとは区別する。"],
      "継手":["エスロンHI継手（HI-TS継手）","HIVP対応のHI継手と指定接着剤を使用。ポンプ・弁との接続は適合するバルブソケット、フランジ等を選び、樹脂側へ機器荷重を掛けない。"],
      "バルブ":["ポンプ吐出用逆止弁＋仕切弁／ボール弁","ポンプ直近の逆止弁、止水弁、可とう接続を設計図書に従って構成。急閉止による衝撃圧と保守時の取外し空間を確認。"],
      "逆止弁":["ポンプアップ用チャッキ弁","汚水・雑排水等の流体、異物通過性、取付姿勢、閉止速度、圧力損失を確認。弁重量は管へ負担させず独立支持する。"],
      "吊り・支持":["HIVP用吊りバンド・立バンド・振れ止め","満水重量、ポンプ振動、弁類集中荷重を考慮し、曲がり・分岐・弁・ポンプ接続部を追加支持する。"],
      "接合材":["エスロンHI用接着剤・清掃材","切断、面取り、標線、塗布、挿入保持、養生時間を施工要領どおり管理し、通水・圧力試験前に必要養生を確保する。"],
      "スリーブ・区画処理":["HIVPに適合する認定区画貫通工法","床・壁、管径、開口、充填材、認定番号を一致させる。ポンプ振動や管の伸縮を区画処理部へ伝えない。"],
    };
    const categories=s.category==="すべて"?Object.keys(rows):[s.category];
    return categories.filter(c=>rows[c]).map(c=>({
      ...base,category:c,product:rows[c][0],note:rows[c][1],
      ...(c==="吊り・支持"?catalogRefs.support:c==="バルブ"||c==="逆止弁"?catalogRefs.resinValve:c==="スリーブ・区画処理"?catalogRefs.firestop:catalogRefs.hivp),
    }));
  }
  if (s.purpose === "すべて" || s.pipe === "すべて" || s.category === "すべて") {
    return rules.filter((r) => (s.purpose === "すべて" || r.purpose === s.purpose || r.purpose === "共通") && (s.pipe === "すべて" || r.pipe === s.pipe) && (s.category === "すべて" || r.category === s.category));
  }
  const base = { purpose: s.purpose, pipe: s.pipe, category: s.category };
  const isSteam = s.purpose === "蒸気" || s.purpose === "蒸気還水";
  const isSus = s.pipe.startsWith("SUS");
  const isPvc = ["VP", "VU", "HIVP", "HTVP", "空調ドレン用結露防止管"].includes(s.pipe);
  const conversion = s.pipe.includes("→");
  const exact = rules.filter((r) => (r.purpose === s.purpose || r.purpose === "共通") && r.pipe === s.pipe && r.category === s.category);
  if(isSteam&&["ナイスジョイント","ZlokⅡ"].includes(s.pipe)) return [{...base,product:"標準候補なし（適用流体を再確認）",grade:"要確認",note:"この検索では蒸気用継手として選定しません。蒸気圧力・温度に適合する厚肉SUS管と溶接・ねじ・フランジ接合等へ管種を変更し、設計図書とメーカー資料で確認してください。",...(s.pipe==="ZlokⅡ"?catalogRefs.zlok2:catalogRefs.niceJoint)}];
  if(s.purpose==="空調ドレン") {
    const drain:Record<string,[string,string,string?][]>={
      "管":[[s.pipe==="空調ドレン用結露防止管"?"積水化学 エスロンACドレンパイプ":"積水化学 エスロンVP／VUパイプ（設計指定）","ドレン温度、管径、勾配、結露条件、区画貫通を確認。結露防止管は管・継手を同一システムで構成。"]],
      "継手":[[s.pipe==="空調ドレン用結露防止管"?"エスロンACドレン継手（90°・45°エルボ、チーズ、45°Y、ソケット、アダプター）":"エスロンDV／TS継手","排水勾配と流れ方向を優先。透明ACドレン継手は接合状態を目視確認できる採用候補。","https://www.sekisui.co.jp/search/detail-3259.html"]],
      "異種管変換":[["積水化学の専用アダプター＋相手管側変換継手","両側の呼び径・R/Rcねじ・接着受口を一式表示して選定。金属管との接続は樹脂側へ曲げ・締付荷重を伝えない。"]],
      "吊り・支持":[["結露防止管対応バンド／吊りバンド／立バンド","断熱層を潰さず、勾配を保持。継手・立上り・ドレンアップ出口・掃除口近傍を追加支持。"]],
      "保温":[[s.pipe==="空調ドレン用結露防止管"?"一体発泡断熱層＋切断端・接続部の専用防露処理":"独立気泡保温筒＋防湿層","管本体だけでなく継手、吊り部、機器接続、端末まで防露を連続させる。"]],
      "接合材":[["積水化学指定の塩ビ管用接着剤・清掃材","管・継手の種類、挿入長、塗布、保持、養生時間を施工要領で確認。冷媒配管用接着剤とは区別。"]],
      "計器・ドレン":[["掃除口・透明継手・通気部材","ドレンパンからの逆勾配、トラップ、ドレンアップ立上り限界、清掃可能性を機器施工要領で確認。"],["ドレンアップ配管・逆流防止構成","室内機メーカー指定径、揚程、横引き長さ、立上り位置、支持を優先。"]],
      "スリーブ・区画処理":[["ACドレン管適用の積水化学フィブロック認定工法","壁／床、構造、管径、開口、埋戻し、認定番号を施工箇所ごとに照合。","https://www.sekisui.co.jp/fp/products/pvc.html"]],
      "ガスケット・パッキン":[["通常の接着接合部はガスケット不要","機器・金物とのフランジ接続がある場合のみ、相手製品メーカー指定パッキンを選定。"]]
    };
    const rows=drain[s.category];
    if(rows)return rows.map(([product,note,url])=>({...base,product,grade:"条件付" as const,note,maker:"積水化学 エスロンACドレン",url:url||catalogRefs.acDrain.url,linkLabel:url?"公式製品ページ":catalogRefs.acDrain.linkLabel,linkMatch:url?"製品一致":catalogRefs.acDrain.linkMatch}));
  }
  if (isSteam && s.category === "吊り・支持") {
    const common = "支持荷重・管径・保温厚・支持間隔と、固定点／ガイド／自由支持の役割を施工図で確認。";
    return [
      { ...base, product: "三連タンバックル A10320（電気亜鉛めっき／SUS304）", grade: "条件付", note: `管の熱伸縮を吸収する吊り構成。単独で固定支持にはしない。${common}`, maker: "アカギ A10320", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10320.htm", linkLabel:"公式製品ページ", linkMatch:"製品一致" },
      { ...base, product: "組式ローラー A10593（20A～300A）", grade: "推奨", note: `吊り位置で軸方向の熱伸縮を逃がすローラー。200A以上は設計条件をメーカー確認。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10593.htm" },
      { ...base, product: "角型ローラー A10588（20A～300A）", grade: "推奨", note: `熱伸縮配管用。大口径は補強・製作条件を確認。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10588.htm" },
      { ...base, product: "置式ローラーAタイプ A10589", grade: "推奨", note: `架台上で管を軸方向に移動させる自由支持。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10589.htm" },
      { ...base, product: "置式ローラーBタイプ A10590（ガイド付）", grade: "推奨", note: `軸方向の移動を許しながら横振れを規制するガイド付支持。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10590.htm" },
      { ...base, product: "置式ローラーCタイプ A10592（SUS製あり）", grade: "条件付", note: `熱伸縮配管用。SUS管ではステンレス仕様または絶縁を選択。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10592.htm" },
      { ...base, product: "提灯式吊バンド A10145／ロック付 A10146", grade: "条件付", note: `SGP管の一般吊り支持。熱移動が大きい場所はローラーや三連タンバックル等と使い分ける。${common}`, maker: "アカギ", url: "https://www.akagi-nt.co.jp/seihin_guide/seihin_htm/A10145.htm" },
      { ...base, product: "吊りバンド＋吊りボルト＋インサート", grade: "条件付", note: `一般部の荷重支持一式。蒸気管を全箇所で強固に拘束せず、伸縮計画に合わせて配置。${common}`, ...catalogRefs.support },
      { ...base, product: "Uボルト／Uバンド（架台支持）", grade: "条件付", note: `固定・ガイド・滑動のどの役割かを明確にする。滑動部は締め過ぎや保温潰れに注意。${common}`, ...catalogRefs.support },
      { ...base, product: "立バンド／立管バンド／ブラケット", grade: "条件付", note: `立管の重量支持・振れ止め用。熱伸縮と各階荷重の受け方を検討。${common}`, ...catalogRefs.support },
      { ...base, product: "固定金具・アンカー・ガイドシュー", grade: "条件付", note: `伸縮を狙った方向へ誘導する固定点とガイド。反力を建築側へ伝達できるか構造確認。${common}`, ...catalogRefs.support },
      { ...base, product: "スプリングハンガー／コンスタントハンガー", grade: "要確認", note: `大きな上下変位・高温・重量配管で検討する製作品。荷重と変位量を専門メーカー計算で選定。${common}`, ...catalogRefs.support },
      { ...base, product: "パイプシュー／サドル／クランプ", grade: "条件付", note: `保温を潰さず架台に荷重を伝える支持。材質、シュー高さ、滑り板、溶接可否を確認。${common}`, ...catalogRefs.support },
      { ...base, product: "防振吊り／防振ゴム（機器接続部）", grade: "要確認", note: `ポンプ等の振動絶縁が必要な範囲だけに使用。蒸気温度がゴムへ直接影響しない構成を確認。${common}`, ...catalogRefs.support },
    ];
  }
  if (isSteam) {
    const mat = isSus ? "SUS" : "鋼製";
    const steamFamilies: Record<string, Array<[string, string, string, string]>> = {
      "管": [[isSus ? "配管用ステンレス鋼鋼管 JIS G 3459（指定Sch）" : s.pipe === "STPG" ? "圧力配管用炭素鋼鋼管 STPG（指定Sch）" : "配管用炭素鋼鋼管 SGP黒／設計指定管", "圧力温度と腐食環境から管規格・Schを決定。", isSus ? "ベンカン" : "JFEスチール", isSus ? "https://www.benkan.co.jp/product" : "https://www.jfe-steel.co.jp/products/koukan/"]],
      "継手": [
        [`${mat} 90°・45°エルボ`, "ねじ込み／突合せ溶接／差込み溶接を管径・Schで選択。", "ベンカン機工", "https://www.benkan-kikoh.com/product/"],
        [`${mat} チーズ・クロス`, "同径・径違いを設計口径で選択。", "ベンカン機工", "https://www.benkan-kikoh.com/product/"],
        [`${mat} 同心・偏心レジューサ`, "横引き蒸気・ドレンの勾配とエア／ドレン溜まりを考慮。", "ベンカン機工", "https://www.benkan-kikoh.com/product/"],
        [`${mat} ソケット・ユニオン・ニップル`, "小口径ねじ配管用。シール材の温度範囲を確認。", "リケン", "https://www.riken.co.jp/products/piping/"],
        [`${mat} キャップ・プラグ`, "末端閉止用。将来撤去やブロー時の安全を確認。", "リケン", "https://www.riken.co.jp/products/piping/"],
        [`${mat} フランジアダプタ`, "機器・弁の接続規格に一致させる。", "ベンカン機工", "https://www.benkan-kikoh.com/product/"],
      ],
      "バルブ": [
        [`${mat}グローブ弁（玉形弁）`, "遮断・絞り用。蒸気温度、圧力クラス、弁座材質を確認。", "KITZ", "https://www.kitz.co.jp/product/"],
        [`${mat}ゲート弁`, "全開・全閉用。絞り運転は避ける。", "KITZ", "https://www.kitz.co.jp/product/"],
        [`${mat}ボール弁（蒸気対応シート）`, "製品ごとの最高使用温度・圧力を確認。", "KITZ", "https://www.kitz.co.jp/product/"],
        [`${mat}ベローズシール弁`, "外部漏れ低減が必要な箇所で検討。", "ヨシタケ", "https://www.yoshitake.co.jp/product/"],
        ["減圧弁", "一次・二次圧、蒸気量、口径、前後直管、ドレン分離で選定。", "ヨシタケ", "https://www.yoshitake.co.jp/product/"],
        ["電動／空気式調節弁", "Cv値、レンジアビリティ、フェイル動作、騒音を計算。", "アズビル", "https://www.azbil.com/jp/product/ba/factory/factory-product/control-valve/"],
        ["安全弁・逃し弁", "吹出し量・設定圧力・法規で口径選定。", "ベン", "https://www.venn.co.jp/products/safety_relief_valve"],
      ],
      "逆止弁": [["スイングチャッキ弁", "水平・立上り、流速とウォータハンマを確認。", "KITZ", "https://www.kitz.co.jp/product/"], ["リフトチャッキ弁", "設置姿勢と必要差圧を確認。", "KITZ", "https://www.kitz.co.jp/product/"], ["ディスクチャッキ弁", "低慣性・省スペース。流れ方向とばね仕様を確認。", "ヨシタケ", "https://www.yoshitake.co.jp/product/"]],
      "ストレーナ": [["Y形ストレーナ", "減圧弁・トラップ・制御弁の上流に設置。メッシュとブロー方向を確認。", "ヨシタケ", "https://www.yoshitake.co.jp/product/"], ["U形／バケット形ストレーナ", "大流量・清掃頻度に応じて選択。", "ベン", "https://www.venn.co.jp/products/strainer"], ["仮設コーンストレーナ", "試運転フラッシング用。差圧監視と撤去時期を計画。", "巴バルブ", "https://www.tomoevalve.com/product/"]],
      "スチームトラップ": [["ディスク式トラップ AD-22F", "主管ドレンなど。差圧、背圧、凍結、作動音を確認。", "ベン AD-22F", "https://www.venn.co.jp/products/steam_trap/ad-22f"], ["フリーフロート式トラップ JX／FJ32シリーズ", "連続排出・プロセス機器向け。エア抜きと容量を確認。", "TLV JX/FJ32", "https://www.tlv.com/products/steam-traps/mechanical/process"], ["バケット式トラップ AK-5", "耐久性重視。初期プライミングとエア排出を確認。", "ベン AK-5", "https://www.venn.co.jp/products/steam_trap/ak-5"], ["フロート式トラップ AF-15H", "熱交換器向け。容量、差圧、取付姿勢を確認。", "ベン AF-15H", "https://www.venn.co.jp/products/steam_trap/af-15h"], ["バイパス付トラップ ADB-20", "トラップ・止弁・バイパス一体型。適用圧力と取付姿勢を確認。", "ベン ADB-20", "https://www.venn.co.jp/products/steam_trap/adb-20"]],
      "伸縮継手・付属品": [["ベローズ形伸縮継手", "伸縮量、繰返し回数、固定点反力、ガイド間隔で選定。", "昭和技研工業", "https://www.sgk-p.co.jp/product/"], ["スリーブ形伸縮継手", "パッキン保守と固定点・ガイドを確認。", "ベン", "https://www.venn.co.jp/products/expansion_joint"], ["ループ配管・オフセット", "配管自体のたわみで伸縮吸収。応力計算とスペースを確認。", "国土交通省標準仕様", "https://www.mlit.go.jp/gobuild/gobuild_tk2_000017.html"], ["セパレータ・ドレンセパレータ", "乾き度改善。圧損とドレン排出容量を確認。", "TLV", "https://www.tlv.com/ja-jp/products/separators"]],
      "計器・ドレン": [["圧力計＋サイホン管＋ゲージコック", "蒸気温度を直接計器へ伝えない構成。", "長野計器", "https://www.naganokeiki.co.jp/product/"], ["温度計＋サーモウェル", "挿入長、流速、圧力、材質を確認。", "長野計器", "https://www.naganokeiki.co.jp/product/"], ["ドレンポット／ドリップレッグ", "主管低部・立上り前で凝縮水を捕集。口径と深さを確認。", "TLV", "https://www.tlv.com/ja-jp/steam-info/steam-theory/steam-basics/"], ["エアベント", "始動時空気排除。取付位置と排出先を確認。", "TLV", "https://www.tlv.com/ja-jp/products/air-vents"]],
      "フランジ": [[`${mat}板／スリップオンフランジ`, "JIS 5K・10K・16K・20K等を設計圧力温度で選択。", "イノック", "https://www.inocj.com/product/"], [`${mat}突合せ溶接フランジ`, "高温・高圧・大口径で管Schと一致。", "ベンカン機工", "https://www.benkan-kikoh.com/product/"], [`${mat}ねじ込みフランジ`, "小口径ねじ配管用。シール材温度を確認。", "イノック", "https://www.inocj.com/product/"]],
      "ガスケット・パッキン": [["膨張黒鉛系うず巻形ガスケット", "蒸気の圧力温度・フランジ規格・内外輪材質で選定。", "ニチアス", "https://www.nichias.co.jp/products/industrial/gasket/"], ["ジョイントシートガスケット（蒸気対応品）", "製品ごとの温度圧力限界と面圧を確認。", "ニチアス", "https://www.nichias.co.jp/products/industrial/gasket/"], ["メタルジャケット形ガスケット", "高温高圧・特殊フランジでメーカー選定。", "バルカー", "https://www.valqua.co.jp/product/gasket/"]],
      "保温": [["けい酸カルシウム保温材", "高温配管。保温厚、外装、防水を仕様書で確認。", "ニチアス", "https://www.nichias.co.jp/products/industrial/thermal-insulation/"], ["ロックウール保温筒・マット", "温度範囲と密度、外装を確認。", "ニチアス", "https://www.nichias.co.jp/products/industrial/thermal-insulation/"], ["弁・フランジ用脱着保温カバー", "保守部を脱着可能にする。表面温度と屋外防水を確認。", "ニチアス", "https://www.nichias.co.jp/products/industrial/thermal-insulation/"], ["カラー鉄板／SUSラッキング", "屋内外、腐食環境、板厚、雨仕舞を確認。", "日本保温保冷工業協会", "https://www.ho-on-ho-rei.or.jp/"]],
      "接合材": [["蒸気用ねじシール剤・シールテープ", "最高使用温度・圧力と流体適合を確認。", "ヘンケル", "https://www.henkel-adhesives.com/jp/ja/products/industrial-sealants.html"], [`${mat}溶接棒・溶接ワイヤ`, "母材・Sch・溶接施工要領に合わせる。", "神戸製鋼", "https://www.kobelco-welding.jp/products/"], ["フランジボルト・ナット", "材質、強度区分、焼付き防止、締付管理を確認。", "BUMAX", "https://www.bumax-fasteners.com/"]],
      "スリーブ・区画処理": [["鋼製スリーブ＋ロックウール＋耐火シール", "国交省仕様と区画認定、保温有無、開口径を照合。", "因幡電工", "https://www.inaba-denko.com/ja/product/firestop/"], ["認定防火区画貫通キット", "壁／床、管材、管径、保温厚を認定書と完全一致させる。", "古河電工", "https://www.furukawa.co.jp/fitel/system/fireproof/"]],
    };
    const rows = steamFamilies[s.category];
    if (rows) return rows.map(([product, note, maker, url]) => ({
      ...base,
      product,
      grade: "条件付" as const,
      note,
      maker: !isSus && maker === "ベンカン機工" ? "管本体：JFEスチール／継手：ベンカン機工" : maker,
      url,
    }));
  }
  if (exact.length) return exact.map((r)=>({...r,...relevantCatalogRef(s)}));
  if (conversion) return [{ ...base, product: "メーカー指定の変換継手／絶縁ユニオン／絶縁フランジ", grade: "条件付", note: "両側の管規格・口径・接合方式と、異種金属接触腐食、使用圧力・温度を確認。変換アダプタの適用表から選定。型番未確定のため特定メーカーURLは表示しません。" }];
  if (isSteam && isPvc) return [{ ...base, product: "標準候補なし（管種の再確認）", grade: "要確認", note: "一般的なVP・VUは蒸気温度に適しません。設計図書で耐熱管種と圧力温度を再確認してください。", ...catalogRefs.pvc }];
  if (isSteam && isSus) {
    const steamSus: Record<string, [string, string, (keyof typeof catalogRefs)?]> = {
      "管": ["配管用ステンレス鋼鋼管 JIS G 3459（設計指定Sch）", "蒸気圧力・温度、腐食環境、溶接仕様から材質とスケジュールを決定。一般配管用薄肉管とメカニカル継手は蒸気適用を個別確認。", "stainless"],
      "継手": ["SUS製突合せ溶接継手／差込み溶接継手／ねじ込み継手", "管Sch、接合方式、圧力温度に合わせる。EGジョイントはメーカー資料上、蒸気配管に使用不可。", "stainless"],
      "バルブ": ["SUS製グローブ弁（流量調整）／ゲート弁（全開全閉）／ボール弁", "本体・弁座・パッキンの蒸気温度、圧力クラス、接続規格を製品ごとに確認。", "metalValve"],
      "逆止弁": ["SUS製スイング／リフト／ディスク式チャッキ弁", "設置姿勢、最低差圧、ウォータハンマ、蒸気・還水の区別を確認。", "metalValve"],
      "ストレーナ": ["SUS製Y形ストレーナ", "蒸気用ガスケット、スクリーンメッシュ、ブロー方向と保守スペースを確認。", "metalValve"],
      "フランジ": ["SUS製JIS 10K・20K等フランジ", "設計圧力・温度と管Sch、RF/FF、溶接形式を一致させる。", "stainless"],
      "ガスケット・パッキン": ["膨張黒鉛系うず巻形ガスケット等の蒸気対応品", "フランジ規格、圧力温度、内外輪材質、メーカー適用表で選定。"],
      "吊り・支持": ["SUS用絶縁ローラーバンド／ローラー支持・ガイド・固定金具", "熱伸縮を逃がし、異種金属との直接接触を避ける。固定点とガイド位置は施工図で確認。", "support"],
      "保温": ["けい酸カルシウム／ロックウール等＋外装", "表面温度、保温厚、屋内外、防水、バルブ脱着部を仕様書で確認。"],
      "接合材": ["SUS対応溶接材料／蒸気用シール材", "母材材質、溶接施工要領、酸洗・不動態化、ねじ部の温度対応を確認。"],
      "スリーブ・区画処理": ["認定工法のSUS管対応防火区画貫通材", "壁・床、管径、保温有無、開口寸法が認定範囲内か照合。"],
      "異種管変換": ["絶縁フランジ／絶縁ユニオン／メーカー指定変換継手", "接続相手の材質と接合方式を指定して選定。"],
    };
    const v = steamSus[s.category];
    return [{ ...base, product: v[0], grade: "条件付", note: v[1], ...(v[2]?catalogRefs[v[2]]:{}) }];
  }
  const ref = relevantCatalogRef(s);
  const generic: Record<string, string> = {
    "管": `${s.pipe}（設計図書指定の規格・肉厚）`, "継手": `${s.pipe}専用のエルボ・チーズ・ソケット・レジューサ`, "異種管変換": "相手管を指定してメーカー適用表から変換継手を選定", "バルブ": `${s.purpose}対応のゲート弁・グローブ弁・ボール弁・バタフライ弁`, "逆止弁": `${s.purpose}対応のチャッキ弁`, "ストレーナ": `${s.purpose}対応Y形ストレーナ`, "フランジ": `${s.pipe}対応フランジ`, "ガスケット・パッキン": `${s.purpose}の圧力温度・流体に対応するガスケット`, "吊り・支持": `${s.pipe}対応の吊りバンド・Uボルト・立バンド・固定金具`, "保温": `${s.purpose}の温度・結露条件に対応する保温材と外装`, "接合材": `${s.pipe}専用のシール材・接着剤・ろう材・溶接材料`, "スリーブ・区画処理": `${s.pipe}・保温・壁床仕様に適合する認定区画貫通材`,
  };
  const families: Record<string, string[]> = {
    "管": [generic["管"]],
    "継手": ["90°エルボ・45°エルボ", "チーズ・クロス", "同心／偏心レジューサ", "ソケット・カップリング", "ユニオン", "ニップル・ブッシング", "キャップ・プラグ", "フランジアダプタ"],
    "異種管変換": ["変換ソケット／アダプタ", "絶縁ユニオン", "絶縁フランジ", "メカニカル形異種管継手"],
    "バルブ": ["ゲート弁", "グローブ弁（玉形弁）", "ボール弁", "バタフライ弁", "ニードル弁", "ダイヤフラム弁", "減圧弁・調整弁"],
    "逆止弁": ["スイングチャッキ弁", "リフトチャッキ弁", "ディスクチャッキ弁", "ボールチャッキ弁"],
    "ストレーナ": ["Y形ストレーナ", "U形ストレーナ", "バケット形ストレーナ", "仮設コーンストレーナ"],
    "フランジ": ["板フランジ", "差込み溶接フランジ", "突合せ溶接フランジ", "ねじ込みフランジ", "遊合形フランジ"],
    "ガスケット・パッキン": ["全面形シートガスケット", "リング形シートガスケット", "うず巻形ガスケット", "メタルジャケット形ガスケット", "弁棒グランドパッキン"],
    "吊り・支持": ["吊りバンド", "Uボルト・Uバンド", "立バンド", "固定金具・ガイド", "ローラー支持", "パイプシュー・サドル", "防振支持"],
    "保温": ["保温筒・保温板", "エルボ／バルブ用保温", "防湿層", "屋内外装材", "ラッキング・保護カバー"],
    "接合材": isPvc?["管種対応の専用接着剤（VP・VU／HI／HTを区別）","面取り・清掃材とメーカー指定工具"]:["銅管","冷媒銅管"].includes(s.pipe)?["銅りんろう等の用途対応ろう材","窒素置換用器具・フラックス（必要な接合のみ）"]:["架橋ポリエチレン管","ポリブテン管"].includes(s.pipe)?["メーカー指定の専用継手・インコア","専用拡管・圧着工具とゲージ"]:["ねじ配管用シール材","母材に適合する溶接棒・溶接ワイヤ","フランジ用ボルト・ナット"],
    "スリーブ・区画処理": ["鋼製／樹脂製スリーブ", "ロックウール充填材", "耐火シール材", "認定区画貫通キット", "止水材・防水つば"],
  };
  const maker="maker" in ref?ref.maker:"";
  return (families[s.category] || [generic[s.category]]).map((product) => ({ ...base, product:maker?`${maker}｜採用例：${product}`:`採用例：${product}`, grade: "要確認" as const, note: `代表的な採用候補です。${s.pipe}・${s.purpose}での適否、圧力・温度・口径・接続方式・認定とメーカー適用範囲で最終選定。`, ...ref }));
}
type FirestopSelection={title:string;judgement:string;methods:string[];checks:string[];steps:string[];source:string;sourceUrl:string};
const firestopPipes=["SGP・STPG（鋼管）","SUS管","銅管","VP・VU","HIVP","HTVP","耐火二層管","空調ドレン用結露防止管","冷媒用被覆銅管","架橋ポリエチレン管・ポリブテン管"];
const firestopWalls=["RC・SRC壁","ALC壁","耐火間仕切壁（LGS＋せっこうボード）","RC床・スラブ","デッキプレート床"];
const refrigerantSizeOptions=[
  "2分3分：液6.35mm（1/4）＋ガス9.52mm（3/8）",
  "2分4分：液6.35mm（1/4）＋ガス12.70mm（1/2）",
  "2分5分：液6.35mm（1/4）＋ガス15.88mm（5/8）",
  "3分5分：液9.52mm（3/8）＋ガス15.88mm（5/8）",
  "3分6分：液9.52mm（3/8）＋ガス19.05mm（3/4）",
  "3分7分：液9.52mm（3/8）＋ガス22.22mm（7/8）",
  "単管 2分：6.35mm（1/4インチ）",
  "単管 3分：9.52mm（3/8インチ）",
  "単管 4分：12.70mm（1/2インチ）",
  "単管 5分：15.88mm（5/8インチ）",
  "単管 6分：19.05mm（3/4インチ）",
  "単管 7分：22.22mm（7/8インチ）",
  "その他（現場入力）"
];
function selectFirestop(pipe:string,wall:string,size:string,insulation:string):FirestopSelection{
  const resin=/VP|HIVP|HTVP|ポリエチレン|ポリブテン|ドレン/.test(pipe);
  const refrigerant=pipe.includes("冷媒用被覆銅管");
  const fireDouble=pipe.includes("耐火二層管"),dry=wall.includes("間仕切"),floor=wall.includes("床")||wall.includes("スラブ");
  const combustibleInsulation=insulation.includes("発泡")||insulation.includes("ゴム");
  const common=[`認定書の管種が「${pipe}」と一致`,`呼び径 ${size||"未入力"} と実外径・開口径が認定範囲内`,`貫通部位「${wall}」と壁厚・床厚・中空構造が一致`,`保温「${insulation}」の材質・厚さが一致`,`片側／両側施工、充填深さ、支持距離が認定図どおり`];
  let methods:string[],judgement:string;
  if(fireDouble){methods=["耐火二層管メーカー指定のモルタル埋戻し工法","同一製品系列の認定区画貫通処理材（対象壁・床に適合する場合）"];judgement="耐火二層管でも、継手・開口・壁床との組合せまで自動的に適合するわけではありません。メーカー認定図で選定します。";}
  else if(resin||combustibleInsulation){methods=["熱膨張材入り防火区画貫通キット（テープ・シート・ブロック・スリーブ形）","管種・保温材・壁床に適合するメーカー個別認定工法"];judgement="樹脂管または可燃性保温材は火災時に焼失するため、開口を閉塞する熱膨張材を含む認定工法が基本候補です。";}
  else{methods=["鋼製スリーブ＋ロックウール等＋耐火シール材の認定工法","金属管用のモルタル埋戻し／認定充填工法","保温付きの場合は保温材まで含むメーカー個別認定工法"];judgement="不燃性金属管でも、すき間を埋めるだけではなく壁床・管径・保温を含む認定仕様との照合が必要です。";}
  if(refrigerant){
    methods.unshift("因幡電工 耐火キャップNX（IRC-NX）— 冷媒被覆銅管・ドレン管・制御ケーブルを含む認定範囲から選定");
    methods.push("積水化学 フィブロック冷媒管用パテレスキット／冷媒管用テープ（適用する壁・床の認定を選定）");
    judgement="冷媒配管は耐火キャップ工法も候補です。液管・ガス管・ドレン管・制御ケーブルの本数と外径、被覆厚、開口径、壁床構造を一つの組合せとして認定書に照合します。";
    common.push("液管・ガス管・ドレン管・制御ケーブルの本数と組合せが認定範囲内","冷媒銅管のミリ径・インチ径・現場呼称（分）が同じ管を示している","耐火キャップの呼び径は銅管径ではなく、認定上の貫通穴径・収容物条件から選ぶ");
  }
  if(dry)methods.unshift("中空耐火間仕切壁専用の両面施工型認定キット");
  if(floor)methods.push("床用落下防止金具・支持材を含む認定工法");
  return {title:`${pipe} × ${wall}`,judgement,methods:[...new Set(methods)],checks:common,steps:["壁・床の認定構造と厚さを建築へ確認","管外径・保温外径・開口径を実測","候補メーカーの最新認定一覧で条件を絞る","認定図どおりの材料・数量・充填深さで施工","施工者・認定番号・施工前後写真を記録し表示ラベルを貼付"],source:refrigerant?"因幡電工 耐火キャップNX・認定番号一覧":resin||combustibleInsulation?"積水化学 フィブロック／採用メーカー認定資料":"国交省標準仕様・採用防火区画処理メーカー認定資料",sourceUrl:refrigerant?"https://www.inaba-denko.com/ja/product/detail/663700000":resin||combustibleInsulation?"https://www.sekisui.co.jp/fp/":"https://www.mlit.go.jp/gobuild/gobuild_tk6_000058.html"};
}
export default function Home() {
  const [tab, setTab] = useState<Tab>("home"),
    [modal, setModal] = useState<Modal>(null),
    [tasks, setTasks] = useState<Task[]>([]),
    [schedules, setSchedules] = useState<Schedule[]>([]),
    [materials, setMaterials] = useState<Material[]>([]),
    [penetrations, setPenetrations] = useState<Penetration[]>([]),
    [documents,setDocuments]=useState<SiteDocument[]>([]),
    [toast, setToast] = useState("");
  const [tf, setTf] = useState({
    title: "",
    location: "",
    assignee: "",
    dueDate: "",
    priority: "高",
    progress: "前",
  });
  const [editingTaskId,setEditingTaskId]=useState<number|null>(null);
  const [showCompletedTasks,setShowCompletedTasks]=useState(false);
  const [sf, setSf] = useState({
    name: "",
    location: "",
    unit: "m",
    quantity: "",
    laborRate: "0.10",
    factor: "1.00",
    crew: "2",
    utilization: "0.85",
    startDate: "",
    actualQuantity: "0",
    workType: "配管" as ScheduleWorkType,
    nominalSize: "25",
    ductLong: "500",
    ductShort: "300",
    ductDiameter: "300",
    joint: "ねじ・一般接合",
    height: "標準（～3.5m）",
    congestion: "一般部",
    projectType: "新築",
  });
  const [selectedScopes,setSelectedScopes]=useState<string[]>(["support","fabrication","hanging"]);
  const [mf, setMf] = useState({
    name: "",
    pipeType: "SGP黒ガス",
    size: "",
    quantity: "",
    unit: "個",
    vendor: "",
    status: "未発注",
    neededDate: "",
    note: "",
  });
  const [pf, setPf] = useState({
    penetrationNo: "",
    floor: "",
    location: "",
    compartmentType: "防火区画",
    penetratingItem: "配管",
    pipeType: "",
    size: "",
    openingSize: "",
    method: "",
    approvalNo: "",
    constructionDate: "",
    inspectionDate: "",
    photoNo: "",
    status: "未施工",
    note: "",
  });
  const [firestopSelect,setFirestopSelect]=useState({pipe:"SGP・STPG（鋼管）",wall:"RC・SRC壁",size:"50A",insulation:"なし（裸管）"});
  const firestopResult=selectFirestop(firestopSelect.pipe,firestopSelect.wall,firestopSelect.size,firestopSelect.insulation);
  const [search, setSearch] = useState({
    purpose: "蒸気",
    pipe: "SGP黒ガス",
    targetPipe: "SUS（厚肉）",
    category: "吊り・支持",
    conversionMethod: "自動選定",
  });
  const [favoritePipesByPurpose,setFavoritePipesByPurpose]=useState<Record<string,string[]>>({});
  const [favoritePurpose,setFavoritePurpose]=useState("給水");
  const [favoriteEditorOpen,setFavoriteEditorOpen]=useState(false);
  const [favoritesReady,setFavoritesReady]=useState(false);
  const [pitchFilter,setPitchFilter]=useState("すべて");
  const [selectedSu,setSelectedSu]=useState("30Su");
  const [coordGroup, setCoordGroup] = useState("すべて");
  const [coordName, setCoordName] = useState("LGS天井");
  const [meetingPhase,setMeetingPhase]=useState("すべて");
  const [meetingParty,setMeetingParty]=useState("すべて");
  const [meetingQuery,setMeetingQuery]=useState("");
  const [meetingDone,setMeetingDone]=useState<string[]>([]);
  const [supportInput,setSupportInput]=useState({weight:"100",rods:"4",dynamic:"1.2",safety:"2",span:"800",hang:"1000"});
  const [glossaryQuery,setGlossaryQuery]=useState("");
  const [glossaryCategory,setGlossaryCategory]=useState("すべて");
  const [documentQuery,setDocumentQuery]=useState("");
  const [documentUploading,setDocumentUploading]=useState(false);
  const [documentForm,setDocumentForm]=useState({name:"",category:"施工計画書",sharing:"自社のみ"});
  const [equipmentQuery,setEquipmentQuery]=useState("");
  const [equipmentCategory,setEquipmentCategory]=useState("すべて");
  const [selectedEquipmentId,setSelectedEquipmentId]=useState("ahu");
  const [ruleQuery,setRuleQuery]=useState("");
  const [ruleCategory,setRuleCategory]=useState("すべて");
  const [knowledgeReports,setKnowledgeReports]=useState<KnowledgeReport[]>([]);
  const [reportForm,setReportForm]=useState({subject:"",category:"施工ルール",reportType:"誤りの可能性",detail:"",sourceUrl:""});
  const [aiQuestion,setAiQuestion]=useState("");
  const [aiCategory,setAiCategory]=useState("自動判定");
  const [aiAnswer,setAiAnswer]=useState<AiAnswer|null>(null);
  const [aiThinking,setAiThinking]=useState(false);
  const load = async () => {
    const safe = async (url:string,key:string) => {
      try { const response=await fetch(url); if(!response.ok)return []; const data=await response.json(); return data[key]??[]; }
      catch { return []; }
    };
    const [a,b,c,d,e,f]=await Promise.all([safe("/api/tasks","tasks"),safe("/api/schedules","schedules"),safe("/api/materials","materials"),safe("/api/penetrations","penetrations"),safe(`/api/documents${documentQuery?`?q=${encodeURIComponent(documentQuery)}`:""}`,"documents"),safe("/api/knowledge-reports","reports")]);
    setTasks(a); setSchedules(b); setMaterials(c); setPenetrations(d);setDocuments(e);setKnowledgeReports(f);
  };
  useEffect(() => {
    // Initial synchronization with the persistent site database.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try{
        const saved=localStorage.getItem("site-favorite-pipes-by-purpose");
        if(saved)setFavoritePipesByPurpose(JSON.parse(saved));
      }catch{/* 端末設定が読めない場合は全候補表示を維持 */}
      setFavoritesReady(true);
    },0);
    return()=>window.clearTimeout(timer);
  },[]);
  useEffect(()=>{
    if(!favoritesReady)return;
    localStorage.setItem("site-favorite-pipes-by-purpose",JSON.stringify(favoritePipesByPurpose));
  },[favoritePipesByPurpose,favoritesReady]);
  const active = tasks.filter((t) => t.status !== "完了"),
    overdue = useMemo(
      () =>
        active.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate) < new Date(new Date().toDateString()),
        ).length,
      [active],
    );
  const today = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
  const flash = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 2000);
  };
  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const editing=editingTaskId!==null;
    const response=await fetch(editing?`/api/tasks/${editingTaskId}`:"/api/tasks", {
      method: editing?"PATCH":"POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tf),
    });
    if(!response.ok){flash("保存できませんでした");return;}
    setTf({
      title: "",
      location: "",
      assignee: "",
      dueDate: "",
      priority: "高",
      progress: "前",
    });
    setEditingTaskId(null);
    setModal(null);
    await load();
    flash(editing?"ToDoを更新しました":"ToDoを追加しました");
  }
  function openTaskEditor(t?:Task){
    if(t){setEditingTaskId(t.id);setTf({title:t.title,location:t.location,assignee:t.assignee,dueDate:t.dueDate,priority:t.priority,progress:t.progress||"前"});}
    else{setEditingTaskId(null);setTf({title:"",location:"",assignee:"",dueDate:"",priority:"高",progress:"前"});}
    setModal("task");
  }
  async function addSchedule(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({...sf,laborRate:effectiveRate,factor:overallFactor,scope:selectedScopeOptions.map(x=>x.short).join("・"),scopeDetail:`${sizeFactorLabel} ${sizeFactor.toFixed(2)} / ${conditionBreakdown.join(" / ")} / 総合掛率 ${overallFactor.toFixed(2)} / 最終歩掛 ${finalRate.toFixed(3)}人工/${sf.unit}`}),
    });
    setSf({
      name: "",
      location: "",
      unit: "m",
      quantity: "",
      laborRate: "0.10",
      factor: "1.00",
      crew: "2",
      utilization: "0.85",
      startDate: "",
      actualQuantity: "0",
      workType: "配管",
      nominalSize: "25",
      ductLong: "500",
      ductShort: "300",
      ductDiameter: "300",
      joint: "ねじ・一般接合",
      height: "標準（～3.5m）",
      congestion: "一般部",
      projectType: "新築",
    });
    setSelectedScopes(["support","fabrication","hanging"]);
    setModal(null);
    await load();
    flash("工程を登録しました");
  }
  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/materials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mf),
    });
    setMf({
      name: "",
      pipeType: "SGP黒ガス",
      size: "",
      quantity: "",
      unit: "個",
      vendor: "",
      status: "未発注",
      neededDate: "",
      note: "",
    });
    setModal(null);
    await load();
    flash("配管材を追加しました");
  }
  async function addPenetration(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/penetrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(pf),
    });
    setPf({
      penetrationNo: "",
      floor: "",
      location: "",
      compartmentType: "防火区画",
      penetratingItem: "配管",
      pipeType: "",
      size: "",
      openingSize: "",
      method: "",
      approvalNo: "",
      constructionDate: "",
      inspectionDate: "",
      photoNo: "",
      status: "未施工",
      note: "",
    });
    setModal(null);
    await load();
    flash("区画貫通を追加しました");
  }
  async function del(path: string, id: number) {
    await fetch(`/api/${path}/${id}`, { method: "DELETE" });
    await load();
  }
  async function toggle(t: Task) {
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: t.status === "完了" ? "未着手" : "完了" }),
    });
    await load();
  }
  const calc = (s: Schedule) => {
    const labor = s.quantity * (s.laborRate / 1000) * (s.factor / 100),
      days = Math.ceil(labor / (s.crew * (s.utilization / 100))),
      progress = s.quantity
        ? Math.min(100, Math.round((s.actualQuantity / s.quantity) * 100))
        : 0;
    return { labor, days, progress };
  };
  const selectedPreset=presets.find((p)=>p.name===sf.name);
  const isPipeWork=!selectedPreset||selectedPreset.category==="配管・ダクト";
  const activeScopeOptions=isPipeWork?pipeScopes:equipmentScopes;
  const selectedScopeOptions=activeScopeOptions.filter(x=>selectedScopes.includes(x.id));
  const scopeFactor=selectedScopeOptions.reduce((n,x)=>n+x.factor,0);
  const effectiveRate=Number(sf.laborRate||0)*scopeFactor;
  const pipeA=Number(sf.nominalSize||0);
  const ductReference=sf.workType==="丸ダクト"?Number(sf.ductDiameter||0):Math.max(Number(sf.ductLong||0),Number(sf.ductShort||0));
  const sizeFactor=sf.workType==="配管"?(pipeA<=25?.85:pipeA<=50?1:pipeA<=80?1.25:pipeA<=125?1.55:pipeA<=200?2:2.7):sf.workType==="角ダクト"||sf.workType==="丸ダクト"?(ductReference<=300?.8:ductReference<=500?1:ductReference<=750?1.25:ductReference<=1000?1.55:ductReference<=1500?2:2.6):1;
  const sizeFactorLabel=sf.workType==="配管"?`${pipeA||0}A`:sf.workType==="丸ダクト"?`φ${ductReference||0}mm`:`長辺${ductReference||0}mm`;
  const jointAdds:Record<string,number>={"ねじ・一般接合":0,"メカニカル・プレス":-.05,"接着接合":-.1,"ろう付け":.15,"溶接":.3,"共板フランジ":0,"アングルフランジ":.18,"高圧ダクト仕様":.25};
  const heightAdds:Record<string,number>={"標準（～3.5m）":0,"高所（3.5～5m）":.12,"高所（5m超）":.25};
  const congestionAdds:Record<string,number>={"一般部":0,"天井内・やや狭い":.15,"機械室・過密部":.3};
  const projectAdds:Record<string,number>={"新築":0,"改修":.2,"稼働中改修":.4};
  const conditionAdd=(jointAdds[sf.joint]||0)+(heightAdds[sf.height]||0)+(congestionAdds[sf.congestion]||0)+(projectAdds[sf.projectType]||0);
  const manualFactor=Math.max(.5,Number(sf.factor||1));
  const overallFactor=Math.max(.5,sizeFactor*(1+conditionAdd)*manualFactor);
  const finalRate=effectiveRate*overallFactor;
  const pct=(n:number)=>`${n>=0?"+":""}${Math.round(n*100)}%`;
  const conditionBreakdown=[`${sf.joint} ${pct(jointAdds[sf.joint]||0)}`,`${sf.height} ${pct(heightAdds[sf.height]||0)}`,`${sf.congestion} ${pct(congestionAdds[sf.congestion]||0)}`,`${sf.projectType} ${pct(projectAdds[sf.projectType]||0)}`,`手動 ${manualFactor.toFixed(2)}`];
  const previewLabor =
      Number(sf.quantity || 0) *
      finalRate,
    previewDays =
      Math.ceil(
        previewLabor / (Number(sf.crew || 1) * Number(sf.utilization || 0.85)),
      ) || 0;
  const purposeFavorites=search.purpose==="すべて"?[]:(favoritePipesByPurpose[search.purpose]||[]);
  const rawMatches = purposeFavorites.length>0&&!purposeFavorites.includes(search.pipe)?[]:selectMaterials(search);
  const matches = rawMatches.map((r)=>({...r,linkMatch:r.linkMatch??(r.url?(r.url.includes("/seihin_htm/")||/\/(ad-22f|ak-5|af-15h|adb-20)$/.test(r.url)?"製品一致":"製品群一致"):undefined)}));
  const allAvailablePipeOptions=pipeOptionsForPurpose(search.purpose);
  const favoriteFilterActive=purposeFavorites.length>0;
  const availablePipeOptions=favoriteFilterActive?allAvailablePipeOptions.filter(x=>purposeFavorites.includes(x)):allAvailablePipeOptions;
  const configuredFavoritePurposes=purposeOptions.filter(x=>(favoritePipesByPurpose[x]||[]).length>0);
  const editorPipeChoices=pipeOptionsForPurpose(favoritePurpose).filter(x=>!x.includes("→"));
  const editorFavorites=favoritePipesByPurpose[favoritePurpose]||[];
  const toggleFavoritePipe=(purpose:string,pipe:string)=>{
    const current=favoritePipesByPurpose[purpose]||[];
    const next=current.includes(pipe)?current.filter(x=>x!==pipe):[...current,pipe];
    const updated={...favoritePipesByPurpose};
    if(next.length)updated[purpose]=next;else delete updated[purpose];
    setFavoritePipesByPurpose(updated);
    if(search.purpose===purpose){
      const purposeAllowed=pipeOptionsForPurpose(purpose);
      const allowed=next.length?purposeAllowed.filter(x=>next.includes(x)):purposeAllowed;
      if(!allowed.includes(search.pipe))setSearch({...search,pipe:allowed[0]||"",targetPipe:allowed.find(x=>!x.includes("→")&&x!==search.pipe)||allowed[0]||""});
    }
  };
  const visiblePitchRows=pitchFilter==="すべて"?supportPitchRows:supportPitchRows.filter((r)=>r.family.includes(pitchFilter));
  const selectedSuRow=suATable.find(x=>x.su===selectedSu) || suATable[0];
  const coordinationOptions = coordinationItems.filter((x) => coordGroup === "すべて" || x.group === coordGroup);
  const selectedCoordination = coordinationItems.find((x) => x.name === coordName) || coordinationOptions[0];
  const meetingMatches=meetingItems.filter(x=>(meetingPhase==="すべて"||x.phase===meetingPhase)&&(meetingParty==="すべて"||x.party.includes(meetingParty))&&(!meetingQuery||[x.title,x.phase,x.party,x.format,x.timing,...x.points].join(" ").toLowerCase().includes(meetingQuery.toLowerCase())));
  const designWeight=Number(supportInput.weight||0)*Number(supportInput.dynamic||1)*Number(supportInput.safety||1);
  const perRod=designWeight/Math.max(1,Number(supportInput.rods||1));
  const rodCandidate=perRod<=80?"W3/8 または M10":perRod<=180?"W1/2 または M12":perRod<=300?"W5/8 または M16":"個別構造検討（M16超・吊り方式変更を含む）";
  const span=Number(supportInput.span||0);
  const frameCandidate=designWeight<=150&&span<=600?"L-40×40×3 以上／軽量形鋼はメーカー耐力表照合":designWeight<=400&&span<=1000?"L-50×50×4 または C-75×40×5 以上":designWeight<=800&&span<=1500?"C-100×50×5 または角形鋼管 75×45×3.2 以上":"H形鋼等を含む個別構造計算";
  const supportLevel=perRod>300||designWeight>800||span>1500?"構造確認必須":perRod>180||designWeight>400||span>1000?"要設計確認":"仮選定範囲";
  const glossaryMatches=allGlossaryItems.filter(x=>{const hay=[x.term,...x.aliases,x.category,x.meaning,x.use].join(" ").toLowerCase();return (glossaryCategory==="すべて"||x.category===glossaryCategory)&&(!glossaryQuery||hay.includes(glossaryQuery.toLowerCase()));});
  const equipmentMatches=equipmentGuides.filter(x=>(equipmentCategory==="すべて"||x.category===equipmentCategory)&&(!equipmentQuery||[x.name,...x.aliases,x.category,x.summary,...x.connections,...x.accessories].join(" ").toLowerCase().includes(equipmentQuery.toLowerCase())));
  const selectedEquipment=equipmentMatches.find(x=>x.id===selectedEquipmentId)||equipmentMatches[0]||equipmentGuides[0];
  const equipmentImage=`/equipment/items/${selectedEquipment.id}.webp`;
  const selectedInstallGuide=equipmentInstallGuides[selectedEquipment.id];
  const ruleMatches=constructionRules.filter(x=>(ruleCategory==="すべて"||x.category===ruleCategory)&&(!ruleQuery||[x.category,x.title,x.value,...x.points,x.confirm].join(" ").toLowerCase().includes(ruleQuery.toLowerCase())));
  async function addCoordinationTodo(title: string) {
    await fetch("/api/tasks", {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:`建築確認：${title}`,location:selectedCoordination?.name || "建築取り合い",assignee:"建築担当",dueDate:"",priority:"高"})});
    await load();
    flash("建築確認をToDoへ追加しました");
  }
  async function addMeetingTodo(item:MeetingItem) {
    await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:`打合せ：${item.title}`,location:item.party,assignee:"設備担当",dueDate:"",priority:item.critical?"高":"中"})});
    await load(); flash("必須打合せ資料をToDoへ追加しました");
  }
  async function uploadDocument(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const input=e.currentTarget.elements.namedItem("documentFile") as HTMLInputElement;const file=input.files?.[0];if(!file)return;setDocumentUploading(true);const data=new FormData();data.append("file",file);data.append("name",documentForm.name||file.name.replace(/\.pdf$/i,""));data.append("category",documentForm.category);data.append("sharing",documentForm.sharing);const response=await fetch("/api/documents",{method:"POST",body:data});const body=await response.json().catch(()=>({}));setDocumentUploading(false);if(!response.ok){flash(body.error||"PDFを登録できませんでした");return}setDocumentForm({...documentForm,name:""});input.value="";await load();flash(body.document?.status==="画像PDF・OCR待ち"?"保存しました。画像PDFのためOCR待ちです":"PDFを読み取り保存しました")}
  async function submitKnowledgeReport(e:React.FormEvent){e.preventDefault();const response=await fetch("/api/knowledge-reports",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(reportForm)});if(!response.ok){flash("報告内容を入力してください");return}setReportForm({subject:"",category:"施工ルール",reportType:"誤りの可能性",detail:"",sourceUrl:""});await load();flash("間違い報告を保存しました")}
  async function askEquipmentAi(question=aiQuestion){
    const q=question.trim();if(!q){flash("疑問を入力してください");return}setAiQuestion(q);setAiThinking(true);setAiAnswer(null);
    const norm=(s:string)=>s.toLowerCase().replace(/[\s　、。・／/（）()「」『』？?]/g,"");
    const nq=norm(q);let category=aiCategory==="自動判定"?(["配管","バルブ","ダクト","保温","区画貫通","試験","機器","工程"].find(c=>nq.includes(norm(c)))||"設備全般"):aiCategory;
    const score=(text:string)=>{const t=norm(text);let n=0;for(const word of q.split(/[\s　、。・／/（）()「」『』？?のはをにでと]+/).filter(x=>x.length>1)){if(t.includes(norm(word)))n+=word.length;}if(t.includes(nq))n+=20;return n};
    const rankedRules=constructionRules.map(x=>({x,s:score([x.category,x.title,x.value,...x.points,x.confirm].join(" "))})).sort((a,b)=>b.s-a.s);const ruleHits=rankedRules.filter(v=>v.s>0&&v.s>=rankedRules[0].s*.55).slice(0,3);
    const rankedEquipment=equipmentGuides.map(x=>({x,s:score([x.name,...x.aliases,x.category,x.summary,...x.connections,...x.accessories,...x.clearance,...x.building,...x.checks].join(" "))})).sort((a,b)=>b.s-a.s);const equipmentHits=rankedEquipment.filter(v=>v.s>0&&v.s>=rankedEquipment[0].s*.55).slice(0,2);
    const rankedGlossary=allGlossaryItems.map(x=>({x,s:score([x.term,...x.aliases,x.category,x.meaning,x.use,x.caution].join(" "))})).sort((a,b)=>b.s-a.s);const glossaryHits=rankedGlossary.filter(v=>v.s>0&&v.s>=rankedGlossary[0].s*.55).slice(0,2);
    let webResults:OfficialSearchResult[]=[];try{const r=await fetch(`/api/official-search?q=${encodeURIComponent(q)}`);if(r.ok)webResults=(await r.json()).results||[]}catch{/* 公式検索が一時利用できない場合は検証済み公式索引を使う */}
    const sourceClass=(url:string)=>/\.(go|lg)\.jp\//.test(url)?{kind:"官公庁・自治体基準",priority:1}:/\.or\.jp\//.test(url)?{kind:"業界団体",priority:2}:{kind:"メーカー公式",priority:3};
    const trusted=(url:string)=>/\.(go|lg)\.jp\/|\.or\.jp\/|akagi-nt\.co\.jp|sekisui\.co\.jp|inaba-denko\.com|kitz\.co\.jp|tlv\.com|yoshitake\.co\.jp|venn\.co\.jp/.test(url);
    let evidence:AiEvidence[]=[
      ...webResults.map(x=>({kind:x.kind,title:x.title,summary:x.snippet,source:x.source,url:x.url,priority:x.kind==="官公庁・公的仕様"?1:x.kind==="業界団体"?2:3})),
      ...ruleHits.filter(({x})=>trusted(x.sourceUrl)).map(({x})=>{const c=sourceClass(x.sourceUrl);return {kind:c.kind,title:x.title,summary:`${x.value}。${x.points[0]||""}`,source:x.source,url:x.sourceUrl,priority:c.priority}}),
      ...equipmentHits.filter(({x})=>trusted(x.sourceUrl)).map(({x})=>{const c=sourceClass(x.sourceUrl);return {kind:c.kind,title:x.name,summary:`${x.summary} 注意：${x.checks[0]||"承認図を確認"}`,source:x.source,url:x.sourceUrl,priority:c.priority}}),
      ...glossaryHits.filter(({x})=>trusted(x.source)).map(({x})=>{const c=sourceClass(x.source);return {kind:c.kind,title:x.term,summary:`${x.meaning} ${x.caution}`,source:"公式公開資料",url:x.source,priority:c.priority}})
    ].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i).sort((a,b)=>a.priority-b.priority).slice(0,7);
    const primaryRule=ruleHits[0]?.x,primaryEquipment=equipmentHits[0]?.x,primaryGlossary=glossaryHits[0]?.x;
    const override=officialAnswerOverrides.find(x=>x.matchAll.every(k=>nq.includes(norm(k)))&&(!x.matchAny||x.matchAny.some(k=>nq.includes(norm(k)))));
    if(override)evidence=[...override.evidence,...evidence].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i).slice(0,7);
    if(aiCategory==="自動判定"&&category==="設備全般")category=primaryRule?.category||primaryEquipment?.category||primaryGlossary?.category||category;
    const asksClearance=/メンテナンス|点検(寸法|スペース|空間)|離隔|周囲寸法|クリアランス/.test(q);
    const equipmentClearanceAnswer=primaryEquipment&&asksClearance?`${primaryEquipment.name}は、${primaryEquipment.clearance.join("、")}を確保します。具体的な有効寸法は採用機器の承認図・施工要領と設計図書で確定してください。`:undefined;
    const conclusion=override?.conclusion||primaryRule?.value||equipmentClearanceAnswer||primaryEquipment?.summary||(webResults[0]?.snippet?`公式検索で確認できた記載：${webResults[0].snippet}`:primaryGlossary?`${primaryGlossary.meaning} ${primaryGlossary.caution}`:"ネット上の信頼できる公式情報を検索しましたが、質問へ直接回答できる記載を確認できませんでした。条件を追加して再検索してください。");
    const checks=override?.checks||(primaryRule?[...primaryRule.points.slice(0,4),`最終確認：${primaryRule.confirm}`]:primaryEquipment?(asksClearance?[...primaryEquipment.clearance,...primaryEquipment.building.slice(0,2),"採用機器の承認図・施工要領で有効寸法を確認"]:[...primaryEquipment.checks.slice(0,3),"採用機器の承認図・施工要領を確認"]):["管種・用途・口径・流体温度・施工場所を追加して再質問","設計図書・特記仕様・承認図を確認","公式資料で確定できない場合はメーカーまたは監理者へ質疑"]);
    const distinctSources=new Set(evidence.map(x=>{try{return new URL(x.url||"").hostname}catch{return x.source}})).size;
    const confidence:AiAnswer["confidence"]=evidence.some(x=>/官公庁|自治体/.test(x.kind))&&distinctSources>=2?"高":evidence.length>=1?"中":"低";
    setAiAnswer({question:q,category,conclusion,reason:evidence.length?`質問時にネット上の公式情報を検索し、検証済みの公式索引と合わせて${distinctSources}情報源から整理しました。登録資料・サイト内資料は判断根拠に使っていません。`:"ネット上の公式情報を検索しましたが、直接回答できる根拠がないため断定していません。",checks,evidence,confidence,table:override?.table,tableNote:override?.tableNote});setAiThinking(false);
  }
  return (
    <main className="shell">
      <header className="top">
        <div>
          <span className="eyebrow">○○新築工事</span>
          <h1>設備現場マネージャー</h1>
          <p>{today}　中村さんの現場管理</p>
        </div>
        <button className="avatar">中</button>
      </header>
      {tab === "home" && (
        <div className="page">
          <section className="hero">
            <div>
              <span>今日の状況</span>
              <strong>
                {active.length}
                <small>件のToDo</small>
              </strong>
              <p>
                {overdue
                  ? `${overdue}件が期限超過`
                  : `工程 ${schedules.length}件・材料 ${materials.length}件`}
              </p>
            </div>
            <button onClick={() => openTaskEditor()}>＋ メモ</button>
          </section>
          <Head
            title="優先ToDo"
            action="すべて見る"
            click={() => setTab("todo")}
          />
          <div className="tasks">
            {active.length ? (
              active
                .slice(0, 3)
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    t={t}
                    toggle={() => toggle(t)}
                    edit={() => openTaskEditor(t)}
                    remove={() => del("tasks", t.id)}
                  />
                ))
            ) : (
              <Empty text="ToDoはありません" />
            )}
          </div>
          <Head
            title="工程計算"
            action="工程を開く"
            click={() => setTab("schedule")}
          />
          <ScheduleList
            items={schedules.slice(0, 3)}
            calc={calc}
            del={(id) => del("schedules", id)}
          />
          <Head
            title="配管材リスト"
            action="材料を開く"
            click={() => setTab("materials")}
          />
          <div className="alerts">
            <div>
              <span>登録材料</span>
              <b>{materials.length}</b>
              <p>品目</p>
            </div>
            <div className="good">
              <span>未発注</span>
              <b>{materials.filter((m) => m.status === "未発注").length}</b>
              <p>確認してください</p>
            </div>
          </div>
        </div>
      )}
      {tab === "todo" && (
        <div className="page">
          <Title
            cap="ACTION"
            title="ToDoリスト"
            sub="やること・期限・担当を管理"
            add={() => openTaskEditor()}
          />
          <div className="filters">
            <span>未完了 {active.length}</span>
            <span>完了 {tasks.length - active.length}</span>
            <span>期限超過 {overdue}</span>
          </div>
          <h3 className="todoGroupTitle">未完了 <span>{active.length}件</span></h3>
          <div className="tasks">
            {active.length ? (
              active.map((t) => (
                <TaskCard
                  key={t.id}
                  t={t}
                  toggle={() => toggle(t)}
                  edit={() => openTaskEditor(t)}
                  remove={() => del("tasks", t.id)}
                />
              ))
            ) : (
              <Empty text="未完了のToDoはありません" />
            )}
          </div>
          {tasks.length-active.length>0&&<section className="completedTasks"><button className="completedToggle" onClick={()=>setShowCompletedTasks(x=>!x)}>{showCompletedTasks?"完了済みを閉じる":`完了済みを見る（${tasks.length-active.length}件）`}</button>{showCompletedTasks&&<div className="tasks">{tasks.filter(t=>t.status==="完了").map(t=><TaskCard key={t.id} t={t} toggle={()=>toggle(t)} edit={()=>openTaskEditor(t)} remove={()=>del("tasks",t.id)}/>)}</div>}</section>}
        </div>
      )}
      {tab === "schedule" && (
        <div className="page">
          <Title
            cap="SCHEDULE CALCULATOR"
            title="工程計算"
            sub="数量と歩掛から必要人工・日数を計算"
            add={() => setModal("schedule")}
          />
          <div className="metrics">
            <div>
              <span>登録工程</span>
              <b>{schedules.length}</b>
            </div>
            <div>
              <span>必要人工</span>
              <b>
                {schedules.reduce((n, s) => n + calc(s).labor, 0).toFixed(1)}
              </b>
            </div>
            <div>
              <span>計画日数計</span>
              <b>{schedules.reduce((n, s) => n + calc(s).days, 0)}</b>
            </div>
          </div>
          <ScheduleList
            items={schedules}
            calc={calc}
            del={(id) => del("schedules", id)}
          />
        </div>
      )}
      {tab === "materials" && (
        <div className="page">
          <Title
            cap="MATERIAL SELECTOR"
            title="材料選定・配管材リスト"
            sub="用途・管種から使用候補と注意点を検索"
            add={() => setModal("material")}
          />
          <section className="selector">
            <div className="selectorTitle"><h3>材料を検索</h3><span>{matches.length}候補</span></div>
            <section className="sitePipeFavorites">
              <div className="favoriteSummary">
                <div><small>用途ごとの採用配管システム</small><b>{configuredFavoritePurposes.length?`${configuredFavoritePurposes.length}用途を設定中`:"未設定（用途ごとに全候補を表示）"}</b></div>
                <button type="button" onClick={()=>setFavoriteEditorOpen(!favoriteEditorOpen)}>{favoriteEditorOpen?"閉じる":"☆ 用途別に設定"}</button>
              </div>
              {configuredFavoritePurposes.length>0&&<div className="favoriteActive"><label><span>設定済み：お気に入りがある用途では、その材料だけを候補表示します</span></label><div>{configuredFavoritePurposes.map(p=><button type="button" key={p} onClick={()=>{setFavoritePurpose(p);setFavoriteEditorOpen(true)}}>{p} → {favoritePipesByPurpose[p].join("・")}</button>)}</div></div>}
              {favoriteEditorOpen&&<div className="favoriteEditor"><p>先に用途を選び、その現場で採用する配管システムを★登録してください。例：給水 → ZlokⅡ。設定した用途では、登録した候補だけが選択欄に表示されます。</p><label className="favoritePurposeLabel">用途<select value={favoritePurpose} onChange={e=>setFavoritePurpose(e.target.value)}>{purposeOptions.map(x=><option key={x}>{x}</option>)}</select></label><div>{editorPipeChoices.map(x=><button type="button" key={x} className={editorFavorites.includes(x)?"selected":""} onClick={()=>toggleFavoritePipe(favoritePurpose,x)}><span>{editorFavorites.includes(x)?"★":"☆"}</span>{x}</button>)}</div>{editorFavorites.length>0&&<button type="button" className="clearFavorites" onClick={()=>{const updated={...favoritePipesByPurpose};delete updated[favoritePurpose];setFavoritePipesByPurpose(updated)}}>{favoritePurpose}のお気に入りを解除</button>}</div>}
            </section>
            <div className="searchGrid">
              <Field label="用途">
                <select
                  value={search.purpose}
                  onChange={(e) => {
                    const purpose=e.target.value;
                    const purposeAllowed=pipeOptionsForPurpose(purpose);
                    const savedFavorites=purpose==="すべて"?[]:(favoritePipesByPurpose[purpose]||[]);
                    const allowed=savedFavorites.length?purposeAllowed.filter(x=>savedFavorites.includes(x)):purposeAllowed;
                    const targetAllowed=allowed.filter(x=>!x.includes("→"));
                    setSearch({
                      ...search,
                      purpose,
                      pipe:allowed.includes(search.pipe)?search.pipe:(allowed[0]||""),
                      targetPipe:targetAllowed.includes(search.targetPipe)?search.targetPipe:(targetAllowed[0]||""),
                    });
                  }}
                >
                  {["すべて", ...purposeOptions].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="配管材・変換">
                <select
                  value={search.pipe}
                  onChange={(e) =>
                    setSearch({ ...search, pipe: e.target.value })
                  }
                >
                  {availablePipeOptions.length===0&&<option value="">この用途で登録した管種はありません</option>}
                  {(search.purpose==="すべて"&&!favoriteFilterActive?["すべて", ...availablePipeOptions]:availablePipeOptions).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="探す材料">
                <select
                  value={search.category}
                  onChange={(e) =>
                    setSearch({ ...search, category: e.target.value })
                  }
                >
                  {["すべて", ...categoryOptions].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              {search.category === "異種管変換" && <>
                <Field label="相手側の配管材">
                  <select value={search.targetPipe} onChange={(e)=>setSearch({...search,targetPipe:e.target.value})}>
                    {conversionPipeOptions.filter(x=>x!==search.pipe&&availablePipeOptions.includes(x)).map((x)=><option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="変換方式">
                  <select value={search.conversionMethod} onChange={(e)=>setSearch({...search,conversionMethod:e.target.value})}>
                    <option>自動選定</option><option>メーカー専用変換継手</option><option>フランジ</option><option>ねじ・アダプタ</option>
                  </select>
                </Field>
              </>}
            </div>
            <div className="results">
              {matches.length ? (
                matches.map((r, i) => (
                  <article key={`${r.product}${i}`}>
                    <span className={`grade g${r.grade}`}>{r.grade}</span>
                    <div>
                      <b>{r.product}</b>
                      <small>
                        {r.purpose} ・ {r.pipe} ・ {r.category}
                      </small>
                      <p>{r.note}</p>
                      <div className="selectionGate" aria-label="材料の5段階適合確認">
                        <div><i>1</i><span>接続</span><b>{r.pipe==="すべて"?"管種確認":r.pipe}</b></div>
                        <div><i>2</i><span>流体</span><b>{r.purpose==="すべて"?"用途確認":r.purpose}</b></div>
                        <div><i>3</i><span>温度・圧力</span><b>設計条件照合</b></div>
                        <div><i>4</i><span>認証・仕様</span><b>{search.purpose==="給水"?"給水認証確認":search.purpose.includes("消火")?"消防認定確認":"特記仕様確認"}</b></div>
                        <div><i>5</i><span>適合製品</span><b>{r.maker||"メーカー確認"}</b></div>
                      </div>
                      {r.assembly && <div className="conversionAssembly" aria-label="異種管変換の接続構成">
                        {r.assembly.map((step,i)=><div className="conversionStep" key={step.label}><span>{step.label}</span><b>{step.value}</b>{i<r.assembly!.length-1&&<i>→</i>}</div>)}
                      </div>}
                      {r.gasket && <div className="gasketSelection"><span>パッキン選定</span><b>{r.gasket}</b></div>}
                      <div className="evidenceLine"><span className={`match m${r.linkMatch??"未紐付け"}`}>{r.linkMatch??"未紐付け"}</span><span>リンク整理日 2026-08-10</span></div>
                      {r.url ? <a className="catalogLink" href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${r.product}の公式資料を開く`}>{r.maker}｜{r.linkLabel ?? (r.url.includes("/seihin_htm/") ? "公式製品ページ" : "公式カタログ一覧")} ↗</a>:<p className="noCatalog">正しいメーカー製品群を特定できるまで、URLのみ未紐付けです。材料の採用例は表示しています。</p>}
                    </div>
                  </article>
                ))
              ) : (
                <Empty text="該当候補がありません。条件を「すべて」に広げてください" />
              )}
            </div>
            <p className="caution">
              「採用例」は用途・管種・材料カテゴリに合う代表例です。型番の指定ではありません。「製品一致」は型番まで一致、「製品群一致」はメーカーの該当カテゴリです。実際の採用品は図面・特記仕様書・圧力温度・認定範囲・最新版メーカー資料で最終確認してください。
            </p>
          </section>
          {search.purpose==="給水"&&<section className="waterPipeGuide">
            <div className="waterGuideHead"><div><span>WATER SUPPLY PIPE GUIDE</span><h3>給水で使用する管種一覧</h3><p>使用場所・規格・接合方式を区別して選定</p></div><b>{waterPipeProfiles.length}管種</b></div>
            <div className="waterZoneGrid">
              {["給水引込・屋外埋設","敷地内埋設・ピット・立管・機械室","屋内横引き・立管・ピット","住戸内・器具枝管・ヘッダー","構内配水・水道本管・大口径埋設","既設給水管の調査・撤去更新"].map(zone=>{const rows=waterPipeProfiles.filter(x=>x.zone.includes(zone.split("・")[0])||x.zone===zone);return rows.length?<div key={zone}><h4>{zone}</h4>{rows.map(x=><button key={x.pipe} onClick={()=>setSearch({...search,pipe:x.pipe,category:"管"})}><span className={`waterStatus s${x.status}`}>{x.status}</span><b>{x.pipe}</b><small>{x.standard}</small></button>)}</div>:null})}
            </div>
            <p className="waterGuideNote">「全部」は一般的な建築給水・給水装置・構内配水で使用される主要な現行管種と、更新時に遭遇する既設管を含みます。実際の採用可否は設計図書、特記仕様書、水道事業者の給水装置施工基準・指定材料を最優先してください。</p>
          </section>}
          <section className="suAPanel">
            <div className="suAHead"><div><span>SIZE CONVERSION</span><h3>Su・A 呼び径早見表</h3></div><label>Suを選ぶ<select value={selectedSu} onChange={e=>setSelectedSu(e.target.value)}>{suATable.map(x=><option key={x.su}>{x.su}</option>)}</select></label></div>
            <div className="suAResult">
              <div><span>ステンレス薄肉管</span><b>{selectedSuRow.su}</b><small>外径 {selectedSuRow.suOd} mm</small></div>
              <i>→</i>
              <div><span>同じ外径のA呼び</span><b>{selectedSuRow.sameOdA}</b><small>{selectedSuRow.aOd} mm</small></div>
              <i>≠</i>
              <div><span>市販アダプタ例</span><b>{selectedSuRow.adapter}</b><small>メーカー・型式で異なる</small></div>
            </div>
            <p className="suANote">{selectedSuRow.note}</p>
            <div className="suATableWrap"><table className="suATable"><thead><tr><th>Su呼び</th><th>Su外径 mm</th><th>同じ外径のA呼び</th><th>A外径 mm</th><th>アダプタ設定例</th><th>注意</th></tr></thead><tbody>{suATable.map(x=><tr key={x.su} className={x.su===selectedSu?"selected":""} onClick={()=>setSelectedSu(x.su)}><td><b>{x.su}</b></td><td>{x.suOd}</td><td>{x.sameOdA}</td><td>{x.aOd}</td><td>{x.adapter}</td><td>{x.note}</td></tr>)}</tbody></table></div>
            <div className="suAWarnings"><b>間違えやすいポイント</b><ul><li>SuとAは単純な数字置換ではありません。例：40Suと40Aは外径が異なり、40Suと同外径なのは32Aです。</li><li>「同じ外径」と「接続したい呼び径」は別です。アダプタは流量・接続相手に合わせ、メーカーに存在するSu×Aの組合せから選びます。</li><li>ナイスジョイントX・ZlokⅡは、それぞれの純正おす／めすアダプタまたはフランジアダプタを使用し、ねじ規格・圧力・流体を確認します。</li></ul><div><a href="https://www.onk-net.co.jp/ja/product/nicejoint-x/download/scs14/" target="_blank" rel="noopener noreferrer">ナイスジョイントX おす・めすアダプタ公式資料 ↗</a><a href="https://www.kuwana-metals.com/download/cad/pdf.html" target="_blank" rel="noopener noreferrer">ZlokⅡ 公式CAD・資料一覧 ↗</a></div></div>
          </section>
          <section className="pitchPanel">
            <div className="pitchHead"><div><span>SUPPORT PITCH</span><h3>全配管材の吊り・支持ピッチ一覧</h3></div><b>{visiblePitchRows.length}区分</b></div>
            <p className="pitchLead">「上限」は超えない間隔、「現場推奨」は端数処理と追加支持を見込んだ施工計画値です。弁・分岐・曲がり・機器接続・立上り・区画貫通の近傍は別途追加してください。</p>
            <label className="pitchFilter">管種で絞り込む<select value={pitchFilter} onChange={(e)=>setPitchFilter(e.target.value)}><option>すべて</option><option>SGP</option><option>SUS厚肉</option><option>SUS一般</option><option>ナイスジョイント</option><option>VP</option><option>VU</option><option>耐火二層管</option><option>銅管</option><option>冷媒銅管</option><option>架橋ポリエチレン管</option><option>ポリブテン管</option></select></label>
            <div className="pitchTableWrap"><table className="pitchTable"><thead><tr><th>管種</th><th>口径</th><th>横引き上限</th><th>現場推奨</th><th>立管</th><th>根拠区分</th><th>施工上の注意</th><th>根拠資料</th></tr></thead><tbody>{visiblePitchRows.map((r,i)=><tr key={`${r.family}${r.size}${i}`}><td><b>{r.family}</b></td><td>{r.size}</td><td className="limit">{r.horizontal}</td><td className="fieldPitch">{r.field}</td><td>{r.vertical}</td><td><span className={`basis b${r.basis}`}>{r.basis}</span></td><td>{r.note}</td><td><a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">{r.source} ↗</a></td></tr>)}</tbody></table></div>
            <div className="pitchRules"><b>適用前の必須確認</b><ul><li>設計図書・特記仕様書・採用メーカー施工要領の指定を最優先</li><li>保温厚、満水重量、流体温度、バルブ等の集中荷重を加算</li><li>蒸気・給湯は固定点、ガイド、ローラー、伸縮継手を配管応力計算で決定</li><li>耐震支持の間隔はこの表とは別に、耐震設計・吊り長さ・重要度で決定</li></ul></div>
          </section>
          <h3>現場の材料リスト</h3>
          <div className="metrics">
            <div>
              <span>登録品目</span>
              <b>{materials.length}</b>
            </div>
            <div>
              <span>未発注</span>
              <b>{materials.filter((m) => m.status === "未発注").length}</b>
            </div>
            <div>
              <span>納入済</span>
              <b className="safe">
                {materials.filter((m) => m.status === "納入済").length}
              </b>
            </div>
          </div>
          <div className="materialList">
            {materials.length ? (
              materials.map((m) => (
                <article key={m.id}>
                  <div>
                    <span className={`status ${m.status}`}>{m.status}</span>
                    <b>{m.name}</b>
                    <p>{[m.pipeType, m.size].filter(Boolean).join(" ・ ")}</p>
                    <small>
                      {m.quantity}
                      {m.unit}　{m.vendor || "仕入先未設定"}
                      {m.neededDate
                        ? `　必要日 ${m.neededDate.replaceAll("-", "/")}`
                        : ""}
                    </small>
                  </div>
                  <button onClick={() => del("materials", m.id)}>×</button>
                </article>
              ))
            ) : (
              <Empty text="配管材を追加してください" />
            )}
          </div>
        </div>
      )}
      {tab === "penetrations" && (
        <div className="page firestopPage">
          <Title
            cap="FIRESTOP SELECTOR"
            title="区画貫通工法を選ぶ"
            sub="配管材と壁・床から適合工法の候補を確認"
          />
          <section className="firestopSelector">
            <div className="firestopFields">
              <Field label="配管材"><select value={firestopSelect.pipe} onChange={e=>{const pipe=e.target.value;setFirestopSelect({...firestopSelect,pipe,size:pipe==="冷媒用被覆銅管"?refrigerantSizeOptions[0]:"50A",insulation:pipe==="冷媒用被覆銅管"?"発泡プラスチック保温材":"なし（裸管）"})}}>{firestopPipes.map(x=><option key={x}>{x}</option>)}</select></Field>
              <Field label="壁・床の種類"><select value={firestopSelect.wall} onChange={e=>setFirestopSelect({...firestopSelect,wall:e.target.value})}>{firestopWalls.map(x=><option key={x}>{x}</option>)}</select></Field>
              {firestopSelect.pipe==="冷媒用被覆銅管"?<Field label="冷媒管サイズ（現場呼称・ミリ・インチ）"><select value={firestopSelect.size} onChange={e=>setFirestopSelect({...firestopSelect,size:e.target.value})}>{refrigerantSizeOptions.map(x=><option key={x}>{x}</option>)}</select>{firestopSelect.size==="その他（現場入力）"&&<small>液管・ガス管それぞれの外径と被覆厚を認定書で確認してください。</small>}</Field>:<Field label="呼び径"><input value={firestopSelect.size} onChange={e=>setFirestopSelect({...firestopSelect,size:e.target.value})} placeholder="例：50A・50Su" /></Field>}
              <Field label="保温材"><select value={firestopSelect.insulation} onChange={e=>setFirestopSelect({...firestopSelect,insulation:e.target.value})}><option>なし（裸管）</option><option>ロックウール・グラスウール</option><option>発泡プラスチック保温材</option><option>ゴム系保温材</option><option>その他・未確認</option></select></Field>
            </div>
            <article className="firestopAnswer">
              <small>選定結果</small><h2>{firestopResult.title}</h2><p className="firestopJudgement">{firestopResult.judgement}</p>
              <h3>使える可能性がある工法</h3><ul>{firestopResult.methods.map(x=><li key={x}>{x}</li>)}</ul>
              <h3>認定書で一致させる条件</h3><ul className="checkList">{firestopResult.checks.map(x=><li key={x}>✓ {x}</li>)}</ul>
              <h3>現場での確認順序</h3><ol>{firestopResult.steps.map(x=><li key={x}>{x}</li>)}</ol>
              <a href={firestopResult.sourceUrl} target="_blank" rel="noopener noreferrer">{firestopResult.source}を確認 ↗</a>
              <strong className="firestopStop">認定番号は、この画面だけで確定しません。壁床構造・管径・保温・開口・施工方向が認定図と全て一致してから採用してください。</strong>
            </article>
          </section>
          <section className="savedPenetrations">
            <div className="savedHeading"><div><small>施工後の記録</small><h2>採用工法を記録する</h2></div><button onClick={()=>setModal("penetration")}>＋ 記録</button></div>
            <div className="materialList">
            {penetrations.length ? (
              penetrations.map((p) => (
                <article key={p.id}>
                  <div>
                    <span className={`status ${p.status}`}>{p.status}</span>
                    <b>
                      {p.penetrationNo}　{p.floor} {p.location}
                    </b>
                    <p>
                      {[
                        p.compartmentType,
                        p.penetratingItem,
                        p.pipeType,
                        p.size,
                      ]
                        .filter(Boolean)
                        .join(" ・ ")}
                    </p>
                    <small>
                      開口 {p.openingSize || "未設定"}　工法{" "}
                      {p.method || "未設定"}　認定 {p.approvalNo || "未設定"}
                    </small>
                  </div>
                  <button onClick={() => del("penetrations", p.id)}>×</button>
                </article>
              ))
            ) : (
              <Empty text="選定後、採用した認定番号と施工写真を記録できます" />
            )}
            </div>
          </section>
        </div>
      )}
      {tab === "constructionRules"&&<div className="page constructionRulesPage">
        <Title cap="INSTALLATION RULES" title="設備施工ルール" sub="勾配・高さ・据付・点検・支持の確認基準"/>
        <section className="ruleSearch"><input value={ruleQuery} onChange={e=>setRuleQuery(e.target.value)} placeholder="例：勾配、消火栓、便器、ポンプ、点検口"/><select value={ruleCategory} onChange={e=>setRuleCategory(e.target.value)}><option>すべて</option>{[...new Set(constructionRules.map(x=>x.category))].map(x=><option key={x}>{x}</option>)}</select></section>
        <div className="ruleLegend"><span className="b法令・基準">法令・基準</span><span className="b標準仕様">標準仕様</span><span className="bメーカー基準">メーカー基準</span><span className="b一般目安">一般目安</span><span className="b承認図優先">設計・承認図優先</span><p>同じ「高さ」でも、器具中心・操作部・箱中心・仕上げ床基準は別です。表示している測定基準まで確認してください。</p></div>
        <div className="ruleGrid">{ruleMatches.map(x=><article key={`${x.category}-${x.title}`}><header><span>{x.category}</span><i className={`b${x.basis}`}>{x.basis}</i></header><h3>{x.title}</h3><strong>{x.value}</strong><ul>{x.points.map(p=><li key={p}>{p}</li>)}</ul><div className="ruleConfirm"><b>現場で最終確認</b><p>{x.confirm}</p></div><div className="ruleActions"><a href={x.sourceUrl} target="_blank" rel="noopener noreferrer">根拠資料：{x.source} ↗</a><button onClick={()=>setReportForm({subject:x.title,category:x.category,reportType:"誤りの可能性",detail:"",sourceUrl:x.sourceUrl})}>間違いを報告</button></div></article>)}</div>
        {!ruleMatches.length&&<Empty text="該当するルールがありません。検索語を短くしてください"/>}
        <section className="reportPanel"><div><span>QUALITY CONTROL</span><h3>間違い報告・修正履歴</h3><p>数値違い、古い資料、現場条件の不足、リンク切れを記録できます。</p></div><form onSubmit={submitKnowledgeReport}><label>対象<input value={reportForm.subject} onChange={e=>setReportForm({...reportForm,subject:e.target.value})} placeholder="ルール・材料名"/></label><label>種類<select value={reportForm.reportType} onChange={e=>setReportForm({...reportForm,reportType:e.target.value})}><option>誤りの可能性</option><option>古い情報</option><option>条件不足</option><option>リンク切れ</option><option>改善提案</option></select></label><label className="reportDetail">内容<textarea value={reportForm.detail} onChange={e=>setReportForm({...reportForm,detail:e.target.value})} placeholder="正しいと思われる数値、根拠資料、現場条件など"/></label><button type="submit">報告を保存</button></form><div className="revisionList">{knowledgeReports.length?knowledgeReports.map(r=><article key={r.id}><header><b>{r.subject}</b><span className={`reportStatus s${r.status}`}>{r.status}</span></header><small>{r.reportType}・{new Date(r.createdAt).toLocaleDateString("ja-JP")}</small><p>{r.detail}</p>{r.resolution&&<div><b>修正内容</b>{r.resolution}</div>}</article>):<p>報告・修正履歴はまだありません。</p>}</div></section>
        <p className="caution">本ページは施工検討用です。法令、設計図書、特記仕様書、所轄官庁・自治体基準、認定書、採用製品の承認図・施工要領が異なる場合は、それらを優先してください。</p>
      </div>}
      {tab === "equipmentAi"&&<div className="page equipmentAiPage">
        <Title cap="EQUIPMENT AI Q&A" title="設備AI質問" sub="官公庁・業界団体・メーカー公式の情報群から根拠付きで回答"/>
        <section className="aiAskCard">
          <label>現場の疑問<textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} placeholder="例：空調ドレンの勾配は何分の一？ 天井内で注意することは？"/></label>
          <div className="aiAskActions"><select value={aiCategory} onChange={e=>setAiCategory(e.target.value)}>{["自動判定","配管","バルブ","ダクト","保温","区画貫通","試験","機器","工程","その他"].map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>askEquipmentAi()} disabled={aiThinking}>{aiThinking?"資料を確認中…":"根拠付きで回答"}</button></div>
        </section>
        <div className="aiExamples"><span>質問例</span>{["空調ドレンの勾配は？","消火栓箱の取付高さは？","蒸気配管の支持で注意することは？","全熱交換器の点検スペースは？"].map(x=><button key={x} onClick={()=>askEquipmentAi(x)}>{x}</button>)}</div>
        {aiAnswer?<article className="aiAnswerCard"><header><div><span>{aiAnswer.category}</span><h2>{aiAnswer.question}</h2></div><b className={`confidence c${aiAnswer.confidence}`}>信頼度 {aiAnswer.confidence}</b></header>
          <section className="aiConclusion"><small>回答</small><strong>{aiAnswer.conclusion}</strong><p>{aiAnswer.reason}</p></section>
          {aiAnswer.table&&<section className="aiDataTable"><h3>管径別の勾配上限</h3><div><table><thead><tr><th>管径</th><th>上限</th><th>勾配比</th><th>条件</th></tr></thead><tbody>{aiAnswer.table.map(x=><tr key={x.size}><th>{x.size}</th><td>{x.percent}</td><td>{x.ratio}</td><td>{x.basis}</td></tr>)}</tbody></table></div>{aiAnswer.tableNote&&<p>{aiAnswer.tableNote}</p>}</section>}
          <section className="aiChecks"><h3>現場で確認すること</h3><ol>{aiAnswer.checks.map(x=><li key={x}>{x}</li>)}</ol></section>
          <section className="aiEvidence"><h3>根拠・判断理由</h3>{aiAnswer.evidence.length?aiAnswer.evidence.map((x,i)=><div key={`${x.title}-${i}`}><span>{x.kind}</span><p><b>{x.title}</b>{x.summary}</p>{x.url&&<a href={x.url} target="_blank" rel="noopener noreferrer">{x.source}を開く ↗</a>}</div>):<p className="noEvidence">確実な根拠が見つかりません。条件を追加して再質問してください。</p>}</section>
          <p className="aiWarning">回答は施工判断の補助です。情報が食い違う場合は両方を確認し、設計図書・特記仕様・承認図・所轄官庁・採用メーカーの最新版を優先してください。</p>
        </article>:<section className="aiPriority"><b>回答に使う情報の優先順位</b><ol><li>官公庁・法令・公共建築標準仕様</li><li>公的な業界団体・規格団体</li><li>採用メーカーの公式資料</li><li>複数の信頼できる技術情報による照合</li></ol><p>登録資料やサイト内の説明文だけでは判断せず、公式情報の根拠URLを表示します。</p></section>}
      </div>}
      {tab === "calculators"&&<CalculatorHub/>}
      {tab === "meetingMinutes"&&<MeetingMinutesAi/>}
      {tab === "detailBook"&&<InstallationDetailBook/>}
      {tab === "procedureVideos"&&<ProcedureVideos openDetailBook={()=>setTab("detailBook")}/>}
      {tab === "releaseCenter"&&<ReleaseCenter/>}
      {tab === "coordination" && selectedCoordination && (
        <div className="page coordinationPage">
          <Title cap="ARCHITECTURAL COORDINATION" title="建築取り合い・施工タイミング" sub="仕上げ別に、設備工事の着手時期と建築確認事項を確認" />
          <section className="coordSelector">
            <Field label="部位">
              <select value={coordGroup} onChange={(e)=>{const group=e.target.value; setCoordGroup(group); const first=coordinationItems.find(x=>group==="すべて"||x.group===group); if(first)setCoordName(first.name);}}>
                {["すべて",...Array.from(new Set(coordinationItems.map(x=>x.group)))].map(x=><option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="仕上げ・取り合い">
              <select value={coordName} onChange={(e)=>setCoordName(e.target.value)}>
                {coordinationOptions.map(x=><option key={x.name}>{x.name}</option>)}
              </select>
            </Field>
          </section>
          <section className="timingHero">
            <span>施工タイミング</span><h3>{selectedCoordination.name}</h3><p>{selectedCoordination.timing}</p>
          </section>
          <div className="phaseFlow" aria-label="施工順序">
            <CoordPhase no="1" title="先にやる" items={selectedCoordination.before}/>
            <CoordPhase no="2" title="この間に施工" items={selectedCoordination.work}/>
            <CoordPhase no="3" title="仕上げ後" items={selectedCoordination.after}/>
          </div>
          <section className="stopCard"><b>施工ストップ条件</b><p>{selectedCoordination.stop}</p></section>
          <section className="confirmCard">
            <div className="confirmHead"><div><span>建築への確認必須事項</span><h3>{selectedCoordination.confirm.length}項目</h3></div><small>タップでToDo登録</small></div>
            <div className="confirmList">
              {selectedCoordination.confirm.map((item,i)=><button key={item} onClick={()=>addCoordinationTodo(item)}><i>{i+1}</i><span>{item}</span><b>＋</b></button>)}
            </div>
          </section>
          <p className="caution">現場の設計図・特記仕様書・施工要領・承認図を優先してください。着手前に建築、設備、電気、消防の工程を総合図で調整します。</p>
        </div>
      )}
      {tab === "meetings" && (
        <div className="page meetingPage">
          <Title cap="MEETING DOCUMENTS" title="必須打ち合わせ資料リスト" sub="図面を除く、他業者・元請・施主との調整資料と確認事項" />
          <section className="meetingSummary">
            <div><span>収録資料</span><b>{meetingItems.length}</b><small>種類</small></div>
            <div><span>確認済み</span><b>{meetingDone.length}</b><small>種類</small></div>
            <div><span>重要資料</span><b>{meetingItems.filter(x=>x.critical).length}</b><small>種類</small></div>
          </section>
          <section className="meetingFilters">
            <input value={meetingQuery} onChange={e=>setMeetingQuery(e.target.value)} placeholder="例：材料置場、搬入、停電、天井閉塞" />
            <select value={meetingPhase} onChange={e=>setMeetingPhase(e.target.value)}><option>すべて</option>{Array.from(new Set(meetingItems.map(x=>x.phase))).map(x=><option key={x}>{x}</option>)}</select>
            <select value={meetingParty} onChange={e=>setMeetingParty(e.target.value)}><option>すべて</option>{["元請","建築","電気","消防","施主","全業者"].map(x=><option key={x}>{x}</option>)}</select>
          </section>
          <div className="meetingLegend"><span><i className="mustDot"/>重要・期限先行</span><span>項目を開いて打合せ内容を確認</span></div>
          <div className="meetingList">
            {meetingMatches.map((item)=><article key={item.id} className={`${meetingDone.includes(item.id)?"meetingDone":""} ${item.critical?"meetingCritical":""}`}>
              <div className="meetingCardHead">
                <button className="meetingCheck" aria-label={`${item.title}を確認済みにする`} onClick={()=>setMeetingDone(meetingDone.includes(item.id)?meetingDone.filter(x=>x!==item.id):[...meetingDone,item.id])}>{meetingDone.includes(item.id)?"✓":""}</button>
                <div><div className="meetingTags"><span>{item.phase}</span><span>{item.party}</span>{item.critical&&<b>重要</b>}</div><h3>{item.title}</h3><p>{item.format}　・　準備時期：<strong>{item.timing}</strong></p></div>
              </div>
              <details><summary>打合せ・記載する内容 {item.points.length}項目</summary><ul>{item.points.map(x=><li key={x}>{x}</li>)}</ul></details>
              <button className="meetingTodo" onClick={()=>addMeetingTodo(item)}>＋ この資料準備をToDoに追加</button>
            </article>)}
          </div>
          {!meetingMatches.length&&<Empty text="条件に一致する資料がありません"/>}
          <section className="meetingRule"><b>運用ルール</b><p>会議名だけで終わらせず、提出期限・相手先・決定事項・未決事項・次回回答者を議事録へ残します。図面はこの一覧の対象外です。現場の契約条件、元請書式、特記仕様、官公署・消防・施主要領を優先してください。</p></section>
        </div>
      )}
      {tab === "support" && (
        <div className="page supportPage">
          <Title cap="SUPPORT SIZING" title="吊りボルト・架台 仮選定" sub="重量と支持条件から、全ねじ径と架台鋼材の確認候補を表示" />
          <section className="supportInputs">
            <Field label="吊り物・機器重量 kg"><input inputMode="decimal" value={supportInput.weight} onChange={e=>setSupportInput({...supportInput,weight:e.target.value})}/></Field>
            <Field label="全ねじ本数 本"><select value={supportInput.rods} onChange={e=>setSupportInput({...supportInput,rods:e.target.value})}>{[2,4,6,8,10,12].map(x=><option key={x}>{x}</option>)}</select></Field>
            <Field label="動荷重・偏り係数"><select value={supportInput.dynamic} onChange={e=>setSupportInput({...supportInput,dynamic:e.target.value})}><option value="1">1.0 静的・均等</option><option value="1.2">1.2 標準</option><option value="1.5">1.5 振動・偏り大</option></select></Field>
            <Field label="安全率"><select value={supportInput.safety} onChange={e=>setSupportInput({...supportInput,safety:e.target.value})}><option value="1.5">1.5</option><option value="2">2.0 推奨初期値</option><option value="3">3.0</option></select></Field>
            <Field label="架台スパン mm"><input inputMode="numeric" value={supportInput.span} onChange={e=>setSupportInput({...supportInput,span:e.target.value})}/></Field>
            <Field label="吊り長さ mm"><input inputMode="numeric" value={supportInput.hang} onChange={e=>setSupportInput({...supportInput,hang:e.target.value})}/></Field>
          </section>
          <section className={`supportResult ${supportLevel==="構造確認必須"?"danger":""}`}>
            <div className="supportBadge">{supportLevel}</div>
            <div className="supportMetrics"><div><span>設計用重量</span><b>{designWeight.toFixed(0)} kgf</b><small>重量×動荷重係数×安全率</small></div><div><span>1本当たり</span><b>{perRod.toFixed(1)} kgf/本</b><small>均等負担の仮定</small></div></div>
            <div className="candidate"><span>全ねじ候補</span><h3>{rodCandidate}</h3><p>ねじ径だけで決定せず、吊り元アンカー・インサート、ナット、座金、接続金具の最小耐力に合わせます。</p></div>
            <div className="candidate"><span>横架材・架台候補</span><h3>{frameCandidate}</h3><p>単純支持・中央集中荷重を想定した現場打合せ用の初期候補です。たわみ、局部座屈、溶接、ボルト接合、腐食代を別途確認します。</p></div>
          </section>
          <section className="supportChecks"><h3>必ず確認する項目</h3><div>{["アンカー／インサートの許容引張・せん断荷重","コンクリート強度、母材厚、へりあき、ピッチ","偏心荷重と各吊りボルトへの荷重分配","吊り長さが長い場合の座屈・振れ止め","地震時水平力と耐震ブレース","防振材の沈み・機器始動時の動荷重","架台スパン、たわみ、溶接・ボルト接合","屋外・高温・薬品環境の防食仕様"].map(x=><span key={x}>✓ {x}</span>)}</div></section>
          <section className="sizeGuide"><h3>現場でよく使う径の見分け</h3><div><b>W3/8 ≒ 9.5mm</b><span>一般的な配管・ダクト吊りで多用</span></div><div><b>M10</b><span>メートルねじ。W3/8とはナット互換なし</span></div><div><b>W1/2 ≒ 12.7mm / M12</b><span>重量増・大口径側の候補</span></div><div><b>W5/8 ≒ 15.9mm / M16</b><span>重量物。吊り元・接合部まで個別確認</span></div></section>
          <p className="caution strongCaution">この結果は施工図検討を始めるための仮選定です。実施工は構造計算、設計図・特記仕様書、国交省標準仕様書・標準図、使用するアンカー／支持金物メーカーの最新許容荷重表で承認を受けてください。</p>
        </div>
      )}
      {tab === "glossary" && (
        <div className="page glossaryPage">
          <Title cap="SITE GLOSSARY" title="工事用語・工具俗称検索" sub="正式名、略称、現場での呼び方から写真付きで検索" />
          <section className="glossarySearch"><input value={glossaryQuery} onChange={e=>setGlossaryQuery(e.target.value)} placeholder="例：パイレン、寸切り、FD、チャッキ、Su管"/><select value={glossaryCategory} onChange={e=>setGlossaryCategory(e.target.value)}><option>すべて</option>{Array.from(new Set(allGlossaryItems.map(x=>x.category))).map(x=><option key={x}>{x}</option>)}</select></section>
          <div className="glossaryCount">{glossaryMatches.length}件表示　<span>俗称も検索対象</span></div>
          <div className="glossaryGrid">{glossaryMatches.map(x=><article key={x.term} className="glossaryCard"><a href={x.source} target="_blank" rel="noopener noreferrer" className="toolPhoto termVisual" aria-label={`${x.term}の公式写真・資料を開く`}><b>{glossaryIcon(x.category)}</b><strong>{x.term}</strong><span>公式写真・資料 ↗</span></a><div className="glossaryBody"><small>{x.category}</small><h3>{x.term}</h3><div className="aliasTags">{x.aliases.map(a=><i key={a}>{a}</i>)}</div><p>{x.meaning}</p><dl><dt>使う場面</dt><dd>{x.use}</dd><dt>注意</dt><dd>{x.caution}</dd></dl></div></article>)}</div>
          {!glossaryMatches.length&&<Empty text="一致する用語がありません。別の呼び方でも検索してください"/>}
          <p className="caution">呼称は地域・会社・職種で異なります。発注・施工指示では俗称だけにせず、正式名称・規格・寸法・材質を併記してください。写真は同種品の代表例です。</p>
        </div>
      )}
      {tab === "documents"&&<div className="page documentPage"><Title cap="SITE DOCUMENTS" title="施工計画書・現場資料" sub="PDF原本と抽出した本文を現場資料として保存・検索"/>
        <section className="documentUpload"><form onSubmit={uploadDocument}><div className="two"><Field label="資料名"><input value={documentForm.name} onChange={e=>setDocumentForm({...documentForm,name:e.target.value})} placeholder="例：給排水衛生設備 施工計画書"/></Field><Field label="分類"><select value={documentForm.category} onChange={e=>setDocumentForm({...documentForm,category:e.target.value})}><option>施工計画書</option><option>施工要領書</option><option>メーカー資料</option><option>検査・試験要領</option><option>議事録・打合せ資料</option><option>その他</option></select></Field></div><Field label="共有範囲"><select value={documentForm.sharing} onChange={e=>setDocumentForm({...documentForm,sharing:e.target.value})}><option>自社のみ</option><option>匿名集計へ提供可</option></select></Field><label className="fileDrop"><input name="documentFile" type="file" accept="application/pdf,.pdf" required/><b>PDFを選択</b><span>文字入りPDFは本文を自動抽出・20MBまで</span></label><button className="submit" disabled={documentUploading}>{documentUploading?"読取り・保存中…":"PDFを読み取って登録"}</button></form><p>スキャン画像だけのPDFは原本を保存し「OCR待ち」と表示します。資料内容は自動で全体共有されません。</p></section>
        <section className="documentSearch"><input value={documentQuery} onChange={e=>setDocumentQuery(e.target.value)} placeholder="資料名・本文を検索　例：耐圧試験、吊りピッチ"/><button onClick={load}>検索</button></section>
        <div className="documentList">{documents.map(d=><article key={d.id}><div className="documentHead"><div><small>{d.category}・{d.sharing}</small><h3>{d.name}</h3><span>{d.pageCount?`${d.pageCount}ページ・`:""}{(d.fileSize/1024/1024).toFixed(1)}MB</span></div><em className={d.status.includes("済み")?"read":"wait"}>{d.status}</em></div>{d.preview?<p>{d.preview}</p>:<p className="noText">抽出できる文字がありません。OCR処理後に検索対象へ追加できます。</p>}<div className="documentActions"><a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer">原本PDFを開く</a><span>抽出文字 {d.textLength.toLocaleString()}字</span></div></article>)}</div>{!documents.length&&<Empty text="施工計画書PDFを登録すると、ここから検索できます"/>}<section className="documentPolicy"><b>登録資料の扱い</b><p>施工計画書・議事録・打合せ資料は現場記録として保存・検索できますが、「設備AI質問」の結論や信頼度を決める根拠には使いません。回答は官公庁、業界団体、メーカー公式の情報群を優先します。</p></section>
      </div>}
      {tab === "equipmentGuide"&&<div className="page equipmentGuidePage"><Title cap="EQUIPMENT KNOWLEDGE" title="設備機器の仕組み・納まり" sub="機器の流れ、接続、付属品、点検空間、建築・電気との取り合い"/>
        <section className="equipmentSearch"><input value={equipmentQuery} onChange={e=>setEquipmentQuery(e.target.value)} placeholder="機器名・俗称・接続で検索　例：エアハン、膨張タンク"/><select value={equipmentCategory} onChange={e=>setEquipmentCategory(e.target.value)}><option>すべて</option>{Array.from(new Set(equipmentGuides.map(x=>x.category))).map(x=><option key={x}>{x}</option>)}</select></section>
        <div className="equipmentLayout"><aside className="equipmentIndex"><div><b>{equipmentMatches.length}機種</b><span>機器を選択</span></div>{equipmentMatches.map(x=><button key={x.id} className={selectedEquipment.id===x.id?"active":""} onClick={()=>setSelectedEquipmentId(x.id)}><i>{x.category.slice(0,2)}</i><span><b>{x.name}</b><small>{x.aliases.join("・")}</small></span><em>›</em></button>)}</aside>
          <article className="equipmentDetail"><header><div><span>{selectedEquipment.category}</span><h2>{selectedEquipment.name}</h2><p>{selectedEquipment.aliases.join("・")}</p></div><div className="mechanismMark">仕組み</div></header><p className="equipmentSummary">{selectedEquipment.summary}</p>
            <figure className="equipmentVisual"><img key={selectedEquipment.id} src={equipmentImage} alt={`${selectedEquipment.name}の本体・接続・流れ・点検空間を示す専用模式図`}/><figcaption><b>{selectedEquipment.name}の専用模式図</b><span>矢印：流れ　破線：点検・保守スペースの考え方</span></figcaption><em>機器別</em></figure>
            <section className="flowSection"><h3>機器の中で何が起きるか</h3><div className="equipmentFlow">{selectedEquipment.flow.map((x,i)=><div key={x}><i>{i+1}</i><span>{x}</span>{i<selectedEquipment.flow.length-1&&<b>›</b>}</div>)}</div></section>
            <div className="equipmentColumns"><EquipmentBlock title="設置基準・据付条件" icon="基" items={selectedInstallGuide.standards}/><EquipmentBlock title="施工・試運転の注意事項" icon="!" items={selectedInstallGuide.cautions}/><EquipmentBlock title="接続するもの" icon="⇄" items={selectedEquipment.connections}/><EquipmentBlock title="必要な付属品" icon="＋" items={selectedEquipment.accessories}/><EquipmentBlock title="点検・交換空間" icon="□" items={selectedEquipment.clearance}/><EquipmentBlock title="建築との納まり" icon="⌂" items={selectedEquipment.building}/><EquipmentBlock title="電気・制御との取り合い" icon="⚡" items={selectedEquipment.electrical}/><EquipmentBlock title="施工前・試運転前チェック" icon="✓" items={selectedEquipment.checks}/></div>
            <section className="arrangementRule"><b>納まり確認の順番</b><div><span>1 搬入・基礎</span><i>→</i><span>2 点検空間</span><i>→</i><span>3 配管・ダクト</span><i>→</i><span>4 電源・制御</span><i>→</i><span>5 排水・更新</span></div><p>機器を置けるだけでは不十分です。扉・フィルター・コイル・モーター等が交換でき、弁や点検口へ手が届き、将来搬出できることまで確認します。</p></section>
            <a className="equipmentSource" href={selectedEquipment.sourceUrl} target="_blank" rel="noopener noreferrer">基準資料：{selectedEquipment.source} ↗</a>
            <p className="equipmentDisclaimer">設置寸法・離隔・アンカー・防振・耐震・配管条件の最終値は、設計図書、特記仕様書、採用機器の承認図・施工要領、法令・自治体基準を優先してください。</p>
          </article></div><p className="caution">このページは施工検討の入口です。実際の寸法・能力・離隔・接続方法は、採用機器の承認図、施工要領、設計図書、特記仕様書を優先してください。</p>
      </div>}
      {tab === "more" && (
        <div className="page">
          <Title
            cap="SITE TOOLS"
            title="その他の現場管理"
            sub="必要な台帳を順次追加できます"
          />
          <BillingUpgradeButton />
          <div className="menus">
            {tools.map((m, i) => (
              <button
                key={m}
                onClick={() =>
                  m === "建築取り合い"
                    ? setTab("coordination")
                    : m === "設備AI質問"
                    ? setTab("equipmentAi")
                    : m === "設備計算ツール"
                    ? setTab("calculators")
                    : m === "AI議事録"
                    ? setTab("meetingMinutes")
                    : m === "設備施工要領図集"
                    ? setTab("detailBook")
                    : m === "施工手順動画"
                    ? setTab("procedureVideos")
                    : m === "必須打合せ資料"
                    ? setTab("meetings")
                    : m === "重量・架台選定"
                    ? setTab("support")
                    : m === "工事用語辞典"
                    ? setTab("glossary")
                    : m === "施工計画書・資料"
                    ? setTab("documents")
                    : m === "現場設定・品質管理"
                    ? setTab("releaseCenter")
                    : m === "設備機器の仕組み"
                    ? setTab("equipmentGuide")
                    : m === "施工ルール"
                    ? setTab("constructionRules")
                    : m === "区画貫通"
                    ? setTab("penetrations")
                    : flash(`${m}は次の更新で入力機能を追加できます`)
                }
              >
                <i>{["AI", "Σ", "録", "図", "▶", "☷", "◎", "⚖", "あ", "✓", "▣", "□", "◇", "▤", "◉", "基", "↑", "?", "↗", "日"][i]}</i>
                <b>{m}</b>
                <span>
                  {m === "設備AI質問"?"官公庁・団体・メーカー公式から回答":m === "設備計算ツール"?"数字入力で式・単位・答えを自動計算":m === "AI議事録"?"無音録音・文字起こし・決定事項を整理":m === "設備施工要領図集"?"納まり・施工時期・取り合いを独自図解":m === "施工手順動画"?"施工の流れを動画と手順で確認":m === "必須打合せ資料" ? "置場・搬入・他業者調整" : m === "建築取り合い" ? "施工時期・確認事項" : m === "重量・架台選定" ? "全ねじ径・架台の目安" : m === "工事用語辞典" ? "俗称・写真から検索" : m === "設備機器の仕組み"?"仕組み・接続・周囲の納まり":m === "施工ルール"?"勾配・高さ・据付基準":m === "施工計画書・資料"?"PDF保存・本文検索":m === "区画貫通" ? "管材×壁床から工法を選定" : "管理画面を準備"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <nav>
        <button
          className={tab === "home" ? "on" : ""}
          onClick={() => setTab("home")}
        >
          <i>⌂</i>ホーム
        </button>
        <button
          className={tab === "todo" ? "on" : ""}
          onClick={() => setTab("todo")}
        >
          <i>✓</i>ToDo
        </button>
        <button
          className={tab === "schedule" ? "on" : ""}
          onClick={() => setTab("schedule")}
        >
          <i>▥</i>工程
        </button>
        <button
          className={tab === "materials" ? "on" : ""}
          onClick={() => setTab("materials")}
        >
          <i>≡</i>配管材
        </button>
        <button
          className={tab === "more" ? "on" : ""}
          onClick={() => setTab("more")}
        >
          <i>•••</i>管理
        </button>
      </nav>
      {modal === "task" && (
        <Modal close={() => {setModal(null);setEditingTaskId(null)}} title={editingTaskId!==null?"ToDoを編集":"ToDoを追加"}>
          <form onSubmit={addTask}>
            <Field label="やること">
              <input
                required
                value={tf.title}
                onChange={(e) => setTf({ ...tf, title: e.target.value })}
                placeholder="例：3階の冷媒配管ルート確認"
              />
            </Field>
            <div className="two">
              <Field label="場所">
                <input
                  value={tf.location}
                  onChange={(e) => setTf({ ...tf, location: e.target.value })}
                />
              </Field>
              <Field label="担当・確認先">
                <input
                  value={tf.assignee}
                  onChange={(e) => setTf({ ...tf, assignee: e.target.value })}
                />
              </Field>
            </div>
            <Field label="進捗">
              <select value={tf.progress} onChange={(e)=>setTf({...tf,progress:e.target.value})}>
                <option value="前">前（着手前・準備）</option>
                <option value="中">中（作業中）</option>
                <option value="後">後（確認・仕上げ）</option>
              </select>
            </Field>
            <div className="two">
              <Field label="期限">
                <input
                  type="date"
                  value={tf.dueDate}
                  onChange={(e) => setTf({ ...tf, dueDate: e.target.value })}
                />
              </Field>
              <Field label="優先度">
                <select
                  value={tf.priority}
                  onChange={(e) => setTf({ ...tf, priority: e.target.value })}
                >
                  <option>高</option>
                  <option>中</option>
                  <option>低</option>
                </select>
              </Field>
            </div>
            <button className="submit" type="submit">{editingTaskId!==null?"変更を保存":"登録する"}</button>
          </form>
        </Modal>
      )}
      {modal === "schedule" && (
        <Modal close={() => setModal(null)} title="工程を計算・登録">
          <form onSubmit={addSchedule}>
            <Field label="作業内容の目安">
              <select
                value={presets.some((p) => p.name === sf.name) ? sf.name : "その他"}
                onChange={(e) => {
                  const p = presets.find((x) => x.name === e.target.value);
                  if (p) {
                    const workType:ScheduleWorkType=p.name.includes("角ダクト")?"角ダクト":p.name.includes("丸ダクト")?"丸ダクト":p.category==="配管・ダクト"?"配管":"その他";
                    const joint=workType==="角ダクト"?"共板フランジ":workType==="丸ダクト"?"ねじ・一般接合":p.name.includes("VP")?"接着接合":p.name.includes("冷媒")?"ろう付け":"ねじ・一般接合";
                    setSf({ ...sf, name: p.name, unit: p.unit, laborRate: p.rate, crew: p.crew, workType, joint });
                    setSelectedScopes(p.category==="配管・ダクト"?["support","fabrication","hanging"]:["install"]);
                  }
                  else {setSf({ ...sf, name: "" });setSelectedScopes(["support","fabrication","hanging"]);}
                }}
              >
                <option>その他</option>
                {Array.from(new Set(presets.map((p)=>p.category))).map((category)=><optgroup key={category} label={category}>{presets.filter((p)=>p.category===category).map((p)=><option key={p.name}>{p.name}</option>)}</optgroup>)}
              </select>
            </Field>
            {selectedPreset&&<div className="presetInfo"><div><span>基準</span><b>{selectedPreset.rate}人工/{selectedPreset.unit}</b></div><div><span>目安範囲</span><b>{selectedPreset.range}</b></div><p>{selectedPreset.scope}</p></div>}
            <section className="scopeBuilder">
              <div className="scopeHead"><div><span>今回の工程に含める作業</span><b>{selectedScopeOptions.length}項目を選択</b></div><em>選んだ分だけ人工へ加算</em></div>
              <div className="scopeActions"><button type="button" onClick={()=>setSelectedScopes(activeScopeOptions.map(x=>x.id))}>全作業</button><button type="button" onClick={()=>setSelectedScopes(isPipeWork?["support","fabrication","hanging"]:["install"])}>基本作業</button><button type="button" onClick={()=>setSelectedScopes([])}>解除</button></div>
              <div className="scopeGrid">
                {activeScopeOptions.map(x=>{const checked=selectedScopes.includes(x.id);return <label key={x.id} className={checked?"checked":""}><input type="checkbox" checked={checked} onChange={()=>setSelectedScopes(checked?selectedScopes.filter(id=>id!==x.id):[...selectedScopes,x.id])}/><span><b>{x.label}</b><small>基準歩掛の {Math.round(x.factor*100)}%</small></span><i>{checked?"✓":"＋"}</i></label>})}
              </div>
              <div className="scopeSummary"><span>基準歩掛 × 選択係数 {scopeFactor.toFixed(2)}</span><b>{effectiveRate.toFixed(3)} 人工/{sf.unit}</b></div>
              {selectedScopeOptions.length>0&&<div className="scopeNotes">{selectedScopeOptions.map(x=><p key={x.id}><b>{x.short}</b>{x.note}</p>)}</div>}
            </section>
            <Field label="作業内容">
              <input
                required
                value={sf.name}
                onChange={(e) => setSf({ ...sf, name: e.target.value })}
                placeholder="SGP配管施工"
              />
            </Field>
            <div className="two">
              <Field label="場所">
                <input
                  value={sf.location}
                  onChange={(e) => setSf({ ...sf, location: e.target.value })}
                />
              </Field>
              <Field label="単位">
                <select
                  value={sf.unit}
                  onChange={(e) => setSf({ ...sf, unit: e.target.value })}
                >
                  <option>m</option>
                  <option>m2</option>
                  <option>台</option>
                  <option>個</option>
                  <option>系統</option>
                </select>
              </Field>
            </div>
            <div className="two">
              <Field label="計画数量">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={sf.quantity}
                  onChange={(e) => setSf({ ...sf, quantity: e.target.value })}
                />
              </Field>
              <Field label="基準歩掛（人工/単位）">
                <input
                  type="number"
                  step="0.001"
                  value={sf.laborRate}
                  onChange={(e) => setSf({ ...sf, laborRate: e.target.value })}
                />
              </Field>
            </div>
            {isPipeWork&&<section className="sizeFactorPanel">
              <div className="factorTitle"><div><span>サイズ・施工条件の自動補正</span><b>総合掛率 {overallFactor.toFixed(2)}</b></div><em>最終歩掛 {finalRate.toFixed(3)}人工/{sf.unit}</em></div>
              <div className="two">
                <Field label="工種"><select value={sf.workType} onChange={(e)=>setSf({...sf,workType:e.target.value as ScheduleWorkType,joint:e.target.value==="角ダクト"?"共板フランジ":"ねじ・一般接合"})}><option>配管</option><option>角ダクト</option><option>丸ダクト</option><option>その他</option></select></Field>
                {sf.workType==="配管"&&<Field label="配管呼び径（A）"><input type="number" min="1" value={sf.nominalSize} onChange={(e)=>setSf({...sf,nominalSize:e.target.value})}/></Field>}
                {sf.workType==="丸ダクト"&&<Field label="丸ダクト径（mm）"><input type="number" min="1" value={sf.ductDiameter} onChange={(e)=>setSf({...sf,ductDiameter:e.target.value})}/></Field>}
              </div>
              {sf.workType==="角ダクト"&&<div className="two"><Field label="長辺（mm）"><input type="number" min="1" value={sf.ductLong} onChange={(e)=>setSf({...sf,ductLong:e.target.value})}/></Field><Field label="短辺（mm）"><input type="number" min="1" value={sf.ductShort} onChange={(e)=>setSf({...sf,ductShort:e.target.value})}/></Field></div>}
              <div className="factorBadge"><span>{sizeFactorLabel}</span><b>サイズ掛率 ×{sizeFactor.toFixed(2)}</b></div>
              <div className="two">
                <Field label="接合・仕様"><select value={sf.joint} onChange={(e)=>setSf({...sf,joint:e.target.value})}>{sf.workType==="配管"?<><option>ねじ・一般接合</option><option>メカニカル・プレス</option><option>接着接合</option><option>ろう付け</option><option>溶接</option></>:<><option>共板フランジ</option><option>アングルフランジ</option><option>高圧ダクト仕様</option></>}</select></Field>
                <Field label="施工高さ"><select value={sf.height} onChange={(e)=>setSf({...sf,height:e.target.value})}><option>標準（～3.5m）</option><option>高所（3.5～5m）</option><option>高所（5m超）</option></select></Field>
              </div>
              <div className="two"><Field label="施工空間"><select value={sf.congestion} onChange={(e)=>setSf({...sf,congestion:e.target.value})}><option>一般部</option><option>天井内・やや狭い</option><option>機械室・過密部</option></select></Field><Field label="工事条件"><select value={sf.projectType} onChange={(e)=>setSf({...sf,projectType:e.target.value})}><option>新築</option><option>改修</option><option>稼働中改修</option></select></Field></div>
              <div className="factorFormula"><span>計算</span><code>{sizeFactor.toFixed(2)} ×（1 {conditionAdd>=0?"+":"−"} {Math.abs(conditionAdd).toFixed(2)}）× {manualFactor.toFixed(2)} ＝ <b>{overallFactor.toFixed(2)}</b></code></div>
              <small className="factorCaution">サイズ以外の条件は加算してからサイズ掛率へ反映します。掛率は計画用の初期値なので、会社実績や現場条件に合わせて調整してください。</small>
            </section>}
            <div className="three">
              <Field label="手動微調整">
                <input
                  type="number"
                  step="0.01"
                  value={sf.factor}
                  onChange={(e) => setSf({ ...sf, factor: e.target.value })}
                />
              </Field>
              <Field label="班人数">
                <input
                  type="number"
                  value={sf.crew}
                  onChange={(e) => setSf({ ...sf, crew: e.target.value })}
                />
              </Field>
              <Field label="稼働率">
                <input
                  type="number"
                  step="0.01"
                  value={sf.utilization}
                  onChange={(e) =>
                    setSf({ ...sf, utilization: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="two">
              <Field label="開始日">
                <input
                  type="date"
                  value={sf.startDate}
                  onChange={(e) => setSf({ ...sf, startDate: e.target.value })}
                />
              </Field>
              <Field label="実績数量">
                <input
                  type="number"
                  value={sf.actualQuantity}
                  onChange={(e) =>
                    setSf({ ...sf, actualQuantity: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="calcPreview">
              <span>
                必要人工 <b>{previewLabor.toFixed(2)}</b>
              </span>
              <span>
                所要日数 <b>{previewDays}日</b>
              </span>
            </div>
            <div className="calcBreakdown"><b>計算内訳</b><span>基準 {Number(sf.laborRate||0).toFixed(3)} × 作業範囲 {scopeFactor.toFixed(2)} × 総合掛率 {overallFactor.toFixed(2)}</span><strong>{Number(sf.quantity||0)}{sf.unit} × {finalRate.toFixed(3)} ＝ {previewLabor.toFixed(2)}人工</strong></div>
            <div className="guide">
              <b>自動入力値の見方</b>
              <p>基準歩掛に作業範囲とサイズ掛率を反映し、高所・狭所・改修・接合方法を加算補正します。手動微調整は通常1.00、実績に合わせて0.8～1.5程度で調整してください。</p>
              <small>プリセットは仮の計画値です。会社の実績・現場条件・仕様で補正してください。</small>
            </div>
            <Submit text="工程を登録する" />
          </form>
        </Modal>
      )}
      {modal === "material" && (
        <Modal close={() => setModal(null)} title="配管材を追加">
          <form onSubmit={addMaterial}>
            <Field label="品名">
              <input
                required
                value={mf.name}
                onChange={(e) => setMf({ ...mf, name: e.target.value })}
                placeholder="エルボ・フランジ・パッキン等"
              />
            </Field>
            <div className="two">
              <Field label="管種">
                <select
                  value={mf.pipeType}
                  onChange={(e) => setMf({ ...mf, pipeType: e.target.value })}
                >
                  {[
                    "SGP白ガス",
                    "SGP黒ガス",
                    "SUS",
                    "ナイスジョイント",
                    "VP",
                    "VU",
                    "耐火二層管",
                    "冷媒銅管",
                    "銅管",
                    "その他",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="口径・サイズ">
                <input
                  value={mf.size}
                  onChange={(e) => setMf({ ...mf, size: e.target.value })}
                  placeholder="50A"
                />
              </Field>
            </div>
            <div className="two">
              <Field label="数量">
                <input
                  type="number"
                  required
                  value={mf.quantity}
                  onChange={(e) => setMf({ ...mf, quantity: e.target.value })}
                />
              </Field>
              <Field label="単位">
                <select
                  value={mf.unit}
                  onChange={(e) => setMf({ ...mf, unit: e.target.value })}
                >
                  <option>個</option>
                  <option>本</option>
                  <option>枚</option>
                  <option>組</option>
                  <option>m</option>
                </select>
              </Field>
            </div>
            <div className="two">
              <Field label="仕入先">
                <input
                  value={mf.vendor}
                  onChange={(e) => setMf({ ...mf, vendor: e.target.value })}
                />
              </Field>
              <Field label="状態">
                <select
                  value={mf.status}
                  onChange={(e) => setMf({ ...mf, status: e.target.value })}
                >
                  <option>未発注</option>
                  <option>見積中</option>
                  <option>発注済</option>
                  <option>納入済</option>
                </select>
              </Field>
            </div>
            <Field label="必要日">
              <input
                type="date"
                value={mf.neededDate}
                onChange={(e) => setMf({ ...mf, neededDate: e.target.value })}
              />
            </Field>
            <Submit text="材料リストに追加" />
          </form>
        </Modal>
      )}
      {modal === "penetration" && (
        <Modal close={() => setModal(null)} title="区画貫通を追加">
          <form onSubmit={addPenetration}>
            <div className="two"><Field label="管理番号"><input required value={pf.penetrationNo} onChange={(e)=>setPf({...pf,penetrationNo:e.target.value})} placeholder="F-001" /></Field><Field label="階"><input value={pf.floor} onChange={(e)=>setPf({...pf,floor:e.target.value})} /></Field></div>
            <Field label="場所"><input value={pf.location} onChange={(e)=>setPf({...pf,location:e.target.value})} /></Field>
            <div className="two"><Field label="区画種別"><select value={pf.compartmentType} onChange={(e)=>setPf({...pf,compartmentType:e.target.value})}><option>防火区画</option><option>防煙区画</option><option>令8区画</option><option>その他</option></select></Field><Field label="貫通物"><select value={pf.penetratingItem} onChange={(e)=>setPf({...pf,penetratingItem:e.target.value})}><option>配管</option><option>ダクト</option><option>ケーブル</option><option>複合</option></select></Field></div>
            <div className="three"><Field label="管種"><input value={pf.pipeType} onChange={(e)=>setPf({...pf,pipeType:e.target.value})} /></Field><Field label="サイズ"><input value={pf.size} onChange={(e)=>setPf({...pf,size:e.target.value})} /></Field><Field label="開口"><input value={pf.openingSize} onChange={(e)=>setPf({...pf,openingSize:e.target.value})} /></Field></div>
            <div className="two"><Field label="工法・製品"><input value={pf.method} onChange={(e)=>setPf({...pf,method:e.target.value})} /></Field><Field label="認定番号"><input value={pf.approvalNo} onChange={(e)=>setPf({...pf,approvalNo:e.target.value})} /></Field></div>
            <div className="two"><Field label="施工日"><input type="date" value={pf.constructionDate} onChange={(e)=>setPf({...pf,constructionDate:e.target.value})} /></Field><Field label="検査日"><input type="date" value={pf.inspectionDate} onChange={(e)=>setPf({...pf,inspectionDate:e.target.value})} /></Field></div>
            <div className="two"><Field label="写真番号"><input value={pf.photoNo} onChange={(e)=>setPf({...pf,photoNo:e.target.value})} /></Field><Field label="状態"><select value={pf.status} onChange={(e)=>setPf({...pf,status:e.target.value})}><option>未施工</option><option>施工済</option><option>検査済</option><option>是正</option></select></Field></div>
            <Field label="備考"><input value={pf.note} onChange={(e)=>setPf({...pf,note:e.target.value})} /></Field>
            <Submit text="区画貫通を登録する" />
          </form>
        </Modal>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
function Head({
  title,
  action,
  click,
}: {
  title: string;
  action?: string;
  click?: () => void;
}) {
  return (
    <div className="sectionHead">
      <h2>{title}</h2>
      {action && <button onClick={click}>{action}</button>}
    </div>
  );
}
function Title({
  cap,
  title,
  sub,
  add,
}: {
  cap: string;
  title: string;
  sub: string;
  add?: () => void;
}) {
  return (
    <div className="pageTitle">
      <div>
        <span className="eyebrow">{cap}</span>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {add && <button onClick={add}>＋ 追加</button>}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}
function CoordPhase({no,title,items}:{no:string;title:string;items:string[]}) {
  return <section className="coordPhase"><div className="phaseTitle"><i>{no}</i><b>{title}</b></div><ul>{items.map(x=><li key={x}>{x}</li>)}</ul></section>;
}
function Modal({
  close,
  title,
  children,
}: {
  close: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div>
            <span className="eyebrow">NEW RECORD</span>
            <h2>{title}</h2>
          </div>
          <button onClick={close}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}
function EquipmentBlock({title,icon,items}:{title:string;icon:string;items:string[]}){return <section className="equipmentBlock"><h3><i>{icon}</i>{title}</h3><ul>{items.map(x=><li key={x}>{x}</li>)}</ul></section>}
function Submit({ text = "追加する" }: { text?: string }) {
  return <button className="submit">{text}</button>;
}
function ScheduleList({
  items,
  calc,
  del,
}: {
  items: Schedule[];
  calc: (s: Schedule) => { labor: number; days: number; progress: number };
  del: (id: number) => void;
}) {
  return (
    <div className="schedule">
      {items.length ? (
        items.map((s) => {
          const c = calc(s);
          return (
            <article className="scheduleRow" key={s.id}>
              <div>
                <span>
                  <b>{s.name}</b>
                <small>
                  {s.location || "場所未設定"}　計画 {s.quantity}
                  {s.unit}
                </small>
                {s.scope&&<small className="scheduleScope">含む：{s.scope}</small>}
                {s.scopeDetail&&<small className="scheduleFactors">掛率：{s.scopeDetail}</small>}
                </span>
                <em>{c.progress}%</em>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.max(c.progress, 2)}%` }} />
              </div>
              <div className="calcLine">
                <small>必要人工 {c.labor.toFixed(2)}</small>
                <small>
                  班 {s.crew}人 × 稼働率 {s.utilization}%
                </small>
                <b>{c.days}日</b>
                <button onClick={() => del(s.id)}>×</button>
              </div>
            </article>
          );
        })
      ) : (
        <Empty text="工程を追加すると自動計算されます" />
      )}
    </div>
  );
}
function TaskCard({
  t,
  toggle,
  edit,
  remove,
}: {
  t: Task;
  toggle: () => void;
  edit: () => void;
  remove: () => void;
}) {
  return (
    <article className={`task ${t.status === "完了" ? "done" : ""}`}>
      <button className="check" onClick={toggle}>
        {t.status === "完了" ? "✓" : ""}
      </button>
      <div>
        <span className="taskTitle">
          <b>{t.title}</b>
          <i className={`p${t.priority}`}>{t.priority}</i>
          <i className={`progressTag progress${t.progress||"前"}`}>進捗 {t.progress||"前"}</i>
        </span>
        <p>
          {[t.location, t.assignee].filter(Boolean).join(" ・ ") ||
            "場所・担当未設定"}
        </p>
        <small>
          {t.dueDate ? `期限 ${t.dueDate.replaceAll("-", "/")}` : "期限なし"}
        </small>
      </div>
      <div className="taskActions"><button className="taskEdit" onClick={edit} aria-label={`${t.title}を編集`}>編集</button><button className="delete" onClick={remove} aria-label={`${t.title}を削除`}>×</button></div>
    </article>
  );
}
