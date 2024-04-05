import { loadKey, generateSignature } from './keys.js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const bunqApiUrl = process.env['BUNQ_BASE_URL']!

// const privateKey = loadKey('private.pem')

/**
 * Registers the public key with the bunq API to initiate an installation.
   *
   * This method POSTs the client's public key to the /installation endpoint.
   * It's the initial step required to set up communication with the bunq API,
   * as it informs the server about the public key used for signing all future API calls.
   * this returns data like
   *  {
   *    "Id": {
   *      "id": 0
   *    },
   *    "Token": {
   *      "id": 0,
   *      "created": "string",
   *      "updated": "string",
   *      "token": "string"
   *    },
   *    "ServerPublicKey": {
   *      "server_public_key": "string"
   *    }
   *  }
   *
   * see https://doc.bunq.com/#/installation/CREATE_Installation
   *
   * Note:
 * - This is the only API call that does not require "X-Bunq-Client-Authentication" and "X-Bunq-Client-Signature" headers.
   * - The "Content-Type" and "User-Agent" headers must be set for this request.
   * - It's recommended to include "X-Bunq-Language" and "X-Bunq-Region" headers for localization.
   * - The "X-Bunq-Client-Request-Id" header should contain a unique ID for the request,
   *   and "X-Bunq-Geolocation" must specify the geolocation of the device, or be zero valued if unknown.
   *
   * On success, the method returns an object containing:
 * - `installationToken`: A token used for authenticating the registration of a new device and session.
   * - `serverPublicKey`: The server's public key, used to verify server responses.
   *
   * @returns Promise<{ installationToken: string, serverPublicKey: string }>
   */
async function registerPublicKey (): Promise<{ installationToken: string, serverPublicKey: string }> {
  const publicKey = loadKey('public.pem')
  const requestBody = JSON.stringify({
    client_public_key: publicKey
  })
  const response = await fetch(`${bunqApiUrl}/installation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Andreas MBPRO'

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

  return {
    installationToken: data.Response[1].Token.token,
    serverPublicKey: data.Response[2].ServerPublicKey.server_public_key
  }
}

/**
 * Registers a new DeviceServer with the bunq API, binding the API key to the device's IP address.
   *
   * This method POSTs to the /device-server endpoint, providing the installation token in the header
 * and signing the request with the private part of the key used to create the installation.
   * The API Key used is then bound to the IP address of the created DeviceServer.
   *
   * Note:
 * - Requires "X-Bunq-Client-Authentication" header to be set with the installation token.
   * - The "Content-Type" and "User-Agent" headers must be provided.
   * - Optionally, "X-Bunq-Language", "X-Bunq-Region", "X-Bunq-Client-Request-Id", and "X-Bunq-Geolocation"
 *   headers can be included for localization and unique request identification.
   * - The request body must include a "description" for the device, the "secret" (API Key),
   *   and optionally, "permitted_ips" for binding the API key to specific IP addresses.
   *   Using a Wildcard API Key allows API calls even if the IP address changes post registration.
   *
   * Successful registration is necessary for performing a login call with /session-server.
   *
   * @param {string} installationToken - The installation token obtained from a successful /installation call.
   * @returns The response includes an "id" for the newly created DeviceServer.
   *
   * For more information on handling dynamic IPs with API keys, visit: https://bunq.com/en/apikey-dynamic-ip
 */
async function registerDevice (installationToken: string) {
  const requestBody = JSON.stringify({
    description: 'my mb pro',
    secret: process?.env?.['BUNQ_API_KEY'],
    permitted_ips: ['213.93.46.208'] // my current ip i guess
  })

  const response = await fetch(`${bunqApiUrl}/device-server`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Andreas MBPRO',
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

  return { deviceServerId: data?.Response?.[0].Id.id }
}

/**
 * Creates a new session for a DeviceServer.
   *
   * This method sends a POST request to the /session-server endpoint to start a new session.
   * An installation token must be provided in the "X-Bunq-Client-Authentication" header for authentication.
   * Additionally, the request must be signed with the private part of the key pair used for the installation.
   *
   * The response includes a session token, which should be used as the "X-Bunq-Client-Authentication"
 * header value for all subsequent API calls. The IP address making this call needs to match the IP address
 * bound to your API key. If using a Wildcard API Key, the IP address binding is not enforced.
   *
   * Parameters:
 * - The "Content-Type", "User-Agent", "X-Bunq-Language", "X-Bunq-Region", and "X-Bunq-Client-Request-Id"
 *   headers should be set accordingly.
   *
   * The request body should contain the "secret", which is the API Key associated with your bunq account.
   *
   * On success, the method initializes a session that expires based on your account's Auto Logout settings,
   * with a default of 1 week. If a request is made within 30 seconds before a session expires,
   * it will be extended from that moment by your auto logout time, but never by more than 5 minutes.
   *
   * @param {string} installationToken - The installation token obtained from a successful /installation call.
   * @returns A promise that resolves with the session token and user information upon successful session creation.
   */
async function createSession (installationToken: string): Promise<string> {
  const method = 'POST'
  const endpoint = '/session-server'
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Andreas MBPRO', // Customize with your actual User-Agent
    'X-Bunq-Client-Authentication': installationToken
  }
  const body = JSON.stringify({
    secret: process.env['BUNQ_API_KEY'] // Your bunq API Key
  })

  const signature = generateSignature(method, endpoint, headers, body)

  const response = await fetch(`${bunqApiUrl}${endpoint}`, {
    method,
    headers: {
      ...headers,
      'X-Bunq-Client-Signature': signature
    },
    body
  })

  const data = await response.json() as any

  if (!response.ok) {
    console.error('API call failed with status:', response.status)
    console.error('Error response body:', data)
    throw new Error(`API call failed: ${response.status}`)
  }

  console.log('Session created successfully:', JSON.stringify(data, null, 2))
  // Extract and return the session token from the response for future API calls
  const sessionToken = data?.Response[1].Token.token // Adjust based on actual API response structure
  return sessionToken
}

// Example usage
async function setupBunqClient () {
  try {
    console.log('attempting to register public key \n')
    const { installationToken } = await registerPublicKey()
    console.log('public key registered succsefully', installationToken, '\n')

    console.log('attempting to register device \n')
    const { deviceServerId } = await registerDevice(installationToken)
    console.log(`succesfully registerd device: id = ${deviceServerId} \n`)

    console.log('Creating session \n')
    await createSession(installationToken)
    console.log('Bunq client setup completed successfully.')
  } catch (error) {
    console.error('Failed to setup Bunq client:', error)
  }
}

setupBunqClient()
