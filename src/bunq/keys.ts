import { createSign } from 'crypto'
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

export function generateSignature (method: string, endpoint: string, headers: object, body: string): string {
  // Example of constructing the data string to sign
  const dataToSign = `${method} ${endpoint}\n${Object.keys(headers).sort().map(key => `${key}: ${(headers as any)[key]}`).join('\n')}\n\n${body}`

  // Create the sign object with SHA-256
  const sign = createSign('SHA256')
  sign.update(dataToSign)
  sign.end()

  const privateKey = loadKey('private.pem')

  // Sign the data with the private key and output in base64
  const signature = sign.sign(privateKey, 'base64')

  return signature
}
