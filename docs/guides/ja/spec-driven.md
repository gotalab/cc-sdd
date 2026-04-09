# Spec-Driven Development (SDD)

> 📖 **English guide:** [Spec-Driven Development Workflow](../spec-driven.md)

このドキュメントは、cc-sdd が agentic SDLC ワークフローのなかで、仕様駆動開発（Spec-Driven Development, SDD）をどのように実践しているかを日本語で解説するものである。どのスラッシュコマンド（またはSkill）を実行し、どの成果物をレビューし、開発者による確認（ゲート）をどの段階に設けるべきかを迅速に判断するためのリファレンスとして利用できる。

## Core Ideas

cc-sdd は、Spec-Driven Development を「人間と agent の両方にとって、意図・境界・検証条件を読み取りやすくする実践」として扱う。目的はドキュメントを増やすことではない。アーキテクチャの一貫性を失わずに、仕事を独立して進められる spec を作ることである。

### 境界中心

cc-sdd では、spec の一番重要な価値は責務境界と契約を明確にすることにある。

良い spec は少なくとも次を明確にするべきである。

- この spec が何を責任範囲として持つか
- この spec が何を明示的に持たないか
- どの依存が許可されるか
- この spec が変わったとき、どの downstream を再検証すべきか

そのため cc-sdd では、workflow 全体で境界を持ち運ぶ。

- discovery は **Boundary Candidates** を出す
- requirements は必要なときに boundary context を明確にする
- design は **Boundary Commitments** として固定する
- tasks はローカルな **_Boundary:_** を持つ
- review / validation は **Boundary Violations** を探す

### spec は独立した delivery 単位

cc-sdd では、spec を単なる計画書ではなく、delivery と revalidation の単位として扱う。

実務上の狙いは、仕事を非同期に進められるようにすることにある。

- ある spec は先に進み、別の spec は待てる
- 契約が安定していれば downstream は進められる
- upstream 修正が入ったときも、広範囲の再同期ではなく対象 spec の再検証で済ませられる

discovery、mixed decomposition、spec batch generation、spec status はそのためにある。仕事を、独立して考え・レビューし・実装し・再検証できる単位へ分けるための仕組みである。

### 良いアーキテクチャが前提

境界中心の SDD は、下にあるアーキテクチャがそれを支えられることを前提にしている。

ownership が曖昧で、shared responsibility が多く、循環依存があり、責務の切れ目が不明確なシステムに spec を増やしても、独立性は生まれない。混乱を文書化するだけになる。

そのため cc-sdd は、architecture を後工程ではなく前提条件として扱う。spec は architecture を置き換えるものではない。境界・依存・不変条件を日々の作業 artifact に変えることで、architecture を運用可能にするものである。

### spec を中心に据え、機械的検証で支える

cc-sdd は spec を中心に据える。意図、スコープ、境界、除外事項、再検証条件を持つ主たる作業 artifact は Markdown spec である。

これは機械的検証の重要性を下げるものではない。テスト、build、lint、型チェック、runtime smoke check は引き続き重要であり、spec を現実に接続するための土台になる。

cc-sdd ではこの 2 層は補完関係にある。

- spec が意図と境界を表現する
- 機械的検証が execution-level の grounding を与える

### 変更容易性を前提に設計

cc-sdd は、変えやすさを保てる程度にシンプルであることを重視している。

これは 2 つのレベルで効く。

- 理解が進むにつれて spec 自体を切り直しやすい
- cc-sdd 自体もチームに合わせて変えやすい

templates、rules、skill workflows はカスタマイズされる前提で設計されている。目標は、すべてのチームに 1 つの canonical workflow を強制することではない。境界と検証ループを保ったまま、各チームの構造や delivery model に合わせて process を進化させられるようにすることである。

### 長時間自律は spec harness に依存する

cc-sdd における長時間自律は抽象的な約束ではない。`tasks.md` を中心にした workflow に支えられている。

`/kiro-impl` は task を 1 つずつ TDD、task-local review、bounded remediation で進め、最後の task まで実行できる。spec、task boundary、validation expectation が明確なときは進み、人間の確認・承認・判断が本当に必要なところでは止まる。

