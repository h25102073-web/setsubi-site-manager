"use client";

import { useEffect, useState } from "react";

type BillingStatus = { isPro?: boolean };

export default function BillingUpgradeButton() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loadingAction, setLoadingAction] = useState<"checkout" | "portal" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/billing/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("プラン情報を確認できませんでした");
        return response.json() as Promise<BillingStatus>;
      })
      .then((result) => {
        if (active) setBilling(result);
      })
      .catch(() => {
        // Checkout側でも認証と契約状態を検証するため、状態取得だけが
        // 一時的に失敗した場合もFREE向け導線そのものは隠さない。
        if (active) setBilling({ isPro: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const openCheckout = async () => {
    setLoadingAction("checkout");
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interval: "month" }),
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "決済画面を開けませんでした");
      }
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "決済画面を開けませんでした");
      setLoadingAction(null);
    }
  };

  const openPortal = async () => {
    setLoadingAction("portal");
    setMessage("");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "契約管理画面を開けませんでした");
      }
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "契約管理画面を開けませんでした");
      setLoadingAction(null);
    }
  };

  if (!billing) return null;

  const isPro = billing.isPro === true;

  return (
    <section className="managementUpgrade" aria-label={isPro ? "PROプランの契約管理" : "PROプランへのアップグレード"}>
      <div>
        <span>{isPro ? "PROプランをご利用中" : "FREEプランをご利用中"}</span>
        <strong>設備現場マネージャー PRO</strong>
        <small>{isPro ? "契約内容・支払方法・解約を管理できます" : "全機能を月額980円で利用できます"}</small>
      </div>
      <button
        type="button"
        onClick={isPro ? openPortal : openCheckout}
        disabled={loadingAction !== null}
      >
        {loadingAction
          ? isPro ? "契約管理画面を準備中…" : "決済画面を準備中…"
          : isPro ? "契約内容を確認・変更" : "PROにアップグレード 月980円"}
      </button>
      {message && <p role="alert">{message}</p>}
    </section>
  );
}
