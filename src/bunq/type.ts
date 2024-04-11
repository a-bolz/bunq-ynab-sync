export interface BunqPayload {
  NotificationUrl: {
    category: 'MUTATION'
    object: {
      Payment: Payment
    }
  }
}

export interface Payment {
  id: number
  created: string
  updated: string
  monetary_account_id: number
  amount: Amount
  description: string
  type: string // can be "BUNQ"
  merchant_reference: null | string
  alias: Alias
  counterparty_alias: Alias
  balance_after_mutation: Amount
}

interface Amount {
  currency: Currency
  value: string
}

interface Alias {
  iban: string
  display_name: string
  country: string
}

type Currency = 'EUR'
