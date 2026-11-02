import { DocumentMetadata, ExportSettings } from '../types.js';

export function getMarginValues(margins: ExportSettings['margins']): string {
  switch (margins) {
    case 'compact':
      return '(x: 1.8cm, y: 1.8cm)';
    case 'wide':
      return '(x: 3.2cm, top: 3.0cm, bottom: 3.0cm)';
    case 'normal':
    default:
      return '(x: 2.5cm, top: 2.5cm, bottom: 2.5cm)';
  }
}

export function getFontFamilyForPreset(preset: ExportSettings['preset'], customFont?: string): string {
  if (customFont && customFont.trim().length > 0) {
    return `"${customFont.trim()}"`;
  }
  switch (preset) {
    case 'academic':
      return '("Source Serif 4", "Libertinus Serif", "Linux Libertine", "Times New Roman", "DejaVu Serif")';
    case 'technical':
      return '("Inter", "Roboto", "DejaVu Sans", "Helvetica Neue", "Arial")';
    case 'minimal':
      return '("Inter", "Newsreader", "Source Serif 4", "DejaVu Sans")';
    case 'research':
      return '("Libertinus Serif", "Source Serif 4", "Times New Roman", "DejaVu Serif")';
  }
}

export function generateTypstWrapper(
  metadata: DocumentMetadata,
  settings: ExportSettings
): { headerCode: string; footerCode: string } {
  const marginStr = getMarginValues(settings.margins);
  const fontStr = getFontFamilyForPreset(settings.preset, settings.fontFamily);
  const paperStr = settings.pageSize === 'us-letter' ? '"us-letter"' : settings.pageSize === 'a5' ? '"a5"' : '"a4"';
  const flippedStr = settings.orientation === 'landscape' ? 'flipped: true,' : '';
  const columns = settings.preset === 'research' && settings.twoColumn ? 2 : 1;

  // Header & Footer
  let headerDef = 'none';
  if (settings.headerText && settings.headerText.trim()) {
    headerDef = `[
      #align(right)[
        #text(size: 8.5pt, fill: rgb("#6b7280"), font: ${fontStr})[${escapeTypst(settings.headerText)}]
      ]
      #v(-2pt)
      #line(length: 100%, stroke: 0.4pt + rgb("#e5e7eb"))
    ]`;
  } else if (settings.preset === 'technical' && metadata.title && settings.includeTitle !== false) {
    headerDef = `[
      #grid(
        columns: (1fr, 1fr),
        align(left)[#text(size: 8.5pt, fill: rgb("#6b7280"), font: ${fontStr})[${escapeTypst(metadata.title)}]],
        align(right)[#text(size: 8.5pt, fill: rgb("#9ca3af"), font: ${fontStr})[Paperflow Documentation]]
      )
      #v(-2pt)
      #line(length: 100%, stroke: 0.4pt + rgb("#e5e7eb"))
    ]`;
  }

  let footerDef = 'none';
  const numberingPattern = settings.pageNumbering === 'none' ? 'none' : `"${settings.pageNumbering}"`;
  if (settings.pageNumbering !== 'none') {
    if (settings.footerText && settings.footerText.trim()) {
      footerDef = `(
        context [
          #line(length: 100%, stroke: 0.4pt + rgb("#e5e7eb"))
          #v(4pt)
          #grid(
            columns: (1fr, 1fr),
            align(left)[#text(size: 8.5pt, fill: rgb("#9ca3af"))[${escapeTypst(settings.footerText)}]],
            align(right)[#text(size: 8.5pt, fill: rgb("#6b7280"))[#counter(page).display(${numberingPattern})]]
          )
        ]
      )`;
    } else {
      footerDef = `(
        context [
          #align(center)[#text(size: 9pt, fill: rgb("#6b7280"))[#counter(page).display(${numberingPattern})]]
        ]
      )`;
    }
  }

  // Heading numbering
  const headingNumbering = settings.numberedHeadings ? '"1.1"' : 'none';

  // Equation numbering for academic & research presets
  const equationNumbering = (settings.preset === 'academic' || settings.preset === 'research') ? '"(1)"' : 'none';

  let headerCode = `
// --- Paperflow Generated Document ---
#set page(
  paper: ${paperStr},
  ${flippedStr}
  margin: ${marginStr},
  header: ${headerDef},
  footer: ${footerDef},
  columns: ${columns},
)

#set text(
  font: ${fontStr},
  size: ${settings.fontSize},
  lang: "en",
  fill: rgb("#111827"),
)

#set par(
  justify: true,
  leading: ${settings.lineSpacing * 0.45}em,
  spacing: ${settings.lineSpacing * 0.75}em,
)

#set heading(numbering: ${headingNumbering})
#show heading: set text(weight: 600, fill: rgb("#111827"))
#show heading: set block(above: 1.4em, below: 0.8em, sticky: true)

#let horizontalrule = [
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + rgb("#e2e8f0"))
  #v(0.8em)
]

#set math.equation(numbering: ${equationNumbering})

// Prevent nested equation numbering inside boxed equations and inline math
#show box: it => {
  set math.equation(numbering: none)
  it
}
#show rect: it => {
  set math.equation(numbering: none)
  it
}
#show math.equation.where(block: false): set math.equation(numbering: none)

// Prevent equation clipping across page breaks by keeping display equation blocks intact
#show math.equation.where(block: true): set block(
  breakable: false,
  above: 1.2em,
  below: 1.2em,
)

// Clean syntax-highlighted code block styling
#show raw.where(block: true): it => block(
  fill: rgb("#f8fafc"),
  stroke: 0.5pt + rgb("#e2e8f0"),
  inset: 10pt,
  radius: 4pt,
  width: 100%,
  [
    #set text(font: ("JetBrains Mono", "Fira Code", "DejaVu Sans Mono", "Consolas"), size: 9pt)
    #it
  ]
)

#show raw.where(block: false): it => box(
  fill: rgb("#f1f5f9"),
  inset: (x: 3pt, y: 1pt),
  outset: (y: 2pt),
  radius: 2pt,
  [
    #set text(font: ("JetBrains Mono", "Fira Code", "Consolas"), size: 9pt)
    #it
  ]
)

// Clean table styling
#set table(
  stroke: (x, y) => if y == 0 { (bottom: 1.2pt + rgb("#111827")) } else { (bottom: 0.4pt + rgb("#e2e8f0")) },
  fill: (x, y) => if y == 0 { rgb("#f8fafc") } else { none },
  inset: (x: 8pt, y: 7pt),
)

// Blockquote styling
#show quote: it => [
  #block(
    stroke: (left: 2.5pt + rgb("#b45309")),
    inset: (left: 12pt, y: 4pt),
    text(style: "italic", fill: rgb("#374151"))[#it.body]
  )
]
`;

  // Title block if metadata provided and includeTitle is not false
  if (settings.includeTitle !== false && metadata.title && metadata.title.trim()) {
    headerCode += `
#v(1em)
#align(center)[
  #text(size: 22pt, weight: "bold", font: ${fontStr})[${escapeTypst(metadata.title.trim())}]
  ${metadata.subtitle ? `\n#v(0.4em)\n#text(size: 13pt, fill: rgb("#4b5563"), font: ${fontStr})[${escapeTypst(metadata.subtitle.trim())}]` : ''}
  ${metadata.author ? `\n#v(0.8em)\n#text(size: 11pt, weight: 500)[${escapeTypst(metadata.author.trim())}]` : ''}
  ${metadata.date ? `\n#v(0.2em)\n#text(size: 9.5pt, fill: rgb("#6b7280"))[${escapeTypst(metadata.date.trim())}]` : ''}
]
#v(1.5em)
`;
  }

  // Abstract block
  if (metadata.abstract && metadata.abstract.trim()) {
    headerCode += `
#align(center)[
  #block(width: 85%, inset: (y: 8pt))[
    #text(weight: "bold", size: 10pt)[Abstract]
    #v(4pt)
    #text(size: 9.5pt, style: "italic", fill: rgb("#374151"))[${escapeTypst(metadata.abstract.trim())}]
  ]
]
#v(1.5em)
`;
  }

  // Table of contents if requested
  if (settings.includeToc) {
    headerCode += `
#outline(
  title: "Table of Contents",
  depth: ${settings.tocDepth || 3},
  indent: auto,
)
#v(2em)
#pagebreak()
`;
  }

  return {
    headerCode,
    footerCode: '',
  };
}

function escapeTypst(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*');
}
