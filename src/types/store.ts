export interface Product {
  id: string
  name: string
  price: number
  cost: number
}

export interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  date: string
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
}

export type Section = 'dashboard' | 'sales' | 'expenses' | 'products'
