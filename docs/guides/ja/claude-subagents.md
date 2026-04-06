# Claude Code Subagents ワークフロー（spec-quick 特化）

> 📖 **English guide:** [Claude Code Subagents Workflow](../claude-subagents.md)

このガイドでは、`npx cc-sdd@latest --claude-agent`（または `--claude-code-agent`）で提供される **Claude Code Subagents** の中で、独自の制御ロジックを持つ `spec-quick` コマンドに焦点を当てて解説する。その他の `/kiro:*` コマンドも同じ Subagent を再利用するが、動作は標準版と変わらないため、ここでの説明は省略する。

## インストールの確認

- `npx cc-sdd@latest --claude-agent --lang <言語コード>` を実行する。
- 展開されるファイルは以下の通りである。
  - `.claude/commands/kiro/`: Spec/Steering/Validation 関連のコマンド（12個）
  - `.claude/agents/kiro/`: 詳細分析用の Subagent 定義ファイル（9個）
  - `CLAUDE.md`: クイックスタートガイド

## spec-quick による Subagent の連携フロー

`spec-quick` は、`spec-init`（インライン実装）、`spec-requirements`、`spec-design`、`spec-tasks` の4つのフェーズを自動で連続実行するマクロコマンドである。この機能の実装は `tools/cc-sdd/templates/agents/claude-code-agent/commands/spec-quick.md` に定義されている。

### モード

- **インタラクティブモード（デフォルト）**: 各フェーズの完了後に実行を続けるか確認する。初回実行時や、複雑な機能開発に適している。
- **自動モード (`--auto`)**: TodoWrite で進捗 (4/4) を追跡しながら、確認なしで最後まで実行する。リスクの低い機能のドラフト作成に適している。

どちらのモードでも `/kiro:validate-gap` と `/kiro:validate-design` はスキップされる。完了時のメッセージで手動実行が推奨されるため、既存のプロジェクト（Brownfield）に機能追加する場合は、忘れずに追加実行すること。

### 各フェーズの動作

| フェーズ | 呼び出す Subagent | 主な処理 |
| --- | --- | --- |
| 1. 初期化 | インライン（Subagent なし） | `.kiro/specs/{feature}/` ディレクトリを作成し、テンプレートから `spec.json` と `requirements.md` の骨子を生成する。TodoWrite の最初の項目を完了ステータスに更新する。 |
| 2. Requirements | `agents/spec-requirements.md` | `/kiro:spec-requirements {feature}` を実行し、ユーザーとの質疑応答を通じて要件の草案を作成する。自動モードの場合、Subagent が提示する「次のステップ」を無視して、直ちにフェーズ3へ進む。 |
| 3. Design | `agents/spec-design.md` | `/kiro:spec-design {feature} -y` を呼び出し、必要に応じて `research.md` と `design.md` を更新する。TodoWrite の進捗が 3/4 完了になる。 |
| 4. Tasks | `agents/spec-tasks.md` | `/kiro:spec-tasks {feature} -y` を実行し、`tasks.md` を出力する。このタスクリストには、要件カバレッジと並列実行可能性を示す `(P)` ラベルが含まれる。完了後、TodoWrite が 4/4 となり、サマリーが表示される。 |

自動モードでは、Subagent が示すガイダンスに関わらず、自動的に次のフェーズへ進む。一方、インタラクティブモードでは、各フェーズの間に「要件定義へ進みますか？」「設計へ進みますか？」といった確認が入る。

### 出力とスキップされるゲート

出力されるファイル:
- `spec.json`
- `requirements.md`
- `design.md`（必要に応じて `research.md` 更新）
- `tasks.md`（並列実行可能性を示す `(P)` ラベル付き）

スキップされるもの:
- `/kiro:validate-gap`
- `/kiro:validate-design`
- `/kiro:validate-impl`

### Subagent の手動実行

特定のフェーズのみを再実行したい場合は、Claude Code のチャットで `@agents-spec-design` や `@agents-spec-tasks` のようにメンションすることで、対応する Subagent を直接呼び出すことができる。このとき、インストール時に作成された `.claude/agents/kiro/*.md` 内のプロンプトが使用される。

## 推奨ユースケース

1. `npx cc-sdd@latest --claude-agent --lang <code>` を実行して、Subagent をワークスペースに展開する。
2. `/kiro:steering`（または必要に応じて `/kiro:steering-custom`）を実行し、プロジェクトの記憶（Project Memory）を最新の状態にしてから作業を開始する。
3. `spec-quick <feature> [--auto]` を使って仕様のドラフトを生成し、`requirements.md`、`design.md`、`tasks.md` の内容を確認する。
4. 変更が既存システムに影響を与える可能性がある場合は、`/kiro:validate-gap` と `/kiro:validate-design` を必ず追加で実行すること。
5. 仕様が承認されたら、`/kiro:spec-impl` や `/kiro:spec-status` を使って実装と進捗管理を進める。

