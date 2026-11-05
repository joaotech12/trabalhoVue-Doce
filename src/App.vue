<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import MetricCard from './components/MetricCard.vue'
import MonthlyChart from './components/MonthlyChart.vue'
import { useStoreData } from './composables/useStoreData'
import type { Section } from './types/store'

const {
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
} = useStoreData()

const activeSection = ref<Section>('dashboard')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const modalType = ref<'' | 'sale' | 'expense' | 'product'>('')
const formError = ref('')
const saleForm = reactive({ productId: 'cupcake', quantity: 1, date: new Date().toISOString().slice(0, 10) })
const expenseForm = reactive({ name: '', amount: '' })
const productForm = reactive({ name: '', price: '', cost: '' })

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const selectedDate = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  return new Date(year, month - 1, 1)
})
const monthLabel = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(selectedDate.value),
)
const monthSales = computed(() =>
  sales.value.filter((sale) => sale.date.startsWith(selectedMonth.value)),
)
const revenue = computed(() =>
  monthSales.value.reduce((sum, sale) => sum + sale.unitPrice * sale.quantity, 0),
)
const variableCosts = computed(() =>
  monthSales.value.reduce((sum, sale) => sum + sale.unitCost * sale.quantity, 0),
)
const netProfit = computed(() => revenue.value - variableCosts.value - monthlyFixedExpenses.value)
const unitsSold = computed(() =>
  monthSales.value.reduce((sum, sale) => sum + sale.quantity, 0),
)
const latestSales = computed(() =>
  [...monthSales.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
)
const weeklySales = computed(() =>
  Array.from({ length: 5 }, (_, weekIndex) =>
    monthSales.value
      .filter((sale) => Math.min(Math.ceil(Number(sale.date.slice(8, 10)) / 7), 5) === weekIndex + 1)
      .reduce((sum, sale) => sum + sale.unitPrice * sale.quantity, 0),
  ),
)
const weeklyLabels = computed(() => ['1ª sem.', '2ª sem.', '3ª sem.', '4ª sem.', '5ª sem.'])
const selectedProduct = computed(() => products.value.find((product) => product.id === saleForm.productId))
const saleTotal = computed(() => (selectedProduct.value?.price ?? 0) * Number(saleForm.quantity || 0))
const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { title: 'Bom dia, Maria! ☀️', subtitle: 'Aqui está o resumo da sua confeitaria.' },
  sales: { title: 'Suas vendas', subtitle: 'Acompanhe cada venda e o que entra no caixa.' },
  expenses: { title: 'Despesas do mês', subtitle: 'Cuide dos custos fixos e mantenha tudo em ordem.' },
  products: { title: 'Seus produtos', subtitle: 'Gerencie o cardápio e os custos de cada delícia.' },
}

const pageTitle = computed(() => sectionTitles[activeSection.value])

function formatCurrency(value: number): string {
  return currency.format(value)
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

function changeMonth(offset: number) {
  const nextDate = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + offset, 1)
  selectedMonth.value = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
}

function openModal(type: 'sale' | 'expense' | 'product') {
  formError.value = ''
  modalType.value = type
  if (type === 'sale') {
    saleForm.productId = products.value[0]?.id ?? ''
    saleForm.quantity = 1
    saleForm.date = new Date().toISOString().slice(0, 10)
  }
  if (type === 'expense') {
    expenseForm.name = ''
    expenseForm.amount = ''
  }
  if (type === 'product') {
    productForm.name = ''
    productForm.price = ''
    productForm.cost = ''
  }
}

function submitSale() {
  const quantity = Number(saleForm.quantity)
  if (!saleForm.productId || !Number.isInteger(quantity) || quantity <= 0 || !saleForm.date) {
    formError.value = 'Informe o produto, a quantidade inteira e a data da venda.'
    return
  }
  addSale({ productId: saleForm.productId, quantity, date: saleForm.date })
  selectedMonth.value = saleForm.date.slice(0, 7)
  modalType.value = ''
}

