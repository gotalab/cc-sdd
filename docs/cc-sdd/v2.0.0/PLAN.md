# cc-sdd v2.0.0 リリースプラン

## 概要

cc-sddをv2.0.0-alpha.6からv2.0.0安定版へ移行します。

**現在の状況:**
- バージョン: 2.0.0-alpha.6
- ブランチ: release/v2.0.0
- パッケージ: tools/cc-sdd/package.json

**目標:**
- バージョン: 2.0.0 (安定版)
- npm tag: latest
- 本番環境対応リリース

---

## リリース戦略

### フェーズ1: ドキュメント & CHANGELOG
1. すべてのalpha版の変更をv2.0.0リリースノートに統合
2. 安定版リリースを反映するようドキュメントを更新
3. alpha版固有の参照を削除・更新

### フェーズ2: バージョン & パッケージ更新
1. package.jsonのバージョン更新
2. ビルドとテストプロセスの検証
3. npm公開設定の準備

### フェーズ3: リリース実行
1. gitタグの作成
2. npmへの公開
3. リポジトリ設定の更新

---

## TODO

### 1. CHANGELOGの更新
- [x] `[Unreleased]`セクションの内容を`[2.0.0] - 2025-11-09`に移動
- [x] alpha.1からalpha.6までの変更を統合し、一貫性のあるv2.0.0リリースノートにする
- [x] リリース日を追加（2025-11-09）
- [x] すべてのPRとissueが適切に参照されているか確認
- [x] v1.xからの移行ガイドへのリンクを追加
- [x] リリースノートの内容を見直し、わかりやすく整理（CHANGELOGとRelease Notesの情報重複を解消）
  - 主要なハイライトセクション追加
  - カテゴリ別に整理（Core Features, Platform Support, Validation Commands等）
  - Breaking Changesセクション追加
  - Migration Guideへのリンク追加

### 2. パッケージバージョンの更新
- [x] `tools/cc-sdd/package.json`のversionを`2.0.0-alpha.6`から`2.0.0`に更新
- [x] package.jsonのフィールド（description、keywords、repository等）を確認
  - descriptionを更新（「7 AI coding agents」を明記）
  - keywordsを拡充（cursor, windsurf, gemini-cli, codex, github-copilot, qwen-code, subagents, parallel-tasks追加）
- [x] 依存関係が本番環境対応か確認（alpha/beta版の依存なし）
  - ✅ devDependenciesのみ（本番依存なし）
  - ✅ すべて安定版（@types/node, typescript, vitest）

### 3. READMEドキュメントの更新

#### メインREADME (`/README.md`)
- [x] インストール例を`@latest`を主軸に更新
- [x] `@next`と`@latest`の使い分けを明確化（「@next is now reserved for future alpha/beta versions」追加）
- [x] "Alpha version"への言及を削除
- [x] 全エージェントで`@latest`を使用するよう更新
- [x] "requires cc-sdd@next"表記を削除（SubAgents、Windsurf）

#### ツールREADME (`/tools/cc-sdd/README.md`)
- [x] インストール例を更新（全エージェントで`@latest`使用）
- [x] "requires cc-sdd@next"表記を削除（SubAgents、Windsurf）
- [x] "Alpha version with major updates"の行を削除
- [x] "Beta Release"を"Stable Release v2.0.0"に変更
- [x] 各エージェントのコマンド数を明記

#### 多言語版README
- [x] `/tools/cc-sdd/README_ja.md`を更新
  - インストール例、エージェント表、ステータス表記をすべて更新
  - "ベータリリース" → "安定版リリース v2.0.0"
- [x] `/tools/cc-sdd/README_zh-TW.md`を更新
  - インストール例、エージェント表、ステータス表記をすべて更新
  - "Beta 版本" → "穩定版 v2.0.0"
- [ ] `/docs/README/README_en.md`を確認・更新（必要に応じて）
- [ ] `/docs/README/README_ja.md`を確認・更新（必要に応じて）
- [ ] `/docs/README/README_zh-TW.md`を確認・更新（必要に応じて）

