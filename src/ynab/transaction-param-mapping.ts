import { createImportID, toMilliUnits } from './utils.js'
import type { TransactionFlagColor } from 'ynab'
import type { Payment } from '../bunq/type.ts'
import type { SaveTransaction, Payee } from './types'

const accountMapping = {
  NL97BUNQ2291054317: {
    name: 'Monthlies',
    ynabId: '133f7c0e-a9a9-4a24-8c81-ddf7227d79c7'
  },
  NL28BUNQ2291054686: {
    name: 'Daily spending',
    ynabId: '6fa6d858-be01-43fe-a732-aaf05d867c0b'
  },
  NL22BUNQ2291054600: {
    name: 'Komposit',
    ynabId: '69dcce0e-124f-4a84-ad7c-4a6fd7c355ff'
  },
  NL72BUNQ2291054767: {
    name: 'TAX Reserve',
    ynabId: '7f642eaf-169e-4141-abd5-baf117157093'
  }
}

export async function getYnabParamsFromBunqPayload (bunqPayment: Payment): Promise<SaveTransaction> {
  const iban = bunqPayment.alias.iban as keyof typeof accountMapping
  const accountID = accountMapping[iban].ynabId
  if (!accountID) throw new Error('Error establishing which ynab account the transaction belongs to ' + iban)

  const amount = getAmount(bunqPayment)

  const payee = await getYnabPayee(bunqPayment)

  const categoryID = await getYnabCategoryId(bunqPayment, payee)

  const flagColor = getFlagColor(bunqPayment)

  return {
    amount,
    import_id: createImportID(),
    approved: true,
    cleared: 'cleared',
    account_id: accountID,
    date: new Date().toISOString(),
    payee_id: payee.id,
    payee_name: payee.name,
    category_id: categoryID,
    flag_color: flagColor,
    memo: ''
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
  console.log(bunqPayment)
  return 'red'
}

/*
optimistic implementaiton assuming it works like so:
does this work like:
- call to ynab with name
  - if payee exists under that name, return payee_id
- otherwise just post name and new id will be created?
*/
export async function getYnabPayee (bunqPayment: Payment): Promise<Payee> {
  console.log(bunqPayment)
  return {
    id: '',
    name: '',
    deleted: false
  }
}

/*
Nice to have. Could be just a simple map that grows over time
*/
export async function getYnabCategoryId (bunqPayment: Payment, payee: Payee): Promise<string> {
  console.log({ bunqPayment, payee })
  return ''
}

function getAmount (p: Payment): number {
  const { currency, value } = p.amount
  if (currency !== 'EUR') {
    throw new Error('Failure to handle non EURO currency transaction')
  }
  return toMilliUnits(value)
}