つまり自律は spec の代替ではない。強い spec harness の上でのみ成立する。

## まずどこから始めるか

skill 名を覚えることより、どの workstream に入るかを先に決める方が重要である。

| やりたいこと | Skills モード | レガシーモード |
| --- | --- | --- |
| 新しい仕事を始める（機能から大きな構想まで） | `/kiro-discovery` → `/kiro-spec-init` → `/kiro-spec-requirements` → `/kiro-spec-design` → `/kiro-spec-tasks` → `/kiro-impl` | `/kiro:spec-init` → `/kiro:spec-requirements` → `/kiro:spec-design` → `/kiro:spec-tasks` → `/kiro:spec-impl` |
| 既存システムを拡張する | `/kiro:steering` → `/kiro-discovery` または `/kiro:spec-init` → 任意で `/kiro:validate-gap` → `/kiro-spec-design` → `/kiro-spec-tasks` → `/kiro-impl` | `/kiro:steering` → `/kiro:spec-init` → 任意で `/kiro:validate-gap` → `/kiro:spec-design` → `/kiro:spec-tasks` → `/kiro:spec-impl` |
| 大きい initiative を分解する | `/kiro-discovery` → `/kiro-spec-batch` | 非対応 |
| spec 不要の小変更を入れる | `/kiro-discovery` → 直接実装 | 直接実装 |

## ライフサイクル概要

0. **ディスカバリー (Discovery / エントリポイント)**: Skills モードで新しい依頼に入るときの推奨入口である（`/kiro-discovery`、Skills モード専用）。依頼を5つの結果に振り分ける: 既存 spec の拡張、spec 不要の直接実装、1つの新規 spec、複数 spec への分解、あるいは既存 spec 更新・新規 spec・直接実装候補が混在する mixed decomposition。新規の single/multi/mixed では `brief.md` と必要に応じて `roadmap.md` を書き出すので、後からセッションを再開しても scope を説明し直す必要がない。
1. **ステアリング (Steering / コンテキスト収集)**: `/kiro:steering` および `/kiro:steering-custom` コマンドを使用し、アーキテクチャ、命名規則、ドメイン知識などを `.kiro/steering/*.md` ファイル群に収集する。これらはプロジェクトメモリ（Project Memory）として、後続の全コマンドから参照される。
2. **仕様策定の開始 (Spec Initiation)**: `/kiro:spec-init <feature>` コマンドが `.kiro/specs/<feature>/` ディレクトリを生成し、機能単位のワークスペースを確保する。
3. **要件定義 (Requirements)**: `/kiro:spec-requirements <feature>` コマンドが、AIとの対話を通じて `requirements.md` を作成する。ここにはEARS形式の要件や未解決の課題が記録される。
4. **設計 (Design)**: `/kiro:spec-design <feature>` コマンドが、まず調査ログとして `research.md` を生成・更新する（調査が不要な場合はスキップされる）。その内容に基づき、詳細設計書 `design.md` が出力される。この設計書は、要件カバレッジ、コンポーネントとインターフェース定義、参考文献などを備えた、レビューに適したドキュメントである。v3.0.0では、`design.md` に **File Structure Plan**（ディレクトリ構造とファイル責務の定義）が含まれるようになった。行数上限は1500行に拡大されている。
5. **タスク計画 (Task Planning)**: `/kiro:spec-tasks <feature>` コマンドで、実装タスクを `tasks.md` ファイルにTODO形式で分解する。各タスクは要件IDと紐付けられ、ドメインやレイヤーごとのブロックに標準化される。同時に、`P0`（逐次実行）や `P1`（並列実行可）といった実行順序ラベルが付与され、並行開発の境界が示される。
6. **実装 (Implementation)**: `/kiro:spec-impl <feature> <task-ids>` コマンド（コマンドモード）、または `/kiro-impl`（Skills モード）が、指定されたタスク単位での実装とテストのプロセスを支援する。Skills モードでは、自律モード（タスク引数なし）とマニュアルモード（タスク引数あり）の2つの動作形態がある（詳細は後述の「Skills ワークフロー」セクションを参照）。
7. **品質ゲート (Quality Gates)**: `/kiro:validate-gap`、`/kiro:validate-design`、`/kiro:validate-impl` といった検証コマンドが、既存コードとの整合性や、設計・実装の品質をチェックする。v3.0.0では、`/kiro:validate-impl`（および Skills モードの `/kiro-validate-impl`）は**インテグレーション検証**（タスク横断の整合性チェック）に焦点が移り、個別タスクの検証はレビューア Subagent が担当する。
8. **進捗追跡 (Status Tracking)**: `/kiro:spec-status <feature>` コマンドが、各開発フェーズの承認状況と未完了のタスクを要約して表示する。

