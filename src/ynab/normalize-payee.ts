export const normalizePayee = (name: string): string => {
/*
Business logic here for lumping together similar enough payees when necessary
*/
  const mappedName = simplifications.find((s) => s.pattern.test(name))
  return mappedName ? mappedName.result : name
}

const simplifications = [
  {
    result: 'Zeeman',
    pattern: /zeeman/i
  }
]
