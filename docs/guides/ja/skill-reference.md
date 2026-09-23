# スキルリファレンス

> 📖 **English guide:** [Skill Reference](../skill-reference.md)

cc-sdd の Skills モード向けリファレンスである。`--claude-skills`、`--codex-skills`、`--cursor-skills`、`--copilot-skills`、`--devin`、`--opencode-skills`、`--gemini-skills`、`--antigravity` を使っている場合は、このページを参照する。

レガシーの `/kiro:*` コマンドを使っている場合は、[コマンドリファレンス](command-reference.md) を参照すること。

以下は slash 呼び出し（`/kiro-*`）の例である。Codex は `$kiro-*`、Cascade は `@kiro-*` を使う。導入したホストの呼び出し手順に従うこと。

## まずどこから始めるか

最初に覚えるべきなのは skill 名の一覧ではなく、「何をしたい時にどこから入るか」である。

| やりたいこと | 最初に使うもの | 次の典型アクション |
| --- | --- | --- |
| 新しい依頼を振り分けたい | `/kiro-discovery` | `kiro-spec-init`、`kiro-spec-batch`、または直接実装 |
| 1つの新規 spec を作りたい | `/kiro-spec-init` | `/kiro-spec-requirements` |
| 大きい構想を複数 spec に分けたい | `/kiro-spec-batch` | 生成された spec をレビューし、承認済みのものから進める |
| 承認済みタスクを実装したい | `/kiro-impl` | `/kiro-validate-impl` |
| feature 全体を検証したい | `/kiro-validate-impl` | findings を直すか、`GO` / `NO-GO` / `MANUAL_VERIFY_REQUIRED` を返す |
| プロジェクト共通コンテキストを整えたい | `/kiro-steering` または `/kiro-steering-custom` | spec workflow を開始または再開 |

## ワークフローの中心になる skills

### `/kiro-discovery`

新しい仕事はあるが、それが 1 spec なのか、複数 spec なのか、spec 不要なのか、まだ分からない時に使う。

- 役割:
  - 依頼を route する
  - scope を整える
  - `brief.md` と必要なら `roadmap.md` を書く
  - 次のコマンドを示して止まる
- 典型的な分岐:
  - 既存 spec に戻す
  - spec 不要として直接実装する
  - 1つの新規 spec を作る
  - 複数 spec に分解する

### `/kiro-spec-batch`

discovery や roadmap の結果、複数 spec に分けるべきと分かっている時に使う。

- 役割:
  - 依存関係の wave ごとに複数 spec を生成する。subagent が利用可能な場合は並列実行する
  - cross-spec の整合性を保つ
  - 1つの巨大 spec ではなく roadmap ベースの backlog を作る

### `/kiro-impl`

`tasks.md` が承認済みで、実装を進めたい時に使う。

- モード:
  - 自律モード: task 引数なし。subagent が利用可能な場合は task ごとに独立した implementer・reviewer・debugger を使い、それ以外はホスト別の inline フローに従う
  - マニュアルモード: task 引数あり。main context で TDD + review gate
- 保証したいこと:
  - reviewer 承認前に完了しない
  - success claim の前に `kiro-verify-completion` を通す
  - remediation / debug は bounded にする

### `/kiro-validate-impl`

実装後に、task 単体ではなく feature 全体を横断して検証したい時に使う。

- 主に見るもの:
  - task 間 integration
  - requirements coverage
  - design alignment
  - full-suite の証拠
- 返り値:
  - `GO`
  - `NO-GO`
  - `MANUAL_VERIFY_REQUIRED`

## 補助的だが重要な skills

これらは独立 skill だが、多くの利用者は `/kiro-impl` の中で間接的に使う。

### `kiro-review`

task-local の adversarial review protocol。

- 主な利用箇所:
  - 自律モードの reviewer subagent
  - マニュアルモードの review gate
- 主に確認するもの:
  - spec compliance
  - boundary fit
  - mechanical verification
  - 必要なら RED-phase evidence

### `kiro-debug`

root-cause-first の debug protocol。

- 使われる場面:
  - implementer が blocked
  - reviewer rejection が収束しない
  - validation で deeper issue が見つかる
- 主な出力:
  - `ROOT_CAUSE`
  - `CATEGORY`
  - `FIX_PLAN`
  - `NEXT_ACTION`

### `kiro-verify-completion`

success claim の前に fresh evidence を要求する gate。

- 主な利用箇所:
  - task 完了前
  - fix が効いたと主張する前
  - feature success を報告する前
- 返り値:
  - `VERIFIED`
  - `NOT_VERIFIED`
  - `MANUAL_VERIFY_REQUIRED`

## `/kiro-impl` の内部: dispatch と iteration

「ここでの subagent って何？」という疑問の大半は `/kiro-impl` の中で起きている。レガシーの `--claude-agent` インストール先と違い、Skills モードでは `.claude/agents/kiro/` 配下の事前定義ファイルに依存しない。実装 dispatch は skill 自身が持っている。

1つの実行内での実装・レビュー・デバッグには、ホストの subagent を使う。機能やPRとして独立した仕事はホスト側で別チャットに分け、その中で cc-sdd と subagent を使う。各specのタスク状態とコミットは1つの controller が管理する。チャットを分けるだけでは編集ファイルは分離されないため、独立した作業者を隔離する場合は別 worktree を選ぶ。

worker には親の会話全体ではなく、対象タスクの情報と参照先を渡す。controller は結果、検証証跡の参照先、未解決の制約、関連する知見を保持する。reviewer と debugger は明示されたパスから `kiro-review`・`kiro-debug` の正本を読み、引き継ぎ文に手順を重複させない。

