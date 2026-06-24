/**
 * LaTeX → 口语转换工具
 * 将数学公式转换为可读的中文语音文本
 */

// LaTeX 命令到口语的映射表
const LATEX_MAPPINGS: [RegExp, string | ((match: RegExpMatchArray) => string)][] = [
  // 分数: \frac{a}{b} → "b分之a"
  [/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_m: RegExpMatchArray) => {
    const [, num, den] = _m as RegExpMatchArray
    return `${readLatex(den)}分之${readLatex(num)}`
  }],

  // 平方根: \sqrt{x} → "x的平方根"
  [/\\sqrt\{([^}]+)\}/g, (_m: RegExpMatchArray) => {
    const [, content] = _m as RegExpMatchArray
    return `${readLatex(content)}的平方根`
  }],

  // 平方: x^{2} → "x的平方"
  [/\^\{2\}/g, '的平方'],

  // 立方: x^{3} → "x的立方"
  [/\^\{3\}/g, '的立方'],

  // n次方: x^{n} → "x的n次方"
  [/\^\{([^}]+)\}/g, (_m: RegExpMatchArray) => {
    const [, exp] = _m as RegExpMatchArray
    return `的${readLatex(exp)}次方`
  }],

  // 简单上标: x^2 → "x的平方"
  [/\^(\d)/g, (_m: RegExpMatchArray) => {
    const [, n] = _m as RegExpMatchArray
    if (n === '2') return '的平方'
    if (n === '3') return '的立方'
    return `的${n}次方`
  }],

  // 下标: x_{1} → "x下标1"
  [/_\{([^}]+)\}/g, (_m: RegExpMatchArray) => {
    const [, sub] = _m as RegExpMatchArray
    return `下标${readLatex(sub)}`
  }],

  // 简单下标: x_1 → "x下标1"
  [/_(\d)/g, (_m: RegExpMatchArray) => {
    const [, n] = _m as RegExpMatchArray
    return `下标${n}`
  }],

  // 运算符
  [/\\times/g, '乘以'],
  [/\\div/g, '除以'],
  [/\\pm/g, '加减'],
  [/\\mp/g, '减加'],
  [/\\cdot/g, '点乘'],
  [/\\leq/g, '小于等于'],
  [/\\geq/g, '大于等于'],
  [/\\neq/g, '不等于'],
  [/\\approx/g, '约等于'],
  [/\\equiv/g, '恒等于'],
  [/\\propto/g, '正比于'],
  [/\\infty/g, '无穷大'],
  [/\\pi/g, 'π'],
  [/\\alpha/g, '阿尔法'],
  [/\\beta/g, '贝塔'],
  [/\\gamma/g, '伽马'],
  [/\\delta/g, '德尔塔'],
  [/\\theta/g, '西塔'],
  [/\\lambda/g, '兰布达'],
  [/\\mu/g, '缪'],
  [/\\rho/g, '柔'],
  [/\\sigma/g, '西格玛'],
  [/\\omega/g, '欧米伽'],
  [/\\Delta/g, '德尔塔'],
  [/\\Omega/g, '欧米伽'],
  [/\\Sigma/g, '西格玛'],
  [/\\angle/g, '角'],
  [/\\triangle/g, '三角形'],
  [/\\perp/g, '垂直于'],
  [/\\parallel/g, '平行于'],
  [/\\therefore/g, '所以'],
  [/\\because/g, '因为'],
  [/\\Rightarrow/g, '推出'],
  [/\\Leftarrow/g, '被推出'],
  [/\\Leftrightarrow/g, '等价于'],
  [/\\rightarrow/g, '到'],
  [/\\leftarrow/g, '从左到'],
  [/\\in/g, '属于'],
  [/\\notin/g, '不属于'],
  [/\\subset/g, '包含于'],
  [/\\cup/g, '并集'],
  [/\\cap/g, '交集'],
  [/\\emptyset/g, '空集'],
  [/\\forall/g, '任意'],
  [/\\exists/g, '存在'],
  [/\\circ/g, '度'],
  [/\\degree/g, '度'],
  [/\\%/, '百分之'],

  // 括号
  [/\\left\(/g, ''],
  [/\\right\)/g, ''],
  [/\\left\[/g, ''],
  [/\\right\]/g, ''],
  [/\\left\\\{/g, ''],
  [/\\right\\\}/g, ''],
  [/\\left\|/g, ''],
  [/\\right\|/g, ''],

  // 其他
  [/\\ldots/g, '等等'],
  [/\\cdots/g, '等等'],
  [/\\vdots/g, ''],
  [/\\ddots/g, ''],
  [/\\text\{([^}]+)\}/g, '$1'],
  [/\\mathrm\{([^}]+)\}/g, '$1'],
  [/\\mathbf\{([^}]+)\}/g, '$1'],
]

/**
 * 将 LaTeX 字符串转换为可读口语
 */
export function latexToSpeech(latex: string): string {
  let result = latex

  // 移除 $$ 和 $ 标记
  result = result.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '')

  // 应用所有映射规则
  for (const [pattern, replacement] of LATEX_MAPPINGS) {
    if (typeof replacement === 'function') {
      result = result.replace(pattern, (...args) => {
        return replacement(args as unknown as RegExpMatchArray)
      })
    } else {
      result = result.replace(pattern, replacement)
    }
  }

  // 清理残余的反斜杠命令
  result = result.replace(/\\[a-zA-Z]+/g, ' ')

  // 清理花括号
  result = result.replace(/[{}]/g, '')

  // 清理多余空格
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

/**
 * 读取 LaTeX 内容（递归）
 */
function readLatex(content: string): string {
  return latexToSpeech(content)
}

/**
 * 将完整题目文本（含 LaTeX 公式）转换为口语
 * $...$ 和 $$...$$ 内的内容会被自动转换
 */
export function questionToSpeech(text: string): string {
  let result = text

  // 处理 block math: $$...$$
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    return latexToSpeech(latex)
  })

  // 处理 inline math: $...$
  result = result.replace(/\$([^$]+)\$/g, (_, latex) => {
    return latexToSpeech(latex)
  })

  // 清理 HTML 标签
  result = result.replace(/<[^>]+>/g, '')

  // 清理多余空格
  result = result.replace(/\s+/g, ' ').trim()

  return result
}
