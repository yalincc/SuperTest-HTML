/**
 * 公式标准化函数
 * 将学生输入和标准答案统一转换为可比较的格式
 */

// Unicode 下标数字 → 普通数字
const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
}

// Unicode 上标数字 → 普通数字
const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
}

/**
 * 标准化公式字符串
 */
export function normalizeFormula(input: string): string {
  let result = input.trim()

  // 下标数字 → 普通数字
  result = result.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => SUBSCRIPT_MAP[c] || c)

  // 上标数字 → 普通数字
  result = result.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => SUPERSCRIPT_MAP[c] || c)

  // 科学记数法统一: "×10" 或 "x10" → "e"
  result = result.replace(/[×x]\s*10\s*\^?\s*/gi, 'e')

  // 去除多余空格
  result = result.replace(/\s+/g, '')

  return result
}

/**
 * 判断学生答案是否正确
 * 优先精确匹配，然后标准化匹配，最后 alternatives 匹配
 */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  alternatives?: string[]
): boolean {
  const userNorm = normalizeFormula(userAnswer)
  const correctNorm = normalizeFormula(correctAnswer)

  if (userAnswer.trim() === correctAnswer.trim()) return true
  if (userNorm === correctNorm) return true

  if (alternatives && alternatives.length > 0) {
    for (const alt of alternatives) {
      if (userAnswer.trim() === alt.trim()) return true
      if (userNorm === normalizeFormula(alt)) return true
    }
  }

  return false
}
