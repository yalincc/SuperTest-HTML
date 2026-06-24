# B站视频模块化嵌入方案

## Context

项目 Phase 1-4 已全部完成（刷题+错题本+模拟考试+TTS）。现需在**解析面板（SolutionPanel）**中嵌入 B站视频，实现模块化时间片段播放——一个视频按解题步骤切分为多个片段，用户点击某步骤时自动跳转到对应视频片段。抖音仅做外链降级。

## 平台策略

| 平台 | 策略 | 时间控制 |
|------|------|----------|
| **Bilibili** | iframe 嵌入，`t=` 参数起始跳转 | 计时器 + 覆盖层实现结束 |
| **抖音** | 仅外链跳转按钮 | 不支持 |

**Bilibili iframe URL**：`https://player.bilibili.com/player.html?bvid={bvid}&page={page}&t={start}&danmaku=0&high_quality=1`

## 数据模型变更

### 新增类型（追加到 `src/types/index.ts` 末尾）

```typescript
export type VideoPlatform = 'bilibili' | 'douyin'

export interface VideoClip {
  label?: string     // 片段标题，如"配方过程"
  start: number      // 起始秒数
  end?: number       // 结束秒数（可选）
}

export interface VideoRef {
  platform: VideoPlatform
  videoId: string         // BV号 / 抖音视频ID
  page?: number           // B站分P（默认1）
  title?: string
  cover?: string          // 封面图URL
  clips?: VideoClip[]     // 时间片段列表
  externalUrl?: string    // 外链（"在B站/抖音打开"）
}
```

### 现有类型扩展（均为可选字段，向后兼容）

| 类型 | 新增字段 | 用途 |
|------|----------|------|
| `Solution` (L42) | `video?: VideoRef` | 解析级视频 |
| `SolutionStep` (L35) | `videoClip?: VideoClip` | 步骤对应的时间片段 |
| `ChapterConfig` (L133) | `introVideo?: VideoRef` | 章节导学视频（预留） |

## 组件架构

```
SolutionPanel (修改)
├── 展开后 → VideoEmbed (统一入口)
│   ├── platform=bilibili + clips → VideoClipPlayer
│   │   ├── 片段选择条 (横向滚动按钮)
│   │   ├── BilibiliPlayer (iframe)
│   │   └── 播放完毕覆盖层 (重新播放/继续观看)
│   ├── platform=bilibili 无clips → BilibiliPlayer
│   └── platform=douyin → 外链按钮
├── 步骤列表 → 每步旁"播放视频"按钮 → 联动 activeClipIndex
└── 知识点 + 易错点 (不变)
```

## 实施任务

### Task 1: 类型定义
**文件**: `src/types/index.ts`
- 末尾追加 `VideoPlatform`, `VideoClip`, `VideoRef` 类型
- `Solution` 加 `video?: VideoRef`
- `SolutionStep` 加 `videoClip?: VideoClip`
- `ChapterConfig` 加 `introVideo?: VideoRef`

### Task 2: 时间控制 Hook
**新建**: `src/hooks/useVideoTimeRange.ts`
- `setInterval` 每秒更新 elapsed
- `elapsed >= (end - start)` 时触发 `isFinished`
- 暴露: `isPlaying`, `isFinished`, `elapsed`, `duration`, `startPlayback`, `stopPlayback`

### Task 3: Bilibili 播放器组件
**新建**: `src/components/video/BilibiliPlayer.tsx`
- Props: `bvid`, `page?`, `startTime?`, `className?`
- 构建 iframe URL 含 `t=` 参数
- `IntersectionObserver` 懒加载
- 16:9 响应式容器 (`aspect-video`)

### Task 4: 片段播放器组件
**新建**: `src/components/video/VideoClipPlayer.tsx`
- Props: `video: VideoRef`, `activeClipIndex?`
- 顶部片段选择条（横向滚动按钮）
- 中间 BilibiliPlayer
- 播放完毕覆盖层 + "重新播放/继续观看"
- `activeClipIndex` 变化时自动切换片段

