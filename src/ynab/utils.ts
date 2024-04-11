export function toMilliUnits (amount: string): number {
  return Number(amount) * 1000
}

export function createImportID (): string {
  return `bunq-2-ynab:${new Date().toISOString()}`
}
