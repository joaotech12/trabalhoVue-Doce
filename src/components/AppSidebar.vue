<script setup lang="ts">
import type { Section } from '../types/store'

defineProps<{
  activeSection: Section
}>()

const emit = defineEmits<{
  navigate: [section: Section]
}>()

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: '⌂' },
  { id: 'sales', label: 'Vendas', icon: '↗' },
  { id: 'expenses', label: 'Despesas', icon: '▤' },
  { id: 'products', label: 'Produtos', icon: '◇' },
]
</script>

<template>
  <aside class="sidebar">
    <a class="brand" href="#" @click.prevent="emit('navigate', 'dashboard')">
      <span class="brand-mark" aria-hidden="true">d.</span>
      <span class="brand-name">doce<span>controle</span></span>
    </a>

    <div class="store-label">MENU PRINCIPAL</div>
    <nav class="navigation" aria-label="Menu principal">
      <button
        v-for="item in navigation"
        :key="item.id"
        type="button"
        class="nav-link"
        :class="{ 'is-active': activeSection === item.id }"
        :aria-current="activeSection === item.id ? 'page' : undefined"
        @click="emit('navigate', item.id)"
      >
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        {{ item.label }}
        <span v-if="item.id === 'sales'" class="nav-count">+</span>
      </button>
    </nav>

    <div class="sidebar-bottom">
      <div class="help-card">
        <span class="help-sparkle" aria-hidden="true">✦</span>
        <strong>Um doce de negócio!</strong>
        <p>Pequenos passos, grandes conquistas.</p>
        <span class="help-decoration decoration-one"></span>
        <span class="help-decoration decoration-two"></span>
      </div>
      <div class="profile">
        <span class="avatar">M</span>
        <span class="profile-copy"><strong>Maria</strong><small>Minha confeitaria</small></span>
        <span class="profile-menu" aria-hidden="true">···</span>
      </div>
    </div>
  </aside>
</template>
