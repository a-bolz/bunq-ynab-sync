import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { appendFile, mkdir } from 'fs/promises'

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

  if (!existsSync(path)) throw new Error('File does not exist')

  try {
    return readFileSync(path, 'utf-8')
  } catch (error) {
    console.log('Error reading file', path)
    throw error
  }
}

export const writeLog = async (logMessage: string) => {
  const date = new Date().toISOString().split('T')[0] // Get current date in ISO format without time
  const fileName = `${date}.txt` // Log file name with today's date

  // Construct the file path
  const logDirectory = join(
    getDirname(import.meta.url),
    '..',
    '..',
    'tmp',
    'log'
  )
  const filePath = join(logDirectory, fileName)

  try {
    // Ensure the log directory exists
    await mkdir(logDirectory, { recursive: true })

    // Append the log message to the file, create file if it does not exist
    await appendFile(filePath, logMessage + '\n')
    console.log('Log written successfully')
  } catch (error) {
    console.error('Failed to write log:', error)
  }
}
