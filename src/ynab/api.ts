import dotenv from 'dotenv'
import ynab from 'ynab'

import type { SaveTransaction, Payee } from './types'

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

/*
Edgecases to consider
- Bunq payments in different currencies
- Do internal transactions cause double callbacks? How to detect this
- How to normalize multiple albert heijn transactions to one single payee/name/id
- logic for finding payee id and name
*/
export async function createTransaction (transaction: SaveTransaction) {
  const ynabAPI = getYnabApi()
  const budgetID = process.env['YNAB_BUDGET_ID']
  if (!budgetID) {
    throw new Error(`
      Relevant YNAB budget id must be provided in env.
      manually invoke listBudgets to see available options
    `)
  }
  try {
    const result = await ynabAPI.transactions.createTransaction(budgetID, { transaction })
    console.log('succesfully created transaction', result)
  } catch (error) {
    console.log('Error creating transaction', error)
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

export async function getCategories (): Promise<Payee[]> {
  const ynabAPI = getYnabApi()
  const budgetID = process.env['YNAB_BUDGET_ID']
  if (!budgetID) {
    throw new Error(`
      Relevant YNAB budget id must be provided in env.
      manually invoke listBudgets to see available options
    `)
  }

  try {
    const response = await ynabAPI.categories.getCategories(budgetID)
    return response.data.category_groups
  } catch (error) {
    console.log('Error creating transaction', error)
    throw error
  }
}
