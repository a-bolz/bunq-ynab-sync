import { loadKey } from './keys.js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const bunqApiUrl = process.env['BUNQ_BASE_URL']!
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Andreas MBPRO'
}

// const privateKey = loadKey('private.pem')
async function registerPublicKey (): Promise<{ installationToken: string, serverPublicKey: string }> {
  const publicKey = loadKey('public.pem')
  const requestBody = JSON.stringify({
    client_public_key: publicKey
  })
  const response = await fetch(`${bunqApiUrl}installation`, {
    method: 'POST',
    headers,
    body: requestBody
  })
  const data = await response.json() as any

  if (!response.ok) {
    // Log detailed error information
    console.error('API call failed with status:', response.status)
    console.error('Error response body:', data)
    throw new Error(`API call failed: ${response.status}`)
  }
  const installationToken = String(data.Response[1].Token.id)
  const serverPublicKey = data.Response[2].ServerPublicKey.server_public_key
  return { installationToken, serverPublicKey }
}

async function registerDevice (installationToken: string) {
  const requestBody = JSON.stringify({
    description: 'my mb pro',
    secret: process?.env?.['BUNQ_API_KEY'],
    permitted_ips: ['213.93.46.208'] // my current ip i guess
  })

  console.log(requestBody)
  const response = await fetch(bunqApiUrl + 'device-server', {
    method: 'POST',
    headers: {
      ...headers,
      'X-Bunq-Client-Authentication': installationToken
    },
    body: requestBody
  })
  const data = await response.json() as any

  if (!response.ok) {
    // Log detailed error information
    console.error('API call failed with status:', response.status)
    console.error('Error response body:', data)
    throw new Error(`API call failed: ${response.status}`)
  }

  console.log(JSON.stringify(data, null, 2))
  return data
}

async function createSession (installationToken: string) {
  console.log(installationToken)
  // Prepare request to /session-server
}

// Example usage
async function setupBunqClient () {
  try {
    const { installationToken } = await registerPublicKey()
    await registerDevice(installationToken)
    await createSession(installationToken)
    console.log('Bunq client setup completed successfully.')
  } catch (error) {
    console.error('Failed to setup Bunq client:', error)
  }
}

setupBunqClient()
