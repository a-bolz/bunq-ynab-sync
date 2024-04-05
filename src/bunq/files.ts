import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { writeFileSync, readFileSync } from 'fs'

export function getDirname (metaUrl: string): string {
  const filename = fileURLToPath(metaUrl)
  return dirname(filename)
}

export function writeTmpFile (fileName: string, data: string) {
  const path = join(
    getDirname(import.meta.url),
    '..',
    '..',
    'tmp',
    fileName
  )
  try {
    writeFileSync(path, data, 'utf-8')
  } catch (error) {
    console.log('Error writing file to', path)
    throw error
  }
}

export function readTmpFile (fileName: string) {
  const path = join(
    getDirname(import.meta.url),
    '..',
    '..',
    'tmp',
    fileName
  )
  try {
    return readFileSync(path, 'utf-8')
  } catch (error) {
    console.log('Error reading file', path)
    throw error
  }
}
