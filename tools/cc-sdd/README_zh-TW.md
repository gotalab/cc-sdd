# cc-sdd: 一鍵讓 AI 程式代理進入生產級規格開發

✨ **將 Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Code / Windsurf 從原型開發轉型為生產級開發，同時可將規格與指導模板調整為符合團隊流程。**

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.2rem;"><sub>
<a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README.md">English</a> | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_ja.md">日本語</a> | 繁體中文
</sub></div>

將 **AI-DLC (AI 驅動開發生命週期)** 帶入 Claude Code、Cursor IDE、Gemini CLI、Codex CLI、GitHub Copilot、Qwen Code 與 Windsurf。**AI 原生流程**與**最小限的人類批准關卡**：AI 驅動執行，人類在各階段驗證關鍵決策。

🎯 **最佳用途**：脱離傳統開發 70% 的額外負擔（會議、文件、儀式），透過 AI 原生執行和人類品質關卡實現 **從週到小時的交付**。

> **Kiro 相容** — 專業環境中使用的相同實證工作流程。

## 🚀 安裝

只需一個指令，即可為主要 AI 程式代理匯入 **AI-DLC（AI Driven Development Life Cycle）× SDD（Spec-Driven Development）** 工作流程。需求、設計、任務、指導文件也會同步生成，並對齊團隊既有批准流程。

```bash
# 基本安裝（預設：英文文件，Claude Code 代理）
npx cc-sdd@latest

# Alpha 版本（重大更新版 v2.0.0-alpha.3）
npx cc-sdd@next

# 語言選項（預設：--lang en）
npx cc-sdd@latest --lang zh-TW # 繁體中文
npx cc-sdd@latest --lang ja    # 日語
# 支援語言（共12種）: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar

# 代理選項（預設：claude-code / --claude）
npx cc-sdd@latest --claude --lang zh-TW    # 或 @next 取得最新 alpha
npx cc-sdd@next --claude-agent --lang zh-TW # 安裝 Claude Code SubAgents（需使用 @next）
npx cc-sdd@latest --gemini --lang zh-TW    # 或 @next 取得最新 alpha
npx cc-sdd@latest --cursor --lang zh-TW    # 或 @next 取得最新 alpha
npx cc-sdd@next --codex --lang zh-TW       # 需要 alpha 版本
npx cc-sdd@next --copilot --lang zh-TW     # 需要 alpha 版本
npx cc-sdd@latest --qwen --lang zh-TW      # 或 @next 取得最新 alpha
npx cc-sdd@next --windsurf --lang zh-TW    # 需要 alpha 版本（Windsurf 工作流程）
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

**使用方法**: `npx cc-sdd@latest --lang <代碼>` (例如繁體中文使用 `--lang zh-TW`)

## ✨ 快速開始

### 新專案
```bash
# 啟動 AI 代理並立即開始規格驅動開發
/kiro:spec-init 使用 OAuth 建構使用者認證系統  # AI 建立結構化計劃
/kiro:spec-requirements auth-system                 # AI 提出澄清問題
/kiro:spec-design auth-system                      # 人類驗證，AI 設計
/kiro:spec-tasks auth-system                       # 分解為實作任務
/kiro:spec-impl auth-system                        # 以 TDD 執行
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

## ✨ 主要功能

- **🚀 AI-DLC 方法論** - 具人類批准的 AI 原生流程。核心模式：AI 執行，人類驗證
- **📋 規格優先開發** - 全面性規格作為唱一信息源驅動整個生命週期
- **⚡ 「快速衝刺」非衝刺** - [AI-DLC 術語](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)，強度小時/天周期取代數周衝刺。脱離 70% 管理額外負擔
- **🧠 持久專案記憶** - AI 透過指導文件在所有會話間維持全面上下文（架構、模式、規則、領域知識）
- **🛠 模板彈性** - 自訂 `{{KIRO_DIR}}/settings/templates`（steering / requirements / design / tasks），符合團隊慣用的文件格式
- **🔄 AI 原生+人類關卡** - AI 計劃 → AI 提問 → 人類驗證 → AI 實作（具品質控制的快速循環）
- **🌍 團隊就緒** - 具品質關卡的12語言跨平台標準化工作流程

## 🤖 支援的 AI 代理

| 代理 | 狀態 | 指令 | 設定 |
|------|------|------|------|
| **Claude Code** | ✅ 完全支援 | 11 個斜線指令 | `CLAUDE.md` |
| **Claude Code SubAgents** | ✅ 完全支援 | 12 個指令 + 9 個子代理（需 cc-sdd@next） | `CLAUDE.md`, `.claude/agents/kiro/` |
| **Cursor IDE** | ✅ 完全支援 | 11 個指令 | `AGENTS.md` |
| **Gemini CLI** | ✅ 完全支援 | 11 個指令 | `GEMINI.md` |
| **Codex CLI** | ✅ 完全支援 | 11 個提示 | `AGENTS.md` |
| **GitHub Copilot** | ✅ 完全支援 | 11 個提示 | `AGENTS.md` |
| **Qwen Code** | ✅ 完全支援 | 11 個指令 | `QWEN.md` |
| **Windsurf IDE** | ✅ 完全支援 | 11 個工作流程 | `.windsurf/workflows/`, `AGENTS.md`（需 cc-sdd@next） |
| 其他 | 📅 規劃中 | - | - |

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
npx cc-sdd@latest --kiro-dir docs/specs
```

## 📁 專案結構

安裝後，專案將新增：

```
project/
├── .claude/commands/kiro/    # 11 個斜線指令
├── .codex/prompts/           # 11 個提示指令（Codex CLI）
├── .github/prompts/          # 11 個提示指令（GitHub Copilot）
├── .windsurf/workflows/      # 11 個工作流程檔案（Windsurf IDE）
├── .kiro/settings/           # 共用規則與模板（以 {{KIRO_DIR}} 展開）
├── .kiro/specs/             # 功能規格文件
├── .kiro/steering/          # AI 指導規則
└── CLAUDE.md (Claude Code)    # 專案設定
```

## 📚 文件與支援

- **[完整文件](https://github.com/gotalab/cc-sdd/tree/main/docs/README)** - 完整設定指南
- **[指令參考](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/command-reference.md)** - 所有 `/kiro:*` 指令的詳細使用方法、參數、範例
- **[自訂指南](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md)** - 7 個實用範例：PRD 需求、前端/後端設計、批准工作流程、JIRA 整合、領域指導
- **[問題與支援](https://github.com/gotalab/cc-sdd/issues)** - 問題回報與提問
- **[Kiro IDE](https://kiro.dev)**

---

**Beta 版本** - 可用且持續改進中。[回報問題](https://github.com/gotalab/cc-sdd/issues) | MIT License

### 平台支援
- 支援 OS：macOS / Linux / Windows（預設自動偵測）。
- 三大平台共用指令模板；`--os` 參數保留給相容性需求，可視情況指定。

> **提醒:** 即使指定 `--os` 仍會成功執行，但所有平台現在會收到相同的指令模板。
