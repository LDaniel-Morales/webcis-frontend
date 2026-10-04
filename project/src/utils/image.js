// Validación previa de imágenes con las mismas reglas de los Form Requests
// del backend (mimes:jpg,jpeg,png,webp · max en KB · dimensions:min_*). El
// backend sigue siendo quien valida: esto solo da el error en español antes
// de subir el archivo.
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
const IMAGE_MIME_TYPES = IMAGE_ACCEPT.split(',')

function readDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      reject(new Error('unreadable'))
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

// Devuelve un mensaje de error, o null si el archivo cumple las reglas.
export async function validateImageFile(file, { maxKB, minWidth = 0, minHeight = 0 }) {
  if (!IMAGE_MIME_TYPES.includes(file.type)) return 'Formato no permitido. Usa JPG, PNG o WEBP.'
  if (file.size > maxKB * 1024) return `La imagen pesa más de ${maxKB / 1024} MB.`

  try {
    const { width, height } = await readDimensions(file)
    if (width < minWidth || height < minHeight) {
      return `La imagen debe medir al menos ${minWidth}×${minHeight} px (la tuya mide ${width}×${height}).`
    }
  } catch {
    return 'No se pudo leer la imagen.'
  }

  return null
}

// Primer mensaje de error de validación de Laravel (422) para un campo.
export function firstFieldError(error, field) {
  return error?.data?.errors?.[field]?.[0] ?? null
}