## Subagent のカスタマイズ

1. **テンプレートとルールの更新**: `{{KIRO_DIR}}/settings/templates/*.md` や `{{KIRO_DIR}}/settings/rules/*.md` に共通のチェックリストなどを記載することで、Subagent を含むすべてのエージェントが同じ基本情報を参照するようになる。
2. **Subagent プロンプトの編集**: `.claude/agents/kiro/*.md` ファイルを編集し、独自のヒューリスティック（優先度付け、リスク分類、テスト方針など）をプロンプトに追加する。
3. **コマンドによる起動条件の制御**: `.claude/commands/kiro/*.md` ファイル内の `call_subagent` セクションを調整することで、Subagent を呼び出すタイミングを細かく制御できる。
4. **プロンプトの簡潔化**: Task Tool の表示領域は限られているため、長文の指示はテンプレートやルールファイルに記述し、Subagent のプロンプトは要点に絞ることで、動作が安定しやすくなる。

## トラブルシューティング

| 症状 | 原因 | 解決策 |
| --- | --- | --- |
| Subagent が呼び出されない | `--claude-agent` を使ってインストールしていない、または `.claude/agents/kiro/` ディレクトリが存在しない。 | `npx cc-sdd@latest --claude-agent` で再インストールし、ディレクトリ構成を確認すること。 |
| 解析範囲が広すぎる | ファイル検索パターンが広すぎる（例: `*.*`）。 | 該当する Subagent のプロンプトを編集し、検索パターンをより具体的に絞り込むこと。 |
| 出力がテンプレートと一致しない | Subagent が古いテンプレートを参照している。 | `{{KIRO_DIR}}/settings/templates` を最新の内容に更新し、Subagent がそれを正しく参照しているか確認すること。 |

## Skills モードの Subagent（v3.0.0）

`--claude-skills` または `--codex-skills` でインストールした場合、Subagent の管理方法がコマンドモード（`--claude-agent`）とは異なる。

### コマンドモードとの違い

| 項目 | コマンドモード (`--claude-agent`) | Skills モード (`--claude-skills`) |
| --- | --- | --- |
| Subagent 定義 | `.claude/agents/kiro/*.md` に静的に配置 | `/kiro-impl` がプロンプトテンプレートから動的に生成 |
| ディスパッチ | `spec-quick` が固定フローで各フェーズの Subagent を呼び出す | `/kiro-impl` の自律モードがタスクごとに実装者+レビューア+デバッガーを起動 |
| 失敗時のデバッグ | なし | 自動デバッグ Subagent（最大2ラウンド、Web検索付き） |
| 外部依存 | なし | なし（v3.0.0で Ralph Loop プラグインを廃止し、ネイティブ Agent ツールのみ使用） |
| 事前定義ファイル | `.claude/agents/kiro/` が必要 | 不要（Skill のプロンプトテンプレートが Subagent の振る舞いを定義） |

### 自律モードの Subagent フロー

`/kiro-impl` をタスク引数なしで実行すると、以下のフローが自動的に進行する:

1. **タスク選択**: `tasks.md` から未完了の次タスクを1つ選択する（前タスクの Implementation Notes を次の実装者に注入）
2. **実装者 Subagent の起動**: タスクブリーフ（Task Brief）を作成し、仕様から導出された具体的な受け入れ基準を明示してからコーディングに入る
3. **レビューア Subagent の起動**: 実装完了後、独立したレビューアが機械的な検証を行う
   - TODO / FIXME コメントの残存チェック（grep）
   - テストの実行と結果確認
   - git diff による変更境界の確認（タスクスコープ外の変更がないか）
4. **失敗時のデバッグ**: 実装者が BLOCKED を返した場合、またはレビューアが2回連続で REJECTED した場合、**デバッグ Subagent** を新しいコンテキストで起動する。デバッグ Subagent は失敗した実装履歴を持たず、エラー情報のみを受け取って根本原因を調査する（Web検索を積極的に使用）。修正方針を受けて新しい実装者が再試行する。1タスクあたり最大2ラウンド。
5. **タスク完了**: `tasks.md` の進捗を更新し、次のタスクへ（1タスク1イテレーション）

この設計により、`.claude/agents/kiro/` にあらかじめ Subagent 定義ファイルを配置する必要がなく、Skill のテンプレートだけで完結する。

### セッション再開

`/kiro-impl` は中断耐性を持つ。セッションが中断された場合でも、再実行すると `tasks.md` の状態から未完了タスクを検出し、そこから処理を再開する。

## 関連リンク

- [Spec-Driven Development ワークフロー](spec-driven.md)
- [Docs README](../README.md)
- [対応コーディングエージェント一覧](../../README.md#-supported-coding-agents)
