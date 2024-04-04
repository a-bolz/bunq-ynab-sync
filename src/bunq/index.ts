import { loadKey } from './keys.js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const bunqApiUrl = process.env['BUNQ_BASE_URL']!
const headers = {
  'Content-Type': 'application/json'
  // Other required headers as per the bunq API documentation
}

const privateKey = loadKey('private.pem')
const publicKey = loadKey('public.pem')

const requestBody = JSON.stringify({
  client_public_key: publicKey
})

console.log({ privateKey, publicKey, requestBody })

async function registerPublicKey () {
  try {
    const response = await fetch(bunqApiUrl, {
      method: 'POST',
      headers,
      body: requestBody
    })

    if (!response.ok) throw new Error('API call failed')
    const data = await response.json() as any
    console.log('Installation Token:', data.Response[1].Token.id)
    console.log('Server Public Key:', data.Response[2].ServerPublicKey.server_public_key)
  } catch (error) {
    console.error('Error registering public key:', error)
  }
}

registerPublicKey()
