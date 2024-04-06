import dotenv from 'dotenv'
import ynab from 'ynab'
// import mockRequest from '../mock_data/bunq_request_body.json' assert { type: 'json' }

dotenv.config()

const getYnabApi = () => {
  const accessToken = process.env['YNAB_ACCESS_TOKEN']
  if (!accessToken) throw new Error('YNAB ACCESS TOKEN MUST BE PROVIDED')
  return new ynab.API(accessToken)
}

(async function () {
  const ynabAPI = getYnabApi()
  const budgetsResponse = await ynabAPI.budgets.getBudgets()
  const budgets = budgetsResponse.data.budgets
  for (const budget of budgets) {
    console.log(`Budget Name: ${budget.name}`)
  }
})()
