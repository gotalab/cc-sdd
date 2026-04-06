# cc-sdd: AIコーディングエージェント向け長時間の仕様駆動実装

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
<a href="./README.md">English</a> | 日本語 | <a href="./README_zh-TW.md">繁體中文</a>
</sub></div>

✨ **承認済みの仕様を、長時間でも壊れない自律実装ワークフローに変える。最小で変えやすい SDD ハーネス。**

👻 **Kiro互換** — Kiro IDE の Spec-Driven / AI-DLC スタイル互換。既存の Kiro 仕様書もそのまま使える。

cc-sdd は承認済みの仕様を実行可能なワークフローに変える: 要件 → 設計 → タスク → 自律実装 + 対立的レビュー + 最終検証。仕様は読むものではなく、各フェーズの挙動を直接制御する仕組み。

**cc-sdd を使う理由:**
- ✅ **仕様が実行可能になる** — 各 artifact (要件, 設計, タスク) が次工程を直接制御。File Structure Plan がタスク境界を、Task Brief が実装を、git diff がレビューを駆動
- ✅ **長時間自律実装** — `/kiro-impl` がタスクごとに TDD (Feature Flag Protocol) + fresh subagent + 独立レビュアー + 失敗時の自動デバッグ + タスク間の知見引き継ぎで自律実装。外部依存なし
- ✅ **プロダクト規模に対応** — `/kiro-brainstorm` が大きなアイデアを依存順の複数 spec に分解。`/kiro-spec-batch` が並列で spec 作成 + cross-spec 整合性検証
- ✅ **一度カスタマイズ、モデル進化に追従** — 14 skills、shared rules は single source of truth。チーム向けテンプレートで承認フローに合わせられる。モデルが進化したらハーネスを軽くする設計

**なぜ Agent Skills:**
- Skills は on-demand ロードされる composable な単位 (progressive disclosure)
- 同じ workflow が Claude Code、Codex、Cursor、Copilot、Windsurf、OpenCode、Gemini CLI、Antigravity で動く
- Skills モードが推奨 — レガシーコマンドモードは将来削除予定

> 仕様書を、読むものから実行するものへ。


