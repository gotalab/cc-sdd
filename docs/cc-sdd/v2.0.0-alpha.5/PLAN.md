# v2.0.0-alpha.5 アップデート計画

## 概要
`/kiro:spec-tasks <feature-name>` 実行時にデフォルトで並列判定を行い、並列実行可能なタスクへ `(P)` マーカーを付与した tasks.md を生成（必要に応じてオプトアウト可能）

## 変更対象ファイル

### 1. コマンド定義の更新
**対象**: 各エージェントの `kiro-spec-tasks` 系コマンド
- `templates/agents/windsurf/commands/kiro-spec-tasks.md`
- `templates/agents/github-copilot/commands/kiro-spec-tasks.prompt.md`
- `templates/agents/codex/commands/kiro-spec-tasks.md`
- `templates/agents/cursor/commands/spec-tasks.md`
- `templates/agents/claude-code/commands/spec-tasks.md`
- `templates/agents/claude-code-agent/commands/spec-tasks.md`
- `templates/agents/gemini-cli/commands/spec-tasks.toml`

**変更内容**:
- `argument-hint` をデフォルト並列モード・オプトアウト引数（例: `[--sequential:$2]` や `[-y:$2] [--sequential:$3]`）に合わせて更新
- フラグなし時に並列判定を有効化するロジックへ変更
- 並列分析ルールを標準読み込みに変更し、オプトアウト時のみ無効化

### 2. ルール定義の追加
**新規作成**: `templates/shared/settings/rules/tasks-parallel-analysis.md`

**内容**:
- 並列実行可能なタスクの判定基準
  - データ依存性がない
  - ファイル競合がない
  - 外部リソース競合がない
  - 前タスクの完了を待つ必要がない
- `(P)` マーカーの付与ルール
- 並列タスクのグループ化ガイドライン

### 3. テンプレートの更新
**対象**: `templates/shared/settings/templates/specs/tasks.md`

**追加内容**:
- 並列マーカー付きタスクフォーマット例
```markdown
- [ ] 2.1 (P) 並列実行可能なサブタスク
  - 詳細項目
  - _Requirements: X.X_
```

### 4. タスク生成ルールの更新
**対象**: `templates/shared/settings/rules/tasks-generation.md`

**追加セクション**:
- `--parallel` モード時の追加制約
- 並列マーカー `[P]` の説明
- 並列タスクの依存関係検証ルール

## 実装手順

1. **並列分析ルールの作成**
   - `tasks-parallel-analysis.md` 新規作成
   - 並列実行判定ロジックの定義

2. **テンプレート拡張**
   - `tasks.md` に並列マーカー例を追加
   - `tasks-generation.md` に並列ルールを追記（デフォルト挙動として明記）

3. **コマンド更新**
   - 全エージェントの `kiro-spec-tasks` コマンドをデフォルト並列判定に改修
   - 並列分析ルールを標準ロードし、`--sequential`（仮）指定時のみ無効化

4. **検証**
   - サンプルスペックでフラグなし（デフォルト並列）と `--sequential`（仮）指定時の両ケースをテスト
   - 生成される tasks.md の `(P)` マーカー位置とオプトアウト結果を確認

## 影響範囲

**変更あり**:
- コマンド定義（デフォルト挙動とオプトアウト引数）
- ルール/テンプレート（並列判定の標準化）
- tasks.md の出力内容（デフォルトで `(P)` マーカーが付与される可能性）

**変更なし**:
- requirements.md, design.md 生成
- spec.json 構造
- 実装フェーズ（`/kiro:spec-impl`）
