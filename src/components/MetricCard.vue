<script setup lang="ts">
defineProps<{
  label: string
  value: string
  caption: string
  icon: string
  tone: 'peach' | 'lavender' | 'mint' | 'yellow'
}>()
</script>

<template>
  <article class="metric-card">
    <div class="metric-top">
      <span class="metric-label">{{ label }}</span>
      <span class="metric-icon" :class="`tone-${tone}`" aria-hidden="true">{{ icon }}</span>
    </div>
    <strong class="metric-value">{{ value }}</strong>
    <span class="metric-caption">{{ caption }}</span>
  </article>
</template>
