# 設備現場マネージャー PWA公開手順

## PWA対応済み
- Web App Manifest: `public/manifest.webmanifest`
- Service Worker: `public/service-worker.js`
- オフライン画面: `public/offline.html`
- 192 / 512 / maskable / Apple Touch アイコン
- iOS / Android / PCのホーム画面・アプリインストール対応
- API・認証・Cookie付き通信はService Workerでキャッシュしない安全設定

## 重要: 公開GitHubへ登録しないもの
`data-export/` は現場・ユーザー情報を含む可能性があるため `.gitignore` 済みです。
公開リポジトリへはアップロードしないでください。

## 公開の流れ
1. GitHubへソースをpush
2. Cloudflare Pages / Workers または対応ホスティングへ接続
3. 環境変数とDBを設定
4. HTTPSで公開
5. Chrome DevTools > Application で Manifest / Service Worker を確認
6. Android Chrome / iPhone Safariでインストール確認

## 更新確認
Service Workerのキャッシュ名は `setsubi-pwa-v2-*` です。
更新時はバージョン名を上げると古いキャッシュを削除できます。
