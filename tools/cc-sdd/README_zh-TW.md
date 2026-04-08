# cc-sdd: 面向 AI 程式代理的長時間規格驅動實作

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
<a href="./README.md">English</a> | <a href="./README_ja.md">日本語</a> | 繁體中文
</sub></div>

✨ **把已核准規格轉成長時間自律實作工作流。最小、易調整的 SDD harness。**

👻 **Kiro 相容** — Kiro IDE 的 Spec-Driven / AI-DLC 風格互通。既有 Kiro 規格可直接使用。

cc-sdd 把已核准規格轉成可執行工作流：需求 → 設計 → 任務 → 自律實作 + 對抗式審查 + 最終驗證。規格不是用來讀的文件，而是直接控制每個階段行為的機制。

**為什麼選 cc-sdd:**
- ✅ **規格可執行** — 每個 artifact（需求、設計、任務）直接控制下一階段。File Structure Plan 驅動任務邊界，Task Brief 驅動實作，git diff 驅動審查
- ✅ **長時間自律實作** — `/kiro-impl` 為每個任務執行 TDD (Feature Flag Protocol) + fresh implementer + 獨立審查者 + 失敗時自動 debug + 任務間知見傳遞。無外部依賴
- ✅ **從小需求到產品級規模都適用** — `/kiro-discovery` 是新工作入口，從單一功能到多個 spec 的大型 initiative 都能處理。`/kiro-spec-batch` 平行建立所有 spec + cross-spec 一致性驗證
- ✅ **自訂一次，隨模型進化調整** — 17 個 skills，共享規則為 single source of truth。團隊模板貼合批准流程。模型進化時可輕量化 harness

**為什麼 Agent Skills:**
- Skills 是按需載入的可組合單位（progressive disclosure）
- 同一套工作流適用於 Claude Code、Codex、Cursor、Copilot、Windsurf、OpenCode、Gemini CLI、Antigravity
- Skills 模式為推薦安裝 — 舊版命令模式將在未來移除

> 規格，從讀的文件變成執行的工具。

