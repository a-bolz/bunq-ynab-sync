import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

function getDirname (metaUrl: string): string {
  const filename = fileURLToPath(metaUrl)
  return dirname(filename)
}

export function loadKey (fileName: string): string {
  const path = join(getDirname(import.meta.url), '..', '..', 'keys', fileName)
  try {
    return readFileSync(path, 'utf-8')
  } catch (error) {
    console.log(`Error reading the key from ${path}`, error)
    throw error
  }
}
