# cc-sdd: AIコーディングエージェントを本番仕様駆動にするワンコマンドセットアップ

すべての仕様・ステアリングテンプレートを柔軟に編集可能—要件定義書・設計書・実装計画書の出力をチーム向けに調整できます。

✨ **Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Codeをプロトタイプからプロダクション開発プロセスへ**

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.2rem;"><sub>
<a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README.md">English</a> | 日本語 | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

Claude Code、Cursor IDE、Gemini CLI、Codex CLI、GitHub Copilot、Qwen Codeを **AI-DLC (AI駆動開発ライフサイクル)**へ。**AIネイティブプロセス**と**最小限の人間承認ゲート**：AIが実行を駆動し、人間が各フェーズで重要な決定を検証。

🎯 **最適な用途**: 従来開発の70%オーバーヘッド（会議・文書・儀式）から脱却し、AIネイティブ実行と人間品質ゲートで **週単位から時間単位の納期** を実現。

> **Kiro互換** — プロフェッショナル環境で実証済みの同じワークフロー。

## 🚀 インストール

```bash
# 基本インストール（デフォルト: 英語、Claude Code）
npx cc-sdd@latest

# アルファ版（大幅アップデート版 v2.0.0-alpha.1）
npx cc-sdd@next

# 言語オプション（デフォルト: --lang en）
npx cc-sdd@latest --lang ja    # 日本語
npx cc-sdd@latest --lang zh-TW # 繁体字中国語

# エージェントオプション（デフォルト: claude-code / --claude）
npx cc-sdd@latest --claude --lang ja    # または @next で最新アルファ版
npx cc-sdd@latest --gemini --lang ja    # または @next で最新アルファ版
npx cc-sdd@latest --cursor --lang ja    # または @next で最新アルファ版
npx cc-sdd@next --codex --lang ja       # アルファ版必須
npx cc-sdd@next --copilot --lang ja     # アルファ版必須
npx cc-sdd@latest --qwen --lang ja      # または @next で最新アルファ版
```

## 🌐 対応言語

| 言語 | コード |  |
|------|--------|------|
| 英語 | `en` | 🇬🇧 |
| 日本語 | `ja` | 🇯🇵 |
| 繁体字中国語 | `zh-TW` | 🇹🇼 |
| 簡体字中国語 | `zh` | 🇨🇳 |
| スペイン語 | `es` | 🇪🇸 |
| ポルトガル語 | `pt` | 🇵🇹 |
| ドイツ語 | `de` | 🇩🇪 |
| フランス語 | `fr` | 🇫🇷 |
| ロシア語 | `ru` | 🇷🇺 |
| イタリア語 | `it` | 🇮🇹 |
| 韓国語 | `ko` | 🇰🇷 |
| アラビア語 | `ar` | 🇸🇦 |

**使用方法**: `npx cc-sdd@latest --lang <コード>` (例: 日本語の場合は `--lang ja`)

## ✨ クイックスタート

### 新規プロジェクトの場合
```bash
# AIエージェントを起動して、即座に仕様駆動開発を開始
/kiro:spec-init ユーザー認証システムをOAuthで構築  # AIが構造化計画を作成
/kiro:spec-requirements auth-system                  # AIが明確化のための質問
/kiro:spec-design auth-system                       # 人間が検証、AIが設計
/kiro:spec-tasks auth-system                        # 実装タスクに分解
/kiro:spec-impl auth-system                         # TDDで実行
```

