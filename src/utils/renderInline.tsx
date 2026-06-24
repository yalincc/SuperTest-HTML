import katex from 'katex'

const KATEX_OPTIONS = { throwOnError: false, displayMode: false }

function renderLatex(latex: string, display: boolean): JSX.Element {
  const html = katex.renderToString(latex, { ...KATEX_OPTIONS, displayMode: display })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function renderInline(text: string): (string | JSX.Element)[] {
  if (!text) return []

  const tokens: (string | JSX.Element)[] = []
  let remaining = text

  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[^*]+?\*\*|\*[^*]+?\*)/g
  let match
  let lastIndex = 0

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(remaining.slice(lastIndex, match.index))
    }

    const m = match[0]
    if (m.startsWith('$$') && m.endsWith('$$')) {
      tokens.push(renderLatex(m.slice(2, -2).trim(), true))
    } else if (m.startsWith('$') && m.endsWith('$') && !m.startsWith('$$')) {
      tokens.push(renderLatex(m.slice(1, -1).trim(), false))
    } else if (m.startsWith('**') && m.endsWith('**')) {
      tokens.push(<strong key={tokens.length} className="font-bold">{m.slice(2, -2)}</strong>)
    } else if (m.startsWith('*') && m.endsWith('*')) {
      tokens.push(<em key={tokens.length} className="italic">{m.slice(1, -1)}</em>)
    } else {
      tokens.push(m)
    }

    lastIndex = match.index + m.length
  }

  if (lastIndex < remaining.length) {
    tokens.push(remaining.slice(lastIndex))
  }

  return tokens
}
