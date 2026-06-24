# SuperTest-HTML 项目结构说明

> 初中数理化经典题库网页应用，基于 React + Vite + Tailwind CSS v4 构建。
> 数据流：JSON 题库 → React 渲染，纯前端无后端。

---

## 🤖 AI 快速上手指南

**读取顺序**（按需读，每个文件回答一个问题）：

| 顺序 | 文件 | 回答的问题 | 何时读 |
|:----:|------|------------|--------|
| 1 | `docs/index.md`（本文件） | 项目是什么？文件在哪？ | 每次接手时 |
| 2 | `docs/version.md` | 最近改了什么？ | 只读最新版本条目 |
| 3 | `docs/roadmap.md` | 接下来做什么？ | 需要知道下一步时 |

**文档分工**（比 SuperTeacher 精简，3 文件够用）：
- `version.md` = **唯一 changelog**，所有改动只在这里记录
- `roadmap.md` = 阶段进度 + 待办事项
- `index.md` = 项目结构说明（本文件）

**发版时的标准动作**：
1. `version.md` 顶部插入新版本条目
2. `roadmap.md` 更新阶段状态（✅/⬜）+ 待办
3. `package.json` 同步版本号

---

## 常用命令

```bash
npm run dev        # 启动 Vite 开发服务器
npm run build      # vite build（生产构建）
npm run preview    # 预览生产构建
```

---

## 根目录

| 文件/目录 | 说明 |
|-----------|------|
| `vite.config.ts` | Vite 配置：React 插件 + Tailwind v4 插件 + `@/` 路径别名 |
| `index.html` | SPA 入口 HTML |
| `package.json` | 依赖管理，脚本：`dev`、`build`、`preview` |
| `tsconfig.json` | TypeScript 根配置（引用 app + node） |
| `tsconfig.app.json` | 应用 TS 配置（含 `@/` path mapping） |
| `tsconfig.node.json` | Node 端 TS 配置（vite.config.ts 用） |
| `docs/` | 项目文档（version / roadmap / index） |
| `docs/geo-engine-plan.md` | 几何构造引擎设计文档（架构、数学公式、指令集） |

---

## `docs/` — 项目文档

| 文件 | 说明 |
|------|------|
| `version.md` | **版本日志**（唯一 changelog） |
| `roadmap.md` | 项目路线图 + 待办事项 |
| `index.md` | 本文件 — 项目结构说明 |

---

## `src/` — 前端源码

### `src/types/` — 类型定义

| 文件 | 说明 |
|------|------|
| `index.ts` | 全局类型：学科、年级、题目联合类型（Choice/Fill/Calculation/TrueFalse/Proof）、Solution、VideoRef/VideoClip |
| `exam.ts` | 考试类型：ExamConfig、ExamSession、ScoreReport、ExamAnswer |
| `progress.ts` | 进度类型：PracticeRecord、QuestionAttempt、WrongBook、WrongEntry + 空记录工厂函数 |
| `figure.ts` | 图形类型：GeometryElement、ConstructionOp（25 种）、ConstructionFigure、FunctionFigure、Figure 联合类型 |

### `src/data/` — 题库数据

```
src/data/
├── index.ts                    ← import.meta.glob 自动扫描 + 查询 API
├── topics/
│   ├── math/topic.json         ← 数学章节配置（7-9 年级 4 章）
│   ├── physics/topic.json      ← 物理章节配置（8-9 年级 3 章）
│   └── chemistry/topic.json    ← 化学章节配置（9 年级 3 章）
└── questions/
    ├── math/grade7/            ← 有理数、一元一次方程
    ├── math/grade8/            ← 一次函数、全等三角形、四边形
    ├── math/grade9/            ← 二次函数、圆
    ├── physics/grade8/         ← 力与运动、压强浮力
    ├── physics/grade9/         ← 电学
    └── chemistry/grade9/       ← 物质、化学方程式、酸碱盐
```

**加新章节**：在 `questions/{subject}/grade{N}/` 下放 JSON + 在 `topics/{subject}/topic.json` 添加章节配置，自动发现，无需改代码。

**数据查询 API**（`src/data/index.ts`）：
- `getAllTopics()` — 所有章节配置
- `getTopicBySubject(subject)` — 按学科获取
- `getQuestionsByChapter(chapterId)` — 按章节获取
- `getQuestionsBySubject(subject, filters?)` — 按学科 + 标签/难度/知识点筛选
- `getQuestionById(questionId)` — 按 ID 查找
- `getSubjectStats(subject)` — 学科统计

### `src/hooks/` — React Hooks

| 文件 | 说明 |
|------|------|
| `usePractice.ts` | 练习状态管理：答题、判对、进度追踪、localStorage 持久化 |
| `useWrongBook.ts` | 错题本管理：自动收录、手动移除、掌握判定（连续 3 次正确） |
| `useExam.ts` | 考试流程：组卷、倒计时、自动交卷、评分、历史记录 |
| `useTTS.ts` | TTS 语音朗读：Web Speech API 封装，speak/stop/toggle |
| `useVideoTimeRange.ts` | 视频时间区间：计时器 + 播放状态 + 自动结束 |

### `src/utils/` — 工具函数

| 文件 | 说明 |
|------|------|
| `storage.ts` | localStorage 读写（按学科分 key） |
| `renderInline.tsx` | Markdown 内联渲染：`$...$` KaTeX + `**bold**` + `*italic*` |
| `formula.ts` | 化学公式标准化（下标、上标处理） |
| `latexToSpeech.ts` | LaTeX → 中文口语转换（100+ 正则映射规则） |
| `examComposer.ts` | 智能组卷：Fisher-Yates 洗牌 + 难度/题型配比 |
| `geoEngine.ts` | 几何构造引擎：25 种构造指令 + 确定性数学公式，输入 ConstructionOp[] 输出 GeometryFigure（571 行） |

