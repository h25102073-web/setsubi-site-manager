import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("FREE upgrade button is mounted directly below the management heading", async () => {
  const page = await read("app/page.tsx");
  assert.match(
    page,
    /title="その他の現場管理"[\s\S]*?<BillingUpgradeButton \/>[\s\S]*?<div className="menus">/,
  );
});

test("billing card switches between Checkout and Portal using returned URLs", async () => {
  const button = await read("app/BillingUpgradeButton.tsx");
  assert.match(button, /fetch\("\/api\/billing\/checkout"/);
  assert.match(button, /method: "POST"/);
  assert.match(button, /body: JSON\.stringify\(\{ interval: "month" \}\)/);
  assert.match(button, /window\.location\.assign\(result\.url\)/);
  assert.match(button, /PROにアップグレード 月980円/);
  assert.match(button, /fetch\("\/api\/billing\/portal", \{ method: "POST" \}\)/);
  assert.match(button, /契約内容を確認・変更/);
  assert.match(button, /PROプランをご利用中/);
  assert.match(button, /if \(active\) setBilling\(\{ isPro: false \}\)/);
});

test("billing routes contain only the four supported top-level endpoints", async () => {
  const billingRoot = new URL("../app/api/billing/", import.meta.url);
  const entries = (await readdir(billingRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(entries, ["checkout", "portal", "status", "webhook"]);
});
