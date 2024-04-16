import { createImportID, toMilliUnits } from './utils.js'
import { getPayees, getCategories } from './api.js'
import { normalizePayee } from './normalize-payee.js'
import accountMapping from '../../tmp/account-mapping.json' assert { type: 'json' }
import type { TransactionFlagColor } from 'ynab'
import type { Payment } from '../bunq/type.ts'
import type { SaveTransaction, Payee } from './types'

export async function getYnabParamsFromBunqPayload (bunqPayment: Payment): Promise<SaveTransaction> {
  const iban = bunqPayment.alias.iban as keyof typeof accountMapping
  const accountID = accountMapping[iban].ynabId
  if (!accountID) throw new Error(`Error establishing which ynab account the transaction belongs to  ${String(iban)}`)

  //  const isToSelf = isInternal(bunqPayment)

  const amount = getAmount(bunqPayment)

  const payee = await getYnabPayee(bunqPayment)

  const categoryID = await getYnabCategoryId(bunqPayment, payee)

  // const flagColor = getFlagColor(bunqPayment)

  return {
    amount,
    import_id: createImportID(),
    approved: true,
    cleared: 'cleared',
    account_id: accountID,
    date: new Date().toISOString(),
    payee_id: payee.id,
    payee_name: payee.name,
    ...(categoryID ? { category_id: categoryID } : {})
    // category_id: categoryID,
    // flag_color: flagColor,
  }
}

/*
export declare const TransactionFlagColor: {
    readonly Red: "red";
    readonly Orange: "orange";
    readonly Yellow: "yellow";
    readonly Green: "green";
    readonly Blue: "blue";
    readonly Purple: "purple";
};
*/
export function getFlagColor (bunqPayment: Payment): TransactionFlagColor | undefined {
/*
@TODO: nicetohave
  Assigns flag colors based on who or what initiated the spend
  Salma
  Andreas
  Creditcard
  Automatic bank transfer?
*/
  return bunqPayment && 'red'
}

/*
optimistic implementaiton assuming it works like so:
does this work like:
- call to ynab with name
  - if payee exists under that name, return payee_id
- otherwise just post name and new id will be created?
*/
export async function getYnabPayee (bunqPayment: Payment): Promise<Payee> {
  const counterParty = normalizePayee(bunqPayment.counterparty_alias.display_name)
  const existingPayees = await getPayees()
  const targetIban = bunqPayment.counterparty_alias.iban
  const knownAccount = accountMapping[targetIban as keyof typeof accountMapping]

  const existingPayee = existingPayees.find((payee) => {
    if (knownAccount) {
      // this is an internal transaction
      return payee.transfer_account_id === knownAccount.ynabId
    }
    return payee.name === counterParty
  })
  return existingPayee ?? {
    id: null,
    name: counterParty,
    deleted: false
  }
}

/*
Nice to have. Could be just a simple map that grows over time
*/
export async function getYnabCategoryId (bunqPayment: Payment, payee: Payee): Promise<string> {
  const categoryGroups = await getCategories()
  const what = false
  if (what) console.log(JSON.stringify({ categoryGroups }, null, 2))
  return bunqPayment && payee && ''
}

function getAmount (p: Payment): number {
  const { currency, value } = p.amount
  if (currency !== 'EUR') {
    throw new Error('Failure to handle non EURO currency transaction')
  }
  return toMilliUnits(value)
}
