<script setup lang="ts">
import { ref } from 'vue'
import type { LoginCredentials } from '../types/auth'

defineProps<{
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  login: [credentials: LoginCredentials]
}>()

const email = ref('')
const password = ref('')

function submit() {
  emit('login', { email: email.value, password: password.value })
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <a class="brand login-brand" href="#" aria-label="Doce Controle">
        <span class="brand-mark" aria-hidden="true">d.</span>
        <span class="brand-name">doce<span>controle</span></span>
      </a>
      <span class="login-eyebrow">ACESSO PRIVADO</span>
      <h1>Bem-vinda de volta!</h1>
      <p class="login-description">Entre para acompanhar as vendas e os resultados da sua confeitaria.</p>

      <form class="login-form" @submit.prevent="submit">
        <label for="login-email">E-mail</label>
        <input id="login-email" v-model="email" type="email" autocomplete="username" placeholder="seu@email.com" required />
        <label for="login-password">Senha</label>
        <input id="login-password" v-model="password" type="password" autocomplete="current-password" placeholder="Sua senha" required />
        <p v-if="error" class="form-error login-error" role="alert">{{ error }}</p>
        <button class="button-primary login-submit" type="submit" :disabled="loading">
          {{ loading ? 'Verificando…' : 'Entrar na minha loja' }}
        </button>
      </form>

      <p class="login-private"><span aria-hidden="true">♧</span> Acesso exclusivo da proprietária</p>
    </section>
    <p v-if="error && !loading" class="login-help">Se não conseguir entrar, confira se a API está rodando e as credenciais configuradas no servidor.</p>
  </main>
</template>
