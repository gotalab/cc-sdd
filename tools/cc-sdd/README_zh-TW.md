# cc-sdd

✨ **將 Claude Code / Cursor IDE / Gemini CLI 從原型開發轉型為生產級開發**

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.2rem;"><sub>
<a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README.md">English</a> | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_ja.md">日本語</a> | 繁體中文
</sub></div>

將 **AI-DLC (AI 驅動開發生命週期)** 帶入 Claude Code、Cursor IDE 與 Gemini CLI。**AI 原生流程**與**最小限的人類批准關卡**：AI 驅動執行，人類在各階段驗證關鍵決策。

🎯 **最佳用途**：脱離傳統開發 70% 的額外負擔（會議、文件、儀式），透過 AI 原生執行和人類品質關卡實現 **從週到小時的交付**。

> **Kiro 相容** — 專業環境中使用的相同實證工作流程。

## 🚀 安裝

```bash
# 基本安裝（預設：英文文件，Claude Code 代理）
npx cc-sdd@latest

# 語言選項（預設：--lang en）
npx cc-sdd@latest --lang zh-TW # 繁體中文
npx cc-sdd@latest --lang ja    # 日語
# 支援語言：en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar

# 代理選項（預設：claude-code）
npx cc-sdd@latest --gemini-cli --lang zh-TW # Gemini CLI 用
npx cc-sdd@latest --cursor --lang zh-TW # Cursor IDE 用
```

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
- **🔄 AI 原生+人類關卡** - AI 計劃 → AI 提問 → 人類驗證 → AI 實作（具品質控制的快速循環）
- **🌍 團隊就緒** - 具品質關卡的多語言、跨平台、標準化工作流程

## 🤖 支援的 AI 代理

| 代理 | 狀態 | 指令 | 設定 |
|------|------|------|------|
| **Claude Code** | ✅ 完全支援 | 10 個斜線指令 | `CLAUDE.md` |
| **Gemini CLI** | ✅ 完全支援 | 10 個指令 | `GEMINI.md` |
| **Cursor IDE** | ✅ 完全支援 | 10 個指令 | `AGENTS.md` |
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

## ⚙️ 設定

```bash
# 語言與平台
npx cc-sdd@latest --lang zh-TW --os mac    # macOS
npx cc-sdd@latest --lang zh-TW --os linux  # Linux（與 mac 共用模板）

# 安全操作
npx cc-sdd@latest --dry-run --backup

# 自訂目錄
npx cc-sdd@latest --kiro-dir docs/specs
```

## 📁 專案結構

安裝後，專案將新增：

```
project/
├── .claude/commands/kiro/    # 10 個斜線指令
├── .kiro/specs/             # 功能規格文件
├── .kiro/steering/          # AI 指導規則
└── CLAUDE.md (Claude Code)    # 專案設定
```

## 📚 文件與支援

- **[完整文件](https://github.com/gotalab/cc-sdd/tree/main/docs/README)** - 完整設定指南
- **[指令參考](https://github.com/gotalab/cc-sdd/docs)** - 所有選項與範例
- **[問題與支援](https://github.com/gotalab/cc-sdd/issues)** - 問題回報與提問
- **[Kiro IDE](https://kiro.dev)**

---

**Beta 版本** - 可用且持續改進中。[回報問題](https://github.com/gotalab/cc-sdd/issues) | MIT License

### 平台支援
- 支援 OS：macOS / Linux / Windows（預設自動偵測）。
- Linux 與 macOS 使用相同的指令模板；Windows 使用專用模板。
