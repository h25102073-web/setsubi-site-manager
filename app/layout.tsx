import type {Metadata,Viewport} from "next";
import "./globals.css";
import "./features.css";
import "./home-cleanup.css";
import PwaSetup from "./pwa-setup";

const siteUrl="https://setsubi-site-manager.h25102073.chatgpt.site";

export const metadata:Metadata={
 metadataBase:new URL(siteUrl),
 title:{
  default:"設備現場マネージャー｜設備施工管理・現場監督向け管理ツール",
  template:"%s｜設備現場マネージャー"
 },
 description:"設備施工管理・設備現場監督向けの現場管理Webアプリ。ToDo、工程、配管材、施工ルール、施工要領、区画貫通、設備知識、先行調整などをスマホで一元管理できます。",
 applicationName:"設備現場マネージャー",
 keywords:[
  "設備現場マネージャー",
  "設備施工管理",
  "設備現場監督",
  "施工管理 アプリ",
  "設備管理 アプリ",
  "機械設備",
  "配管 施工管理",
  "現場管理",
  "工程管理",
  "設備施工"
 ],
 alternates:{canonical:"/"},
 robots:{
  index:true,
  follow:true,
  googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}
 },
 verification:{
  google:"bfw-PGO9tY3GWPAQFAOcWFQfRh6fUgR1t4JBJj4LtPM"
 },
 openGraph:{
  type:"website",
  locale:"ja_JP",
  url:siteUrl,
  siteName:"設備現場マネージャー",
  title:"設備現場マネージャー｜設備施工管理・現場監督向け管理ツール",
  description:"設備施工管理のToDo・工程・配管材・施工ルール・施工要領・先行調整を一元管理。現場監督向けWebアプリ。"
 },
 twitter:{
  card:"summary",
  title:"設備現場マネージャー｜設備施工管理・現場監督向け管理ツール",
  description:"設備施工管理のToDo・工程・配管材・施工ルール・施工要領・先行調整を一元管理。"
 },
 category:"construction management",
 manifest:"/manifest.webmanifest",
 icons:{
  icon:[{url:"/favicon.svg",type:"image/svg+xml"},{url:"/icons/app-192.png",sizes:"192x192",type:"image/png"}],
  apple:[{url:"/icons/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]
 },
 appleWebApp:{capable:true,title:"設備現場",statusBarStyle:"black-translucent"},
 formatDetection:{telephone:false},
 other:{"codex-preview":"development","mobile-web-app-capable":"yes"}
};

export const viewport:Viewport={themeColor:"#17365d",width:"device-width",initialScale:1,viewportFit:"cover"};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="ja"><body>{children}<a href="/work-assist" className="workAssistEntry" aria-label="先行検討・現場支援センター">先行検討・現場支援</a><PwaSetup/></body></html>;
}