### 動的 dispatch（静的 agent ファイルではない）

- `tdd-task-implementer.md` のような事前定義ファイルは `.claude/agents/` 配下に存在しない
- `/kiro-impl` は subagent が利用可能な場合、ホストのツール（例: Claude Code の Agent tool）と skill 内のプロンプトテンプレートを使い、独立した実行コンテキストを起動する
- 現行の 8 種類の統合と、移行用の非推奨 Cascade adapter はホスト別の指示を持つ。Cascade 互換では同じコンテキスト内で順次実装・レビューし、他のホストでも subagent が利用できない場合は同様にフォールバックする。実行環境ごとの制約は [Agent compatibility](../agent-compatibility.md) を参照。skills の導入だけでは独立レビューの動作保証にならない

### タスクごとの 3 ロール

subagent が利用可能な場合、各タスクは最大 3 つの独立したロールで進行する:

- **Implementer** — 仕様から Task Brief を作り、TDD（Feature Flag Protocol の RED → GREEN）で実装する fresh 実行コンテキスト
- **Reviewer** — 独立した reviewer pass。`git diff`、TODO grep、テストスイート、タスク境界の検証を行う
- **Debugger** — implementer が BLOCKED を返したか、reviewer の2回の修正ラウンドでも解決しない時に起動。新しいコンテキストに現在の失敗証跡と試行結果の要約を渡し、原因調査と修正プランを次の implementer に引き継ぐ。1 タスクあたり最大 2 ラウンド

これら 3 つのロールは上で触れた 3 つの supporting skill（`kiro-review`、`kiro-debug`、`kiro-verify-completion`）に対応する。dispatch は動的で、`.claude/agents/` 配下にファイルを置く必要はない。

### 知見の伝播

タスクから横断的な知見（例: "better-sqlite3 は Electron 向け ABI rebuild が必要"）が得られた場合、`tasks.md` の `## Implementation Notes` に記録され、以降の implementer プロンプトに注入される。これが「後のタスクが前のタスクの発見を活用する」仕組み。

### 1 task per iteration

各イテレーションは 1 タスクのみ処理し、review / debug の範囲を限定する。進捗は `tasks.md` に記録する。中断後の再開前には、未完了の変更と実行中の worker を確認する。進捗の記録だけで、すべてのホストでの中断復旧を保証するものではない。

## Skills モードと `--claude-agent` の比較

Skills モードとレガシーの `--claude-agent` は subagent の扱いが根本的に異なる。両方とも有効な選択肢で、ワークフローに合う方を選ぶ。

| 観点 | `--claude-agent`（レガシー） | Skills モード |
| --- | --- | --- |
| Subagent 定義 | `.claude/agents/kiro/*.md` の静的ファイル | Skill 内のプロンプトテンプレート、動的 dispatch |
| クロスプラットフォーム | Claude Code のみ | 現行の 8 種類と移行用の旧 Cascade |
| Spec 生成 (`spec-quick`) | 4 フェーズを Subagent で調整 | `kiro-spec-quick` skill が 4 つの spec skill を順に呼ぶ |
| Spec batch | なし | `/kiro-spec-batch` + cross-spec review。並列実行の可否はホストに依存 |
| 実装 | `/kiro:spec-impl` で手動 | `/kiro-impl` の自律 or マニュアル |
| レビュー | 手動 or `validate-impl` | subagent が利用可能な場合は独立レビュー、それ以外は inline レビュー |
| 失敗時のデバッグ | なし | subagent が利用可能な場合は自動 debug pass（最大 2 ラウンド）、それ以外は inline フロー |
| セッション再開 | 最初から | task ファイルから継続。ホストごとの復旧動作は検証が必要 |
| 外部依存 | なし | ホストのツールを使用し、追加ランタイムは導入しない |

`--claude-agent` の詳細は [Claude Code Subagents ワークフロー](claude-subagents.md) を参照。

## Skills モード dispatch のカスタマイズ

Skills モードはプロンプトを動的に生成するため、`.claude/agents/kiro/*.md` を直接編集するのとは仕組みが異なる。

1. **Steering ドキュメント** — 主なカスタマイズポイント。Implementer と reviewer は steering からルールを継承するので、アーキテクチャや規約の変更は `{{KIRO_DIR}}/steering/*.md` に反映する
2. **Templates と rules** — `{{KIRO_DIR}}/settings/templates/*.md` と `{{KIRO_DIR}}/settings/rules/*.md` を更新して Task Brief と review 観点に影響を与える
3. **Skill ファイル** — 上級者向け。dispatch 動作・review gate・iteration 戦略を調整したい場合は、インストールされた `.claude/skills/`（またはプラットフォーム対応ディレクトリ）配下の `SKILL.md` を直接編集する

## Skills と Commands の違い

| 領域 | Skills モード | レガシーコマンド |
| --- | --- | --- |
| 新規 work の入口 | `/kiro-discovery` | なし |
| 複数 spec の生成 | `/kiro-spec-batch` | なし |
| 実装 | `/kiro-impl` | `/kiro:spec-impl` |
| integration validation | `/kiro-validate-impl` | `/kiro:validate-impl` |
| review/debug/completion gate | 明示的な skill として存在 | コマンド内や外部プロセスに埋め込まれがち |

## 読む順番のおすすめ

1. [仕様駆動開発ガイド](spec-driven.md)
2. このスキルリファレンス
3. レガシーモードが必要な場合だけ [コマンドリファレンス](command-reference.md)
