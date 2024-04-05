import { createSign } from 'crypto'
import { readTmpFile } from './files.js'

export function generateSignature (body: string): string {
  // Example of constructing the data string to sign
  // Create the sign object with SHA-256
  const sign = createSign('SHA256')
  sign.update(body)
  sign.end()

  const privateKey = readTmpFile('private.pem')

  // Sign the data with the private key and output in base64
  const signature = sign.sign(privateKey, 'base64')

  return signature
}
