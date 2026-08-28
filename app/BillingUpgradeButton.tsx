"use client";

import { useEffect, useState } from "react";

type BillingStatus = { isPro?: boolean };

export default function BillingUpgradeButton() {
  const [isFree, setIsFree] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/billing/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("プラン情報を確認できませんでした");
        return response.json() as Promise<BillingStatus>;
      })
      .then((billing) => {
        if (active) setIsFree(billing.isPro !== true);
      })
      .catch(() => {
        // Checkout側でも認証と契約状態を検証するため、状態取得だけが
        // 一時的に失敗した場合もFREE向け導線そのものは隠さない。
        if (active) setIsFree(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCheckout = async () => {
    setUpgrading(true);
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
      setUpgrading(false);
    }
  };

  if (!isFree) return null;

  return (
    <section className="managementUpgrade" aria-label="PROプランへのアップグレード">
      <div>
        <span>FREEプランをご利用中</span>
        <strong>設備現場マネージャー PRO</strong>
        <small>全機能を月額980円で利用できます</small>
      </div>
      <button type="button" onClick={openCheckout} disabled={upgrading}>
        {upgrading ? "決済画面を準備中…" : "PROにアップグレード 月980円"}
      </button>
      {message && <p role="alert">{message}</p>}
    </section>
  );
}
