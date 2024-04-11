// do stuff here
import { getYnabParamsFromBunqPayload } from './transaction-param-mapping'

import type { Payment } from '../bunq/type.ts'

export async function getCreateTransactionParams (bunqRequest: Payment): Promise<any> {
  return await getYnabParamsFromBunqPayload(bunqRequest)
}
