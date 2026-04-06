# Spec-Driven Development (SDD) WIP

> 📖 **English guide:** [Spec-Driven Development Workflow](../spec-driven.md)

このドキュメントは、cc-sddがAI駆動開発ライフサイクル（AI-Driven Development Life Cycle, AI-DLC）において、仕様駆動開発（Spec-Driven Development, SDD）をどのように実践しているかを日本語で解説するものである。どのスラッシュコマンド（またはSkill）を実行し、どの成果物をレビューし、開発者による確認（ゲート）をどの段階に設けるべきかを迅速に判断するためのリファレンスとして利用できる。

## ライフサイクル概要

1. **ステアリング (Steering / コンテキスト収集)**: `/kiro:steering` および `/kiro:steering-custom` コマンドを使用し、アーキテクチャ、命名規則、ドメイン知識などを `.kiro/steering/*.md` ファイル群に収集する。これらはプロジェクトメモリ（Project Memory）として、後続の全コマンドから参照される。
2. **ブレインストーム (Brainstorm / 任意)**: 曖昧なアイデアを整理してから仕様策定に進みたい場合に利用する（Skills モードでは `/kiro-brainstorm` を使用）。
3. **仕様策定の開始 (Spec Initiation)**: `/kiro:spec-init <feature>` コマンドが `.kiro/specs/<feature>/` ディレクトリを生成し、機能単位のワークスペースを確保する。
4. **要件定義 (Requirements)**: `/kiro:spec-requirements <feature>` コマンドが、AIとの対話を通じて `requirements.md` を作成する。ここにはEARS形式の要件や未解決の課題が記録される。
5. **設計 (Design)**: `/kiro:spec-design <feature>` コマンドが、まず調査ログとして `research.md` を生成・更新する（調査が不要な場合はスキップされる）。その内容に基づき、詳細設計書 `design.md` が出力される。この設計書は、要件カバレッジ、コンポーネントとインターフェース定義、参考文献などを備えた、レビューに適したドキュメントである。v3.0.0では、`design.md` に **File Structure Plan**（ディレクトリ構造とファイル責務の定義）が含まれるようになった。行数上限は1500行に拡大されている。
6. **タスク計画 (Task Planning)**: `/kiro:spec-tasks <feature>` コマンドで、実装タスクを `tasks.md` ファイルにTODO形式で分解する。各タスクは要件IDと紐付けられ、ドメインやレイヤーごとのブロックに標準化される。同時に、`P0`（逐次実行）や `P1`（並列実行可）といった実行順序ラベルが付与され、並行開発の境界が示される。
7. **実装 (Implementation)**: `/kiro:spec-impl <feature> <task-ids>` コマンド（コマンドモード）、または `/kiro-impl`（Skills モード）が、指定されたタスク単位での実装とテストのプロセスを支援する。Skills モードでは、自律モード（タスク引数なし）とマニュアルモード（タスク引数あり）の2つの動作形態がある（詳細は後述の「Skills ワークフロー」セクションを参照）。
8. **品質ゲート (Quality Gates)**: `/kiro:validate-gap`、`/kiro:validate-design`、`/kiro:validate-impl` といった検証コマンドが、既存コードとの整合性や、設計・実装の品質をチェックする。v3.0.0では、`/kiro:validate-impl`（および Skills モードの `/kiro-validate-impl`）は**インテグレーション検証**（タスク横断の整合性チェック）に焦点が移り、個別タスクの検証はレビューア Subagent が担当する。
9. **進捗追跡 (Status Tracking)**: `/kiro:spec-status <feature>` コマンドが、各開発フェーズの承認状況と未完了のタスクを要約して表示する。

> すべてのフェーズは、開発者によるレビューのために一旦停止する。`-y` オプションや `--auto` フラグでこの確認をスキップすることも可能だが、本番環境向けの作業では手動での承認プロセスを維持することが推奨される。テンプレートにチェックリストを埋め込んでおくことで、一貫した品質ゲートを毎回強制することができる。

## コマンドと成果物の対応

| コマンド | 役割 | 主な成果物 |
| --- | --- | --- |
| `/kiro:steering` | プロジェクトメモリ生成 | `.kiro/steering/*.md` |
| `/kiro:steering-custom` | ドメイン固有のステアリング情報追加 | `.kiro/steering/custom/*.md` |
| `/kiro-brainstorm` (Skills) | アイデアの整理（任意） | 整理された機能提案 |
| `/kiro:spec-init <feature>` | 新規仕様策定の開始 | `.kiro/specs/<feature>/` |
| `/kiro:spec-requirements <feature>` | 要件定義 | `requirements.md` |
| `/kiro:spec-design <feature>` | 調査と詳細設計 | `research.md` (必要な場合), `design.md` (File Structure Plan 含む) |
| `/kiro:spec-tasks <feature>` | 実装タスクの分解（実行順序ラベル付き） | `tasks.md` |
| `/kiro:spec-impl <feature> <task-ids>` | 実装の実行（コマンドモード） | コード変更とタスク進捗の更新 |
| `/kiro-impl` (Skills) | 実装の実行（自律/マニュアル） | コード変更とタスク進捗の更新 |
| `/kiro:validate-gap <feature>` | ギャップ分析 | `gap-report.md` |
| `/kiro:validate-design <feature>` | 設計レビュー | `design-validation.md` |
| `/kiro:validate-impl [feature] [task-ids]` | インテグレーション検証 | `impl-validation.md` |
| `/kiro:spec-status <feature>` | 進捗可視化 | CLI サマリー |

