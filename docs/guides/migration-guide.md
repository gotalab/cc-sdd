# cc-sdd v1.x → v2.0.0 移行ガイド

このガイドでは、cc-sdd v1.xからv2.0.0への移行方法について説明します。

## 目次

1. [概要](#概要)
2. [主な変更点](#主な変更点)
3. [破壊的変更](#破壊的変更)
4. [移行手順](#移行手順)
5. [新機能の利用方法](#新機能の利用方法)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

cc-sdd v2.0.0は、v1.xから大幅に機能強化されたメジャーリリースです。以下の主要な改善が含まれます:

- **11コマンド体制**: 8コマンドから11コマンドへ拡張（3つの検証コマンド追加）
- **マルチプラットフォーム**: 7つのAIエージェントをサポート（Windsurf、SubAgentsモード追加）
- **12言語サポート**: 国際化対応の大幅強化
- **並列タスク分析**: タスクの並列実行可能性を自動検出
- **プロジェクトメモリ**: Steering機能の強化

**重要**: v2.0.0以降、すべての機能は`npx cc-sdd@latest`でインストール可能です。`@next`は次期alpha/beta版用になります。

---

## 主な変更点

### 新機能

#### 1. 検証コマンド（Brownfield開発向け）
既存プロジェクトへの機能追加時に使用できる3つの検証コマンドが追加されました:

```bash
/kiro:validate-gap <feature_name>       # 要件と既存実装のギャップ分析
/kiro:validate-design <feature_name>    # 設計と既存アーキテクチャの互換性検証
/kiro:validate-impl <feature_name>      # 実装の品質検証
```

#### 2. Claude Code SubAgentsモード
コンテキスト最適化のため、専用SubAgentにコマンドを委譲:

```bash
# インストール
npx cc-sdd@latest --claude-agent

# 12のコマンド + 9つのSubAgent定義がインストールされます
# - .claude/commands/kiro/ (12コマンド)
# - .claude/agents/kiro/ (9 SubAgents)
```

#### 3. Windsurf IDEサポート
Windsurf IDE用の完全なワークフロー統合:

```bash
npx cc-sdd@latest --windsurf
# .windsurf/workflows/ にワークフローファイルがインストールされます
```

#### 4. 並列タスク分析
タスク生成時に並列実行可能なタスクを自動的に`(P)`マークで識別:

```bash
/kiro:spec-tasks <feature_name>  # デフォルトで並列分析が有効
/kiro:spec-tasks <feature_name> --sequential  # 並列分析を無効化
```

#### 5. Research.mdテンプレート
発見事項とアーキテクチャ調査を`design.md`から分離:

- `.kiro/specs/<feature>/research.md` - 調査ログ、アーキテクチャパターン評価
- `.kiro/specs/<feature>/design.md` - 技術設計ドキュメント

#### 6. インタラクティブCLIインストーラー
プロジェクトメモリ（Steering）の取り扱いを対話的に選択可能:

```bash
npx cc-sdd@latest
# → 上書き / 追記 / 保持 を選択できます
```

---

## 破壊的変更

### 1. テンプレート構造の統一

**v1.x:**
```
.kiro/
├── templates/
│   ├── os-mac/
│   └── os-windows/
```

**v2.0.0:**
```
.kiro/
└── settings/
    ├── templates/     # 統一テンプレート（OS別不要）
    └── rules/         # プロジェクト全体のルール
```

**対応方法:**
- 既存のカスタムテンプレートがある場合、`.kiro/settings/templates/`に移行してください
- OS固有の分岐は不要になりました（コマンド側で自動調整）

### 2. Steering機能の変更

**v1.x:** 単一のステアリングファイル

**v2.0.0:** ディレクトリ全体をプロジェクトメモリとして読み込み

```bash
# v2.0.0では以下のディレクトリ全体が読み込まれます
.kiro/steering/
├── project-context.md
├── architecture.md
└── domain-knowledge.md
```

**対応方法:**
- 既存のステアリングファイルを`.kiro/steering/`ディレクトリに移動
- 複数のファイルに分割することで、より構造化されたプロジェクトメモリを構築可能

### 3. テンプレートファイル拡張子

**v1.x:** 拡張子なし（例: `spec-requirements`）

**v2.0.0:** 実際の拡張子を使用（例: `spec-requirements.md`、`config.toml`）

**対応方法:**
- 新規インストールでは自動的に正しい拡張子が使用されます
- カスタムテンプレートは適切な拡張子を付与してください

### 4. コマンド数の拡張

**v1.x:** 8コマンド
```bash
spec-init, spec-requirements, spec-design, spec-tasks,
spec-impl, spec-status, steering, steering-custom
```

**v2.0.0:** 11コマンド（3つの検証コマンド追加）
```bash
# 既存8コマンド + 以下3つ
validate-gap, validate-design, validate-impl
```

---

## 移行手順

### 既存プロジェクトのアップグレード

#### ステップ1: バックアップ

```bash
# 既存の設定をバックアップ
cp -r .kiro .kiro.backup
cp -r .claude .claude.backup  # または .cursor, .gemini など
```

#### ステップ2: v2.0.0のインストール

```bash
# 基本インストール（Claude Code）
npx cc-sdd@latest

# またはエージェントを指定
npx cc-sdd@latest --claude-agent  # SubAgentsモード
npx cc-sdd@latest --cursor
npx cc-sdd@latest --windsurf
npx cc-sdd@latest --gemini
npx cc-sdd@latest --codex
npx cc-sdd@latest --copilot
npx cc-sdd@latest --qwen
```

#### ステップ3: カスタムテンプレートの移行

v1.xでテンプレートをカスタマイズしていた場合:

```bash
# 1. バックアップからカスタム内容を確認
cat .kiro.backup/templates/os-mac/spec-requirements.md

# 2. 新しいテンプレート構造にマージ
# .kiro/settings/templates/spec-requirements.md を編集
```

#### ステップ4: Steeringファイルの整理

```bash
# v1.xの単一ステアリングファイルがある場合
mkdir -p .kiro/steering
mv .kiro/steering-old.md .kiro/steering/project-context.md

# 必要に応じて複数ファイルに分割
# 例:
# - .kiro/steering/architecture.md
# - .kiro/steering/coding-standards.md
# - .kiro/steering/domain-knowledge.md
```

#### ステップ5: 動作確認

```bash
# 新しいコマンドが利用可能か確認
/kiro:spec-status

# 新しい検証コマンドを試す
/kiro:validate-gap <existing-feature>
```

---

## 新機能の利用方法

### 1. 検証コマンドの活用（Brownfield開発）

既存プロジェクトに新機能を追加する場合:

```bash
# ステップ1: プロジェクトコンテキストを構築
/kiro:steering

# ステップ2: 新機能の仕様を作成
/kiro:spec-init OAuth機能の追加
/kiro:spec-requirements oauth-feature

# ステップ3: 既存実装とのギャップを分析
/kiro:validate-gap oauth-feature

# ステップ4: 設計を作成
/kiro:spec-design oauth-feature

# ステップ5: 既存アーキテクチャとの互換性を検証
/kiro:validate-design oauth-feature

# ステップ6: タスク化と実装
/kiro:spec-tasks oauth-feature
/kiro:spec-impl oauth-feature 1.1,1.2
```

### 2. SubAgentsモードの活用

大規模プロジェクトでコンテキストを最適化:

```bash
# インストール
npx cc-sdd@latest --claude-agent

# spec-quickコマンドで全フェーズを一気に実行
/kiro:spec-quick ユーザー認証機能

# 各フェーズでSubAgentが自動起動し、詳細分析を実施
# メイン会話のコンテキストは保護されます
```

### 3. 並列タスクの活用

```bash
# タスク生成時に並列実行可能なタスクが自動識別されます
/kiro:spec-tasks auth-feature

# tasks.mdに以下のようなマークが付きます:
# - [ ] 1.1 (P) データベーススキーマ設計
# - [ ] 1.2 (P) APIエンドポイント設計
# - [ ] 1.3 統合テスト作成（1.1, 1.2に依存）

# (P)マークのタスクは並列実行可能
```

### 4. Research.mdの活用

設計フェーズでの調査と設計を分離:

```bash
/kiro:spec-design auth-feature

# 以下の2ファイルが生成されます:
# - .kiro/specs/auth-feature/research.md  # 調査ログ、パターン評価
# - .kiro/specs/auth-feature/design.md   # 最終的な技術設計
```

---

## トラブルシューティング

### Q1: v2.0.0インストール後、既存のカスタムテンプレートが反映されない

**原因:** テンプレートパスが変更されました

**解決方法:**
```bash
# v1.xのカスタムテンプレートを新しいパスにコピー
cp .kiro.backup/templates/os-mac/*.md .kiro/settings/templates/
```

### Q2: Steeringが読み込まれない

**原因:** v2.0.0ではディレクトリ全体を読み込みます

**解決方法:**
```bash
# Steeringファイルを.kiro/steering/ディレクトリに配置
mkdir -p .kiro/steering
mv <your-steering-file>.md .kiro/steering/
```

### Q3: 新しい検証コマンドが見つからない

**原因:** インストールが完了していない可能性

**解決方法:**
```bash
# 再インストール（既存ファイルは上書き確認あり）
npx cc-sdd@latest --overwrite prompt

# コマンド一覧を確認
ls .claude/commands/kiro/  # Claude Codeの場合
```

### Q4: `@next`でインストールしたSubAgentsが動作しない

**原因:** v2.0.0では`@latest`で全機能が利用可能です

**解決方法:**
```bash
# @latestで再インストール
npx cc-sdd@latest --claude-agent
```

### Q5: 多言語対応のドキュメントが生成されない

**原因:** 言語オプションが指定されていない

**解決方法:**
```bash
# 言語を明示的に指定
npx cc-sdd@latest --lang ja  # 日本語
npx cc-sdd@latest --lang zh-TW  # 繁体中国語
# 対応言語: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar
```

### Q6: テンプレートの`{{KIRO_DIR}}`変数が展開されない

**原因:** 古いバージョンのテンプレートを使用している可能性

**解決方法:**
```bash
# 最新のテンプレートを再インストール
npx cc-sdd@latest --overwrite force --backup
```

---

## サポート

問題が解決しない場合:

- **GitHub Issues**: [https://github.com/gotalab/cc-sdd/issues](https://github.com/gotalab/cc-sdd/issues)
- **ドキュメント**: [https://github.com/gotalab/cc-sdd](https://github.com/gotalab/cc-sdd)
- **コマンドリファレンス**: [command-reference.md](./command-reference.md)
- **カスタマイズガイド**: [customization-guide.md](./customization-guide.md)

---

## 関連リソース

- [CHANGELOG.md](../../CHANGELOG.md) - 詳細な変更履歴
- [リリースノート（日本語）](../RELEASE_NOTES/RELEASE_NOTES_ja.md)
- [リリースノート（英語）](../RELEASE_NOTES/RELEASE_NOTES_en.md)
- [コマンドリファレンス](./command-reference.md)
- [カスタマイズガイド](./customization-guide.md)
- [Claude SubAgentsガイド](./claude-subagents.md)
- [Spec-Driven開発ワークフロー](./spec-driven.md)