### 4. リリースノートの更新
- [x] `/docs/RELEASE_NOTES/RELEASE_NOTES_en.md`を更新（CHANGELOGとの重複箇所を整理し、マーケサマリに専念させる）
  - Unreleasedセクションをv2.0.0に統合
  - 主要ハイライト、新機能、改善点、破壊的変更を追加
  - 移行ガイドへのリンクを追加
  - Previous Alpha Releasesセクションを追加
- [x] `/docs/RELEASE_NOTES/RELEASE_NOTES_ja.md`を更新（英語版の整理結果を反映）
  - 英語版と同様の構成で日本語版を更新
  - すべての機能説明を日本語化

### 5. 移行ガイドの作成（新規）
- [x] `/docs/guides/migration-guide.md`を作成
  - [ ] v1.x → v2.0.0への移行手順
  - [ ] 破壊的変更の詳細説明
  - [ ] テンプレート構造の変更（os-mac/os-windows削除）
  - [ ] Steering機能の変更（プロジェクトメモリ化）
  - [ ] コマンド数の変更（8→11コマンド）
  - [ ] 新機能の利用方法（SubAgents、Windsurf、並列タスク等）
  - [ ] 既存プロジェクトでのアップグレード手順
  - [ ] トラブルシューティング

### 6. 既存ガイドの更新
- [x] `/docs/guides/claude-subagents.md`を更新
  - [x] `npx cc-sdd@next` → `npx cc-sdd@latest`に変更（7行目）
  - [x] "@next channel" → "`--claude-agent` flag"に変更（62行目）
  - [x] その他の@next参照を確認

### 7. デザインテンプレート / ルール / サンプル (PLAN2連動)
- [x] `tools/cc-sdd/templates/shared/settings/templates/specs/design.md` をPLAN2方針（要約表、コンポーネント密度、Supporting References等）に合わせて刷新
- [x] `tools/cc-sdd/templates/shared/settings/rules/design-principles.md` に重複排除・表利用規則・Supporting References運用などの共通ルールを追記
- [x] `docs/cc-sdd/v2.0.0/design-template-sample.md` でBefore/Afterスニペットを追加し、作者・レビュア向けの読み方を提示
- [x] `docs/cc-sdd/v2.0.0/PLAN2.md` を完成版として保守し、リリースプランと相互参照できるようにする

### 8. コード & テンプレートのレビュー
- [x] コードベース内の"alpha"への言及を検索し、必要に応じて更新
  - ✅ `tools/cc-sdd/src/resolvers/kiroDir.ts`: "alphanumeric"のみ（問題なし）
  - ✅ その他のソースファイル: バージョン関連の言及なし
- [x] コードベース内の"beta"への言及を検索し、必要に応じて更新
  - ✅ 問題となる言及なし
- [x] テンプレートファイルにalpha版固有の指示がないか確認
  - ✅ `tools/cc-sdd/templates/shared/settings/rules/design-principles.md`: "alphanumeric"のみ（問題なし）
  - ✅ すべての"next"は「次のステップ」という文脈（バージョン関連ではない）
- [x] CLIメッセージとヘルプテキストを確認
  - ✅ `src/cli/agents.ts`: 一般的なメッセージのみ
  - ✅ `src/agents/registry.ts`: エージェント定義のみ（バージョン関連なし）

### 9. ビルド & テストの検証
- [ ] tools/cc-sddで`npm run build`を実行
- [ ] tools/cc-sddで`npm test`を実行
- [ ] dist出力が正しいか確認
- [ ] ローカルでインストールテスト: `npm link`してサンプルプロジェクトでテスト
- [ ] すべてのエージェントタイプをテスト（claude、cursor、gemini、codex、copilot、qwen、windsurf）
- [ ] 複数言語をテスト（最低でもen、ja、zh-TW）

### 10. Git & リポジトリ
- [ ] すべてのバージョン更新の変更をコミット
- [ ] gitタグを作成: `v2.0.0`
- [ ] タグをリポジトリにプッシュ
- [ ] release/v2.0.0ブランチをmainにマージ
- [ ] リリースノート付きでGitHubリリースを作成

