import dotenv from 'dotenv'
import ynab from 'ynab'
import type { TransactionFlagColor } from 'ynab'
import type { Payment } from '../bunq/type.ts'
// import mockRequest from '../mock_data/bunq_request_body.json' assert { type: 'json' }

dotenv.config()

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

const getYnabApi = () => {
  const accessToken = process.env['YNAB_ACCESS_TOKEN']
  if (!accessToken) throw new Error('YNAB ACCESS TOKEN MUST BE PROVIDED')
  return new ynab.API(accessToken)
}

export async function listBudgets () {
  const ynabAPI = getYnabApi()
  const budgetsResponse = await ynabAPI.budgets.getBudgets()
  const budgets = budgetsResponse.data.budgets
  for (const budget of budgets) {
    console.log(JSON.stringify(budget, null, 2))
  }
}

interface SaveTransaction {
  account_id: string
  //      * The transaction date in ISO format (e.g. 2016-12-01).  Future dates (scheduled transactions) are not permitted.  Split transaction dates cannot be changed and if a different date is supplied it will be ignored.
  date: string
  //      * The transaction amount in milliunits format.  Split transaction amounts cannot be changed and if a different amount is supplied it will be ignored.
  amount: number
  //      * The payee for the transaction.  To create a transfer between two accounts, use the account transfer payee pointing to the target account.  Account transfer payees are specified as `tranfer_payee_id` on the account resource.
  payee_id: string
  //      * The payee name.  If a `payee_name` value is provided and `payee_id` has a null value, the `payee_name` value will be used to resolve the payee by either (1) a matching payee rename rule (only if `import_id` is also specified) or (2) a payee with the same name or (3) creation of a new payee.
  payee_name: string | null
  memo: string | null
  category_id: string | null
  cleared: 'cleared'
  //      * Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.
  approved: boolean
  flag_color?: TransactionFlagColor
  //      * If specified, the new transaction will be assigned this `import_id` and considered "imported".  We will also attempt to match this imported transaction to an existing "user-entered" transation on the same account, with the same amount, and with a date +/-10 days from the imported transaction date.<br><br>Transactions imported through File Based Import or Direct Import (not through the API) are assigned an import_id in the format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'. For example, a transaction dated 2015-12-30 in the amount of -$294.23 USD would have an import_id of 'YNAB:-294230:2015-12-30:1'.  If a second transaction on the same account was imported and had the same date and same amount, its import_id would be 'YNAB:-294230:2015-12-30:2'.  Using a consistent format will prevent duplicates through Direct Import and File Based Import.<br><br>If import_id is omitted or specified as null, the transaction will be treated as a "user-entered" transaction. As such, it will be eligible to be matched against transactions later being imported (via DI, FBI, or API).
  // Should specify this as `BUNQ-AUTO-SYNC:${ generated-uuid }`
  import_id: string | null
}

export async function getAccounts () {
  const budgetID = process.env['YNAB_BUDGET_ID']
  const ynabAPI = getYnabApi()

  if (!budgetID) {
    throw new Error(`
      Relevant YNAB budget id must be provided in env.
      manually invoke listBudgets to see available options
    `)
  }

  const response = await ynabAPI.accounts.getAccounts(budgetID)

  console.log(JSON.stringify(response, null, 2))
}

function toMilliUnits (amount: string): number {
  return Number(amount) * 1000
}

function createImportID (): string {
  return `bunq-2-ynab:${new Date().toISOString()}`
}

/*
Edgecases to consider
- Bunq payments in different currencies
- Do internal transactions cause double callbacks? How to detect this
- How to normalize multiple albert heijn transactions to one single payee/name/id
- logic for finding payee id and name
*/

export async function createTransaction () {
  const ynabAPI = getYnabApi()
  const budgetID = process.env['YNAB_BUDGET_ID']
  if (!budgetID) {
    throw new Error(`
      Relevant YNAB budget id must be provided in env.
      manually invoke listBudgets to see available options
    `)
  }

  try {
    const payees = await getPayees()
    const payee = payees.find((p) => p.name === 'Kruidvat') as unknown as Payee
    const transaction: SaveTransaction = {
      // Get direct from mapping or find by name through request?
      account_id: '6fa6d858-be01-43fe-a732-aaf05d867c0b',
      date: new Date().toISOString(),
      amount: toMilliUnits('50.42'),
      payee_id: payee.id,
      payee_name: payee.name,
      category_id: '', // do this manually
      memo: '',
      cleared: 'cleared',
      approved: true,
      import_id: createImportID()
    }
    const response = await ynabAPI.transactions.createTransaction(budgetID, { transaction })

    console.log(JSON.stringify(response, null, 2))
  } catch (error) {
    console.log('Error creating transaction', error)
  }
}

export async function getYnabParamsFromBunqPayload (bunqPayment: Payment): Promise<Partial<SaveTransaction>> {
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
    flag_color: flagColor
  }
}

export async function getPayees (): Promise<Payee[]> {
  const ynabAPI = getYnabApi()
  const budgetID = process.env['YNAB_BUDGET_ID']
  if (!budgetID) {
    throw new Error(`
      Relevant YNAB budget id must be provided in env.
      manually invoke listBudgets to see available options
    `)
  }

  try {
    const response = await ynabAPI.payees.getPayees(budgetID)
    return response.data.payees
  } catch (error) {
    console.log('Error creating transaction', error)
    throw error
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

interface Payee {
  id: string
  name: string
  deleted: boolean
}

// createTransaction()
getAccounts()
