import { computed, ref } from 'vue'
import type { FixedExpense, Product, Sale } from '../types/store'
import { deleteById, getErrorMessage, getJson, postJson } from './api'

export function useStoreData() {
  const products = ref<Product[]>([])
  const sales = ref<Sale[]>([])
  const expenses = ref<FixedExpense[]>([])
  const loading = ref(true)
  const loadError = ref('')

  const monthlyFixedExpenses = computed(() =>
    expenses.value.reduce((total, expense) => total + expense.amount, 0),
  )

  async function loadStoreData() {
    loading.value = true
    loadError.value = ''
    try {
      const [loadedProducts, loadedSales, loadedExpenses] = await Promise.all([
        getJson<Product[]>('/products'),
        getJson<Sale[]>('/sales'),
        getJson<FixedExpense[]>('/expenses'),
      ])
      products.value = loadedProducts
      sales.value = loadedSales
      expenses.value = loadedExpenses
    } catch (error) {
      loadError.value = getErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  async function addSale(input: Omit<Sale, 'id' | 'productName' | 'unitPrice' | 'unitCost'>) {
    sales.value.unshift(await postJson<Sale>('/sales', input))
  }

  async function removeSale(id: string) {
    await deleteById('/sales', id)
    sales.value = sales.value.filter((sale) => sale.id !== id)
  }

  async function addExpense(input: Omit<FixedExpense, 'id'>) {
    expenses.value.push(await postJson<FixedExpense>('/expenses', input))
  }

  async function removeExpense(id: string) {
    await deleteById('/expenses', id)
    expenses.value = expenses.value.filter((expense) => expense.id !== id)
  }

  async function addProduct(input: Omit<Product, 'id'>) {
    products.value.push(await postJson<Product>('/products', input))
  }

  async function removeProduct(id: string) {
    await deleteById('/products', id)
    products.value = products.value.filter((product) => product.id !== id)
  }

  return {
    products,
    sales,
    expenses,
    monthlyFixedExpenses,
    loading,
    loadError,
    loadStoreData,
    addSale,
    removeSale,
    addExpense,
    removeExpense,
    addProduct,
    removeProduct,
  }
}
