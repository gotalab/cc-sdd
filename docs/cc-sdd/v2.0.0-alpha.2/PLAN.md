# SubAgents化実装計画書

**作成日**: 2025-10-13
**目的**: Kiro Spec-Driven Development WorkflowのSubAgents化によるトークン消費削減
**目標**: 現在のワークフロー指示を完全に維持しながら、トークン消費を65%削減

---

## 📊 現状分析

### トークン消費の問題点

| 問題 | 影響 | 深刻度 |
|------|------|--------|
| Steering全体を各コマンドで重複読み込み | 5K tokens × N回 | 🔴 高 |
| 長大なシステムプロンプト（200-300行/コマンド） | メインコンテキスト累積 | 🔴 高 |
| フェーズ間の不要な情報保持 | Requirements → Design → Tasksで累積 | 🟡 中 |
| 単一コンテキストでの実行 | 24K+ tokens常駐 | 🔴 高 |

### 既存Slash Commands構成

```
.claude/commands/kiro/
├── steering.md              # Bootstrap/Sync steering files
├── steering-custom.md       # Create domain-specific steering
├── spec-init.md             # Initialize spec structure
├── spec-requirements.md     # Generate EARS requirements
├── spec-design.md           # Generate technical design
├── spec-tasks.md            # Generate implementation tasks
├── spec-impl.md             # Execute TDD implementation
├── spec-status.md           # Show progress report
├── validate-gap.md          # Analyze implementation gap
├── validate-design.md       # Interactive design review
└── validate-impl.md         # Validate implementation
```

**各コマンドの共通構造**:
- `<background_information>`: Mission, Success Criteria
- `<instructions>`: Execution Steps, Constraints
- Tool Guidance, Output Description, Safety & Fallback

---

## 🎯 SubAgents化アーキテクチャ

### 設計原則

1. **コンテキスト分離**: 各SubAgentは独立したコンテキストで実行
2. **ファイルパス渡し**: 静的埋め込みではなく、SubAgentが動的にファイル読み込み
3. **指示の忠実な再現**: 既存コマンドの`<instructions>`を**ほぼそのまま**移植（過剰な詳細化禁止）
4. **薄いオーケストレーター**: Slash Commandは引数解析とSubAgent呼び出しのみ
5. **シンプルなディレクトリ構造**: `.claude/agents/kiro/`配下に全SubAgentファイルを集約

**⚠️ 重要: SubAgent作成時の注意事項**
- ❌ **してはいけないこと**: 元の指示を「詳細化」「説明追加」「改善」すること
- ✅ **すべきこと**: 元の指示を「そのまま移植」し、最小限の変更のみ（File patterns expansion）
- ❌ **SubAgentに含めてはいけないもの**: "Next Phase Guidance"（ユーザー向け情報はSlash Commandへ）
- 🎯 **目標**: 元のコマンドの行数の1.5倍以内（100行の指示 → SubAgentは150行以内）

### ワークフロー理解

**重要**: 実装順序 ≠ 実行順序

**実装順序（このPLAN.md）**: シンプルなSubAgentから複雑なSubAgentへ
- Phase 1: 基盤SubAgents（init, requirements, tasks）
- Phase 2: 複雑なSubAgents（design, impl）
- Phase 3: Validation SubAgents

**実行順序（ユーザー視点）**: Spec-Driven Developmentワークフロー
```
Phase 0 (Optional, Project setup)
  /kiro:steering
  /kiro:steering-custom

Phase 1 (Specification)
  /kiro:spec-init → /kiro:spec-requirements
    → [Optional] /kiro:validate-gap
    → /kiro:spec-design
    → [Optional] /kiro:validate-design
    → /kiro:spec-tasks

Phase 2 (Implementation)
  /kiro:spec-impl
    → [Optional] /kiro:validate-impl

Anytime
  /kiro:spec-status
```

### 2層アーキテクチャ

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: Slash Commands (Thin Orchestrators)          │
│                                                        │
│ Responsibilities:                                      │
│ - 引数解析とバリデーション                                │
│ - ファイルパスパターンの指定（Glob実行はしない）             │
│ - SubAgent呼び出し（Task tool使用）                      │
│ - 結果サマリーの整形                                     │
│ - 次ステップのガイダンス表示                              │
│                                                        │
│ Size: 15-30行/コマンド（従来の200-300行から大幅削減）      │
│                                                        │
│ ⚠️ 重要: Glob実行やファイル読み込みは行わない               │
│   → メインOrchestratorのコンテキスト汚染を防止            │
└────────────────────────────────────────────────────────┘
                         ↓ invokes
