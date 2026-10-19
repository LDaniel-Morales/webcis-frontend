export const NAV_ITEMS = {
  home: {
    label: 'Inicio',
    to: '/app',
    paths: ['M3 10.5 12 3l9 7.5', 'M5 9.5V20h14V9.5'],
  },
  courses: {
    label: 'Cursos',
    to: '/app/explorer',
    paths: ['M5 4.5h12.5A1.5 1.5 0 0 1 19 6v14H6.5A1.5 1.5 0 0 1 5 18.5z', 'M9 4.5V14l2.4-1.6L13.8 14V4.5'],
  },
  repository: {
    label: 'Repositorio',
    to: '/app/repository',
    ellipse: { cx: 12, cy: 6, rx: 7.5, ry: 3 },
    paths: ['M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6', 'M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3'],
  },
  create: {
    label: 'Crear contenido',
    to: '/app/repository/new',
    paths: ['M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z', 'M12 8.5v7M8.5 12h7'],
  },
  admin: {
    label: 'Administración',
    to: '/admin',
    paths: ['M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z', 'm9 12 2 2 4-4'],
  },
  profile: {
    label: 'Mi perfil',
    to: '/app/profile',
    circle: { cx: 12, cy: 8.5, r: 3.5 },
    paths: ['M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5'],
  },
}

export function isNavActive(currentPath, to) {
  if (to === '/app/explorer') return currentPath === to || currentPath.startsWith('/app/courses/')
  if (to === '/app/repository') {
    return currentPath === to || (currentPath.startsWith('/app/repository/') && currentPath !== '/app/repository/new')
  }
  return currentPath === to
}
