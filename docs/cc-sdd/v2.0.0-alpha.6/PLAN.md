# v2.0.0-alpha.6 アップデート計画

- claude-code 向けテンプレート／コマンドから段階的に反映し、問題なければ他エージェントへ水平展開する。
- 詳細設計 `design.md` の設計方針を「アーキテクチャ境界と契約の明文化」に重点化しつつ、既存構成を維持したまま調査記録や背景説明を `research.md` へ分離する。
- Architecture Pattern と明確な境界マップをテンプレートの必須観点として整理し、並列タスク生成に必要なドメイン分割情報を強化する（章立て自体は従来を踏襲）。
- 主要な設計判断は ADR ではなく `research.md` に整理し、決定理由の履歴と再利用性を確保する。
- `/kiro-spec-design` 系コマンドに新テンプレート／ルールのロード手順を反映し、生成後の出力サマリーに Research/Architecture 情報を含める。
- tasks フェーズに対して、Interface Contracts 情報と research 記述を並列判定・依存関係分析へ活用できるようルールを更新する。
- `design.md` テンプレートや design 系ルールは調査手順を research.md へ移すことで、必要情報を保ったまま適度にスリム化する。
- tasks 生成では、冗長なトップレベル記述を避けて「実装結果」に集中し、単一サブタスク時は番号を繰り上げるようルール／テンプレートを整理する。
- タスク分解はドメイン境界／契約ごとの Major タスク ＋ 並列安全な Sub タスクを基本とし、各 Sub タスクに `(P)` 判定と要件・契約のひも付けを明示する。
- 受入基準に紐づくテスト追補タスクは `- [ ]*` で任意扱いできるようルール／テンプレート／コマンドに指針を追記し、MVP 優先の柔軟性を持たせる。

## 変更対象ファイル

### 1. テンプレート関連
- `templates/shared/settings/templates/specs/design.md`
  - 見出し「High-Level Architecture」を「Architecture Pattern & Boundary Map」に変更し、チーム衝突を避ける境界定義を追加。
  - 「Technology Stack & Alignment」へ改名し、stack の記述規律を整理。
  - 「Components & Interface Contracts」節を定義し、API/イベント契約を明示。
  - 長文の設計判断を `research.md` に誘導する文言を追加。
- `templates/shared/settings/templates/specs/research.md`（新規）
  - Discovery の調査結果・設計判断・代替案比較を記録するテンプレート。
  - ADR の補完として、設計判断の履歴/引用元リンクを保持。

### 2. コマンド定義
- `templates/agents/*/commands/kiro-spec-design.*`
- `templates/agents/*/commands/spec-design.*`
  - research.md の生成・更新手順を追加。
  - Design テンプレートの新見出し反映、および出力サマリーに Research/Architecture 概要を含める。
  - Discovery フェーズで research.md を初期化／追記する流れを明記。

### 3. ルール／ガイド
- `templates/shared/settings/rules/design-discovery-full.md`
- `templates/shared/settings/rules/design-discovery-light.md`
  - Architecture Pattern 選定と境界定義、research.md への記録手順を追記。
- `templates/shared/settings/rules/design-principles.md`
  - 「明確な境界」「契約中心設計」「research.md への判断記録」を追加。
- `templates/shared/settings/rules/tasks-generation.md`
- `templates/shared/settings/rules/tasks-parallel-analysis.md`
  - Architecture Pattern と Interface Contracts を参照しつつ、トップレベルが単なるサマリの場合は詳細を省略し、サブタスクが1件のときは繰り上げる運用を明文化。

### 4. ドキュメント
- `docs/guides/command-reference.md` など関連ガイド（該当箇所のみ更新）
  - research.md の役割と参照フローを追記。
- `CHANGELOG.md` / リリースノート（必要に応じて）

## 実装手順
1. **Research テンプレート定義**
   - `specs/research.md` のテンプレートを新規作成し、既存の design 決定要素を移植する構造を策定。
2. **Design テンプレート改修**
   - 見出し名称・節構成の改修と、research.md 参照文言の追記。
   - Components & Interface Contracts 節を追加し、契約表記ルールを整備。
3. **ルール更新**
   - Discovery/Principles/Tasks 系ルールに research.md と新節の方針を反映。
   - 並列分析で参照する情報源を明文化し、タスク構造の繰り上げ・簡潔化ルールを追加。
   - Architecture Pattern & Boundary Map に沿った Major タスク、Interface Contracts に沿った Sub タスク、並列 (P) 判定の付与パターンを例示。
   - 受入基準に紐づくテストサブタスクを `- [ ]*` で任意扱いする条件と、コマンド側の周知事項を整理。
4. **コマンド更新**
   - すべての `spec-design` 系コマンドで新テンプレート／ルール読み込みフローを実装。
   - 生成後のサマリーで research.md 作成状況を通知。
   - Markdown プロンプト本文は一貫して英語で記載することを徹底。
5. **ドキュメント反映 & テスト**
   - Guides/Changelog を更新し、サンプルスペックで design → tasks までの流れを検証。
   - 並列タスク判定 `(P)` の挙動に変化がないか確認。

## 影響範囲
- **影響大**: design フェーズのワークフロー、tasks 生成の前提情報。
- **影響中**: ドキュメント／ガイド類、既存プロジェクトの design.md に対する互換性（移行手順要案内）。
- **影響小**: requirements／spec.json／impl コマンド（直接の仕様変更なし）。

## 検証ポイント
- 新旧テンプレートで生成された design.md / research.md / tasks.md の整合性。
- research.md が欠落している場合のフォールバック動作。
- 並列タスク判定で `(P)` を付与する対象が適切（競合を招かず、必要なタスクに漏れなく付与できている）か。
- 既存リポジトリでの移行ガイド（旧 design.md から research.md への切り出し手順）が成立するか。
