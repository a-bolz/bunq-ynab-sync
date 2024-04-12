// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping.js'
import { createTransaction } from './api.js'
import { writeLog } from '../bunq/files.js'

import type { Payment } from '../bunq/type.ts'

const isPayment = (arg: any): arg is Payment => {
  return typeof arg?.id === 'number' && typeof arg?.created === 'string'
}

export async function getCreateTransactionParams (bunqRequest: any): Promise<any> {
  try {
    const payment = bunqRequest?.NotificationUrl?.object?.Payment
    if (!isPayment(payment)) throw new Error('Non payment received!')

    console.log('this is what the payment is', JSON.stringify(payment, null, 2))

    const transactionParams = await getYnabParamsFromBunqPayload(payment)
    const createTransactionResult = await createTransaction(transactionParams)
    console.log('computed transaction params are', transactionParams)
    writeLog(JSON.stringify({ bunqRequest, createTransactionResult }, null, 2))
  } catch (error) {
    console.log('error computing ynab transaction params', error)
    writeLog(JSON.stringify({ bunqRequest, transactionParams: { error } }, null, 2))
  }
}

// for (const todo of todos.slice(0, 1)) {
//  const payment = todo.Payment as unknown as Payment
//  getYnabParamsFromBunqPayload(payment)
//    .then((params) => {
//      console.log(JSON.stringify({ payment: todo, params }, null, 2))
//      createTransaction(params)
//    })
// }
