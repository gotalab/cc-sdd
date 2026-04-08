# スキルリファレンス

> 📖 **English guide:** [Skill Reference](../skill-reference.md)

cc-sdd の Skills モード向けリファレンスである。`--claude-skills`、`--codex-skills`、`--cursor-skills`、`--copilot-skills`、`--windsurf-skills`、`--opencode-skills`、`--gemini-skills`、`--antigravity` を使っている場合は、このページを参照する。

レガシーの `/kiro:*` コマンドを使っている場合は、[コマンドリファレンス](command-reference.md) を参照すること。

## まずどこから始めるか

最初に覚えるべきなのは skill 名の一覧ではなく、「何をしたい時にどこから入るか」である。

| やりたいこと | 最初に使うもの | 次の典型アクション |
| --- | --- | --- |
| 新しい依頼を振り分けたい | `/kiro-discovery` | `kiro-spec-init`、`kiro-spec-batch`、または直接実装 |
| 1つの新規 spec を作りたい | `/kiro-spec-init` | `/kiro-spec-requirements` |
| 大きい構想を複数 spec に分けたい | `/kiro-spec-batch` | 生成された spec をレビューし、承認済みのものから進める |
| 承認済みタスクを実装したい | `/kiro-impl` | `/kiro-validate-impl` |
| feature 全体を検証したい | `/kiro-validate-impl` | findings を直すか、`GO` / `NO-GO` / `MANUAL_VERIFY_REQUIRED` を返す |
| プロジェクト共通コンテキストを整えたい | `/kiro:steering` または `/kiro:steering-custom` | spec workflow を開始または再開 |

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
  - 複数 spec を並列生成する
  - cross-spec の整合性を保つ
  - 1つの巨大 spec ではなく roadmap ベースの backlog を作る

### `/kiro-impl`

`tasks.md` が承認済みで、実装を進めたい時に使う。

- モード:
  - 自律モード: task 引数なし。task ごとに fresh implementer + reviewer + debugger
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

