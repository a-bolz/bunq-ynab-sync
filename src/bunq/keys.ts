import { createSign } from 'crypto'
import { readTmpFile } from './files'

export function generateSignature (method: string, endpoint: string, headers: object, body: string): string {
  // Example of constructing the data string to sign
  const dataToSign = `${method} ${endpoint}\n${Object.keys(headers).sort().map(key => `${key}: ${(headers as any)[key]}`).join('\n')}\n\n${body}`

  // Create the sign object with SHA-256
  const sign = createSign('SHA256')
  sign.update(dataToSign)
  sign.end()

  const privateKey = readTmpFile('private.pem')

  // Sign the data with the private key and output in base64
  const signature = sign.sign(privateKey, 'base64')

  return signature
}
