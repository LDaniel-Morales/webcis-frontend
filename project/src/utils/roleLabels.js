// Etiquetas visibles para `user.type` de UserResource (nombre del case de
// UserType en el backend).
export const ROLE_LABELS = {
  Student: 'Alumno',
  Professor: 'Profesor',
  Extern: 'Egresado',
  Admin: 'Administrador',
}

export function roleLabel(type) {
  return ROLE_LABELS[type] ?? ''
}