> すべてのフェーズは、開発者によるレビューのために一旦停止する。`-y` オプションや `--auto` フラグでこの確認をスキップすることも可能だが、本番環境向けの作業では手動での承認プロセスを維持することが推奨される。テンプレートにチェックリストを埋め込んでおくことで、一貫した品質ゲートを毎回強制することができる。

## コマンドと成果物の対応

| コマンド | 役割 | 主な成果物 |
| --- | --- | --- |
| `/kiro:steering` | プロジェクトメモリ生成 | `.kiro/steering/*.md` |
| `/kiro:steering-custom` | ドメイン固有のステアリング情報追加 | `.kiro/steering/custom/*.md` |
| `/kiro-discovery` (Skills) | 新しい仕事の入口（任意） | `brief.md` / `roadmap.md` と次のアクション |
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

`--claude-skills`、`--codex-skills`、`--cursor-skills`、`--copilot-skills`、`--windsurf-skills`、`--opencode-skills`、`--gemini-skills`、`--antigravity` でインストールした場合、コマンド（`/kiro:*`）の代わりに **Skills**（`/kiro-*`）を使用する。Skills モードでは、外部プラグインに依存せず、各プラットフォーム標準の subagent primitive のみで動作する。Skills モードの完全なリファレンス（`/kiro-impl` の subagent flow、カスタマイズ方法を含む）は [スキルリファレンス](skill-reference.md) を参照。

### コマンドモードと Skills モードの対応

| コマンドモード | Skills モード | 備考 |
| --- | --- | --- |
| （なし） | `/kiro-discovery` | 任意。新しい依頼を 1 spec / 複数 spec / mixed decomposition / spec不要 に振り分ける |
| `/kiro:spec-impl <feature> <task-ids>` | `/kiro-impl` | 自律モード/マニュアルモードの切り替えが可能 |
| `/kiro:validate-impl` | `/kiro-validate-impl` | インテグレーション検証（タスク横断）に特化 |

> その他の Steering、spec-init、spec-requirements、spec-design、spec-tasks の各コマンドは、コマンドモードと Skills モードで共通である。

### `/kiro-impl` の2つのモード

- **自律モード（タスク引数なし）**: タスクごとに Subagent を spawn し、独立した実装とレビューを行う。各タスクについて、実装者 Subagent がタスクブリーフ（Task Brief: 仕様から導出された具体的な受け入れ基準）を作成してからコーディングに入る。レビューア Subagent は、TODO 残存チェック、テスト実行、git diff による境界確認などの機械的な検証を行う。実装者が BLOCKED を返した場合やレビューアが2回連続で REJECTED した場合、**デバッグ Subagent** が新しいコンテキストで起動し、Web検索を使って根本原因を調査する（最大2ラウンド）。タスク間で得られた知見は **Implementation Notes** として次の実装者に引き継がれる。1タスク1イテレーションの規律により、長時間実行時のコンテキスト衛生を維持する。
- **マニュアルモード（タスク引数あり）**: メインコンテキスト内で TDD ベースの実装を行う。コマンドモードの `/kiro:spec-impl` と同等の動作である。

### セッション再開

`/kiro-impl` は中断後の再実行に対応している。`tasks.md` の進捗状態に基づいて未完了タスクから処理を再開する。

## Discovery の後

`/kiro-discovery` は auto-runner ではなく router である。新しい依頼が、1 spec、複数 spec、mixed decomposition、spec 不要のどれに当たるかを判断し、必要なら `brief.md` / `roadmap.md` を書き、正しい次コマンドを示して止まる。

