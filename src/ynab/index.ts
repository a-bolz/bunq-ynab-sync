// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping.js'

import type { Payment } from '../bunq/type.ts'

export async function getCreateTransactionParams (bunqRequest: Payment): Promise<any> {
  console.log('ding')
  return await getYnabParamsFromBunqPayload(bunqRequest)
}