┌────────────────────────────────────────────────────────┐
│ Layer 2: SubAgents (Specialized Executors)            │
│                                                        │
│ System Prompt (80-120行):                              │
│ - Role定義とCore Mission                               │
│ - 詳細な実行ロジック（既存<instructions>を完全移植）        │
│ - Tool使用ガイドライン                                   │
│ - エラーハンドリング詳細                                  │
│ - Output Requirements                                  │
│                                                        │
│ Task Prompt (from Slash Command, シンプル):             │
│ - Feature name, Spec directory                         │
│ - File path patterns (NOT expanded lists)              │
│   例: ".kiro/steering/*.md" (パターンのみ)               │
│                                                        │
│ Execution:                                             │
│ - Glob()でパターンからファイルリストを展開                  │
│ - Read()で必要なファイルを順次読み込み                     │
│ - System Promptの実行ロジックに従って処理                 │
│ - Write/Edit/Bashで成果物生成                           │
│ - 完了後、コンテキスト破棄                                │
│                                                        │
│ ✅ SubAgentが自律的にファイル探索・読み込みを実行           │
└────────────────────────────────────────────────────────┘
```

---

## 🗂️ SubAgents設計詳細

### SubAgent一覧

| SubAgent名 | 目的 | Tools | 優先度 |
|-----------|------|-------|--------|
| `spec-requirements-agent` | Requirements生成 | Read, Write, Edit, Glob, WebSearch, WebFetch | P1 |
| `spec-design-agent` | Design生成 | Read, Write, Edit, Grep, Glob, WebSearch, WebFetch | P1 |
| `spec-tasks-agent` | Tasks生成 | Read, Write, Edit, Grep, Glob | P1 |
| `spec-impl-agent` | TDD実装 | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch | P1 |
| `validate-gap-agent` | Gap分析 | Read, Grep, Glob, WebSearch, WebFetch | P2 |
| `validate-design-agent` | Design review | Read, Grep, Glob | P2 |
| `validate-impl-agent` | Implementation検証 | Read, Bash, Grep, Glob | P2 |
| `steering-agent` | Steering bootstrap/sync | Read, Write, Edit, Glob, Grep, Bash | P2 |
| `steering-custom-agent` | Custom steering作成 | Read, Write, Edit, Glob, Grep, Bash | P3 |

**SubAgents化しないコマンド**:
- `spec-init.md`: シンプルすぎてSubAgents化の利点なし（template読み込みのみ、約800 tokens）
- `spec-status.md`: 軽量な読み込み処理のみ、SubAgents化のオーバーヘッドの方が大きい

**設計判断**: SubAgents化は「Steeringを含む大量のコンテキスト読み込み」または「複雑な実行ロジック」がある場合のみ適用

---

## 📋 実装ロードマップ

### Phase 0: 準備（Day 1）

- [x] **0.1 ディレクトリ構造作成**
  ```bash
  mkdir -p .claude/agents/kiro
  ```

  **ディレクトリ構造**:
  ```
  .claude/
  ├── commands/kiro/          # Slash Commands (薄いオーケストレーター)
  └── agents/kiro/            # SubAgents（全Agent定義を集約）
      ├── spec-requirements.md
      ├── spec-design.md
      ├── spec-tasks.md
      ├── spec-impl.md
      ├── validate-gap.md
      ├── validate-design.md
      ├── validate-impl.md
      ├── steering.md
      └── steering-custom.md
  ```

  **設計判断**:
  - 1ファイル = 1 SubAgent（System Prompt定義）
  - 別途config JSON不要（Claude Code `/agents`コマンドで自動生成）
  - `kiro/`配下に集約して管理容易性向上

- [x] **0.2 SubAgentファイルテンプレート作成**
  - `.claude/agents/kiro/_TEMPLATE.md`
  - YAML frontmatter + System Prompt形式
  - 全SubAgentで共通の構造を定義

  **作成方法**:
  - 直接ファイル作成
    - YAML frontmatterを手動記述
    - System Promptを既存commandsから移植
    - テンプレートに従って一貫性のある構造で作成

- [x] **0.3 ドキュメント準備**
  - 本PLAN.mdの配置 ✅
  - Migration Guide作成（Phase 6で実施予定）

**完了条件**: ディレクトリ構造とテンプレートが準備完了 ✅

---

### Phase 1: 基盤SubAgents実装（Day 2-3）

**優先順序**: spec-requirements → spec-tasks → spec-design（複雑度順）

**注意**: spec-initはSubAgents化しない（シンプルすぎて利点なし、そのまま維持）

#### 1.1 spec-requirements-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/spec-requirements.md`)

  **YAML frontmatter**:
  ```yaml
  name: spec-requirements-agent
  description: Generate comprehensive EARS-format requirements based on project description and steering context
  tools: Read, Write, Edit, WebSearch, WebFetch
  model: inherit
  ```

  **System Prompt**:
  - Role: EARS形式Requirements生成専門
  - Mission: Testable requirementsをSteering context基に作成
  - 既存`.claude/commands/kiro/spec-requirements.md`の`<instructions>`を**完全移植**:
    - EARS format適用（WHEN-IF-THEN構造）
    - Glob実行でSteering全体を動的に読み込み
    - Requirements template使用
    - Metadata更新ロジック
    - WebSearch/WebFetchでドメイン知識補完
  - 詳細な実行ロジックを含む（80-120行のSystem Prompt）

- [x] **Slash Command簡素化** (`.claude/commands/kiro/spec-requirements.md`)
  - 引数解析: `$1` → feature name
  - バリデーション: `.kiro/specs/$1/` 存在確認
  - ファイルパスパターンの指定（**Glob実行はSubAgent側で行う**）:
    ```markdown
    Task(
      subagent_type="spec-requirements-agent",
      prompt="""
      Feature: $1
      Spec directory: .kiro/specs/$1/

      File patterns to read:
      - .kiro/specs/$1/spec.json
      - .kiro/specs/$1/requirements.md
      - .kiro/steering/*.md
      - .kiro/settings/rules/ears-format.md
      - .kiro/settings/templates/specs/requirements.md

      Mode: generate
      """
    )
    ```
  - **重要**: ファイルリストを展開せず、パターンのみ渡す

- [ ] **テスト実行** (Phase 5で実施)
  - `/kiro:spec-requirements test-feature`
  - EARS形式検証
  - Metadata更新確認

**完了条件**: spec-requirements-agentが従来の出力と同等の品質 ✅ (テスト保留)

---

#### 1.2 spec-tasks-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/spec-tasks.md`)

  **YAML frontmatter**:
  ```yaml
  name: spec-tasks-agent
  description: Generate implementation tasks from requirements and design
  tools: Read, Write, Edit, Grep, Glob
  model: inherit
  ```

  **System Prompt**:
  - Role: 実装タスク生成専門
  - Mission: Requirements/Designからactionable tasks作成
  - 既存spec-tasks.mdの`<instructions>`を**完全移植**:
    - Tasks generation rules適用
    - Glob実行でSteering読み込み
    - 自然言語記述（コード構造詳細を避ける）
    - Sequential numbering enforcement
    - Requirements coverage check

- [x] **Slash Command簡素化** (`.claude/commands/kiro/spec-tasks.md`)
  - 引数解析: `$1` (feature), `$2` (optional `-y` flag)
  - バリデーション: design.md approved確認
  - ファイルパスパターンの指定:
    ```markdown
    Task(
      subagent_type="spec-tasks-agent",
      prompt="""
      Feature: $1
      Spec directory: .kiro/specs/$1/
      Auto-approve: {true/false based on -y flag}

      File patterns to read:
      - .kiro/specs/$1/*.{json,md}
      - .kiro/steering/*.md
      - .kiro/settings/rules/tasks-generation.md
      - .kiro/settings/templates/specs/tasks.md

      Mode: {generate or merge}
      """
    )
    ```