### `src/pages/` — 页面组件

| 文件 | 路由 | 说明 |
|------|------|------|
| `HomePage.tsx` | `/` | 学科选择首页 + 各科题目统计 |
| `SubjectPage.tsx` | `/subject/:subject` | 学科详情：年级分组 + 章节列表 |
| `TopicPage.tsx` | `/subject/:subject/topic/:topicId` | 章节详情：知识点 + 筛选 + 进入练习 |
| `PracticePage.tsx` | `/practice/:subject` | 练习页（PracticeFlow） |
| `WrongBookPage.tsx` | `/wrongbook[/:subject]` | 错题本：列表 + 学科筛选 + 重练 |
| `ExamPage.tsx` | `/exam` | 模拟考试：配置 → 考试 → 结果 |
| `StatsPage.tsx` | `/stats` | 统计：刷题进度 + 正确率 + 错题率 |

### `src/components/` — UI 组件

#### `components/layout/`
| 文件 | 说明 |
|------|------|
| `AppLayout.tsx` | 全局布局：顶部导航栏 + Outlet 内容区 |

#### `components/question/` — 题目展示
| 文件 | 说明 |
|------|------|
| `QuestionCard.tsx` | 题目卡片：题干 + 难度 + 标签 + TTS 按钮 |
| `ChoiceQuestion.tsx` | 选择题：单选选项卡 |
| `FillQuestion.tsx` | 填空题：输入框 |
| `CalculationQuestion.tsx` | 计算题：步骤输入 |
| `TrueFalseQuestion.tsx` | 判断题：对/错按钮 |
| `ProofQuestion.tsx` | 证明题：文本输入 |

#### `components/practice/`
| 文件 | 说明 |
|------|------|
| `PracticeFlow.tsx` | 练习流程：逐题作答 + 即时反馈 + 进度条 |

#### `components/solution/`
| 文件 | 说明 |
|------|------|
| `SolutionPanel.tsx` | 解析面板：分步解析 + 易错点 + 视频按钮 |

#### `components/exam/` — 模拟考试
| 文件 | 说明 |
|------|------|
| `ExamTimer.tsx` | 倒计时器：urgency 颜色变化 |
| `ExamNavigator.tsx` | 答题卡：网格布局 + 状态着色 |
| `ExamFlow.tsx` | 考试流程：导航 + 交卷确认弹窗 |
| `ScoreReportComp.tsx` | 成绩报告：分数 + 分区得分 + 错题回顾 |

#### `components/video/` — 视频嵌入
| 文件 | 说明 |
|------|------|
| `BilibiliPlayer.tsx` | B站 iframe 播放器：IntersectionObserver 懒加载 |
| `VideoClipPlayer.tsx` | 片段播放器：多片段选择条 + 播放完毕覆盖层 |
| `VideoEmbed.tsx` | 统一入口：平台分发 + 占位封面懒加载 |

#### `components/ui/` — 通用 UI
| 文件 | 说明 |
|------|------|
| `DifficultyStars.tsx` | 难度星级显示 |
| `ProgressBar.tsx` | 进度条 |
| `TagBadge.tsx` | 标签徽章 |
| `TTSButton.tsx` | TTS 朗读按钮（播放/停止） |

#### `components/figure/` — 几何图形渲染
| 文件 | 说明 |
|------|------|
| `FigureRenderer.tsx` | 统一入口：分发 geometry / function / construction 三种 figure 类型 |
| `GeometryBoard.tsx` | 几何画板：JSXGraph board 初始化 + bounds 自适应 |
| `ConstructionBoard.tsx` | 构造图渲染：useMemo 调用 executeConstruction + GeometryBoard |
| `FunctionBoard.tsx` | 函数图像画板：二次函数 / 一次函数绘图 |
| `figureBuilders.ts` | JSXGraph 元素构建器：点、线、圆、角标记、刻度线、标签、虚线 |
| `useJSXGraph.ts` | JSXGraph 懒加载 hook：动态 import + 状态管理 |

### `src/` 根文件

| 文件 | 说明 |
|------|------|
| `main.tsx` | React 入口：挂载 App 组件 |
| `App.tsx` | 路由配置：8 条路由（见 pages 表） |
| `index.css` | 全局样式：Tailwind v4 `@theme` 主题变量 |
| `vite-env.d.ts` | Vite 类型声明 |

---

## 关键架构决策

1. **纯前端静态部署**：无后端，进度 + 错题存 localStorage
2. **数据与渲染分离**：JSON 题库 → React 渲染，新增章节只需加 JSON
3. **自动扫描发现**：`import.meta.glob` 聚合题目和章节，加数据零代码改动
4. **题目联合类型**：`ChoiceQuestion | FillQuestion | CalculationQuestion | TrueFalseQuestion | ProofQuestion`，新增题型扩展 union + 添加组件
5. **Tailwind CSS v4**：`@theme` 语义化颜色，`@tailwindcss/vite` 插件模式
6. **renderInline 渲染规范**：所有 `text` 字段输出时必须调用 `renderInline()`，支持 KaTeX + Markdown
7. **视频嵌入方案**：B站 iframe + URL `t=` 参数起始 + setInterval 计时 + 覆盖层遮罩结束
8. **localStorage 按学科分 key**：`supertest_practice_{subject}` / `supertest_wrongbook_{subject}`
9. **几何构造引擎**：ConstructionOp DSL → geoEngine 确定性计算 → GeometryFigure → JSXGraph 渲染，AI 只需描述“怎么画”而非算坐标
