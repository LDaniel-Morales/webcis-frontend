export const MOCK_NOTICE = 'Datos de ejemplo · Aún no se pueden crear materiales en el servidor'

const FILES = {
  manual: { name: 'Manual_POO_Cpp.pdf', ext: 'PDF', kind: 'Documento PDF', size: '4.8 MB' },
  slides: { name: 'Diapositivas_Unidad2.pptx', ext: 'PPTX', kind: 'Presentación', size: '6.2 MB' },
  source: { name: 'codigo_fuente.zip', ext: 'ZIP', kind: 'Archivo comprimido', size: '2.1 MB' },
  exercises: { name: 'ejercicios_resueltos.docx', ext: 'DOCX', kind: 'Documento Word', size: '1.5 MB' },
}

export const MOCK_MATERIALS = [
  {
    mat_serial: 'demo-1',
    mat_title: 'Manual de POO en C++',
    mat_code: 'MAT-POO-014',
    mat_publication_date: '2026-03-12',
    mat_description:
      'Material de apoyo para la asignatura de Programación II. Cubre los cuatro pilares de la POO con ejemplos completos en C++, ejercicios resueltos por unidad y un proyecto integrador de sistema de gestión escolar.',
    fk_materials_users: null,
    author_name: 'Prof. C. Méndez',
    type: 'Manual',
    category: 'POO',
    subject: 'Programación II',
    downloads: '1,248',
    total_size: '14.6 MB',
    files: [FILES.manual, FILES.slides, FILES.source, FILES.exercises],
  },
  {
    mat_serial: 'demo-2',
    mat_title: 'Práctica: Listas enlazadas',
    mat_code: 'PRA-ED-022',
    mat_publication_date: '2026-03-08',
    mat_description: 'Práctica guiada para implementar listas simples y dobles, con casos de prueba.',
    fk_materials_users: null,
    author_name: 'Prof. A. Ruiz',
    type: 'Práctica',
    category: 'Datos',
    subject: 'Estructuras de Datos',
    downloads: '642',
    total_size: '3.6 MB',
    files: [FILES.manual, FILES.exercises],
  },
  {
    mat_serial: 'demo-3',
    mat_title: 'Proyecto: API REST con Node',
    mat_code: 'PRO-WEB-007',
    mat_publication_date: '2026-03-02',
    mat_description: 'Proyecto completo de una API REST con autenticación, validaciones y pruebas.',
    fk_materials_users: null,
    author_name: 'L. Ortega',
    type: 'Proyecto',
    category: 'Web',
    subject: 'Desarrollo Web',
    downloads: '517',
    total_size: '9.8 MB',
    files: [FILES.source, FILES.slides, FILES.manual],
  },
  {
    mat_serial: 'demo-4',
    mat_title: 'Código base: Árbol AVL',
    mat_code: 'COD-ED-031',
    mat_publication_date: '2026-02-28',
    mat_description: 'Implementación comentada de un árbol AVL con rotaciones y recorridos.',
    fk_materials_users: null,
    author_name: 'D. Hernández',
    type: 'Código',
    category: 'Algoritmo',
    subject: 'Estructuras de Datos',
    downloads: '389',
    total_size: '2.1 MB',
    files: [FILES.source],
  },
  {
    mat_serial: 'demo-5',
    mat_title: 'Presentación: Patrones de diseño',
    mat_code: 'PRE-POO-019',
    mat_publication_date: '2026-02-21',
    mat_description: 'Diapositivas sobre patrones creacionales, estructurales y de comportamiento.',
    fk_materials_users: null,
    author_name: 'Prof. C. Méndez',
    type: 'Presentación',
    category: 'POO',
    subject: 'Programación II',
    downloads: '731',
    total_size: '6.2 MB',
    files: [FILES.slides],
  },
  {
    mat_serial: 'demo-6',
    mat_title: 'Tutorial: Git y control de versiones',
    mat_code: 'TUT-WEB-003',
    mat_publication_date: '2026-02-15',
    mat_description: 'Tutorial paso a paso de Git: ramas, merges, rebase y flujo con pull requests.',
    fk_materials_users: null,
    author_name: 'S. Vargas',
    type: 'Tutorial',
    category: 'Web',
    subject: 'Desarrollo Web',
    downloads: '905',
    total_size: '6.3 MB',
    files: [FILES.manual, FILES.exercises],
  },
]

export function isMockMaterialId(id) {
  return String(id).startsWith('demo-')
}

export function findMockMaterial(id) {
  return MOCK_MATERIALS.find((material) => material.mat_serial === String(id)) ?? null
}