### Task 5: 统一入口组件
**新建**: `src/components/video/VideoEmbed.tsx`
- Props: `video: VideoRef`, `activeClipIndex?`
- 按 platform 分发：bilibili → VideoClipPlayer/BilibiliPlayer，douyin → 外链
- 懒加载占位封面（点击加载 iframe）

### Task 6: SolutionPanel 集成
**修改**: `src/components/solution/SolutionPanel.tsx`
- 答案区块上方插入 `<VideoEmbed solution.video />`（若有 video）
- 新增 `activeClipIndex` state
- 步骤旁添加"播放视频"按钮（lucide `Play` 图标，仅有 videoClip 时显示）
- 点击按钮 → 设 activeClipIndex → 滚动到视频区域

### Task 7: 示例数据
**修改**: `src/data/questions/math/grade9/ch01-quadratic-func.json`
- 选 1-2 道题添加 `solution.video` + `steps[].videoClip`
- 使用占位 BV 号验证组件功能

### Task 8: 构建验证
- `npx vite build` 确认 0 错误
- `npx vite` 启动 dev，验证视频嵌入显示

## 关键文件清单

| 文件 | 操作 |
|------|------|
| `src/types/index.ts` | 修改：追加视频类型 + 扩展现有类型 |
| `src/hooks/useVideoTimeRange.ts` | 新建 |
| `src/components/video/BilibiliPlayer.tsx` | 新建 |
| `src/components/video/VideoClipPlayer.tsx` | 新建 |
| `src/components/video/VideoEmbed.tsx` | 新建 |
| `src/components/solution/SolutionPanel.tsx` | 修改：集成视频 |
| `src/data/questions/math/grade9/ch01-quadratic-func.json` | 修改：示例数据 |

## JSON 数据示例

```json
{
  "solution": {
    "answer": "B",
    "video": {
      "platform": "bilibili",
      "videoId": "BV1GJ411x7h7",
      "page": 1,
      "title": "二次函数配方法讲解",
      "clips": [
        { "label": "配方过程", "start": 30, "end": 150 },
        { "label": "求顶点坐标", "start": 150, "end": 270 },
        { "label": "图象分析", "start": 270, "end": 400 }
      ],
      "externalUrl": "https://www.bilibili.com/video/BV1GJ411x7h7"
    },
    "steps": [
      {
        "description": "提取负号并配方",
        "expression": "y = -(x^2 - 4x) - 3",
        "videoClip": { "label": "配方过程", "start": 30, "end": 150 }
      },
      {
        "description": "化简得到顶点式",
        "expression": "y = -(x-2)^2 + 1",
        "videoClip": { "label": "求顶点坐标", "start": 150, "end": 270 }
      }
    ],
    "keyKnowledge": "配方法"
  }
}
```

## 时间区间播放实现

- **起始**：URL `t={start}` 参数，iframe 加载后自动跳转
- **结束**：`setInterval` 计时器，`(end-start)` 秒后显示覆盖层遮罩（跨域无法直接控制 iframe）
- **覆盖层**：半透明黑色遮罩 + "片段播放完毕" + 两个按钮：
  - "重新播放"→ 重载 iframe（带 `t={start}`）
  - "继续观看"→ 移除遮罩，允许自由播放

## 验证方式

1. `npx vite build` 确认 0 错误
2. `npx vite` 启动，进入含视频的题目，点击"查看解析"
3. 确认视频占位封面正确显示
4. 点击封面加载 Bilibili iframe，验证视频从指定时间开始播放
5. 点击不同步骤的"播放视频"按钮，验证片段切换
6. 到达结束时间后验证覆盖层出现
7. 点击"重新播放"和"继续观看"验证功能正常

---

# 以下为历史方案（Phase 1-4 已完成）

## 技术栈

复用 SuperTeacher 技术栈：React 18 + TypeScript + Vite + Tailwind CSS v4 + KaTeX + react-router-dom + lucide-react，新增 `edge-tts-client` 用于高质量语音。

视觉风格：复用 SuperTeacher 的 Apple 简约风，主色调改为考试蓝 `#2563eb`。

