---
name: project-manager
description: Manage project versions, changelogs, and documentation index for SuperTest-HTML. Use when releasing a version, updating changelog, syncing roadmap, updating docs/index.md, or checking project status. Triggers on "发版", "版本更新", "更新日志", "changelog", "更新索引", "sync index", "项目状态", "release", "new version", "project status".
---

# Project Manager

Two core actions: **Version Update** and **Index Sync**. Lightweight 3-file doc system.

---

## Action 1: Version Update (版本更新)

**Trigger**: "release v1.1"、"版本完成"、"发版"

**What it does**: Sync all 3 docs + package.json at once.

### Flow

1. Read `docs/version.md` — get latest version number
2. Read `docs/roadmap.md` — get phase status
3. Generate updates for all 3 docs + package.json, show diff to user, confirm before writing

### Files to update

| File | Action |
|------|--------|
| `docs/version.md` | Insert new entry at TOP (newest first), after the `---` separator |
| `docs/roadmap.md` | Mark phase ✅ + date, update 待办, update 当前版本 |
| `docs/index.md` | Regenerate file tables if new files added (preserve AI 快速上手 section) |
| `package.json` | Update `"version"` field |

### version.md entry format

```markdown
## vX.X (YYYY-MM-DD)

> 一句话描述本版本核心改动

### ✨ 新增
- 功能描述（`src/path/file.tsx`）

### 🔧 改造
- 改造描述（`src/path/file.tsx`）

### 🔧 修复
- 修复描述（`src/path/file.tsx`）

### 📦 题库数据
- 新增章节/题目描述

### 🎨 改造文件
| 文件 | 改动 |
|------|------|
| `src/path/file.tsx` | 改动描述 |
```

**Rules**:
- Date format: `YYYY-MM-DD`
- Only include categories that have content
- File paths in backticks
- Insert at top of file, after the `---` separator

### roadmap.md update rules
- Update version row: phase status → ✅, add completion date
- Update "当前版本" in header
- If new 待办 items emerged, add to 待办事项 table
- Preserve all existing content — only add/update

### index.md update rules
- **Preserve** (never overwrite): `## 🤖 AI 快速上手指南`, `## 关键架构决策`
- **Regenerate**: file tables under `## src/` sections when files change
- Scan rules: skip `.git/`, `node_modules/`, `dist/`

---

## Action 2: Index Sync (索引同步)

**Trigger**: "更新索引"、"sync index"、"更新目录"

**What it does**: Scan project file structure, regenerate `docs/index.md` file tables.

### Flow

1. Scan directories: root, `docs/`, `src/` (all subdirs)
2. Read existing `docs/index.md` — preserve fixed sections
3. Regenerate directory tables
4. Show diff to user, confirm before writing

### What to preserve

- `## 🤖 AI 快速上手指南` (reading order table + doc principles + standard actions)
- `## 关键架构决策` (numbered list at bottom)
- `## 常用命令` (bash code block)

### What to regenerate

- `## 根目录` — table of root files
- `## docs/` — table of docs files
- `## src/` — nested tables for each subdir (types, data, hooks, utils, pages, components)

### Scan rules
- Skip `.git/`, `node_modules/`, `dist/`, `.qoder/`
- For each directory, list files with one-line description
- Match existing format: `| path | description |`
- New files get auto-added, deleted files get removed