> インストール手順だけ知りたい場合は [インストール](#-インストール) へジャンプ。v1.1.5 維持なら `npx cc-sdd@1.1.5 --claude-code ...`、v2 移行は [Migration Guide](../../docs/guides/migration-guide.md) / [日本語版](../../docs/guides/ja/migration-guide.md) を参照。

Claude Code、Cursor IDE、Gemini CLI、Codex CLI、GitHub Copilot、Qwen Code、OpenCode、Windsurfを **AI-DLC (AI駆動開発ライフサイクル)**へ。**AIネイティブプロセス**と**最小限の人間承認ゲート**に加えて、長時間の自律実装ループもチームの承認フローに沿う形で組み込めます。

## 🚀 インストール

ワンコマンドで、主要AIコーディングエージェント向けの**AI-DLC（AI Driven Development Life Cycle）× SDD（Spec-Driven Development）**ワークフローを導入。要件・設計・タスク・ステアリングのテンプレートに加え、長時間の実装ループまでチームの承認プロセスに沿う形で組み込めます。

```bash
# 基本インストール（デフォルト: 英語、Claude Code Skills）
npx cc-sdd@latest

# 言語オプション（デフォルト: --lang en）
npx cc-sdd@latest --lang ja    # 日本語
npx cc-sdd@latest --lang zh-TW # 繁体字中国語
npx cc-sdd@latest --lang es    # スペイン語
...（対応言語: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el）

# エージェントオプション（デフォルト: claude-code-skills / --claude-skills）
npx cc-sdd@latest --claude --lang ja        # Claude Code（11コマンド、対応言語は任意）
npx cc-sdd@latest --claude-agent --lang ja  # Claude Code Subagents（12コマンド + 9サブエージェント）
npx cc-sdd@latest --cursor --lang ja        # Cursor IDE
npx cc-sdd@latest --gemini --lang ja        # Gemini CLI
npx cc-sdd@latest --codex --lang ja         # Codex CLI（ブロック済み — --codex-skills を使用）
npx cc-sdd@latest --codex-skills --lang ja  # Codex CLI の Skills モード（推奨、14スキル）
npx cc-sdd@latest --copilot --lang ja       # GitHub Copilot
npx cc-sdd@latest --qwen --lang ja          # Qwen Code
npx cc-sdd@latest --opencode --lang ja      # OpenCode（11コマンド）
npx cc-sdd@latest --opencode-agent --lang ja # OpenCode Subagents（12コマンド + 9サブエージェント）
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
| ギリシャ語 | `el` | 🇬🇷 |

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
1. **承認済み仕様が executable work になる** — 要件・設計・タスク・Supporting References が揃ったまま、実装の駆動源として使えます。
2. **長時間自律実装** — タスクごとの subagent dispatch + independent review + 失敗時の自動デバッグ（Web検索付き）+ タスク間知見引き継ぎ。外部依存なし。
3. **Agent Skills が長期的な surface** — 同じ skill-based workflow を Claude Code、Codex、Cursor、Copilot、Windsurf、OpenCode、Gemini CLI、Antigravity で利用可能。
4. **レビューと最終検証フローを内蔵** — spec mismatch、placeholder 実装、blocked state を完了宣言前に拾う方向で設計されています。
5. **チーム向けカスタマイズは一度だけ** — `.kiro/settings/templates/` を編集すれば全エージェントへ反映。非スキルエージェントは `.kiro/settings/rules/` も使用します。

## ✨ 主要機能

- **📋 Spec-Governed Development** — 構造化仕様（要件 → 調査 → 設計 → タスク）を、単なる計画書ではなく実装を支配する契約として扱います
- **🔁 長時間自律実装** — `/kiro-impl` を実行して放置: TDD (Feature Flag Protocol) + fresh implementer + independent reviewer + 失敗時の auto-debug。タスク間で知見が引き継がれる。外部依存なし
- **✅ レビュー + 最終検証フロー** — task-local review、validation passes、final validation flow を内蔵し、honest completion と NO-GO outcomes を目指します
- **🚀 AI-DLC 手法** — AI実行、人間が各フェーズで検証。[集中「ボルト」](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)が週単位のスプリントを置き換え
- **🧠 永続的プロジェクトメモリ** — ステアリング文書がアーキテクチャ・パターン・ルール・ドメイン知識を全セッション間で維持
- **🧩 Agent Skills 対応** — 各コマンドは自己完結型の [Agent Skill](https://agentskills.io)（SKILL.md + ツール制限 + 同梱ルール）。skills-capable agents に展開しやすい設計です
- **🛠 一度だけカスタマイズ** — `{{KIRO_DIR}}/settings/templates/` を編集すれば全エージェントに反映。8エージェント × 13言語で同じプロセスを共有
- **🌍 チーム対応** — クロスプラットフォーム、品質ゲート付き標準ワークフロー。`--codex` はブロック済み、`--codex-skills` を使用

## 🤖 対応AIエージェント

| エージェント | 状態 | コマンド数 |
|-------|--------|----------|
| **Claude Code** | ✅ 完全対応 | 11 スラッシュコマンド |
| **Claude Code Subagents** | ✅ 完全対応 | 12 コマンド + 9 サブエージェント |
| **Cursor IDE** | ✅ 完全対応 | 11 コマンド |
| **Gemini CLI** | ✅ 完全対応 | 11 コマンド |
| **Codex CLI** | ✅ 完全対応 | `--codex` ブロック済み — `--codex-skills` で14スキル |
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
npx cc-sdd@latest --kiro-dir docs
```

## 📁 プロジェクト構造

インストール後、プロジェクトに以下が追加されます：

```
project/
├── .claude/skills/           # 14のスキル（Claude Code Skills モード、デフォルト）
├── .claude/commands/kiro/    # 11のスラッシュコマンド（Claude Code）
├── .agents/skills/           # 14のスキル（Codex CLI Skills モード）
├── .codex/prompts/           # 11のプロンプトコマンド（Codex CLI — ブロック済み、skillsを使用）
├── .github/prompts/          # 11のプロンプトコマンド（GitHub Copilot）
├── .windsurf/workflows/      # 11のワークフローファイル（Windsurf IDE）
├── .kiro/settings/templates/ # 共通テンプレート（{{KIRO_DIR}} を展開）
├── .kiro/settings/rules/     # 共通ルール（非スキルエージェントのみ）
├── .kiro/specs/             # 機能仕様書
├── .kiro/steering/          # AI指導ドキュメント
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

**安定版リリース v3.0.0** - 本番環境対応。[問題を報告](https://github.com/gotalab/cc-sdd/issues) | MIT License

### プラットフォーム対応
- 対応OS: macOS / Linux / Windows（通常は自動検出）。
- すべてのOSで統一コマンドテンプレートを提供。`--os` 指定は後方互換用の任意オプションです。

> **補足:** `--os` フラグを指定しても動作しますが、現在は全プラットフォーム共通テンプレートが展開されます。