- [ ] **テスト実行** (Phase 5で実施)
  - `/kiro:spec-tasks test-feature -y`
  - Task numbering検証
  - Requirements mapping確認

**完了条件**: spec-tasks-agentが従来のタスク生成品質を維持 ✅ (テスト保留)

---

### Phase 2: 複雑なSubAgents実装（Day 4-5）

#### 2.1 spec-design-agent

**複雑性**: Discovery process含む（full/light/minimal）、最も複雑なSubAgent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/spec-design.md`)

  **YAML frontmatter**:
  ```yaml
  name: spec-design-agent
  description: Generate comprehensive technical design translating requirements (WHAT) into architecture (HOW) with discovery process
  tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch
  model: inherit
  ```

  **System Prompt**:
  - Role: Technical design生成専門
  - Mission: Requirements (WHAT) → Architecture (HOW)
  - 既存`.claude/commands/kiro/spec-design.md`の`<instructions>`を**完全移植**:
    - Discovery分類ロジック（New/Extension/Simple/Complex）
    - Discovery実行（design-discovery-full.md / light.md）
    - Glob実行でSteering、既存コード読み込み
    - WebSearch/WebFetch使用タイミング（外部API、ライブラリ調査）
    - Type safety enforcement
    - Visual diagram生成指示
    - Design template準拠
  - 最も詳細なSystem Prompt（100-150行）

- [x] **Slash Command簡素化** (`.claude/commands/kiro/spec-design.md`)
  - 引数解析: `$1` (feature), `$2` (optional `-y` flag)
  - バリデーション: requirements.md approved確認
  - ファイルパスパターンの指定:
    ```markdown
    Task(
      subagent_type="spec-design-agent",
      prompt="""
      Feature: $1
      Spec directory: .kiro/specs/$1/
      Auto-approve: {true/false based on -y flag}

      File patterns to read:
      - .kiro/specs/$1/*.{json,md}
      - .kiro/steering/*.md
      - .kiro/settings/rules/design-*.md
      - .kiro/settings/templates/specs/design.md

      Discovery: auto-detect based on requirements
      Mode: {generate or merge}
      """
    )
    ```

- [ ] **テスト実行** (Phase 5で実施)
  - Simple feature: Discovery minimal
  - Complex feature: Discovery full（WebSearch含む）

**完了条件**: Design品質が従来と同等、Discovery適切に実行 ✅ (テスト保留)

---

#### 2.2 spec-impl-agent

**複雑性**: TDD cycle、全ツールアクセス、タスク選択ロジック

- [x] **SubAgent定義作成** (`.claude/agents/kiro/spec-impl.md`)

  **YAML frontmatter**:
  ```yaml
  name: spec-impl-agent
  description: Execute implementation tasks using Test-Driven Development methodology
  tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
  model: inherit
  ```

  **System Prompt**:
  - Role: TDD実装専門エージェント
  - Mission: RED → GREEN → REFACTOR → VERIFY cycle
  - Tools: 実装に必要なすべてのツール（制限なし）
  - 既存`.claude/commands/kiro/spec-impl.md`の`<instructions>`を**完全移植**:
    - Glob実行でSteering読み込み
    - TDD cycle詳細（Kent Beck方式）
    - Test-first enforcement（コードより先にテスト）
    - Checkbox更新（`- [ ]` → `- [x]`）
    - No regressions確認（既存テストが通る）
  - System Prompt（100-120行）

- [x] **Slash Command簡素化** (`.claude/commands/kiro/spec-impl.md`)
  - 引数解析: `$1` (feature), `$2` (task numbers, optional)
  - Task selection logic（**Slash Command側で実行**）:
    - `$2` provided: Parse "1.1", "1,2,3"
    - `$2` empty: Read tasks.md and find `- [ ]` (unchecked)
  - ファイルパスパターンの指定:
    ```markdown
    Task(
      subagent_type="spec-impl-agent",
      prompt="""
      Feature: $1
      Spec directory: .kiro/specs/$1/
      Target tasks: {parsed task numbers or "all pending"}

      File patterns to read:
      - .kiro/specs/$1/*.{json,md}
      - .kiro/steering/*.md

      TDD Mode: strict (test-first)
      """
    )
    ```
  - **注意**: Task selectionはSlash Command側で行い、結果をSubAgentに渡す

- [ ] **テスト実行** (Phase 5で実施)
  - Single task: `/kiro:spec-impl test-feature 1.1`
  - Multiple tasks: `/kiro:spec-impl test-feature 1.1,1.2`
  - All pending: `/kiro:spec-impl test-feature`

**完了条件**: TDD実装が正常動作、tests pass、checkbox更新 ✅ (テスト保留)

---

### Phase 3: Validation SubAgents実装（Day 6）

#### 3.1 validate-gap-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/validate-gap.md`)
  - Role: 既存コードベースとの差分分析
  - Mission: Requirements vs Current codebase gap
  - Tools: Read, Grep, Glob, WebSearch, WebFetch
  - 既存validate-gap.mdの指示:
    - Gap analysis framework適用
    - Multiple implementation approaches提示
    - Research needs identification

- [x] **Slash Command簡素化** (`.claude/commands/kiro/validate-gap.md`)
  - ファイルパスリスト:
    - Spec: `spec.json`, `requirements.md`
    - Steering: `*.md` (Glob)
    - Rules: `.kiro/settings/rules/gap-analysis.md`

- [ ] **テスト実行** (Phase 5で実施)
  - Brownfield project検証

**完了条件**: Gap分析が既存コードベースを正確に評価 ✅ (テスト保留)

---

#### 3.2 validate-design-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/validate-design.md`)
  - Role: Interactive design quality review
  - Mission: GO/NO-GO decision with critical issues (max 3)
  - Tools: Read, Grep, Glob
  - 既存validate-design.mdの指示:
    - Design review framework適用
    - Maximum 3 critical issues
    - Balanced assessment（strengths + weaknesses）
    - Interactive dialogue

