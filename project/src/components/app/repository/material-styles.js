const NEUTRAL = { bg: '#eef0f3', fg: '#5b6675' }

const DOCUMENT_ICON = ['M7 3h7l5 5v13H7z', 'M14 3v5h5']

const TYPE_STYLES = {
  Manual: { bg: 'var(--color-tag-datos-bg)', fg: 'var(--color-tag-datos-fg)', icon: DOCUMENT_ICON },
  Práctica: {
    bg: 'var(--color-tag-web-bg)',
    fg: 'var(--color-tag-web-fg)',
    icon: ['M9 11l3 3 8-8', 'M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9'],
  },
  Proyecto: {
    bg: 'var(--color-tag-algoritmo-bg)',
    fg: 'var(--color-tag-algoritmo-fg)',
    icon: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  },
  Código: {
    bg: 'var(--color-tag-poo-bg)',
    fg: 'var(--color-tag-poo-fg)',
    icon: ['m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14'],
  },
  Presentación: {
    bg: 'var(--color-oro-faint)',
    fg: 'var(--color-cobre-digital)',
    icon: ['M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M12 17v4M8 21h8'],
  },
  Tutorial: {
    bg: '#e7ecf5',
    fg: '#2f5da3',
    icon: ['M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z', 'M9 4.5V14l2.4-1.6L13.8 14V4.5'],
  },
}

const CATEGORY_STYLES = {
  POO: { bg: 'var(--color-tag-poo-bg)', fg: 'var(--color-tag-poo-fg)' },
  Algoritmo: { bg: 'var(--color-tag-algoritmo-bg)', fg: 'var(--color-tag-algoritmo-fg)' },
  Web: { bg: 'var(--color-tag-web-bg)', fg: 'var(--color-tag-web-fg)' },
  Datos: { bg: 'var(--color-tag-datos-bg)', fg: 'var(--color-tag-datos-fg)' },
}

const FILE_STYLES = {
  PDF: { bg: 'rgba(97, 13, 49, 0.1)', fg: '#610D31' },
  PPTX: { bg: 'var(--color-oro-faint)', fg: 'var(--color-cobre-digital)' },
  ZIP: { bg: 'var(--color-tag-web-bg)', fg: 'var(--color-tag-web-fg)' },
  DOCX: { bg: 'var(--color-tag-poo-bg)', fg: 'var(--color-tag-poo-fg)' },
}

export function typeStyle(type) {
  return TYPE_STYLES[type] ?? { ...NEUTRAL, icon: DOCUMENT_ICON }
}

export function categoryStyle(category) {
  return CATEGORY_STYLES[category] ?? NEUTRAL
}

export function fileStyle(ext) {
  return FILE_STYLES[ext] ?? NEUTRAL
}
