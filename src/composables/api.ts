const API_URL = '/api'
const LOGIN_PATH = '/auth/login'
const FALLBACK_ERROR = 'Não foi possível concluir a operação. Tente novamente.'
const SERVER_UNAVAILABLE_ERROR = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.'
// Respostas do proxy do Vite ou de um proxy de produção quando a API está fora do ar.
const GATEWAY_ERROR_STATUSES = [502, 503, 504]

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : FALLBACK_ERROR
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const { message } = (await response.json()) as { message?: string | Record<string, string[]> }
    if (typeof message === 'string') return message
    return (message && Object.values(message)[0]?.[0]) || FALLBACK_ERROR
  } catch {
    return FALLBACK_ERROR
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new Error(SERVER_UNAVAILABLE_ERROR)
  }
  if (GATEWAY_ERROR_STATUSES.includes(response.status)) throw new Error(SERVER_UNAVAILABLE_ERROR)
  if (response.status === 401 && path !== LOGIN_PATH) onUnauthorized?.()
  if (!response.ok) throw new Error(await readErrorMessage(response))
  return response
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await request(path)
  return (await response.json()) as T
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  return (await response.json()) as T
}

export async function postWithoutResponse(path: string): Promise<void> {
  await request(path, { method: 'POST' })
}

export async function deleteById(path: string, id: string): Promise<void> {
  await request(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