- [x] **Slash Command簡素化** (`.claude/commands/kiro/validate-design.md`)
  - ファイルパスリスト:
    - Spec: `spec.json`, `requirements.md`, `design.md`
    - Steering: `*.md` (Glob)
    - Rules: `.kiro/settings/rules/design-review.md`

- [ ] **テスト実行** (Phase 5で実施)
  - Design品質チェック、GO/NO-GO判定

**完了条件**: Interactive reviewが機能、適切な判定 ✅ (テスト保留)

---

#### 3.3 validate-impl-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/validate-impl.md`)
  - Role: Implementation validation
  - Mission: Verify alignment (Requirements, Design, Tasks)
  - Tools: Read, Bash, Grep, Glob
  - 既存validate-impl.mdの指示:
    - Conversation history parsing（`/kiro:spec-impl`検出）
    - Auto-detection logic
    - Test coverage check
    - Requirements traceability
    - Design alignment verification
    - Regression check

- [x] **Slash Command簡素化** (`.claude/commands/kiro/validate-impl.md`)
  - 引数解析: `$1` (feature, optional), `$2` (tasks, optional)
  - Auto-detection:
    - Parse conversation history for `/kiro:spec-impl` calls
    - OR scan `.kiro/specs/*/tasks.md` for `[x]` checkboxes
  - ファイルパスリスト:
    - Spec: `spec.json`, `requirements.md`, `design.md`, `tasks.md`
    - Steering: `*.md` (Glob)

- [ ] **テスト実行** (Phase 5で実施)
  - Auto-detection mode: `/kiro:validate-impl`
  - Explicit mode: `/kiro:validate-impl test-feature 1.1,1.2`

**完了条件**: Implementation検証が正確、traceability確認 ✅ (テスト保留)

---

### Phase 4: Steering SubAgents実装（Day 7）

#### 4.1 steering-agent

**複雑性**: Bootstrap/Sync dual mode、JIT analysis

- [x] **SubAgent定義作成** (`.claude/agents/kiro/steering.md`)
  - Role: Steering bootstrap/sync専門
  - Mission: Project memory maintenance
  - Tools: Read, Write, Edit, Glob, Grep, Bash
  - 既存steering.mdの指示:
    - Mode detection（Bootstrap vs Sync）
    - JIT codebase analysis strategy
    - Pattern extraction（not exhaustive lists）
    - Steering principles適用
    - Additive update philosophy

- [x] **Slash Command簡素化** (`.claude/commands/kiro/steering.md`)
  - Mode detection logic（Slash Command側で実行）
  - ファイルパスリスト:
    - Templates: `.kiro/settings/templates/steering/*.md`
    - Rules: `.kiro/settings/rules/steering-principles.md`
    - Existing steering: `.kiro/steering/*.md` (Sync mode)

- [ ] **テスト実行** (Phase 5で実施)
  - Bootstrap mode: Empty `.kiro/steering/`
  - Sync mode: Existing steering with code changes

**完了条件**: Steering生成/更新が適切、patterns重視 ✅ (テスト保留)

---

#### 4.2 steering-custom-agent

- [x] **SubAgent定義作成** (`.claude/agents/kiro/steering-custom.md`)
  - Role: Custom steering作成
  - Mission: Domain-specific project memory
  - Tools: Read, Write, Edit, Glob, Grep, Bash
  - 既存steering-custom.mdの指示:
    - Interactive workflow（ユーザーに質問）
    - Template selection logic
    - JIT codebase analysis
    - Steering principles適用

- [x] **Slash Command簡素化** (`.claude/commands/kiro/steering-custom.md`)
  - ファイルパスリスト:
    - Templates: `.kiro/settings/templates/steering-custom/*.md`
    - Rules: `.kiro/settings/rules/steering-principles.md`

- [ ] **テスト実行** (Phase 5で実施)
  - Create api-standards.md
  - Create testing.md

**完了条件**: Custom steering作成が適切、template活用 ✅ (テスト保留)

---

### Phase 5: テストと最適化（Day 8-9）

#### 5.1 E2Eワークフローテスト

- [ ] **Full workflow実行**
  ```bash
  /kiro:spec-init "User authentication with JWT"
  /kiro:spec-requirements user-auth
  /kiro:validate-gap user-auth  # Optional
  /kiro:spec-design user-auth -y
  /kiro:validate-design user-auth  # Optional
  /kiro:spec-tasks user-auth -y
  /kiro:spec-impl user-auth 1.1
  /kiro:validate-impl user-auth 1.1
  /kiro:spec-status user-auth
  ```

- [ ] **各フェーズで検証**:
  - [ ] 成果物の品質（従来と同等か）
  - [ ] Metadata更新の正確性
  - [ ] Approval workflow動作
  - [ ] Error handling適切性

- [ ] **トークン消費測定**:
  - [ ] Before（現在のSlash Commands）
  - [ ] After（SubAgents化後）
  - [ ] フェーズごとの内訳記録

**完了条件**: 全ワークフローが正常動作、トークン削減確認

---

#### 5.2 エッジケーステスト

- [ ] **エラーシナリオ**:
  - [ ] Missing templates
  - [ ] Unapproved phase transitions
  - [ ] Invalid feature names
  - [ ] Empty steering directory

- [ ] **複雑なシナリオ**:
  - [ ] Multiple features parallel
  - [ ] Merge mode（既存design.md/tasks.md）
  - [ ] Custom steering with multiple templates

- [ ] **Rollback test**:
  - [ ] SubAgents失敗時のクリーンアップ
  - [ ] Partial completion handling

**完了条件**: Edge casesが適切にハンドリング

---

#### 5.3 パフォーマンス最適化

- [ ] **ファイル読み込み最適化**:
  - [ ] Steering filesのGlobキャッシュ
  - [ ] 不要なファイル読み込み削減

- [ ] **System Prompt最適化**:
  - [ ] 冗長な説明削減
  - [ ] 必須情報のみ保持

- [ ] **Prompt structure最適化**:
  - [ ] Task prompt構造の標準化
  - [ ] File paths list formatting統一

**完了条件**: トークン消費が目標値（65%削減）達成

---

### Phase 6: ドキュメントと移行（Day 10）

#### 6.1 ドキュメント作成