> 只想看安裝？跳到 [安裝](#-安裝)。若要維持 1.1.5，使用 `npx cc-sdd@1.1.5 --claude-code ...`；升級 v2.0.0 請參考 [Migration Guide](../../docs/guides/migration-guide.md) ｜ [日文版](../../docs/guides/ja/migration-guide.md)。

## 🚀 安裝

只需一個指令，即可為主要 AI 程式代理匯入 **AI-DLC（AI Driven Development Life Cycle）× SDD（Spec-Driven Development）** 工作流程。需求、設計、任務、指導文件與長時間實作迴圈也會同步建立，並對齊團隊既有批准流程。

```bash
# 基本安裝（預設：英文文件，Claude Code Skills 代理）
npx cc-sdd@latest

# 語言選項（預設：--lang en）
npx cc-sdd@latest --lang zh-TW # 繁體中文
npx cc-sdd@latest --lang ja    # 日語
npx cc-sdd@latest --lang es    # 西班牙語
...（支援語言：en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el）

# 代理選項（預設：claude-code-skills / --claude-skills）
# Skills 模式（建議）
npx cc-sdd@latest --claude-skills --lang zh-TW     # Claude Code Skills（預設，17 個技能）
npx cc-sdd@latest --codex-skills --lang zh-TW      # Codex CLI Skills（17 個技能）
npx cc-sdd@latest --cursor-skills --lang zh-TW     # Cursor IDE Skills（17 個技能）
npx cc-sdd@latest --copilot-skills --lang zh-TW    # GitHub Copilot Skills（17 個技能）
npx cc-sdd@latest --windsurf-skills --lang zh-TW   # Windsurf IDE Skills（17 個技能）
npx cc-sdd@latest --opencode-skills --lang zh-TW   # OpenCode Skills（17 個技能）
npx cc-sdd@latest --gemini-skills --lang zh-TW     # Gemini CLI Skills（17 個技能）
npx cc-sdd@latest --antigravity --lang zh-TW       # Antigravity Skills（17 個技能）
# 舊版模式（已棄用 — 將在未來版本移除）
npx cc-sdd@latest --claude --lang zh-TW        # 請改用 --claude-skills
npx cc-sdd@latest --cursor --lang zh-TW        # 請改用 --cursor-skills
npx cc-sdd@latest --copilot --lang zh-TW       # 請改用 --copilot-skills
npx cc-sdd@latest --windsurf --lang zh-TW      # 請改用 --windsurf-skills
npx cc-sdd@latest --opencode --lang zh-TW      # 請改用 --opencode-skills
npx cc-sdd@latest --gemini --lang zh-TW        # 請改用 --gemini-skills
npx cc-sdd@latest --qwen --lang zh-TW          # Qwen Code

# 注意：@next 現已保留給未來的 alpha/beta 版本
```

## 🌐 支援語言

| 語言 | 代碼 |  |
|------|------|------|
| 英語 | `en` | 🇬🇧 |
| 日語 | `ja` | 🇯🇵 |
| 繁體中文 | `zh-TW` | 🇹🇼 |
| 簡體中文 | `zh` | 🇨🇳 |
| 西班牙語 | `es` | 🇪🇸 |
| 葡萄牙語 | `pt` | 🇵🇹 |
| 德語 | `de` | 🇩🇪 |
| 法語 | `fr` | 🇫🇷 |
| 俄語 | `ru` | 🇷🇺 |
| 義大利語 | `it` | 🇮🇹 |
| 韓語 | `ko` | 🇰🇷 |
| 阿拉伯語 | `ar` | 🇸🇦 |
| 希臘語 | `el` | 🇬🇷 |

**使用方法**: `npx cc-sdd@latest --lang <代碼>` (例如繁體中文使用 `--lang zh-TW`)

## ✨ 快速開始

### 先選工作流

| 你想做的事 | Skills 模式 | 舊版模式 |
| --- | --- | --- |
| 開始新的工作（從功能到大型 initiative） | `kiro-discovery` → `kiro-spec-init` → `kiro-spec-requirements` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:spec-init` → `kiro:spec-requirements` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| 擴充既有系統 | `kiro:steering` → `kiro-discovery` 或 `kiro:spec-init` → 可選 `kiro:validate-gap` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:steering` → `kiro:spec-init` → 可選 `kiro:validate-gap` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| 分解大型 initiative | `kiro-discovery` → `kiro-spec-batch` | 不支援 |
| 直接做小改動 | `kiro-discovery` → 直接實作 | 直接實作 |

### 新專案
```bash
# Skills 模式：第一次使用時建議從這裡開始
/kiro-discovery 使用 OAuth 建構使用者認證系統

# 舊版模式
/kiro:spec-init 使用 OAuth 建構使用者認證系統
```

![design.md - System Flow Diagram](https://raw.githubusercontent.com/gotalab/cc-sdd/refs/heads/main/assets/design-system_flow.png)
*Example of system flow during the design phase `design.md`*

### 現有專案（建議）
```bash
# 首先建立專案上下文，然後進行開發
/kiro:steering                                     # AI 學習現有專案上下文

/kiro:spec-init 為現有認證新增 OAuth            # AI 建立強化計劃
/kiro:spec-requirements oauth-enhancement          # AI 提出澄清問題
/kiro:validate-gap oauth-enhancement               # 可選：分析現有 vs 需求
/kiro:spec-design oauth-enhancement                # 人類驗證，AI 設計
/kiro:validate-design oauth-enhancement            # 可選：驗證設計整合
/kiro:spec-tasks oauth-enhancement                 # 分解為實作任務
/kiro:spec-impl oauth-enhancement                  # 以 TDD 執行
```

**30 秒設定** → **AI 驅動「快速衝刺」（非衝刺）** → **小時交付結果**

### Discovery 之後

在 Skills 模式中，`kiro-discovery` 是第一次使用時最容易理解的入口。它不會替你一路跑到底，而是先決定應該走哪個 workflow，必要時寫入 `brief.md` / `roadmap.md`，給出下一個指令，然後停止。

- Existing spec: 繼續執行 `kiro-spec-requirements {feature}`
- 不需要 spec: 直接實作
- Single spec: 預設走 `kiro-spec-init <feature>`；只有在明確想走 fast path 時才用 `kiro-spec-quick <feature>`
- Multi-spec: 預設走 `kiro-spec-batch`；如果想先驗證第一個 slice，再執行 `kiro-spec-init <first-feature>`

### 為何團隊選擇 cc-sdd
1. **已核准規格會變成 executable work** — 需求、設計、任務與 supporting references 保持對齊，能直接驅動實作，而不是逐漸過期。
2. **長時間自律實作** — per-task subagent dispatch + TDD + independent review + 失敗時自動 debug + 任務間知見傳遞。無需外部依賴，開箱即用。
3. **Agent Skills 是更耐久的 surface** — 同一套 skill-based workflow 適用於 Claude Code、Codex、Cursor、Copilot、Windsurf、OpenCode、Gemini CLI、Antigravity。
4. **內建審查與最終驗證流程** — 系統在宣告完成前，會朝著抓出 spec mismatch、placeholder 實作與 blocked state 的方向設計。
5. **團隊化自訂只做一次** — 編輯 `.kiro/settings/templates/` 後，每個代理／slash command 都會反映你的工作流；非 skills 代理也會使用 `.kiro/settings/rules/`。

## ✨ 主要功能

- **📋 Spec-Governed Development** — 結構化規格（需求 → 研究 → 設計 → 任務）不是只有規劃用途，而是作為約束實作的 governing contract
- **🔁 長時間自律實作** — 執行 `/kiro-impl` 後放手：TDD (Feature Flag Protocol) + fresh implementer + independent reviewer + 失敗時 auto-debug。任務間知見自動傳遞。無外部依賴
- **✅ 審查 + 最終驗證流程** — 內建 task-local review、validation passes 與 final validation flow，朝 honest completion 與 NO-GO outcomes 前進
- **🚀 AI-DLC 方法論** — AI 執行，人類在各階段驗證。[集中式「快衝」](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)取代數周衝刺
- **🧠 持久專案記憶** — 指導文件在所有會話間維持架構、模式、規則與領域知識
- **🧩 Agent Skills 支援** — 每個指令都是自足的 [Agent Skill](https://agentskills.io)（SKILL.md + 工具限制 + 同置規則），設計上可延伸到更多 skills-capable agents
- **🛠 一次自訂** — 編輯 `{{KIRO_DIR}}/settings/templates/` 即可反映至所有代理。8 代理 × 13 語言共享相同流程
- **🌍 團隊就緒** — 跨平台、具品質關卡的標準化工作流程。`--codex` 已封鎖，請改用 `--codex-skills`

## 🤖 支援的 AI 代理

| 代理 | Skills 模式（建議） | 舊版模式 |
|------|--------------------------|-------------|
| **Claude Code** | `--claude-skills` — 17 個技能 | `--claude` / `--claude-agent`（已棄用） |
| **Codex CLI** | `--codex-skills` — 17 個技能 | `--codex`（已封鎖） |
| **Cursor IDE** | `--cursor-skills` — 17 個技能 | `--cursor`（已棄用） |
| **GitHub Copilot** | `--copilot-skills` — 17 個技能 | `--copilot`（已棄用） |
| **Windsurf IDE** | `--windsurf-skills` — 17 個技能 | `--windsurf`（已棄用） |
| **OpenCode** | `--opencode-skills` — 17 個技能 | `--opencode` / `--opencode-agent`（已棄用） |
| **Gemini CLI** | `--gemini-skills` — 17 個技能 | `--gemini`（已棄用） |
| **Antigravity** | `--antigravity` — 17 個技能 | — |
| **Qwen Code** | — | `--qwen` |

## 📋 指令

### 規格驅動開發工作流程（Specs 方法論）
```bash
/kiro:spec-init <description>             # 初始化功能規格
/kiro:spec-requirements <feature_name>    # 產生需求
/kiro:spec-design <feature_name>          # 建立技術設計
/kiro:spec-tasks <feature_name>           # 分解為實作任務
/kiro:spec-impl <feature_name> <tasks>    # 以 TDD 執行
/kiro:spec-status <feature_name>          # 檢查進度
```

> **規格作為基礎**：基於 [Kiro 的規格驅動方法論](https://kiro.dev/docs/specs/) - 規格將隨意開發轉換為系統工作流程，在明確的 AI-人類協作點將想法與實作連接。

> **Kiro IDE 整合**：規格可移植到 [Kiro IDE](https://kiro.dev) - 提供強化的實作保護欄和團隊協作功能。

### 品質驗證（可選 - 棕地開發）
```bash
# spec-design 之前（分析現有功能 vs 需求）：
/kiro:validate-gap <feature_name>         # 分析現有功能與需求間的差距

# spec-design 之後（驗證設計與現有系統）：
/kiro:validate-design <feature_name>      # 審查設計與現有架構的相容性
```

> **棕地開發可選**：`validate-gap` 分析現有 vs 所需功能；`validate-design` 檢查整合相容性。兩者都是現有系統的可選品質關卡。

### 專案記憶與上下文（必要）
```bash
/kiro:steering                            # 建立/更新專案記憶與上下文
/kiro:steering-custom                     # 新增專門領域知識
```

> **關鍵基礎指令**：指導建立持久專案記憶 - AI 在所有會話中使用的上下文、規則和架構。**現有專案先執行**以大幅提升規格品質。

## 🎨 自訂

可編輯 `{{KIRO_DIR}}/settings/templates/` 中的模板以符合工作流程。保留核心結構（需求編號、勾選框、標題）並新增團隊的上下文—AI 會自動適應。

**常見自訂**:
- **PRD 風格需求** - 包含業務上下文與成功指標
- **前端/後端設計** - 針對 React 元件或 API 規格最佳化
- **批准關卡** - 用於安全、架構或合規審查
- **JIRA/Linear 就緒任務** - 含估算、優先級、標籤
- **領域指導** - API 標準、測試慣例、編碼指南

📖 **[自訂指南](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md)** — 7 個實用範例與可複製程式碼片段


## ⚙️ 設定

```bash
# 語言與平台
npx cc-sdd@latest --lang zh-TW             # macOS / Linux / Windows（自動偵測）
npx cc-sdd@latest --lang zh-TW --os mac    # 保留的可選覆寫

# 安全操作
npx cc-sdd@latest --dry-run --backup

# 自訂目錄
npx cc-sdd@latest --kiro-dir docs
```

## 📁 專案結構

安裝後，專案將新增：

```
project/
├── .claude/skills/           # 17 個技能（Claude Code Skills 模式，預設）
├── .claude/commands/kiro/    # 11 個斜線指令（Claude Code）
├── .agents/skills/           # 17 個技能（Codex CLI Skills 模式）
├── .codex/prompts/           # 11 個提示指令（Codex CLI — 已封鎖，請使用 skills）
├── .github/prompts/          # 11 個提示指令（GitHub Copilot）
├── .windsurf/workflows/      # 11 個工作流程檔案（Windsurf IDE）
├── .kiro/settings/templates/ # 共用模板（以 {{KIRO_DIR}} 展開）
├── .kiro/settings/rules/     # 共用規則（非技能代理專用）
├── .kiro/specs/             # 功能規格文件
├── .kiro/steering/          # AI 指導文件
└── CLAUDE.md (Claude Code)    # 專案設定
```

> 提醒：實際只會建立所選代理需要的目錄，上方樹狀圖僅示範整個超集合。

## 📚 文件與支援

- Skills 參考: [English](../../docs/guides/skill-reference.md) | [日本語](../../docs/guides/ja/skill-reference.md)
- 指令參考: [English](../../docs/guides/command-reference.md) | [日本語](../../docs/guides/ja/command-reference.md)
- 自訂指南: [English](../../docs/guides/customization-guide.md) | [日本語](../../docs/guides/ja/customization-guide.md)
- 規格驅動開發指南: [English](../../docs/guides/spec-driven.md) | [日本語](../../docs/guides/ja/spec-driven.md)
- Claude 子代理指南: [English](../../docs/guides/claude-subagents.md) | [日本語](../../docs/guides/ja/claude-subagents.md)
- 遷移指南: [English](../../docs/guides/migration-guide.md) | [日本語](../../docs/guides/ja/migration-guide.md)
- **[問題與支援](https://github.com/gotalab/cc-sdd/issues)** - 問題回報與提問
- **[Kiro IDE](https://kiro.dev)**

---

**穩定版 v3.0.0** - 生產環境就緒。[回報問題](https://github.com/gotalab/cc-sdd/issues) | MIT License

### 平台支援
- 支援 OS：macOS / Linux / Windows（預設自動偵測）。
- 三大平台共用指令模板；`--os` 參數保留給相容性需求，可視情況指定。

> **提醒:** 即使指定 `--os` 仍會成功執行，但所有平台現在會收到相同的指令模板。
