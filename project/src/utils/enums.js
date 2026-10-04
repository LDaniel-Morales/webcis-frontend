// Espejo de los enums int del backend (app/Enums en WebCIS).

// EnrollmentStatus: llega como int en EnrollmentResource.status.
export const ENROLLMENT_STATUS = {
  Enrolled: 0,
  InProgress: 1,
  Completed: 2,
  Dropped: 3,
}