- [ ] **MIGRATION.md**:
  - [ ] Before/After比較
  - [ ] 移行手順（既存プロジェクト向け）
  - [ ] Breaking changesの有無
  - [ ] Troubleshooting

- [ ] **ARCHITECTURE.md**:
  - [ ] SubAgentsアーキテクチャ図
  - [ ] Data flow説明
  - [ ] ファイルパス渡しの仕組み
  - [ ] デバッグ方法

- [ ] **CLAUDE.md更新**:
  - [ ] SubAgents化の説明追加
  - [ ] Workflow変更点（あれば）

**完了条件**: ドキュメントが完備、ユーザーが理解可能

---

#### 6.2 後方互換性確認

- [ ] **既存プロジェクトでテスト**:
  - [ ] 既存`.kiro/specs/`をそのまま使用
  - [ ] Steering filesが正常読み込み
  - [ ] Metadata formatが互換

- [ ] **Fallback確認**:
  - [ ] SubAgents利用不可時の挙動
  - [ ] Error messageの明確性

**完了条件**: 既存プロジェクトがそのまま動作

---

## 📐 技術仕様

### ディレクトリ構造（確定版）

```
.claude/
├── commands/kiro/              # Slash Commands（薄いオーケストレーター）
│   ├── spec-init.md            # SubAgents化しない（シンプルすぎ）
│   ├── spec-requirements.md    # SubAgent呼び出しのみ
│   ├── spec-design.md          # SubAgent呼び出しのみ
│   ├── spec-tasks.md           # SubAgent呼び出しのみ
│   ├── spec-impl.md            # SubAgent呼び出しのみ
│   ├── spec-status.md          # SubAgents化しない（軽量処理）
│   ├── validate-gap.md         # SubAgent呼び出しのみ
│   ├── validate-design.md      # SubAgent呼び出しのみ
│   ├── validate-impl.md        # SubAgent呼び出しのみ
│   ├── steering.md             # SubAgent呼び出しのみ
│   └── steering-custom.md      # SubAgent呼び出しのみ
│
└── agents/kiro/                # SubAgents（System Prompt定義）
    ├── _TEMPLATE.md            # SubAgent作成テンプレート
    ├── spec-requirements.md    # 80-100行
    ├── spec-design.md          # 100-150行（最も複雑）
    ├── spec-tasks.md           # 80-100行
    ├── spec-impl.md            # 100-120行
    ├── validate-gap.md         # 60-80行
    ├── validate-design.md      # 60-80行
    ├── validate-impl.md        # 80-100行
    ├── steering.md             # 80-100行
    └── steering-custom.md      # 80-100行
```

**設計判断**:
- `.claude/agents/kiro/`配下に全SubAgentを集約
  - 公式では`.claude/agents/`直下も可能だが、kiroプロジェクト専用namespace化
  - 複数のSubAgent群を管理する場合にスケーラブル
- 1ファイル = 1 SubAgent（Markdown with YAML frontmatter形式）
- 別途JSON config不要（Markdown with YAML frontmatterで完結）
- `commands/kiro/`と`agents/kiro/`で対応が明確

**公式ドキュメント準拠**:
- ✅ Markdown with YAML frontmatter形式
- ✅ `name`, `description`, `tools`, `model`フィールド
- ✅ Project-level配置（`.claude/agents/`配下）
- ✅ 直接ファイル作成による管理

---

### SubAgent定義ファイルテンプレート

**正式なフォーマット**: Markdown with YAML frontmatter

**YAML Frontmatter フィールド**:
- `name`: SubAgent名（lowercase, hyphen-separated、例: `spec-init-agent`）
- `description`: SubAgentの目的と呼び出しタイミング
- `tools`: 使用可能なツールリスト（カンマ区切り、オプショナル）
- `model`: 使用モデル（`inherit`, `sonnet`, `opus`, `haiku`、オプショナル）

**`.claude/agents/kiro/_TEMPLATE.md`**:

