# Spec-Driven Development ワークフロー

> 📖 **English guide:** [Spec-Driven Development Workflow](../spec-driven.md)

このドキュメントは、cc-sddがAI駆動開発ライフサイクル（AI-Driven Development Life Cycle, AI-DLC）において、仕様駆動開発（Spec-Driven Development, SDD）をどのように実践しているかを日本語で解説するものである。どのスラッシュコマンドを実行し、どの成果物をレビューし、開発者による確認（ゲート）をどの段階に設けるべきかを迅速に判断するためのリファレンスとして利用できる。

## ライフサイクル概要

1. **ステアリング (Steering / コンテキスト収集)**: `/kiro:steering` および `/kiro:steering-custom` コマンドを使用し、アーキテクチャ、命名規則、ドメイン知識などを `.kiro/steering/*.md` ファイル群に収集する。これらはプロジェクトメモリ（Project Memory）として、後続の全コマンドから参照される。
2. **仕様策定の開始 (Spec Initiation)**: `/kiro:spec-init <feature>` コマンドが `.kiro/specs/<feature>/` ディレクトリを生成し、機能単位のワークスペースを確保する。
3. **要件定義 (Requirements)**: `/kiro:spec-requirements <feature>` コマンドが、AIとの対話を通じて `requirements.md` を作成する。ここにはEARS形式の要件や未解決の課題が記録される。
4. **設計 (Design)**: `/kiro:spec-design <feature>` コマンドが、まず調査ログとして `research.md` を生成・更新する（調査が不要な場合はスキップされる）。その内容に基づき、詳細設計書 `design.md` が出力される。この設計書は、要件カバレッジ、コンポーネントとインターフェース定義、参考文献などを備えた、レビューに適したドキュメントである。
5. **タスク計画 (Task Planning)**: `/kiro:spec-tasks <feature>` コマンドで、実装タスクを `tasks.md` ファイルにTODO形式で分解する。各タスクは要件IDと紐付けられ、ドメインやレイヤーごとのブロックに標準化される。同時に、`P0`（逐次実行）や `P1`（並列実行可）といった実行順序ラベルが付与され、並行開発の境界が示される。
6. **実装 (Implementation)**: `/kiro:spec-impl <feature> <task-ids>` コマンドが、指定されたタスク単位での実装とテストのプロセスを支援する。
7. **品質ゲート (Quality Gates)**: `/kiro:validate-gap`、`/kiro:validate-design`、`/kiro:validate-impl` といった検証コマンドが、既存コードとの整合性や、設計・実装の品質をチェックする。これにより、既存プロジェクト（Brownfield）においても安全に開発を進めるためのガードレールが提供される。
8. **進捗追跡 (Status Tracking)**: `/kiro:spec-status <feature>` コマンドが、各開発フェーズの承認状況と未完了のタスクを要約して表示する。

> すべてのフェーズは、開発者によるレビューのために一旦停止する。`-y` オプションや `--auto` フラグでこの確認をスキップすることも可能だが、本番環境向けの作業では手動での承認プロセスを維持することが推奨される。テンプレートにチェックリストを埋め込んでおくことで、一貫した品質ゲートを毎回強制することができる。

## コマンドと成果物の対応

| コマンド | 役割 | 主な成果物 |
| --- | --- | --- |
| `/kiro:steering` | プロジェクトメモリ生成 | `.kiro/steering/*.md` |
| `/kiro:steering-custom` | ドメイン固有のステアリング情報追加 | `.kiro/steering/custom/*.md` |
| `/kiro:spec-init <feature>` | 新規仕様策定の開始 | `.kiro/specs/<feature>/` |
| `/kiro:spec-requirements <feature>` | 要件定義 | `requirements.md` |
| `/kiro:spec-design <feature>` | 調査と詳細設計 | `research.md` (必要な場合), `design.md` |
| `/kiro:spec-tasks <feature>` | 実装タスクの分解（実行順序ラベル付き） | `tasks.md` |
| `/kiro:spec-impl <feature> <task-ids>` | 実装の実行 | コード変更とタスク進捗の更新 |
| `/kiro:validate-gap <feature>` | ギャップ分析 | `gap-report.md` |
| `/kiro:validate-design <feature>` | 設計レビュー | `design-validation.md` |
| `/kiro:validate-impl [feature] [task-ids]` | 実装レビュー | `impl-validation.md` |
| `/kiro:spec-status <feature>` | 進捗可視化 | CLI サマリー |

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

このガイドはv2.0.0時点の内容に基づいている。テンプレートやコマンドの動作に変更があった場合は、公式の英語版ドキュメント `docs/guides/spec-driven.md` を正とし、それに追従する形で本ドキュメントも更新する必要がある。
