// Keep successful decodes shared across stage and companion. Failed requests can retry.
const decoded = new Map<string, { image: HTMLImageElement; promise: Promise<void> }>()
export function loadArt(src: string) {
  if (!decoded.has(src)) {
    const image = new Image()
    image.src = src
    const promise = image.decode().catch(error => { decoded.delete(src); throw error })
    decoded.set(src, { image, promise })
  }
  return decoded.get(src)!.promise
}
