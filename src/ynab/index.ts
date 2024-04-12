// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping.js'
import { writeLog } from '../bunq/files.js'

import type { Payment } from '../bunq/type.ts'

const isPayment = (arg: any): arg is Payment => {
  return typeof arg?.id === 'string' && typeof arg?.created === 'string'
}

export async function getCreateTransactionParams (bunqRequest: any): Promise<any> {
  try {
    const payment = bunqRequest?.Body?.NotificationUrl?.object?.Payment
    if (!isPayment(payment)) throw new Error('Non payment received!')

    console.log('this is what the payment is', JSON.stringify(payment, null, 2))

    const transactionParams = await getYnabParamsFromBunqPayload(payment)
    console.log('computed transaction params are', transactionParams)
    writeLog(JSON.stringify({ bunqRequest, transactionParams }, null, 2))
  } catch (error) {
    console.log('error computing ynab transaction params', error)
    writeLog(JSON.stringify({ bunqRequest, transactionParams: { error } }, null, 2))
  }
}