function submitExpense() {
  const amount = Number(expenseForm.amount)
  if (!expenseForm.name.trim() || !Number.isFinite(amount) || amount <= 0) {
    formError.value = 'Informe um nome e um valor maior que zero.'
    return
  }
  addExpense({ name: expenseForm.name.trim(), amount })
  modalType.value = ''
}

function submitProduct() {
  const price = Number(productForm.price)
  const cost = Number(productForm.cost)
  if (
    !productForm.name.trim() ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    formError.value = 'Informe um nome, um preço maior que zero e um custo igual ou maior que zero.'
    return
  }
  addProduct({ name: productForm.name.trim(), price, cost })
  modalType.value = ''
}

function deleteSale(id: string) {
  if (window.confirm('Deseja excluir esta venda?')) removeSale(id)
}

function deleteExpense(id: string) {
  if (window.confirm('Deseja excluir esta despesa fixa?')) removeExpense(id)
}

function deleteProduct(id: string) {
  const hasSales = sales.value.some((sale) => sale.productId === id)
  if (hasSales) {
    window.alert('Este produto possui vendas no histórico e não pode ser removido.')
    return
  }
  if (window.confirm('Deseja remover este produto do cardápio?')) removeProduct(id)
}

function setSection(section: Section) {
  activeSection.value = section
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar :active-section="activeSection" @navigate="setSection" />
    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumb"><span>Minha loja</span><span class="breadcrumb-separator">/</span><strong>{{ pageTitle.title.replace(' ☀️', '') }}</strong></div>
        <div class="topbar-actions">
          <div class="month-picker" aria-label="Selecionar mês">
            <button type="button" aria-label="Mês anterior" @click="changeMonth(-1)">‹</button>
            <span>{{ monthLabel }}</span>
            <button type="button" aria-label="Próximo mês" @click="changeMonth(1)">›</button>
          </div>
          <button class="topbar-add" type="button" @click="openModal('sale')"><span>＋</span> Nova venda</button>
        </div>
      </header>

      <div class="page-content">
        <section class="page-heading">
          <div>
            <span class="eyebrow">QUARTA-FEIRA, SUA LOJA ESTÁ A TODO VAPOR</span>
            <h1>{{ pageTitle.title }}</h1>
            <p>{{ pageTitle.subtitle }}</p>
          </div>
          <button v-if="activeSection === 'sales'" class="button-primary" type="button" @click="openModal('sale')">＋ Registrar venda</button>
          <button v-else-if="activeSection === 'expenses'" class="button-primary" type="button" @click="openModal('expense')">＋ Nova despesa</button>
          <button v-else-if="activeSection === 'products'" class="button-primary" type="button" @click="openModal('product')">＋ Novo produto</button>
        </section>

        <template v-if="activeSection === 'dashboard'">
          <section class="metrics-grid" aria-label="Resumo financeiro do mês">
            <MetricCard label="Vendas do mês" :value="formatCurrency(revenue)" :caption="`${unitsSold} ${unitsSold === 1 ? 'produto vendido' : 'produtos vendidos'}`" icon="↗" tone="peach" />
            <MetricCard label="Despesas fixas" :value="formatCurrency(monthlyFixedExpenses)" caption="Contas recorrentes do mês" icon="▤" tone="lavender" />
            <MetricCard label="Custo dos produtos" :value="formatCurrency(variableCosts)" caption="Custo dos itens vendidos" icon="◒" tone="yellow" />
            <MetricCard label="Lucro líquido" :value="formatCurrency(netProfit)" caption="Vendas menos todos os custos" icon="✦" tone="mint" />
          </section>

          <section class="dashboard-grid">
            <article class="panel sales-panel">
              <div class="panel-heading">
                <div><h2>Vendas por semana</h2><p>Receita ao longo de {{ monthLabel }}</p></div>
                <button class="text-button" type="button" @click="setSection('sales')">Ver vendas <span>→</span></button>
              </div>
              <div class="chart-summary"><strong>{{ formatCurrency(revenue) }}</strong><span>receita total</span></div>
              <MonthlyChart :values="weeklySales" :labels="weeklyLabels" />
            </article>

            <article class="panel expense-panel">
              <div class="panel-heading">
                <div><h2>Despesas fixas</h2><p>Seus custos recorrentes</p></div>
                <button class="icon-action" type="button" aria-label="Ver despesas" @click="setSection('expenses')">···</button>
              </div>
              <div v-if="expenses.length" class="expense-preview-list">
                <div v-for="expense in expenses" :key="expense.id" class="expense-preview">
                  <span class="expense-icon" :class="`expense-${expense.id}`">{{ expense.name.toLowerCase().includes('internet') ? '⌁' : expense.name.toLowerCase().includes('água') || expense.name.toLowerCase().includes('agua') ? '≈' : 'ϟ' }}</span>
                  <span class="expense-preview-name">{{ expense.name }}<small>Todo mês</small></span>
                  <strong>{{ formatCurrency(expense.amount) }}</strong>
                </div>
              </div>
              <div v-else class="empty-mini">Nenhuma despesa fixa cadastrada.</div>
              <div class="expense-total"><span>Total fixo mensal</span><strong>{{ formatCurrency(monthlyFixedExpenses) }}</strong></div>
              <button class="outline-button" type="button" @click="setSection('expenses')">Gerenciar despesas <span>→</span></button>
            </article>
          </section>

          <section class="panel recent-panel">
            <div class="panel-heading">
              <div><h2>Vendas recentes</h2><p>As últimas movimentações deste mês</p></div>
              <button class="text-button" type="button" @click="setSection('sales')">Ver todas <span>→</span></button>
            </div>
            <div v-if="latestSales.length" class="table-wrap">
              <table>
                <thead><tr><th>PRODUTO</th><th>DATA</th><th>QUANTIDADE</th><th>VALOR</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="sale in latestSales" :key="sale.id">
                    <td><span class="product-thumb">🧁</span><strong>{{ sale.productName }}</strong></td>
                    <td>{{ formatDate(sale.date) }}</td><td>{{ sale.quantity }} un.</td>
                    <td class="table-amount">{{ formatCurrency(sale.unitPrice * sale.quantity) }}</td>
                    <td><button class="row-delete" type="button" :aria-label="`Excluir venda de ${sale.productName}`" @click="deleteSale(sale.id)">×</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state compact-empty">
              <span class="empty-illustration">🧁</span><strong>Suas vendas aparecerão aqui</strong>
              <p>Registre uma venda para acompanhar o movimento da loja.</p>
              <button class="text-button" type="button" @click="openModal('sale')">Registrar primeira venda →</button>
            </div>
          </section>
          <p class="fine-print">O lucro líquido considera o custo dos produtos vendidos e as despesas fixas cadastradas.</p>
        </template>

        <template v-else-if="activeSection === 'sales'">
          <section class="metrics-grid sales-metrics">
            <MetricCard label="Vendas do mês" :value="formatCurrency(revenue)" :caption="`${monthSales.length} registros`" icon="↗" tone="peach" />
            <MetricCard label="Unidades vendidas" :value="String(unitsSold)" caption="No período selecionado" icon="◒" tone="lavender" />
            <MetricCard label="Custo dos produtos" :value="formatCurrency(variableCosts)" caption="Custo variável total" icon="▤" tone="yellow" />
            <MetricCard label="Lucro após despesas" :value="formatCurrency(netProfit)" caption="Já descontados os custos fixos" icon="✦" tone="mint" />
          </section>
          <section class="panel list-panel">
            <div class="panel-heading">
              <div><h2>Histórico de vendas</h2><p>{{ monthSales.length }} {{ monthSales.length === 1 ? 'venda registrada' : 'vendas registradas' }} em {{ monthLabel }}</p></div>
              <button class="button-primary small-button" type="button" @click="openModal('sale')">＋ Registrar venda</button>
            </div>
            <div v-if="monthSales.length" class="table-wrap">
              <table><thead><tr><th>PRODUTO</th><th>DATA</th><th>QUANTIDADE</th><th>PREÇO UNITÁRIO</th><th>TOTAL</th><th></th></tr></thead>
                <tbody><tr v-for="sale in [...monthSales].sort((a, b) => b.date.localeCompare(a.date))" :key="sale.id">
                  <td><span class="product-thumb">🧁</span><strong>{{ sale.productName }}</strong></td><td>{{ formatDate(sale.date) }}</td><td>{{ sale.quantity }} un.</td>
                  <td>{{ formatCurrency(sale.unitPrice) }}</td><td class="table-amount">{{ formatCurrency(sale.unitPrice * sale.quantity) }}</td>
                  <td><button class="row-delete" type="button" :aria-label="`Excluir venda de ${sale.productName}`" @click="deleteSale(sale.id)">×</button></td>
                </tr></tbody>
              </table>
            </div>
            <div v-else class="empty-state"><span class="empty-illustration">🧁</span><strong>Nenhuma venda neste mês</strong><p>Quando registrar uma venda, ela aparecerá nesta lista.</p><button class="button-primary" type="button" @click="openModal('sale')">Registrar primeira venda</button></div>
          </section>
        </template>

        <template v-else-if="activeSection === 'expenses'">
          <section class="expense-highlight">
            <span class="highlight-icon">▤</span><div><span>Total de despesas fixas por mês</span><strong>{{ formatCurrency(monthlyFixedExpenses) }}</strong><small>Esse valor é descontado do lucro em cada mês selecionado.</small></div>
          </section>
          <section class="panel list-panel">
            <div class="panel-heading"><div><h2>Contas recorrentes</h2><p>Despesas que fazem parte do custo mensal da loja</p></div><button class="button-primary small-button" type="button" @click="openModal('expense')">＋ Adicionar despesa</button></div>
            <div v-if="expenses.length" class="expense-table">
              <div v-for="expense in expenses" :key="expense.id" class="expense-row">
                <span class="expense-icon" :class="`expense-${expense.id}`">{{ expense.name.toLowerCase().includes('internet') ? '⌁' : expense.name.toLowerCase().includes('água') || expense.name.toLowerCase().includes('agua') ? '≈' : 'ϟ' }}</span>
                <div class="expense-row-name"><strong>{{ expense.name }}</strong><small>Despesa fixa · Mensal</small></div>
                <strong class="expense-row-amount">{{ formatCurrency(expense.amount) }}<small>/mês</small></strong>
                <button class="row-delete" type="button" :aria-label="`Excluir despesa ${expense.name}`" @click="deleteExpense(expense.id)">×</button>
              </div>
            </div>
            <div v-else class="empty-state"><span class="empty-illustration">🧾</span><strong>Nenhuma despesa cadastrada</strong><p>Adicione suas contas fixas para calcular o lucro real do mês.</p><button class="button-primary" type="button" @click="openModal('expense')">Adicionar primeira despesa</button></div>
          </section>
        </template>

        <template v-else>
          <section class="product-intro"><span class="product-intro-icon">🧁</span><div><strong>Seu cardápio, do seu jeito</strong><p>Cadastre produtos e seus custos para entender o lucro de cada venda.</p></div><span class="product-total">{{ products.length }} {{ products.length === 1 ? 'produto' : 'produtos' }}</span></section>
          <section v-if="products.length" class="products-grid">
            <article v-for="(product, index) in products" :key="product.id" class="product-card">
              <div class="product-card-top"><span class="product-emoji">{{ index % 2 === 0 ? '🧁' : '🍰' }}</span><button class="row-delete" type="button" :aria-label="`Excluir produto ${product.name}`" @click="deleteProduct(product.id)">×</button></div>
              <span class="product-category">DOCE DA CASA</span><h2>{{ product.name }}</h2>
              <div class="product-price"><span>Preço de venda</span><strong>{{ formatCurrency(product.price) }}</strong></div>
              <div class="product-cost"><span>Custo por unidade</span><strong>{{ formatCurrency(product.cost) }}</strong></div>
              <div class="product-margin"><span>Margem bruta por unidade</span><strong>{{ formatCurrency(product.price - product.cost) }}</strong></div>
            </article>
            <button class="add-product-card" type="button" @click="openModal('product')"><span>＋</span><strong>Adicionar produto</strong><small>Cadastre uma nova delícia</small></button>
          </section>
          <div v-else class="empty-state"><span class="empty-illustration">🍰</span><strong>Seu cardápio está vazio</strong><p>Cadastre seu primeiro produto para começar.</p><button class="button-primary" type="button" @click="openModal('product')">Adicionar produto</button></div>
        </template>
      </div>
    </main>
  </div>

  <div v-if="modalType" class="modal-backdrop" @click.self="modalType = ''">
    <section class="modal" role="dialog" aria-modal="true" :aria-labelledby="`modal-title-${modalType}`">
      <button class="modal-close" type="button" aria-label="Fechar" @click="modalType = ''">×</button>
      <template v-if="modalType === 'sale'">
        <span class="modal-icon peach-icon">↗</span><h2 id="modal-title-sale">Registrar venda</h2><p class="modal-subtitle">Anote uma venda da sua loja.</p>
        <form @submit.prevent="submitSale">
          <label for="sale-product">Produto</label><select id="sale-product" v-model="saleForm.productId" required><option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} · {{ formatCurrency(product.price) }}</option></select>
          <div class="form-row"><div><label for="sale-quantity">Quantidade</label><input id="sale-quantity" v-model.number="saleForm.quantity" type="number" min="1" step="1" required /></div><div><label for="sale-date">Data da venda</label><input id="sale-date" v-model="saleForm.date" type="date" required /></div></div>
          <div v-if="selectedProduct" class="sale-total-preview"><span>Total da venda</span><strong>{{ formatCurrency(saleTotal) }}</strong></div>
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p><button class="button-primary modal-submit" type="submit">Salvar venda</button>
        </form>
      </template>
      <template v-else-if="modalType === 'expense'">
        <span class="modal-icon lavender-icon">▤</span><h2 id="modal-title-expense">Nova despesa fixa</h2><p class="modal-subtitle">Ela será considerada em todos os meses.</p>
        <form @submit.prevent="submitExpense"><label for="expense-name">Nome da despesa</label><input id="expense-name" v-model="expenseForm.name" type="text" placeholder="Ex.: Aluguel" required />
          <label for="expense-amount">Valor mensal</label><div class="currency-input"><span>R$</span><input id="expense-amount" v-model="expenseForm.amount" type="number" min="0.01" step="0.01" placeholder="0,00" required /></div>
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p><button class="button-primary modal-submit" type="submit">Adicionar despesa</button>
        </form>
      </template>
      <template v-else>
        <span class="modal-icon peach-icon">◇</span><h2 id="modal-title-product">Novo produto</h2><p class="modal-subtitle">Cadastre o preço e o custo por unidade.</p>
        <form @submit.prevent="submitProduct"><label for="product-name">Nome do produto</label><input id="product-name" v-model="productForm.name" type="text" placeholder="Ex.: Brownie" required />
          <div class="form-row"><div><label for="product-price">Preço de venda</label><div class="currency-input"><span>R$</span><input id="product-price" v-model="productForm.price" type="number" min="0.01" step="0.01" placeholder="0,00" required /></div></div><div><label for="product-cost">Custo unitário</label><div class="currency-input"><span>R$</span><input id="product-cost" v-model="productForm.cost" type="number" min="0" step="0.01" placeholder="0,00" required /></div></div></div>
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p><button class="button-primary modal-submit" type="submit">Salvar produto</button>
        </form>
      </template>
    </section>
  </div>
</template>
