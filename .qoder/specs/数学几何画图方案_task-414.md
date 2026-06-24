# 四边形几何图测试

## Context

几何构造引擎已完成三角形和圆的测试验证。现在需要补充四边形类典型图形测试：平行四边形、矩形（长方形）、正方形、梯形，验证 `polygon`、`angle_mark`、`tick_mark`、`segment`（对角线）等操作的组合效果。

---

## Task 1：创建四边形题库文件

新建 `src/data/questions/math/grade8/ch03-quadrilateral.json`，包含 4 道选择题。

同时在 `src/data/topics/math/topic.json` 中为八年级新增章节 `math-g8-ch03`（四边形）。

### 1.1 平行四边形题

题目：平行四边形 ABCD 中，对角线交于 O，求证 OA=OC

构造指令：
- `point` B(0,0), C(6,0)
- `point_by_polar` A 从 B 出发 60° 距离 4
- `point_relative` D = A + (6,0)
- `polygon` [A,B,C,D] 画四边
- `intersection` O = AC ∩ BD
- `segment` AC、BD 虚线对角线
- `tick_mark` OA=OC, OB=OD

### 1.2 矩形题

题目：矩形 ABCD 中，AB=6，BC=8，求对角线 AC

构造指令：
- `point` A(0,6), B(0,0), C(8,0), D(8,6)
- `polygon` [A,B,C,D]
- `segment` AC 虚线对角线
- 四个 `angle_mark` 直角标记
- `label` 边长标注

### 1.3 正方形题

题目：正方形 ABCD 边长为 4，E 是 BC 中点，求 AE

构造指令：
- `point` A(0,4), B(0,0), C(4,0), D(4,4)
- `polygon` [A,B,C,D]
- `midpoint` E 为 BC 中点
- `segment` AE 虚线
- 四个 `angle_mark` 直角标记
- 四条边 `tick_mark` 等号标记

### 1.4 梯形题

题目：梯形 ABCD 中，AD∥BC，AD=4，BC=8，AB=5，高为 3，求面积

构造指令：
- `point` B(0,0), C(8,0)
- `point` A(2,3), D(6,3) — 上底平行于下底
- `polygon` [A,B,C,D] 画四边
- `foot` H 从 A 到 BC 的垂足
- `segment` AH 虚线（高）
- `angle_mark` 直角标记
- `label` 标注 AD∥BC

---

## 文件清单

| 文件 | 改动 |
|------|------|
| `src/data/questions/math/grade8/ch03-quadrilateral.json` | 新建，4 道四边形题 |
| `src/data/topics/math/topic.json` | 八年级新增 ch03 四边形章节 |

## 验证

1. `npm run build` 确认构建无错
2. 浏览器打开 4 道题，逐一截图验证：
   - 平行四边形：对角线交于中点，tick marks 正确
   - 矩形：四个直角标记，对角线虚线
   - 正方形：等号标记 + 直角标记 + 中点
   - 梯形：上底平行下底，高虚线 + 垂足