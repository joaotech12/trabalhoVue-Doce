import { ref } from 'vue'
import type { AuthStatus, LoginCredentials } from '../types/auth'
import { getErrorMessage, getJson, postJson, postWithoutResponse, setUnauthorizedHandler } from './api'

export function useAuth() {
  const isAuthenticated = ref(false)
  const checkingSession = ref(true)
  const loggingIn = ref(false)
  const loginError = ref('')

  setUnauthorizedHandler(() => {
    if (isAuthenticated.value) loginError.value = 'Sua sessão expirou. Entre novamente.'
    isAuthenticated.value = false
  })

  async function checkSession() {
    checkingSession.value = true
    try {
      const status = await getJson<AuthStatus>('/auth/me')
      isAuthenticated.value = status.authenticated
    } catch (error) {
      loginError.value = getErrorMessage(error)
    } finally {
      checkingSession.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    loggingIn.value = true
    loginError.value = ''
    try {
      await postJson<AuthStatus>('/auth/login', credentials)
      isAuthenticated.value = true
    } catch (error) {
      loginError.value = getErrorMessage(error)
    } finally {
      loggingIn.value = false
    }
  }

  async function logout() {
    try {
      await postWithoutResponse('/auth/logout')
      loginError.value = ''
      isAuthenticated.value = false
    } catch (error) {
      window.alert(getErrorMessage(error))
    }
  }

  return { isAuthenticated, checkingSession, loggingIn, loginError, checkSession, login, logout }
}
