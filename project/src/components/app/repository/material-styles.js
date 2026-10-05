const NEUTRAL = 'bg-[#eef0f3] text-[#5b6675]'

const DOCUMENT_ICON = ['M7 3h7l5 5v13H7z', 'M14 3v5h5']

const TYPE_STYLES = {
  Manual: { classes: 'bg-tag-datos-bg text-tag-datos-fg', icon: DOCUMENT_ICON },
  Práctica: {
    classes: 'bg-tag-web-bg text-tag-web-fg',
    icon: ['M9 11l3 3 8-8', 'M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9'],
  },
  Proyecto: {
    classes: 'bg-tag-algoritmo-bg text-tag-algoritmo-fg',
    icon: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  },
  Código: {
    classes: 'bg-tag-poo-bg text-tag-poo-fg',
    icon: ['m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14'],
  },
  Presentación: {
    classes: 'bg-oro-faint text-cobre-digital',
    icon: ['M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M12 17v4M8 21h8'],
  },
  Tutorial: {
    classes: 'bg-[#e7ecf5] text-[#2f5da3]',
    icon: ['M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z', 'M9 4.5V14l2.4-1.6L13.8 14V4.5'],
  },
}

const CATEGORY_STYLES = {
  POO: 'bg-tag-poo-bg text-tag-poo-fg',
  Algoritmo: 'bg-tag-algoritmo-bg text-tag-algoritmo-fg',
  Web: 'bg-tag-web-bg text-tag-web-fg',
  Datos: 'bg-tag-datos-bg text-tag-datos-fg',
}

const FILE_STYLES = {
  PDF: 'bg-[#610d31]/10 text-[#610d31]',
  PPTX: 'bg-oro-faint text-cobre-digital',
  ZIP: 'bg-tag-web-bg text-tag-web-fg',
  DOCX: 'bg-tag-poo-bg text-tag-poo-fg',
}

export function typeStyle(type) {
  return TYPE_STYLES[type] ?? { classes: NEUTRAL, icon: DOCUMENT_ICON }
}

export function categoryClasses(category) {
  return CATEGORY_STYLES[category] ?? NEUTRAL
}

export function fileClasses(ext) {
  return FILE_STYLES[ext] ?? NEUTRAL
}
