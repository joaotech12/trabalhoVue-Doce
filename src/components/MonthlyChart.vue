<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  values: number[]
  labels: string[]
}>()

const colors = ['#f5c2a8', '#edaa8c', '#ec9b7c', '#e98668', '#dd755f']
const maxValue = computed(() => Math.max(1, ...props.values))
</script>

<template>
  <div class="chart">
    <div class="chart-y-labels" aria-hidden="true"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
    <div class="chart-plot">
      <div class="chart-grid" aria-hidden="true"><i v-for="line in 5" :key="line"></i></div>
      <div class="chart-bars">
        <div v-for="(value, index) in values" :key="labels[index]" class="chart-column">
          <div class="bar-area">
            <span class="bar-value" v-if="value > 0">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value) }}</span>
            <div
              class="chart-bar"
              :style="{ height: `${Math.max((value / maxValue) * 100, value > 0 ? 5 : 1)}%`, background: colors[index] }"
              :title="`R$ ${value.toFixed(2)}`"
            ></div>
          </div>
          <span class="chart-label">{{ labels[index] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
