# SuperTest-HTML 版本日志

> 初中数理化经典题库 — 刷题 · 错题本 · 模拟考试 · 视频讲解

--

## v1.1 (2026-06-21)

> 新增几何构造引擎模块 — 数据驱动的几何图形绘制系统（JSXGraph），支持三角形、四边形、圆等初中几何场景。

### ✨ 新增 — 几何构造引擎
- 构造指令 DSL：25 种操作类型（定点、极坐标、中点、垂足、交点、外心、内心、垂心、平行四边形等）（`src/types/figure.ts`）
- 几何引擎核心：纯数学计算，输入构造指令输出精确坐标的 GeometryFigure（`src/utils/geoEngine.ts`，571 行）
- JSXGraph 渲染链路：GeometryBoard + figureBuilders（点、线、圆、角标记、刻度线、标签）（`src/components/figure/`）
- 函数图像画板：二次函数 / 一次函数绘图（`src/components/figure/FunctionBoard.tsx`）
- ConstructionBoard：构造图渲染组件，useMemo 缓存计算结果（`src/components/figure/ConstructionBoard.tsx`）
- FigureRenderer：统一分发入口，支持 geometry / function / construction 三种 figure 类型（`src/components/figure/FigureRenderer.tsx`）
- 设计文档：完整的引擎架构与数学公式说明（`docs/geo-engine-plan.md`）

### 📦 题库数据新增
- 数学 8 年级：全等三角形（ch02，3 题）、四边形（ch03，4 题）
- 数学 9 年级：圆（ch02，3 题）
- 几何题包含 construction 类型图形：三角形、平行四边形、矩形、正方形、梯形、圆

### 🐛 修复
- tick marks（等号刻度线）不可见：辅助 segment 改为 `visible: true` + `strokeOpacity: 0`

### 🎨 改造文件
| 文件 | 改动 |
|------|------|
| `src/types/figure.ts` | 新增：88 行 ConstructionOp 类型 + ConstructionFigure 接口 |
| `src/types/index.ts` | 新增：导出 ConstructionOp、ConstructionFigure、Figure 联合类型 |
| `src/data/topics/math/topic.json` | 新增：八年级 ch02 全等三角形、ch03 四边形 |

---

## v1.0 (2026-06-19)

> 项目首个完整版本，涵盖刷题、错题本、模拟考试、TTS 朗读、B站视频嵌入五大核心模块。

### ✨ 新增 — 基础架构
- 项目初始化：React 18 + TypeScript + Vite 6.3 + Tailwind CSS v4（`vite.config.ts`）
- 全局类型系统：学科/年级/题目标签/题目联合类型/考试类型/视频类型（`src/types/index.ts`）
- 数据自动扫描：`import.meta.glob` 加载 JSON 题库 + 章节配置（`src/data/index.ts`）
- localStorage 持久化工具（`src/utils/storage.ts`）
- KaTeX 公式渲染 + Markdown 内联渲染（`src/utils/renderInline.tsx`）
- 化学公式标准化工具（`src/utils/formula.ts`）

### ✨ 新增 — 刷题模块
- 学科首页：三科选择卡片 + 题目统计（`src/pages/HomePage.tsx`）
- 学科页：年级分组 + 章节列表（`src/pages/SubjectPage.tsx`）
- 章节页：知识点列表 + 难度筛选 + 标签筛选（`src/pages/TopicPage.tsx`）
- 练习流程：逐题作答 + 即时反馈 + 正确/错误动画（`src/components/practice/PracticeFlow.tsx`）
- 练习 hook：答题状态管理 + 进度追踪（`src/hooks/usePractice.ts`）
- 五类题目组件：选择 / 填空 / 计算 / 判断 / 证明（`src/components/question/`）
- 题目卡片：题干展示 + KaTeX + TTS 按钮（`src/components/question/QuestionCard.tsx`）
- 解析面板：分步解析 + 易错点提示（`src/components/solution/SolutionPanel.tsx`）

### ✨ 新增 — 错题本模块
- 错题本 hook：自动收录 + 手动移除 + 按学科筛选（`src/hooks/useWrongBook.ts`）
- 错题本页面：错题列表 + 学科筛选 + 重练（`src/pages/WrongBookPage.tsx`）

### ✨ 新增 — 统计模块
- 统计页面：刷题进度 + 正确率 + 错题率（`src/pages/StatsPage.tsx`）
- 进度条组件（`src/components/ui/ProgressBar.tsx`）
- 难度星级组件（`src/components/ui/DifficultyStars.tsx`）
- 标签徽章组件（`src/components/ui/TagBadge.tsx`）

### ✨ 新增 — 模拟考试模块
- 智能组卷：Fisher-Yates 洗牌 + 难度/题型配比（`src/utils/examComposer.ts`）
- 考试 hook：倒计时 + 自动交卷 + 评分（`src/hooks/useExam.ts`）
- 考试类型定义：ExamSession / ScoreReport / ExamConfig（`src/types/exam.ts`）
- 倒计时器：彩色 urgency 提示（`src/components/exam/ExamTimer.tsx`）
- 答题卡：网格布局 + 状态着色（`src/components/exam/ExamNavigator.tsx`）
- 考试流程：导航 + 交卷确认弹窗（`src/components/exam/ExamFlow.tsx`）
- 成绩报告：分数 + 分区得分 + 错题回顾（`src/components/exam/ScoreReportComp.tsx`）
- 考试页面：配置 → 考试 → 结果三合一（`src/pages/ExamPage.tsx`）

### ✨ 新增 — TTS 语音朗读模块
- TTS hook：Web Speech API 封装（`src/hooks/useTTS.ts`）
- TTS 按钮组件（`src/components/ui/TTSButton.tsx`）
- LaTeX → 中文口语转换：100+ 正则映射（`src/utils/latexToSpeech.ts`）

### ✨ 新增 — B站视频嵌入模块
- 视频类型：VideoRef / VideoClip / VideoPlatform（`src/types/index.ts`）
- 时间区间 hook：播放计时 + 自动遮罩（`src/hooks/useVideoTimeRange.ts`）
- B站 iframe 播放器：IntersectionObserver 懒加载（`src/components/video/BilibiliPlayer.tsx`）
- 片段播放器：片段选择条 + 播放完毕覆盖层（`src/components/video/VideoClipPlayer.tsx`）
- 统一视频入口：平台分发 + 占位封面（`src/components/video/VideoEmbed.tsx`）
- 解析面板集成：步骤级视频按钮 + 联动跳转（`src/components/solution/SolutionPanel.tsx`）

### 📦 题库数据
- 数学：有理数(7年级)、一元一次方程(7年级)、一次函数(8年级)、二次函数(9年级)
- 物理：力与运动(8年级)、压强浮力(8年级)、电学(9年级)
- 化学：物质(9年级)、化学方程式(9年级)、酸碱盐(9年级)
- 共 10 个章节，约 60+ 道题

### 🎨 改造文件
| 文件 | 改动 |
|------|------|
| `src/types/index.ts` | 全局类型：题目联合类型 + 视频类型 |
| `src/types/exam.ts` | 考试类型：ExamSession + ScoreReport |
| `src/types/progress.ts` | 进度类型：PracticeProgress + WrongBookItem |
| `src/data/index.ts` | 数据聚合：import.meta.glob 自动扫描 |
| `src/App.tsx` | 路由配置：8 条路由 |
| `src/components/layout/AppLayout.tsx` | 全局布局：导航栏 + 内容区 |
| `src/index.css` | Tailwind v4 主题 + Apple 风格 |
