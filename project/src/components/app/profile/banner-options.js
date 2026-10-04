// Banners bundleados. El banner real se sube con PATCH /me/banner
// (user.banner); BANNER_OPTIONS[0] es solo el fondo por defecto mientras el
// usuario no tenga uno (ver ProfileView.vue).
import comunidad from '@/assets/images/home/hero-itver.jpg'
import academicas from '@/assets/images/home/carrucel/obj-2.jpeg'
import proyectos from '@/assets/images/home/carrucel/obj-4.jpeg'

export const BANNER_OPTIONS = [
  { src: comunidad, label: 'Comunidad WebCIS' },
  { src: academicas, label: 'Actividades académicas' },
  { src: proyectos, label: 'Proyectos y exposiciones' },
]
