// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping.js'
import { writeLog } from '../bunq/files.js'

import type { Payment } from '../bunq/type.ts'

export async function getCreateTransactionParams (bunqRequest: Payment): Promise<any> {
  try {
    const transactionParams = await getYnabParamsFromBunqPayload(bunqRequest)
    console.log('computed transaction params are', transactionParams)
    writeLog(JSON.stringify({ bunqRequest, transactionParams }, null, 2))
  } catch (error) {
    console.log('error computing ynab transaction params', error)
    writeLog(JSON.stringify({ bunqRequest, transactionParams: { error } }, null, 2))
  }
}
