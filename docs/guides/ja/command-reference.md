# コマンドリファレンス

> 📖 **English guide:** [Command Reference](../command-reference.md)

cc-sdd が提供する11個のAI-DLCコマンドについて、その役割、入力、出力を一覧にしたリファレンスである。各フェーズで確認すべき成果物と次のアクションをすぐに把握できるよう、英語版の `docs/guides/command-reference.md` を基に日本語で要約している。

> **補足**: コマンドのテンプレートは Claude Code を基準にしているが、Cursor、Gemini CLI、Codex CLI、GitHub Copilot、Qwen Code、Windsurf など、他のエージェントでも同じ11個のコマンドが利用可能である（UIの詳細は各エージェントのドキュメントを参照すること）。
>
> インストールやワークスペースの前提条件については[プロジェクトのREADME](../../README.md)を、各ドキュメントの概要については[Docs README](../README.md)を参照すること。

## 目次

### Steering（プロジェクトメモリ）
- [`/kiro:steering`](#kirosteering)
- [`/kiro:steering-custom`](#kirosteering-custom)

### Spec Workflow
- [`/kiro:spec-init`](#kirospec-init)
- [`/kiro:spec-requirements`](#kirospec-requirements)
- [`/kiro:spec-design`](#kirospec-design)
- [`/kiro:spec-tasks`](#kirospec-tasks)
- [`/kiro:spec-impl`](#kirospec-impl)

### Validation
- [`/kiro:validate-gap`](#kirovalidate-gap)
- [`/kiro:validate-design`](#kirovalidate-design)
- [`/kiro:validate-impl`](#kirovalidate-impl)

### Status
- [`/kiro:spec-status`](#kirospec-status)

---

## コマンドマトリクス

| コマンド | 主な引数 | 目的 | 次に実行するコマンド |
| --- | --- | --- | --- |
| `/kiro:steering` | – | プロジェクトメモリの作成/更新 | `/kiro:spec-init` |
| `/kiro:steering-custom` | 対話形式 | ドメイン固有のステアリング情報を追加 | `/kiro:spec-init` (必要に応じて再実行) |
| `/kiro:spec-init <feature>` | 機能説明 | `.kiro/specs/<feature>/` を作成 | `/kiro:spec-requirements <feature>` |
| `/kiro:spec-requirements <feature>` | 機能名 | `requirements.md` を生成 | `/kiro:spec-design <feature>` |
| `/kiro:validate-gap <feature>` | 任意 | 既存コードと要件差分を検証 | `/kiro:spec-design <feature>` |
| `/kiro:spec-design <feature> [-y]` | 機能名 | `research.md`（必要に応じて）と `design.md` を生成 | `/kiro:spec-tasks <feature>` |
| `/kiro:validate-design <feature>` | 任意 | 設計の品質評価 | `/kiro:spec-tasks <feature>` |
| `/kiro:spec-tasks <feature> [-y]` | 機能名 | 並列実行を考慮したタスクリスト `tasks.md`（実行順序ラベル付き）を作成 | `/kiro:spec-impl <feature> [task-ids]` |
| `/kiro:spec-impl <feature> [task-ids]` | タスク番号 | 実装とテスト駆動開発（TDD）の実行 | `/kiro:validate-impl [feature] [task-ids]` |
| `/kiro:validate-impl [feature] [task-ids]` | 任意 | 実装のレビュー/テスト結果を確認 | `/kiro:spec-status <feature>` |
| `/kiro:spec-status <feature>` | 機能名 | 各フェーズの進捗・承認状況を要約 | レコメンドに従って次フェーズへ |

---

## Steering コマンド

### `/kiro:steering`
- **目的**: プロジェクト全体のルールやガイドラインを `.kiro/steering/` ディレクトリに集約し、すべてのコマンドが共通のプロジェクトメモリ（Project Memory）を参照できるようにする。特定の機能に関する実装の詳細を記述する場所ではない。
- **引数**: なし。
- **出力**: `structure.md`、`tech.md`、`product.md` が生成される（既存の場合は差分を更新）。ここには長期的に使用する原則や標準のみを記載し、個別の機能に関するメモは `spec/research/design` に残すこと。
- **典型的なフロー**: リポジトリの初回セットアップ時や大規模な変更時に実行し、生成された内容を開発者がレビュー・調整する。その後、各specコマンドがこの情報を自動的に参照する。
- **ヒント**:
  - 空のディレクトリで実行すると失敗するため、必ずソースコードが存在するプロジェクトのルートディレクトリで実行すること。
  - Steering は、プロジェクト横断的なパターンやルールを記述するためのものである。機能固有の調査内容は `research.md` や `design.md` に記述する。
  - 生成されるのはあくまでベースラインである。プロジェクト独自のルールは `/kiro:steering-custom` を使って追加すること。

### `/kiro:steering-custom`
- **目的**: APIの仕様、テスト計画、UI/UXガイドライン、アクセシビリティ要件など、コアとなる3つのファイルだけではカバーしきれない領域のステアリング情報を追加するための、対話型コマンドである。
- **引数**: なし（対話形式でテンプレ選択）。
- **出力例**: `api-standards.md`（REST/GraphQLの規約、バージョニング、エラー設計）、`testing.md`（自動テストと手動テストの判断基準、カバレッジ目標）、`ui-ux.md`（デザインシステム、ライティングのトーン、レビュー手順）、`product-tests.md`（QAチーム向けのE2Eシナリオ）、`security.md` など。必要に応じて、独自の名前を持つファイルも生成できる。
- **利用シーン**:
  - プロジェクトで遵守すべき標準（API規約、全社的なテストガイドライン、UXの基本原則など）をAIに一次情報として提供したい場合。
  - 複数のチームやエージェント間で共通のルールを共有し、仕様書や設計書の出力に反映させたい場合。
  - 既存のプロジェクト（Brownfield）において、UI/UXやAPIの整合性を保ちながら機能を追加開発したい場合。

---

## Spec Workflow コマンド

### `/kiro:spec-init`
- **目的**: `.kiro/specs/<feature>/` ディレクトリを作成し、`overview.md` や `context.json` などのメタデータを初期化する。
- **必須引数**: `<feature>`（機能名やイシュー ID）。
- **実行タイミング**: Steering情報の設定直後、または新しい機能を追加する際に実行する。
- **次のステップ**: `/kiro:spec-requirements <feature>`。

### `/kiro:spec-requirements`
- **目的**: ユーザーの要求や制約条件を洗い出し、EARS (Easy Approach to Requirements Syntax) 形式で `requirements.md` を作成する。
- **フロー**: コマンドを実行し、AIからの補足質問に回答する。生成されたドラフトを開発者がレビューし、必要に応じて追記・修正する。
- **ヒント**: 既存のプロジェクト（Brownfield）では、`/kiro:validate-gap` を併用することで、既存コードとの差分を明確にできる。

### `/kiro:spec-design`
- **目的**: 調査ログ `research.md`（必要な場合のみ自動生成）と、詳細設計書 `design.md` をセットで作成する。要件カバレッジ、コンポーネントとインターフェース、参考文献など、v2.0.0のテンプレートに準拠した内容が出力される。
- **オプション**: `-y` オプションを付けると、確認プロンプトをスキップできる（本番運用での使用は推奨されない）。
- **レビューの観点**: アーキテクチャの境界、トレーサビリティ、コンポーネントの結合度に関するルールが守られているか、また、長文の資料や外部リンクが参考文献（Supporting References）として適切に分離されているかを確認する。

### `/kiro:spec-tasks`
- **目的**: `design.md` を基に実装タスクリスト (`tasks.md`) を作成する。その際、`P0`（逐次実行が必須）や `P1`（並列実行が可能）といった実行順序のラベルを付け、並行開発を容易にする。
- **ポイント**: v2.0.0では、ドメインやレイヤーごとのブロックが標準化され、機能追加やリファクタリングの案件にも再利用しやすくなった。要件IDとの紐付け、チェックボックス、実行順序ラベルがセットで生成される。

### `/kiro:spec-impl`
- **目的**: 指定タスクを AI で実装。テストコマンドや検証内容も併せて提案。
- **使い方**: `/kiro:spec-impl user-auth 3 4` のようにタスクIDを渡すことで、指定されたタスクのみを対象とした実装プロンプトが生成される。
- **注意**: 実行する前に、`tasks.md` のタスクリストが承認済みであることを確認すること。

---

## Validation コマンド

### `/kiro:validate-gap`
- **役割**: 既存のソースコードと `requirements.md` との差分を自動で分析し、`gap-report.md` を生成する。既存プロジェクト（Brownfield）の改修時に、要求の抜け漏れを検出するのに有効である。
- **入力**: `<feature>`（任意）。
- **出力**: 検出されたギャップの一覧、推奨される対応タスク、関連する可能性のあるファイルリストが出力される。

### `/kiro:validate-design`
- **役割**: `design.md` の整合性やテンプレートへの準拠状況をレビューする。トレーサビリティ、境界設計、参考文献（Supporting References）の適切な使い方などをチェックし、改善のためのフィードバックを提供する。
- **おすすめのタイミング**: 開発者によるレビューの前後で実行すると、設計上のチェック項目の網羅性を確認するのに役立つ。

### `/kiro:validate-impl`
- **役割**: 実装済みのタスクが `tasks.md` に記載された受け入れ条件を満たしているかを確認する。テストコマンドやログの不足、差分（Diff）の概要などをまとめて報告する。
- **入力**: `[feature-name] [task-ids]`（引数を省略した場合は、直近のタスクを自動的に検出する）。

---

## Status コマンド

### `/kiro:spec-status`
- **目的**: 特定の機能開発プロジェクトについて、要件定義、設計、タスク分割、実装、検証の各フェーズの進捗と承認状況を一覧で表示する。
- **出力**: チェックリスト形式のサマリーがCLIに表示され、次に実行すべきコマンドが提案される。
- **利用シーン**: 担当レビューアの交代時や、複数の開発者・AIエージェントが並行して作業を進めている状況で、全体の進捗を把握するのに便利である。

---

## よくある質問

| 質問 | 回答 |
| --- | --- |
| Claude以外のエージェントでも同じ結果になるか？ | コマンド体系は共通だが、各エージェントのUIや制約によって、応答の内容は多少異なる場合がある。READMEに記載されているインストールフラグを使い、対象のエージェントを選択すること。 |
| コマンドを連続で自動実行したい場合はどうすればよいか？ | `/kiro:spec-quick <feature>` を使用すると、要件定義からタスク分割までを一度に実行できる。ただし、各フェーズの間に確認が入るため、開発者によるレビューを挟むことが可能である。 |
| テンプレートをカスタマイズするにはどうすればよいか？ | `.kiro/settings/templates/` および `.kiro/settings/rules/` 内のファイルを修正すること。変更は即座にすべてのコマンドに反映される。 |

---

このドキュメントは、v2.0.0時点の仕様に基づいている。将来のバージョンでコマンドラインの仕様やテンプレートの構造が変更された場合は、最新の英語版ドキュメント `docs/guides/command-reference.md` の内容を正とすること。
