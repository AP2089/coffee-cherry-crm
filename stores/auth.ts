import { defineStore } from 'pinia'
import type { ApiResponse } from '~/types/api'
import type { AuthUser } from '~/types/auth'
import { clearAuthToken, getAuthToken, saveAuthToken, useApiBase } from '~/composables/useApiBase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },

  actions: {
    hydrate() {
      if (!import.meta.client) return

      const token = getAuthToken()
      this.token = token
    },

    async login(username: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ApiResponse<{ token: string; user: AuthUser }>>(
          `${useApiBase()}/auth/login`,
          {
            method: 'POST',
            body: { username, password },
          },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed')
        }

        this.token = response.data.token
        this.user = response.data.user
        saveAuthToken(response.data.token)
      } catch (error) {
        this.token = null
        this.user = null
        clearAuthToken()

        const fetchError = error as {
          data?: { message?: string }
          statusCode?: number
          message?: string
        }

        if (fetchError.statusCode === 401) {
          this.error = 'Неверный логин или пароль'
        } else if (fetchError.data?.message) {
          this.error = fetchError.data.message
        } else if (fetchError.message?.includes('fetch')) {
          this.error = 'Не удалось подключиться к серверу'
        } else {
          this.error = 'Не удалось войти'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.token) return

      try {
        const response = await $fetch<ApiResponse<AuthUser>>(`${useApiBase()}/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        if (!response.success || !response.data) {
          throw new Error('Unauthorized')
        }

        this.user = response.data
      } catch {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      clearAuthToken()
    },
  },
})