## 项目结构

```
SuperTest-HTML/
├── src/
│   ├── types/
│   │   ├── index.ts          # 核心类型: Question, TopicConfig, Solution, TrapPoint
│   │   ├── progress.ts       # PracticeRecord, WrongBook, QuestionAttempt
│   │   └── exam.ts           # ExamTemplate, ExamSession, ScoreReport
│   ├── data/
│   │   ├── index.ts          # import.meta.glob 自动扫描 + 查询 API
│   │   ├── topics/{subject}/topic.json  # 学科章节树配置
│   │   └── questions/{subject}/{grade}/{chapter}.json  # 题库文件
│   ├── hooks/
│   │   ├── usePractice.ts    # 刷题核心 (答题/记录/统计)
│   │   ├── useWrongBook.ts   # 错题本 (筛选/重做/掌握)
│   │   ├── useExam.ts        # 模拟考试 (计时/评分/报告)
│   │   └── useTTS.ts         # TTS 播放控制
│   ├── services/tts.ts       # Edge TTS 服务封装
│   ├── utils/
│   │   ├── storage.ts        # localStorage 读写
│   │   ├── renderInline.tsx  # 复用 SuperTeacher LaTeX 渲染
│   │   ├── formula.ts        # 复用 SuperTeacher 公式比对
│   │   ├── latexToSpeech.ts  # LaTeX → 口语转换
│   │   └── examComposer.ts   # 智能组卷算法
│   ├── components/
│   │   ├── question/         # 题目组件 (Choice/Fill/Calculation/TrueFalse/Proof)
│   │   ├── solution/         # 分步解析 + 易错点提醒
│   │   ├── practice/         # 刷题流程 (PracticeFlow/Navigator/Result)
│   │   ├── exam/             # 模拟考试 (ExamFlow/Timer/Navigator/ScoreReport)
│   │   ├── wrongbook/        # 错题本 (List/Card)
│   │   ├── topic/            # 章节浏览 (Tree/Card)
│   │   ├── tts/              # 语音朗读 (TTSButton/Player)
│   │   └── ui/               # 通用 (KaTeX/ProgressBar/TagBadge/DifficultyStars)
│   └── pages/
│       ├── HomePage.tsx      # 学科卡片 + 概览统计
│       ├── SubjectPage.tsx   # 年级→章节导航
│       ├── TopicPage.tsx     # 章节题目列表 + 筛选
│       ├── PracticePage.tsx  # 刷题模式
│       ├── ExamConfigPage.tsx / ExamPage.tsx / ExamResultPage.tsx
│       ├── WrongBookPage.tsx # 错题本
│       └── StatsPage.tsx     # 做题统计
```

## 核心数据模型

**题目结构** — 每道题包含：
- `id` (全局唯一: `math-g7-ch01-q001`)、`stem` (题干，支持 LaTeX)、`difficulty` (1-5)
- `tags`: 中考真题 / 易错题 / 陷阱题 / 高频考点 / 压轴题
- `source`: 来源信息 (年份/省份/城市/卷名/题号)
- `solution`: 分步解析 (answer + steps[] + keyKnowledge + alternativeMethods)
- `trapPoints[]`: 易错点 (描述 + 正确做法 + 常见错误)
- `ttsText?`: 可选的 TTS 朗读文本 (LaTeX 转口语)

**题型**: 选择题 / 填空题 / 计算题(含子问题) / 判断题 / 证明题

**进度存储**: localStorage 按学科分 key
- `supertest_practice_{subject}` → 做题记录
- `supertest_wrongbook_{subject}` → 错题本 (连续做对3次自动标记掌握)
- `supertest_exam_history` → 考试成绩
- `supertest_exam_current` → 进行中的考试 (防刷新丢失)

## 核心功能

### 1. 刷题+解析
逐题模式（非批量），每题展示：题目卡片 → 提交答案 → 分步解析 + 易错点提醒卡片。支持题目标签筛选（中考真题/易错题/难度等）。

