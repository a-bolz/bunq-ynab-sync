// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping.js'
import { createTransaction } from './api.js'
import { writeLog } from '../bunq/files.js'

import type { Payment } from '../bunq/type.ts'

const isPayment = (arg: any): arg is Payment => {
  return typeof arg?.id === 'number' && typeof arg?.created === 'string'
}

export async function syncTransaction (bunqRequest: any): Promise<any> {
  try {
    const payment = bunqRequest?.NotificationUrl?.object?.Payment
    if (!isPayment(payment)) throw new Error('Non payment received!')

    const transactionParams = await getYnabParamsFromBunqPayload(payment)
    const createTransactionResult = await createTransaction(transactionParams)
    console.log('Succesfully created YNAB transaction', JSON.stringify(createTransactionResult, null, 2))
    writeLog(JSON.stringify({ bunqRequest, createTransactionResult }, null, 2))
  } catch (error) {
    console.log('error computing ynab transaction params', error)
    writeLog(JSON.stringify({ bunqRequest, transactionParams: { error } }, null, 2))
  }
}