### 11. npm公開
- [ ] ドライラン公開: `npm publish --dry-run`
- [ ] npmに公開: `npm publish`（tools/cc-sddディレクトリから）
- [ ] パッケージが`latest`タグでnpmレジストリに表示されるか確認
- [ ] インストールテスト: `npx cc-sdd@latest`
- [ ] 必要に応じてnpm dist-tagsを更新

### 12. リリース後
- [ ] リポジトリのREADMEバッジを安定版バージョンに更新
- [ ] リリースをアナウンス（GitHub、SNS等）
- [ ] リリース関連の問題についてGitHub issuesを監視
- [ ] 該当する場合、ドキュメントサイトを更新
- [ ] v2.0.1またはv2.1.0マイルストーンの計画

---

## v2.0.0の主な変更点

### 新機能（alpha版リリースから）
1. **並列タスク分析** - タスクの並列化可能性を自動検出
2. **Research.mdテンプレート** - 発見事項と設計ドキュメントを分離
3. **Claude Code SubAgentsモード** - SDDコマンドのコンテキスト最適化
4. **Windsurf IDEサポート** - 完全なワークフロー統合
5. **対話型CLIインストーラー** - プロジェクトメモリ処理を含むガイド付きセットアップ
6. **検証コマンド** - brownfield projectsのためのギャップ分析と設計検証
7. **マルチプラットフォームサポート** - 7つのAIコーディングエージェント（Claude Code、Cursor、Gemini、Codex、Copilot、Qwen、Windsurf）
8. **12言語サポート** - 包括的な国際化対応

### 破壊的変更
- テンプレート構造の統一（os-mac/os-windowsディレクトリを削除）
- Steeringがプロジェクト全体のルール（Project Memory）として機能
- コマンド構造を8から11に拡張

### v1.xからの移行
- テンプレートがエージェント固有ディレクトリから共有`{{KIRO_DIR}}/settings/`に移動
- Steeringドキュメントが`steering/`ディレクトリ全体から読み込まれるように
- すべてのテンプレートが実際の拡張子を使用（.md、.prompt.md、.toml）

---

## 不足しているドキュメント

### 作成済み
- ✅ `/docs/guides/migration-guide.md` - v1.x → v2.0.0 移行ガイド

### オプション（将来的に作成を検討）
- [ ] `/docs/guides/installation-guide.md` - 詳細なインストールガイド（全エージェント対応）
- [ ] `/docs/guides/troubleshooting.md` - よくある問題と解決方法の統合ドキュメント
- [ ] `/docs/guides/architecture.md` - cc-sddの内部アーキテクチャ説明

**注**: 上記のオプションドキュメントはv2.0.0リリースには必須ではありませんが、今後のアップデートで追加することを推奨します。

---

## 注意事項

- 現在Unreleasedの機能（並列タスク、research.md）はv2.0.0に含める
- SubAgentsとWindsurfは"requires @next"とマークされていたが、v2.0.0で利用可能にする
- **v2.0.0以降、すべての機能は`@latest`でインストール可能（`@next`は次期alpha/beta版用）**
- 可能な限り後方互換性を確保
- 破壊的変更を明確に文書化（移行ガイドで詳述）
- v1.xユーザー向けの移行ガイドを提供（`/docs/guides/migration-guide.md`）

---

## タイムライン

**推奨スケジュール:**
- ドキュメント & CHANGELOG: 1-2日
- テスト & 検証: 1日
- リリース実行: 1日
- リリース後監視: 継続的

**合計推定時間:** 3-4日

---

## 成功基準

- ✅ すべてのテストが通過
- ✅ ドキュメントが正確で完全
- ✅ パッケージが`latest`タグでnpmに正常に公開
- ✅ インストールが動作: `npx cc-sdd@latest`
- ✅ すべてのサポート対象エージェントと言語が機能
- ✅ 包括的なリリースノート付きでGitHubリリースを作成
- ✅ 最初の24時間以内に重大な問題が報告されない

---

## 連絡先 & リソース

- **リポジトリ:** https://github.com/gotalab/cc-sdd
- **npmパッケージ:** https://www.npmjs.com/package/cc-sdd
- **Issues:** https://github.com/gotalab/cc-sdd/issues
- **Kiro IDE:** https://kiro.dev