### 2. 错题本
答错自动收集，支持：按学科/章节/标签/掌握状态筛选、单题重做、批量重做、连续做对3次自动标记掌握。

### 3. 模拟考试
预设试卷 + 智能组卷两种模式。全屏考试界面含：倒计时器、答题卡网格（已答/未答/标记三种状态）、交卷后生成成绩报告（总分/分区得分/用时/错题列表）。

### 4. TTS 语音
首选 `edge-tts-client`（免费、中文 Neural 语音质量极佳），Web Speech API 作为降级方案。LaTeX 公式通过映射表转换为口语（$\frac{a}{b}$ → "b分之a"），优先使用人工编写的 `ttsText` 字段。

## 实施阶段

### Phase 1 (P0): 核心刷题 — 先做 MVP
- 项目初始化 (Vite + Tailwind + 依赖)
- 类型定义 + 数据加载层
- HomePage → SubjectPage → TopicPage 导航链路
- PracticePage 刷题模式 (选择题+填空题+判断题 + 解析)
- 做题记录 + 错题自动收集
- 数学 1 个章节示例数据 (~20题)

### Phase 2 (P1): 错题本+计算题
- WrongBookPage (列表/筛选/重做/掌握)
- CalculationQuestion + ProofQuestion 组件
- 题库扩充到 3 科各 2 章 (~70题)
- PracticeResult 结果页 + 基础统计

### Phase 3 (P2): 模拟考试
- 预设试卷 + 智能组卷
- 全屏考试 (计时+答题卡+评分报告)

### Phase 4 (P2): TTS 语音
- edge-tts-client 集成 + useTTS hook
- TTSButton + LaTeX→口语转换
- Web Speech API 降级

### Phase 5 (P3): 长期优化
- 题库扩充 (每科 100+ 题)
- 统计图表、PWA 离线支持

## MVP 题目规划 (~70题)

| 学科 | 年级 | 章节 | 题数 | 题型 |
|------|------|------|------|------|
| 数学 | 七年级 | 有理数 | 8 | 选择4+填空2+判断2 |
| 数学 | 七年级 | 一元一次方程 | 7 | 选择3+填空2+解答2 |
| 数学 | 八年级 | 一次函数 | 8 | 选择4+填空2+解答2 |
| 数学 | 九年级 | 二次函数 | 7 | 选择3+填空2+解答2 |
| 物理 | 八年级 | 力与运动 | 7 | 选择4+填空2+解答1 |
| 物理 | 八年级 | 压强与浮力 | 7 | 选择3+填空2+解答2 |
| 物理 | 九年级 | 电学基础 | 6 | 选择3+填空2+解答1 |
| 化学 | 九年级 | 物质构成 | 7 | 选择4+填空2+判断1 |
| 化学 | 九年级 | 化学方程式 | 7 | 选择3+填空2+解答2 |
| 化学 | 九年级 | 酸碱盐 | 6 | 选择3+填空2+解答1 |

## 可复用的 SuperTeacher 模块

| 文件 | 复用方式 |
|------|---------|
| `src/utils/renderInline.tsx` | 直接复制 |
| `src/utils/formula.ts` | 直接复制 |
| `src/components/exercises/types/ChoiceExercise.tsx` | 适配为 ChoiceQuestion |
| `src/components/exercises/types/FillExercise.tsx` | 适配为 FillQuestion |
| `src/components/layout/AppLayout.tsx` | 改品牌名+导航 |
| `src/index.css` | 复制并替换主色系 |
| `vite.config.ts` / `tsconfig.app.json` | 直接复制 |

## 验证方式

1. `npm run dev` 启动开发服务器，访问首页确认学科卡片展示
2. 进入数学→七年级→有理数，确认题目列表正确加载
3. 开始刷题，验证答案判定、解析展示、易错点提醒
4. 故意答错，检查错题本自动收集
5. 启动模拟考试，验证计时器、答题卡、成绩报告
6. 点击 TTS 朗读按钮，验证语音播放（含公式朗读）
7. `npm run build` 确认无编译错误
