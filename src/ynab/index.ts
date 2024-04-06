import dotenv from 'dotenv'
import ynab from 'ynab'
import type { PostTransactionsWrapper, TransactionFlagColor } from 'ynab'
// import mockRequest from '../mock_data/bunq_request_body.json' assert { type: 'json' }

dotenv.config()

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
  //      * The category for the transaction.  To configure a split transaction, you can specify null for `category_id` and provide a `subtransactions` array as part of the transaction object.  If an existing transaction is a split, the `category_id` cannot be changed.  Credit Card Payment categories are not permitted and will be ignored if supplied.
  category_id: string | null
  memo: string | null
  cleared: 'cleared'
  //      * Whether or not the transaction is approved.  If not supplied, transaction will be unapproved by default.
  approved: boolean
  flag_color: TransactionFlagColor
  //      * If specified, the new transaction will be assigned this `import_id` and considered "imported".  We will also attempt to match this imported transaction to an existing "user-entered" transation on the same account, with the same amount, and with a date +/-10 days from the imported transaction date.<br><br>Transactions imported through File Based Import or Direct Import (not through the API) are assigned an import_id in the format: 'YNAB:[milliunit_amount]:[iso_date]:[occurrence]'. For example, a transaction dated 2015-12-30 in the amount of -$294.23 USD would have an import_id of 'YNAB:-294230:2015-12-30:1'.  If a second transaction on the same account was imported and had the same date and same amount, its import_id would be 'YNAB:-294230:2015-12-30:2'.  Using a consistent format will prevent duplicates through Direct Import and File Based Import.<br><br>If import_id is omitted or specified as null, the transaction will be treated as a "user-entered" transaction. As such, it will be eligible to be matched against transactions later being imported (via DI, FBI, or API).
  // Should specify this as `BUNQ-AUTO-SYNC:${ generated-uuid }`
  import_id: string | null
}

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
    const transaction: SaveTransaction = {}
    const response = await ynabAPI.transactions.createTransaction(budgetID, { transaction })

    console.log(JSON.stringify(response, null, 2))
  } catch (error) {
    console.log('Error creating transaction', error)
  }
}

createTransaction()
