# cc-sdd: AIコーディングエージェントを本番仕様駆動にするワンコマンドセットアップ

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
<a href="./README.md">English</a> | 日本語 | <a href="./README_zh-TW.md">繁體中文</a>
</sub></div>

✨ **Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Code / Windsurf をプロトタイプから本番仕様駆動へ。要件・設計・タスク・プロジェクトメモリをチームのワークフローに沿うようカスタマイズできます。**

🇰 **Kiro互換** — Kiro IDE に似た Spec-Driven / AI-DLC スタイルで、既存の Kiro 仕様書もそのまま扱えます。

**v2.0.0 主な強化点**
- **Design.md = 詳細設計書** — 要約表 / Req Coverage / Supporting References / 軽量化した Components & Interfaces でレビューの認知負荷を削減。
- **Research.md + validate 系** — 調査メモは Research.md に切り出し、Design.md は要点のみ。validate-gap/design/impl と並列タスク分析で新規機能も既存拡張も安全。
- **カスタマイズは `.kiro/settings/templates & rules` に集約** — 1回の編集で全エージェントの出力が揃う。
- **7エージェント × 12言語** — Claude / Cursor / Codex / Gemini / Copilot / Qwen / Windsurf が同じ11コマンドを共有。


> インストール手順だけ知りたい場合は [インストール](#-インストール) へジャンプ。v1.1.5 維持なら `npx cc-sdd@1.1.5 --claude-code ...`、v2 移行は [Migration Guide](../../docs/guides/migration-guide.md) / [日本語版](../../docs/guides/ja/migration-guide.md) を参照。

Claude Code、Cursor IDE、Gemini CLI、Codex CLI、GitHub Copilot、Qwen Code、Windsurfを **AI-DLC (AI駆動開発ライフサイクル)**へ。**AIネイティブプロセス**と**最小限の人間承認ゲート**：AIが実行を駆動し、人間が各フェーズで重要な決定を検証。

## 🚀 インストール

ワンコマンドで、主要AIコーディングエージェント向けの**AI-DLC（AI Driven Development Life Cycle）× SDD（Spec-Driven Development）**ワークフローを導入。要件・設計・タスク・ステアリングのテンプレートもチームの承認プロセスに沿う形で自動生成されます。

```bash
# 基本インストール（デフォルト: 英語、Claude Code）
npx cc-sdd@latest

# 言語オプション（デフォルト: --lang en）
npx cc-sdd@latest --lang ja    # 日本語
npx cc-sdd@latest --lang zh-TW # 繁体字中国語
npx cc-sdd@latest --lang es    # スペイン語
...（対応言語: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar）

# エージェントオプション（デフォルト: claude-code / --claude）
npx cc-sdd@latest --claude --lang en        # Claude Code（11コマンド、対応言語は任意）
npx cc-sdd@latest --claude-agent --lang ja  # Claude Code Subagents（12コマンド + 9サブエージェント）
npx cc-sdd@latest --cursor --lang zh-TW     # Cursor IDE
npx cc-sdd@latest --gemini --lang es        # Gemini CLI
npx cc-sdd@latest --codex --lang fr         # Codex CLI
npx cc-sdd@latest --copilot --lang pt       # GitHub Copilot
npx cc-sdd@latest --qwen --lang de          # Qwen Code
npx cc-sdd@latest --windsurf --lang ja      # Windsurf IDE

# 注: @nextは今後のアルファ/ベータ版用に予約されています
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

### cc-sdd を選ぶ理由
1. **仕様が単一情報源** — 要件・設計・タスク・Supporting References まで1セットで揃い、承認が早い。
2. **Greenfield / Brownfield 両対応** — 新機能は minutes で起動、既存システムは validate 系コマンドと Project Memory で安全に拡張。
3. **複数エージェントを同時に活用** — Claude / Cursor / Codex / Gemini / Copilot / Qwen / Windsurf が同じテンプレ/ルールを共有。
4. **カスタマイズは一度だけ** — `.kiro/settings/templates/` と `.kiro/settings/rules/` を編集すれば全エージェントへ即反映。

## ✨ 主要機能

- **🚀 AI-DLC手法** - 人間承認付きAIネイティブプロセス。コアパターン：AI実行、人間検証
- **📋 仕様ファースト開発** - 包括的仕様を単一情報源としてライフサイクル全体を駆動
- **⚡ 「ボルト」（スプリントではなく）** - [AI-DLC](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)で週単位のスプリントを置き換える時間・日単位の集中サイクル。70%の管理オーバーヘッドから脱却
- **🧠 永続的プロジェクトメモリ** - AIがステアリング文書を通じて全セッション間で包括的コンテキスト（アーキテクチャ、パターン、ルール、ドメイン知識）を維持
- **🛠 テンプレート柔軟性** - `{{KIRO_DIR}}/settings/templates`（steering / requirements / design / tasks）をチームのドキュメント形式に合わせてカスタマイズ可能
- **🔄 AIネイティブ+人間ゲート** - AI計画 → AI質問 → 人間検証 → AI実装（品質管理付き高速サイクル）
- **🌍 チーム対応** - 品質ゲート付き12言語対応のクロスプラットフォーム標準ワークフロー

## 🤖 対応AIエージェント

| エージェント | 状態 | コマンド数 |
|-------|--------|----------|
| **Claude Code** | ✅ 完全対応 | 11 スラッシュコマンド |
| **Claude Code Subagents** | ✅ 完全対応 | 12 コマンド + 9 サブエージェント |
| **Cursor IDE** | ✅ 完全対応 | 11 コマンド |
| **Gemini CLI** | ✅ 完全対応 | 11 コマンド |
| **Codex CLI** | ✅ 完全対応 | 11 プロンプト |
| **GitHub Copilot** | ✅ 完全対応 | 11 プロンプト |
| **Qwen Code** | ✅ 完全対応 | 11 コマンド |
| **Windsurf IDE** | ✅ 完全対応 | 11 ワークフロー |
| その他（Factory AI Droid） | 📅 予定 | - |
 
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

## 🎨 カスタマイズ

`{{KIRO_DIR}}/settings/templates/` のテンプレートを編集してワークフローに合わせることができます。コア構造（要件番号、チェックボックス、見出し）を保ちつつ、チームのコンテキストを追加—AIは自動的に適応します。

**よくあるカスタマイズ**:
- **PRDスタイルの要件** - ビジネスコンテキストと成功指標を含む
- **フロントエンド/バックエンド設計** - Reactコンポーネントやエンドポイント仕様に最適化
- **承認ゲート** - セキュリティ、アーキテクチャ、コンプライアンスレビュー用
- **JIRA/Linear対応タスク** - 見積もり、優先度、ラベル付き
- **ドメインステアリング** - API標準、テスト規約、コーディングガイドライン

📖 **[カスタマイズガイド](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md)** — 7つの実践例とコピペ可能なスニペット


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
├── .windsurf/workflows/      # 11のワークフローファイル（Windsurf IDE）
├── .kiro/settings/           # 共通ルールとテンプレート（{{KIRO_DIR}} を展開）
├── .kiro/specs/             # 機能仕様書
├── .kiro/steering/          # AI指導ルール
└── CLAUDE.md (Claude Code)    # プロジェクト設定
```

> 補足: 実際に作成されるのはインストールしたエージェントに対応するディレクトリのみです。上記のツリーは全エージェント分を示しています。

## 📚 ドキュメント & サポート

- コマンドリファレンス: [日本語](../../docs/guides/ja/command-reference.md) | [English](../../docs/guides/command-reference.md)
- カスタマイズガイド: [日本語](../../docs/guides/ja/customization-guide.md) | [English](../../docs/guides/customization-guide.md)
- 仕様駆動開発ガイド: [日本語](../../docs/guides/ja/spec-driven.md) | [English](../../docs/guides/spec-driven.md)
- Claude サブエージェントガイド: [日本語](../../docs/guides/ja/claude-subagents.md) | [English](../../docs/guides/claude-subagents.md)
- マイグレーションガイド: [日本語](../../docs/guides/ja/migration-guide.md) | [English](../../docs/guides/migration-guide.md)
- **[問題 & サポート](https://github.com/gotalab/cc-sdd/issues)** - バグ報告と質問
- **[Kiro IDE](https://kiro.dev)**

---

**安定版リリース v2.0.0** - 本番環境対応。[問題を報告](https://github.com/gotalab/cc-sdd/issues) | MIT License

### プラットフォーム対応
- 対応OS: macOS / Linux / Windows（通常は自動検出）。
- すべてのOSで統一コマンドテンプレートを提供。`--os` 指定は後方互換用の任意オプションです。

> **補足:** `--os` フラグを指定しても動作しますが、現在は全プラットフォーム共通テンプレートが展開されます。