| Discovery の結果 | 意味 | 既定の次ステップ | 補足 |
| --- | --- | --- | --- |
| Existing spec | 既存 spec に入るべき依頼 | `/kiro-spec-requirements {feature}` | なし |
| Spec 不要 | 直接実装した方がよい小変更 | 直接実装 | なし |
| Single spec | 1つの新規 spec にすべき依頼 | `/kiro-spec-init <feature>` | 明示的に fast path を取りたいときだけ `/kiro-spec-quick <feature>` |
| Multi-spec | 複数 spec に分割すべき依頼 | `/kiro-spec-batch` | 最初の 1 spec だけ先に確認したいなら `/kiro-spec-init <first-feature>` |
| Mixed decomposition | 既存 spec 更新・新規 spec・直接実装候補が混在する依頼 | `brief.md` / `roadmap.md` に分解結果を書いてから進む | 新規 spec 側の次ステップから始め、残りは順に回収する |

## 複数 spec にまたがる不具合の責務と再検証

ある spec で症状が見えていても、真因が upstream、foundation、shared spec 側にあることは珍しくない。その場合は downstream spec に回避策を積まず、まず責務を持つ upstream spec を修正するべきである。

upstream 修正後は、その変更に依存している spec を対象に `/kiro-validate-impl` と必要な runtime smoke を再実行し、システム全体として健全かを確認する。運用上は次を守る。

- failure が current spec の責務か、upstream spec の責務か、不明かを切り分ける
- upstream 起因の defect は downstream remediation に押し込まず、所有している spec に戻す
- 契約、配線、起動経路、共有インターフェースが upstream 修正に依存する downstream spec は再検証する

## ワークフローをカスタマイズするには

- **テンプレート**: `.kiro/settings/templates/{requirements,design,tasks}.md` を修正することで、各開発フェーズの生成物のアウトラインやチェックリストを、自社のプロセスに合わせて調整できる。v2.0.0の設計テンプレートは、要約テーブル、コンポーネント密度に関するルール、参考文献といった要素を備えており、レビュー担当者の認知負荷を軽減するよう設計されている。
- **ルール**: `.kiro/settings/rules/*.md` ファイルに、「すべきこと（DO）」「すべきでないこと（DO NOT）」や評価基準などを記述すると、それらはすべてのエージェントおよびコマンドで共通のガイドラインとして読み込まれる。旧バージョンのように、コマンドのプロンプトへ直接指示を記述する必要はない。
- **承認フロー**: テンプレートのヘッダー部分に、レビュー担当者（Reviewer）や承認者（Approver）の欄、チェックリスト、トレーサビリティを確保するためのカラムなどを追加することで、各品質ゲートでの確認事項を単一のドキュメントに集約できる。

## 新規案件 vs 既存案件

- **新規プロジェクト (Greenfield)**: 共有すべきルールや原則が既に存在する場合は、`/kiro:steering`（や`/kiro:steering-custom`）を実行してプロジェクトメモリに保存する。まだルールが整備されていない場合は、まず `/kiro:spec-init` で開発を開始し、プロセスを進めながら徐々にステアリング情報を充実させていくのがよい。
- **既存プロジェクト (Brownfield)**: `/kiro:validate-gap`、`/kiro:spec-requirements`、`/kiro:spec-design` の順でプロセスを進めることで、既存コードとの整合性を早期に確認できる。設計テンプレート内の要件カバレッジ（Req Coverage）や参考文献（Supporting References）セクションが、既存の仕様書との関連性を担保する役割を果たす。

## 関連リソース

- [Docs README](../README.md)
- [スキルリファレンス](skill-reference.md)
- [コマンドリファレンス](command-reference.md)
- [Claude Code Subagents ワークフロー](claude-subagents.md)

このガイドはv3.0.0時点の内容に基づいている。テンプレートやコマンドの動作に変更があった場合は、公式の英語版ドキュメント `docs/guides/spec-driven.md` を正とし、それに追従する形で本ドキュメントも更新する必要がある。
