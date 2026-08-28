"use client";
import {useEffect,useState} from "react";
type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};
export default function PwaSetup(){
  const [prompt,setPrompt]=useState<InstallPromptEvent|null>(null);const [showIos,setShowIos]=useState(false);const [dismissed,setDismissed]=useState(true);
  useEffect(()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(()=>undefined);const standalone=window.matchMedia("(display-mode: standalone)").matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;const hidden=localStorage.getItem("pwa-install-dismissed")==="1";const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);const timer=window.setTimeout(()=>{setDismissed(hidden||standalone);setShowIos(ios&&!standalone&&!hidden)},0);const onPrompt=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPromptEvent);setDismissed(hidden||standalone)};window.addEventListener("beforeinstallprompt",onPrompt);return()=>{window.clearTimeout(timer);window.removeEventListener("beforeinstallprompt",onPrompt)}},[]);
  const close=()=>{localStorage.setItem("pwa-install-dismissed","1");setDismissed(true);setShowIos(false)};const install=async()=>{if(!prompt)return;await prompt.prompt();await prompt.userChoice;setPrompt(null);setDismissed(true)};
  if(dismissed||(!prompt&&!showIos))return null;
  return <aside className="pwaInstall" aria-label="アプリをホーム画面に追加"><div className="pwaMark">設</div><div><b>設備現場アプリとして使えます</b>{showIos?<p>Safariの共有ボタンから「ホーム画面に追加」を選択してください。</p>:<p>ホーム画面へ追加すると、全画面ですぐ起動できます。</p>}</div>{prompt&&<button className="pwaAdd" onClick={install}>追加</button>}<button className="pwaClose" onClick={close} aria-label="閉じる">×</button></aside>;
}
