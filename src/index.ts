import dotenv from 'dotenv'
import * as bunq from './bunq/index.js'

dotenv.config()

const hello = (arg: string): void => {
  console.log(bunq)
  console.log(arg)
  bunq.registerCallbacks()
}

hello('world')
