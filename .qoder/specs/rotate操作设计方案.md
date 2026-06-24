# Rotate 操作设计方案

## Context

初中数学几何引擎需要支持**旋转**操作，用于：
- 旋转作图（绕点旋转图形）
- 中心对称（旋转 180°）
- 旋转对称图形（正多边形）
- 旋转性质探究

现有 25 种操作无法实现旋转，需新增。

---

## 操作定义

### OpRotate

```typescript
/** 绕点旋转 */
export interface OpRotate {
  op: 'rotate'
  id: string           // 新生成点的 ID
  point: string        // 被旋转的点
  center: string       // 旋转中心
  angle: number        // 旋转角度（度），正数=逆时针，负数=顺时针
}
```

### 数学公式

点 P(x, y) 绕中心 C(cx, cy) 旋转 θ 度：

```
x' = cx + (x - cx) · cos(θ) - (y - cy) · sin(θ)
y' = cy + (x - cx) · sin(θ) + (y - cy) · cos(θ)
```

---

## 使用示例

### 示例 1：旋转单个点

```json
{ "op": "point", "id": "A", "at": [3, 0] },
{ "op": "point", "id": "O", "at": [0, 0] },
{ "op": "rotate", "id": "A'", "point": "A", "center": "O", "angle": 90 }
// A' = (0, 3)
```

### 示例 2：旋转三角形

```json
{ "op": "point", "id": "A", "at": [2, 0] },
{ "op": "point", "id": "B", "at": [4, 0] },
{ "op": "point", "id": "C", "at": [3, 2] },
{ "op": "point", "id": "O", "at": [0, 0] },
{ "op": "rotate", "id": "A1", "point": "A", "center": "O", "angle": 90 },
{ "op": "rotate", "id": "B1", "point": "B", "center": "O", "angle": 90 },
{ "op": "rotate", "id": "C1", "point": "C", "center": "O", "angle": 90 },
{ "op": "triangle", "points": ["A1", "B1", "C1"], "labels": ["A'", "B'", "C'"] }
```

### 示例 3：中心对称（旋转 180°）

```json
{ "op": "point", "id": "A", "at": [3, 2] },
{ "op": "point", "id": "O", "at": [0, 0] },
{ "op": "rotate", "id": "A'", "point": "A", "center": "O", "angle": 180 }
// A' = (-3, -2)
```

### 示例 4：正三角形（旋转 120° × 2）

```json
{ "op": "point", "id": "A", "at": [3, 0] },
{ "op": "point", "id": "O", "at": [0, 0] },
{ "op": "rotate", "id": "B", "point": "A", "center": "O", "angle": 120 },
{ "op": "rotate", "id": "C", "point": "A", "center": "O", "angle": 240 },
{ "op": "triangle", "points": ["A", "B", "C"], "labels": ["A", "B", "C"] }
```

---

## 实施任务

### Task 1：类型定义
**文件**: `src/types/figure.ts`
- 新增 `OpRotate` 接口
- 在 `ConstructionOp` 联合类型中添加

### Task 2：引擎实现
**文件**: `src/utils/geoEngine.ts`
- 新增 `rotatePoint` 函数
- 在 `executeOp` 中添加 `'rotate'` case

### Task 3：验证
- 构建无错误
- 测试旋转点、旋转三角形、中心对称

---

## 文件清单

| 文件 | 改动 |
|------|------|
| `src/types/figure.ts` | 新增 OpRotate + 加入联合类型 |
| `src/utils/geoEngine.ts` | 新增 rotatePoint + executeOp case |

---

## 扩展考虑

未来可扩展：
- `rotate_figure`：整体旋转一组点（简化多点旋转）
- `rotate_copy`：旋转并保留原图形（用于旋转对称演示）

当前先做基础 `rotate`，满足初中需求。
