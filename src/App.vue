<script setup lang="ts">
import { onMounted } from 'vue'
import LoginView from './components/LoginView.vue'
import StoreDashboard from './components/StoreDashboard.vue'
import { useAuth } from './composables/useAuth'

const { isAuthenticated, checkingSession, loggingIn, loginError, checkSession, login, logout } = useAuth()

onMounted(checkSession)
</script>

<template>
  <main v-if="checkingSession" class="login-page" role="status">Verificando o acesso…</main>
  <LoginView v-else-if="!isAuthenticated" :loading="loggingIn" :error="loginError" @login="login" />
  <StoreDashboard v-else @logout="logout" />
</template>