```markdown
---
name: agent-name-here
description: Brief description of when this subagent should be invoked
tools: Read, Write, Edit, Glob, Grep
model: inherit
---

# {Agent Name}

## Role
You are a specialized agent for {specific purpose}.

## Core Mission
{Copy <background_information> section from existing command EXACTLY}
- **Mission**: {from existing command}
- **Success Criteria**: {from existing command}

## Execution Protocol

You will receive task prompts containing:
- Feature name and spec directory path
- File path patterns (NOT expanded file lists)
- Mode or flags (if applicable)

### Step 0: Expand File Patterns (SubAgent-specific)

Use Glob tool to expand file patterns, then read all files:
- Glob(`.kiro/steering/*.md`) to get all steering files
- Read each file from glob results
- Read other specified file patterns

### Step 1-N: Core Task (from original instructions)

{Paste the ENTIRE <instructions> section from existing command VERBATIM}
{DO NOT modify, DO NOT add explanations, DO NOT "improve"}

## Core Task
{from existing command}

## Execution Steps
{from existing command - copy exactly}

## Important Constraints / Critical Constraints
{from existing command - copy exactly}

## Tool Guidance
{from existing command - copy exactly}

## Output Description
{from existing command - copy exactly}

## Safety & Fallback

### Error Scenarios
{Copy ONLY the "Error Scenarios" section from existing command}
{DO NOT include "Next Phase" guidance - that goes to Slash Command}

**Note**: You execute tasks autonomously. Return final report only when complete.
```

---

## ⚠️ SubAgent作成の鉄則

### DO (実施すべきこと)
1. ✅ 既存commandの`<background_information>`を**そのままコピー**
2. ✅ 既存commandの`<instructions>`を**そのままコピー**（見出しレベル調整のみ）
3. ✅ "Step 0: Expand File Patterns"を追加（これだけが新規追加）
4. ✅ `## Tool Guidance`を**そのままコピー**
5. ✅ `## Output Description`を**そのままコピー**
6. ✅ `## Safety & Fallback`の"Error Scenarios"のみコピー

### DON'T (絶対にしてはいけないこと)
1. ❌ 元の指示を「詳細化」「説明追加」「わかりやすく書き直し」
2. ❌ "Next Phase Guidance"をSubAgentに含める → **Slash Commandへ**
3. ❌ 新しいステップや説明を追加（File patterns以外）
4. ❌ 元の簡潔な記述を冗長に書き直す
5. ❌ SubAgentの行数が元のcommandの2倍を超える

### 品質チェック
- 📏 **行数チェック**: SubAgent ≤ 元のcommand × 1.5倍
- 🔍 **内容チェック**: 元の`<instructions>`がほぼそのまま存在するか
- ⚠️ **役割チェック**: "Next Phase"などユーザー向け情報がないか

---

### SubAgent実装例（spec-requirements-agent）

**正しい実装**: 元のcommandをほぼそのまま移植（99行）

**`.claude/agents/kiro/spec-requirements.md`** の完全な例:

```markdown
---
name: spec-requirements-agent
description: Generate EARS-format requirements based on project description and steering context
tools: Read, Write, Edit, Glob, WebSearch, WebFetch
model: inherit
---

# spec-requirements Agent

## Role
You are a specialized agent for generating comprehensive, testable requirements in EARS format based on the project description from spec initialization.

## Core Mission
- **Mission**: Generate comprehensive, testable requirements in EARS format based on the project description from spec initialization
- **Success Criteria**:
  - Create complete requirements document aligned with steering context
  - Use proper EARS syntax for all acceptance criteria
  - Focus on core functionality without implementation details
  - Update metadata to track generation status

## Execution Protocol

You will receive task prompts containing:
- Feature name and spec directory path
- File path patterns (NOT expanded file lists)
- Mode: generate

### Step 0: Expand File Patterns (SubAgent-specific)

Use Glob tool to expand file patterns, then read all files:
- Glob(`.kiro/steering/*.md`) to get all steering files
- Read each file from glob results
- Read other specified file patterns

### Step 1-4: Core Task (from original instructions)

## Core Task
Generate complete requirements for the feature based on the project description in requirements.md.

## Execution Steps

1. **Load Context**:
   - Read `.kiro/specs/{feature}/spec.json` for language and metadata
   - Read `.kiro/specs/{feature}/requirements.md` for project description
   - **Load ALL steering context**: Read entire `.kiro/steering/` directory including:
     - Default files: `structure.md`, `tech.md`, `product.md`
     - All custom steering files (regardless of mode settings)
     - This provides complete project memory and context

2. **Read Guidelines**:
   - Read `.kiro/settings/rules/ears-format.md` for EARS syntax rules
   - Read `.kiro/settings/templates/specs/requirements.md` for document structure

3. **Generate Requirements**:
   - Create initial requirements based on project description
   - Group related functionality into logical requirement areas
   - Apply EARS format to all acceptance criteria
   - Use language specified in spec.json

4. **Update Metadata**:
   - Set `phase: "requirements-generated"`
   - Set `approvals.requirements.generated: true`
   - Update `updated_at` timestamp

## Important Constraints
- Focus on WHAT, not HOW (no implementation details)
- All acceptance criteria MUST use proper EARS syntax
- Requirements must be testable and verifiable
- Choose appropriate subject for EARS statements (system/service name for software)
- Generate initial version first, then iterate with user feedback (no sequential questions upfront)

## Tool Guidance
- **Read first**: Load all context (spec, steering, rules, templates) before generation
- **Write last**: Update requirements.md only after complete generation
- Use **WebSearch/WebFetch** only if external domain knowledge needed

## Output Description
Provide output in the language specified in spec.json with:

1. **Generated Requirements Summary**: Brief overview of major requirement areas (3-5 bullets)
2. **Document Status**: Confirm requirements.md updated and spec.json metadata updated
3. **Next Steps**: Guide user on how to proceed (approve and continue, or modify)

**Format Requirements**:
- Use Markdown headings for clarity
- Include file paths in code blocks
- Keep summary concise (under 300 words)

## Safety & Fallback

### Error Scenarios
- **Missing Project Description**: If requirements.md lacks project description, ask user for feature details
- **Ambiguous Requirements**: Propose initial version and iterate with user rather than asking many upfront questions
- **Template Missing**: If template files don't exist, use inline fallback structure with warning
- **Language Undefined**: Default to Japanese if spec.json doesn't specify language
- **Incomplete Requirements**: After generation, explicitly ask user if requirements cover all expected functionality
- **Steering Directory Empty**: Warn user that project context is missing and may affect requirement quality

**Note**: You execute tasks autonomously. Return final report only when complete.
```

**実装のポイント**:
- ✅ 元のcommandから95行 → SubAgentは99行（1.04倍、許容範囲）
- ✅ `<instructions>`を**ほぼそのまま**移植
- ✅ 唯一の追加: "Step 0: Expand File Patterns"
- ✅ "Next Phase Guidance"はSlash Commandに移動
- ❌ 過剰な詳細化なし

---

### Slash Command簡素化テンプレート

**目標**: 15-25行/コマンド（従来の200-300行から大幅削減）

```markdown
---
description: {Original description}
---

# {Command Name}

## Parse Arguments
- Feature name: `$1`
- Optional flag/params: `$2`, `$3` (if applicable)

## Validate
- Check `.kiro/specs/$1/` exists
- Verify prerequisite phase (if applicable)

## Invoke SubAgent

Use Task tool with file path **patterns** (NOT expanded lists):

Task(
  subagent_type="{subagent-name}",
  description="{Short 3-5 word description}",
  prompt="""
Feature: $1
Spec directory: .kiro/specs/$1/
{Additional parameters like mode, flags}

File patterns to read:
- .kiro/specs/$1/*.{json,md}
- .kiro/steering/*.md
- .kiro/settings/rules/{specific-rules}.md
- .kiro/settings/templates/{specific-templates}.md

{Any task-specific instructions}
"""
)

## Display Result
- Show SubAgent summary
- Guide next step: `/kiro:{next-command} $1`

---

**Key Points**:
- ❌ NO Glob execution in Slash Command
- ❌ NO file reading in Slash Command
- ❌ NO detailed `<instructions>` in Slash Command
- ✅ Only argument parsing and validation
- ✅ Pass file path **patterns** to SubAgent
- ✅ SubAgent handles all file operations
```

**比較**:
- **Before**: 65行（spec-init.md）、200-300行（複雑なコマンド）
- **After**: 15-25行（すべてのコマンド）

---

## 🔍 トークン削減効果試算（修正版）

### Before（現在のSlash Commands）

| フェーズ | Slash Command | File Reads (Steering含む) | Total | 累積 |
|---------|---------------|-------------------------|-------|------|
| spec-init | 500 | 0.5K (Templates のみ) | 1K | 1K |
| spec-requirements | 3K | 8K | 11K | 12K |
| spec-design | 4K | 12K | 16K | 28K |
| spec-tasks | 2K | 8K | 10K | 38K |
| spec-impl (×3 tasks) | 3K × 3 | 10K × 3 | 39K | 77K |

**Total**: 約77K tokens（メインコンテキスト累積）

**問題点**:
- Steering filesを各フェーズで重複読み込み（5K × 4回 = 20K）
- 長大なシステムプロンプトが累積（200-300行/コマンド）
- フェーズ間で不要な情報保持

---

### After（SubAgents化、修正版）

| フェーズ | Main Context | SubAgent Context | SubAgent破棄後 | 累積 |
|---------|--------------|------------------|---------------|------|
| spec-init | 800 | - (SubAgents化しない) | - | 0.8K |
| spec-requirements | 200 | 11K | 破棄 | 1K |
| spec-design | 200 | 16K | 破棄 | 1.2K |
| spec-tasks | 200 | 10K | 破棄 | 1.4K |
| spec-impl (×3 tasks) | 200 × 3 | 13K × 3 | 破棄 × 3 | 2K |

**Total**: 約2K tokens（メインコンテキストのみ）

**削減率**: (77K - 2K) / 77K = **97.4%**（メインコンテキスト累積）

**実質的なトークン消費**:
- Before: 77K tokens（累積、再利用なし）
- After: 2K (Main累積) + 50K (SubAgents、逐次実行で破棄) = 52K tokens（ピーク時）
- 削減率: **32.5%**（ピーク時比較）

**主要な改善点**:
1. ✅ Steering重複読み込み削減: 20K → 0K（SubAgentで毎回破棄）
2. ✅ Slash Command簡素化: 200-300行 → 15-25行
3. ✅ メインコンテキスト累積: 77K → 2K（**97.4%削減**）
4. ✅ spec-initはそのまま維持（SubAgents化のオーバーヘッド回避）

---

## ⚠️ リスクと緩和策

### リスク1: SubAgent呼び出しオーバーヘッド

**リスク**: Task tool呼び出しのコスト増加

**緩和策**:
- System Promptを最小限に（30-50行）
- Task promptは構造化して重複削減

---

### リスク2: コンテキスト損失

**リスク**: ファイルパス渡しで内容が正しく伝わらない

**緩和策**:
- SubAgentにRead tool必須化
- Task promptに「Read all files before execution」明記
- Test phaseで内容検証

---

### リスク3: デバッグ困難性

**リスク**: SubAgent内部の動作が見えにくい

**緩和策**:
- SubAgentのSystem Promptに詳細ログ出力指示
- Task prompt構造を標準化
- Error時の具体的なfile path表示

---

### リスク4: 既存プロジェクトとの互換性

**リスク**: Metadata format変更が必要

**緩和策**:
- Metadata format変更なし（spec.json維持）
- 既存`.kiro/specs/`そのまま使用可能
- Migration不要の設計

---

## ✅ 完了基準

### 機能的完了

- [ ] 9 SubAgentsが実装完了（spec-init、spec-statusは除外）
- [ ] 全Slash Commandsが簡素化完了（15-25行/コマンド）
- [ ] E2Eワークフローが正常動作
- [ ] Edge casesが適切にハンドリング

### 品質的完了

- [ ] 成果物品質が従来と同等以上
- [ ] Error handling適切
- [ ] User experience維持（Slash Commandインターフェースは変更なし）

### パフォーマンス的完了

- [ ] メインコンテキスト累積削減: **97%以上達成**
- [ ] ピーク時トークン削減: **30%以上達成**
- [ ] 実行速度が従来と同等またはそれ以上
- [ ] SubAgent invocationオーバーヘッドが許容範囲内

### ドキュメント的完了

- [ ] MIGRATION.md作成（ユーザー向け）
- [ ] ARCHITECTURE.md作成（開発者向け）
- [ ] CLAUDE.md更新（SubAgents化の説明追加）
- [ ] 全SubAgentのSystem Prompt文書化
- [ ] 設計判断の記録（なぜspec-initを除外したか等）

---

## 📅 タイムライン

| Phase | 期間 | 作業量 | 依存関係 |
|-------|------|--------|---------|
| Phase 0 | Day 1 | 2h | なし |
| Phase 1 | Day 2-3 | 12h | Phase 0 |
| Phase 2 | Day 4-5 | 12h | Phase 1 |
| Phase 3 | Day 6 | 8h | Phase 1 |
| Phase 4 | Day 7 | 8h | Phase 1 |
| Phase 5 | Day 8-9 | 12h | Phase 1-4 |
| Phase 6 | Day 10 | 4h | Phase 5 |

**Total**: 10日間（約60時間）

---

## 🚀 次のアクション

### Immediate（今すぐ）

1. [ ] Phase 0実行: ディレクトリ構造作成
2. [ ] `spec-init-agent` System Prompt作成（Phase 1.1開始）
3. [ ] トークン計測ベースライン取得（Before測定）

### Short-term（1週間以内）

1. [ ] Phase 1完了（基盤SubAgents）
2. [ ] Phase 2開始（複雑なSubAgents）

### Mid-term（2週間以内）

1. [ ] Phase 5完了（E2Eテスト）
2. [ ] トークン削減効果検証

---

## 📊 進捗トラッキング

### Overall Progress

```
Phase 0: [ ] 0/3 tasks
Phase 1: [ ] 0/9 tasks (spec-requirements, spec-tasks, spec-design)
Phase 2: [ ] 0/6 tasks (spec-impl)
Phase 3: [ ] 0/9 tasks (validate-*)
Phase 4: [ ] 0/6 tasks (steering-*)
Phase 5: [ ] 0/9 tasks (testing)
Phase 6: [ ] 0/5 tasks (documentation)

Total: 0/47 tasks (0%)
```

### Token Reduction Target

```
Current:  ████████████████████ 77K tokens (100%)
Target:   ██░░░░░░░░░░░░░░░░░░ 2K tokens (3%)
Goal:     Achieve 97.4% main context reduction
         Achieve 32.5% peak usage reduction
```

---

## 📝 メモ・備考

### 設計判断の記録

1. **ファイルパスパターン vs ファイルパスリスト** ⭐ **修正済み**
   - 決定: ファイルパスパターンのみ渡す
   - 理由: Slash Command側でGlob実行するとメインコンテキスト汚染が発生
   - 実装: SubAgent側でGlob実行し、ファイルリストを展開
   - 効果: メインコンテキストの累積を最小化

2. **Slash Command簡素化 vs 完全置き換え**
   - 決定: Slash Command維持（薄いオーケストレーター化）
   - 理由: ユーザーインターフェース維持、引数解析の一元化

3. **System Prompt内容** ⭐ **修正済み**
   - 決定: 詳細な実行ロジックを含む（80-150行）
   - 理由: 既存`<instructions>`を完全移植、Task promptはシンプルに
   - 変更前: Role + Protocol のみ（30-50行）
   - 変更後: 完全な実行ロジック含む（指示の完全保持）

4. **spec-init.md / spec-status.md の扱い** ⭐ **新規判断**
   - 決定: SubAgents化しない
   - 理由:
     - spec-init: シンプルすぎ（Template 2つのみ）、SubAgents化でむしろトークン増加
     - spec-status: 軽量な読み込み処理のみ、SubAgent化の利点なし
   - 効果: 不要なオーバーヘッド回避

5. **指示の配置場所** ⭐ **修正済み**
   - 決定: SubAgent System Promptに詳細指示を配置
   - 理由: Slash Commandに残すとメインコンテキスト汚染
   - 実装: `<instructions>`全体をSubAgent System Promptに移植

6. **元の指示の忠実な再現** ⭐ **重要な教訓**
   - 問題: 初回実装で元の指示を「詳細化」「改善」して冗長化（197行→99行に修正）
   - 決定: 元の`<instructions>`を**ほぼそのまま移植**（見出しレベル調整のみ）
   - 理由:
     - 元の指示は既に適切な粒度で書かれている
     - 「詳細化」は不要な情報を追加し、SubAgentの判断を阻害する
     - "Next Phase Guidance"などユーザー向け情報はSlash Commandの役割
   - 実装:
     - ✅ `<background_information>` → そのままコピー
     - ✅ `<instructions>` → ほぼそのままコピー
     - ✅ 唯一の追加: "Step 0: Expand File Patterns"（SubAgents化のため必要）
     - ❌ 過剰な説明、詳細化、「改善」は禁止
   - 品質基準: SubAgent行数 ≤ 元のcommand × 1.5倍

7. **spec-quickコマンド** ⭐ **追加機能**
   - 決定: Interactive/Automatic両対応のquick generation追加
   - 目的: シンプルなfeatureの高速仕様生成
   - 実装:
     - SlashCommand toolでコマンド連鎖実行
     - spec-init → spec-requirements → spec-design -y → spec-tasks -y
     - SubAgentsは各コマンドで自動利用される
     - **引数パース**: `$ARGUMENTS`使用（`$1`, `$2`はスペースで分割されるため不適）
   - 2つのモード:
     - **Interactive Mode** (default): 各フェーズでユーザー確認プロンプト
       - 使用: `/kiro:spec-quick "description"`
       - ユーザーが "yes/no" で制御
     - **Automatic Mode** (--auto flag): 全フェーズ自動実行
       - 使用: `/kiro:spec-quick "description" --auto`
       - プロンプトなし、全自動
   - 適用シーン:
     - ✅ シンプルなCRUD、基本UIコンポーネント
     - ✅ プロトタイピング、proof-of-concept
     - ✅ 既知のパターン（新規性なし）
   - 不適用シーン:
     - ❌ 複雑な統合、セキュリティ機能
     - ❌ 外部API統合
     - ❌ Brownfield project（gap analysis必要）
   - トレードオフ:
     - 速度: 15分のフェーズ実行 → 単一コマンド
     - 品質: validation skip（gap analysis, design review）
     - Sequential実行のため、トークン累積問題は回避
   - 複雑性検知: キーワード検出で警告表示
     - "integration", "API", "payment", "auth", "security", "migration"

### 今後の拡張可能性

- **並列実行**: 独立したSubAgentsの並列起動
- **Caching**: Steering files読み込みキャッシュ
- **Template versioning**: SubAgent設定のバージョン管理
- **Custom SubAgents**: ユーザー独自のSubAgent追加機構

---

**Document Version**: 2.2
**Last Updated**: 2025-10-13
**Status**: Implementation Complete (Phase 0-4 + spec-quick)

**主要な変更（v2.0）**:
- ✅ コンテキスト重複問題の解決（ファイルパスパターン渡しに変更）
- ✅ spec-init / spec-status のSubAgents化を除外
- ✅ SubAgent System Promptに詳細ロジックを移植
- ✅ Slash Commandを15-25行に簡素化
- ✅ トークン削減試算を修正（97.4% main context削減）

**重要な教訓と修正（v2.1）**:
- ⚠️ **初回実装の問題**: 元の指示を「詳細化」「改善」して冗長化（spec-requirements: 197行）
- ✅ **修正**: 元の`<instructions>`を**ほぼそのまま移植**（99行、50%削減）
- 📋 **原則の明記**: "SubAgent作成の鉄則"セクションを追加
- 🎯 **品質基準**: SubAgent行数 ≤ 元のcommand × 1.5倍
- ⚠️ **禁止事項**: 過剰な詳細化、"Next Phase Guidance"のSubAgent含有

**新機能追加（v2.2）**:
- 🚀 **spec-quick追加**: Interactive/Automatic両対応の高速仕様生成
- ✅ **Phase 0-4完了**: 全9 SubAgents + 簡素化Slash Commands実装完了
- 📋 **設計判断記録**: spec-quickの適用シーンと制約を明示
