import { computed, ref, watch } from 'vue'
import type { FixedExpense, Product, Sale, StoreData } from '../types/store'

const STORAGE_KEY = 'doce-controle-data'

const initialData: StoreData = {
  products: [{ id: 'cupcake', name: 'Cupcake', price: 8, cost: 4.5 }],
  sales: [],
  expenses: [
    { id: 'internet', name: 'Internet', amount: 120 },
    { id: 'energia', name: 'Energia elétrica', amount: 230 },
    { id: 'agua', name: 'Água', amount: 90 },
  ],
}

function loadStoreData(): StoreData {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (!savedData) return initialData

  try {
    return JSON.parse(savedData) as StoreData
  } catch (error) {
    console.error('Não foi possível ler os dados salvos da loja.', error)
    return initialData
  }
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function useStoreData() {
  const savedData = loadStoreData()
  const products = ref<Product[]>(savedData.products)
  const sales = ref<Sale[]>(savedData.sales)
  const expenses = ref<FixedExpense[]>(savedData.expenses)

  watch(
    [products, sales, expenses],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products: products.value,
          sales: sales.value,
          expenses: expenses.value,
        } satisfies StoreData),
      )
    },
    { deep: true, immediate: true },
  )

  const monthlyFixedExpenses = computed(() =>
    expenses.value.reduce((total, expense) => total + expense.amount, 0),
  )

  function addSale(input: Omit<Sale, 'id' | 'productName' | 'unitPrice' | 'unitCost'>) {
    const product = products.value.find((item) => item.id === input.productId)
    if (!product) throw new Error('Selecione um produto válido para registrar a venda.')

    sales.value.unshift({
      ...input,
      id: createId(),
      productName: product.name,
      unitPrice: product.price,
      unitCost: product.cost,
    })
  }

  function removeSale(id: string) {
    sales.value = sales.value.filter((sale) => sale.id !== id)
  }

  function addExpense(input: Omit<FixedExpense, 'id'>) {
    expenses.value.push({ ...input, id: createId() })
  }

  function removeExpense(id: string) {
    expenses.value = expenses.value.filter((expense) => expense.id !== id)
  }

  function addProduct(input: Omit<Product, 'id'>) {
    products.value.push({ ...input, id: createId() })
  }

  function removeProduct(id: string) {
    products.value = products.value.filter((product) => product.id !== id)
  }

  return {
    products,
    sales,
    expenses,
    monthlyFixedExpenses,
    addSale,
    removeSale,
    addExpense,
    removeExpense,
    addProduct,
    removeProduct,
  }
}
