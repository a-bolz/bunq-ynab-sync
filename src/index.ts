import express from 'express'
import ngrok from '@ngrok/ngrok'
import dotenv from 'dotenv'
import { idempotentlyRegisterCallback } from './bunq/index.js'
import { syncTransaction } from './ynab/index.js'

dotenv.config()

const PORT_ADDRESS = process.env['PORT_ADDRESS'] ?? 8080
const NGROK_AUTHTOKEN = process.env['NGROK_AUTHTOKEN']

if (!NGROK_AUTHTOKEN) throw new Error('An ngrok authtoken must be provided')

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

app.post('/', async (req, res) => {
  console.log('Received a POST request')
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.originalUrl}`)
  console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`)
  // Log the body of the POST request
  console.log(`Body: ${JSON.stringify(req.body, null, 2)}`)
  syncTransaction(req.body)

  res.send('POST request received')
})

app.listen(PORT_ADDRESS, () => {
  console.log(`Server listening on port ${PORT_ADDRESS}...`)
})

// Get your endpoint online
ngrok.connect({ addr: PORT_ADDRESS, authtoken: NGROK_AUTHTOKEN })
  .then(async (listener) => {
    console.log(`Ingress established at: ${listener.url()}`)
    // Deregister and register callbacks with the new URL

    await idempotentlyRegisterCallback(listener.url()!)
  })
  .catch(error => {
    console.error('Error establishing ngrok connection:', error)
  })
