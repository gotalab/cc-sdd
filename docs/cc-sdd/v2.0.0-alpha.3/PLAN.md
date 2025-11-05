# Windsurf Agent Integration Plan

**作成日**: 2025-10-22  
**担当**: Codex CLI  
**目的**: kiro Spec-Driven Development ワークフローを Windsurf IDE 上で再現するために、cc-sdd へ `windsurf` エージェントを正式対応させる。

---

## 🎯 ゴールと適用範囲
- CLI で `npx cc-sdd@next --windsurf`（`--agent windsurf` エイリアス含む）選択時に `.windsurf/workflows/` へワークフロー一式と `AGENTS.md`、共有設定を展開できること。
- テンプレート → 実体化の導線（manifest, registry, dist ビルド, テスト, ドキュメント）を既存エージェントと同等品質で整える。
- ユーザーが Windsurf 上で kiro ワークフローを迷わず開始できるドキュメントを提供する。

**対象領域**
- `tools/cc-sdd`（template, manifest, TypeScript 実装, dist 出力, テスト）
- ルート配下の Windsurf 専用ディレクトリ `.windsurf/workflows/`
- プロジェクトドキュメント (`docs`, `tools/cc-sdd/README*`)

**除外**
- Windsurf 固有の追加テンプレート改修（既に templates/agents/windsurf に完成済みの前提）
- Kiro 設定テンプレート（共有ディレクトリに既存を再利用）

---

## 🧭 実装ステップ

### 1. テンプレート最終確認
- `tools/cc-sdd/templates/agents/windsurf/**/*` の内容・構成（commands → workflows へのマッピング, AGENTS.md, file naming）をレビュー。
- 既存エージェント比で不足するコマンドやセクションがないかチェック。必要ならテンプレート側に追記。
- Windsurf コマンドファイルは Cursor 等と同等の SubAgent 指示構成で揃っていることを確認済み。

### 2. CLI/Manifest 配線
- `tools/cc-sdd/templates/manifests/windsurf.json` を新規作成し、`commands -> .windsurf/workflows/`, `doc -> ./AGENTS.md`, `settings -> {{KIRO_DIR}}/settings` を定義。
- `tools/cc-sdd/src/agents/registry.ts` に Windsurf 定義追加  
  - `commandsDir: '.windsurf/workflows'`, `docFile: 'AGENTS.md'`, 推奨モデル, エイリアス（例: `--windsurf`）を整理。  
  - 必要に応じ `completionGuide.prependSteps` などを検討。
- `dist/agents/registry.js` を再生成して dist 反映。
- `tools/cc-sdd/src/template/context.ts` など、`AGENT_COMMANDS_DIR` 参照箇所に影響がないか確認。

### 3. CLI 振る舞いテスト整備
- `tools/cc-sdd/test/realManifestWindsurf.test.ts`（仮）を既存 realManifest 系テストにならい追加。  
  - dry-run でのプラン出力, apply 後メッセージ & 推奨モデル表示, `.windsurf/workflows/` へのコピー確認。
- `tools/cc-sdd/test/args.test.ts` にエイリアス検証を追加。  
- manifest planner / executor のカテゴリ説明が `.windsurf/workflows/` に対応するか確認し、必要なら追加入力。
- `pnpm test --filter windsurf` 等での新テスト導線を記載。

### 4. ドキュメント更新
- ルートの `README.md` を含め、`tools/cc-sdd/README*.md`（en/ja/zh-TW など）に対応エージェント一覧へ Windsurf を追加。  
- `docs/README/*` や `docs/cc-sdd/**` でユーザー導線がある箇所を更新。  
- 必要なら `docs/RELEASE_NOTES` に Windsurf 対応を追記。
- `docs/README/README_{en,ja,zh-TW}.md` へ Windsurf のディレクトリ案内を反映済み。

### 5. 動作確認ガイド作成
- 手動 QA を前提として、`npx cc-sdd@next --windsurf --dry-run` および `npx cc-sdd@next --windsurf --yes` を用いた検証手順をドキュメントに記載。
- 自動テストとの差異（手動で行う範囲）を明示し、ユーザーが追従しやすいように整理。
- README の Quick Start に `npx cc-sdd@next --windsurf` を追加済み。計画中の手動 QA 手順は以下の順序で案内する:  
  1. `npx cc-sdd@next --windsurf --dry-run --lang en` で生成プランを確認  
  2. 必要に応じて `--lang ja` 等で言語を切替えて検証  
  3. 実行検証時は `npx cc-sdd@next --windsurf --yes` を使用し、`.windsurf/workflows/` と `AGENTS.md` の差分をチェック  
  4. Windsurf IDE 上でコマンド一覧にワークフローが出現するかをユーザーが手動で確認

---

## ✅ TODO リスト
- [x] Windsurf テンプレートの内容確認
- [x] `windsurf.json` manifest 作成
- [x] `registry.ts` / `dist/registry.js` に Windsurf 追加
- [x] CLI 引数・ヘルプ・テスト（特に alias）更新
- [x] realManifest 系テスト追加 & CI 実行
- [x] README / ドキュメント更新（root `README.md` を含む）
- [x] 手動 QA 手順案内（`npx cc-sdd@next --windsurf` コマンド例）作成

---

## 📎 メモ
- Windsurf は `.windsurf/workflows/` へ置くと公式ワークフローメニューに即座に追加される仕様。サブディレクトリは不可のため manifest の `toDir` は固定値で設定する。  
- 既存テンプレートからの差異はコマンド拡張子と YAML ヘッダー程度と想定。差分が大きい場合はテンプレート側で再度見直すこと。  
- 直近スプリント内での ship を目指すため、翻訳差分（ja/zh-TW）については最小限の追従でよいが、未翻訳箇所には TODO コメントを入れて後続チームへ共有。