![design.md - System Flow Diagram](https://raw.githubusercontent.com/gotalab/cc-sdd/refs/heads/main/assets/design-system_flow.png)
*Example of system flow during the design phase `design.md`*

### 既存プロジェクトの場合（推奨）
```bash
# まずプロジェクトコンテキストを確立、その後開発を進める
/kiro:steering                                      # AIが既存プロジェクトコンテキストを学習

/kiro:spec-init 既存認証にOAuthを追加               # AIが拡張計画を作成
/kiro:spec-requirements oauth-enhancement           # AIが明確化のための質問
/kiro:validate-gap oauth-enhancement                # オプション: 既存機能と要件を分析
/kiro:spec-design oauth-enhancement                 # 人間が検証、AIが設計
/kiro:validate-design oauth-enhancement             # オプション: 設計の統合を検証
/kiro:spec-tasks oauth-enhancement                  # 実装タスクに分解
/kiro:spec-impl oauth-enhancement                   # TDDで実行
```

**30秒セットアップ** → **AI駆動「ボルト」（スプリントではなく）** → **時間単位の結果**

## ✨ 主要機能

- **🚀 AI-DLC手法** - 人間承認付きAIネイティブプロセス。コアパターン：AI実行、人間検証
- **📋 仕様ファースト開発** - 包括的仕様を単一情報源としてライフサイクル全体を駆動
- **⚡ 「ボルト」（スプリントではなく）** - [AI-DLC](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)で週単位のスプリントを置き換える時間・日単位の集中サイクル。70%の管理オーバーヘッドから脱却
- **🧠 永続的プロジェクトメモリ** - AIがステアリング文書を通じて全セッション間で包括的コンテキスト（アーキテクチャ、パターン、ルール、ドメイン知識）を維持
- **🛠 テンプレート柔軟性** - `{{KIRO_DIR}}/settings/templates`（steering / requirements / design / tasks）をチームのドキュメント形式に合わせてカスタマイズ可能
- **🔄 AIネイティブ+人間ゲート** - AI計画 → AI質問 → 人間検証 → AI実装（品質管理付き高速サイクル）
- **🌍 チーム対応** - 品質ゲート付き多言語・クロスプラットフォーム・標準化ワークフロー

## 🤖 対応AIエージェント

| エージェント | 状態 | コマンド | 設定 |
|-------|--------|----------|--------|
| **Claude Code** | ✅ 完全対応 | 11スラッシュコマンド | `CLAUDE.md` |
| **Gemini CLI** | ✅ 完全対応 | 11コマンド | `GEMINI.md` |
| **Cursor IDE** | ✅ 完全対応 | 11コマンド | `AGENTS.md` |
| **Codex CLI** | ✅ 完全対応 | 11プロンプト | `AGENTS.md` |
| **GitHub Copilot** | ✅ 完全対応 | 11プロンプト | `AGENTS.md` |
| **Qwen Code** | ✅ 完全対応 | 11コマンド | `QWEN.md` |
| その他 | 📅 予定 | - | - |
 
## 📋 コマンド

### 仕様駆動開発ワークフロー（Specs）
```bash
/kiro:spec-init <description>             # 機能仕様を初期化
/kiro:spec-requirements <feature_name>    # 要件を生成
/kiro:spec-design <feature_name>          # 技術設計を作成  
/kiro:spec-tasks <feature_name>           # 実装タスクに分解
/kiro:spec-impl <feature_name> <tasks>    # TDDで実行
/kiro:spec-status <feature_name>          # 進捗を確認
```

> **仕様を基盤として**: [Kiroの仕様駆動手法](https://kiro.dev/docs/specs/)に基づく - 仕様がアドホック開発を体系的ワークフローに変換し、明確なAI-人間協働ポイントでアイデアから実装への橋渡しをします。

> **Kiro IDE統合**: 作成された仕様は[Kiro IDE](https://kiro.dev)での利用/実装も可能 - 強化された実装ガードレールとチーム協働機能を利用可能。

### 既存コードに対する品質向上（オプション - ブラウンフィールド開発）
```bash
# spec-design前（既存機能と要件の分析）：
/kiro:validate-gap <feature_name>         # 既存機能と要件のギャップを分析

# spec-design後（既存システムとの設計検証）：
/kiro:validate-design <feature_name>      # 既存アーキテクチャとの設計互換性をレビュー
```

> **ブラウンフィールド開発向けオプション**: `validate-gap`は既存と必要な機能を分析し、`validate-design`は統合互換性を確認。両方とも既存システム向けのオプション品質ゲートです。

### プロジェクトメモリとコンテキスト（必須）
```bash
/kiro:steering                            # プロジェクトメモリとコンテキストを作成/更新
/kiro:steering-custom                     # 専門ドメイン知識を追加
```

> **重要な基盤コマンド**: ステアリングは永続的プロジェクトメモリを作成 - AIが全セッションで使用するコンテキスト、ルール、アーキテクチャ。**既存プロジェクトでは最初に実行**して仕様品質を劇的に向上。

## ⚙️ 設定

```bash
# 言語とプラットフォーム
npx cc-sdd@latest --lang ja            # macOS / Linux / Windows（自動検出）
npx cc-sdd@latest --lang ja --os mac   # 旧来のフラグとして任意指定

# 安全な操作  
npx cc-sdd@latest --dry-run --backup

# カスタムディレクトリ
npx cc-sdd@latest --kiro-dir docs/specs
```

## 📁 プロジェクト構造

インストール後、プロジェクトに以下が追加されます：

```
project/
├── .claude/commands/kiro/    # 11のスラッシュコマンド
├── .codex/prompts/           # 11のプロンプトコマンド（Codex CLI）
├── .github/prompts/          # 11のプロンプトコマンド（GitHub Copilot）
├── .kiro/settings/           # 共通ルールとテンプレート（{{KIRO_DIR}} を展開）
├── .kiro/specs/             # 機能仕様書
├── .kiro/steering/          # AI指導ルール
└── CLAUDE.md (Claude Code)    # プロジェクト設定
```

## 📚 ドキュメント & サポート

- **[完全ドキュメント](https://github.com/gotalab/cc-sdd/tree/main/docs/README)** - 完全セットアップガイド
- **[コマンドリファレンス](https://github.com/gotalab/cc-sdd/docs)** - すべてのオプションと例  
- **[問題 & サポート](https://github.com/gotalab/cc-sdd/issues)** - バグ報告と質問
- **[Kiro IDE](https://kiro.dev)**

---

**ベータリリース** - 使用可能、改善中。[問題を報告](https://github.com/gotalab/cc-sdd/issues) | MIT License

### プラットフォーム対応
- 対応OS: macOS / Linux / Windows（通常は自動検出）。
- すべてのOSで統一コマンドテンプレートを提供。`--os` 指定は後方互換用の任意オプションです。

> **補足:** `--os` フラグを指定しても動作しますが、現在は全プラットフォーム共通テンプレートが展開されます。