## Skills ワークフロー（v3.0.0）

`--claude-skills` または `--codex-skills` でインストールした場合、コマンド（`/kiro:*`）の代わりに **Skills**（`/kiro-*`）を使用する。Skills モードでは、外部プラグインに依存せず、ネイティブの Agent ツールのみで動作する。

### コマンドモードと Skills モードの対応

| コマンドモード | Skills モード | 備考 |
| --- | --- | --- |
| （なし） | `/kiro-brainstorm` | 任意。曖昧なアイデアを spec-init 前に整理する |
| `/kiro:spec-impl <feature> <task-ids>` | `/kiro-impl` | 自律モード/マニュアルモードの切り替えが可能 |
| `/kiro:validate-impl` | `/kiro-validate-impl` | インテグレーション検証（タスク横断）に特化 |

> その他の Steering、spec-init、spec-requirements、spec-design、spec-tasks の各コマンドは、コマンドモードと Skills モードで共通である。

### `/kiro-impl` の2つのモード

- **自律モード（タスク引数なし）**: タスクごとに Subagent をディスパッチし、独立した実装とレビューを行う。各タスクについて、実装者 Subagent がタスクブリーフ（Task Brief: 仕様から導出された具体的な受け入れ基準）を作成してからコーディングに入る。レビューア Subagent は、TODO 残存チェック、テスト実行、git diff による境界確認などの機械的な検証を行う。実装者が BLOCKED を返した場合やレビューアが2回連続で REJECTED した場合、**デバッグ Subagent** が新しいコンテキストで起動し、Web検索を使って根本原因を調査する（最大2ラウンド）。タスク間で得られた知見は **Implementation Notes** として次の実装者に引き継がれる。1タスク1イテレーションの規律により、長時間実行時のコンテキスト衛生を維持する。
- **マニュアルモード（タスク引数あり）**: メインコンテキスト内で TDD ベースの実装を行う。コマンドモードの `/kiro:spec-impl` と同等の動作である。

### セッション再開

`/kiro-impl` は中断後の再実行に対応している。`tasks.md` の進捗状態に基づいて未完了タスクから処理を再開する。

## ワークフローをカスタマイズするには

- **テンプレート**: `.kiro/settings/templates/{requirements,design,tasks}.md` を修正することで、各開発フェーズの生成物のアウトラインやチェックリストを、自社のプロセスに合わせて調整できる。v2.0.0の設計テンプレートは、要約テーブル、コンポーネント密度に関するルール、参考文献といった要素を備えており、レビュー担当者の認知負荷を軽減するよう設計されている。
- **ルール**: `.kiro/settings/rules/*.md` ファイルに、「すべきこと（DO）」「すべきでないこと（DO NOT）」や評価基準などを記述すると、それらはすべてのエージェントおよびコマンドで共通のガイドラインとして読み込まれる。旧バージョンのように、コマンドのプロンプトへ直接指示を記述する必要はない。
- **承認フロー**: テンプレートのヘッダー部分に、レビュー担当者（Reviewer）や承認者（Approver）の欄、チェックリスト、トレーサビリティを確保するためのカラムなどを追加することで、各品質ゲートでの確認事項を単一のドキュメントに集約できる。

## 新規案件 vs 既存案件

- **新規プロジェクト (Greenfield)**: 共有すべきルールや原則が既に存在する場合は、`/kiro:steering`（や`/kiro:steering-custom`）を実行してプロジェクトメモリに保存する。まだルールが整備されていない場合は、まず `/kiro:spec-init` で開発を開始し、プロセスを進めながら徐々にステアリング情報を充実させていくのがよい。
- **既存プロジェクト (Brownfield)**: `/kiro:validate-gap`、`/kiro:spec-requirements`、`/kiro:spec-design` の順でプロセスを進めることで、既存コードとの整合性を早期に確認できる。設計テンプレート内の要件カバレッジ（Req Coverage）や参考文献（Supporting References）セクションが、既存の仕様書との関連性を担保する役割を果たす。

## 関連リソース

- [Docs README](../README.md)
- [コマンドリファレンス](command-reference.md)
- [Claude Code Subagents ワークフロー](claude-subagents.md)

このガイドはv3.0.0時点の内容に基づいている。テンプレートやコマンドの動作に変更があった場合は、公式の英語版ドキュメント `docs/guides/spec-driven.md` を正とし、それに追従する形で本ドキュメントも更新する必要がある。
