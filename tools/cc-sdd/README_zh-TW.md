# cc-sdd: 一鍵讓 AI 程式代理進入生產級規格開發

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
<a href="./README.md">English</a> | <a href="./README_ja.md">日本語</a> | 繁體中文 | <a href="./README_ru.md">Русский</a>
</sub></div>

✨ **將 Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Code / Windsurf 直接帶入 Spec-Driven / AI-DLC 的生產級流程，需求・設計・任務・指導文件一次對齊團隊審核。**

👻 **Kiro 相容** — 與 Kiro IDE 相似的 Spec-Driven / AI-DLC 風格，可沿用既有 Kiro 規格並保持互通。

**v2.0.0 新功能：**
- ✅ **易於審查的設計** — 結構化格式與摘要表讓審查速度提升 5 倍
- ✅ **分離研究** — 將探索筆記（Research.md）與最終設計（Design.md）分開管理
- ✅ **品質關卡** — validate-gap/design/impl 指令在編碼前捕捉整合問題
- ✅ **一次自訂** — 將模板適應至團隊流程；所有代理遵循相同工作流程
- ✅ **統一工作流程** — 7 代理 × 13 語言共享相同的 11 指令流程

> 只想看安裝？跳到 [安裝](#-安裝)。若要維持 1.1.5，使用 `npx cc-sdd@1.1.5 --claude-code ...`；升級 v2.0.0 請參考 [Migration Guide](../../docs/guides/migration-guide.md) ｜ [日文版](../../docs/guides/ja/migration-guide.md)。

## 🚀 安裝

只需一個指令，即可為主要 AI 程式代理匯入 **AI-DLC（AI Driven Development Life Cycle）× SDD（Spec-Driven Development）** 工作流程。需求、設計、任務、指導文件也會同步生成，並對齊團隊既有批准流程。

```bash
# 基本安裝（預設：英文文件，Claude Code 代理）
npx cc-sdd@latest

# 語言選項（預設：--lang en）
npx cc-sdd@latest --lang zh-TW # 繁體中文
npx cc-sdd@latest --lang ja    # 日語
npx cc-sdd@latest --lang es    # 西班牙語
...（支援語言：en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el）

# 代理選項（預設：claude-code / --claude）
npx cc-sdd@latest --claude --lang zh-TW           # Claude Code（11 個指令，語言可任選）
npx cc-sdd@latest --claude-agent --lang zh-TW     # Claude Code Subagents（12 個指令 + 9 個子代理）
npx cc-sdd@latest --cursor --lang zh-TW           # Cursor IDE
npx cc-sdd@latest --gemini --lang zh-TW           # Gemini CLI
npx cc-sdd@latest --codex --lang zh-TW            # Codex CLI
npx cc-sdd@latest --copilot --lang zh-TW          # GitHub Copilot
npx cc-sdd@latest --qwen --lang zh-TW             # Qwen Code
npx cc-sdd@latest --windsurf --lang zh-TW         # Windsurf IDE

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

### 為何團隊選擇 cc-sdd
1. **規格是單一真實來源** — 需求、設計、任務、Supporting References 同步產出，審查更快。
2. **Greenfield / Brownfield 皆適用** — 新功能快速起步；既有系統靠 validate 系列與 Project Memory 保持安全。
3. **可同時使用多個代理** — Claude、Cursor、Codex、Gemini、Copilot、Qwen、Windsurf 共用同一套模板/規則。
4. **自訂只要一次** — 編輯 `.kiro/settings/templates/` 或 `.kiro/settings/rules/`，所有代理立即套用。

## ✨ 主要功能

- **🚀 AI-DLC 方法論** - 具人類批准的 AI 原生流程。核心模式：AI 執行，人類驗證
- **📋 規格優先開發** - 全面性規格作為單一資訊源驅動整個生命週期
- **⚡ 「快速衝刺」非衝刺** - [AI-DLC 術語](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/)，強度小時/天周期取代數周衝刺。脱離 70% 管理額外負擔
- **🧠 持久專案記憶** - AI 透過指導文件在所有會話間維持全面上下文（架構、模式、規則、領域知識）
- **🛠 模板彈性** - 自訂 `{{KIRO_DIR}}/settings/templates`（steering / requirements / design / tasks），符合團隊慣用的文件格式
- **🔄 AI 原生+人類關卡** - AI 計劃 → AI 提問 → 人類驗證 → AI 實作（具品質控制的快速循環）
- **🌍 團隊就緒** - 具品質關卡的13語言跨平台標準化工作流程

## 🤖 支援的 AI 代理

| 代理 | 狀態 | 指令 | 設定 |
|------|------|------|------|
| **Claude Code** | ✅ 完全支援 | 11 個斜線指令 | `CLAUDE.md` |
| **Claude Code Subagents** | ✅ 完全支援 | 12 個指令 + 9 個子代理 | `CLAUDE.md`, `.claude/agents/kiro/` |
| **Cursor IDE** | ✅ 完全支援 | 11 個指令 | `AGENTS.md` |
| **Gemini CLI** | ✅ 完全支援 | 11 個指令 | `GEMINI.md` |
| **Codex CLI** | ✅ 完全支援 | 11 個提示 | `AGENTS.md` |
| **GitHub Copilot** | ✅ 完全支援 | 11 個提示 | `AGENTS.md` |
| **Qwen Code** | ✅ 完全支援 | 11 個指令 | `QWEN.md` |
| **Windsurf IDE** | ✅ 完全支援 | 11 個工作流程 | `AGENTS.md` |
| 其他（Factory AI Droid） | 📅 規劃中 | - |

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
├── .claude/commands/kiro/    # 11 個斜線指令
├── .codex/prompts/           # 11 個提示指令（Codex CLI）
├── .github/prompts/          # 11 個提示指令（GitHub Copilot）
├── .windsurf/workflows/      # 11 個工作流程檔案（Windsurf IDE）
├── .kiro/settings/           # 共用規則與模板（以 {{KIRO_DIR}} 展開）
├── .kiro/specs/             # 功能規格文件
├── .kiro/steering/          # AI 指導規則
└── CLAUDE.md (Claude Code)    # 專案設定
```

> 提醒：實際只會建立所選代理需要的目錄，上方樹狀圖僅示範整個超集合。

## 📚 文件與支援

- 指令參考: [English](../../docs/guides/command-reference.md) | [日本語](../../docs/guides/ja/command-reference.md)
- 自訂指南: [English](../../docs/guides/customization-guide.md) | [日本語](../../docs/guides/ja/customization-guide.md)
- 規格驅動開發指南: [English](../../docs/guides/spec-driven.md) | [日本語](../../docs/guides/ja/spec-driven.md)
- Claude 子代理指南: [English](../../docs/guides/claude-subagents.md) | [日本語](../../docs/guides/ja/claude-subagents.md)
- 遷移指南: [English](../../docs/guides/migration-guide.md) | [日本語](../../docs/guides/ja/migration-guide.md)
- **[問題與支援](https://github.com/gotalab/cc-sdd/issues)** - 問題回報與提問
- **[Kiro IDE](https://kiro.dev)**

---

**穩定版 v2.0.0** - 生產環境就緒。[回報問題](https://github.com/gotalab/cc-sdd/issues) | MIT License

### 平台支援
- 支援 OS：macOS / Linux / Windows（預設自動偵測）。
- 三大平台共用指令模板；`--os` 參數保留給相容性需求，可視情況指定。

> **提醒:** 即使指定 `--os` 仍會成功執行，但所有平台現在會收到相同的指令模板。
